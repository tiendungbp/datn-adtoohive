import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import io from "socket.io-client";
import Dropdown from 'react-bootstrap/Dropdown';

const socket = io.connect(process.env.REACT_APP_API_URL);

export default function Notification() {

    const [notificationList, setNotificationList] = useState([]);

    useEffect(() => {
        socket.on("new_appointment", data => {
            setNotificationList(list => [...list, data]);
        });
    }, [socket]);

    return (
        <Dropdown>
            <Dropdown.Toggle variant="white" className="text-dark d-flex" id="dropdown-basic">
                <i className="me-2 rounded-circle"><FontAwesomeIcon icon={faBell}/></i>
                Thông báo <span className="notification-counter">{notificationList.length ? notificationList.length : ""}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu className="border-top-0">
                {
                    notificationList.length
                    ?
                    notificationList.map((data, index) => {
                        return (
                            <Dropdown.Item key={index}>
                                <Link
                                    to={"/lich-hen"}
                                    onClick={() => {
                                        setNotificationList(notificationList.filter(notification => {
                                            return notification.appointment_id !== data.appointment_id
                                        }))
                                    }}
                                >
                                    <div className="d-flex align-items-center px-3">
                                        <div>
                                            <span className="text-dark">{data.fullname}</span><br/>
                                            <span className="text-danger">{data.message}</span><br/>
                                        </div>
                                    </div>
                                </Link>
                                <hr className="dropdown-divider"/>
                            </Dropdown.Item>
                        )
                    })
                    :
                    <small className="ms-2">Chưa có thông báo</small>
                }
            </Dropdown.Menu>
        </Dropdown>
    );
};