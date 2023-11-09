import axios from "axios";

const baseURL = `${process.env.REACT_APP_API_URL}/api/employee`;

const employeeAPI = {
    getAll: () => {
        return axios.get(`${baseURL}/all`);
    },
    getByID: (employee_id) => {
        return axios.get(`${baseURL}/${employee_id}`);
    },
    getAllBySchedule: (date, session_id) => {
        return axios.get(`${baseURL}/all/${date}/${session_id}`);
    },
    create: (obj) => {
        return axios.post(`${baseURL}/create`, obj);
    },
    update: (obj, employee_id) => {
        return axios.put(`${baseURL}/update/${employee_id}`, obj);
    },
    updateProfile: (obj, employee_id) => {
        return axios.put(`${baseURL}/profile/update/${employee_id}`, obj);
    }
};

export default employeeAPI;