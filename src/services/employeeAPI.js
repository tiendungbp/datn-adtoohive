import axiosInstance from "../utils/customAxios";

const baseURL = `${process.env.REACT_APP_API_URL}/api/employee`;

const employeeAPI = {
    getAll: () => {
        return axiosInstance.get(`${baseURL}/all`);
    },
    getByID: (employee_id) => {
        return axiosInstance.get(`${baseURL}/${employee_id}`);
    },
    getAllBySchedule: (date, session_id) => {
        return axiosInstance.get(`${baseURL}/all/${date}/${session_id}`);
    },
    create: (obj) => {
        return axiosInstance.post(`${baseURL}/create`, obj);
    },
    update: (obj, employee_id) => {
        return axiosInstance.put(`${baseURL}/update/${employee_id}`, obj);
    },
    updateProfile: (obj, employee_id) => {
        return axiosInstance.put(`${baseURL}/profile/update/${employee_id}`, obj);
    }
};

export default employeeAPI;