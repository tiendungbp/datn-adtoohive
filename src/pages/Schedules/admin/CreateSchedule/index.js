import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Vertical } from "../../../../utils/AnimatedPage";
import { Spin, Form, DatePicker, Button, Table, Popconfirm, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faImage } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import employeeAPI from "../../../../services/employeeAPI";
import doctorAPI from "../../../../services/doctorAPI";
import sessionAPI from "../../../../services/sessionAPI";
import scheduleAPI from "../../../../services/scheduleAPI";


export default function CreateSchedule() {


    //KHAI BÁO FORM, LOADING
    const [form] = Form.useForm();
    const [pageLoading, setPageLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [isActive, setIsActive] = useState(0); //set giá trị màu nền cho ca khám được chọn


    //DANH SÁCH CALL API
    const [sessionList, setSessionList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);


    //CHỌN: NGÀY, CA KHÁM, TABLE
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState([]);
    const [employeeKey, setEmployeeKey] = useState([]);


    //ĐỊNH DẠNG DATATABLE
    const columns = [
        {
            title: "Mã nhân viên",
            dataIndex: "user_id",
            align: "center",
            render: (user_id, obj) => (
                obj.user_schedule_id
                ?
                <Tooltip title="Xem chi tiết" placement="bottom">
                    <Link to={`/lich-lam-viec/${user_id}/${selectedDate}`}>{user_id.toUpperCase()}</Link>
                </Tooltip>
                :
                user_id.toUpperCase()
            )
        },
        {
            title: "Vai trò",
            render: obj => (
                obj.user_id.slice(0, 2) === "qt" ? "Quản trị viên" :
                obj.user_id.slice(0, 2) === "lt" ? "Lễ tân" :
                obj.user_id.slice(0, 2) === "bs" ? "Bác sĩ" : "Phụ tá"
            )
        },
        {
            title: "Ảnh đại diện",
            dataIndex: "avatar",
            align: "center",
            render: avatar => (
                avatar
                ?
                <img
                    src={avatar}
                    alt=""
                    className="datatable-avatar rounded"
                />
                :
                <div className="datatable-avatar border rounded d-flex align-items-center justify-content-center mx-auto">
                    <FontAwesomeIcon icon={faImage} size="lg" className="text-gray" />
                </div>
            )
        },
        {
            title: "Họ và tên",
            dataIndex: "fullname"
        },
        {
            title: "Giới tính",
            align: "center",
            render: obj => obj.gender ? <span>Nam</span> : <span>Nữ</span>
        },
        {
            title: "Số điện thoại",
            align: "center",
            dataIndex: "phone"
        },
        {
            title: "Xóa lịch",
            dataIndex: "",
            align: "center",
            render: (_, obj) => (
                obj.user_schedule_id
                ?
                <Popconfirm
                    title="Xóa lịch?"
                    cancelText="Hủy"
                    okText="Xóa"
                    onConfirm={() => handleDelete(obj.user_id, obj.user_schedule_id)}
                >
                    <Button>Xóa</Button>
                </Popconfirm>
                :
                <></>
            )
        },
    ];


    //CALL API
    useEffect(() => {
        getActiveSessions();
    }, []);


    //THAY ĐỔI SELECT NGÀY VÀ CA KHÁM
    useEffect(() => {
        if(selectedDate && selectedSession) getAllBySchedule();
    }, [selectedDate, selectedSession]);


    //XỬ LÝ LẤY TẤT CẢ CA KHÁM ĐANG HOẠT ĐỘNG
    const getActiveSessions = async() => {
        setPageLoading(true);
        const res = await sessionAPI.getActive();
        setSessionList(res.data.data);
        setPageLoading(false);
    };

    
    //XỬ LÝ LẤY TẤT CẢ NHÂN VIÊN CỦA DATE VÀ SESSION_ID
    const getAllBySchedule = async() => {
        setTableLoading(true);
        const resDoctor = await doctorAPI.getAllBySchedule(selectedDate, selectedSession);
        const resEmployee = await employeeAPI.getAllBySchedule(selectedDate, selectedSession);

        const userList = [...resDoctor.data.data, ...resEmployee.data.data];

        //lọc để xếp các nhân viên khả dụng lên trước
        let available = userList.filter(user => !user.user_schedule_id);
        let unavailable = userList.filter(user => user.user_schedule_id);

        setEmployeeList([...available, ...unavailable]);
        setTableLoading(false);
    };
    

    //XỬ LÝ SUBMIT FORM
    const handleSubmit = (values) => {
        if(selectedSession) {
            if(selectedEmployee.length) {
                Swal.fire({
                    title: "Xác nhận lưu thông tin?",
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
                        const employees = selectedEmployee.map(employee => employee.user_id);
                
                        const obj = {
                            date: values.date,
                            employees: employees,
                            session_id: selectedSession
                        };
                        setPageLoading(true);
                        const res = await scheduleAPI.create(obj);
                        setPageLoading(false);
        
                        const {errCode} = res.data;
                        if(errCode === 0) {
                            toast.success("Thêm thành công");
                            setEmployeeKey([]);
                            setSelectedEmployee([]);
                            getAllBySchedule(selectedDate, selectedSession);
                        }
                        else if(errCode === 2) {
                            toast.error("Không thể thêm lịch của quá khứ");
                        }
                        else {
                            toast.error("Thêm thất bại"); //errCode === 1
                        };
                    };
                });
            }
            else {
                toast.error("Bạn chưa chọn nhân viên");
            };
        }
        else {
            toast.error("Bạn chưa chọn ca khám");
        };
    };


    //XỬ LÝ XÓA LỊCH LÀM VIỆC
    const handleDelete = async(user_id, user_schedule_id) => {
        setPageLoading(true);
        const res = await scheduleAPI.delete(user_id, user_schedule_id);
        setPageLoading(false);

        const {errCode} = res.data;
        if(errCode === 0) {
            toast.success("Xóa thành công");
            getAllBySchedule(selectedDate, selectedSession);
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
                                        <h5 className="text-uppercase text-primary mb-0">Thêm lịch làm việc</h5>
                                    </div>
                                </div>
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleSubmit}
                                >
                                    <div className="row">
                                        <div className="col-md-3">
                                            <div className="row">
                                                <div className="col-md mt-3">
                                                    <Form.Item
                                                        label="Ngày làm việc"
                                                        name="date"
                                                        rules={[{
                                                            required: true,
                                                            message: "Ngày làm việc không được rỗng"
                                                        }]}
                                                    >
                                                        <DatePicker
                                                            size="large"
                                                            placeholder="Ngày làm việc"
                                                            format="DD-MM-YYYY"
                                                            disabledDate={
                                                                current => current && current < dayjs().endOf("day")
                                                            }
                                                            onChange={(value) => {
                                                                setSelectedDate(dayjs(value).format("YYYY-MM-DD"))
                                                            }}
                                                        />
                                                    </Form.Item>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-10 mb-3">
                                            <div className="d-flex flex-wrap">
                                                {
                                                    sessionList.map((session, index) => {
                                                        return (
                                                            <div
                                                                key={index}
                                                                className={`schedule-item py-2 px-3 me-2 mt-3 ${
                                                                    isActive &&
                                                                    session.session_id === selectedSession
                                                                    ? "btn-primary" : "bg-gray"
                                                                }`}
                                                                onClick={() => {
                                                                    setSelectedSession(session.session_id);
                                                                    setIsActive(1);
                                                                }}
                                                            >
                                                                {session.time}
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-2 mt-3 mb-3">
                                            <Button htmlType="submit" className="btn-primary px-4 w-100">Lưu</Button>
                                        </div>
                                    </div>
                                </Form>
                                <div className="row">
                                    <div className="col-md mt-3">
                                        <div className="table-responsive">
                                            <Table
                                                columns={columns}
                                                dataSource={employeeList}
                                                rowKey={columns[0].dataIndex}
                                                loading={tableLoading}
                                                pagination={{pageSize: 100, position: ["bottomCenter"]}}
                                                rowSelection={{
                                                    type: "checkbox",
                                                    selectedRowKeys: employeeKey,
                                                    onChange: (selectedRowKeys, selectedRows) => {
                                                        setEmployeeKey(selectedRowKeys);
                                                        setSelectedEmployee(selectedRows);
                                                    },
                                                    getCheckboxProps: (obj) => {
                                                        if(obj.user_schedule_id) {
                                                            return {
                                                                disabled: !employeeKey.includes(obj.key)
                                                            };
                                                        }
                                                    }
                                                }}
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