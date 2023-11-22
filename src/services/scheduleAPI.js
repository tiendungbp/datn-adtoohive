import axios from "axios";
import axiosInstance from "../utils/customAxios";

const baseURL = `${process.env.REACT_APP_API_URL}/api/schedule`;

const scheduleAPI = {
    getAllByWeek: (week, year) => {
        return axiosInstance.get(`${baseURL}/all/week/${week}/${year}`);
    },
    getUserSchedulesByDate: (user_id, date) => {
        return axiosInstance.get(`${baseURL}/all/user/${user_id}/${date}`);
    },
    getUserSchedulesByWeek: (user_id, week, year) => {
        return axiosInstance.get(`${baseURL}/${user_id}/${week}/${year}`);
    },
    getDoctorSchedulesByDate: (doctor_id, date) => {
        return axios.get(`${baseURL}/all/doctor/${doctor_id}/${date}`);
    },
    getAllByCategoryDateSession: ({category_id, date, session_id}) => {
        return axiosInstance.get(`${baseURL}/all/${category_id}/${date}/${session_id}`);
    },
    create: (obj) => {
        return axiosInstance.post(`${baseURL}/create`, obj);
    },
    acceptOne: (obj) => {
        return axiosInstance.post(`${baseURL}/accept/one`, obj);
    },
    acceptAll: (obj) => {
        return axiosInstance.post(`${baseURL}/accept/all`, obj);
    },
    acceptForWeek: (obj) => {
        return axiosInstance.post(`${baseURL}/accept/week`, obj);
    },
    delete: (user_id, user_schedule_id) => {
        return axiosInstance.delete(`${baseURL}/delete/${user_id}/${user_schedule_id}`);
    }
};

export default scheduleAPI;