import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Table, Button, Popconfirm } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faEdit, faUserSlash, faFileAlt } from "@fortawesome/free-solid-svg-icons";
import { setData } from "../../slices/dataSlice";

export default function DataTable(props) {

    const dispatch = useDispatch();
    const {
        isEmployeePage,
        isPatientPage,
        isOnePage,
        isSchedulePage,
        isAppointmentPage,
        isChoosePatientPage,
        isBillPage,
        isMedicalRecordPage
    } = props;
    const {columns, list, isLoading, detailsPage, pageSize, bordered, pagination} = props;
    const {handleOpenModal, handleDelete} = props

    //ĐỊNH DẠNG COLUMN
    const employeePageColumns = [
        ...columns,
        {
            title: "Khóa",
            dataIndex: "",
            align: "center",
            render: (_, record) => (
                <Button
                    disabled={record.is_blocked ? true : false}
                    className="bg-light"
                    onClick={() => handleOpenModal(record)}
                >
                    <FontAwesomeIcon icon={faUserSlash} className="text-dark"/>
                </Button>
            )
        },
        {
            title: "Xem",
            dataIndex: "",
            align: "center",
            render: (_, record) => (
                <Link to={`${detailsPage}/${record.user_id}`}>
                    <Button className="bg-light">
                        <FontAwesomeIcon icon={faEdit} className="text-dark"/>
                    </Button>
                </Link>
            )
        }
    ];

    const patientPageColumns = [
        ...columns,
        {
            title: "Bệnh án",
            dataIndex: "",
            align: "center",
            render: (_, record) => (
                <Link to={`${detailsPage}/ho-so-benh-an/${record.patient_id}`}>
                    <Button className="bg-light">
                        <FontAwesomeIcon icon={faFileAlt} className="text-dark"/>
                    </Button>
                </Link>
            )
        }
    ];

    const onePageColumns = [
        ...columns,
        {
            title: "Xóa",
            dataIndex: "",
            align: "center",
            render: (_, record) => (
                <Popconfirm
                    title="Bạn có muốn xóa?"
                    cancelText="Hủy"
                    okText="Xóa"
                    onConfirm={() => handleDelete(record)}
                >
                    <Button className="bg-light">
                        <FontAwesomeIcon icon={faTrashAlt} className="text-dark"/>
                    </Button>
                </Popconfirm>
            )
        },
        {
            title: "Xem",
            dataIndex: "",
            align: "center",
            render: (_, record) => (
                <Button
                    className="bg-light"
                    onClick={() => dispatch(setData(record))}
                >
                    <FontAwesomeIcon icon={faEdit} className="text-dark"/>
                </Button>
            )
        }
    ];

    const schedulePageColumns = columns;

    const appointmentPageColumns = columns;

    const choosePatientPageColumns =  [
        ...columns,
        {
            title: "Chọn",
            dataIndex: "",
            align: "center",
            render: (_, record) => (
                <Link to={`${detailsPage}/${record.patient_id}`}>
                    <Button className="bg-light">
                        <FontAwesomeIcon icon={faEdit} className="text-dark"/>
                    </Button>
                </Link>
            )
        }
    ];

    const billPageColumns = [
        ...columns,
        {
            title: "Xem",
            dataIndex: "",
            align: "center",
            render: (_, record) => (
                <Link to={`${detailsPage}/${record.Patient.patient_id}/${record.bill_id}`}>
                    <Button className="bg-light">
                        <FontAwesomeIcon icon={faEdit} className="text-dark"/>
                    </Button>
                </Link>
            )
        }
    ];

    const medicalRecordColumns = columns;

    return (
        <Table
            columns={
                isEmployeePage ? employeePageColumns :
                isPatientPage ? patientPageColumns :
                isOnePage ? onePageColumns :
                isSchedulePage ? schedulePageColumns :
                isAppointmentPage ? appointmentPageColumns :
                isChoosePatientPage ? choosePatientPageColumns : 
                isBillPage ? billPageColumns : 
                isMedicalRecordPage ? medicalRecordColumns : null
            }
            dataSource={list}
            rowKey={isSchedulePage || isMedicalRecordPage ? columns[0].key : columns[0].dataIndex} //prop key
            loading={isLoading}
            bordered={bordered ? true : false}
            pagination={
                pagination
                ?
                {
                    position: ["bottomCenter"],
                    pageSize: pageSize ? pageSize : 10
                }
                :
                false
            }
        />
    );
};