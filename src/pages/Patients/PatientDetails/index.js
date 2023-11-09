import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import {
	Form,
	Input,
	DatePicker,
	Radio,
	Select,
	Button,
	Popconfirm,
	Spin,
	Alert,
	Modal,
} from 'antd';
import { Vertical } from '../../../utils/AnimatedPage';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import CommonUtils from '../../../utils/commonUtils';
import locationAPI from '../../../services/locationAPI';
import patientAPI from '../../../services/patientAPI';
import authAPI from '../../../services/authAPI';
import imageAPI from '../../../services/imageAPI';

export default function PatientDetails({ accessToken }) {
	//KHAI BÁO BIẾN
	const navigate = useNavigate();
	const [form] = Form.useForm();
	const [confirmSaveForm] = Form.useForm();
	const [unblockForm] = Form.useForm();
	const [values, setValues] = useState(null);

	//API ĐỊA CHỈ VÀ ĐỊA CHỈ CHỌN TỪ SELECT
	const [cityList, setCityList] = useState([]);
	const [districtList, setDistrictList] = useState([]);
	const [wardList, setWardList] = useState([]);
	const [city, setCity] = useState(null);
	const [district, setDistrict] = useState(null);
	const [ward, setWard] = useState(null);
	const [street, setStreet] = useState(null);

	//THÔNG TIN ẢNH
	const [localPath, setLocalPath] = useState(null);
	const [file, setFile] = useState(null);

	//LOADING, HIDDEN, MỞ MODAL
	const [isLoading, setIsLoading] = useState(false);
	const [isAlertHidden, setIsAlertHidden] = useState(true);
	const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
	const [isUnblockOpen, setIsUnblockOpen] = useState(false);

	//LẤY THÔNG TIN BỆNH NHÂN CẦN SỬA, THÔNG TIN ADMIN
	const [patient, setPatient] = useState(null);
	const { patient_id } = useParams();
	const admin = useSelector((state) => state.user.user);

	//KHỞI TẠO GIÁ TRỊ CHO CHỨC NĂNG SỬA
	const initInfo = {
		fullname: patient ? patient.fullname : null,
		dob: patient ? dayjs(patient.dob) : null,
		gender: patient ? patient.gender : true,
		phone: patient ? patient.phone : null,
		street: patient && patient.street ? patient.street : null,
		ward: patient && patient.ward ? patient.ward : null,
		district: patient && patient.district ? patient.district : null,
		city: patient && patient.city ? patient.city : null,
	};

	//CALL API BỆNH NHÂN BẰNG ID & API THÀNH PHỐ
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		getAllCities();
		if (patient_id) getPatientByID();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	//GÁN THÔNG TIN BỆNH NHÂN LÊN FORM
	useEffect(() => {
		if (patient) {
			setIsAlertHidden(patient && patient.is_blocked ? false : true);
			form.setFieldsValue(initInfo);
			if (patient.avatar) setLocalPath(patient.avatar);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form, patient]);

	//LẤY CÁC QUẬN NẾU THÔNG TIN BAN ĐẦU CÓ THÀNH PHỐ
	useEffect(() => {
		if (patient && patient.city) {
			const city = cityList.find((item) => item.name === patient.city);
			if (city) {
				const cityCode = city.code;
				getDistrictsByCity(cityCode);
			}
		}
	}, [patient, cityList]);

	//LẤY CÁC PHƯỜNG NẾU THÔNG TIN BAN ĐẦU CÓ QUẬN
	useEffect(() => {
		if (patient && patient.district) {
			const district = districtList.find(
				(item) => item.name === patient.district,
			);
			if (district) {
				const districtCode = district.code;
				getWardsByDistrict(districtCode);
			}
		}
	}, [patient, districtList]);

	//XỬ LÝ LẤY BỆNH NHÂN BẰNG ID
	const getPatientByID = async () => {
		const res = await patientAPI.getByID(patient_id);
		if (res.data.errCode === 0) {
			setPatient(res.data.data);
		} else {
			navigate('/benh-nhan');
		}
	};

	//XỬ LÝ LẤY TẤT CẢ THÀNH PHỐ
	const getAllCities = async () => {
		const res = await locationAPI.getAllCities();
		setCityList(res.data);
	};

	//XỬ LÝ LẤY CÁC QUẬN/HUYỆN THEO THÀNH PHỐ
	const getDistrictsByCity = async (city_code) => {
		const res = await locationAPI.getAllDistricts();
		setDistrictList(
			res.data.filter((data) => data.province_code === city_code),
		);
	};

	//XỬ LÝ LẤY CÁC PHƯỜNG/XÃ THEO QUẬN/HUYỆN
	const getWardsByDistrict = async (district_code) => {
		const res = await locationAPI.getAllWards();
		setWardList(
			res.data.filter((data) => data.district_code === district_code),
		);
	};

	//XỬ LÝ CHỌN ẢNH TỪ MÁY
	const handleChooseAvatar = async (e) => {
		const file = e.target.files[0];
		if (file) {
			if (file.size <= 5242880) {
				const compressedFile = await CommonUtils.compressImage(file);
				setFile(compressedFile);
				setLocalPath(URL.createObjectURL(compressedFile));
			} else {
				const size = Math.round((file.size / 1024 / 1024) * 100) / 100;
				toast.error(`Kích thước ${size}MB vượt quá giới hạn`);
			}
		}
	};

	//XỬ LÝ XÓA AVATAR
	const handleDeleteAvatar = () => {
		setLocalPath(null);
		setFile(null);
		toast.success('Xóa thành công');
	};

	//XỬ LÝ MỞ MODAL NHẬP MẬT KHẨU XÁC NHẬN
	const handleOpenConfirmSave = (values) => {
		setValues(values);
		setIsConfirmSaveOpen(true);
	};

	//XỬ LÝ CHECK MẬT KHẨU XÁC NHẬN LƯU THÔNG TIN
	const handleCheckPassword = async ({ password }) => {
		const res = await authAPI.checkPassword({
			user_id: admin.user_id,
			role: admin.role,
			password: password,
		});
		const { errCode } = res.data;
		if (errCode === 0) {
			handleSubmit();
			confirmSaveForm.resetFields();
			setIsConfirmSaveOpen(false);
		} else if (errCode === 2) {
			toast.error('Mật khẩu không hợp lệ');
		} else {
			toast.error('Gửi yêu cầu thất bại');
		}
	};

	//XỬ LÝ THÊM MỚI BỆNH NHÂN
	const handleCreatePatient = async (values) => {
		let url;

		if (file) {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('upload_preset', 'user_avatar');

			const res = await imageAPI.uploadImageToCloud(formData);
			if (res.status === 200) url = res.data.secure_url;
		}

		const patientInfo = {
			fullname: values.fullname,
			avatar: url,
			dob: values.dob,
			gender: values.gender,
			phone: values.phone,
			street: street,
			ward: ward,
			district: district,
			city: city,
			email: values.email,
			password: values.password,
		};

		setIsLoading(true);
		const res = await patientAPI.create(patientInfo);
		setIsLoading(false);

		const { errCode, type } = res.data;
		if (errCode === 0) {
			toast.success('Thêm thành công');
			url = null;
			handleResetState();
			form.resetFields();
		} else if (errCode === 2 && type === 'phone') {
			toast.error('Số điện thoại đã tồn tại');
		} else if (errCode === 2 && type === 'email') {
			toast.error('Email đã tồn tại');
		} else {
			toast.error('Thêm thất bại'); //errCode === 5
		}
	};

	//XỬ LÝ CẬP NHẬT BỆNH NHÂN
	const handleUpdatePatient = async (values) => {
		let url;

		if (file) {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('upload_preset', 'user_avatar');

			const res = await imageAPI.uploadImageToCloud(formData);
			if (res.status === 200) url = res.data.secure_url;
		}

		const patientInfo = {
			fullname: values.fullname,
			avatar: url ? url : localPath ? patient.avatar : null,
			dob: values.dob,
			gender: values.gender,
			phone: values.phone,
			street: street ? street : values.street,
			ward: ward ? ward : values.ward,
			district: district ? district : values.district,
			city: city ? city : values.city,
		};

		setIsLoading(true);
		const res = await patientAPI.update(patientInfo, patient.patient_id);
		setIsLoading(false);

		const { errCode, type } = res.data;
		if (errCode === 0) {
			toast.success('Cập nhật thành công');
		} else if (errCode === 2 && type === 'phone') {
			toast.error('Số điện thoại đã tồn tại');
		} else if (errCode === 2 && type === 'email') {
			toast.error('Email đã tồn tại');
		} else {
			toast.error('Cập nhật thất bại'); //errCode === 1 || errCode === 5
		}
	};

	//XỬ LÝ SUBMIT FORM
	const handleSubmit = () => {
		let resultCheckPhone = CommonUtils.checkPhoneNumber(values.phone);
		let resultCheckPassword;

		if (resultCheckPhone) {
			if (!patient) {
				resultCheckPassword = CommonUtils.checkPasswordLength(values.password);
			}
			if (resultCheckPassword || patient) {
				if (patient) {
					handleUpdatePatient(values);
				} else {
					handleCreatePatient(values);
				}
			} else {
				toast.error('Mật khẩu cần có độ dài 6 - 20 ký tự');
			}
		} else {
			toast.error('Số điện thoại không hợp lệ');
		}
	};

	//XỬ LÝ MỞ KHÓA TÀI KHOẢN
	const handleUnblockAccount = async (values) => {
		const res = await authAPI.unblockAccount({
			admin_id: admin.user_id,
			password: values.password,
			user_id: patient.patient_id,
		});
		const { errCode } = res.data;
		if (errCode === 0) {
			toast.success('Đã mở khóa tài khoản');
			unblockForm.resetFields();
			setIsAlertHidden(true);
			setIsUnblockOpen(false);
		} else if (errCode === 2) {
			toast.error('Mật khẩu không hợp lệ');
		} else {
			toast.error('Gửi yêu cầu thất bại'); //errCode === 1 || errCode === 5
		}
	};

	//XỬ LÝ SET LẠI GIÁ TRỊ CHO STATE
	const handleResetState = () => {
		setLocalPath(null);
		setFile(null);
		setStreet(null);
		setWard(null);
		setDistrict(null);
		setCity(null);
	};

	return (
		<Vertical>
			<Spin tip="Đang tải..." spinning={isLoading}>
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
										{patient ? (
											<h5 className="text-uppercase text-primary mb-0">
												Cập nhật thông tin
											</h5>
										) : (
											<h5 className="text-uppercase text-primary mb-0">
												Thêm bệnh nhân
											</h5>
										)}
									</div>
								</div>
								<div className="row mb-3">
									<div className="col-md d-flex align-items-center flex-wrap">
										{localPath ? (
											<img
												className="user-avatar rounded"
												src={localPath}
												alt=""
											/>
										) : (
											<div className="user-avatar border border-1 d-flex justify-content-center align-items-center rounded">
												<small>Chưa có ảnh</small>
											</div>
										)}
										<input
											type="file"
											accept="image/*"
											id="avatar"
											hidden
											onChange={handleChooseAvatar}
										/>
										<label
											className="btn btn-light btn-choose-avatar mx-2"
											htmlFor="avatar"
										>
											Chọn
										</label>
										{localPath ? (
											<Popconfirm
												title="Bạn có muốn xóa ảnh?"
												cancelText="Hủy"
												okText="Xóa"
												onConfirm={handleDeleteAvatar}
											>
												<Button className="me-2">Xóa</Button>
											</Popconfirm>
										) : (
											<></>
										)}
										<small className="avatar-size-note">
											Kích thước ảnh tối đa 5MB (JPEG hoặc PNG)
										</small>
									</div>
								</div>
								<div className="row mb-3" hidden={isAlertHidden}>
									<div className="col-md">
										<Alert
											showIcon
											type="warning"
											message="Tài khoản hiện bị khóa"
											action={
												<Button onClick={() => setIsUnblockOpen(true)}>
													Mở khóa
												</Button>
											}
										/>
									</div>
								</div>
								<div className="row">
									<div className="col-md">
										<Form
											form={form}
											layout="vertical"
											onFinish={handleOpenConfirmSave}
											validateMessages={{
												types: {
													email: 'Email không đúng định dạng',
												},
											}}
											initialValues={{ gender: true }}
										>
											<div className="row">
												<div className="col-md-4 mt-3">
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
														<Input size="large" placeholder="Họ và tên" />
													</Form.Item>
												</div>
												<div className="col-md-4 mt-3">
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
														/>
													</Form.Item>
												</div>
												<div className="col-md-4 mt-3">
													<Form.Item label="Giới tính" name="gender">
														<Radio.Group>
															<Radio value={true}>Nam</Radio>
															<Radio value={false}>Nữ</Radio>
														</Radio.Group>
													</Form.Item>
												</div>
											</div>
											<div className="row">
												<div className="col-md-4 mt-3">
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
														<Input size="large" placeholder="Số điện thoại" />
													</Form.Item>
												</div>
												<div className="col-md-4 mt-3">
													{patient ? (
														<Form.Item label="Email" name="email">
															<Input
																size="large"
																placeholder="Bạn không thể sửa email"
																disabled
															/>
														</Form.Item>
													) : (
														<Form.Item
															label="Email"
															name="email"
															rules={[
																{
																	required: true,
																	message: 'Email không được rỗng',
																},
																{
																	type: 'email',
																},
															]}
														>
															<Input size="large" placeholder="Email" />
														</Form.Item>
													)}
												</div>
												<div className="col-md-4 mt-3">
													{patient ? (
														<Form.Item label="Mật khẩu" name="password">
															<Input.Password
																size="large"
																placeholder="Bạn không thể đổi mật khẩu"
																visibilityToggle={false}
																disabled
															/>
														</Form.Item>
													) : (
														<Form.Item
															label="Mật khẩu"
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
																placeholder="Mật khẩu (6 - 20 ký tự)"
																visibilityToggle={false}
															/>
														</Form.Item>
													)}
												</div>
											</div>
											<div className="row">
												<div className="col-md-4 mt-3">
													<Form.Item label="Thành phố/tỉnh" name="city">
														<Select
															placeholder="Chọn thành phố/tỉnh"
															size="large"
															showSearch
															options={cityList.map((data) => {
																return {
																	value: data.name,
																	label: data.name,
																	code: data.code,
																};
															})}
															onChange={(value, obj) => {
																setCity(value);
																getDistrictsByCity(obj.code);
															}}
														/>
													</Form.Item>
												</div>
												<div className="col-md-2 mt-3">
													<Form.Item label="Quận/huyện" name="district">
														<Select
															placeholder="Chọn quận/huyện"
															size="large"
															showSearch
															options={districtList.map((data) => {
																return {
																	value: data.name,
																	label: data.name,
																	code: data.code,
																};
															})}
															onChange={(value, obj) => {
																setDistrict(value);
																getWardsByDistrict(obj.code);
															}}
															disabled={
																city || (patient && patient.city) ? false : true
															}
														/>
													</Form.Item>
												</div>
												<div className="col-md-2 mt-3">
													<Form.Item label="Phường/xã" name="ward">
														<Select
															placeholder="Chọn phường/xã"
															size="large"
															showSearch
															options={wardList.map((data) => {
																return {
																	value: data.name,
																	label: data.name,
																	code: data.code,
																};
															})}
															onChange={(value) => setWard(value)}
															disabled={
																district || (patient && patient.district)
																	? false
																	: true
															}
														/>
													</Form.Item>
												</div>
												<div className="col-md-4 mt-3">
													<Form.Item label="Số nhà và tên đường" name="street">
														<Input
															size="large"
															placeholder="Số nhà và tên đường"
															onChange={(e) => setStreet(e.target.value)}
															disabled={
																ward || (patient && patient.ward) ? false : true
															}
														/>
													</Form.Item>
												</div>
											</div>
											<div className="mt-3">
												<Button
													htmlType="submit"
													className="btn-primary px-4 me-2"
												>
													Lưu thông tin
												</Button>
												<Button htmlType="reset" className="px-4">
													Reset
												</Button>
											</div>
										</Form>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Spin>
			<Modal
				open={isConfirmSaveOpen}
				onCancel={() => setIsConfirmSaveOpen(false)}
				okButtonProps={{ hidden: true }}
				cancelButtonProps={{ hidden: true }}
			>
				<Spin tip="Đang tải..." spinning={isLoading}>
					<div className="text-center">
						<h5 className="text-primary">Xác nhận lưu thông tin?</h5>
						<hr />
					</div>
					<Form
						form={confirmSaveForm}
						layout="vertical"
						onFinish={handleCheckPassword}
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
							<Button htmlType="submit" className="btn-primary px-4 me-2">
								Xác nhận
							</Button>
							<Button htmlType="reset" className="px-4">
								Reset
							</Button>
						</div>
					</Form>
				</Spin>
			</Modal>
			<Modal
				open={isUnblockOpen}
				onCancel={() => setIsUnblockOpen(false)}
				okButtonProps={{ hidden: true }}
				cancelButtonProps={{ hidden: true }}
			>
				<Spin tip="Đang tải..." spinning={isLoading}>
					<div className="text-center">
						<h5 className="text-primary">
							Mở khóa tài khoản {''}
							<span className="text-danger">
								{patient ? patient.fullname : ''}
							</span>
						</h5>
						<hr />
					</div>
					<Form
						form={unblockForm}
						layout="vertical"
						onFinish={handleUnblockAccount}
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
							<Button htmlType="submit" className="btn-primary px-4 me-2">
								Mở khóa
							</Button>
							<Button htmlType="reset" className="px-4">
								Reset
							</Button>
						</div>
					</Form>
				</Spin>
			</Modal>
		</Vertical>
	);
}
