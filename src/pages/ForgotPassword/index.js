import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, Select, Spin } from "antd";
import { Horizontal } from "../../utils/AnimatedPage";
import toast from "react-hot-toast";
import authAPI from "../../services/authAPI";
import CommonUtils from "../../utils/commonUtils";


export function SendResetLink() {


    //STATE CHỨA THÔNG TIN
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();


    //XỬ LÝ GỬI EMAIL ĐẶT LẠI MẬT KHẨU
    const handleSendResetLink = async(values) => {
        setIsLoading(true);
        const res = await authAPI.sendResetLink({role: values.role, email: values.email});
        setIsLoading(false);

        const {errCode} = res.data;
        if(errCode === 0) {
            toast.success("Đã gửi email đặt lại mật khẩu");
            form.resetFields();
        }
        else if(errCode === 1) {
            toast.error("Người dùng không tồn tại");
        }
        else {
            toast.error("Gửi yêu cầu thất bại");
        };
    };


    return (
        <Horizontal>
            <Spin tip="Đang tải..." spinning={isLoading}>
                <div className="container-fluid bg-light">
                    <div className="row h-100 align-items-center justify-content-center" style={{minHeight: '100vh'}}>
                        <div className="col-12 col-sm-8 col-md-6 col-lg-5 col-xl-4">
                            <div className="bg-secondary rounded p-4 p-sm-5 my-4 mx-3 shadow-container">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <h5 className="text-primary">QUÊN MẬT KHẨU</h5>
                                </div>
                                <Form
                                    form={form}
                                    layout="vertical"
                                    validateMessages={{
                                        types: {
                                            email: "Email không đúng định dạng"
                                        }
                                    }}
                                    onFinish={handleSendResetLink}
                                >
                                    <div className="row">
                                        <div className="col-md mt-2">
                                            <Form.Item
                                                label="Vai trò"
                                                name="role"
                                                rules={[{
                                                    required: true,
                                                    message: "Vai trò không được rỗng"
                                                }]}
                                            >
                                                <Select
                                                    placeholder="Chọn vai trò"
                                                    size="large"
                                                    options={[
                                                        {value: 2, label: "Quản trị viên"},
                                                        {value: 3, label: "Lễ tân"},
                                                        {value: 4, label: "Bác sĩ"},
                                                        {value: 5, label: "Phụ tá"},
                                                    ]}
                                                />
                                            </Form.Item>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md mt-2">
                                            <Form.Item
                                                label="Email"
                                                name="email"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: "Email không được rỗng"
                                                    },
                                                    {
                                                        type: 'email'
                                                    }
                                                ]}
                                            >
                                                <Input size="large" placeholder="Email"/>
                                            </Form.Item>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <Button htmlType="submit" className="btn-primary px-4 w-100">Gửi email</Button>
                                    </div>
                                    <div className="mt-3">
                                        <Link to="/" className="text-decoration-none text-primary">Đăng nhập</Link>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </Spin>
        </Horizontal>
    );
};


export function ResetPassword() {


    //KHAI BÁO BIẾN, LẤY THÔNG TIN TỪ URL
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isExpired, setIsExpired] = useState(false);
    const [form] = Form.useForm();
    const {user_id, token} = useParams();


    //XỬ LÝ ĐẶT LẠI MẬT KHẨU
    const handleResetPassword = async(values) => {
        const resultCheckPassword = CommonUtils.checkPasswordLength(values.password);
        if(resultCheckPassword) {
            setIsLoading(true);
            const res = await authAPI.resetPassword(user_id, token, values.password);
            setIsLoading(false);

            const {errCode} = res.data;
            if(errCode === 0) {
                toast.success("Đặt mật khẩu mới thành công");
                form.resetFields();
                setTimeout(() => navigate("/"), 1500);
            }
            else if(errCode === 1 || errCode === 2) {
                navigate("/");
            }
            else if(errCode === 7) {
                toast.error("Đã hết thời gian, hãy gửi yêu cầu mới");
                setIsExpired(true);
            }
            else {
                toast.error("Gửi yêu cầu thất bại"); //errCode === 5
            };
        }
        else {
            toast.error("Mật khẩu cần có độ dài 6 - 20 ký tự");
        };
    };


    return (
        <Horizontal>
            <Spin tip="Đang tải..." spinning={isLoading}>
                <div className="container-fluid bg-light">
                    <div className="row h-100 align-items-center justify-content-center" style={{minHeight: '100vh'}}>
                        <div className="col-12 col-sm-8 col-md-6 col-lg-5 col-xl-4">
                            <div className="bg-secondary rounded p-4 p-sm-5 my-4 mx-3 shadow-container">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <h5 className="text-primary">ĐẶT LẠI MẬT KHẨU</h5>
                                </div>
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleResetPassword}
                                >
                                    <div className="row">
                                        <div className="col-md mt-2">
                                            <Form.Item
                                                label="Mật khẩu mới"
                                                name="password"
                                                rules={[{
                                                    required: true,
                                                    message: "Mật khẩu mới không được rỗng",
                                                }]}
                                            >
                                                <Input.Password
                                                    size="large"
                                                    placeholder="Mật khẩu"
                                                    visibilityToggle={false}
                                                />
                                            </Form.Item>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <Button htmlType="submit" className="btn-primary px-4 w-100">Lưu thông tin</Button>
                                    </div>
                                    <div className="mt-3" hidden={isExpired ? false : true}>
                                        <Link to="/quen-mat-khau" className="text-decoration-none text-primary">Gửi yêu cầu mới</Link>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </Spin>
        </Horizontal>
    );
};