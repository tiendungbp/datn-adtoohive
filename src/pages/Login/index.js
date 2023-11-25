import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Form, Select, Input, Button, Spin } from 'antd';
import { setUserInfo } from '../../slices/userSlice';
import { Horizontal } from '../../utils/AnimatedPage';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import authAPI from '../../services/authAPI';

export default function Login() {
	//STATE CHỨA THÔNG TIN
	const [pageLoading, setPageLoading] = useState(false);
	const dispatch = useDispatch();

	//XỬ LÝ ĐĂNG NHẬP
	const handleLogin = async (values) => {
		setPageLoading(true);
		const res = await authAPI.login({
			role: values.role,
			email: values.email,
			password: values.password,
		});
		setPageLoading(false);

		const { errCode, type } = res.data;
		if (errCode === 0) {
			toast.success('Đăng nhập thành công');
			const { refresh_token, access_token, ...data } = res.data.data;
			const action = setUserInfo({ user: data, login: true });
			dispatch(action);
			Cookies.set('refreshToken', refresh_token);
			localStorage.setItem('accessToken', access_token);
		} else if (errCode === 4) {
			toast.error('Tài khoản chưa xác minh email');
		} else if (errCode === 2 && type === 'role') {
			toast.error('Sai phân quyền');
		} else if (errCode === 2 && type === 'email') {
			toast.error('Sai địa chỉ email');
		} else if (errCode === 2 && type === 'password') {
			toast.error('Sai mật khẩu');
		} else if (errCode === 8) {
			toast.error('Tài khoản đã bị khóa');
		} else {
			toast.error('Đăng nhập thất bại');
		}
	};

	return (
		<Horizontal>
			<div className="container-fluid bg-light">
				<div
					className="row h-100 align-items-center justify-content-center"
					style={{ minHeight: '100vh' }}
				>
					<div className="col-12 col-sm-8 col-md-6 col-lg-5 col-xl-4">
						<div className="bg-secondary rounded p-4 p-sm-5 my-4 mx-3 shadow-container">
							<Spin tip="Đang tải..." spinning={pageLoading}>
								<div className="d-flex align-items-center justify-content-between mb-3">
									<h3 className="text-primary font-bold">
										Phòng khám nha khoa Toothhive
									</h3>
								</div>
								<Form
									layout="vertical"
									validateMessages={{
										types: {
											email: 'Email không đúng định dạng',
										},
									}}
									onFinish={handleLogin}
								>
									<div className="row">
										<div className="col-md mt-2">
											<Form.Item
												label="Vai trò"
												name="role"
												rules={[
													{
														required: true,
														message: 'Vai trò không được rỗng',
													},
												]}
											>
												<Select
													placeholder="Chọn vai trò"
													size="large"
													options={[
														{ value: 2, label: 'Quản trị viên' },
														{ value: 3, label: 'Lễ tân' },
														{ value: 4, label: 'Bác sĩ' },
														{ value: 5, label: 'Phụ tá' },
													]}
												/>
											</Form.Item>
										</div>
									</div>
									<div className="row">
										<div className="col-md mt-2">
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
										</div>
									</div>
									<div className="row">
										<div className="col-md mt-2">
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
													placeholder="Mật khẩu"
													visibilityToggle={false}
												/>
											</Form.Item>
										</div>
									</div>
									<div className="mt-2">
										<Button htmlType="submit" className="btn-primary px-4 me-2">
											Đăng nhập
										</Button>
										<Button htmlType="reset" className="px-4">
											Reset
										</Button>
									</div>
									<div className="mt-3">
										<Link
											to="/quen-mat-khau"
											className="text-decoration-none text-primary"
										>
											Quên mật khẩu
										</Link>
									</div>
								</Form>
							</Spin>
						</div>
					</div>
				</div>
			</div>
		</Horizontal>
	);
}
