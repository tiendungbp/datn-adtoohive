import axios from "axios";

const baseURL = `${process.env.REACT_APP_API_URL}/api/service`;

const serviceAPI = {
    getAll: () => {
        return axios.get(`${baseURL}/all`);
    },
    getActive: () => {
        return axios.get(`${baseURL}/active`);
    },
    getByID: (service_id) => {
        return axios.get(`${baseURL}/${service_id}`);
    },
    getAllByCategoryID: (category_id) => {
        return axios.get(`${baseURL}/all/category/${category_id}`);  
    },
    getActiveByCategoryID: (category_id) => {
        return axios.get(`${baseURL}/active/category/${category_id}`);  
    },
    create: (obj) => {
        return axios.post(`${baseURL}/create`, obj);
    },
    update: (obj, service_id) => {
        return axios.put(`${baseURL}/update/${service_id}`, obj);
    },
    delete: (service_id) => {
        return axios.delete(`${baseURL}/delete/${service_id}`);
    }
};

export default serviceAPI;