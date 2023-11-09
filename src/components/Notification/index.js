import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import Dropdown from 'react-bootstrap/Dropdown';

// const socket = io.connect(process.env.REACT_APP_API_URL);

export default function Notification() {
	const [notificationList] = useState([]);
	return (
		<Dropdown>
			<Dropdown.Toggle
				variant="white"
				className="text-dark d-flex"
				id="dropdown-basic"
			>
				<i className="me-2 rounded-circle">
					<FontAwesomeIcon icon={faBell} />
				</i>
				Thông báo{' '}
				<span className="notification-counter">
					{notificationList.length ? notificationList.length : ''}
				</span>
			</Dropdown.Toggle>
			<Dropdown.Menu className="border-top-0">
				{notificationList.length ? (
					notificationList.map((data, index) => {
						return (
							<Dropdown.Item key={index}>
								<div className="d-flex align-items-center px-3">
									<img
										className="rounded-circle"
										src={data.avatar}
										alt=""
										style={{ width: '40px', height: '40px' }}
									/>
									<div className="ms-2">
										<span>{data.message}</span>
										<br />
										<small>
											{new Date().getMinutes() - data.time} phút trước
										</small>
									</div>
								</div>
								<hr className="dropdown-divider" />
							</Dropdown.Item>
						);
					})
				) : (
					<span>Chưa có thông báo</span>
				)}
			</Dropdown.Menu>
			
		</Dropdown>
	);
}
