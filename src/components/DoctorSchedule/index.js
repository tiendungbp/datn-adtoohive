import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Spin, Modal, Form, Radio, Input, DatePicker, Button } from 'antd';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import moment from 'moment';
import Swal from 'sweetalert2';
import CommonUtils from '../../utils/commonUtils';
import patientAPI from '../../services/patientAPI';
import appointmentAPI from '../../services/appointmentAPI';

export default function DoctorSchedule(props) {
	//KHAI BÁO BIẾN
	const [form] = Form.useForm();
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [option, setOption] = useState(1);
	const { getAllByCategoryDateSession } = props; //call back sau khi đặt lịch thì gọi lại api

	//THÔNG TIN BÁC SĨ, BỆNH NHÂN
	const doctor = props.doctor;
	const { patient_id } = useParams();
	const [patient, setPatient] = useState(null);
	const user_id = useSelector((state) => state.user.user.user_id); //id lễ tân đang đăng nhập

	//THÔNG TIN LỊCH LÀM VIỆC
	const scheduleList = props.scheduleList;
	const [selectedSchedule, setSelectedSchedule] = useState(null);

	//KHỞI TẠO THÔNG TIN BỆNH NHÂN CHO FORM
	const initPatientInfo = {
		fullname: patient ? patient.fullname : null,
		dob: patient ? dayjs(patient.dob) : null,
		gender: patient ? patient.gender : 1,
		phone: patient ? patient.phone : null,
	};

	//CALL API
	useEffect(() => {
		if (patient_id && isOpen) getPatientByID();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	//GÁN THÔNG TIN BỆNH NHÂN LÊN FORM
	useEffect(() => {
		if (patient) form.setFieldsValue(initPatientInfo);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [patient]);

	//XỬ LÝ LẤY BỆNH NHÂN THEO ID
	const getPatientByID = async () => {
		setIsLoading(true);
		const res = await patientAPI.getByID(patient_id);
		setPatient(res.data.data);
		setIsLoading(false);
	};

	//XỬ LÝ CHỌN LỊCH LÀM VIỆC
	const handleChooseSchedule = (schedule) => {
		if (patient_id) {
			setSelectedSchedule(schedule);
			setIsOpen(true);
		} else {
			toast.error('Bạn cần đăng nhập để đặt lịch hẹn');
		}
	};

	//XỬ LÝ CHỌN LỊCH HẸN ĐƯỢC ĐẶT CHO AI
	const handleChangeOption = (e) => {
		const option = e.target.value;
		if (option === 1) {
			form.setFieldsValue(initPatientInfo);
		} else {
			form.setFieldsValue({
				fullname: null,
				dob: null,
				gender: 1,
				phone: null,
			});
		}
		setOption(option);
	};

	//XỬ LÝ SUBMIT FORM
	const handleSubmit = async (values) => {
		let resultCheckPhone = CommonUtils.checkPhoneNumber(values.phone);
		if (resultCheckPhone) {
			Swal.fire({
				title: 'Xác nhận đặt lịch hẹn?',
				confirmButtonText: 'Xác nhận',
				showCancelButton: true,
				cancelButtonText: 'Hủy',
				customClass: {
					title: 'fs-5 fw-normal text-dark',
					confirmButton: 'btn-primary shadow-none',
					cancelButton: 'btn-secondary-cancel shadow-none',
				},
			}).then(async (result) => {
				if (result.isConfirmed) {
					const { DoctorSchedule } = selectedSchedule;
					const appointment = {
						creator_id: user_id,
						type_id: 1,
						doctor_schedule_id: DoctorSchedule.doctor_schedule_id,
						patient_id: patient_id,
						fullname: values.fullname,
						dob: values.dob,
						gender: values.gender,
						phone: values.phone,
					};

					setIsLoading(true);
					const res = await appointmentAPI.booking(appointment);
					setIsLoading(false);

					const { errCode, type } = res.data;
					if (errCode === 0) {
						toast.success('Gửi yêu cầu thành công');
						handleResetState();
					} else if (errCode === 2 && type === 'status') {
						toast.error('Lịch làm việc chưa được duyệt');
						handleResetState();
					} else if (errCode === 2 && type === 'date') {
						toast.error('Không thể đặt lịch cho quá khứ');
						handleResetState();
					} else if (errCode === 2 && type === 'time') {
						toast.error('Đã qua thời gian của ca khám');
						handleResetState();
					} else if (errCode === 9) {
						toast.error('Lịch làm việc này không còn khả dụng');
						handleResetState();
					} else if (errCode === 10) {
						toast.error('Đã đạt giới hạn đặt 3 lịch hẹn/ngày');
						handleResetState();
					} else {
						//errCode === 1 || errCode === 5
						toast.error('Gửi yêu cầu thất bại');
						handleResetState();
					}
				}
			});
		} else {
			toast.error('Số điện thoại không hợp lệ');
		}
	};

	//XỬ LÝ RESET STATE
	const handleResetState = () => {
		form.resetFields();
		form.setFieldsValue({ option: 1 });
		setSelectedSchedule(null);
		setOption(1);
		setIsOpen(false);
		getAllByCategoryDateSession();
	};

	return (
		<div className="col-md-6">
			<div className="row mb-3">
				<div className="col-md">
					<h5 className="mb-3">
						{' '}
						Lịch làm việc {''}
						<span className="text-primary">
							{moment(props.date).format('DD-MM-YYYY')}
						</span>
					</h5>
					<hr />
				</div>
			</div>
			<div className="row">
				<div className="col-md">
					<Spin tip="Đang tải..." spinning={isLoading}>
						<div className="d-flex flex-wrap" style={{ marginTop: '-2rem' }}>
							{scheduleList.map((schedule, index) => {
								return (
									<div
										key={index}
										className="schedule-item bg-gray py-2 px-3 me-2 mt-3"
										onClick={() => handleChooseSchedule(schedule)}
									>
										{schedule.Session.time}
									</div>
								);
							})}
						</div>
					</Spin>
					<Modal
						open={isOpen}
						onCancel={() => {
							setIsOpen(false);
							setOption(1);
							form.setFieldsValue({ option: 1 });
						}}
						okButtonProps={{ hidden: true }}
						cancelButtonProps={{ hidden: true }}
					>
						<Spin tip="Đang tải..." spinning={isLoading}>
							<div className="text-center">
								<h5 className="text-primary">THÔNG TIN LỊCH HẸN</h5>
								<hr />
							</div>
							<div>
								<p>
									<b>Bác sĩ phụ trách:</b> {doctor ? doctor.fullname : ''}
								</p>
								<p>
									<b>Ngày hẹn:</b>{' '}
									{selectedSchedule
										? moment(selectedSchedule.date).format('DD-MM-YYYY')
										: ''}
								</p>
								<p>
									<b>Ca khám:</b>{' '}
									{selectedSchedule ? selectedSchedule.Session.time : ''}
								</p>
								<hr />
							</div>
							<Form
								form={form}
								layout="vertical"
								initialValues={{ option: option }}
								onFinish={handleSubmit}
							>
								<div className="row">
									<div className="col-md mt-2">
										<Form.Item label="Lịch hẹn được đặt cho" name="option">
											<Radio.Group onChange={handleChangeOption}>
												<Radio value={1}>Bản thân</Radio>
												<Radio value={0}>Người khác</Radio>
											</Radio.Group>
										</Form.Item>
									</div>
								</div>
								<div className="row">
									<div className="col-md mt-2">
										<Form.Item
											label="Họ và tên"
											name="fullname"
											rules={[
												{
													required: true,
													message: 'Họ và tên không được rỗng',
												},
											]}
										>
											<Input
												size="large"
												placeholder="Họ và tên người cần khám"
												readOnly={option ? true : false}
											/>
										</Form.Item>
									</div>
								</div>
								<div className="row">
									<div className="col-md-6 mt-2">
										<Form.Item
											label="Ngày sinh"
											name="dob"
											rules={[
												{
													required: true,
													message: 'Ngày sinh không được rỗng',
												},
											]}
										>
											<DatePicker
												size="large"
												placeholder="Ngày sinh"
												format="DD-MM-YYYY"
												disabled={option ? true : false}
											/>
										</Form.Item>
									</div>
									<div className="col-md-6 mt-2">
										<Form.Item label="Giới tính" name="gender">
											<Radio.Group disabled={option ? true : false}>
												<Radio value={1}>Nam</Radio>
												<Radio value={0}>Nữ</Radio>
											</Radio.Group>
										</Form.Item>
									</div>
								</div>
								<div className="row">
									<div className="col-md mt-2">
										<Form.Item
											label="Số điện thoại"
											name="phone"
											rules={[
												{
													required: true,
													message: 'Số điện thoại không được rỗng',
												},
											]}
										>
											<Input
												size="large"
												placeholder="Số điện thoại"
												readOnly={option ? true : false}
											/>
										</Form.Item>
									</div>
								</div>
								<div className="mt-2">
									<Button htmlType="submit" className="btn-primary px-4 me-2">
										Đặt lịch hẹn
									</Button>
									<Button htmlType="reset" className="px-4">
										Reset
									</Button>
								</div>
							</Form>
						</Spin>
					</Modal>
				</div>
			</div>
		</div>
	);
}
