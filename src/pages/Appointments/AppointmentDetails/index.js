import "./index.scss";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button, Spin, Table, Select, Input, Popconfirm, InputNumber, Modal, Form, Radio } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { Vertical } from "../../../utils/AnimatedPage";
import moment from "moment";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import CommonUtils from "../../../utils/commonUtils";
import appointmentAPI from "../../../services/appointmentAPI";
import categoryAPI from "../../../services/categoryAPI";
import serviceAPI from "../../../services/serviceAPI";
import scheduleAPI from "../../../services/scheduleAPI";

const CustomSwal = withReactContent(Swal);

export default function AppointmentDetails() {


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


    //KHỞI TẠO CÁC GIÁ TRỊ NGÀY CHO SELECT INPUT CHỌN NGÀY
    const newDate = new Date();
    let dateList = [];
    for(let i = 0; i < 7; i++) {
        let obj = {};
        obj.label = CommonUtils.capitalizeFirstLetter(moment(newDate).add(i, "days").format("dddd - DD/MM"));
        obj.value = moment(newDate).add(i, "days").format("YYYY-MM-DD").valueOf();
        dateList.push(obj);
    };


    //LẤY ID
    const user_id = useSelector(state => state.user.user.user_id);
    const prefix = user_id.slice(0, 2);
    const {appointment_id} = useParams();


    //NAVIGATE, LOADING, MODAL
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [modalForm] = Form.useForm();


    //DỮ LIỆU TỪ API
    const [appointment, setAppointment] = useState(initAppointment);
    const [categoryList, setCategoryList] = useState([]);
    const [serviceList, setServiceList] = useState([]);
    const [detailsList, setDetailsList] = useState(null);


    //SỐ HÀNG CỦA TABLE
    const initRowList = prefix === "bs" ? [{rowId: 1, ordinalNum: 1}] : [];
    const [rowCount, setRowCount] = useState(1);
    const [rowList, setRowList] = useState(initRowList);


    //THÔNG TIN 1 HÀNG CỦA TABLE
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedQuantities, setSelectedQuantities] = useState([]);
    const [descriptionList, setDescriptionList] = useState([]);


    //THÔNG TIN CHO ĐẶT LỊCH HẸN MỚI
    const [scheduleList, setScheduleList] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [isActive, setIsActive] = useState(0); //set giá trị màu nền cho ca khám được chọn


    //ĐỊNH DẠNG DATATABLE
    const editableColumns = [
        {
            title: "STT",
            dataIndex: "ordinalNum",
            align: "center",
            width: "50px"
        },
        {
            title: "Danh mục",
            width: "250px",
            render: obj => (
                <Select
                    size="large"
                    className="w-100"
                    options={
                        categoryList.map(category => {
                            return {
                                value: category.category_id,
                                label: CommonUtils.capitalizeEachWord(category.category_name)
                            }
                        })
                    }
                    value={
                        selectedCategories.length
                        ?
                            selectedCategories.find(category => category.rowId === obj.rowId)
                            ?
                            selectedCategories.find(category => category.rowId === obj.rowId).category_id
                            :
                            ""
                        :
                        ""
                    }
                    onChange={value => handleChooseCategory(obj.rowId, value)}
                />
            )
        },
        {
            title: "Dịch vụ",
            width: "250px",
            render: obj => (
                <Select
                    size="large"
                    className="w-100"
                    disabled={
                        selectedCategories.find(category => category.rowId === obj.rowId)
                        ?
                        false
                        :
                        true
                    }
                    options={
                        selectedCategories.find(category => category.rowId === obj.rowId)
                        ?
                            serviceList.filter(item => item.rowId === obj.rowId)[0]
                            ?
                            serviceList.filter(item => item.rowId === obj.rowId)[0].list.map(service => {
                                return {
                                    value: service.service_id,
                                    label: CommonUtils.capitalizeEachWord(service.service_name),
                                    service: service
                                }
                            })
                            :
                            []
                        :
                        []
                    }
                    value={
                        selectedServices.length
                        ?
                            selectedServices.find(service => service.rowId === obj.rowId)
                            ?
                            selectedServices.find(service => service.rowId === obj.rowId).service_id
                            :
                            ""
                        :
                        ""
                    }
                    onChange={(value, data) => handleChooseService(obj.rowId, value, data.service.price)}
                />
            )
        },
        {
            title: "Số lượng",
            align: "center",
            width: "100px",
            render: obj => (
                <InputNumber
                    size="large"
                    type="number"
                    min={1}
                    className="w-100"
                    defaultValue={1}
                    disabled={
                        selectedServices.find(service => service.rowId === obj.rowId)
                        ?
                        false
                        :
                        true
                    }
                    value={
                        selectedQuantities.length
                        ?
                            selectedQuantities.find(quantity => quantity.rowId === obj.rowId)
                            ?
                            selectedQuantities.find(quantity => quantity.rowId === obj.rowId).quantity
                            :
                            ""
                        :
                        ""
                    }
                    onChange={value => handleChooseQuantity(obj.rowId, value)}
                />
            )
        },
        {
            title: "Mô tả",
            render: obj => (
                <Input
                    size="large"
                    className="w-100"
                    disabled={
                        selectedQuantities.find(quantity => quantity.rowId === obj.rowId)
                        ?
                        false
                        :
                        true
                    }
                    value={
                        descriptionList.length
                        ?
                            descriptionList.find(description => description.rowId === obj.rowId)
                            ?
                            descriptionList.find(description => description.rowId === obj.rowId).description
                            :
                            ""
                        :
                        ""
                    }
                    onChange={e => handleTypeDescripton(obj.rowId, e.target.value)}
                />
            )
        },
        {
            title: "Xóa",
            align: "center",
            width: "50px",
            render: obj => (
                <Popconfirm
                    title="Bạn có muốn xóa?"
                    cancelText="Hủy"
                    okText="Xóa"
                    onConfirm={() => handleDeleteRow(obj.rowId)}
                >
                    <Button>
                        <FontAwesomeIcon icon={faTrashAlt} className="text-primary"/>
                    </Button>
                </Popconfirm>
            )
        }
    ];
    const readOnlyColumns = [
        {
            title: "STT",
            dataIndex: "ordinalNum",
            align: "center",
            width: "50px"
        },
        {
            title: "Danh mục",
            width: "250px",
            render: obj => (
                <p className="text-capitalize mb-0">
                    {
                        selectedCategories.length
                        ?
                            selectedCategories.find(category => category.rowId === obj.rowId)
                            ?
                            selectedCategories.find(category => category.rowId === obj.rowId).category_name
                            :
                            ""
                        :
                        ""
                    }
                </p>
            )
        },
        {
            title: "Dịch vụ",
            width: "250px",
            render: obj => (
                <p className="text-capitalize mb-0">
                    {
                        selectedServices.length
                        ?
                            selectedServices.find(service => service.rowId === obj.rowId)
                            ?
                            selectedServices.find(service => service.rowId === obj.rowId).service_name
                            :
                            ""
                        :
                        ""
                    }
                </p>
            )
        },
        {
            title: "Số lượng",
            align: "center",
            width: "100px",
            render: obj => (
                <p className="mb-0">
                    {
                        selectedQuantities.length
                        ?
                            selectedQuantities.find(quantity => quantity.rowId === obj.rowId)
                            ?
                            selectedQuantities.find(quantity => quantity.rowId === obj.rowId).quantity
                            :
                            ""
                        :
                        ""
                    }
                </p>
            )
        },
        {
            title: "Mô tả",
            render: obj => (
                <p className="mb-0">
                    {
                        descriptionList.length
                        ?
                            descriptionList.find(description => description.rowId === obj.rowId)
                            ?
                            descriptionList.find(description => description.rowId === obj.rowId).description
                            :
                            ""
                        :
                        ""
                    }
                </p>
            )
        }
    ];
    const columns = prefix === "bs" && appointment.status === 1 ? editableColumns : readOnlyColumns;


    //CALL API
    useEffect(() => {
        window.scrollTo({top: 0, behavior: 'smooth'});
        getAppointmentByID();
        getActiveCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    //NẾU LỊCH HẸN CÓ CHI TIẾT DỊCH VỤ -> HIỂN THỊ LÊN TABLE
    useEffect(() => {
        if(detailsList) {
            setRowCount(detailsList.length);
            setRowList(detailsList.map((details, index) => {
                return {
                    rowId: index + 1,
                    ordinalNum: index + 1
                };
            }));
            setSelectedCategories(detailsList.map((details, index) => {
                return {
                    rowId: index + 1,
                    category_id: details.category_id,
                    category_name: details.Category.category_name
                };
            }));
            setSelectedServices(detailsList.map((details, index) => {
                return {
                    rowId: index + 1,
                    service_id: details.service_id,
                    service_name: details.service_name,
                    price: details.price
                };
            }));
            setSelectedQuantities(detailsList.map((details, index) => {
                return {
                    rowId: index + 1,
                    quantity: details.Detail.quantity
                };
            }));
            setDescriptionList(detailsList.map((details, index) => {
                return {
                    rowId: index + 1,
                    description: details.Detail.description
                };
            }));
        };
    }, [detailsList]);


    //HIỂN THỊ DỊCH VỤ THEO DANH MỤC ĐÃ CHỌN
    useEffect(() => {
        if(selectedCategories.length) {
            selectedCategories.forEach(category => {
                getServicesByCategoryID(category.rowId, category.category_id);
            });
        };
    }, [selectedCategories]);


    //XỬ LÝ LẤY LỊCH HẸN THEO ID
    const getAppointmentByID = async() => {
        setIsLoading(true);
        const res = await appointmentAPI.getByID(appointment_id, user_id);
        setIsLoading(false);

        if(res.data.errCode === 0) {
            setAppointment(res.data.data);
            if(res.data.data.details) setDetailsList(res.data.data.details);
        }
        else {
            navigate("/lich-hen");
        };
    };


    //XỬ LÝ LẤY CÁC DANH MỤC ĐANG HOẠT ĐỘNG
    const getActiveCategories = async() => {
        setIsLoading(true);
        const res = await categoryAPI.getActive();
        setCategoryList(res.data.data);
        setIsLoading(false);
    };


    //XỬ LÝ LỌC DỊCH VỤ THEO DANH MỤC ĐÃ CHỌN
    const getServicesByCategoryID = async(rowId, category_id) => {
        setIsLoading(true);
        const res = await serviceAPI.getActiveByCategoryID(category_id);
        setServiceList(list => [
            ...list.filter(service => service.rowId !== rowId),
            {rowId, list: res.data.data}
        ]);
        setIsLoading(false);
    };


    //XỬ LÝ THÊM 1 ROW CHO TABLE
    const handleAddRow = () => {
        setRowList([
            ...rowList,
            {
                rowId: rowList[rowCount - 1].rowId + 1,
                ordinalNum: rowList[rowCount - 1].ordinalNum + 1
            }
        ]);
        setRowCount(rowCount + 1);
    };


    //XỬ LÝ XÓA 1 ROW CHO TABLE
    const handleDeleteRow = (rowId) => {

        //có nhiều hơn 1 row -> xóa row
        if(rowCount > 1) {
            let list = rowList.filter(row => row.rowId !== rowId);
            list = list.map((row, index) => {
                return {
                    rowId: row.rowId,
                    ordinalNum: index + 1
                }
            });
            setRowList(list);
            setRowCount(rowCount - 1);
        };

        //xóa các thông tin của row đó
        setSelectedCategories(selectedCategories.filter(category => {
            return category.rowId !== rowId;
        }));
        setSelectedServices(selectedServices.filter(service => {
            return service.rowId !== rowId;
        }));
        setSelectedQuantities(selectedQuantities.filter(quantity => {
            return quantity.rowId !== rowId;
        }));
        setDescriptionList(descriptionList.filter(description => {
            return description.rowId !== rowId;
        }));
    };


    //XỬ LÝ CHỌN DANH MỤC
    const handleChooseCategory = (rowId, category_id) => {
        setSelectedCategories([
            ...selectedCategories.filter(category => category.rowId !== rowId),
            {rowId, category_id}
        ]);

        //khi thay đổi danh mục thì bỏ các dịch vụ và số lượng của danh mục cũ
        setSelectedServices(selectedServices.filter(service => service.rowId !== rowId));
        setSelectedQuantities([
            ...selectedQuantities.filter(quantity => quantity.rowId !== rowId),
            {rowId, quantity: 1}
        ]);
    };


    //XỬ LÝ CHỌN DỊCH VỤ
    const handleChooseService = (rowId, service_id, price) => {
        setSelectedServices([
            ...selectedServices.filter(service => service.rowId !== rowId),
            {rowId, service_id, price}
        ]);

        //số lượng mặc định là 1 khi chọn/thay đổi dịch vụ 
        setSelectedQuantities([
            ...selectedQuantities.filter(quantity => quantity.rowId !== rowId),
            {rowId, quantity: 1}
        ]);
    };


    //XỬ LÝ CHỌN SỐ LƯỢNG
    const handleChooseQuantity = (rowId, quantity) => {
        setSelectedQuantities([
            ...selectedQuantities.filter(quantity => quantity.rowId !== rowId),
            {rowId, quantity}
        ]);
    };


    //XỬ LÝ LƯU STATE MÔ TẢ
    const handleTypeDescripton = (rowId, description) => {
        setDescriptionList([
            ...descriptionList.filter(description => description.rowId !== rowId),
            {rowId, description}
        ]);
    };


    //XỬ LÝ LƯU THÔNG TIN
    const handleSaveDetails = () => {
        if(selectedServices.length) {
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
                    let detailsList = [];
    
                    rowList.forEach(row => {
                        let obj = {};
                        obj.appointment_id = appointment.appointment_id;
                        obj.service_id = null;
                        obj.quantity = null;
                        obj.description = null;
            
                        const service = selectedServices.find(service => service.rowId === row.rowId);
                        if(service) obj.service_id = service.service_id;
            
                        const quantity = selectedQuantities.find(quantity => quantity.rowId === row.rowId);
                        if(quantity) obj.quantity = quantity.quantity;
            
                        const description = descriptionList.find(description => description.rowId === row.rowId);
                        if(description) obj.description = description.description;
            
                        if(obj.service_id && obj.quantity) detailsList.push(obj);
                    });
    
                    setIsLoading(true);
                    const res = await appointmentAPI.saveDetails({
                        doctor_id: user_id,
                        appointment_id: appointment.appointment_id,
                        detailsList
                    });
                    setIsLoading(false);
    
                    const {errCode, type} = res.data;
                    if(errCode === 0) {
                        toast.success("Lưu thành công");
                    }
                    else if(errCode === 2 && type === "status") {
                        toast.error("Trạng thái lịch hẹn không hợp lệ");
                    }
                    else if(errCode === 2 && type === "doctor") {
                        toast.error("Bạn không phải bác sĩ phụ trách");
                    }
                    else { //errCode === 1
                        toast.error("Gửi yêu cầu thất bại");
                    };
                };
            });
        }
        else {
            toast.error("Lịch hẹn chưa có dịch vụ");
        };
    };


    //XỬ LÝ CHỌN SELECT INPUT NGÀY
    const handleChangeDate = async(date) => {
        setIsLoading(true);
        const res = await scheduleAPI.getDoctorSchedulesByDate(user_id, date);
        setScheduleList(res.data.data);
        setSelectedSchedule(null);
        setIsActive(0);
        setIsLoading(false);
    };


    //XỬ LÝ ĐẶT LỊCH HẸN MỚI
    const handleBookingAppointment = (values) => {
        Swal.fire({
            title: "Xác nhận đặt lịch hẹn?",
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
                const {DoctorSchedule} = selectedSchedule;
                const appointmentInfo = {
                    creator_id: user_id,
                    type_id: values.type_id,
                    doctor_schedule_id: DoctorSchedule.doctor_schedule_id,
                    patient_id: appointment.Patient.patient_id,
                    fullname: appointment.fullname,
                    dob: appointment.dob,
                    gender: appointment.gender,
                    phone: appointment.phone
                };
    
                setIsLoading(true);
                const res = await appointmentAPI.booking(appointmentInfo);
                setIsLoading(false);
    
                const {errCode, type} = res.data;
                if(errCode === 0) {
                    toast.success("Gửi yêu cầu thành công");
                    handleResetState(values.date);
                    setIsOpen(false);
                }
                else if(errCode === 2 && type === "status") {
                    toast.error("Lịch làm việc chưa được duyệt");
                    handleResetState(values.date);
                }  
                else if(errCode === 2 && type === "date") {
                    toast.error("Không thể đặt lịch cho quá khứ");
                    handleResetState(values.date);
                    setIsOpen(false);
                }   
                else if(errCode === 2 && type === "time") {
                    toast.error("Đã qua thời gian của ca khám");
                    handleResetState(values.date);
                }                    
                else if(errCode === 9) {
                    toast.error("Lịch làm việc này không còn khả dụng");
                    handleResetState(values.date);
                }
                else if(errCode === 10) {
                    toast.error("Đã đạt giới hạn đặt 3 lịch hẹn/ngày");
                    handleResetState(values.date);
                    setIsOpen(false);
                }
                else { //errCode === 1 || errCode === 5
                    toast.error("Gửi yêu cầu thất bại");
                    handleResetState(values.date);
                }; 
            };
        });
    };


    //XỬ LÝ RESET STATE CHO MODAL
    const handleResetState = (date) => {
        modalForm.resetFields();
        modalForm.setFieldsValue({
            type_id: 2,
            date: date
        });
        setSelectedSchedule(null);
        setIsActive(0);
        handleChangeDate(date);
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
                setIsLoading(true);
                const res = await appointmentAPI.cancel({
                    appointment_id: appointment.appointment_id,
                    employee_id: user_id
                });
                setIsLoading(false);
        
                const {errCode} = res.data;
                if(errCode === 0) {
                    toast.success("Hủy thành công");
                    navigate("/lich-hen");
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


    return (
        <Vertical>
            <Spin tip="Đang tải..." spinning={isLoading}>
                <div className="container-fluid pt-4">
                    <div className="row bg-light rounded mx-0 mb-4">
                        <div className="col-md">
                            <div className="rounded p-4 bg-secondary">
                                <div className="row mb-3">
                                    <div className="col-md">
                                        <Link to="/lich-hen" className="text-decoration-none text-primary">
                                            <small><FontAwesomeIcon icon={faChevronLeft}/> Quay lại</small>
                                        </Link>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-4 mt-4 d-flex align-items-center justify-content-center">
                                        <p className="mb-0">
                                            <span className="me-3">
                                                Ngày gửi: {moment(appointment.createdAt).format("DD-MM-YYYY")}
                                            </span>
                                            <span>
                                                <b className={`${appointment.status === 1 ? "text-success" : "text-primary"}`}>
                                                    {
                                                        appointment.status === 1 ? "Đã xác nhận" :
                                                        appointment.status === 3 ? "Đã hoàn thành" : ""
                                                    }
                                                </b>
                                            </span>
                                        </p>
                                    </div>
                                    <div className="col-md-4 mt-4 d-flex align-items-center justify-content-center">
                                        <h4 className="text-uppercase text-primary mb-0">Chi tiết lịch hẹn</h4>
                                    </div>
                                    <div className="col-md-4 mt-4 d-flex align-items-center justify-content-center">
                                        {
                                            prefix === "bs"
                                            ?
                                            <>
                                                {
                                                    appointment.status === 1
                                                    ?
                                                    <Button
                                                        className="btn-primary px-4 me-2"
                                                        onClick={handleSaveDetails}
                                                    >
                                                        Lưu thông tin
                                                    </Button>
                                                    :
                                                    <></>
                                                }
                                                <Button
                                                    className="px-4"
                                                    onClick={() => {
                                                        setIsOpen(true);
                                                        handleChangeDate(dateList[0].value);
                                                    }}
                                                >
                                                    Đặt lịch hẹn
                                                </Button>
                                            </>
                                            :
                                            appointment.status === 1
                                            ?
                                                detailsList
                                                ?
                                                <Link
                                                    to={`/hoa-don/lap-hoa-don/${appointment.Patient.patient_id}`}
                                                    state={{
                                                        appointment,
                                                        categories: selectedCategories,
                                                        services: selectedServices,
                                                        quantities: selectedQuantities
                                                    }}
                                                >
                                                    <Button className="btn-primary px-4 me-2">
                                                        Lập hóa đơn
                                                    </Button>
                                                </Link>
                                                :
                                                <Button
                                                    className="px-4"
                                                    onClick={handleCancelAppointment}
                                                >
                                                    Từ chối
                                                </Button>
                                            :
                                            <></>
                                        }
                                    </div>
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
                                                <p><b className="text-dark">Người duyệt:</b></p>
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
                                                <p>{appointment.Employee.fullname}</p>
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
                                <hr/>
                                <div className="row">
                                    <div className="col-md mt-4">
                                        <div className="mb-4 d-flex align-items-center">
                                            <div className="w-75">
                                                <h5 className="text-dark me-3">4. Dịch vụ thực hiện</h5>
                                            </div>
                                            {
                                                prefix === "bs" && appointment.status === 1
                                                ?
                                                <div className="w-25 btn-add-row-container">
                                                    <Button onClick={handleAddRow}>
                                                        <span>Thêm hàng</span>
                                                    </Button>
                                                </div>
                                                :
                                                <></>
                                            }
                                        </div>
                                        <div className="table-responsive">
                                            <Table
                                                columns={columns}
                                                dataSource={rowList}
                                                rowKey={columns[0].dataIndex}
                                                bordered
                                                pagination={false}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Spin>
            <Modal
                open={isOpen}
                onCancel={() => {
                    setIsOpen(false);
                    setSelectedSchedule(null);
                    setIsActive(0);
                    handleChangeDate(dateList[0].value);
                    modalForm.setFieldsValue({
                        type_id: 2,
                        date: dateList[0].value
                    });
                }}
                okButtonProps={{hidden: true}}
                cancelButtonProps={{hidden: true}}
            >
                <Spin tip="Đang tải..." spinning={isLoading}>
                    <div className="text-center">
                        <h5 className="text-uppercase text-primary mb-0">Gửi yêu cầu đặt lịch hẹn</h5>
                        <hr/>
                    </div>
                    <Form
                        form={modalForm}
                        layout="vertical"
                        initialValues={{
                            type_id: 2,
                            date: dateList[0].value
                        }}
                        onFinish={handleBookingAppointment}
                    >
                        <div className="row">
                            <div className="col-md-6 mt-2">
                                <Form.Item label="Loại lịch hẹn" name="type_id">
                                    <Radio.Group>
                                        <Radio value={2}>Tái khám</Radio>
                                        <Radio value={1}>Đặt mới</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </div>
                            <div className="col-md-6 mt-2">
                                <Form.Item label="Ngày hẹn" name="date">
                                    <Select
                                        size="large"
                                        options={dateList}
                                        onChange={value => handleChangeDate(value)}
                                    />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md mt-2" style={{height: "220px"}}>
                                <p className="mb-0">Ca khám</p>
                                {
                                    scheduleList.length
                                    ?
                                    <Vertical>
                                        <div className="d-flex flex-wrap">
                                            {
                                                scheduleList.map((schedule, index) => {
                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`schedule-item py-2 px-3 me-2 mt-3 ${
                                                                isActive &&
                                                                schedule.DoctorSchedule.doctor_schedule_id ===
                                                                selectedSchedule.DoctorSchedule.doctor_schedule_id
                                                                ? "btn-primary" : "bg-gray"
                                                            }`}
                                                            onClick={() => {
                                                                setSelectedSchedule(schedule);
                                                                setIsActive(1);
                                                            }}
                                                        >
                                                            {schedule.Session.time}
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </Vertical>
                                    :
                                    <div className="w-100 h-75 d-flex align-items-center justify-content-center">
                                        <p className="text-danger mb-0">Hiện chưa có lịch làm việc</p>
                                    </div>
                                }
                            </div>
                        </div>
                        <div className="mt-2">
                            <Button htmlType="submit" className="btn-primary px-4 me-2">Đặt lịch hẹn</Button>
                            <Button htmlType="reset" className="px-4">Reset</Button>
                        </div>
                    </Form>
                </Spin>
            </Modal>
        </Vertical>
    );
};