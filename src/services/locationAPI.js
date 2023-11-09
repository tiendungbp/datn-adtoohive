import axios from "axios";

const baseURL = process.env.REACT_APP_LOCATION_API;

const locationAPI = {
    getAllCities: () => {
        return axios.get(`${baseURL}/api/p/`);
    },
    getAllDistricts: () => {
        return axios.get(`${baseURL}/api/d/`);
    },
    getAllWards: () => {
        return axios.get(`${baseURL}/api/w/`);
    }
};

export default locationAPI;