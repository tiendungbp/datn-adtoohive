import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Modal, Select, Spin, Form, Input } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faImage,
	faUserSlash,
	faEdit,
} from '@fortawesome/free-solid-svg-icons';
import { Vertical } from '../../../utils/AnimatedPage';
import toast from 'react-hot-toast';
import DataTable from '../../../components/DataTable';
import patientAPI from '../../../services/patientAPI';
import authAPI from '../../../services/authAPI';
import CommonUtils from '../../../utils/commonUtils';

export default function PatientList() {
	//DANH SÁCH BỆNH NHÂN, KEYWORD TÌM KIẾM
	const [patientList, setPatientList] = useState([]);
	const [searchList, setSearchList] = useState(null);
	const [keyword, setKeyword] = useState('');

	//FORM, LOADING, MODAL
	const [form] = Form.useForm();
	const [pageLoading, setPageLoading] = useState(false);
	const [modalLoading, setModalLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	//BLOCK, ADMIN
	const [blockedUser, setBlockedUser] = useState({});
	const admin = useSelector((state) => state.user.user);
	const user_id = useSelector((state) => state.user.user.user_id);
	const prefix = user_id.slice(0, 2);

	//ĐỊNH DẠNG DATATABLE
	const detailsPage = '/benh-nhan';
	const columns = [
		{
			title: 'Mã bệnh nhân',
			dataIndex: 'patient_id',
			align: 'center',
			render: (patient_id) => patient_id.toUpperCase(),
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
		prefix === 'qt'
			? {
					title: 'Khóa',
					dataIndex: '',
					align: 'center',
					render: (_, record) => (
						<Button
							disabled={record.is_blocked ? true : false}
							className="bg-light"
							onClick={() => handleOpenModal(record)}
						>
							<FontAwesomeIcon icon={faUserSlash} className="text-dark" />
						</Button>
					),
			  }
			: {},
		prefix === 'qt' || prefix === 'lt'
			? {
					title: 'Xem',
					dataIndex: '',
					align: 'center',
					render: (_, record) => (
						<Link to={`${detailsPage}/${record.patient_id}`}>
							<Button className="bg-light">
								<FontAwesomeIcon icon={faEdit} className="text-dark" />
							</Button>
						</Link>
					),
			  }
			: {},
	];

	//CALL API
	useEffect(() => {
		getAllPatients();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	//NẾU KHÓA KHI ĐANG CÓ SEARCH LIST THÌ UPDATE LẠI SEARCH LIST
	useEffect(() => {
		if (searchList) {
			let list = [];
			searchList.forEach((searchItem) => {
				const a = patientList.find((patient) => {
					return patient.patient_id === searchItem.patient_id;
				});
				if (a) list.push(a);
			});
			setSearchList(list);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [patientList]);

	//XỬ LÝ LẤY TẤT CẢ BỆNH NHÂN
	const getAllPatients = async () => {
		let res;
		setPageLoading(true);
		if (prefix === 'bs') {
			res = await patientAPI.getAllByDoctorID(user_id);
		} else {
			res = await patientAPI.getAll();
		}
		setPatientList(res.data.data);
		setPageLoading(false);
	};

	//XỬ LÝ LỌC BỆNH NHÂN THEO TRẠNG THÁI
	const handleFilterByStatus = (code) => {
		if (code === -1) {
			setSearchList(null);
		} else if (code === 2) {
			const list = patientList.filter((patient) => patient.is_blocked === 1);
			setSearchList(list);
		} else {
			const list = patientList.filter(
				(patient) => patient.is_activated === code,
			);
			setSearchList(list);
		}
	};

	//XỬ LÝ TÌM THEO MÃ/TÊN/SỐ ĐIỆN THOẠI
	const handleSearchByInfo = () => {
		if (keyword) {
			const isPhoneNumber = CommonUtils.checkPhoneNumber(keyword);
			let list;
			if (isPhoneNumber) {
				list = patientList.filter((patient) => patient.phone === keyword);
			} else if (
				keyword.length === 10 &&
				keyword.toLowerCase().slice(0, 2) === 'bn'
			) {
				list = patientList.filter((patient) => {
					return patient.patient_id === keyword.toLowerCase();
				});
			} else {
				list = patientList.filter((patient) => {
					return patient.fullname.toLowerCase().includes(keyword.toLowerCase());
				});
			}
			setSearchList(list);
			setKeyword('');
		} else {
			setSearchList(null);
		}
	};

	//XỬ LÝ MỞ MODAL
	const handleOpenModal = async (record) => {
		setBlockedUser(record);
		setIsOpen(true);
	};

	//XỬ LÝ KHÓA TÀI KHOẢN
	const handleBlockAccount = async (values) => {
		setModalLoading(true);
		const res = await authAPI.blockAccount({
			admin_id: admin.user_id,
			password: values.password,
			user_id: blockedUser.patient_id,
		});
		setModalLoading(false);

		const { errCode } = res.data;
		if (errCode === 0) {
			toast.success('Đã khóa tài khoản');
			form.resetFields();
			getAllPatients();
			setIsOpen(false);
		} else if (errCode === 2) {
			toast.error('Mật khẩu không hợp lệ');
		} else {
			toast.error('Yêu cầu thất bại'); //errCode === 1 || errCode === 5
		}
	};

	//XỬ LÝ ENTER
	const handleEnter = (e) => {
		if (e.keyCode === 13) handleSearchByInfo();
	};

	return (
		<Vertical>
			<div className="container-fluid pt-4">
				<div className="row bg-light rounded mx-0 mb-4">
					<div className="col-md">
						<div className="rounded p-4 bg-secondary mb-4">
							<div className="row">
								<div className="col-md">
									<span className="text-dark page-title">
										QUẢN LÝ BỆNH NHÂN
									</span>
									<Link to="/benh-nhan/them-moi">
										<Button className="btn-add btn-primary px-4">
											THÊM MỚI
										</Button>
									</Link>
								</div>
							</div>
						</div>
						<div className="rounded p-4 bg-secondary">
							<Form layout="vertical">
								<div className="row mb-4">
									<div className="col-md-4">
										<Form.Item label="Tìm theo trạng thái">
											<Select
												className="w-100"
												placeholder="Chọn trạng thái"
												size="large"
												options={[
													{
														value: -1,
														label: 'Hiển thị tất cả',
														className: 'text-primary',
													},
													{ value: 0, label: 'Chưa xác minh' },
													{ value: 1, label: 'Đã xác minh' },
													{ value: 2, label: 'Đã khóa tài khoản' },
												]}
												onChange={(value) => handleFilterByStatus(value)}
											/>
										</Form.Item>
									</div>
									<div className="col-md-4">
										<Form.Item label="Tìm theo mã/tên/số điện thoại">
											<div className="d-flex w-100">
												<Input
													size="large"
													placeholder="Nhập thông tin"
													value={keyword}
													onChange={(e) => setKeyword(e.target.value)}
													onKeyUp={handleEnter}
												/>
												<Button onClick={handleSearchByInfo}>Tìm</Button>
											</div>
										</Form.Item>
									</div>
								</div>
							</Form>
							<div className="row">
								<div className="col-md">
									<div className="table-responsive">
										<DataTable
											columns={columns}
											list={searchList ? searchList : patientList}
											handleOpenModal={handleOpenModal}
											detailsPage={detailsPage}
											isLoading={pageLoading}
											isPatientPage={true}
											pagination
										/>
										<Modal
											open={isOpen}
											onCancel={() => setIsOpen(false)}
											okButtonProps={{ hidden: true }}
											cancelButtonProps={{ hidden: true }}
										>
											<Spin tip="Đang tải..." spinning={modalLoading}>
												<div className="text-center">
													<h5 className="text-primary">
														Khóa tài khoản {''}
														<span className="text-danger">
															{blockedUser.fullname}
														</span>
													</h5>
													<hr />
												</div>
												<Form
													form={form}
													layout="vertical"
													onFinish={handleBlockAccount}
												>
													<div className="row">
														<div className="col-md mt-2">
															<Form.Item
																label="Mật khẩu của bạn"
																name="password"
																rules={[
																	{
																		required: true,
																		message: 'Mật khẩu không được rỗng',
																	},
																]}
															>
																<Input.Password
																	size="large"
																	placeholder="Nhập mật khẩu của bạn để tiếp tục"
																	visibilityToggle={false}
																/>
															</Form.Item>
														</div>
													</div>
													<div className="mt-2">
														<Button
															htmlType="submit"
															className="btn-primary px-4 me-2"
														>
															Khóa tài khoản
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
						</div>
					</div>
				</div>
			</div>
		</Vertical>
	);
}
