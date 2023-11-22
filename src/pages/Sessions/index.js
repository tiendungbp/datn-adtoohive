import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Select, Modal, Form, Radio, Spin, TimePicker } from 'antd';
import { setData } from '../../slices/dataSlice';
import { Vertical } from '../../utils/AnimatedPage';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import sessionAPI from '../../services/sessionAPI';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import moment from 'moment';

export default function Categories() {
	//KHAI BÁO BIẾN
	const dispatch = useDispatch();
	const [sessionList, setSessionList] = useState([]);
	const [isOpen, setIsOpen] = useState(false);
	const [pageLoading, setPageLoading] = useState(false);
	const [modalLoading, setModalLoading] = useState(false);
	const [searchList, setSearchList] = useState(null);
	const [form] = Form.useForm();
	const data = useSelector((state) => state.data);

	//ĐỊNH DẠNG DATATABLE
	const columns = [
		{
			title: 'Mã ca khám',
			dataIndex: 'session_id',
			align: 'center',
			render: (session_id) => session_id.toUpperCase(),
		},
		{
			title: 'Thời gian',
			dataIndex: 'time',
			align: 'center',
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
		if (data.session_id) {
			form.setFieldsValue({
				start: dayjs(data.time.slice(0, 5), 'HH:mm'),
				end: dayjs(data.time.slice(8, 13), 'HH:mm'),
				status: data.status,
			});
			setIsOpen(true);
		}
		getAllSessions();
	}, [data, form]);

	//NẾU SỬA KHI ĐANG CÓ SEARCH LIST THÌ UPDATE LẠI SEARCH LIST
	useEffect(() => {
		if (searchList) {
			let list = [];
			searchList.forEach((searchItem) => {
				const a = sessionList.find((session) => {
					return session.session_id === searchItem.session_id;
				});
				if (a) list.push(a);
			});
			setSearchList(list);
		}
	}, [sessionList]);

	//XỬ LÝ LẤY TẤT CẢ CA KHÁM
	const getAllSessions = async () => {
		setPageLoading(true);
		const res = await sessionAPI.getAll();
		setSessionList(res.data.data);
		setPageLoading(false);
	};

	//XỬ LÝ LỌC CA KHÁM THEO TRẠNG THÁI
	const handleFilterByStatus = (status) => {
		if (status === -1) {
			setSearchList(null);
		} else {
			const list = sessionList.filter((session) => session.status === status);
			setSearchList(list);
		}
	};

	//XỬ LÝ LỌC CA KHÁM THEO THỜI GIAN BẮT ĐẦU
	const handleFilterByStart = (value) => {
		if (value) {
			const start = value.$d.toTimeString().slice(0, 5);
			const list = sessionList.filter(
				(session) => session.time.slice(0, 5) === start,
			);
			setSearchList(list);
		} else {
			setSearchList(null);
		}
	};

	//XỬ LÝ THÊM MỚI CA KHÁM
	const handleCreateSession = async (values) => {
		const start = values.start.$d.toTimeString().slice(0, 5);
		const end = values.end.$d.toTimeString().slice(0, 5);
		const time = `${start} - ${end}`;

		setModalLoading(true);
		const res = await sessionAPI.create({
			time: time,
			status: values.status,
		});
		setModalLoading(false);

		const { errCode } = res.data;
		if (errCode === 0) {
			toast.success('Thêm thành công');
			form.resetFields();
			getAllSessions();
		} else if (errCode === 2) {
			toast.error('Ca khám đã tồn tại');
		} else {
			toast.error('Thêm thất bại'); //errCode === 5
		}
	};

	//XỬ LÝ CẬP NHẬT CA KHÁM
	const handleUpdateSession = async (values) => {
		const start = values.start.$d.toTimeString().slice(0, 5);
		const end = values.end.$d.toTimeString().slice(0, 5);
		const time = `${start} - ${end}`;

		setModalLoading(true);
		const res = await sessionAPI.update(
			{
				time: time,
				status: values.status,
			},
			data.session_id,
		);
		setModalLoading(false);

		const { errCode } = res.data;
		if (errCode === 0) {
			toast.success('Cập nhật thành công');
			dispatch(setData({}));
			getAllSessions();
			setIsOpen(false);
		} else if (errCode === 2) {
			toast.error('Ca khám đã tồn tại');
		} else {
			toast.error('Cập nhật thất bại'); //errCode === 1 || errCode === 5
		}
	};

	//XỬ LÝ XÓA CA KHÁM
	const handleDeleteCategory = async (record) => {
		setPageLoading(true);
		const res = await sessionAPI.delete(record.session_id);
		setPageLoading(false);

		const { errCode } = res.data;
		if (errCode === 0) {
			toast.success('Xóa thành công');
			getAllSessions();
		} else if (errCode === 6) {
			toast.error('Ca khám đang được sử dụng');
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
				if (data.session_id) {
					handleUpdateSession(values);
				} else {
					handleCreateSession(values);
				}
			}
		});
	};

	//XỬ LÝ CLICK BUTTON THÊM MỚI
	const handleClickButtonAdd = () => {
		dispatch(setData({}));
		form.setFieldsValue({
			start: null,
			end: null,
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
									<span className="text-dark page-title">QUẢN LÝ CA KHÁM</span>
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
													<div className="col-md-6 mt-2">
														<Form.Item
															label="Thời gian bắt đầu"
															name="start"
															rules={[
																{
																	required: true,
																	message: 'Thời gian bắt đầu không được rỗng',
																},
															]}
														>
															<TimePicker
																size="large"
																format="HH:mm"
																placeholder="Chọn thời gian"
															/>
														</Form.Item>
													</div>
													<div className="col-md-6 mt-2">
														<Form.Item
															label="Thời gian kết thúc"
															name="end"
															rules={[
																{
																	required: true,
																	message: 'Thời gian kết thúc không được rỗng',
																},
															]}
														>
															<TimePicker
																size="large"
																format="HH:mm"
																placeholder="Chọn thời gian"
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
										<Form.Item label="Tìm theo thời gian bắt đầu">
											<TimePicker
												className="w-100"
												placeholder="Chọn thời gian"
												size="large"
												format="HH:mm"
												onChange={(value) => handleFilterByStart(value)}
											/>
										</Form.Item>
									</div>
								</div>
							</Form>
							<div className="row">
								<div className="col-md">
									<div className="table-responsive">
										<DataTable
											columns={columns}
											list={searchList ? searchList : sessionList}
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
