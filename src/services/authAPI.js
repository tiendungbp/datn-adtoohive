import axios from "axios";

const baseURL = `${process.env.REACT_APP_API_URL}/api/auth`;

const authAPI = {
    login: (obj) => {
        return axios.post(`${baseURL}/login/admin`, obj);
    },
    changePassword: (obj, user_id) => {
        return axios.put(`${baseURL}/password/change/${user_id}`, obj);
    },
    sendResetLink: (obj) => {
        return axios.post(`${baseURL}/password/send-reset-link`, obj);
    },
    resetPassword: (user_id, token, password) => {
        return axios.post(`${baseURL}/password/reset/${user_id}/${token}`, {password});
    },
    blockAccount: (obj) => {
        return axios.post(`${baseURL}/block/`, obj);
    },
    unblockAccount: (obj) => {
        return axios.post(`${baseURL}/unblock/`, obj);
    },
    changeEmail: (obj, user_id) => {
        return axios.put(`${baseURL}/email/change/${user_id}`, obj);
    },
    checkPassword: (obj) => {
        return axios.post(`${baseURL}/password/check`, obj);
    }
    // refreshToken: () => {
    //     return axios(`${baseURL}/refresh-token`, {
    //         method: "post",
    //         withCredentials: true
    //     });
    // }
};

export default authAPI;