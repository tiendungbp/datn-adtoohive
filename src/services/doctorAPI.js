import axios from "axios";

const baseURL = `${process.env.REACT_APP_API_URL}/api/doctor`;

const doctorAPI = {
    getAll: () => {
        return axios.get(`${baseURL}/all`);
    },
    getByID: (doctor_id) => {
        return axios.get(`${baseURL}/${doctor_id}`);
    },
    getAllByCategoryID: (category_id) => {
        return axios.get(`${baseURL}/all/category/${category_id}`);
    },
    getAllBySchedule: (date, session_id) => {
        return axios.get(`${baseURL}/all/${date}/${session_id}`);
    },
    create: (obj) => {
        return axios.post(`${baseURL}/create`, obj);
    },
    update: (obj, doctor_id) => {
        return axios.put(`${baseURL}/update/${doctor_id}`, obj);
    },
    updateProfile: (obj, doctor_id) => {
        return axios.put(`${baseURL}/profile/update/${doctor_id}`, obj);
    }
};

export default doctorAPI;