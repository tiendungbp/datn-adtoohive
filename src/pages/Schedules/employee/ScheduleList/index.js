import "./index.scss";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Form } from "antd";
import { DatePicker } from "rsuite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons";
import { Vertical } from "../../../../utils/AnimatedPage";
import moment from "moment";
import localization from "moment/locale/vi";
import DataTable from "../../../../components/DataTable";
import scheduleAPI from "../../../../services/scheduleAPI";
import CommonUtils from "../../../../utils/commonUtils";


export default function ScheduleList() {


    //KHAI BÁO BIẾN
    const [scheduleList, setScheduleList] = useState([]);
    const [pageLoading, setPageLoading] = useState(false);
    const [week, setWeek] = useState(moment().isoWeek());
    const [year, setYear] = useState(new Date().getFullYear());
    const user_id = useSelector(state => state.user.user.user_id);


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
        ...daysOfWeek.map(item => {
            return {
                title: CommonUtils.capitalizeFirstLetter(item.label),
                align: "center",
                key: obj => obj.user.user_id,
                render: obj => (
                    obj.schedules.map((schedule, index) => {
                        if(schedule.date === item.value) {
                            if(schedule.list.length) {
                                const notAccepted = schedule.list.find(listItem => !listItem.UserSchedule.status)
                                if(notAccepted) {
                                    return (
                                        <Link key={index} to={`${detailsPage}/${item.value}`}>
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
                                    <Link key={index} to={`${detailsPage}/${item.value}`}>
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
        const res = await scheduleAPI.getUserSchedulesByWeek(user_id, week, year);
        setScheduleList(res.data.data);
        setPageLoading(false);
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
                                </div>
                            </div>
                        </div>
                        <div className="rounded p-4 bg-secondary">
                            <Form layout="vertical">
                                <div className="row mb-4">
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
                                </div>
                            </Form>
                            <div className="row">
                                <div className="col-md">
                                    <div className="table-responsive">
                                        <DataTable
                                            columns={columns}
                                            list={scheduleList}
                                            isLoading={pageLoading}
                                            isSchedulePage={true}
                                            bordered
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