import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, DatePicker, Form, Input } from "antd";
import { Vertical } from "../../../utils/AnimatedPage";
import moment from "moment";
import dayjs from "dayjs";
import DataTable from "../../../components/DataTable";
import CommonUtils from "../../../utils/commonUtils";
import billAPI from "../../../services/billAPI";


export default function BillList() {


    //KHAI BÁO BIẾN
    const [isLoading, setIsLoading] = useState(false);
    const [billList, setBillList] = useState([]);
    const [searchList, setSearchList] = useState(null);
    const [keyword, setKeyword] = useState("");


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
        setIsLoading(true);
        const res = await billAPI.getAll();
        setBillList(res.data.data);
        setIsLoading(false);
    };


    //XỬ LÝ TÌM THEO NGÀY LẬP HÓA ĐƠN
    const handleSearchByDate = (date) => {
        console.log(date);
        const list = billList.filter(bill => moment(bill.createdAt).format("YYYY-MM-DD") === date);
        setSearchList(list);
    };


    //XỬ LÝ TÌM THEO TÊN HOẶC SỐ ĐIỆN THOẠI
    const handleSearchByNameOrPhone = () => {
        if(keyword) {
            const isPhoneNumber = CommonUtils.checkPhoneNumber(keyword);
            if(isPhoneNumber) {
                const list = billList.filter(bill => bill.Patient.phone === keyword);
                setSearchList(list);
                setKeyword("");
            }
            else {
                const list = billList.filter(bill => {
                    return bill.Patient.fullname.toLowerCase().includes(keyword.toLowerCase());
                });
                setSearchList(list);
                setKeyword("");
            };
        }
        else {
            setSearchList(null);
        };
    };


    //XỬ LÝ ENTER
    const handleEnter = (e) => {
        if(e.keyCode === 13) handleSearchByNameOrPhone();
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
                                    <div className="col-md-4">
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
                                        <Form.Item label="Tìm theo tên/số điện thoại bệnh nhân">
                                            <div className="d-flex w-100">
                                                <Input
                                                    size="large"
                                                    placeholder="Nhập thông tin"
                                                    value={keyword}
                                                    onChange={e => setKeyword(e.target.value)}
                                                    onKeyUp={handleEnter}
                                                />
                                                <Button onClick={handleSearchByNameOrPhone}>Tìm</Button>
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
                                            isLoading={isLoading}
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