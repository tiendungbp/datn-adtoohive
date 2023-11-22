import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faUser,
	faList,
	faCalendarAlt,
	faFileInvoiceDollar,
	faChartBar,
	faUserCog,
} from '@fortawesome/free-solid-svg-icons';
import employeeAPI from '../../services/employeeAPI';
import doctorAPI from '../../services/doctorAPI';

export default function Sidebar() {
	//KHAI BÁO BIẾN
	const [user, setUser] = useState(null);
	const togglerStatus = useSelector((state) => state.togglerStatus);
	const user_id = useSelector((state) => state.user.user.user_id);
	const prefix = user_id.slice(0, 2);

	//CALL API
	useEffect(() => {
		if (user_id) getUserByID();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	//XỬ LÝ LẤY NHÂN VIÊN BẰNG ID
	const getUserByID = async () => {
		let res;
		switch (prefix) {
			case 'qt':
			case 'lt':
			case 'pt':
				res = await employeeAPI.getByID(user_id);
				if (res.data.errCode === 0) {
					const { employee_id, ...employeeInfo } = res.data.data;
					setUser({ ...employeeInfo, user_id: employee_id });
				}
				break;
			case 'bs':
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

	return (
		<div className={`sidebar pe-4 pb-3 ${togglerStatus ? 'open' : ''}`}>
			<nav className="navbar bg-secondary navbar-dark">
				<Link to="/" className="navbar-brand mx-4 mb-3">
					<h3 className="text-primary">Toothhive</h3>
				</Link>
				<div className="d-flex align-items-center ms-4 mb-4">
					<div className="position-relative">
						<img
							className="rounded-circle"
							src={
								user && user.avatar
									? user.avatar
									: 'https://cdn.landesa.org/wp-content/uploads/default-user-image.png'
							}
							alt=""
							style={{ width: '40px', height: '40px' }}
						/>
						<div className="bg-success rounded-circle border border-2 border-white position-absolute end-0 bottom-0 p-1"></div>
					</div>
					<div className="ms-3">
						<h6 className="mb-0 text-dark">
							{prefix === 'qt'
								? 'Quản trị viên'
								: prefix === 'lt'
								? 'Lễ tân'
								: prefix === 'bs'
								? 'Bác sĩ'
								: 'Phụ tá'}
						</h6>
						<span>{user ? user.fullname : ''}</span>
					</div>
				</div>
				<div className="navbar-nav w-100">
					<NavLink to="/tai-khoan" className="nav-item nav-link">
						<i className="me-2">
							<FontAwesomeIcon icon={faUserCog} />
						</i>
						Tài khoản
					</NavLink>
					<hr />
					{prefix === 'qt' ? (
						<>
							<NavLink to="/" className="nav-item nav-link">
								<i className="me-2">
									<FontAwesomeIcon icon={faChartBar} />
								</i>
								Thống kê
							</NavLink>
							<NavLink to="/nhan-vien" className="nav-item nav-link">
								<i className="me-2">
									<FontAwesomeIcon icon={faUser} />
								</i>
								Nhân viên
							</NavLink>
						</>
					) : (
						<></>
					)}
					{prefix === 'qt' || prefix === 'lt' || prefix === 'bs' ? (
						<NavLink to="/benh-nhan" className="nav-item nav-link">
							<i className="me-2">
								<FontAwesomeIcon icon={faUser} />
							</i>
							Bệnh nhân
						</NavLink>
					) : (
						<></>
					)}
					{prefix === 'qt' ? (
						<>
							<NavLink to="/danh-muc" className="nav-item nav-link">
								<i className="me-2">
									<FontAwesomeIcon icon={faList} />
								</i>
								Danh mục
							</NavLink>
							<NavLink to="/dich-vu" className="nav-item nav-link">
								<i className="me-2">
									<FontAwesomeIcon icon={faList} />
								</i>
								Dịch vụ
							</NavLink>
							<NavLink to="/ca-kham" className="nav-item nav-link">
								<i className="me-2">
									<FontAwesomeIcon icon={faList} />
								</i>
								Ca khám
							</NavLink>
						</>
					) : (
						<></>
					)}
					<NavLink to="/lich-lam-viec" className="nav-item nav-link">
						<i className="me-2">
							<FontAwesomeIcon icon={faCalendarAlt} />
						</i>
						Lịch làm việc
					</NavLink>
					{prefix === 'lt' || prefix === 'bs' ? (
						<NavLink to="/lich-hen" className="nav-item nav-link">
							<i className="me-2">
								<FontAwesomeIcon icon={faCalendarAlt} />
							</i>
							Lịch hẹn
						</NavLink>
					) : (
						<></>
					)}
					{prefix === 'lt' ? (
						<>
							<NavLink to="/hoa-don" className="nav-item nav-link">
								<i className="me-2">
									<FontAwesomeIcon icon={faFileInvoiceDollar} />
								</i>
								Hóa đơn
							</NavLink>
							<NavLink to="/nfc" className="nav-item nav-link">
								<i className="me-2">
									<FontAwesomeIcon icon={faFileInvoiceDollar} />
								</i>
								NFC
							</NavLink>
						</>
					) : (
						<></>
					)}
				</div>
			</nav>
		</div>
	);
}
