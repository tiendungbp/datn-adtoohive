import axios from "axios";

const baseURL = `${process.env.REACT_APP_API_URL}/api/report`;

const reportAPI = {
    getCurrentRevenue: () => {
        return axios.get(`${baseURL}/current/revenue`);
    },
    getCurrentAppointment: () => {
        return axios.get(`${baseURL}/current/appointment`);
    },
    getCurrentPatient: () => {
        return axios.get(`${baseURL}/current/patient`);
    },
    getServicesFor7Days: () => {
        return axios.get(`${baseURL}/7days/service`);
    },
    getAppointmentsFor7Days: () => {
        return axios.get(`${baseURL}/7days/appointment`);
    },
    getRevenueFor7Days: () => {
        return axios.get(`${baseURL}/7days/revenue`);
    },
    getReportScheduleByMonth: ({month, year}) => {
        return axios.get(`${baseURL}/schedule/${month}/${year}`, {responseType: "blob"});
    },
    getReportServiceByMonth: (month) => {
        return axios.get(`${baseURL}/service/${month}`, {responseType: "blob"});
    },
    getReportAppointmentByMonth: ({month, year}) => {
        return axios.get(`${baseURL}/appointment/${month}/${year}`, {responseType: "blob"});
    },
    getReportRevenueByMonth: ({month, year}) => {
        return axios.get(`${baseURL}/revenue/${month}/${year}`, {responseType: "blob"});
    }
};

export default reportAPI;