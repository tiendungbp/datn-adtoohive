import axiosInstance from "../utils/customAxios";

const baseURL = `${process.env.REACT_APP_API_URL}/api/bill`;

const billAPI = {
    getAll: () => {
        return axiosInstance.get(`${baseURL}/all`);
    },
    getByID: (bill_id) => {
        return axiosInstance.get(`${baseURL}/${bill_id}`);
    },
    create: (obj) => {
        return axiosInstance.post(`${baseURL}/create`, obj);
    },
    confirm: (obj) => {
        return axiosInstance.post(`${baseURL}/confirm`, obj);
    },
    sendToEmail: (obj) => {
        return axiosInstance.post(`${baseURL}/send`, obj);
    }
};

export default billAPI;