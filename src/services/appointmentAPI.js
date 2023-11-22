import axiosInstance from "../utils/customAxios";

const baseURL = `${process.env.REACT_APP_API_URL}/api/appointment`;

const appointmentAPI = {
    getAll: () => {
        return axiosInstance.get(`${baseURL}/all`);
    },
    getByID: (appointment_id, user_id) => {
        return axiosInstance.get(`${baseURL}/${appointment_id}/${user_id}`);
    },
    getAllByDoctorID: (doctor_id) => {
        return axiosInstance.get(`${baseURL}/all/doctor/${doctor_id}`);
    },
    booking: (obj) => {
        return axiosInstance.post(`${baseURL}/booking`, obj);
    },
    accept: (obj) => {
        return axiosInstance.post(`${baseURL}/accept`, obj);
    },
    cancel: (obj) => {
        return axiosInstance.post(`${baseURL}/employee/cancel`, obj);
    },
    saveDetails: (obj) => {
        return axiosInstance.post(`${baseURL}/save/details`, obj);
    },
    confirmDone: (obj) => {
        return axiosInstance.post(`${baseURL}/done`, obj);
    },
    sendToEmail: (obj) => {
        return axiosInstance.post(`${baseURL}/send`, obj);
    }
};

export default appointmentAPI;