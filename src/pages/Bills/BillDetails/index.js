import "./index.scss";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { Button, Spin, Table, Select, Input, Popconfirm, InputNumber, Modal } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { Vertical } from "../../../utils/AnimatedPage";
import toast from "react-hot-toast";
import moment from "moment";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ReactToPrint from "react-to-print";
import CommonUtils from "../../../utils/commonUtils";
import patientAPI from "../../../services/patientAPI";
import categoryAPI from "../../../services/categoryAPI";
import serviceAPI from "../../../services/serviceAPI";
import billAPI from "../../../services/billAPI";


export default function BillDetails() {


    //LẤY ID
    const {patient_id, bill_id} = useParams();
    const user_id = useSelector(state => state.user.user.user_id); //id lễ tân


    //NAVIGATE, LOADING, USEREF, OPEN MODAL
    const navigate = useNavigate();
    const pdfRef = useRef();
    const [pageLoading, setPageLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);


    //DỮ LIỆU TỪ API
    const [categoryList, setCategoryList] = useState([]);
    const [serviceList, setServiceList] = useState([]);
    const [detailsList, setDetailsList] = useState(null);

    
    //STATE
    const [patient, setPatient] = useState(null);
    const [bill, setBill] = useState(null);
    const [total, setTotal] = useState(0);
    const [method, setMethod] = useState(null);


    //LẤY DỮ LIỆU KHI CHỌN LẬP HÓA ĐƠN TỪ TRANG CHI TIẾT LỊCH HẸN
    const {state} = useLocation();
    const appointment = state?.appointment? state.appointment : null;
    let stateRowCount, stateRowList;
    let stateCategories, stateServices, stateQuantities;

    if(state) {
        stateRowCount = state.categories.length;
        stateRowList = state.categories.map((category, index) => {
            return {
                rowId: index + 1,
                ordinalNum: index + 1
            };
        });
        stateCategories = state.categories.map((category, index) => {
            return {
                rowId: index + 1,
                category_id: category.category_id,
                category_name: category.category_name
            };
        });
        stateServices = state.services.map((service, index) => {
            return {
                rowId: index + 1,
                service_id: service.service_id,
                service_name: service.service_name,
                price: service.price
            };
        });
        stateQuantities = state.quantities.map((quantity, index) => {
            return {
                rowId: index + 1,
                quantity: quantity.quantity
            };
        });
    };


    //SỐ HÀNG CỦA TABLE
    const [rowCount, setRowCount] = useState(state ? stateRowCount : 1);
    const [rowList, setRowList] = useState(state ? stateRowList : [{rowId: 1, ordinalNum: 1}]);


    //THÔNG TIN 1 HÀNG CỦA TABLE
    const [selectedCategories, setSelectedCategories] = useState(state ? stateCategories : []);
    const [selectedServices, setSelectedServices] = useState(state ? stateServices : []);
    const [selectedQuantities, setSelectedQuantities] = useState(state ? stateQuantities : []);


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
            title: "Đơn giá",
            render: obj => (
                <Input
                    size="large"
                    className="w-100"
                    readOnly
                    disabled={
                        selectedServices.find(service => service.rowId === obj.rowId)
                        ?
                        false
                        :
                        true
                    }
                    value={
                        selectedServices.length
                        ?
                            selectedServices.find(service => service.rowId === obj.rowId)
                            ?
                            CommonUtils.VND.format(selectedServices.find(service => service.rowId === obj.rowId).price)
                            :
                            ""
                        :
                        ""
                    }
                />
            )
        },
        {
            title: "Thành tiền",
            render: obj => (
                <Input
                    size="large"
                    className="w-100"
                    readOnly
                    disabled={
                        selectedServices.find(service => service.rowId === obj.rowId)
                        ?
                        false
                        :
                        true
                    }
                    value={
                        selectedServices.length
                        ?
                            selectedServices.find(service => service.rowId === obj.rowId)
                            ?
                            CommonUtils.VND.format(
                                selectedServices.find(service => {
                                    return service.rowId === obj.rowId;
                                }).price * selectedQuantities.find(quantity => {
                                    return quantity.rowId === obj.rowId
                                }).quantity
                            )
                            :
                            ""
                        :
                        ""
                    }
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
            title: "Đơn giá",
            render: obj => (
                <p className="mb-0 text-end">
                    {
                        selectedServices.length
                        ?
                            selectedServices.find(service => service.rowId === obj.rowId)
                            ?
                            CommonUtils.VND.format(selectedServices.find(service => service.rowId === obj.rowId).price)
                            :
                            ""
                        :
                        ""
                    }
                </p>
            )
        },
        {
            title: "Thành tiền",
            render: obj => (
                <p className="mb-0 text-end">
                    {
                        selectedServices.length
                        ?
                            selectedServices.find(service => service.rowId === obj.rowId)
                            ?
                            CommonUtils.VND.format(
                                selectedServices.find(service => {
                                    return service.rowId === obj.rowId;
                                }).price * selectedQuantities.find(quantity => {
                                    return quantity.rowId === obj.rowId
                                }).quantity
                            )
                            :
                            ""
                        :
                        ""
                    }
                </p>
            )
        },
    ];
    const columns = bill_id ? readOnlyColumns : editableColumns;


    //CALL API
    useEffect(() => {
        window.scrollTo({top: 0, behavior: 'smooth'});

        getPatientByID();
        getActiveCategories();
        if(bill_id) getBillByID();
    }, [bill_id]);


    //NẾU HÓA ĐƠN CÓ CHI TIẾT DỊCH VỤ -> HIỂN THỊ LÊN TABLE
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
                    quantity: details.BillService.quantity
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


    //TÍNH TỔNG TIỀN KHI LẬP HÓA ĐƠN
    useEffect(() => {
        if(selectedCategories.length) {
            let total = 0;
            selectedServices.forEach(service => {
                const quantity = selectedQuantities.find(quantity => quantity.rowId === service.rowId).quantity;
                total += quantity * service.price;
            });
            setTotal(total);
        };
    }, [selectedCategories, selectedServices, selectedQuantities]);


    //XỬ LÝ LẤY BỆNH NHÂN THEO ID
    const getPatientByID = async() => {
        setPageLoading(true);
        const res = await patientAPI.getByID(patient_id);
        if(res.data.errCode === 0) {
            setPatient(res.data.data);
        }
        else {
            navigate("/hoa-don");
        };
        setPageLoading(false);
    };


    //XỬ LÝ LẤY HÓA ĐƠN THEO ID
    const getBillByID = async() => {
        setPageLoading(true);
        const res = await billAPI.getByID(bill_id);
        if(res.data.errCode === 0) {
            const {details, ...rest} = res.data.data;
            setBill(rest);
            setDetailsList(details);

            let total = 0;
            details.forEach(item => total += item.BillService.subtotal);
            setTotal(total);
        }
        else {
            navigate("/hoa-don");
        };
        setPageLoading(false);
    };

    //XỬ LÝ LẤY CÁC DANH MỤC ĐANG HOẠT ĐỘNG
    const getActiveCategories = async() => {
        setPageLoading(true);
        const res = await categoryAPI.getActive();
        setCategoryList(res.data.data);
        setPageLoading(false);
    };


    //XỬ LÝ LỌC DỊCH VỤ THEO DANH MỤC ĐÃ CHỌN
    const getServicesByCategoryID = async(rowId, category_id) => {
        setPageLoading(true);
        const res = await serviceAPI.getActiveByCategoryID(category_id);
        setServiceList(list => [
            ...list.filter(service => service.rowId !== rowId),
            {rowId, list: res.data.data}
        ]);
        setPageLoading(false);
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


    //XỬ LÝ LẬP HÓA ĐƠN
    const handleCreateBill = () => {
        if(selectedServices.length) {
            Swal.fire({
                title: "Xác nhận lập hóa đơn?",
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
                    let list = [];
    
                    rowList.forEach(row => {
                        let obj = {};
                        obj.service_id = null;
                        obj.quantity = null;
                        obj.price = null;
            
                        const service = selectedServices.find(service => service.rowId === row.rowId);
                        if(service) {
                            obj.service_id = service.service_id;
                            obj.price = service.price;
                        };
                        const quantity = selectedQuantities.find(quantity => quantity.rowId === row.rowId);
                        if(quantity) obj.quantity = quantity.quantity;
            
                        if(obj.service_id && obj.quantity) list.push(obj);
                    });
    
                    setPageLoading(true);
                    const res = await billAPI.create({
                        appointment_id: appointment ? appointment.appointment_id : null,
                        patient_id: patient_id,
                        employee_id: user_id,
                        list: list
                    });
                    setPageLoading(false);
    
                    const {errCode, data} = res.data;
                    if(errCode === 0) {
                        toast.success("Lập hóa đơn thành công");
                        navigate(`/hoa-don/chi-tiet/${patient_id}/${data.bill_id}`);
                    }
                    else { //errCode === 1 || errCode === 5
                        toast.error("Gửi yêu cầu thất bại");
                    };
                };
            });
        }
        else {
            toast.error("Hóa đơn chưa có dịch vụ");
        };
    };


    //XỬ LÝ XÁC NHẬN THANH TOÁN
    const handleConfirmBill = () => {
        if(method) {
            Swal.fire({
                title: "Xác nhận đã thanh toán?",
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
                    setPageLoading(true);
                    const res = await billAPI.confirm({
                        bill_id,
                        method_id: method
                    });
                    setPageLoading(false);
    
                    const {errCode} = res.data;
                    if(errCode === 0) {
                        toast.success("Xác nhận thành công");
                        setMethod(null);
                        getBillByID();
                    }
                    else if(errCode === 2) {
                        toast.error("Trạng thái hóa đơn không hợp lệ");
                    }
                    else { //errCode === 1 || errCode === 5
                        toast.error("Gửi yêu cầu thất bại");
                    };
                };
            });
        }
        else {
            toast.error("Bạn chưa chọn phương thức thanh toán");
        };
    };


    //XỬ LÝ DOWNLOAD HÓA ĐƠN
    const handleDownloadBill = () => {
        const input = pdfRef.current;
        html2canvas(input, {useCORS: true, scale: 2}).then(canvas => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4", true);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth/imgWidth, pdfHeight/imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            pdf.addImage(imgData, "PNG", imgX, null, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`HoaDon_${bill.bill_id}`);
        });
    };


    //XỬ LÝ GỬI HÓA ĐƠN TỚI EMAIL
    const handleSendBillToEmail = () => {
        Swal.fire({
            title: "Xác nhận gửi email?",
            confirmButtonText: "Xác nhận",
            showCancelButton: true,
            cancelButtonText: "Hủy",
            customClass: {
                title: "fs-5 fw-normal text-dark",
                confirmButton: "btn-primary shadow-none",
                cancelButton: "btn-secondary-cancel shadow-none",
            },
        })
        .then((result) => {
            if(result.isConfirmed) {
                const input = pdfRef.current;
                html2canvas(input, {useCORS: true, scale: 2}).then(async canvas => {
                    const imgData = canvas.toDataURL("image/png");
                    const pdf = new jsPDF("p", "mm", "a4", true);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const imgWidth = canvas.width;
                    const imgHeight = canvas.height;
                    const ratio = Math.min(pdfWidth/imgWidth, pdfHeight/imgHeight);
                    const imgX = (pdfWidth - imgWidth * ratio) / 2;
                    pdf.addImage(imgData, "PNG", imgX, null, imgWidth * ratio, imgHeight * ratio);
                    const data = pdf.output("datauristring");
        
                    setModalLoading(true);
                    const res = await billAPI.sendToEmail({
                        patient_id: patient.patient_id,
                        filename: `HoaDon_${bill.bill_id}.pdf`,
                        file: data
                    });
                    setModalLoading(false);
        
                    if(res.data.errCode === 0) {
                        toast.success("Gửi thành công");
                    }
                    else { //errCode === 1
                        toast.error("Gửi yêu cầu thất bại");
                    };
                });
            };
        });
    };


    return (
        <Vertical>
            <div className="container-fluid pt-4">
                <div className="row bg-light rounded mx-0 mb-4">
                    <div className="col-md">
                        <div className="rounded p-4 bg-secondary">
                            <div className="row mb-3">
                                <div className="col-md">
                                    <Link
                                        to={`${bill_id ? "/hoa-don" : "/hoa-don/lap-hoa-don"}`}
                                        className="text-decoration-none text-primary"
                                    >
                                        <small><FontAwesomeIcon icon={faChevronLeft}/> Quay lại</small>
                                    </Link>
                                </div>
                            </div>
                            <Spin tip="Đang tải..." spinning={pageLoading}>
                                <div className="row">
                                    <div className="col-md-4 mt-4 d-flex align-items-center justify-content-center">
                                        <img alt="" className="w-75" src={process.env.REACT_APP_LOGO}/>
                                    </div>
                                    <div className="col-md-4 mt-4 d-flex align-items-center justify-content-center">
                                        <h4 className="text-uppercase text-primary mb-0">Chi tiết hóa đơn</h4>
                                    </div>
                                    <div className="col-md-4 mt-4 d-flex align-items-center justify-content-center">
                                        {
                                            bill_id
                                            ?
                                                bill && bill.status
                                                ?
                                                <Button
                                                    className="btn-primary px-4"
                                                    onClick={() => setIsOpen(true)}
                                                >
                                                    Xuất hóa đơn
                                                </Button>
                                                :
                                                <Button
                                                    className="btn-primary px-4"
                                                    onClick={handleConfirmBill}
                                                >
                                                    Xác nhận thanh toán
                                                </Button>
                                            :
                                            <Button
                                                className="btn-primary px-4"
                                                onClick={handleCreateBill}
                                            >
                                                Lập hóa đơn
                                            </Button>
                                        }
                                    </div>
                                </div>
                                <hr/>
                                <div className="row appointment-details">
                                    <div className="col-md-4 mt-4">
                                        <h5 className="text-dark mb-4">1. Thông tin bệnh nhân</h5>
                                        <div className="d-flex">
                                            <div className="left-content">
                                                <p><b className="text-dark">Mã bệnh nhân:</b></p>
                                                <p><b className="text-dark">Họ và tên:</b></p>
                                                <p><b className="text-dark">Ngày sinh:</b></p>
                                                <p><b className="text-dark">Giới tính:</b></p>
                                                <p><b className="text-dark">Số điện thoại:</b></p>
                                            </div>
                                            <div className="right-content">
                                                <p>{patient ? patient.patient_id.toUpperCase() : ""}</p>
                                                <p>{patient ? patient.fullname : ""}</p>
                                                <p>{patient ? moment(patient.dob).format("DD-MM-YYYY") : ""}</p>
                                                <p>{patient ? patient.gender ? "Nam" : "Nữ" : ""}</p>
                                                <p>{patient ? patient.phone : ""}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4 mt-4">
                                        <h5 className="text-dark mb-4">2. Thông tin hóa đơn</h5>
                                        <div className="d-flex">
                                            <div className="left-content">
                                                <p><b className="text-dark">Mã hóa đơn:</b></p>
                                                <p><b className="text-dark">Người lập:</b></p>
                                                <p><b className="text-dark">Ngày lập:</b></p>
                                                <p><b className="text-dark">Trạng thái:</b></p>
                                            </div>
                                            <div className="right-content">
                                                <p>{bill ? bill.bill_id.toUpperCase() : "Chưa có thông tin"}</p>
                                                <p>{bill ? bill.Employee.fullname : "Chưa có thông tin"}</p>
                                                <p>{bill ? moment(bill.createdAt).format("DD-MM-YYYY") : "Chưa có thông tin"}</p>
                                                <p className={`${bill ? bill.status ? "text-success" : "text-danger" : "text-primary"}`}>
                                                    {bill ? bill.status ? "Đã thanh toán" : "Chưa thanh toán" : "Chờ lưu"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4 mt-4">
                                        <h5 className="text-dark mb-4">3. Thông tin thanh toán</h5>
                                        <div className="d-flex">
                                            <div className="left-content">
                                                <p><b className="text-dark">Tổng tiền</b></p>
                                            </div>
                                            <div className="right-content">
                                                <p>
                                                    <b className="text-danger">
                                                        {CommonUtils.VND.format(total)}
                                                    </b>
                                                </p>
                                            </div>
                                        </div>
                                        {
                                            bill_id
                                            ?
                                            <>
                                                {
                                                    bill && bill.status
                                                    ?
                                                    <div className="d-flex">
                                                        <div className="left-content">
                                                            <p><b className="text-dark">Phương thức:</b></p>
                                                            <p><b className="text-dark">Ngày T.Toán:</b></p>
                                                        </div>
                                                        <div className="right-content">
                                                            <p>{bill?.Method?.method_name}</p>
                                                            <p>{bill ? moment(bill.updatedAt).format("DD-MM-YYYY") : "Chưa có thông tin"}</p>
                                                        </div>
                                                    </div>                                                 
                                                    :
                                                    <>
                                                        <p><b className="text-dark">Phương thức:</b></p>
                                                        <Select
                                                            size="large"
                                                            className="w-100"
                                                            placeholder="Chọn phương thức"
                                                            options={[
                                                                {value: 2, label: "Tiền mặt"},
                                                                {value: 3, label: "Chuyển khoản"},
                                                                {value: 4, label: "Thẻ"},
                                                                {value: 5, label: "Ví điện tử"},
                                                            ]}
                                                            onChange={value => setMethod(value)}
                                                        />
                                                    </>
                                                }
                                            </>
                                            :
                                            <></>
                                        }
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
                                                bill_id
                                                ?
                                                <></>
                                                :
                                                <div className="w-25 btn-add-row-container">
                                                    <Button onClick={handleAddRow}>
                                                        <span>Thêm hàng</span>
                                                    </Button>
                                                </div>
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
                            </Spin>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                open={isOpen}
                onCancel={() => setIsOpen(false)}
                width={793}
                okButtonProps={{hidden: true}}
                cancelButtonProps={{hidden: true}}
            >
                <Spin tip="Đang tải..." spinning={modalLoading}>
                    <div ref={pdfRef} className="w-100 px-5 pt-5">
                        <div className="row">
                            <div className="col-md-6 mb-4">
                                <img alt="" src={process.env.REACT_APP_LOGO} style={{width: "200px"}}/>
                            </div>
                            <div className="col-md-6 mb-4 text-end">
                                <small>180 Cao Lỗ, Phường 04, Quận 08, TP.HCM</small><br/>
                                <small>076 1234 567</small>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md">
                                <div className="text-center">
                                    <h4 className="text-uppercase mb-4"><b>Hóa đơn dịch vụ</b></h4>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 d-flex mt-4">
                                <div style={{width: "150px"}}>
                                    <p><b>Mã bệnh nhân:</b></p>
                                    <p><b>Họ và tên:</b></p>
                                    <p><b>Ngày sinh:</b></p>
                                    <p><b>Giới tính:</b></p>
                                    <p><b>Số điện thoại:</b></p>
                                </div>
                                <div>
                                    <p>{patient ? patient.patient_id.toUpperCase() : ""}</p>
                                    <p>{patient ? patient.fullname : ""}</p>
                                    <p>{patient ? moment(patient.dob).format("DD-MM-YYYY") : ""}</p>
                                    <p>{patient ? patient.gender ? "Nam" : "Nữ" : ""}</p>
                                    <p>{patient ? patient.phone : ""}</p>
                                </div>
                            </div>
                            <div className="col-md-6 d-flex mt-4">
                                <div style={{width: "150px"}}>
                                    <p><b>Mã hóa đơn:</b></p>
                                    <p><b>Người lập:</b></p>
                                    <p><b>Ngày lập:</b></p>
                                    <p><b>Ngày thanh toán:</b></p>
                                    <p><b>Phương thức:</b></p>
                                </div>
                                <div>
                                    <p>{bill ? bill.bill_id.toUpperCase() : ""}</p>
                                    <p>{bill ? bill.Employee.fullname : ""}</p>
                                    <p>{bill ? moment(bill.createdAt).format("DD-MM-YYYY") : ""}</p>
                                    <p>{bill ? moment(bill.updatedAt).format("DD-MM-YYYY") : ""}</p>
                                    <p>{bill?.Method?.method_name}</p>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md mt-4">
                                <div className="table-responsive">
                                    <Table
                                        columns={[columns[0], columns[2], columns[3], columns[4], columns[5]]}
                                        dataSource={rowList}
                                        rowKey={columns[0].dataIndex}
                                        bordered
                                        pagination={false}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md mt-4">
                                <h5 className="mb-4 text-end">Tổng tiền: {CommonUtils.VND.format(total)}</h5>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mt-4 text-center">
                                <p className="mb-0">
                                    <b>Bệnh nhân</b>
                                </p>
                                <small>(Ký tên)</small>
                                <p className="mt-5 pt-3">
                                    <b>{patient ? patient.fullname.toUpperCase() : ""}</b>
                                </p>
                            </div>
                            <div className="col-md-6 mt-4 text-center">
                                <p className="mb-0">
                                    <b>Người lập hóa đơn</b>
                                </p>
                                <small>(Ký tên)</small>
                                <p className="mt-5 pt-3">
                                    <b>{bill ? bill.Employee.fullname.toUpperCase() : ""}</b>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="px-5">
                        <hr/>
                        <div className="mt-4 d-flex justify-content-center">
                            <Button
                                className="me-2"
                                style={{width: "150px"}}
                                onClick={handleDownloadBill}
                            >
                                Tải xuống
                            </Button>
                            <ReactToPrint
                                trigger={() => <Button className="btn-primary me-2" style={{width: "150px"}}>In hóa đơn</Button>}
                                content={() => pdfRef.current}
                            />
                            <Button
                                style={{width: "150px"}}
                                onClick={handleSendBillToEmail}
                            >
                                Gửi email
                            </Button>
                        </div>
                    </div>
                </Spin>
            </Modal>
        </Vertical>
    );
};