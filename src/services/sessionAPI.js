// import axios from "axios";

import axios from "axios";

const baseURL = `${process.env.REACT_APP_API_URL}/api/session`;

const sessionAPI = {
    getAll: () => {
        return axios.get(`${baseURL}/all`);
    },
    getActive: () => {
        return axios.get(`${baseURL}/active`);
    },
    getByID: (session_id) => {
        return axios.get(`${baseURL}/${session_id}`);
    },
    create: (obj) => {
        return axios.post(`${baseURL}/create`, obj);
    },
    update: (obj, category_id) => {
        return axios.put(`${baseURL}/update/${category_id}`, obj);
    },
    delete: (category_id) => {
        return axios.delete(`${baseURL}/delete/${category_id}`);
    }





    // getAll: (accessToken, axiosJWT) => {
    //     return axiosJWT.get(`${baseURL}/get-all`, {
    //         headers: {token: `Bearer ${accessToken}`}
    //     });
    // },
    // getByDoctorID: (doctor_id, accessToken, axiosJWT) => {
    //     return axiosJWT.get(`${baseURL}/get-by-doctor-id/${doctor_id}`, {
    //         headers: {token: `Bearer ${accessToken}`}
    //     });
    // },
    // create: (obj, accessToken, axiosJWT) => {
    //     return axiosJWT.post(`${baseURL}/create`, obj, {
    //         headers: {token: `Bearer ${accessToken}`}
    //     });
    // },
    // update: (obj, category_id, accessToken, axiosJWT) => {
    //     return axiosJWT.put(`${baseURL}/update/${category_id}`, obj, {
    //         headers: {token: `Bearer ${accessToken}`}
    //     });
    // },
    // delete: (category_id, accessToken, axiosJWT) => {
    //     return axiosJWT.delete(`${baseURL}/delete/${category_id}`, {
    //         headers: {token: `Bearer ${accessToken}`}
    //     });
    // }
};

export default sessionAPI;