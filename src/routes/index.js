import { SendResetLink, ResetPassword } from "../pages/ForgotPassword";
import NotFound from "../components/NotFound";
import Report from "../pages/Reports";
import Login from "../pages/Login";
import Account from "../pages/Account";
import Home from "../pages/Home";

import EmployeeList from "../pages/Employees/EmployeeList";
import EmployeeDetails from "../pages/Employees/EmployeeDetails";

import PatientList from "../pages/Patients/PatientList";
import PatientDetails from "../pages/Patients/PatientDetails";
import MedicalRecord from "../pages/Patients/MedicalRecord";

import Categories from "../pages/Categories";
import Services from "../pages/Services";
import Sessions from "../pages/Sessions";

import ScheduleList_admin from "../pages/Schedules/admin/ScheduleList";
import CreateSchedule from "../pages/Schedules/admin/CreateSchedule";
import ScheduleDetails_admin from "../pages/Schedules/admin/ScheduleDetails";
import ScheduleList_employee from "../pages/Schedules/employee/ScheduleList";
import ScheduleDetails_employee from "../pages/Schedules/employee/ScheduleDetails";

import ChoosePatient from "../components/ChoosePatient";

import AppointmentList from "../pages/Appointments/AppointmentList";
import AppointmentDetails from "../pages/Appointments/AppointmentDetails";
import BookingAppointment from "../pages/Appointments/BookingAppointment";

import BillList from "../pages/Bills/BillList";
import BillDetails from "../pages/Bills/BillDetails";
import NFC from "../pages/nfc";


export const publicRoutes = [
    {
        path: "/",
        page: Login
    },
    {
        path: "/quen-mat-khau",
        page: SendResetLink
    },
    {
        path: "/dat-lai-mat-khau/:user_id/:token",
        page: ResetPassword
    },
    {
        path: "*",
        page: NotFound
    }
];


export const adminRoutes = [
    {
        path: "/",
        page: Report
    },
    {
        path: "/tai-khoan",
        page: Account
    },
    {
        path: "/thong-ke",
        page: Report
    },
    {
        path: "/nhan-vien",
        page: EmployeeList
    },
    {
        path: "/nhan-vien/them-moi",
        page: EmployeeDetails
    },
    {
        path: "/nhan-vien/:user_id",
        page: EmployeeDetails
    },
    {
        path: "/benh-nhan",
        page: PatientList
    },
    {
        path: "/benh-nhan/them-moi",
        page: PatientDetails
    },
    {
        path: "/benh-nhan/:patient_id",
        page: PatientDetails
    },
    {
        path: "/benh-nhan/ho-so-benh-an/:patient_id",
        page: MedicalRecord
    },
    {
        path: "/danh-muc",
        page: Categories
    },
    {
        path: "/dich-vu",
        page: Services
    },
    {
        path: "/ca-kham",
        page: Sessions
    },
    {
        path: "/lich-lam-viec",
        page: ScheduleList_admin
    },
    {
        path: "/lich-lam-viec/them-moi",
        page: CreateSchedule
    },
    {
        path: "/lich-lam-viec/:user_id/:date",
        page: ScheduleDetails_admin
    },
    {
        path: "*",
        page: NotFound
    }
];

export const receptionistRoutes = [
    {
        path: "/",
        page: Home
    },
    {
        path: "/tai-khoan",
        page: Account
    },
    {
        path: "/benh-nhan",
        page: PatientList
    },
    {
        path: "/benh-nhan/them-moi",
        page: PatientDetails
    },
    {
        path: "/benh-nhan/:patient_id",
        page: PatientDetails
    },
    {
        path: "/benh-nhan/ho-so-benh-an/:patient_id",
        page: MedicalRecord
    },
    {
        path: "/lich-lam-viec",
        page: ScheduleList_employee
    },
    {
        path: "/lich-lam-viec/:date",
        page: ScheduleDetails_employee
    },
    {
        path: "/lich-hen",
        page: AppointmentList
    },
    {
        path: "/lich-hen/chi-tiet/:appointment_id",
        page: AppointmentDetails
    },
    {
        path: "/lich-hen/dat-lich-hen",
        page: ChoosePatient
    },
    {
        path: "/lich-hen/dat-lich-hen/:patient_id",
        page: BookingAppointment
    },
    {
        path: "/hoa-don",
        page: BillList
    },
    {
        path: "/nfc",
        page: NFC
    },
    {
        path: "/hoa-don/lap-hoa-don",
        page: ChoosePatient
    },
    {
        path: "/hoa-don/lap-hoa-don/:patient_id",
        page: BillDetails
    },
    {
        path: "/hoa-don/chi-tiet/:patient_id/:bill_id",
        page: BillDetails
    },
    {
        path: "*",
        page: NotFound
    }
];

export const doctorRoutes = [
    {
        path: "/",
        page: Home
    },
    {
        path: "/tai-khoan",
        page: Account
    },
    {
        path: "/benh-nhan",
        page: PatientList
    },
    {
        path: "/benh-nhan/ho-so-benh-an/:patient_id",
        page: MedicalRecord
    },
    {
        path: "/lich-lam-viec",
        page: ScheduleList_employee
    },
    {
        path: "/lich-lam-viec/:date",
        page: ScheduleDetails_employee
    },
    {
        path: "/lich-hen",
        page: AppointmentList
    },
    {
        path: "/lich-hen/chi-tiet/:appointment_id",
        page: AppointmentDetails
    },
    {
        path: "*",
        page: NotFound
    }
];

export const assistantRoutes = [
    {
        path: "/",
        page: Home
    },
    {
        path: "/tai-khoan",
        page: Account
    },
    {
        path: "*",
        page: NotFound
    }
];