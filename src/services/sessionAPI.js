import axiosInstance from "../utils/customAxios";

const baseURL = `${process.env.REACT_APP_API_URL}/api/session`;

const sessionAPI = {
    getAll: () => {
        return axiosInstance.get(`${baseURL}/all`);
    },
    getActive: () => {
        return axiosInstance.get(`${baseURL}/active`);
    },
    getByID: (session_id) => {
        return axiosInstance.get(`${baseURL}/${session_id}`);
    },
    create: (obj) => {
        return axiosInstance.post(`${baseURL}/create`, obj);
    },
    update: (obj, category_id) => {
        return axiosInstance.put(`${baseURL}/update/${category_id}`, obj);
    },
    delete: (category_id) => {
        return axiosInstance.delete(`${baseURL}/delete/${category_id}`);
    }
};

export default sessionAPI;