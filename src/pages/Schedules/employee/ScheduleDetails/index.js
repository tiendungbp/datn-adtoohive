import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Spin } from 'antd';
import { Vertical } from '../../../../utils/AnimatedPage';
import moment from 'moment';
import DataTable from '../../../../components/DataTable';
import scheduleAPI from '../../../../services/scheduleAPI';

export default function ScheduleDetails() {
	//KHAI BÁO BIẾN
	const navigate = useNavigate();
	const user_id = useSelector((state) => state.user.user.user_id);
	const { date } = useParams();
	const [scheduleList, setScheduleList] = useState([]);
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	//ĐỊNH DẠNG DATATABLE
	const columns = [
		{
			title: 'STT',
			dataIndex: 'schedule_id',
			align: 'center',
			key: (obj) => obj.schedule_id,
			render: (text, record, index) => index + 1,
		},
		{
			title: 'Ngày làm việc',
			dataIndex: 'date',
			align: 'center',
			render: (date) => moment(date).format('DD-MM-YYYY'),
		},
		{
			title: 'Ca khám',
			align: 'center',
			render: (obj) => obj.Session.time,
		},
		{
			title: 'Trạng thái duyệt',
			render: (obj) =>
				obj.UserSchedule.status ? (
					<span className="text-success">Đã duyệt</span>
				) : (
					<span className="text-danger">Chưa duyệt</span>
				),
		},
		{
			title: 'Trạng thái đặt lịch',
			hidden: true,
			render: (obj) =>
				obj.UserSchedule.status === 2 ? (
					<span className="text-success">Đã có lịch hẹn</span>
				) : obj.UserSchedule.status === 1 ? (
					<span className="text-danger">Còn trống</span>
				) : (
					''
				),
		},
		{
			title: 'Ngày tạo',
			align: 'center',
			render: (obj) => moment(obj.UserSchedule.createdAt).format('DD-MM-YYYY'),
		},
	];

	//CALL API
	useEffect(() => {
		getUserSchedulesByDate();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	//XỬ LÝ LẤY LỊCH LÀM VIỆC CỦA NHÂN VIÊN THEO NGÀY
	const getUserSchedulesByDate = async () => {
		setIsLoading(true);
		const res = await scheduleAPI.getUserSchedulesByDate(user_id, date);
		if (res.data.errCode === 0) {
			setUser(res.data.data.user);
			setScheduleList(res.data.data.schedules);
			setIsLoading(false);
		} else {
			//errCode === 1
			navigate('/lich-lam-viec');
		}
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
											to="/lich-lam-viec"
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
											Lịch làm việc {moment(date).format('DD-MM-YYYY')}
										</h5>
									</div>
								</div>
								<div className="row">
									<div className="col-md d-flex flex-wrap">
										<div className="me-3 mb-3">
											{user && user.avatar ? (
												<img
													className="user-avatar rounded"
													src={user.avatar}
													alt=""
												/>
											) : (
												<div className="user-avatar border border-1 d-flex justify-content-center align-items-center rounded">
													<small>Chưa có ảnh</small>
												</div>
											)}
										</div>
										<div className="me-5 mb-3 d-flex">
											<div className="me-4">
												<p>
													<b>Mã nhân viên</b>
												</p>
												<p>
													<b>Họ và tên</b>
												</p>
												<p>
													<b>Ngày sinh</b>
												</p>
												<p>
													<b>Giới tính</b>
												</p>
											</div>
											<div>
												<p>{user ? user.user_id.toUpperCase() : ''}</p>
												<p>{user ? user.fullname : ''}</p>
												<p>
													{user ? moment(user.dob).format('DD-MM-YYYY') : ''}
												</p>
												<p>{user ? (user.gender ? 'Nam' : 'Nữ') : ''}</p>
											</div>
										</div>
									</div>
								</div>
								<div className="row">
									<div className="col-md">
										<div className="table-responsive mt-3">
											<DataTable
												columns={
													user_id.slice(0, 2) === 'bs'
														? columns
														: columns.filter((item) => !item.hidden)
												}
												list={scheduleList}
												isLoading={isLoading}
												isSchedulePage={true}
												bordered
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
