import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Select, Modal, Form, Input, Radio, Spin } from 'antd';
import { setData } from '../../slices/dataSlice';
import { Vertical } from '../../utils/AnimatedPage';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import categoryAPI from '../../services/categoryAPI';
import Swal from 'sweetalert2';
import CommonUtils from '../../utils/commonUtils';
import moment from 'moment';

export default function Categories({ accessToken }) {
	// //XỬ LÝ CONFIG AXIOS
	// const user = useSelector(state => state.user.user);
	// const axiosJWT = axios.create();
	const dispatch = useDispatch();

	// axiosJWT.interceptors.request.use(async(config) => {
	//     let date = new Date();
	//     const decodedToken = jwt_decode(user.access_token);
	//     if(decodedToken.exp < date.getTime() / 1000) {
	//         const res = await axios(`${process.env.REACT_APP_API_URL}/api/auth/refresh-token`, {
	//             method: "post",
	//             withCredentials: true
	//         });
	//         Cookies.set("refreshToken", res.data.data.refresh_token);
	//         const refreshUser = {
	//             ...user,
	//             access_token: res.data.data.access_token
	//         };
	//         dispatch(setUserInfo({user: refreshUser, login: true}));
	//         config.headers["token"] = `Bearer ${res.data.data.access_token}`;
	//     };
	//     return config;
	// }, e => {
	//     return Promise.reject(e);
	// });

	//KHAI BÁO BIẾN
	const [categoryList, setCategoryList] = useState([]);
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [searchList, setSearchList] = useState(null);
	const [keyword, setKeyword] = useState('');
	const [form] = Form.useForm();
	const data = useSelector((state) => state.data);

	//ĐỊNH DẠNG DATATABLE
	const columns = [
		{
			title: 'Mã danh mục',
			dataIndex: 'category_id',
			align: 'center',
			render: (category_id) => category_id.toUpperCase(),
		},
		{
			title: 'Tên danh mục',
			dataIndex: 'category_name',
			render: (category_name) => CommonUtils.capitalizeEachWord(category_name),
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			render: (status) =>
				status === true ? (
					<span className="text-success">Đang hoạt động</span>
				) : (
					<span className="text-danger">Ngưng hoạt động</span>
				),
		},
		{
			title: 'Ngày tạo',
			dataIndex: 'createdAt',
			align: 'center',
			render: (createdAt) => moment(createdAt).format('DD-MM-YYYY'),
		},
	];

	//CALL API
	useEffect(() => {
		if (data.category_id) {
			form.setFieldsValue({
				category_name: CommonUtils.capitalizeEachWord(data.category_name),
				status: data.status,
			});
			setIsOpen(true);
		}
		getAllCategories();
	}, [data, form]);

	//NẾU SỬA KHI ĐANG CÓ SEARCH LIST THÌ UPDATE LẠI SEARCH LIST
	useEffect(() => {
		if (searchList) {
			let list = [];
			searchList.forEach((searchItem) => {
				const a = categoryList.find((category) => {
					return category.category_id === searchItem.category_id;
				});
				if (a) list.push(a);
			});
			setSearchList(list);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [categoryList]);

	//XỬ LÝ LẤY TẤT CẢ DANH MỤC
	const getAllCategories = async () => {
		setIsLoading(true);
		const res = await categoryAPI.getAll();
		setCategoryList(res.data.data);
		setIsLoading(false);
	};

	//XỬ LÝ LỌC DANH MỤC THEO TRẠNG THÁI
	const handleFilterByStatus = (status) => {
		if (status === -1) {
			setSearchList(null);
		} else {
			const list = categoryList.filter(
				(category) => category.status === status,
			);
			setSearchList(list);
		}
	};

	//XỬ LÝ TÌM DANH MỤC THEO TÊN
	const handleSearchByName = () => {
		if (keyword) {
			const list = categoryList.filter((category) => {
				return category.category_name.includes(keyword.toLowerCase());
			});
			setSearchList(list);
			setKeyword('');
		} else {
			setSearchList(null);
		}
	};

	//XỬ LÝ THÊM MỚI DANH MỤC
	const handleCreateCategory = async (values) => {
		setIsLoading(true);
		const res = await categoryAPI.create({
			category_name: values.category_name,
			status: values.status,
		});
		setIsLoading(false);

		const { errCode } = res.data;
		if (errCode === 0) {
			toast.success('Thêm thành công');
			form.resetFields();
			getAllCategories();
		} else if (errCode === 2) {
			toast.error('Tên danh mục đã tồn tại');
		} else {
			toast.error('Thêm thất bại'); //errCode === 5
		}
		setIsOpen(false);
	};

	//XỬ LÝ CẬP NHẬT DANH MỤC
	const handleUpdateCategory = async (values) => {
		setIsLoading(true);
		const res = await categoryAPI.update(
			{
				category_name: values.category_name,
				status: values.status,
			},
			data.category_id,
		);
		setIsLoading(false);

		const { errCode } = res.data;
		if (errCode === 0) {
			toast.success('Cập nhật thành công');
			dispatch(setData({}));
			getAllCategories();
			setIsOpen(false);
		} else if (errCode === 2) {
			toast.error('Tên danh mục đã tồn tại');
		} else {
			toast.error('Cập nhật thất bại'); //errCode === 1 || errCode === 5
		}
		setIsOpen(false);
	};

	//XỬ LÝ XÓA DANH MỤC
	const handleDeleteCategory = async (record) => {
		setIsLoading(true);
		const res = await categoryAPI.delete(record.category_id);
		setIsLoading(false);

		const { errCode } = res.data;
		if (errCode === 0) {
			toast.success('Xóa thành công');
			getAllCategories();
		} else if (errCode === 6) {
			toast.error('Danh mục đã có dịch vụ');
		} else {
			//errCode === 1
			toast.error('Xóa thất bại');
		}
	};

	//XỬ LÝ SUBMIT
	const handleSubmit = (values) => {
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
			if (result.isConfirmed) {
				if (data.category_id) {
					handleUpdateCategory(values);
				} else {
					handleCreateCategory(values);
				}
			}
		});
	};

	//XỬ LÝ ENTER KHI TÌM THEO TÊN
	const handleEnter = (e) => {
		if (e.keyCode === 13) handleSearchByName();
	};

	//XỬ LÝ CLICK BUTTON THÊM MỚI
	const handleClickButtonAdd = () => {
		dispatch(setData({}));
		form.setFieldsValue({ category_name: null, status: true });
		setIsOpen(true);
	};

	return (
		<Vertical>
			<div className="container-fluid pt-4">
				<div className="row bg-light rounded mx-0 mb-4">
					<div className="col-md">
						<div className="rounded p-4 bg-secondary mb-4">
							<div className="row">
								<div className="col-md">
									<span className="text-dark page-title">QUẢN LÝ DANH MỤC</span>
									<Button
										className="btn-add btn-primary px-4"
										onClick={handleClickButtonAdd}
									>
										THÊM MỚI
									</Button>
									<Modal
										open={isOpen}
										onCancel={() => {
											setIsOpen(false);
											dispatch(setData({}));
										}}
										okButtonProps={{ hidden: true }}
										cancelButtonProps={{ hidden: true }}
									>
										<Spin tip="Đang tải..." spinning={isLoading}>
											<Form
												form={form}
												layout="vertical"
												initialValues={{ status: 1 }}
												onFinish={handleSubmit}
											>
												<div className="row">
													<div className="col-md mt-2">
														<Form.Item
															label="Tên danh mục"
															name="category_name"
															rules={[
																{
																	required: true,
																	message: 'Tên danh mục không được rỗng',
																},
															]}
														>
															<Input size="large" placeholder="Tên danh mục" />
														</Form.Item>
													</div>
												</div>
												<div className="row">
													<div className="col-md mt-2">
														<Form.Item label="Trạng thái" name="status">
															<Radio.Group>
																<Radio value={true}>Hoạt động</Radio>
																<Radio value={false}>Ngưng hoạt động</Radio>
															</Radio.Group>
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
													{
														value: true,
														label: 'Đang hoạt động',
													},
													{
														value: false,
														label: 'Ngưng hoạt động',
													},
												]}
												onChange={(value) => handleFilterByStatus(value)}
											/>
										</Form.Item>
									</div>
									<div className="col-md-4">
										<Form.Item label="Tìm theo tên">
											<div className="d-flex w-100">
												<Input
													size="large"
													placeholder="Nhập thông tin"
													value={keyword}
													onChange={(e) => setKeyword(e.target.value)}
													onKeyUp={handleEnter}
												/>
												<Button onClick={handleSearchByName}>Tìm</Button>
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
											list={searchList ? searchList : categoryList}
											handleDelete={handleDeleteCategory}
											isLoading={isLoading}
											isOnePage={true}
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
