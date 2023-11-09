import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Vertical } from '../../../../utils/AnimatedPage';
import { Spin, Form, DatePicker, Select, Button, Table } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faImage } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import employeeAPI from '../../../../services/employeeAPI';
import doctorAPI from '../../../../services/doctorAPI';
import sessionAPI from '../../../../services/sessionAPI';
import scheduleAPI from '../../../../services/scheduleAPI';

export default function CreateSchedule() {
	//KHAI BÁO FORM, LOADING
	const [form] = Form.useForm();
	const [isLoading, setIsLoading] = useState(false);

	//DANH SÁCH CALL API
	const [sessionList, setSessionList] = useState([]);
	const [employeeList, setEmployeeList] = useState([]);

	//CHỌN: NGÀY, CA KHÁM, TABLE
	const [selectedDate, setSelectedDate] = useState(null);
	const [selectedSession, setSelectedSession] = useState(null);
	const [selectedEmployee, setSelectedEmployee] = useState([]);
	const [employeeKey, setEmployeeKey] = useState([]);

	//ĐỊNH DẠNG DATATABLE
	const columns = [
		{
			title: 'Mã nhân viên',
			dataIndex: 'user_id',
			align: 'center',
			render: (user_id) => user_id.toUpperCase(),
		},
		{
			title: 'Vai trò',
			render: (obj) =>
				obj.user_id.slice(0, 2) === 'qt'
					? 'Quản trị viên'
					: obj.user_id.slice(0, 2) === 'lt'
					? 'Lễ tân'
					: obj.user_id.slice(0, 2) === 'bs'
					? 'Bác sĩ'
					: 'Phụ tá',
		},
		{
			title: 'Ảnh đại diện',
			dataIndex: 'avatar',
			// align: "center",
			render: (avatar) =>
				avatar ? (
					<img src={avatar} alt="" className="datatable-avatar rounded" />
				) : (
					<div className="datatable-avatar border rounded d-flex align-items-center justify-content-center">
						<FontAwesomeIcon icon={faImage} size="lg" className="text-gray" />
					</div>
				),
		},
		{
			title: 'Họ và tên',
			dataIndex: 'fullname',
		},
	];

	//CALL API
	useEffect(() => {
		getActiveSessions();
	}, []);

	//THAY ĐỔI SELECT NGÀY VÀ CA KHÁM
	useEffect(() => {
		if (selectedDate && selectedSession) getAvailableBySchedule();
	}, [selectedDate, selectedSession]);

	//XỬ LÝ LẤY TẤT CẢ CA KHÁM ĐANG HOẠT ĐỘNG
	const getActiveSessions = async () => {
		setIsLoading(true);
		const res = await sessionAPI.getActive();
		setSessionList(res.data.data);
		setIsLoading(false);
	};

	//XỬ LÝ LẤY TẤT CẢ NHÂN VIÊN CÒN TRỐNG LỊCH CỦA DATE VÀ SESSION_ID
	const getAvailableBySchedule = async () => {
		setIsLoading(true);
		const resDoctor = await doctorAPI.getAvailableBySchedule(
			selectedDate,
			selectedSession,
		);
		const resEmployee = await employeeAPI.getAvailableBySchedule(
			selectedDate,
			selectedSession,
		);
		setEmployeeList([...resDoctor.data.data, ...resEmployee.data.data]);
		setIsLoading(false);
	};

	//XỬ LÝ SUBMIT FORM
	const handleSubmit = (values) => {
		if (selectedEmployee.length) {
			Swal.fire({
				title: 'Xác nhận lưu thông tin?',
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
					const employees = selectedEmployee.map(
						(employee) => employee.user_id,
					);

					const obj = {
						date: values.date,
						employees: employees,
						session_id: values.session_id,
					};
					setIsLoading(true);
					const res = await scheduleAPI.create(obj);
					setIsLoading(false);

					const { errCode } = res.data;
					if (errCode === 0) {
						toast.success('Thêm thành công');
						setEmployeeKey([]);
						setSelectedEmployee([]);
						getAvailableBySchedule(selectedDate, selectedSession);
					} else if (errCode === 2) {
						toast.error('Không thể thêm lịch của quá khứ');
					} else {
						toast.error('Thêm thất bại'); //errCode === 1
					}
				}
			});
		} else {
			toast.error('Bạn chưa chọn nhân viên');
		}
	};

	return (
		<Vertical>
			<Spin tip="Đang tải..." spinning={false}>
				<div className="container-fluid pt-4">
					<div className="row bg-light rounded mx-0 mb-4">
						<div className="col-md">
							<div className="rounded p-4 bg-secondary">
								<div className="row mb-3">
									<div className="col-md">
										<Link
											to="/lich-lam-viec"
											className="text-decoration-none text-primary"
										>
											<small>
												<FontAwesomeIcon icon={faChevronLeft} /> Quay lại
											</small>
										</Link>
									</div>
								</div>
								<div className="row mb-3">
									<div className="col-md">
										<h5 className="text-uppercase text-primary mb-0">
											Thêm lịch làm việc
										</h5>
									</div>
								</div>
								<div className="row">
									<div className="col-md-3">
										<Form form={form} layout="vertical" onFinish={handleSubmit}>
											<div className="row">
												<div className="col-md mt-3">
													<Form.Item
														label="Ngày làm việc"
														name="date"
														rules={[
															{
																required: true,
																message: 'Ngày làm việc không được rỗng',
															},
														]}
													>
														<DatePicker
															size="large"
															placeholder="Ngày làm việc"
															format="DD-MM-YYYY"
															disabledDate={(current) =>
																current && current < dayjs().endOf('day')
															}
															onChange={(value) => {
																setSelectedDate(
																	dayjs(value).format('YYYY-MM-DD'),
																);
															}}
														/>
													</Form.Item>
												</div>
											</div>
											<div className="row">
												<div className="col-md mt-3">
													<Form.Item
														label="Ca khám"
														name="session_id"
														rules={[
															{
																required: true,
																message: 'Ca khám không được rỗng',
															},
														]}
													>
														<Select
															placeholder="Chọn ca khám"
															size="large"
															options={sessionList.map((session) => {
																return {
																	value: session.session_id,
																	label: session.time,
																};
															})}
															onChange={(value) => setSelectedSession(value)}
														/>
													</Form.Item>
												</div>
											</div>
											<div className="mt-3 d-flex">
												<Button
													htmlType="submit"
													className="btn-primary px-4 w-100"
												>
													Lưu thông tin
												</Button>
											</div>
										</Form>
									</div>
									<div className="col-md-9">
										<div className="table-responsive">
											<Table
												columns={columns}
												dataSource={employeeList}
												rowKey={columns[0].dataIndex}
												loading={isLoading}
												pagination={{
													pageSize: 100,
													position: ['bottomCenter'],
												}}
												rowSelection={{
													type: 'checkbox',
													selectedRowKeys: employeeKey,
													onChange: (selectedRowKeys, selectedRows) => {
														setEmployeeKey(selectedRowKeys);
														setSelectedEmployee(selectedRows);
													},
												}}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Spin>
		</Vertical>
	);
}
