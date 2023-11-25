
import axiosInstance from "../utils/customAxios";

const baseURL = `${process.env.REACT_APP_API_URL}/api/service`;

const serviceAPI = {
    getAll: () => {
        return axiosInstance.get(`${baseURL}/all`);
    },
    getByID: (service_id) => {
        return axiosInstance.get(`${baseURL}/${service_id}`);
    },
    getActiveByCategoryID: (category_id) => {
        return axiosInstance.get(`${baseURL}/active/category/${category_id}`);  
    },
    create: (obj) => {
        return axiosInstance.post(`${baseURL}/create`, obj);
    },
    update: (obj, service_id) => {
        return axiosInstance.put(`${baseURL}/update/${service_id}`, obj);
    },
    delete: (service_id) => {
        return axiosInstance.delete(`${baseURL}/delete/${service_id}`);
    }
};

export default serviceAPI;