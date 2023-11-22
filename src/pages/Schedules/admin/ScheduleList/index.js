import "./index.scss";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Select, Form } from "antd";
import { DatePicker } from "rsuite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons";
import { Vertical } from "../../../../utils/AnimatedPage";
import moment from "moment";
import localization from "moment/locale/vi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import toast from "react-hot-toast";
import DataTable from "../../../../components/DataTable";
import scheduleAPI from "../../../../services/scheduleAPI";
import CommonUtils from "../../../../utils/commonUtils";


const CustomSwal = withReactContent(Swal);


export default function ScheduleList() {


    //LOADING
    const [pageLoading, setPageLoading] = useState(false);


    //DANH SÁCH LỊCH LÀM VIỆC, DANH SÁCH TÌM KIẾM
    const [scheduleList, setScheduleList] = useState([]);
    const [searchList, setSearchList] = useState(null);


    //ISO
    const [week, setWeek] = useState(moment().isoWeek());
    const [year, setYear] = useState(new Date().getFullYear());


    //LẤY 7 NGÀY TRONG TUẦN
    let daysOfWeek = [];
    const date = moment(String(year).padStart(4, "0") + "W" + String(week).padStart(2, "0"));
    for(let i = 0; i < 7; i++) {
        daysOfWeek.push({
            label: date.format("dd - DD/MM/YY"),
            value: date.format("YYYY-MM-DD").valueOf()
        });
        date.add(1, "day");
    };
    

    //ĐỊNH DẠNG DATATABLE
    const detailsPage = "/lich-lam-viec";
    const columns = [
        {
            title: "Ảnh đại diện",
            align: "center",
            key: obj => obj.user.user_id,
            render: obj => (
                obj.user.avatar
                ?
                <img
                    src={obj.user.avatar}
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
            title: "Họ và tên",
            render: obj => obj.user.fullname
        },
        ...daysOfWeek.map(item => {
            return {
                title: CommonUtils.capitalizeFirstLetter(item.label),
                align: "center",
                render: obj => (
                    obj.schedules.map((schedule, index) => {
                        if(schedule.date === item.value) {
                            if(schedule.list.length) {
                                const notAccepted = schedule.list.find(listItem => !listItem.UserSchedule.status)
                                if(notAccepted) {
                                    return (
                                        <Link key={index} to={`${detailsPage}/${obj.user.user_id}/${item.value}`}>
                                            <div className="border border-danger rounded">
                                                <Button className="text-danger border-0">
                                                    <FontAwesomeIcon icon={faCheckCircle} className="me-1"/>
                                                    <span>Xem</span>
                                                </Button>
                                            </div>
                                        </Link>
                                    )
                                }
                                return (
                                    <Link key={index} to={`${detailsPage}/${obj.user.user_id}/${item.value}`}>
                                        <div className="border border-success rounded">
                                            <Button className="text-success border-0">
                                                <FontAwesomeIcon icon={faCheckCircle} className="me-1"/>
                                                <span>Xem</span>
                                            </Button>
                                        </div>
                                    </Link>
                                )
                            }
                            return null
                        }
                        return null
                    })
                )
            }
        })
    ];


    //CALL API
    useEffect(() => {
        getAllSchedulesByWeek();
    }, [week]);


    //XỬ LÝ LẤY TẤT CẢ LỊCH LÀM VIỆC THEO TUẦN
    const getAllSchedulesByWeek = async() => {
        setPageLoading(true);
        const res = await scheduleAPI.getAllByWeek(week, year);
        setScheduleList(res.data.data);
        setPageLoading(false);
    };


    //XỬ LÝ LỌC NHÂN VIÊN THEO VAI TRÒ
    const handleFilterByRole = (role) => {
        let list = [];
        switch (role) {
            case 0: setSearchList(null);
                break;                
            case 2:
                list = scheduleList.filter(item => item.user.user_id.slice(0, 2) === "qt");
                setSearchList(list);
                break;
            case 3:
                list = scheduleList.filter(item => item.user.user_id.slice(0, 2) === "lt");
                setSearchList(list);
                break;
            case 4:
                list = scheduleList.filter(item => item.user.user_id.slice(0, 2) === "bs");
                setSearchList(list);
                break;
            case 5:
                list = scheduleList.filter(item => item.user.user_id.slice(0, 2) === "pt");
                setSearchList(list);
                break;
            default: break;
        };
    };


    //XỬ LÝ DUYỆT LỊCH LÀM VIỆC 1 TUẦN
    const handleAcceptForWeek = () => {
        CustomSwal.fire({
            title: <span>Xác nhận duyệt tuần <b className="text-danger">{week}/{year}</b> ?</span>,
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
                const res = await scheduleAPI.acceptForWeek({week, year});
                setPageLoading(false);

                const {errCode, type} = res.data;
                if(errCode === 0) {
                    toast.success("Duyệt thành công");
                    getAllSchedulesByWeek();
                }
                else if(errCode === 2 && type === "date") {
                    toast.error("Không thể duyệt lịch của quá khứ");
                }
                else if(errCode === 2 && type === "status") {
                    toast.error("Không có lịch cần được duyệt");
                }
                else {
                    toast.error("Gửi yêu cầu thất bại");
                };
            };
        });
    };


    return (
        <Vertical>
            <div className="container-fluid pt-4">
                <div className="row bg-light rounded mx-0 mb-4">
                    <div className="col-md">
                        <div className="rounded p-4 bg-secondary mb-4">
                            <div className="row">
                                <div className="col-md">
                                    <span className="text-dark page-title">QUẢN LÝ LỊCH LÀM VIỆC</span>
                                    <Link to="/lich-lam-viec/them-moi">
                                        <Button className="btn-add btn-primary px-4">THÊM MỚI</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="rounded p-4 bg-secondary">
                            <Form layout="vertical">
                                <div className="row mb-2">
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
                                        <Form.Item label="Tìm theo tuần">
                                            <div className="d-flex w-100">
                                                <DatePicker
                                                    size="lg"
                                                    className="w-100 me-2"
                                                    placeholder="Chọn tuần"
                                                    isoWeek
                                                    showWeekNumbers
                                                    format="dd-MM-yyyy"
                                                    onChange={(date) => {
                                                        setWeek(moment(date).isoWeek());
                                                        setYear(moment(date).year());
                                                    }}
                                                    onClean={() => {
                                                        setWeek(moment().isoWeek());
                                                        setYear(new Date().getFullYear());
                                                    }}
                                                />
                                                <Button
                                                    className="me-1 btn-week-picker"
                                                    onClick={() => setWeek(week - 1)}
                                                >
                                                    <FontAwesomeIcon icon={faCaretLeft}/>
                                                </Button>
                                                <Button
                                                    className="btn-week-picker"
                                                    onClick={() => setWeek(week + 1)}
                                                >
                                                    <FontAwesomeIcon icon={faCaretRight}/>
                                                </Button>
                                            </div>
                                        </Form.Item>
                                    </div>
                                    <div className="col-md-4">
                                        <Form.Item label=" ">
                                            <Button
                                                onClick={handleAcceptForWeek}
                                            >
                                                Duyệt lịch của tuần
                                                <span className="text-danger ms-1 fw-bold">{week}/{year}</span>
                                            </Button>
                                        </Form.Item>
                                    </div>
                                </div>
                            </Form>
                            <div className="row mb-4">
                                <div className="col-md">
                                    <div className="d-flex">
                                        <div className="text-success me-4">
                                            <FontAwesomeIcon icon={faCheckCircle} className="me-2"/>
                                            <span>Đã duyệt</span>
                                        </div>
                                        <div className="text-danger me-4">
                                            <FontAwesomeIcon icon={faCheckCircle} className="me-2"/>
                                            <span>Chưa duyệt</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md">
                                    <div className="table-responsive">
                                        <DataTable
                                            columns={columns}
                                            list={searchList ? searchList : scheduleList}
                                            isLoading={pageLoading}
                                            isSchedulePage={true}
                                            pageSize={5}
                                            bordered
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