import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Tabs, Tab } from 'react-bootstrap';
import {
	Form,
	Input,
	DatePicker,
	Radio,
	Select,
	Button,
	Popconfirm,
	Spin,
	Modal,
} from 'antd';
import { setUserInfo } from '../../slices/userSlice';
import { Vertical } from '../../utils/AnimatedPage';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import CommonUtils from '../../utils/commonUtils';
import locationAPI from '../../services/locationAPI';
import employeeAPI from '../../services/employeeAPI';
import doctorAPI from '../../services/doctorAPI';
import authAPI from '../../services/authAPI';
import imageAPI from '../../services/imageAPI';
import 'react-markdown-editor-lite/lib/index.css';

const mdParser = new MarkdownIt(/* Markdown-it options */);

export default function Account({ accessToken }) {
	//KHAI BÁO BIẾN, FORM
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [basicInfoForm] = Form.useForm();
	const [accountInfoForm] = Form.useForm();
	const [changeEmailForm] = Form.useForm();
	const [changePasswordForm] = Form.useForm();

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
	const [isHidden, setIsHidden] = useState(true);
	const [isEmailOpen, setIsEmailOpen] = useState(false);
	const [isPasswordOpen, setIsPasswordOpen] = useState(false);

	//CUSTOM EDITOR
	const markdownPlugins = [
		'header',
		'font-italic',
		'font-underline',
		'font-strikethrough',
		'list-unordered',
		'list-ordered',
		'block-quote',
		'table',
		'link',
		'clear',
		'logger',
		'mode-toggle',
	];
	const [html, setHtml] = useState('');
	const [markdown, setMarkdown] = useState('');

	//THÔNG TIN NGƯỜI DÙNG ĐANG ĐĂNG NHẬP
	const [user, setUser] = useState(null);
	const user_id = useSelector((state) => state.user.user.user_id);
	const role = useSelector((state) => state.user.user.role);

	//KHỞI TẠO GIÁ TRỊ CHO THÔNG TIN CƠ BẢN
	const basicInfo = {
		fullname: user ? user.fullname : null,
		dob: user ? dayjs(user.dob) : null,
		gender: user ? user.gender : 1,
		phone: user ? user.phone : null,
		degree: user && user.degree ? user.degree : null,
		start_date: user && user.start_date ? dayjs(user.start_date) : null,
		street: user && user.street ? user.street : null,
		ward: user && user.ward ? user.ward : null,
		district: user && user.district ? user.district : null,
		city: user && user.city ? user.city : null,
	};

	//KHỞI TẠO GIÁ TRỊ CHO THÔNG TIN TÀI KHOẢN
	const accountInfo = {
		role:
			role === 2
				? 'Quản trị viên'
				: role === 3
				? 'Lễ tân'
				: role === 4
				? 'Bác sĩ'
				: 'Phụ tá',
		email: user ? user.email : null,
	};

	//CALL API NHÂN VIÊN BẰNG ID & API THÀNH PHỐ
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		getAllCities();
		if (user_id) getUserByID();
		// eslint-disable-next-line
	}, []);

	//GÁN THÔNG TIN NHÂN VIÊN LÊN FORM
	useEffect(() => {
		if (user) {
			setMarkdown(user.markdown);
			setHtml(user.html);
			basicInfoForm.setFieldsValue(basicInfo);
			accountInfoForm.setFieldsValue(accountInfo);
			if (user.avatar) setLocalPath(user.avatar);
			if (role === 4) setIsHidden(false);
		}
		// eslint-disable-next-line
	}, [basicInfoForm, accountInfoForm, user]);

	//LẤY CÁC QUẬN NẾU THÔNG TIN BAN ĐẦU CÓ THÀNH PHỐ
	useEffect(() => {
		if (user && user.city) {
			const city = cityList.find((item) => item.name === user.city);
			if (city) {
				const cityCode = city.code;
				getDistrictsByCity(cityCode);
			}
		}
	}, [user, cityList]);

	//LẤY CÁC PHƯỜNG NẾU THÔNG TIN BAN ĐẦU CÓ QUẬN
	useEffect(() => {
		if (user && user.district) {
			const district = districtList.find((item) => item.name === user.district);
			if (district) {
				const districtCode = district.code;
				getWardsByDistrict(districtCode);
			}
		}
	}, [user, districtList]);

	//XỬ LÝ LẤY NHÂN VIÊN BẰNG ID
	const getUserByID = async () => {
		let res;
		switch (role) {
			case 2:
			case 3:
			case 5:
				res = await employeeAPI.getByID(user_id);
				if (res.data.errCode === 0) {
					const { employee_id, ...employeeInfo } = res.data.data;
					setUser({ ...employeeInfo, user_id: employee_id });
				}
				break;
			case 4:
				res = await doctorAPI.getByID(user_id);
				if (res.data.errCode === 0) {
					const { doctor_id, ...doctorInfo } = res.data.data;
					setUser({ ...doctorInfo, user_id: doctor_id });
				}
				break;
			default:
				break;
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

	//XỬ LÝ THAY ĐỔI EDITOR MÔ TẢ BÁC SĨ
	const handleEditorChange = ({ html, text }) => {
		setHtml(html);
		setMarkdown(text);
	};

	//XỬ LÝ CẬP NHẬT NHÂN VIÊN
	const handleUpdateProfile = async (values) => {
		let url;

		if (file) {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('upload_preset', 'user_avatar');

			const res = await imageAPI.uploadImageToCloud(formData);
			if (res.status === 200) url = res.data.secure_url;
		}

		const userInfo = {
			fullname: values.fullname,
			avatar: url ? url : localPath ? user.avatar : null,
			dob: values.dob,
			gender: values.gender,
			phone: values.phone,
			start_date: values.start_date,
			street: street ? street : values.street,
			ward: ward ? ward : values.ward,
			district: district ? district : values.district,
			city: city ? city : values.city,
		};

		let res;
		setIsLoading(true);
		switch (role) {
			case 2:
			case 3:
			case 5:
				res = await employeeAPI.updateProfile(
					{
						...userInfo,
						role: role,
					},
					user_id,
				);
				break;
			case 4:
				res = await doctorAPI.updateProfile(
					{
						...userInfo,
						html: html,
						markdown: markdown,
					},
					user_id,
				);
				break;
			default:
				break;
		}
		setIsLoading(false);

		const { errCode, type } = res.data;
		if (errCode === 0) {
			toast.success('Cập nhật thành công');
		} else if (errCode === 2 && type === 'phone') {
			toast.error('Số điện thoại đã tồn tại');
		} else {
			toast.error('Cập nhật thất bại'); //errCode === 1 || errCode === 5
		}
	};

	//XỬ LÝ SUBMIT FORM THÔNG TIN CƠ BẢN
	const handleSubmitBasicInfo = (values) => {
		let resultCheckAge = CommonUtils.checkEmployeeAge(values.dob.$d);
		let resultCheckPhone = CommonUtils.checkPhoneNumber(values.phone);
		let resultCheckPassword;

		if (resultCheckAge) {
			if (resultCheckPhone) {
				if (!user) {
					resultCheckPassword = CommonUtils.checkPasswordLength(
						values.password,
					);
				}
				if (resultCheckPassword || user) {
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
					}).then((result) => {
						if (result.isConfirmed) handleUpdateProfile(values);
					});
				} else {
					toast.error('Mật khẩu cần có độ dài 6 - 20 ký tự');
				}
			} else {
				toast.error('Số điện thoại không hợp lệ');
			}
		} else {
			toast.error('Chưa đủ 18 tuổi');
		}
	};

	//XỬ LÝ ĐỔI EMAIL
	const handleChangeEmail = async (values) => {
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
				setIsLoading(true);
				const res = await authAPI.changeEmail(
					{
						new_email: values.new_email,
						password: values.password,
					},
					user_id,
				);
				setIsLoading(false);

				const { errCode, type } = res.data;
				if (errCode === 0) {
					toast.success('Đã gửi thư xác nhận email mới');
					changeEmailForm.resetFields();
					setIsEmailOpen(false);
					setTimeout(() => {
						toast('Bạn cần đăng nhập lại', { icon: '⚠️' });
					}, 500);
					setTimeout(() => {
						handleLogout();
					}, 1000);
				} else if (errCode === 2 && type === 'password') {
					toast.error('Mật khẩu không hợp lệ');
				} else if (errCode === 2 && type === 'email') {
					toast.error('Email đã tồn tại');
				} else {
					toast.error('Đổi email thất bại');
				}
			}
		});
	};

	//XỬ LÝ ĐỔI MẬT KHẨU
	const handleChangePassword = async (values) => {
		const resultCheckPassword = CommonUtils.checkPasswordLength(
			values.new_password,
		);
		if (resultCheckPassword) {
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
					setIsLoading(true);
					const res = await authAPI.changePassword(
						{
							current_password: values.current_password,
							new_password: values.new_password,
						},
						user_id,
					);
					setIsLoading(false);

					const { errCode } = res.data;
					if (errCode === 0) {
						toast.success('Đổi mật khẩu thành công');
						changePasswordForm.resetFields();
						setIsPasswordOpen(false);
					} else if (errCode === 2) {
						toast.error('Mật khẩu không hợp lệ');
					} else {
						toast.error('Đổi mật khẩu thất bại');
					}
				}
			});
		} else {
			toast.error('Mật khẩu mới cần có độ dài 6 - 20 ký tự');
		}
	};

	//XỬ LÝ ĐĂNG XUẤT
	const handleLogout = () => {
		Cookies.remove('refreshToken');
		dispatch(setUserInfo({ user: null, login: false }));
		navigate('/');
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
										<Link to="/" className="text-decoration-none text-primary">
											<small>
												<FontAwesomeIcon icon={faChevronLeft} /> Trang chủ
											</small>
										</Link>
									</div>
								</div>
								<div className="row mb-3">
									<div className="col-md">
										<h5 className="text-uppercase text-primary mb-0">
											Thông tin tài khoản
										</h5>
									</div>
								</div>
								<div className="row mb-4">
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
								<div className="row">
									<div className="col-md">
										<Tabs defaultActiveKey={1}>
											<Tab eventKey={1} title="Thông tin cơ bản">
												<Form
													form={basicInfoForm}
													className="mt-3"
													layout="vertical"
													onFinish={handleSubmitBasicInfo}
													initialValues={{ gender: 1 }}
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
																	<Radio value={1}>Nam</Radio>
																	<Radio value={0}>Nữ</Radio>
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
																<Input
																	size="large"
																	placeholder="Số điện thoại"
																/>
															</Form.Item>
														</div>
														<div className="col-md-4 mt-3">
															<Form.Item label="Bằng cấp" name="degree">
																<Input
																	size="large"
																	placeholder="Bằng cấp"
																	readOnly
																/>
															</Form.Item>
														</div>
														<div className="col-md-4 mt-3">
															<Form.Item label="Ngày vào làm" name="start_date">
																<DatePicker
																	size="large"
																	placeholder="Ngày làm việc"
																	format="DD-MM-YYYY"
																/>
															</Form.Item>
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
																		city || (user && user.city) ? false : true
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
																		district || (user && user.district)
																			? false
																			: true
																	}
																/>
															</Form.Item>
														</div>
														<div className="col-md-4 mt-3">
															<Form.Item
																label="Số nhà và tên đường"
																name="street"
															>
																<Input
																	size="large"
																	placeholder="Số nhà và tên đường"
																	onChange={(e) => setStreet(e.target.value)}
																	disabled={
																		ward || (user && user.ward) ? false : true
																	}
																/>
															</Form.Item>
														</div>
													</div>
													<div className="row" hidden={isHidden}>
														<div className="col-md mt-3">
															<Form.Item label="Mô tả bác sĩ">
																<MdEditor
																	style={{ height: '500px' }}
																	plugins={markdownPlugins}
																	value={markdown}
																	renderHTML={(text) => mdParser.render(text)}
																	onChange={handleEditorChange}
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
											</Tab>
											<Tab eventKey={2} title="Thông tin tài khoản">
												<Form
													form={accountInfoForm}
													className="mt-3"
													layout="vertical"
												>
													<div className="row">
														<div className="col-md-2 mt-3">
															<Form.Item label="Loại tài khoản" name="role">
																<Input
																	size="large"
																	placeholder="Chưa có thông tin"
																	readOnly
																/>
															</Form.Item>
														</div>
														<div className="col-md-4 mt-3">
															<Form.Item label="Email" name="email">
																<Input
																	size="large"
																	placeholder="Chưa có thông tin"
																	readOnly
																/>
															</Form.Item>
														</div>
														<div className="col-md-2 mt-3">
															<Form.Item label="Đổi email">
																<Button
																	className="w-100"
																	onClick={() => setIsEmailOpen(true)}
																>
																	Đổi email
																</Button>
															</Form.Item>
															<Modal
																open={isEmailOpen}
																onCancel={() => {
																	changeEmailForm.resetFields();
																	setIsEmailOpen(false);
																}}
																okButtonProps={{ hidden: true }}
																cancelButtonProps={{ hidden: true }}
															>
																<Spin tip="Đang tải..." spinning={isLoading}>
																	<div className="text-center">
																		<h5 className="text-primary">
																			Đổi địa chỉ email
																		</h5>
																		<hr />
																	</div>
																	<Form
																		form={changeEmailForm}
																		layout="vertical"
																		onFinish={handleChangeEmail}
																		validateMessages={{
																			types: {
																				email: 'Email không đúng định dạng',
																			},
																		}}
																	>
																		<div className="row">
																			<div className="col-md mt-2">
																				<Form.Item
																					label="Email mới"
																					name="new_email"
																					rules={[
																						{
																							required: true,
																							message:
																								'Email mới không được rỗng',
																						},
																						{
																							type: 'email',
																						},
																					]}
																				>
																					<Input
																						size="large"
																						placeholder="Email mới"
																					/>
																				</Form.Item>
																			</div>
																		</div>
																		<div className="row">
																			<div className="col-md mt-2">
																				<Form.Item
																					label="Mật khẩu xác nhận"
																					name="password"
																					rules={[
																						{
																							required: true,
																							message:
																								'Mật khẩu không được rỗng',
																						},
																					]}
																				>
																					<Input.Password
																						size="large"
																						visibilityToggle={false}
																						placeholder="Mật khẩu xác nhận"
																					/>
																				</Form.Item>
																			</div>
																		</div>
																		<div className="mt-2">
																			<Button
																				htmlType="submit"
																				className="btn-primary px-4 me-2"
																			>
																				Lưu thông tin
																			</Button>
																			<Button
																				className="px-4"
																				onClick={() =>
																					changeEmailForm.resetFields()
																				}
																			>
																				Reset
																			</Button>
																		</div>
																	</Form>
																</Spin>
															</Modal>
														</div>
														<div className="col-md-2 mt-3">
															<Form.Item label="Đổi mật khẩu">
																<Button
																	className="w-100"
																	onClick={() => setIsPasswordOpen(true)}
																>
																	Đổi mật khẩu
																</Button>
															</Form.Item>
															<Modal
																open={isPasswordOpen}
																onCancel={() => {
																	changePasswordForm.resetFields();
																	setIsPasswordOpen(false);
																}}
																okButtonProps={{ hidden: true }}
																cancelButtonProps={{ hidden: true }}
															>
																<Spin tip="Đang tải..." spinning={isLoading}>
																	<div className="text-center">
																		<h5 className="text-primary">
																			Đổi mật khẩu
																		</h5>
																		<hr />
																	</div>
																	<Form
																		form={changePasswordForm}
																		layout="vertical"
																		onFinish={handleChangePassword}
																	>
																		<div className="row">
																			<div className="col-md mt-2">
																				<Form.Item
																					label="Mật khẩu hiện tại"
																					name="current_password"
																					rules={[
																						{
																							required: true,
																							message:
																								'Mật khẩu hiện tại không được rỗng',
																						},
																					]}
																				>
																					<Input.Password
																						size="large"
																						visibilityToggle={false}
																						placeholder="Mật khẩu hiện tại"
																					/>
																				</Form.Item>
																			</div>
																		</div>
																		<div className="row">
																			<div className="col-md mt-2">
																				<Form.Item
																					label="Mật khẩu mới"
																					name="new_password"
																					rules={[
																						{
																							required: true,
																							message:
																								'Mật khẩu mới không được rỗng',
																						},
																					]}
																				>
																					<Input.Password
																						size="large"
																						visibilityToggle={false}
																						placeholder="Mật khẩu mới"
																					/>
																				</Form.Item>
																			</div>
																		</div>
																		<div className="mt-2">
																			<Button
																				htmlType="submit"
																				className="btn-primary px-4 me-2"
																			>
																				Lưu thông tin
																			</Button>
																			<Button
																				className="px-4"
																				onClick={() =>
																					changePasswordForm.resetFields()
																				}
																			>
																				Reset
																			</Button>
																		</div>
																	</Form>
																</Spin>
															</Modal>
														</div>
														<div className="col-md-2 mt-3">
															<Form.Item label="Đăng xuất">
																<Popconfirm
																	title="Bạn có muốn đăng xuất?"
																	cancelText="Hủy"
																	okText="Có"
																	onConfirm={handleLogout}
																>
																	<Button className="w-100 btn-primary">
																		Đăng xuất
																	</Button>
																</Popconfirm>
															</Form.Item>
														</div>
													</div>
												</Form>
											</Tab>
										</Tabs>
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
