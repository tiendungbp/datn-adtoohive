import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Modal, Select, Spin, Form, Input } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { Vertical } from "../../../utils/AnimatedPage";
import toast from "react-hot-toast";
import DataTable from "../../../components/DataTable";
import employeeAPI from "../../../services/employeeAPI";
import doctorAPI from "../../../services/doctorAPI";
import authAPI from "../../../services/authAPI";
import CommonUtils from "../../../utils/commonUtils";


export default function EmployeeList() {


    //DANH SÁCH NHÂN VIÊN, KEYWORD TÌM KIẾM
    const [employeeList, setEmployeeList] = useState([]);
    const [searchList, setSearchList] = useState(null);
    const [keyword, setKeyword] = useState("");


    //FORM, LOADING, MODAL
    const [form] = Form.useForm();
    const [pageLoading, setPageLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);


    //BLOCK, ADMIN
    const [blockedUser, setBlockedUser] = useState({});
    const admin = useSelector(state => state.user.user);


    //ĐỊNH DẠNG DATATABLE
    const detailsPage = "/nhan-vien";
    const columns = [
        {
            title: "Mã nhân viên",
            dataIndex: "user_id",
            align: "center",
            render: user_id => user_id.toUpperCase()
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
                <div className="datatable-avatar border rounded d-flex align-items-center justify-content-center">
                    <FontAwesomeIcon icon={faImage} size="lg" className="text-gray" />
                </div>
            )
        },
        {
            title: "Trạng thái",
            render: (text, record) => (
                record.is_blocked
                ? <span className="text-primary">Đã khóa tài khoản</span>
                :
                record.is_activated
                ? <span className="text-success">Đã xác minh</span>
                : <span className="text-danger">Chưa xác minh</span>
            )
        },
        {
            title: "Họ và tên",
            dataIndex: "fullname"
        },
        {
            title: "Giới tính",
            dataIndex: "gender",
            align: "center",
            render: gender => gender ? "Nam" : "Nữ"
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            align: "center"
        },
        {
            title: "Email",
            dataIndex: "email"
        }
    ];


    //CALL API
    useEffect(() => {
        getAllEmployees();
    }, []);


    //NẾU KHÓA KHI ĐANG CÓ SEARCH LIST THÌ UPDATE LẠI SEARCH LIST
    useEffect(() => {
        if(searchList) {
            let list = [];
            searchList.forEach(searchItem => {
                const a = employeeList.find(employee => {
                    return employee.user_id === searchItem.user_id;
                });
                if(a) list.push(a);
            });
            setSearchList(list);
        };
    }, [employeeList]);


    //XỬ LÝ LẤY TẤT CẢ NHÂN VIÊN
    const getAllEmployees = async() => {
        setPageLoading(true);
        const employeeRes = await employeeAPI.getAll();
        const doctorRes = await doctorAPI.getAll();

        let list_1 = [];
        let list_2 = [];

        doctorRes.data.data.forEach(item => {
            const {doctor_id, ...rest} = item;
            list_1.push({...rest, user_id: doctor_id});
        });
        employeeRes.data.data.forEach(item => {
            const {employee_id, ...rest} = item;
            list_2.push({...rest, user_id: employee_id});
        });
        setEmployeeList([...list_1, ...list_2]);
        setPageLoading(false);
    };


    //XỬ LÝ LỌC NHÂN VIÊN THEO VAI TRÒ
    const handleFilterByRole = (role) => {
        let list = [];
        switch (role) {
            case 0: setSearchList(null);
                break;                
            case 2:
                list = employeeList.filter(item => item.user_id.slice(0, 2) === "qt");
                setSearchList(list);
                break;
            case 3:
                list = employeeList.filter(item => item.user_id.slice(0, 2) === "lt");
                setSearchList(list);
                break;
            case 4:
                list = employeeList.filter(item => item.user_id.slice(0, 2) === "bs");
                setSearchList(list);
                break;
            case 5:
                list = employeeList.filter(item => item.user_id.slice(0, 2) === "pt");
                setSearchList(list);
                break;
            default: break;
        };
    };


    //XỬ LÝ LỌC NHÂN VIÊN THEO TRẠNG THÁI
    const handleFilterByStatus = (code) => {
        if(code === -1) {
            setSearchList(null);
        }
        else if(code === 2) {
            const list = employeeList.filter(employee => employee.is_blocked === 1);
            setSearchList(list);
        }
        else {
            const list = employeeList.filter(employee => employee.is_activated === code);
            setSearchList(list);
        };
    };


    //XỬ LÝ TÌM THEO MÃ/TÊN/SỐ ĐIỆN THOẠI
    const handleSearchByInfo = () => {
        if(keyword) {
            const isPhoneNumber = CommonUtils.checkPhoneNumber(keyword);
            let list;
            if(isPhoneNumber) {
                list = employeeList.filter(employee => employee.phone === keyword);
            }
            else if(keyword.length === 10) {
                const prefix = keyword.toLowerCase().slice(0, 2);
                if(prefix === "qt" || prefix === "lt" || prefix === "bs" || prefix === "pt") {
                    list = employeeList.filter(employee => {
                        return employee.user_id === keyword.toLowerCase();
                    });
                };
            }
            else {
                list = employeeList.filter(employee => {
                    return employee.fullname.toLowerCase().includes(keyword.toLowerCase());
                });
            };
            setSearchList(list);
            setKeyword("");
        }
        else {
            setSearchList(null);
        };
    };


    //XỬ LÝ MỞ MODAL
    const handleOpenModal = async(record) => {
        setBlockedUser(record);
        setIsOpen(true);
    };


    //XỬ LÝ KHÓA TÀI KHOẢN
    const handleBlockAccount = async(values) => {
        setModalLoading(true);
        const res = await authAPI.blockAccount({
            admin_id: admin.user_id,
            password: values.password,
            user_id: blockedUser.user_id
        });
        setModalLoading(false);

        const {errCode} = res.data;
        if(errCode === 0) {
            toast.success("Đã khóa tài khoản");
            form.resetFields();
            getAllEmployees();
            setIsOpen(false);
        }
        else if(errCode === 2) {
            toast.error("Mật khẩu không hợp lệ");
        }
        else {
            toast.error("Yêu cầu thất bại"); //errCode === 1 || errCode === 5
        };
    };


    //XỬ LÝ ENTER
    const handleEnter = (e) => {
        if(e.keyCode === 13) handleSearchByInfo();
    };
    

    return (
        <Vertical>
            <div className="container-fluid pt-4">
                <div className="row bg-light rounded mx-0 mb-4">
                    <div className="col-md">
                        <div className="rounded p-4 bg-secondary mb-4">
                            <div className="row">
                                <div className="col-md">
                                    <span className="text-dark page-title">QUẢN LÝ NHÂN VIÊN</span>
                                    <Link to="/nhan-vien/them-moi">
                                        <Button className="btn-add btn-primary px-4">THÊM MỚI</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="rounded p-4 bg-secondary">
                            <Form layout="vertical">
                                <div className="row mb-4">
                                    <div className="col-md-4">
                                        <Form.Item label="Tìm theo vai trò">
                                            <Select
                                                className="w-100"
                                                placeholder="Chọn vai trò"
                                                size="large"
                                                options={[
                                                    {
                                                        value: 0,
                                                        label: "Hiển thị tất cả",
                                                        className: "text-primary"
                                                    },
                                                    {value: 2, label: "Quản trị viên"},
                                                    {value: 3, label: "Lễ tân"},
                                                    {value: 4, label: "Bác sĩ"},
                                                    {value: 5, label: "Phụ tá"}
                                                ]}
                                                onChange={value => handleFilterByRole(value)}
                                            />
                                        </Form.Item>
                                    </div>
                                    <div className="col-md-4">
                                        <Form.Item label="Tìm theo trạng thái">
                                            <Select
                                                className="w-100"
                                                placeholder="Chọn trạng thái"
                                                size="large"
                                                options={[
                                                    {
                                                        value: -1,
                                                        label: "Hiển thị tất cả",
                                                        className: "text-primary"
                                                    },
                                                    {value: 0, label: "Chưa xác minh"},
                                                    {value: 1, label: "Đã xác minh"},
                                                    {value: 2, label: "Đã khóa tài khoản"}
                                                ]}
                                                onChange={value => handleFilterByStatus(value)}
                                            />
                                        </Form.Item>
                                    </div>
                                    <div className="col-md-4">
                                        <Form.Item label="Tìm theo mã/tên/số điện thoại">
                                            <div className="d-flex w-100">
                                                <Input
                                                    size="large"
                                                    placeholder="Nhập thông tin"
                                                    value={keyword}
                                                    onChange={e => setKeyword(e.target.value)}
                                                    onKeyUp={handleEnter}
                                                />
                                                <Button onClick={handleSearchByInfo}>Tìm</Button>
                                            </div>
                                        </Form.Item>
                                    </div>
                                </div>
                            </Form>
                            <div className="row">
                                <div className="col-md">
                                    <div className="table-responsive">
                                        <DataTable
                                            columns={columns}
                                            list={searchList ? searchList : employeeList}
                                            handleOpenModal={handleOpenModal}
                                            detailsPage={detailsPage}
                                            isLoading={pageLoading}
                                            isEmployeePage={true}
                                            pagination
                                        />
                                        <Modal
                                            open={isOpen}
                                            onCancel={() => setIsOpen(false)}
                                            okButtonProps={{hidden: true}}
                                            cancelButtonProps={{hidden: true}}
                                        >
                                            <Spin tip="Đang tải..." spinning={modalLoading}>
                                                <div className="text-center">
                                                    <h5 className="text-primary">
                                                        Khóa tài khoản {""}
                                                        <span className="text-danger">
                                                            {blockedUser.fullname}
                                                        </span>
                                                    </h5>
                                                    <hr/>
                                                </div>
                                                <Form
                                                    form={form}
                                                    layout="vertical"
                                                    onFinish={handleBlockAccount}
                                                >
                                                    <div className="row">
                                                        <div className="col-md mt-2">
                                                            <Form.Item
                                                                label="Mật khẩu của bạn"
                                                                name="password"
                                                                rules={[{
                                                                    required: true,
                                                                    message: "Mật khẩu không được rỗng"
                                                                }]}
                                                                >
                                                                <Input.Password
                                                                    size="large"
                                                                    placeholder="Nhập mật khẩu của bạn để tiếp tục"
                                                                    visibilityToggle={false}
                                                                    />
                                                            </Form.Item>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <Button htmlType="submit" className="btn-primary px-4 me-2">Khóa tài khoản</Button>
                                                        <Button htmlType="reset" className="px-4">Reset</Button>
                                                    </div>
                                                </Form>
                                            </Spin>
                                        </Modal>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Vertical>
    );
};