import axios from "axios";
import axiosInstance from "../utils/customAxios";

const baseURL = `${process.env.REACT_APP_API_URL}/api/category`;

const categoryAPI = {
    getAll: () => {
        return axiosInstance.get(`${baseURL}/all`);
    },
    getActive: () => {
        return axios.get(`${baseURL}/active`);
    },
    getByID: (category_id) => {
        return axios.get(`${baseURL}/${category_id}`);
    },
    getAllByDoctorID: (doctor_id) => {
        return axios.get(`${baseURL}/all/doctor/${doctor_id}`);
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

export default categoryAPI;