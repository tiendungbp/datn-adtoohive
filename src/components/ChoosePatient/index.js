import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faImage } from '@fortawesome/free-solid-svg-icons';
import { Vertical } from '../../utils/AnimatedPage';
import DataTable from '../DataTable';
import CommonUtils from '../../utils/commonUtils';
import patientAPI from '../../services/patientAPI';

export default function ChoosePatient() {
	//DANH SÁCH BỆNH NHÂN, KEYWORD TÌM KIẾM
	const [patientList, setPatientList] = useState([]);
	const [searchList, setSearchList] = useState(null);
	const [keyword, setKeyword] = useState('');

	//LOADING, PATHNAME
	const [isLoading, setIsLoading] = useState(false);
	const pathname = window.location.pathname;

	//ĐỊNH DẠNG DATATABLE
	const columns = [
		{
			title: 'Mã bệnh nhân',
			dataIndex: 'patient_id',
			align: 'center',
			render: (patient_id) => (
				<Link to={`/benh-nhan/${patient_id}`}>{patient_id.toUpperCase()}</Link>
			),
		},
		{
			title: 'Ảnh đại diện',
			dataIndex: 'avatar',
			align: 'center',
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
			title: 'Trạng thái',
			render: (text, record) =>
				record.is_blocked ? (
					<span className="text-primary">Đã khóa tài khoản</span>
				) : record.is_activated ? (
					<span className="text-success">Đã xác minh</span>
				) : (
					<span className="text-danger">Chưa xác minh</span>
				),
		},
		{
			title: 'Họ và tên',
			dataIndex: 'fullname',
		},
		{
			title: 'Giới tính',
			dataIndex: 'gender',
			align: 'center',
			render: (gender) => (gender ? 'Nam' : 'Nữ'),
		},
		{
			title: 'Số điện thoại',
			dataIndex: 'phone',
			align: 'center',
		},
		{
			title: 'Email',
			dataIndex: 'email',
		},
	];

	//CALL API
	useEffect(() => {
		getAllPatients();
	}, []);

	//XỬ LÝ LẤY TẤT CẢ BỆNH NHÂN
	const getAllPatients = async () => {
		setIsLoading(true);
		const res = await patientAPI.getAll();
		setPatientList(res.data.data);
		setIsLoading(false);
	};

	//XỬ LÝ TÌM THEO TÊN HOẶC SỐ ĐIỆN THOẠI
	const handleSearchByNameOrPhone = () => {
		if (keyword) {
			const isPhoneNumber = CommonUtils.checkPhoneNumber(keyword);
			if (isPhoneNumber) {
				const list = patientList.filter((patient) => patient.phone === keyword);
				setSearchList(list);
				setKeyword('');
			} else {
				const list = patientList.filter((patient) => {
					return patient.fullname.toLowerCase().includes(keyword.toLowerCase());
				});
				setSearchList(list);
				setKeyword('');
			}
		} else {
			setSearchList(null);
		}
	};

	//XỬ LÝ ENTER
	const handleEnter = (e) => {
		if (e.keyCode === 13) handleSearchByNameOrPhone();
	};

	return (
		<Vertical>
			<div className="container-fluid pt-4">
				<div className="row bg-light rounded mx-0 mb-4">
					<div className="col-md">
						<div className="rounded p-4 bg-secondary">
							<div className="row mb-3">
								<div className="col-md">
									<Link
										to={`/${pathname.split('/')[1]}`}
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
										Chọn bệnh nhân
									</h5>
								</div>
							</div>
							<div className="row mb-5 d-flex align-items-center justify-content-center">
								<div className="col-md-4">
									<div className="d-flex align-items-center">
										<Input
											size="large"
											placeholder="Nhập tên/số điện thoại"
											value={keyword}
											onChange={(e) => setKeyword(e.target.value)}
											onKeyUp={handleEnter}
										/>
										<Button onClick={handleSearchByNameOrPhone}>Tìm</Button>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="col-md">
									<div className="table-responsive">
										<DataTable
											columns={columns}
											list={searchList ? searchList : patientList}
											detailsPage={pathname}
											isLoading={isLoading}
											isChoosePatientPage={true}
											pagination
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Vertical>
	);
}
