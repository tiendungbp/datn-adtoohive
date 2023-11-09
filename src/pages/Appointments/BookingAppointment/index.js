import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Spin, Select, Form, DatePicker } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Vertical } from '../../../utils/AnimatedPage';
import dayjs from 'dayjs';
import moment from 'moment';
import CommonUtils from '../../../utils/commonUtils';
import DoctorCard from '../../../components/DoctorCard';
import categoryAPI from '../../../services/categoryAPI';
import sessionAPI from '../../../services/sessionAPI';
import scheduleAPI from '../../../services/scheduleAPI';
import patientAPI from '../../../services/patientAPI';

export default function BookingAppointment() {
	//KHAI BÁO BIẾN
	const navigate = useNavigate();
	const { patient_id } = useParams();
	const [isLoading, setIsLoading] = useState(false);

	//DỮ LIỆU TỪ API
	const [categoryList, setCategoryList] = useState([]);
	const [sessionList, setSessionList] = useState([]);
	const [scheduleList, setScheduleList] = useState([]);

	//CHỌN DANH MỤC, NGÀY HẸN, CA KHÁM
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [selectedDate, setSelectedDate] = useState(null);
	const [selectedSession, setSelectedSession] = useState(null);

	//CALL API
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		getPatientByID();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	//THAY ĐỔI SELECT
	useEffect(() => {
		if (
			(!selectedCategory &&
				(selectedDate !== null || selectedDate !== 'Invalid Date') &&
				selectedSession) ||
			(selectedCategory && selectedDate !== 'Invalid Date' && selectedSession)
		) {
			getAllByCategoryDateSession();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedCategory, selectedDate, selectedSession]);

	//XỬ LÝ LẤY BỆNH NHÂN THEO ID
	const getPatientByID = async () => {
		const res = await patientAPI.getByID(patient_id);
		if (res.data.errCode === 0) {
			getActiveCategories();
			getActiveSessions();
		} else {
			navigate('/lich-hen/dat-lich-hen');
		}
	};

	//XỬ LÝ LẤY TẤT CẢ DANH MỤC ĐANG HOẠT ĐỘNG
	const getActiveCategories = async () => {
		setIsLoading(true);
		const res = await categoryAPI.getActive();
		setCategoryList(res.data.data);
		setIsLoading(false);
	};

	//XỬ LÝ LẤY TẤT CẢ CA KHÁM ĐANG HOẠT ĐỘNG
	const getActiveSessions = async () => {
		setIsLoading(true);
		const res = await sessionAPI.getActive();
		setSessionList(res.data.data);
		setIsLoading(false);
	};

	//XỬ LÝ LẤY DANH SÁCH CÁC BÁC SĨ THEO DANH MỤC, NGÀY LÀM VIỆC, CA KHÁM
	const getAllByCategoryDateSession = async () => {
		setIsLoading(true);
		const res = await scheduleAPI.getAllByCategoryDateSession({
			category_id: selectedCategory,
			date: selectedDate,
			session_id: selectedSession,
		});
		if (res.data.errCode === 0) {
			setScheduleList(res.data.data);
		} else {
			setScheduleList([]);
		}
		setIsLoading(false);
	};

	//XỬ LÝ CHỌN NGÀY
	const handleChooseDate = (date) => {
		const newDate = new Date();
		const formattedDate = dayjs(date).format('YYYY-MM-DD');
		const currentDate = moment(newDate).format('YYYY-MM-DD');

		if (formattedDate === currentDate) {
			const currentTime = CommonUtils.getCurrentTime();
			setSessionList(
				sessionList.filter((session) => {
					return session.time.slice(0, 5) >= currentTime;
				}),
			);
			setSelectedDate(formattedDate);
		} else {
			getActiveSessions();
			setSelectedDate(formattedDate);
		}
	};

	return (
		<Vertical>
			<Spin tip="Đang tải..." spinning={isLoading}>
				<div className="container-fluid pt-4">
					<div className="row bg-light rounded mx-0 mb-4">
						<div className="col-md">
							<div className="rounded p-4 bg-secondary mb-5">
								<div className="row mb-3">
									<div className="col-md">
										<Link
											to="/lich-hen/dat-lich-hen"
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
											Đặt lịch hẹn
										</h5>
									</div>
								</div>
								<div className="row">
									<div className="col-md">
										<Form layout="vertical">
											<div className="row">
												<div className="col-md-4 mt-2">
													<Form.Item label="Danh mục" name="category_id">
														<Select
															size="large"
															className="w-100"
															placeholder="Chọn danh mục"
															options={categoryList.map((category) => {
																return {
																	value: category.category_id,
																	label: CommonUtils.capitalizeEachWord(
																		category.category_name,
																	),
																};
															})}
															onChange={(value) => setSelectedCategory(value)}
														/>
													</Form.Item>
												</div>
												<div className="col-md-4 mt-2">
													<Form.Item label="Ngày hẹn" name="date">
														<DatePicker
															size="large"
															placeholder="Ngày làm việc"
															disabled={selectedCategory ? false : true}
															format="DD-MM-YYYY"
															disabledDate={(current) =>
																current.isBefore(moment().subtract(1, 'day'))
															}
															onChange={(value) => handleChooseDate(value)}
														/>
													</Form.Item>
												</div>
												<div className="col-md-4 mt-2">
													<Form.Item label="Ca khám" name="session_id">
														<Select
															size="large"
															className="w-100"
															placeholder="Chọn ca khám"
															disabled={selectedDate ? false : true}
															options={sessionList.map((session) => {
																return {
																	value: session.session_id,
																	label: session.time,
																};
															})}
															onChange={(value) => setSelectedSession(value)}
														/>
													</Form.Item>
												</div>
											</div>
										</Form>
									</div>
								</div>
							</div>
							<div className="rounded">
								<div className="row">
									<div className="col-md">
										{scheduleList.map((item, index) => {
											return (
												<DoctorCard
													key={index}
													doctor={item.doctor}
													scheduleList={item.schedules}
													date={selectedDate}
													getAllByCategoryDateSession={
														getAllByCategoryDateSession
													}
												/>
											);
										})}
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
