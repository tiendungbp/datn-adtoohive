import DoctorSchedule from "../../components/DoctorSchedule";

export default function DoctorCard(props) {

    const doctor = props.doctor;

    return (
        <div className="rounded p-4 bg-secondary text-dark mb-5">
            <div className="row">
                <div className="col-md-6">
                    <div className="row">
                        <div className="col-md-4 custom-mb-5">
                            <img className="w-100 rounded" src={doctor.avatar} alt=""/>
                        </div>
                        <div className="col-md-8 custom-mb-5">
                            <h5 className="mb-3 text-primary">{doctor.degree}, {doctor.fullname}</h5>
                            <hr/>
                            <p><b>Số điện thoại:</b> {doctor.phone}</p>
                            <p><b>Email:</b> {doctor.email}</p>
                        </div>
                    </div>
                </div>
                <DoctorSchedule
                    doctor={doctor}
                    scheduleList={props.scheduleList}
                    date={props.date}
                    getAllByCategoryDateSession={props.getAllByCategoryDateSession}
                />
            </div>
        </div>
    );
};