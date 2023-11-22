import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { Spin, Button, Popconfirm } from "antd";
import { Vertical } from "../../../../utils/AnimatedPage";
import moment from "moment";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import DataTable from "../../../../components/DataTable";
import scheduleAPI from "../../../../services/scheduleAPI";


export default function ScheduleDetails() {


    //KHAI BÁO BIẾN
    const navigate = useNavigate();
    const {user_id, date} = useParams();
    const [scheduleList, setScheduleList] = useState([]);
    const [user, setUser] = useState(null);
    const [pageLoading, setPageLoading] = useState(false);
    const [isAllAccepted, setIsAllAccepted] = useState(true);
    const currentDate = moment(new Date()).format("YYYY-MM-DD");


    //ĐỊNH DẠNG DATATABLE
    const columns = [
        {
            title: "STT",
            dataIndex: "schedule_id",
            align: "center",
            key: obj => obj.schedule_id,
            render: (text, record, index) => index + 1
        },
        {
            title: "Ngày làm việc",
            dataIndex: "date",
            align: "center",
            render: date => moment(date).format("DD-MM-YYYY")
        },
        {
            title: "Ca khám",
            align: "center",
            render: obj => obj.Session.time
        },
        {
            title: "Trạng thái duyệt",
            render: obj => (
                obj.UserSchedule.status
                ?
                <span className="text-success">Đã duyệt</span>
                :
                <span className="text-danger">Chưa duyệt</span>
            )
        },
        {
            title: "Trạng thái đặt lịch",
            hidden: true,
            render: obj => (
                obj.UserSchedule.status === 2
                ?
                <span className="text-success">Đã có lịch hẹn</span>
                :
                obj.UserSchedule.status === 1
                ?
                <span className="text-danger">Còn trống</span> : ""
            )
        },
        {
            title: "Ngày tạo",
            align: "center",
            render: obj => moment(obj.UserSchedule.createdAt).format("DD-MM-YYYY")
        },
        {
            title: "Duyệt lịch",
            align: "center",
            render: obj => (
                <Popconfirm
                    disabled={
                        obj.UserSchedule.status || obj.date <= currentDate ? true : false
                    }
                    className={`${
                        obj.UserSchedule.status || obj.date <= currentDate ? "border-0 btn-disabled" : ""
                    }`}
                    title="Duyệt lịch?"
                    cancelText="Hủy"
                    okText="Duyệt"
                    onConfirm={() => handleAcceptOne(obj.UserSchedule.user_schedule_id)}
                >
                    <Button>Duyệt</Button>
                </Popconfirm>
            )
        },
        {
            title: "Xóa lịch",
            align: "center",
            render: obj => (
                <Popconfirm
                    disabled={obj.UserSchedule.status === 2 ? true : false}
                    className={`${obj.UserSchedule.status === 2 ? "border-0 btn-disabled" : ""}`}
                    title="Xóa lịch?"
                    cancelText="Hủy"
                    okText="Xóa"
                    onConfirm={() => handleDelete(obj.UserSchedule.user_schedule_id)}
                >
                    <Button>Xóa</Button>
                </Popconfirm>
            )
        }
    ];


    //CALL API
    useEffect(() => {
        getUserSchedulesByDate();
    }, []);


    //SET TRẠNG THÁI DISABLE BUTTON DUYỆT TẤT CẢ
    useEffect(() => {
        if(scheduleList.length) {
            const notAccepted = scheduleList.find(schedule => {
                return !schedule.UserSchedule.status && schedule.date > currentDate;
            });
            if(notAccepted) {
                setIsAllAccepted(false);
            }
            else {
                setIsAllAccepted(true);
            };
        };
    }, [scheduleList]);


    //XỬ LÝ LẤY LỊCH LÀM VIỆC CỦA NHÂN VIÊN THEO NGÀY
    const getUserSchedulesByDate = async() => {
        setPageLoading(true);
        const res = await scheduleAPI.getUserSchedulesByDate(user_id, date);
        if(res.data.errCode === 0) {
            setUser(res.data.data.user);
            setScheduleList(res.data.data.schedules);
            setPageLoading(false);
        }
        else { //errCode === 1
            navigate("/lich-lam-viec");
        };
    };


    //XỬ LÝ DUYỆT 1 LỊCH LÀM VIỆC
    const handleAcceptOne = async(user_schedule_id) => {
        setPageLoading(true);
        const res = await scheduleAPI.acceptOne({user_id: user.user_id, user_schedule_id});
        setPageLoading(false);

        const {errCode, type} = res.data;
        if(errCode === 0) {
            toast.success("Duyệt thành công");
            getUserSchedulesByDate();
        }
        else if(errCode === 2 && type === "status") {
            toast.error("Lịch làm việc đã được duyệt");
        }
        else if(errCode === 2 && type === "date") {
            toast.error("Không thể duyệt lịch của quá khứ");
        }
        else { //errCode === 1 || errCode === 5
            toast.error("Gửi yêu cầu thất bại");
        };
    };


    //XỬ LÝ DUYỆT TẤT CẢ LỊCH LÀM VIỆC
    const handleAcceptAll = () => {
        Swal.fire({
            title: "Duyệt tất cả lịch làm việc?",
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
                let list = scheduleList.filter(schedule => schedule.UserSchedule.status === 0);
                list = list.map(schedule => schedule.UserSchedule.user_schedule_id);
        
                setPageLoading(true);
                const res = await scheduleAPI.acceptAll({user_id: user.user_id, list});
                setPageLoading(false);
        
                const {errCode, type} = res.data;
                if(errCode === 0) {
                    toast.success("Duyệt thành công");
                    getUserSchedulesByDate();
                    setIsAllAccepted(true);
                }
                else if(errCode === 2 && type === "status") {
                    toast.error("Lịch làm việc đã được duyệt");
                }
                else if(errCode === 2 && type === "date") {
                    toast.error("Không thể duyệt lịch của quá khứ");
                }
                else { //errCode === 1 || errCode === 5
                    toast.error("Gửi yêu cầu thất bại");
                };
            };
        });
    };


    //XỬ LÝ XÓA LỊCH LÀM VIỆC
    const handleDelete = async(user_schedule_id) => {
        setPageLoading(true);
        const res = await scheduleAPI.delete(user.user_id, user_schedule_id);
        setPageLoading(false);

        const {errCode} = res.data;
        if(errCode === 0) {
            toast.success("Xóa thành công");
            getUserSchedulesByDate();
        }
        else if(errCode === 6) {
            toast.error("Lịch làm việc đã được đặt lịch hẹn");
        }
        else { //errCode === 1 || errCode === 5
            toast.error("Gửi yêu cầu thất bại");
        };
    };


    return (
        <Vertical>
            <div className="container-fluid pt-4">
                <div className="row bg-light rounded mx-0 mb-4">
                    <div className="col-md">
                        <div className="rounded p-4 bg-secondary">
                            <div className="row mb-3">
                                <div className="col-md">
                                    <Link to="/lich-lam-viec" className="text-decoration-none text-primary">
                                        <small><FontAwesomeIcon icon={faChevronLeft}/> Quay lại</small>
                                    </Link>
                                </div>
                            </div>
                            <Spin tip="Đang tải..." spinning={pageLoading}>
                                <div className="row mb-3">
                                    <div className="col-md">
                                        <h5 className="text-uppercase text-primary mb-0">
                                            Lịch làm việc {moment(date).format("DD-MM-YYYY")}
                                        </h5>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md d-flex flex-wrap">
                                        <div className="me-3 mb-3">
                                            {
                                                user && user.avatar
                                                ? 
                                                <img
                                                    className="user-avatar rounded"
                                                    src={user.avatar}
                                                    alt=""
                                                />
                                                :
                                                <div className="user-avatar border border-1 d-flex justify-content-center align-items-center rounded">
                                                    <small>Chưa có ảnh</small>
                                                </div>
                                            }
                                        </div>
                                        <div className="me-5 mb-3 d-flex">
                                            <div className="me-4">
                                                <p><b>Mã nhân viên</b></p>
                                                <p><b>Họ và tên</b></p>
                                                <p><b>Ngày sinh</b></p>
                                                <p><b>Giới tính</b></p>
                                            </div>
                                            <div>
                                                <p>{user ? user.user_id.toUpperCase() : ""}</p>
                                                <p>{user ? user.fullname : ""}</p>
                                                <p>{user ? moment(user.dob).format("DD-MM-YYYY") : ""}</p>
                                                <p>{user ? user.gender ? "Nam" : "Nữ" : ""}</p>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <Button
                                                disabled={isAllAccepted ? true : false}
                                                style={isAllAccepted ? {border: "0px"} : {}}
                                                onClick={handleAcceptAll}
                                            >
                                                Duyệt tất cả
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md">
                                        <div className="table-responsive mt-3">
                                            <DataTable
                                                columns={
                                                    user_id.slice(0, 2) === "bs"
                                                    ?
                                                    columns
                                                    :
                                                    columns.filter(item => !item.hidden)
                                                }
                                                list={scheduleList}
                                                isSchedulePage={true}
                                                bordered
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Spin>
                        </div>
                    </div>
                </div>
            </div>
        </Vertical>
    );
};