import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, DatePicker, Form, Input, Select } from "antd";
import { Vertical } from "../../../utils/AnimatedPage";
import moment from "moment";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import DataTable from "../../../components/DataTable";
import CommonUtils from "../../../utils/commonUtils";
import billAPI from "../../../services/billAPI";


export default function BillList() {


    //KHAI BÁO BIẾN
    const [pageLoading, setPageLoading] = useState(false);
    const [billList, setBillList] = useState([]);
    const [searchList, setSearchList] = useState(null);
    const [billKeyword, setBillKeyword] = useState("");
    const [patientKeyword, setPatientKeyword] = useState("");


    //ĐỊNH DẠNG DATATABLE
    const detailsPage = "/hoa-don/chi-tiet";
    const columns = [
        {
            title: "Mã hóa đơn",
            dataIndex: "bill_id",
            align: "center",
            render: bill_id => bill_id.toUpperCase()
        },
        {
            title: "Tên bệnh nhân",
            render: obj => obj.Patient.fullname
            
        },
        {
            title: "Số điện thoại",
            align: "center",
            render: obj => obj.Patient.phone
        },
        {
            title: "Tổng tiền",
            align: "right",
            render: obj => CommonUtils.VND.format(obj.total)
        },
        {
            title: "Ngày lập hóa đơn",
            align: "center",
            render: obj => moment(obj.createdAt).format("DD-MM-YYYY")
        },
        {
            title: "Ngày thanh toán",
            align: "center",
            render: obj => moment(obj.updatedAt).format("DD-MM-YYYY")
        },
        {
            title: "Trạng thái",
            render: obj => (
                obj.status ?
                <span className="text-success">Đã thanh toán</span> :
                <span className="text-danger">Chưa thanh toán</span>
            )
        }
    ];


    //CALL API
    useEffect(() => {
        getAllBills();
    }, []);


    //XỬ LÝ LẤY TẤT CẢ HÓA ĐƠN
    const getAllBills = async() => {
        setPageLoading(true);
        const res = await billAPI.getAll();
        setBillList(res.data.data);
        setPageLoading(false);
    };


    //XỬ LÝ LỌC HÓA ĐƠN THEO TRẠNG THÁI
    const handleFilterByStatus = (status) => {
        if(status === -1) {
            setSearchList(null);
        }
        else {
            const list = billList.filter(bill => bill.status === status);
            setSearchList(list);
        };
    };


    //XỬ LÝ TÌM THEO NGÀY LẬP HÓA ĐƠN
    const handleSearchByDate = (date) => {
        const list = billList.filter(bill => moment(bill.createdAt).format("YYYY-MM-DD") === date);
        setSearchList(list);
    };


    //XỬ LÝ TÌM DỊCH VỤ THEO MÃ HÓA ĐƠN
    const handleSearchByBillID = () => {
        if(billKeyword) {
            if(billKeyword.length === 10 && billKeyword.toLowerCase().slice(0, 2) === "hd") {
                const list = billList.filter(bill => {
                    return bill.bill_id === billKeyword.toLowerCase();
                });
                setSearchList(list);
                setBillKeyword("");
            }
            else {
                toast.error("Mã không hợp lệ");
                setSearchList(null);
                setBillKeyword("");
            };
        }
        else {
            setSearchList(null);
        };
    };


    //XỬ LÝ TÌM THEO MÃ/TÊN/SỐ ĐIỆN THOẠI
    const handleSearchByPatientInfo = () => {
        if(patientKeyword) {
            const isPhoneNumber = CommonUtils.checkPhoneNumber(patientKeyword);
            let list;
            if(isPhoneNumber) {
                list = billList.filter(bill => bill.Patient.phone === patientKeyword);
            }
            else if(patientKeyword.length === 10 && patientKeyword.toLowerCase().slice(0, 2) === "bn") {
                list = billList.filter(bill => {
                    return bill.Patient.patient_id === patientKeyword.toLowerCase();
                });
            }
            else {
                list = billList.filter(bill => {
                    return bill.Patient.fullname.toLowerCase().includes(patientKeyword.toLowerCase());
                });
            };
            setSearchList(list);
            setPatientKeyword("");
        }
        else {
            setSearchList(null);
        };
    };


    //XỬ LÝ ENTER
    const handleEnter = (e) => {
        if(e.keyCode === 13) {
            if(billKeyword) {
                handleSearchByBillID();
            }
            else {
                handleSearchByPatientInfo();
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
                                    <span className="text-dark page-title">QUẢN LÝ HÓA ĐƠN</span>
                                    <Link to="/hoa-don/lap-hoa-don">
                                        <Button className="btn-add btn-primary px-4">
                                            THÊM MỚI
                                        </Button>
                                    </Link>
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
                                                options={[
                                                    {
                                                        value: -1,
                                                        label: "Hiển thị tất cả",
                                                        className: "text-primary"
                                                    },
                                                    {value: 0, label: "Chưa thanh toán"},
                                                    {value: 1, label: "Đã thanh toán"}
                                                ]}
                                                onChange={value => handleFilterByStatus(value)}
                                            />
                                        </Form.Item>
                                    </div>
                                    <div className="col-md-2">
                                        <Form.Item label="Tìm theo ngày lập">
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
                                                disabledDate={current => current > dayjs().endOf('day')}
                                            />
                                        </Form.Item>
                                    </div>
                                    <div className="col-md-4">
                                        <Form.Item label="Tìm theo mã hóa đơn">
                                            <div className="d-flex w-100">
                                                <Input
                                                    size="large"
                                                    placeholder="Nhập thông tin"
                                                    value={billKeyword}
                                                    onChange={e => setBillKeyword(e.target.value)}
                                                    onKeyUp={handleEnter}
                                                />
                                                <Button onClick={handleSearchByBillID}>Tìm</Button>
                                            </div>
                                        </Form.Item>
                                    </div>
                                    <div className="col-md-4">
                                        <Form.Item label="Tìm theo mã/tên/số điện thoại bệnh nhân">
                                            <div className="d-flex w-100">
                                                <Input
                                                    size="large"
                                                    placeholder="Nhập thông tin"
                                                    value={patientKeyword}
                                                    onChange={e => setPatientKeyword(e.target.value)}
                                                    onKeyUp={handleEnter}
                                                />
                                                <Button onClick={handleSearchByPatientInfo}>Tìm</Button>
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
                                            list={searchList ? searchList : billList}
                                            detailsPage={detailsPage}
                                            isLoading={pageLoading}
                                            isBillPage={true}
                                            pagination
                                        />
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