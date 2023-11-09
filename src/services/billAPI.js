import axios from "axios";

const baseURL = `${process.env.REACT_APP_API_URL}/api/bill`;

const billAPI = {
    getAll: () => {
        return axios.get(`${baseURL}/all`);
    },
    getByID: (bill_id) => {
        return axios.get(`${baseURL}/${bill_id}`);
    },
    create: (obj) => {
        return axios.post(`${baseURL}/create`, obj);
    },
    confirm: (obj) => {
        return axios.post(`${baseURL}/confirm`, obj);
    },
    sendToEmail: (obj) => {
        return axios.post(`${baseURL}/send`, obj);
    }
};

export default billAPI;