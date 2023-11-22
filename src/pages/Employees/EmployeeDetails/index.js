import 'react-markdown-editor-lite/lib/index.css';
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { Form, Input, DatePicker, Radio, Select, Button,
Popconfirm, Spin, Checkbox, Row, Col, Alert, Modal } from "antd";
import { Vertical } from "../../../utils/AnimatedPage";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import CommonUtils from "../../../utils/commonUtils";
import locationAPI from "../../../services/locationAPI";
import employeeAPI from "../../../services/employeeAPI";
import doctorAPI from "../../../services/doctorAPI";
import categoryAPI from "../../../services/categoryAPI";
import authAPI from "../../../services/authAPI";
import imageAPI from "../../../services/imageAPI";


const mdParser = new MarkdownIt(/* Markdown-it options */);


export default function EmployeeDetails() {


    //KHAI BÁO BIẾN
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [confirmSaveForm] = Form.useForm();
    const [unblockForm] = Form.useForm();
    const [values, setValues] = useState(null);


    //API ĐỊA CHỈ VÀ ĐỊA CHỈ CHỌN TỪ SELECT
    const [cityList, setCityList] = useState([]);
    const [districtList, setDistrictList] = useState([]);
    const [wardList, setWardList] = useState([]);
    const [city, setCity] = useState(null);
    const [district, setDistrict] = useState(null);
    const [ward, setWard] = useState(null);
    const [street, setStreet] = useState(null);


    //API DANH MỤC, DANH MỤC CỦA BÁC SĨ, VAI TRÒ ĐƯỢC CHỌN
    const [categoryList, setCategoryList] = useState([]);
    const [doctorCategories, setDoctorCategories] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);


    //THÔNG TIN ẢNH
    const [localPath, setLocalPath] = useState(null);
    const [file, setFile] = useState(null);


    //LOADING, HIDDEN, MỞ MODAL
    const [pageLoading, setPageLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [isHidden, setIsHidden] = useState(true);
    const [isAlertHidden, setIsAlertHidden] = useState(true);
    const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
    const [isUnblockOpen, setIsUnblockOpen] = useState(false);


    //CUSTOM EDITOR
    const markdownPlugins = [
        "header",
        "font-italic",
        "font-underline",
        "font-strikethrough",
        "list-unordered",
        "list-ordered",
        "block-quote",
        "table",
        "link",
        "clear",
        "logger",
        "mode-toggle"
    ];
    const [html, setHtml] = useState("");
    const [markdown, setMarkdown] = useState("");


    //LẤY THÔNG TIN NHÂN VIÊN CẦN SỬA, THÔNG TIN ADMIN
    const [user, setUser] = useState(null);
    const {user_id} = useParams();
    let role;
    if(user_id) {
        const prefix = user_id.slice(0, 2);
        switch (prefix) {
            case "qt": role = 2; break;
            case "lt": role = 3; break;
            case "bs": role = 4; break;
            case "pt": role = 5; break;
            default: break;
        };
    };
    const admin = useSelector(state => state.user.user);


    //KHỞI TẠO GIÁ TRỊ CHO CHỨC NĂNG SỬA
    const initInfo = {
        role:
            user ?
                role === 2 ? 'Quản trị viên' :
                role === 3 ? 'Lễ tân' :
                role === 4 ? 'Bác sĩ' : 'Phụ tá'
            : null
        ,
        fullname: user ? user.fullname : null,
        dob: user ? dayjs(user.dob) : null,
        gender: user ? user.gender : 1,
        phone: user ? user.phone : null,
        degree: user && user.degree ? user.degree : null,
        start_date: user && user.start_date ? dayjs(user.start_date) : null,
        street: user && user.street ? user.street : null,
        ward: user && user.ward ? user.ward : null,
        district: user && user.district ? user.district : null,
        city: user && user.city ? user.city : null,
        email: user ? user.email : null,
        categories: doctorCategories
    };


    //CALL API NHÂN VIÊN BẰNG ID & API THÀNH PHỐ
    useEffect(() => {
        window.scrollTo({top: 0, behavior: 'smooth'});
        getAllCities();
        if(user_id) getUserByID();
    }, []);


    //GÁN THÔNG TIN NHÂN VIÊN LÊN FORM
    useEffect(() => {
        if(doctorCategories) form.setFieldsValue({categories: doctorCategories});
        if(user) {
            setIsAlertHidden(user && user.is_blocked ? false : true);
            form.setFieldsValue(initInfo);
            if(user.avatar) setLocalPath(user.avatar);
        };
    }, [form, user, doctorCategories]);


    //LẤY CÁC QUẬN NẾU THÔNG TIN BAN ĐẦU CÓ THÀNH PHỐ
    useEffect(() => {
        if(user && user.city) {
            const city = cityList.find(item => item.name === user.city);
            if(city) {
                const cityCode = city.code;
                getDistrictsByCity(cityCode);
            };
        };
    }, [user, cityList]);


    //LẤY CÁC PHƯỜNG NẾU THÔNG TIN BAN ĐẦU CÓ QUẬN
    useEffect(() => {
        if(user && user.district) {
            const district = districtList.find(item => item.name === user.district);
            if(district) {
                const districtCode = district.code;
                getWardsByDistrict(districtCode);
            };
        };
    }, [user, districtList]);


    //THAY ĐỔI CHỌN SELECT VAI TRÒ
    useEffect(() => {
        window.scrollTo({top: 0, behavior: 'smooth'});

        //case chỉnh sửa
        if(user) {

            //select thay đổi giá trị
            if(selectedRole) {
                if(selectedRole === 4) {
                    getAllCategories();
                    setIsHidden(false);
                }
                else {
                    setIsHidden(true);
                };
            }

            //vai trò ban đầu khi chưa thay đổi select
            else {
                if(user.user_id.slice(0, 2) === "bs") {
                    getAllCategories();
                    getCategoriesByDoctorID();
                    setIsHidden(false);
                    setHtml(user.html);
                    setMarkdown(user.markdown);
                }
                else {
                    setIsHidden(true);
                };
            };
        }

        //case thêm mới
        else {
            if(selectedRole === 4) {
                getAllCategories();
                setIsHidden(false);
            }
            else {
                setIsHidden(true);
            };
        };
    }, [selectedRole, user]);


    //XỬ LÝ LẤY NHÂN VIÊN BẰNG ID
    const getUserByID = async() => {
        let res;
        switch (role) {
            case 2: case 3: case 5:
                res = await employeeAPI.getByID(user_id);
                if(res.data.errCode === 0) {
                    const {employee_id, ...employeeInfo} = res.data.data;
                    setUser({...employeeInfo, user_id: employee_id});
                }
                else {
                    navigate("/nhan-vien");
                };
                break;
            case 4:
                res = await doctorAPI.getByID(user_id);
                if(res.data.errCode === 0) {
                    const {doctor_id, ...doctorInfo} = res.data.data;
                    setUser({...doctorInfo, user_id: doctor_id});
                }
                else {
                    navigate("/nhan-vien");
                };
                break;
            default: break;
        };
    };


    //XỬ LÝ LẤY TẤT CẢ THÀNH PHỐ
    const getAllCities = async() => {
        const res = await locationAPI.getAllCities();
        setCityList(res.data);
    };


    //XỬ LÝ LẤY CÁC QUẬN/HUYỆN THEO THÀNH PHỐ
    const getDistrictsByCity = async(city_code) => {
        const res = await locationAPI.getAllDistricts();
        setDistrictList(res.data.filter(data => data.province_code === city_code));
    };


    //XỬ LÝ LẤY CÁC PHƯỜNG/XÃ THEO QUẬN/HUYỆN
    const getWardsByDistrict = async(district_code) => {
        const res = await locationAPI.getAllWards();
        setWardList(res.data.filter(data => data.district_code === district_code));
    };


    //XỬ LÝ LẤY TẤT CẢ DANH MỤC
    const getAllCategories = async() => {
        const res = await categoryAPI.getAll();
        setCategoryList(res.data.data);
    };


    //XỬ LÝ LẤY DANH MỤC THEO BÁC SĨ
    const getCategoriesByDoctorID = async() => {
        const res = await categoryAPI.getAllByDoctorID(user.user_id);
        const {data} = res.data;
        let list = [];
        data.forEach(category => list.push(category.category_id));
        setDoctorCategories(list);
    };


    //XỬ LÝ CHỌN ẢNH TỪ MÁY
    const handleChooseAvatar = async(e) => {
        const file = e.target.files[0];
        if(file) {
            if(file.size <= 5242880) {
                const compressedFile = await CommonUtils.compressImage(file);
                setFile(compressedFile);
                setLocalPath(URL.createObjectURL(compressedFile));
            }
            else {
                const size = Math.round(((file.size / 1024)/1024) * 100) / 100;
                toast.error(`Kích thước ${size}MB vượt quá giới hạn`);
            };
        };
    };


    //XỬ LÝ XÓA AVATAR
    const handleDeleteAvatar = () => {
        setLocalPath(null);
        setFile(null);
        toast.success("Xóa thành công");
    };


    //XỬ LÝ THAY ĐỔI EDITOR MÔ TẢ BÁC SĨ
    const handleEditorChange = ({html, text}) => {
        setHtml(html);
        setMarkdown(text);
    };


    //XỬ LÝ MỞ MODAL NHẬP MẬT KHẨU XÁC NHẬN
    const handleOpenConfirmSave = (values) => {
        setValues(values);
        setIsConfirmSaveOpen(true);
    };


    //XỬ LÝ CHECK MẬT KHẨU XÁC NHẬN LƯU THÔNG TIN
    const handleCheckPassword = async({password}) => {
        setModalLoading(true);
        const res = await authAPI.checkPassword({
            user_id: admin.user_id,
            role: admin.role,
            password: password
        });
        setModalLoading(false);

        const {errCode} = res.data;
        if(errCode === 0) {
            handleSubmit();
            confirmSaveForm.resetFields();
            setIsConfirmSaveOpen(false);
        }
        else if(errCode === 2) {
            toast.error("Mật khẩu không hợp lệ");
        }
        else {
            toast.error("Gửi yêu cầu thất bại");
        };
    };


    //XỬ LÝ THÊM MỚI NHÂN VIÊN
    const handleCreateEmployee = async(values) => {
        let url;

        if(file) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "user_avatar");

            const res = await imageAPI.uploadImageToCloud(formData);
            if(res.status === 200) url = res.data.secure_url;
        };

        const userInfo = {
            fullname: values.fullname,
            avatar: url,
            dob: values.dob,
            gender: values.gender,
            phone: values.phone,
            degree: values.degree,
            start_date: values.start_date,
            street: street,
            ward: ward,
            district: district,
            city: city,
            email: values.email,
            password: values.password
        };

        let res;
        setPageLoading(true);
        switch (values.role) {
            case 2: case 3: case 5:
                res = await employeeAPI.create({
                    ...userInfo,
                    role: values.role
                });
                break;
            case 4:
                res = await doctorAPI.create({
                    ...userInfo,
                    html: html,
                    markdown: markdown,
                    categories: values.categories
                });
                break;
            default: break;
        };
        setPageLoading(false);

        const {errCode, type} = res.data;
        if(errCode === 0) {
            toast.success("Thêm thành công");
            url = null;
            handleResetState();
            form.resetFields();
        }
        else if(errCode === 2 && type === "phone") {
            toast.error("Số điện thoại đã tồn tại");
        }
        else if(errCode === 2 && type === "email") {
            toast.error("Email đã tồn tại");
        }
        else {
            toast.error("Thêm thất bại"); //errCode === 5
        };
    };


    //XỬ LÝ CẬP NHẬT NHÂN VIÊN
    const handleUpdateEmployee = async(values) => {
        let url;

        if(file) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "user_avatar");

            const res = await imageAPI.uploadImageToCloud(formData);
            if(res.status === 200) url = res.data.secure_url;
        };

        const userInfo = {
            fullname: values.fullname,
            avatar: url ? url : localPath ? user.avatar : null,
            dob: values.dob,
            gender: values.gender,
            phone: values.phone,
            degree: values.degree,
            start_date: values.start_date,
            street: street ? street : values.street,
            ward: ward ? ward : values.ward,
            district: district ? district : values.district,
            city: city ? city : values.city,
            email: values.email
        };

        let res;
        setPageLoading(true);
        switch (role) {
            case 2: case 3: case 5:
                res = await employeeAPI.update(
                    {
                        ...userInfo,
                        role: role
                    },
                    user.user_id
                );
                break;
            case 4:
                res = await doctorAPI.update(
                    {
                        ...userInfo,
                        html: html,
                        markdown: markdown,
                        categories: values.categories
                    },
                    user.user_id
                );
                break;
            default: break;
        };
        setPageLoading(false);

        const {errCode, type} = res.data;
        if(errCode === 0) {
            toast.success("Cập nhật thành công");
        }
        else if(errCode === 2 && type === "phone") {
            toast.error("Số điện thoại đã tồn tại");
        }
        else if(errCode === 2 && type === "email") {
            toast.error("Email đã tồn tại");
        }
        else {
            toast.error("Cập nhật thất bại"); //errCode === 1 || errCode === 5
        };
    };


    //XỬ LÝ SUBMIT FORM
    const handleSubmit = () => {
        let resultCheckAge = CommonUtils.checkEmployeeAge(values.dob.$d);
        let resultCheckPhone = CommonUtils.checkPhoneNumber(values.phone);
        let resultCheckPassword;

        if(resultCheckAge) {
            if(resultCheckPhone) {
                if(!user) {
                    resultCheckPassword = CommonUtils.checkPasswordLength(values.password);
                };
                if(resultCheckPassword || user) {
                    if(user) {
                        handleUpdateEmployee(values);
                    }
                    else {
                        handleCreateEmployee(values);
                    };
                }
                else {
                    toast.error("Mật khẩu cần có độ dài 6 - 20 ký tự");
                };
            }
            else {
                toast.error("Số điện thoại không hợp lệ");
            };
        }
        else {
            toast.error("Nhân viên chưa đủ 18 tuổi");
        };
    };


    //XỬ LÝ MỞ KHÓA TÀI KHOẢN
    const handleUnblockAccount = async(values) => {
        setModalLoading(true);
        const res = await authAPI.unblockAccount({
            admin_id: admin.user_id,
            password: values.password,
            user_id: user.user_id
        });
        setModalLoading(false);

        const {errCode} = res.data;
        if(errCode === 0) {
            toast.success("Đã mở khóa tài khoản");
            unblockForm.resetFields();
            setIsAlertHidden(true);
            setIsUnblockOpen(false);
        }
        else if(errCode === 2) {
            toast.error("Mật khẩu không hợp lệ");
        }
        else {
            toast.error("Gửi yêu cầu thất bại"); //errCode === 1 || errCode === 5
        };
    };


    //XỬ LÝ SET LẠI GIÁ TRỊ CHO STATE
    const handleResetState = () => {
        setLocalPath(null);
        setFile(null);
        setStreet(null);
        setWard(null);
        setDistrict(null);
        setCity(null);
    };


    return (
        <Vertical>
            <div className="container-fluid pt-4">
                <div className="row bg-light rounded mx-0 mb-4">
                    <div className="col-md">
                        <div className="rounded p-4 bg-secondary">
                            <div className="row mb-3">
                                <div className="col-md">
                                    <Link to="/nhan-vien" className="text-decoration-none text-primary">
                                        <small><FontAwesomeIcon icon={faChevronLeft}/> Quay lại</small>
                                    </Link>
                                </div>
                            </div>
                            <Spin tip="Đang tải..." spinning={pageLoading}>
                                <div className="row mb-3">
                                    <div className="col-md">
                                        {
                                            user
                                            ?
                                            <h5 className="text-uppercase text-primary mb-0">
                                                Cập nhật thông tin
                                            </h5>
                                            :
                                            <h5 className="text-uppercase text-primary mb-0">
                                                Thêm nhân viên
                                            </h5>
                                        }
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md d-flex align-items-center flex-wrap">
                                        {
                                            localPath
                                            ? 
                                            <img
                                                className="user-avatar rounded"
                                                src={localPath}
                                                alt=""
                                            />
                                            :
                                            <div className="user-avatar border border-1 d-flex justify-content-center align-items-center rounded">
                                                <small>Chưa có ảnh</small>
                                            </div>
                                        }
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="avatar"
                                            hidden
                                            onChange={handleChooseAvatar}
                                        />
                                        <label className="btn btn-light btn-choose-avatar mx-2" htmlFor="avatar">Chọn</label>
                                        {
                                            localPath
                                            ?
                                            <Popconfirm title="Bạn có muốn xóa ảnh?" cancelText="Hủy" okText="Xóa" onConfirm={handleDeleteAvatar}>
                                                <Button className="me-2">Xóa</Button>
                                            </Popconfirm>
                                            :
                                            <></>
                                        }
                                        <small className="avatar-size-note">Kích thước ảnh tối đa 5MB (JPEG hoặc PNG)</small>
                                    </div>
                                </div>
                                <div className="row mb-3" hidden={isAlertHidden}>
                                    <div className="col-md">
                                        <Alert
                                            showIcon
                                            type="warning"
                                            message="Tài khoản hiện bị khóa"
                                            action={
                                                <Button onClick={() => setIsUnblockOpen(true)}>Mở khóa</Button>
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md">
                                        <Form
                                            form={form}
                                            layout="vertical"
                                            onFinish={handleOpenConfirmSave}
                                            validateMessages={{
                                                types: {
                                                    email: "Email không đúng định dạng"
                                                }
                                            }}
                                            initialValues={{gender: 1}}
                                        >
                                            <div className="row">
                                                <div className="col-md-4 mt-3">
                                                    {
                                                        user
                                                        ?
                                                        <Form.Item label="Vai trò" name="role">
                                                            <Input size="large" readOnly/>
                                                        </Form.Item>
                                                        :
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
                                                                    {value: 5, label: "Phụ tá"}
                                                                ]}
                                                                onChange={value => setSelectedRole(value)}
                                                            />
                                                        </Form.Item>
                                                    }
                                                </div>
                                                <div className="col-md-4 mt-3">
                                                    <Form.Item
                                                        label="Họ và tên"
                                                        name="fullname"
                                                        rules={[{
                                                            required: true,
                                                            message: "Họ và tên không được rỗng"
                                                        }]}
                                                    >
                                                        <Input size="large" placeholder="Họ và tên"/>
                                                    </Form.Item>
                                                </div>
                                                <div className="col-md-4 mt-3">
                                                    <Form.Item label="Giới tính" name="gender">
                                                        <Radio.Group>
                                                            <Radio value={1}>Nam</Radio>
                                                            <Radio value={0}>Nữ</Radio>
                                                        </Radio.Group>
                                                    </Form.Item>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-4 mt-3">
                                                    <Form.Item
                                                        label="Ngày sinh"
                                                        name="dob"
                                                        rules={[{
                                                            required: true,
                                                            message: "Ngày sinh không được rỗng"
                                                        }]}
                                                    >
                                                        <DatePicker
                                                            size="large"
                                                            placeholder="Ngày sinh"
                                                            format="DD-MM-YYYY"
                                                        />
                                                    </Form.Item>
                                                </div>
                                                <div className="col-md-4 mt-3">
                                                    <Form.Item
                                                        label="Số điện thoại"
                                                        name="phone"
                                                        rules={[{
                                                            required: true,
                                                            message: "Số điện thoại không được rỗng"
                                                        }]}
                                                    >
                                                        <Input size="large" placeholder="Số điện thoại"/>
                                                    </Form.Item>
                                                </div>
                                                <div className="col-md-4 mt-3">
                                                    <Form.Item
                                                        label="Bằng cấp"
                                                        name="degree"
                                                        rules={[{
                                                            required:
                                                                selectedRole === 4 ||
                                                                (user && user.user_id.slice(0, 2) === "bs")
                                                                ? true : false,
                                                            message: "Bằng cấp không được rỗng"
                                                        }]}
                                                    >
                                                        <Select
                                                            placeholder="Chọn bằng cấp"
                                                            size="large"
                                                            options={[
                                                                {value: "Cử nhân", label: "Cử nhân"},
                                                                {value: "Thạc sĩ", label: "Thạc sĩ"},
                                                                {value: "Tiến sĩ", label: "Tiến sĩ"}
                                                            ]}
                                                        />
                                                    </Form.Item>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-4 mt-3">
                                                    <Form.Item label="Ngày vào làm" name="start_date">
                                                        <DatePicker
                                                            size="large"
                                                            placeholder="Ngày làm việc"
                                                            format="DD-MM-YYYY"
                                                        />
                                                    </Form.Item>
                                                </div>
                                                <div className="col-md-4 mt-3">
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
                                                <div className="col-md-4 mt-3">
                                                    {
                                                        user
                                                        ?
                                                        <Form.Item
                                                            label="Mật khẩu"
                                                            name="password"
                                                        >
                                                            <Input.Password
                                                                size="large"
                                                                placeholder="Bạn không thể đổi mật khẩu"
                                                                visibilityToggle={false}
                                                                disabled
                                                            />
                                                        </Form.Item>
                                                        :
                                                        <Form.Item
                                                            label="Mật khẩu"
                                                            name="password"
                                                            rules={[{
                                                                required: true,
                                                                message: "Mật khẩu không được rỗng"
                                                            }]}
                                                        >
                                                            <Input.Password
                                                                size="large"
                                                                placeholder="Mật khẩu (6 - 20 ký tự)"
                                                                visibilityToggle={false}
                                                            />
                                                        </Form.Item>
                                                    }
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-4 mt-3">
                                                    <Form.Item label="Thành phố/tỉnh" name="city">
                                                        <Select
                                                            placeholder="Chọn thành phố/tỉnh"
                                                            size="large"
                                                            showSearch
                                                            options={
                                                                cityList.map(data => {
                                                                    return {
                                                                        value: data.name,
                                                                        label: data.name,
                                                                        code: data.code
                                                                    }
                                                                })
                                                            }
                                                            onChange={(value, obj) => {
                                                                setCity(value);
                                                                getDistrictsByCity(obj.code);
                                                            }}
                                                        />
                                                    </Form.Item>
                                                </div>
                                                <div className="col-md-2 mt-3">
                                                    <Form.Item label="Quận/huyện" name="district">
                                                        <Select
                                                            placeholder="Chọn quận/huyện"
                                                            size="large"
                                                            showSearch
                                                            options={
                                                                districtList.map(data => {
                                                                    return {
                                                                        value: data.name,
                                                                        label: data.name,
                                                                        code: data.code
                                                                    }
                                                                })
                                                            }
                                                            onChange={(value, obj) => {
                                                                setDistrict(value);
                                                                getWardsByDistrict(obj.code);
                                                            }}
                                                            disabled={city || (user && user.city) ? false : true}
                                                        />
                                                    </Form.Item>
                                                </div>
                                                <div className="col-md-2 mt-3">
                                                    <Form.Item label="Phường/xã" name="ward">
                                                        <Select
                                                            placeholder="Chọn phường/xã"
                                                            size="large"
                                                            showSearch
                                                            options={
                                                                wardList.map(data => {
                                                                    return {
                                                                        value: data.name,
                                                                        label: data.name,
                                                                        code: data.code
                                                                    }
                                                                })
                                                            }
                                                            onChange={value => setWard(value)}
                                                            disabled={district || (user && user.district) ? false : true}
                                                        />
                                                    </Form.Item>
                                                </div>
                                                <div className="col-md-4 mt-3">
                                                    <Form.Item label="Số nhà và tên đường" name="street">
                                                        <Input
                                                            size="large"
                                                            placeholder="Số nhà và tên đường"
                                                            onChange={e => setStreet(e.target.value)}
                                                            disabled={ward || (user && user.ward) ? false : true}
                                                        />
                                                    </Form.Item>
                                                </div>
                                            </div>
                                            <div className="row" hidden={isHidden}>
                                                <div className="col-md mt-3">
                                                    <Form.Item label="Danh mục điều trị của bác sĩ" name="categories">
                                                        <Checkbox.Group style={{width: '100%'}}>
                                                            <Row>
                                                                {
                                                                    categoryList.map((category, index) => {
                                                                        return <Col span={12} className="mt-2" key={index}>
                                                                            <Checkbox value={category.category_id}>
                                                                                {CommonUtils.capitalizeEachWord(category.category_name)}
                                                                            </Checkbox>
                                                                        </Col>
                                                                    })
                                                                }
                                                            </Row>
                                                        </Checkbox.Group>
                                                    </Form.Item>
                                                </div>
                                            </div>
                                            <div className="row" hidden={isHidden}>
                                                <div className="col-md mt-3">
                                                    <Form.Item label="Mô tả bác sĩ">
                                                        <MdEditor
                                                            style={{height: "500px"}}
                                                            plugins={markdownPlugins}
                                                            value={markdown}
                                                            renderHTML={text => mdParser.render(text)}
                                                            onChange={handleEditorChange}
                                                        />
                                                    </Form.Item>
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <Button htmlType="submit" className="btn-primary px-4 me-2">Lưu thông tin</Button>
                                                <Button htmlType="reset" className="px-4">Reset</Button>
                                            </div>
                                        </Form>
                                    </div>
                                </div>
                            </Spin>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                open={isConfirmSaveOpen}
                onCancel={() => setIsConfirmSaveOpen(false)}
                okButtonProps={{hidden: true}}
                cancelButtonProps={{hidden: true}}
            >
                <Spin tip="Đang tải..." spinning={modalLoading}>
                    <div className="text-center">
                        <h5 className="text-primary">Xác nhận lưu thông tin?</h5>
                        <hr/>
                    </div>
                    <Form
                        form={confirmSaveForm}
                        layout="vertical"
                        onFinish={handleCheckPassword}
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
                            <Button htmlType="submit" className="btn-primary px-4 me-2">Xác nhận</Button>
                            <Button htmlType="reset" className="px-4">Reset</Button>
                        </div>
                    </Form>
                </Spin>
            </Modal>
            <Modal
                open={isUnblockOpen}
                onCancel={() => setIsUnblockOpen(false)}
                okButtonProps={{hidden: true}}
                cancelButtonProps={{hidden: true}}
            >
                <Spin tip="Đang tải..." spinning={modalLoading}>
                    <div className="text-center">
                        <h5 className="text-primary">
                            Mở khóa tài khoản {""}
                            <span className="text-danger">
                                {user ? user.fullname : ""}
                            </span>
                        </h5>
                        <hr/>
                    </div>
                    <Form
                        form={unblockForm}
                        layout="vertical"
                        onFinish={handleUnblockAccount}
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
                            <Button htmlType="submit" className="btn-primary px-4 me-2">Mở khóa</Button>
                            <Button htmlType="reset" className="px-4">Reset</Button>
                        </div>
                    </Form>
                </Spin>
            </Modal>
        </Vertical>
    );
};