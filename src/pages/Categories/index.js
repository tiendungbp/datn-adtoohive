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

export default function Categories() {
	//KHAI BÁO BIẾN
	const dispatch = useDispatch();
	const [categoryList, setCategoryList] = useState([]);
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
				status === 1 ? (
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
	}, [categoryList]);

	//XỬ LÝ LẤY TẤT CẢ DANH MỤC
	const getAllCategories = async () => {
		setPageLoading(true);
		const res = await categoryAPI.getAll();
		setCategoryList(res.data.data);
		setPageLoading(false);
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

	//XỬ LÝ TÌM DANH MỤC THEO MÃ/TÊN
	const handleSearchByInfo = () => {
		if (keyword) {
			let list;
			if (keyword.length === 10 && keyword.toLowerCase().slice(0, 2) === 'ct') {
				list = categoryList.filter((category) => {
					return category.category_id === keyword.toLowerCase();
				});
			} else {
				list = categoryList.filter((category) => {
					return category.category_name.includes(keyword.toLowerCase());
				});
			}
			setSearchList(list);
			setKeyword('');
		} else {
			setSearchList(null);
		}
	};

	//XỬ LÝ THÊM MỚI DANH MỤC
	const handleCreateCategory = async (values) => {
		setModalLoading(true);
		const res = await categoryAPI.create({
			category_name: values.category_name,
			status: values.status,
		});
		setModalLoading(false);

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
	};

	//XỬ LÝ CẬP NHẬT DANH MỤC
	const handleUpdateCategory = async (values) => {
		setModalLoading(true);
		const res = await categoryAPI.update(
			{
				category_name: values.category_name,
				status: values.status,
			},
			data.category_id,
		);
		setModalLoading(false);

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
	};

	//XỬ LÝ XÓA DANH MỤC
	const handleDeleteCategory = async (record) => {
		setPageLoading(true);
		const res = await categoryAPI.delete(record.category_id);
		setPageLoading(false);

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
		if (e.keyCode === 13) handleSearchByInfo();
	};

	//XỬ LÝ CLICK BUTTON THÊM MỚI
	const handleClickButtonAdd = () => {
		dispatch(setData({}));
		form.setFieldsValue({ category_name: null, status: 1 });
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
											list={searchList ? searchList : categoryList}
											handleDelete={handleDeleteCategory}
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
