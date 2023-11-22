import axiosInstance from "../utils/customAxios";

const baseURL = `${process.env.REACT_APP_API_URL}/api/report`;

const reportAPI = {
    getCurrentRevenue: () => {
        return axiosInstance.get(`${baseURL}/current/revenue`);
    },
    getCurrentAppointment: () => {
        return axiosInstance.get(`${baseURL}/current/appointment`);
    },
    getCurrentPatient: () => {
        return axiosInstance.get(`${baseURL}/current/patient`);
    },
    getServicesFor7Days: () => {
        return axiosInstance.get(`${baseURL}/7days/service`);
    },
    getAppointmentsFor7Days: () => {
        return axiosInstance.get(`${baseURL}/7days/appointment`);
    },
    getRevenueFor7Days: () => {
        return axiosInstance.get(`${baseURL}/7days/revenue`);
    },
    getReportScheduleByMonth: ({month, year}) => {
        return axiosInstance.get(`${baseURL}/schedule/${month}/${year}`, {responseType: "blob"});
    },
    getReportServiceByMonth: (month) => {
        return axiosInstance.get(`${baseURL}/service/${month}`, {responseType: "blob"});
    },
    getReportAppointmentByMonth: ({month, year}) => {
        return axiosInstance.get(`${baseURL}/appointment/${month}/${year}`, {responseType: "blob"});
    },
    getReportRevenueByMonth: ({month, year}) => {
        return axiosInstance.get(`${baseURL}/revenue/${month}/${year}`, {responseType: "blob"});
    }
};

export default reportAPI;