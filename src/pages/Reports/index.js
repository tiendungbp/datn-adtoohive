import './index.scss';
import { useState, useEffect } from 'react';
import { Card, Divider, DatePicker, Button, Spin, Alert } from 'antd';
import { Vertical } from '../../utils/AnimatedPage';
import { Bar, Pie } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
} from 'chart.js';
import moment from 'moment';
import fileDownload from 'js-file-download';
import toast from 'react-hot-toast';
import reportAPI from '../../services/reportAPI';
import CommonUtils from '../../utils/commonUtils';

export default function Report() {
	//ĐỊNH DẠNG BIỂU ĐỒ
	ChartJS.register(
		CategoryScale,
		LinearScale,
		BarElement,
		Title,
		Tooltip,
		Legend,
		ArcElement,
	);
	const options = {
		responsive: true,
		plugins: {
			legend: {
				position: 'top',
			},
		},
	};

	//LOADING, DỮ LIỆU TỪ API
	const [pageLoading, setPageLoading] = useState(false);
	const [currentRevenue, setCurrentRevenue] = useState({});
	const [currentAppointment, setCurrentAppointment] = useState({});
	const [currentPatient, setCurrentPatient] = useState({});
	const [serviceList, setServiceList] = useState([]);
	const [appointmentList, setAppointmentList] = useState([]);
	const [billList, setBillList] = useState([]);

	//BIẾN CHỌN THÁNG CỦA MỖI THỐNG KÊ
	const [monthSchedule, setMonthSchedule] = useState('');
	const [monthService, setMonthService] = useState('');
	const [monthAppointment, setMonthAppointment] = useState('');
	const [monthRevenue, setMonthRevenue] = useState('');

	//CALL API
	useEffect(() => {
		getCurrentRevenue();
		getCurrentAppointment();
		getCurrentPatient();
		getServicesFor7Days();
		getAppointmentsFor7Days();
		getRevenueFor7Days();
	}, []);

	//XỬ LÝ LẤY DOANH THU CỦA NGÀY HIỆN TẠI
	const getCurrentRevenue = async () => {
		setPageLoading(true);
		const res = await reportAPI.getCurrentRevenue();
		setCurrentRevenue(res.data.data);
		setPageLoading(false);
	};

	//XỬ LÝ LẤY SỐ LỊCH HẸN CỦA NGÀY HIỆN TẠI
	const getCurrentAppointment = async () => {
		setPageLoading(true);
		const res = await reportAPI.getCurrentAppointment();
		setCurrentAppointment(res.data.data);
		setPageLoading(false);
	};

	//XỬ LÝ LẤY SỐ BỆNH NHÂN MỚI CỦA NGÀY HIỆN TẠI
	const getCurrentPatient = async () => {
		setPageLoading(true);
		const res = await reportAPI.getCurrentPatient();
		setCurrentPatient(res.data.data);
		setPageLoading(false);
	};

	//XỬ LÝ LẤY SỐ LIỆU DỊCH VỤ TRONG 7 NGÀY QUA
	const getServicesFor7Days = async () => {
		setPageLoading(true);
		const res = await reportAPI.getServicesFor7Days();
		setServiceList(res.data.data);
		setPageLoading(false);
	};

	//XỬ LÝ LẤY SỐ LIỆU LỊCH HẸN TRONG 7 NGÀY QUA
	const getAppointmentsFor7Days = async () => {
		setPageLoading(true);
		const res = await reportAPI.getAppointmentsFor7Days();
		setAppointmentList(res.data.data);
		setPageLoading(false);
	};

	//XỬ LÝ LẤY SỐ LIỆU DOANH THU TRONG 7 NGÀY QUA
	const getRevenueFor7Days = async () => {
		setPageLoading(true);
		const res = await reportAPI.getRevenueFor7Days();
		setBillList(res.data.data);
		setPageLoading(false);
	};

	//HIỂN THỊ DỮ LIỆU LÊN BIỂU ĐỒ DỊCH VỤ
	const serviceData = {
		labels: serviceList.map((s) =>
			CommonUtils.capitalizeEachWord(s.Service.service_name),
		),
		datasets: [
			{
				label: 'Lượt dùng',
				data: serviceList.map((service) => service.times),
				backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
					'rgba(54, 162, 235, 0.2)',
					'rgba(255, 206, 86, 0.2)',
					'rgba(75, 192, 192, 0.2)',
					'rgba(153, 102, 255, 0.2)',
					'rgba(255, 159, 64, 0.2)',
				],
				borderColor: [
					'rgba(255, 99, 132, 1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(153, 102, 255, 1)',
					'rgba(255, 159, 64, 1)',
				],
				borderWidth: 1,
			},
		],
	};

	//HIỂN THỊ DỮ LIỆU LÊN BIỂU ĐỒ LỊCH HẸN
	const appointmentData = {
		labels: appointmentList.map((appointment) =>
			moment(appointment.date).format('DD/MM'),
		),
		datasets: [
			{
				label: 'Đặt mới',
				data: appointmentList.map(
					(appointmentByDate) => appointmentByDate.new.length,
				),
				backgroundColor: 'rgba(53, 162, 235, 0.5)',
			},
			{
				label: 'Tái khám',
				data: appointmentList.map(
					(appointmentByDate) => appointmentByDate.reExam.length,
				),
				backgroundColor: 'rgba(255, 99, 132, 0.5)',
			},
		],
	};

	//HIỂN THỊ DỮ LIỆU LÊN BIỂU ĐỒ DOANH THU
	const revenueData = {
		labels: billList.map((bill) => moment(bill.date).format('DD/MM')),
		datasets: [
			{
				label: 'Doanh thu',
				data: billList.map((bill) => bill.total),
				backgroundColor: 'rgba(255, 99, 132, 0.5)',
			},
		],
	};

	//XUẤT FILE EXCEL LỊCH LÀM VIỆC THEO THÁNG
	const handleGetReportScheduleByMonth = async () => {
		if (monthSchedule) {
			setPageLoading(true);
			const res = await reportAPI.getReportScheduleByMonth({
				month: moment(monthSchedule).format('M'),
				year: moment(monthSchedule).format('YYYY'),
			});
			fileDownload(
				res.data,
				`LichLamViec_${moment(monthSchedule).format('MM-YYYY')}.xlsx`,
			);
			setMonthSchedule('');
			setPageLoading(false);
		} else {
			toast.error('Bạn chưa chọn tháng');
		}
	};

	//XUẤT FILE EXCEL DỊCH VỤ ĐƯỢC SỬ DỤNG THEO THÁNG
	const handleGetReportServiceByMonth = async () => {
		if (monthService) {
			setPageLoading(true);
			const res = await reportAPI.getReportServiceByMonth(monthService);
			fileDownload(
				res.data,
				`DichVu_${moment(monthService).format('MM-YYYY')}.xlsx`,
			);
			setMonthService('');
			setPageLoading(false);
		} else {
			toast.error('Bạn chưa chọn tháng');
		}
	};

	//XUẤT FILE EXCEL LỊCH HẸN THEO THÁNG
	const handleGetReportAppointmentByMonth = async () => {
		if (monthAppointment) {
			setPageLoading(true);
			const res = await reportAPI.getReportAppointmentByMonth({
				month: moment(monthAppointment).format('M'),
				year: moment(monthAppointment).format('YYYY'),
			});
			fileDownload(
				res.data,
				`LichHen_${moment(monthAppointment).format('MM-YYYY')}.xlsx`,
			);
			setMonthAppointment('');
			setPageLoading(false);
		} else {
			toast.error('Bạn chưa chọn tháng');
		}
	};

	//XUẤT FILE EXCEL DOANH THU THEO THÁNG
	const handleGetReportRevenueByMonth = async () => {
		if (monthRevenue) {
			setPageLoading(true);
			const res = await reportAPI.getReportRevenueByMonth({
				month: moment(monthRevenue).format('M'),
				year: moment(monthRevenue).format('YYYY'),
			});
			fileDownload(
				res.data,
				`DoanhThu_${moment(monthRevenue).format('MM-YYYY')}.xlsx`,
			);
			setMonthRevenue('');
			setPageLoading(false);
		} else {
			toast.error('Bạn chưa chọn tháng');
		}
	};

	return (
		<Vertical>
			<Spin tip="Đang tải..." spinning={pageLoading}>
				<div className="container-fluid pt-4">
					<div className="row bg-light rounded mx-0 mb-4">
						<div className="col-md">
							<div className="row mb-4">
								<div className="col-md-4">
									<Card
										title={`DOANH THU - ${
											currentRevenue.date ? currentRevenue.date : ''
										}`}
										style={{ backgroundColor: 'rgba(53, 162, 235, 0.5)' }}
									>
										<h3 className="text-white">
											{CommonUtils.VND.format(currentRevenue.total)}
										</h3>
									</Card>
								</div>
								<div className="col-md-4">
									<Card
										title={`LỊCH HẸN MỚI - ${
											currentAppointment.date ? currentAppointment.date : ''
										}`}
										style={{ backgroundColor: 'rgba(255, 99, 132, 0.5)' }}
									>
										<h3 className="text-white">{currentAppointment.total}</h3>
									</Card>
								</div>
								<div className="col-md-4">
									<Card
										title={`BỆNH NHÂN MỚI - ${
											currentPatient.date ? currentPatient.date : ''
										}`}
										style={{ backgroundColor: 'rgba(53, 162, 235, 0.5)' }}
									>
										<h3 className="text-white">{currentPatient.total}</h3>
									</Card>
								</div>
							</div>
							<div className="row mb-4">
								<div className="col-md-6">
									<Card>
										<h5 className="text-dark mb-4">Thống kê doanh thu</h5>
										<div className="row">
											<div className="col-md">
												<div className="d-flex">
													<DatePicker
														picker="month"
														size="large"
														placeholder="Chọn tháng"
														onChange={(e) => {
															setMonthRevenue(moment(e?.$d).format('YYYY-MM'));
														}}
														format="MM-YYYY"
														disabledDate={(current) =>
															moment().add(0, 'month') < current
														}
													/>
													<Button
														className="ms-3"
														onClick={handleGetReportRevenueByMonth}
													>
														Xuất excel
													</Button>
												</div>
											</div>
										</div>
										<Divider />
										<Bar options={options} data={revenueData} />
									</Card>
								</div>
								<div className="col-md-6">
									<Card>
										<h5 className="text-dark mb-4">Thống kê lịch hẹn</h5>
										<div className="row">
											<div className="col-md">
												<div className="d-flex">
													<DatePicker
														picker="month"
														size="large"
														placeholder="Chọn tháng"
														onChange={(e) => {
															setMonthAppointment(
																moment(e?.$d).format('YYYY-MM'),
															);
														}}
														format="MM-YYYY"
													/>
													<Button
														className="ms-3"
														onClick={handleGetReportAppointmentByMonth}
													>
														Xuất excel
													</Button>
												</div>
											</div>
										</div>
										<Divider />
										<Bar options={options} data={appointmentData} />
									</Card>
								</div>
							</div>
							<div className="row">
								<div className="col-md-6">
									<Card>
										<h5 className="text-dark mb-4">Thống kê dịch vụ</h5>
										<div className="row">
											<div className="col-md">
												<div className="d-flex">
													<DatePicker
														picker="month"
														size="large"
														placeholder="Chọn tháng"
														onChange={(e) => {
															setMonthService(moment(e?.$d).format('YYYY-MM'));
														}}
														format="MM-YYYY"
														disabledDate={(current) =>
															moment().add(0, 'month') < current
														}
													/>
													<Button
														className="ms-3"
														onClick={handleGetReportServiceByMonth}
													>
														Xuất excel
													</Button>
												</div>
											</div>
										</div>
										<Divider />
										<Pie options={options} data={serviceData} />
									</Card>
								</div>
								<div className="col-md-6">
									<Card>
										<h5 className="text-dark mb-4">Thống kê lịch làm việc</h5>
										<div className="row">
											<div className="col-md">
												<div className="d-flex">
													<DatePicker
														picker="month"
														size="large"
														placeholder="Chọn tháng"
														onChange={(e) => {
															setMonthSchedule(moment(e?.$d).format('YYYY-MM'));
														}}
														format="MM-YYYY"
													/>
													<Button
														className="ms-3"
														onClick={handleGetReportScheduleByMonth}
													>
														Xuất excel
													</Button>
												</div>
											</div>
										</div>
										<Divider />
										<Alert
											type="warning"
											showIcon
											message="Không có biểu đồ xem trước, xuất file để xem thống kê"
										/>
									</Card>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Spin>
		</Vertical>
	);
}
