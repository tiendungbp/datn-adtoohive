import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Form, Spin } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Vertical } from '../../../utils/AnimatedPage';
import moment from 'moment';
import DataTable from '../../../components/DataTable';
import CommonUtils from '../../../utils/commonUtils';
import patientAPI from '../../../services/patientAPI';

export default function MedicalRecord() {
	//KHAI BÁO BIẾN
	const navigate = useNavigate();
	const { patient_id } = useParams();
	const [patient, setPatient] = useState(null);
	const [recordList, setRecordList] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	//ĐỊNH DẠNG DATATABLE
	const columns = [
		{
			title: 'Ngày',
			align: 'center',
			key: (obj) => obj.Services.Detail.detail_id,
			render: (obj) => (
				<b className="text-primary">
					{moment(obj.DoctorSchedule.Schedule.date).format('DD-MM-YYYY')}
				</b>
			),
			showSorterTooltip: false,
			sortDirections: ['descend'],
			sorter: (a, b) =>
				a.DoctorSchedule.Schedule.date > b.DoctorSchedule.Schedule.date,
		},
		{
			title: 'Ca khám',
			align: 'center',
			render: (obj) => obj.DoctorSchedule.Schedule.Session.time,
		},
		{
			title: 'Bác sĩ phụ trách',
			render: (obj) => obj.DoctorSchedule.Doctor.fullname,
			showSorterTooltip: false,
			sorter: (a, b) =>
				a.DoctorSchedule.Doctor.fullname.localeCompare(
					b.DoctorSchedule.Doctor.fullname,
				),
		},
		{
			title: 'Người được khám',
			render: (obj) => obj.fullname,
		},
		{
			title: 'Dịch vụ điều trị',
			render: (obj) =>
				CommonUtils.capitalizeEachWord(obj.Services.service_name),
		},
		{
			title: 'Số lượng',
			align: 'center',
			render: (obj) => obj.Services.Detail.quantity,
		},
		{
			title: 'Mô tả',
			render: (obj) =>
				CommonUtils.capitalizeFirstLetter(obj.Services.Detail.description),
		},
	];

	//CALL API
	useEffect(() => {
		getPatientByID();
		getMedicalRecord();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	//XỬ LÝ LẤY BỆNH NHÂN THEO ID
	const getPatientByID = async () => {
		setIsLoading(true);
		const res = await patientAPI.getByID(patient_id);
		if (res.data.errCode === 0) {
			setPatient(res.data.data);
		} else {
			navigate('/benh-nhan');
		}
		setIsLoading(false);
	};

	//XỬ LÝ LẤY HỒ SƠ BỆNH ÁN
	const getMedicalRecord = async () => {
		setIsLoading(true);
		const res = await patientAPI.getMedicalRecord(patient_id);
		setRecordList(res.data.data);
		setIsLoading(false);
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
											to="/benh-nhan"
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
										<h4 className="text-uppercase text-primary mb-0 text-center">
											HỒ SƠ BỆNH ÁN
										</h4>
									</div>
								</div>
								<hr />
								<div className="row">
									<div className="col-md mt-4">
										<h5 className="text-dark mb-4">1. Thông tin cơ bản</h5>
										<Form layout="vertical">
											<div className="row">
												<div className="col-md">
													<Form.Item label="Mã bệnh nhân">
														<p className="mb-0">
															{patient ? patient.patient_id.toUpperCase() : ''}
														</p>
													</Form.Item>
												</div>
												<div className="col-md">
													<Form.Item label="Họ và tên">
														<p className="mb-0">
															{patient ? patient.fullname : ''}
														</p>
													</Form.Item>
												</div>
												<div className="col-md">
													<Form.Item label="Ngày sinh">
														<p className="mb-0">
															{patient
																? moment(patient.dob).format('DD-MM-YYYY')
																: ''}
														</p>
													</Form.Item>
												</div>
												<div className="col-md">
													<Form.Item label="Giới tính">
														<p className="mb-0">
															{patient ? (patient.gender ? 'Nam' : 'Nữ') : ''}
														</p>
													</Form.Item>
												</div>
												<div className="col-md">
													<Form.Item label="Số điện thoại">
														<p className="mb-0">
															{patient ? patient.phone : ''}
														</p>
													</Form.Item>
												</div>
												<div className="col-md">
													<Form.Item label="Địa chỉ email">
														<p className="mb-0">
															{patient ? patient.email : ''}
														</p>
													</Form.Item>
												</div>
											</div>
										</Form>
									</div>
								</div>
								<div className="row">
									<div className="col-md mt-4">
										<h5 className="text-dark mb-4">2. Lịch sử điều trị</h5>
										<div className="table-responsive">
											<DataTable
												columns={columns}
												list={recordList}
												isLoading={isLoading}
												isMedicalRecordPage={true}
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
