import axios from "axios";
import axiosInstance from "../utils/customAxios";

const baseURL = `${process.env.REACT_APP_API_URL}/api/auth`;

const authAPI = {
    login: (obj) => {
        return axios.post(`${baseURL}/login/admin`, obj);
    },
    changePassword: (obj, user_id) => {
        return axiosInstance.put(`${baseURL}/password/change/${user_id}`, obj);
    },
    sendResetLink: (obj) => {
        return axios.post(`${baseURL}/password/send-reset-link`, obj);
    },
    resetPassword: (user_id, token, password) => {
        return axios.post(`${baseURL}/password/reset/${user_id}/${token}`, {password});
    },
    blockAccount: (obj) => {
        return axiosInstance.post(`${baseURL}/block/`, obj);
    },
    unblockAccount: (obj) => {
        return axiosInstance.post(`${baseURL}/unblock/`, obj);
    },
    changeEmail: (obj, user_id) => {
        return axiosInstance.put(`${baseURL}/email/change/${user_id}`, obj);
    },
    checkPassword: (obj) => {
        return axiosInstance.post(`${baseURL}/password/check`, obj);
    }
};

export default authAPI;