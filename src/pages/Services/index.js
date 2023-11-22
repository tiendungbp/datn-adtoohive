import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
	Button,
	Select,
	Modal,
	Form,
	Input,
	Radio,
	Spin,
	InputNumber,
} from 'antd';
import { setData } from '../../slices/dataSlice';
import { Vertical } from '../../utils/AnimatedPage';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import serviceAPI from '../../services/serviceAPI';
import categoryAPI from '../../services/categoryAPI';
import Swal from 'sweetalert2';
import CommonUtils from '../../utils/commonUtils';

export default function Services() {
	//KHAI BÁO BIẾN
	const dispatch = useDispatch();
	const [serviceList, setServiceList] = useState([]);
	const [categoryList, setCategoryList] = useState([]);
	const [activeCategoryList, setActiveCategoryList] = useState([]);
	const [isOpen, setIsOpen] = useState(false);
	const [pageLoading, setPageLoading] = useState(false);
	const [modalLoading, setModalLoading] = useState(false);
	const [searchList, setSearchList] = useState(null);
	const [keyword, setKeyword] = useState('');
	const [form] = Form.useForm();
	const data = useSelector((state) => state.data);

	//ĐỊNH DẠNG DATATABLE
	const columns = [
		{
			title: 'Mã dịch vụ',
			dataIndex: 'service_id',
			align: 'center',
			render: (service_id) => service_id.toUpperCase(),
		},
		{
			title: 'Danh mục',
			dataIndex: 'Category',
			render: (category) =>
				CommonUtils.capitalizeEachWord(category.category_name),
		},
		{
			title: 'Tên dịch vụ',
			dataIndex: 'service_name',
			render: (service_name) => CommonUtils.capitalizeEachWord(service_name),
		},
		{
			title: 'Đơn giá',
			dataIndex: 'price',
			align: 'right',
			render: (price) => CommonUtils.VND.format(price),
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			render: (status) =>
				status === 1 ? (
					<span className="text-success">Đang hoạt động</span>
				) : (
					<span className="text-danger">Ngưng hoạt động</span>
				),
		},
	];

	//CALL API
	useEffect(() => {
		if (data.service_id) {
			form.setFieldsValue({
				category_id: data.Category.category_id,
				service_name: CommonUtils.capitalizeEachWord(data.service_name),
				price: data.price,
				status: data.status,
			});
			setIsOpen(true);
		}
		getAllServices();
		getAllCategories();
		getActiveCategories();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, form]);

	//NẾU SỬA KHI ĐANG CÓ SEARCH LIST THÌ UPDATE LẠI SEARCH LIST
	useEffect(() => {
		if (searchList) {
			let list = [];
			searchList.forEach((searchItem) => {
				const a = serviceList.find((service) => {
					return service.service_id === searchItem.service_id;
				});
				if (a) list.push(a);
			});
			setSearchList(list);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [serviceList]);

	//XỬ LÝ LẤY TẤT CẢ DỊCH VỤ
	const getAllServices = async () => {
		setPageLoading(true);
		const res = await serviceAPI.getAll();
		setServiceList(res.data.data);
		setPageLoading(false);
	};

	//XỬ LÝ LẤY TẤT CẢ DANH MỤC
	const getAllCategories = async () => {
		const res = await categoryAPI.getAll();
		setCategoryList(res.data.data);
	};

	//XỬ LÝ LỌC CÁC DANH MỤC ĐANG HOẠT ĐỘNG
	const getActiveCategories = () => {
		setActiveCategoryList(
			categoryList.filter((category) => category.status === 1),
		);
	};

	//XỬ LÝ LỌC DỊCH VỤ THEO TRẠNG THÁI
	const handleFilterByStatus = (status) => {
		if (status === -1) {
			setSearchList(null);
		} else {
			const list = serviceList.filter((service) => service.status === status);
			setSearchList(list);
		}
	};

	//XỬ LÝ LỌC DỊCH VỤ THEO DANH MỤC
	const handleFilterByCategory = (category_id) => {
		if (category_id === -1) {
			setSearchList(null);
		} else {
			const list = serviceList.filter(
				(service) => service.Category.category_id === category_id,
			);
			setSearchList(list);
		}
	};

	//XỬ LÝ TÌM DỊCH VỤ THEO MÃ/TÊN
	const handleSearchByInfo = () => {
		if (keyword) {
			let list;
			if (keyword.length === 10 && keyword.toLowerCase().slice(0, 2) === 'dv') {
				list = serviceList.filter((service) => {
					return service.service_id === keyword.toLowerCase();
				});
			} else {
				list = serviceList.filter((service) => {
					return service.service_name
						.toLowerCase()
						.includes(keyword.toLowerCase());
				});
			}
			setSearchList(list);
			setKeyword('');
		} else {
			setSearchList(null);
		}
	};

	//XỬ LÝ THÊM MỚI DỊCH VỤ
	const handleCreateService = async (values) => {
		setModalLoading(true);
		const res = await serviceAPI.create({
			category_id: values.category_id,
			service_name: values.service_name,
			price: values.price,
			status: values.status,
		});
		setModalLoading(false);

		const { errCode } = res.data;
		if (errCode === 0) {
			toast.success('Thêm thành công');
			form.resetFields();
			getAllServices();
		} else if (errCode === 2) {
			toast.error('Tên dịch vụ đã tồn tại');
		} else {
			toast.error('Thêm thất bại'); //errCode === 5
		}
	};

	//XỬ LÝ CẬP NHẬT DỊCH VỤ
	const handleUpdateService = async (values) => {
		setModalLoading(true);
		const res = await serviceAPI.update(
			{
				category_id: values.category_id,
				service_name: values.service_name,
				price: values.price,
				status: values.status,
			},
			data.service_id,
		);
		setModalLoading(false);

		const { errCode } = res.data;
		if (errCode === 0) {
			toast.success('Cập nhật thành công');
			dispatch(setData({}));
			getAllServices();
			setIsOpen(false);
		} else if (errCode === 2) {
			toast.error('Tên danh mục đã tồn tại');
		} else {
			toast.error('Cập nhật thất bại'); //errCode === 1 || errCode === 5
		}
	};

	//XỬ LÝ XÓA DỊCH VỤ
	const handleDeleteService = async (record) => {
		setPageLoading(true);
		const res = await serviceAPI.delete(record.service_id);
		setPageLoading(false);

		const { errCode } = res.data;
		if (errCode === 0) {
			toast.success('Xóa thành công');
			getAllServices();
		} else if (errCode === 6) {
			toast.error('Dịch vụ đang được sử dụng');
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
				if (data.service_id) {
					handleUpdateService(values);
				} else {
					handleCreateService(values);
				}
			}
		});
	};

	//XỬ LÝ ENTER
	const handleEnter = (e) => {
		if (e.keyCode === 13) handleSearchByInfo();
	};

	//XỬ LÝ CLICK BUTTON THÊM MỚI
	const handleClickButtonAdd = () => {
		dispatch(setData({}));
		form.setFieldsValue({
			category_id: null,
			service_name: null,
			price: null,
			status: 1,
		});
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
									<span className="text-dark page-title">QUẢN LÝ DỊCH VỤ</span>
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
										<Spin tip="Đang tải..." spinning={modalLoading}>
											<Form
												form={form}
												layout="vertical"
												initialValues={{ status: 1 }}
												onFinish={handleSubmit}
											>
												<div className="row">
													<div className="col-md mt-2">
														<Form.Item
															label="Danh mục"
															name="category_id"
															rules={[
																{
																	required: true,
																	message: 'Danh mục không được rỗng',
																},
															]}
														>
															<Select
																placeholder="Chọn danh mục"
																size="large"
																options={activeCategoryList.map((category) => {
																	return {
																		value: category.category_id,
																		label: CommonUtils.capitalizeEachWord(
																			category.category_name,
																		),
																	};
																})}
															/>
														</Form.Item>
													</div>
												</div>
												<div className="row">
													<div className="col-md mt-2">
														<Form.Item
															label="Tên dịch vụ"
															name="service_name"
															rules={[
																{
																	required: true,
																	message: 'Tên dịch vụ không được rỗng',
																},
															]}
														>
															<Input
																size="large"
																placeholder="Tên danh mục dịch vụ"
															/>
														</Form.Item>
													</div>
												</div>
												<div className="row">
													<div className="col-md mt-2">
														<Form.Item
															label="Đơn giá"
															name="price"
															rules={[
																{
																	required: true,
																	message: 'Đơn giá không được rỗng',
																},
															]}
														>
															<InputNumber
																className="w-100"
																size="large"
																controls={false}
																formatter={(value) =>
																	`${value}`.replace(
																		/\B(?=(\d{3})+(?!\d))/g,
																		',',
																	)
																}
																parser={(value) =>
																	value.replace(/\$\s?|(,*)/g, '')
																}
															/>
														</Form.Item>
													</div>
												</div>
												<div className="row">
													<div className="col-md mt-2">
														<Form.Item label="Trạng thái" name="status">
															<Radio.Group>
																<Radio value={1}>Hoạt động</Radio>
																<Radio value={0}>Ngưng hoạt động</Radio>
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
										<Form.Item label="Tìm theo danh mục">
											<Select
												className="w-100"
												placeholder="Chọn danh mục"
												size="large"
												options={[
													{
														value: -1,
														label: 'Hiển thị tất cả',
														className: 'text-primary',
													},
													...categoryList.map((category) => {
														return {
															value: category.category_id,
															label: CommonUtils.capitalizeEachWord(
																category.category_name,
															),
														};
													}),
												]}
												onChange={(value) => handleFilterByCategory(value)}
											/>
										</Form.Item>
									</div>
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
														value: 1,
														label: 'Đang hoạt động',
													},
													{
														value: 0,
														label: 'Ngưng hoạt động',
													},
												]}
												onChange={(value) => handleFilterByStatus(value)}
											/>
										</Form.Item>
									</div>
									<div className="col-md-4">
										<Form.Item label="Tìm theo mã/tên">
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
											list={searchList ? searchList : serviceList}
											handleDelete={handleDeleteService}
											isLoading={pageLoading}
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
