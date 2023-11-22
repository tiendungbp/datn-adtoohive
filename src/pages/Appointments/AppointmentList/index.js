import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button, DatePicker, Modal, Spin, Form, Input, Select } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faFire } from "@fortawesome/free-solid-svg-icons";
import { Vertical } from "../../../utils/AnimatedPage";
import io from "socket.io-client";
import moment from "moment";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import DataTable from "../../../components/DataTable";
import appointmentAPI from "../../../services/appointmentAPI";
import CommonUtils from "../../../utils/commonUtils";


const socket = io.connect(process.env.REACT_APP_API_URL);
const CustomSwal = withReactContent(Swal);


export default function AppointmentList() {


    //KHỞI TẠO GIÁ TRỊ BAN ĐẦU (RỖNG) CHO STATE APPOINTMENT
    const initAppointment = {
        appointment_id: "",
        type_id: "",
        doctor_schedule_id: "",
        patient_id: "",
        employee_id: "",
        fullname: "",
        dob: "",
        gender: "",
        phone: "",
        status: "",
        createdAt: "",
        updatedAt: "",
        Type: {
            type_id: "",
            type_name: ""
        },
        Patient: {
            patient_id: "",
            fullname: "",
            avatar: "",
            dob: "",
            gender: "",
            phone: "",
            email: ""
        },
        Employee: {
            employee_id: "",
            fullname: "",
            dob: "",
            gender: "",
            phone: ""
        },
        DoctorSchedule: {
            doctor_schedule_id: "",
            doctor_id: "",
            schedule_id: "",
            status: "",
            createdAt: "",
            updatedAt: "",
            Doctor: {
                doctor_id: "",
                fullname: "",
                avatar: "",
                dob: "",
                gender: "",
                phone: "",
                email: ""
            },
            Schedule: {
                schedule_id: "",
                session_id: "",
                date: "",
                createdAt: "",
                updatedAt: "",
                Session: {
                    session_id: "",
                    time: "",
                    status: "",
                    createdAt: "",
                    updatedAt: ""
                }
            }
        }
    };


    //DANH SÁCH LỊCH HẸN, CHỌN 1 LỊCH HẸN
    const [appointmentList, setAppointmentList] = useState([]);
    const [appointment, setAppointment] = useState(initAppointment);


    //TÌM KIẾM
    const [searchList, setSearchList] = useState(null);
    const [patientKeyword, setPatientKeyword] = useState("");
    const [doctorKeyword, setDoctorKeyword] = useState("");


    //LOADING, ĐÓNG MỞ MODAL, ICON LỊCH HẸN MỚI
    const [pageLoading, setPageLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [newAppointment, setNewAppointment] = useState(null); //chứa id của lịch hẹn được duyệt mới


    //THÔNG TIN NHÂN VIÊN ĐANG ĐĂNG NHẬP
    const user_id = useSelector(state => state.user.user.user_id);
    const prefix = user_id.slice(0, 2);


    //ĐỊNH DẠNG DATATABLE
    const detailsPage = "/lich-hen/chi-tiet"
    const columns = [
        {
            title: "Mã lịch hẹn",
            dataIndex: "appointment_id",
            render: appointment_id => appointment_id.toUpperCase()
        },
        {
            title: "Loại",
            render: obj => obj.Type.type_name
        },
        {
            title: "Người đặt",
            render: obj => obj.Patient.fullname
        },
        {
            title: "Người khám",
            render: obj => obj.fullname
        },
        {
            title: "Bác sĩ phụ trách",
            render: obj => obj.DoctorSchedule.Doctor.fullname
        },
        {
            title: "Ngày gửi",
            render: obj => moment(obj.createdAt).format("DD-MM-YYYY")
        },
        {
            title: "Ngày hẹn",
            render: obj => moment(obj.DoctorSchedule.Schedule.date).format("DD-MM-YYYY")
        },
        {
            title: "Ca khám",
            render: obj => obj.DoctorSchedule.Schedule.Session.time
        },
        {
            title: "Trạng thái",
            render: obj => (
                <div>
                    {
                        obj.status === 0 ? <span className="text-danger">Chờ xác nhận</span> :
                        obj.status === 1 ? <span className="text-success">Đã xác nhận</span> :
                        obj.status === 2 ? <span className="text-muted">Đã hủy</span> :
                        obj.status === 3 ? <span className="text-primary">Đã hoàn thành</span> : ""
                    }
                    <FontAwesomeIcon
                        icon={faFire}
                        className="text-danger ms-2"
                        hidden={newAppointment && obj.appointment_id === newAppointment ? false : true}
                    />
                </div>
            )
        },
        {
            title: "Xem",
            dataIndex: "",
            align: "center",
            render: obj => (
                obj.status === 0 || obj.status === 2
                ?
                <Button className="bg-light" onClick={() => {
                    setAppointment(obj);
                    setIsOpen(true);
                    setNewAppointment(null);
                }}>
                    <FontAwesomeIcon icon={faEdit} className="text-dark"/>
                </Button>
                :
                <Link
                    to={`${detailsPage}/${obj.appointment_id}`}
                    onClick={() => setNewAppointment(null)}
                >
                    <Button className="bg-light">
                        <FontAwesomeIcon icon={faEdit} className="text-dark"/>
                    </Button>
                </Link>
            )
        }
    ];


    //CALL API
    useEffect(() => {
        getAllAppointments();
    }, []);


    //UPDATE LẠI MỖI KHI CÓ LỊCH HẸN MỚI/LỊCH HẸN THAY ĐỔI TRẠNG THÁI
    useEffect(() => {
        switch (prefix) {
            case "lt":
                socket.on("new_appointment", data => {
                    setSearchList(null);
                    getAllAppointments();
                });

                socket.on("new_canceled_appointment", data => {
                    setSearchList(null);
                    getAllAppointments();
                });
                break;
            case "bs":
                socket.on("new_accepted_appointment", data => {
                    if(data.doctor_id === user_id) {
                        setSearchList(null);
                        setNewAppointment(data.appointment_id);
                        getAllAppointments();
                    };
                });

                socket.on("new_canceled_appointment", data => {
                    if(data.doctor_id === user_id) {
                        setSearchList(null);
                        getAllAppointments();
                    };
                });
                break;
            default: break;
        };
    }, [socket]);


    //NẾU DUYỆT/HỦY KHI ĐANG CÓ SEARCH LIST THÌ UPDATE LẠI SEARCH LIST
    useEffect(() => {
        if(searchList) {
            let list = [];
            searchList.forEach(searchItem => {
                const a = appointmentList.find(appointment => {
                    return appointment.appointment_id === searchItem.appointment_id;
                });
                if(a) list.push(a);
            });
            setSearchList(list);
        };
    }, [appointmentList]);


    //XỬ LÝ LẤY TẤT CẢ LỊCH HẸN
    const getAllAppointments = async() => {
        setPageLoading(true);
        let res;
        switch (prefix) {
            case "lt":
                res = await appointmentAPI.getAll();
                break;
            case "bs":
                res = await appointmentAPI.getAllByDoctorID(user_id);
                break;
            default: break;
        };
        setAppointmentList(res.data.data);
        setPageLoading(false);
    };


    //XỬ LÝ LỌC LỊCH HẸN THEO TRẠNG THÁI
    const handleFilterByStatus = (status) => {
        if(status === -1) {
            setSearchList(null);
        }
        else {
            const list = appointmentList.filter(appointment => appointment.status === status);
            setSearchList(list);
        };
    };


    //XỬ LÝ TÌM THEO NGÀY HẸN
    const handleSearchByDate = (date) => {
        const list = appointmentList.filter(appointment => {
            return appointment.DoctorSchedule.Schedule.date === date;
        });
        setSearchList(list);
    };


    //XỬ LÝ TÌM THEO THÔNG TIN BỆNH NHÂN / MÃ LỊCH HẸN
    const handleSearchByPatientOrAppointmentID = () => {
        if(patientKeyword) {
            const isPhoneNumber = CommonUtils.checkPhoneNumber(patientKeyword);
            let list;
            if(isPhoneNumber) {
                list = appointmentList.filter(appointment => appointment.phone === patientKeyword);
            }
            else if(patientKeyword.length === 10 && patientKeyword.toLowerCase().slice(0, 2) === "lh") {
                list = appointmentList.filter(appointment => {
                    return appointment.appointment_id === patientKeyword.toLowerCase();
                });
            }
            else {
                list = appointmentList.filter(appointment => {
                    return appointment.fullname.toLowerCase().includes(patientKeyword.toLowerCase());
                });
            };
            setSearchList(list);
            setPatientKeyword("");
        }
        else {
            setSearchList(null);
        };
    };


    //XỬ LÝ TÌM THEO THÔNG TIN BÁC SĨ
    const handleSearchByDoctor = () => {
        if(doctorKeyword) {
            const isPhoneNumber = CommonUtils.checkPhoneNumber(doctorKeyword);
            let list;
            if(isPhoneNumber) {
                list = appointmentList.filter(appointment => {
                    return appointment.DoctorSchedule.Doctor.phone === doctorKeyword;
                });
            }
            else if(doctorKeyword.length === 10 && doctorKeyword.toLowerCase().slice(0, 2) === "bs") {
                list = appointmentList.filter(appointment => {
                    return appointment.DoctorSchedule.doctor_id === doctorKeyword.toLowerCase();
                });
            }
            else {
                list = appointmentList.filter(appointment => {
                    return appointment.DoctorSchedule.Doctor.fullname.toLowerCase().includes(doctorKeyword.toLowerCase());
                });
            };
            setSearchList(list);
            setDoctorKeyword("");
        }
        else {
            setSearchList(null);
        };
    };


    //XỬ LÝ DUYỆT LỊCH HẸN
    const handleAcceptAppointment = () => {
        CustomSwal.fire({
            title: <span>Xác nhận <b className="text-success">duyệt</b> lịch hẹn?</span>,
            confirmButtonText: "Xác nhận",
            showCancelButton: true,
            cancelButtonText: "Hủy",
            customClass: {
                title: "fs-5 fw-normal text-dark",
                confirmButton: "btn-primary shadow-none",
                cancelButton: "btn-secondary-cancel shadow-none",
            },
        })
        .then(async(result) => {
            if(result.isConfirmed) {
                setModalLoading(true);
                const res = await appointmentAPI.accept({
                    appointment_id: appointment.appointment_id,
                    employee_id: user_id
                });
                setModalLoading(false);
        
                const {errCode, type} = res.data;
                if(errCode === 0) {
                    toast.success("Duyệt thành công");
                    setAppointment(initAppointment);
                    setIsOpen(false);
                    getAllAppointments();
                }
                else if(errCode === 2 && type === "date") {
                    toast.error("Không thể duyệt lịch hẹn cho quá khứ");
                }
                else if(errCode === 2 && type === "time") {
                    toast.error("Đã qua thời gian của ca khám");
                }
                else if(errCode === 2 && type === "status") {
                    toast.error("Trạng thái lịch hẹn không phù hợp");
                }
                else { //errCode === 1 || errCode === 5
                    toast.error("Gửi yêu cầu thất bại");
                };
            };
        });

    };


    //XỬ LÝ HỦY LỊCH HẸN
    const handleCancelAppointment = () => {
        CustomSwal.fire({
            title: <span>Xác nhận <b className="text-danger">từ chối</b> lịch hẹn?</span>,
            confirmButtonText: "Xác nhận",
            showCancelButton: true,
            cancelButtonText: "Hủy",
            customClass: {
                title: "fs-5 fw-normal text-dark",
                confirmButton: "btn-primary shadow-none",
                cancelButton: "btn-secondary-cancel shadow-none",
            },
        })
        .then(async(result) => {
            if(result.isConfirmed) {
                setModalLoading(true);
                const res = await appointmentAPI.cancel({
                    appointment_id: appointment.appointment_id,
                    employee_id: user_id
                });
                setModalLoading(false);
        
                const {errCode} = res.data;
                if(errCode === 0) {
                    toast.success("Hủy thành công");
                    setAppointment(initAppointment);
                    setIsOpen(false);
                    getAllAppointments();
                }
                else if(errCode === 2) {
                    toast.error("Trạng thái lịch hẹn không phù hợp");
                }
                else { //errCode === 1 || errCode === 5
                    toast.error("Gửi yêu cầu thất bại");
                };
            };
        });
    };


    //XỬ LÝ ENTER
    const handleEnter = (e) => {
        if(e.keyCode === 13) {
            if(patientKeyword) {
                handleSearchByPatientOrAppointmentID();
            }
            else {
                handleSearchByDoctor();
            };
        };
    };


    return (
        <Vertical>
            <div className="container-fluid pt-4">
                <div className="row bg-light rounded mx-0 mb-4">
                    <div className="col-md">
                        <div className="rounded p-4 bg-secondary mb-4">
                            <div className="row">
                                <div className="col-md">
                                    <span className="text-dark page-title">QUẢN LÝ LỊCH HẸN</span>
                                    {
                                        prefix === "lt"
                                        ?
                                        <Link to="/lich-hen/dat-lich-hen">
                                            <Button className="btn-add btn-primary px-4">THÊM MỚI</Button>
                                        </Link>
                                        :
                                        <></>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="rounded p-4 bg-secondary">
                            <Form layout="vertical">
                                <div className="row mb-4">
                                    <div className="col-md-2">
                                        <Form.Item label="Tìm theo trạng thái">
                                            <Select
                                                className="w-100"
                                                placeholder="Chọn trạng thái"
                                                size="large"
                                                options={
                                                    [
                                                        {
                                                            value: -1,
                                                            label: "Hiển thị tất cả",
                                                            className: "text-primary"
                                                        },
                                                        {value: 0, label: "Chờ xác nhận"},
                                                        {value: 1, label: "Đã xác nhận"},
                                                        {value: 2, label: "Đã hủy"},
                                                        {value: 3, label: "Đã hoàn thành"},
                                                    ]
                                                }
                                                onChange={value => handleFilterByStatus(value)}
                                            />
                                        </Form.Item>
                                    </div>
                                    <div className="col-md-2">
                                        <Form.Item label="Tìm theo ngày hẹn">
                                            <DatePicker
                                                size="large"
                                                className="w-100"
                                                placeholder="Chọn ngày"
                                                format="DD-MM-YYYY"
                                                onChange={e => {
                                                    e && e.$d
                                                    ?
                                                    handleSearchByDate(moment(e.$d).format("YYYY-MM-DD"))
                                                    :
                                                    setSearchList(null);
                                                }}
                                            />
                                        </Form.Item>
                                    </div>
                                    <div className="col-md-4">
                                        <Form.Item label="Mã lịch hẹn/Thông tin người được khám">
                                            <div className="d-flex w-100">
                                                <Input
                                                    size="large"
                                                    placeholder="Nhập thông tin"
                                                    value={patientKeyword}
                                                    onChange={e => setPatientKeyword(e.target.value)}
                                                    onKeyUp={handleEnter}
                                                />
                                                <Button onClick={handleSearchByPatientOrAppointmentID}>Tìm</Button>
                                            </div>
                                        </Form.Item>
                                    </div>
                                    {
                                        prefix === "bs"
                                        ?
                                        <></>
                                        :
                                        <div className="col-md-4">
                                            <Form.Item label="Tìm theo mã/tên/số điện thoại bác sĩ">
                                                <div className="d-flex w-100">
                                                    <Input
                                                        size="large"
                                                        placeholder="Nhập thông tin"
                                                        value={doctorKeyword}
                                                        onChange={e => setDoctorKeyword(e.target.value)}
                                                        onKeyUp={handleEnter}
                                                    />
                                                    <Button onClick={handleSearchByDoctor}>Tìm</Button>
                                                </div>
                                            </Form.Item>
                                        </div>
                                    }
                                </div>
                            </Form>
                            <div className="row">
                                <div className="col-md">
                                    <div className="table-responsive">
                                        <DataTable
                                            columns={columns}
                                            list={searchList ? searchList : appointmentList}
                                            isLoading={pageLoading}
                                            isAppointmentPage={true}
                                            pagination
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                width={1000}
                open={isOpen}
                onCancel={() => {
                    setIsOpen(false);
                    setAppointment(initAppointment);
                }}
                okButtonProps={{hidden: true}}
                cancelButtonProps={{hidden: true}}
            >
                <Spin tip="Đang tải..." spinning={modalLoading}>
                    <div className="row">
                        <div className="col-md-4 mt-4 d-flex align-items-center justify-content-center">
                            <p className="mb-0">
                                <span className="me-3">
                                    Ngày gửi: {moment(appointment.createdAt).format("DD-MM-YYYY")}
                                </span>
                                <span>
                                    <b className={`${!appointment.status ? "text-danger" : "text-muted"}`}>
                                        {!appointment.status ? "Chờ xác nhận" : "Đã hủy lịch hẹn"}
                                    </b>
                                </span>
                            </p>
                        </div>
                        <div className="col-md-4 mt-4 d-flex align-items-center justify-content-center">
                            <h4 className="text-uppercase text-primary mb-0">Yêu cầu đặt lịch hẹn</h4>
                        </div>
                        {
                            appointment.status !== 2
                            ?
                            <div className="col-md-4 mt-4 d-flex align-items-center justify-content-center">
                                <Button
                                    className="btn-primary px-4 me-2"
                                    onClick={handleAcceptAppointment}
                                >
                                    Duyệt lịch hẹn
                                </Button>
                                <Button
                                    className="px-4"
                                    onClick={handleCancelAppointment}
                                >
                                    Từ chối
                                </Button>
                            </div>
                            :
                            <></>
                        }
                    </div>
                    <hr/>
                    <div className="row appointment-details">
                        <div className="col-md-4 mt-4">
                            <h5 className="text-dark mb-4">1. Thông tin lịch hẹn</h5>
                            <div className="d-flex">
                                <div className="left-content">
                                    <p><b className="text-dark">Mã lịch hẹn:</b></p>
                                    <p><b className="text-dark">Loại:</b></p>
                                    <p><b className="text-dark">Ngày hẹn:</b></p>
                                    <p><b className="text-dark">Ca khám:</b></p>
                                    <p><b className="text-dark">{
                                        appointment.status === 0 ? "Người duyệt:" :
                                        appointment.status === 2 ? "Người hủy:" : ""
                                    }</b></p>
                                </div>
                                <div className="right-content">
                                    <p>{appointment.appointment_id.toUpperCase()}</p>
                                    <p>{appointment.Type.type_name}</p>
                                    <p>
                                        <b className="text-primary">
                                            {moment(appointment.DoctorSchedule.Schedule.date).format("DD-MM-YYYY")}
                                        </b>
                                    </p>
                                    <p>
                                        <b className="text-primary">
                                            {appointment.DoctorSchedule.Schedule.Session.time}
                                        </b>
                                    </p>
                                    <p>
                                        {
                                            appointment.Employee.employee_id !== "none"
                                            ?
                                            appointment.Employee.fullname
                                            :
                                            <span className="text-muted">Chưa có người duyệt</span>
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mt-4">
                            <h5 className="text-dark mb-4">2. Thông tin bệnh nhân</h5>
                            <div className="d-flex">
                                <div className="left-content">
                                    <p><b className="text-dark">Mã bệnh nhân:</b></p>
                                    <p><b className="text-dark">Họ và tên:</b></p>
                                    <p><b className="text-dark">Ngày sinh:</b></p>
                                    <p><b className="text-dark">Giới tính:</b></p>
                                    <p><b className="text-dark">Số điện thoại:</b></p>
                                </div>
                                <div className="right-content">
                                    <p>{appointment.Patient.patient_id.toUpperCase()}</p>
                                    <p>{appointment.fullname}</p>
                                    <p>{moment(appointment.dob).format("DD-MM-YYYY")}</p>
                                    <p>{appointment.gender ? "Nam" : "Nữ"}</p>
                                    <p>{appointment.phone}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mt-4">
                            <h5 className="text-dark mb-4">3. Thông tin bác sĩ</h5>
                            <div className="d-flex">
                                <div className="left-content">
                                    <p><b className="text-dark">Mã bác sĩ:</b></p>
                                    <p><b className="text-dark">Họ và tên:</b></p>
                                    <p><b className="text-dark">Ngày sinh:</b></p>
                                    <p><b className="text-dark">Giới tính:</b></p>
                                    <p><b className="text-dark">Số điện thoại:</b></p>
                                </div>
                                <div className="right-content">
                                    <p>{appointment.DoctorSchedule.Doctor.doctor_id.toUpperCase()}</p>
                                    <p>{appointment.DoctorSchedule.Doctor.fullname}</p>
                                    <p>{moment(appointment.DoctorSchedule.Doctor.dob).format("DD-MM-YYYY")}</p>
                                    <p>{appointment.DoctorSchedule.Doctor.gender ? "Nam" : "Nữ"}</p>
                                    <p>{appointment.DoctorSchedule.Doctor.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Spin>
            </Modal>
        </Vertical>
    );
};