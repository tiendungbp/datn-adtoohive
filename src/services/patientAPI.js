import axios from "axios";

const baseURL = `${process.env.REACT_APP_API_URL}/api/patient`;

const patientAPI = {
    getAll: () => {
        return axios.get(`${baseURL}/all`);
    },
    getByID: (patient_id) => {
        return axios.get(`${baseURL}/${patient_id}`);
    },
    getMedicalRecord: (patient_id) => {
        return axios.get(`${baseURL}/record/${patient_id}`);
    },
    getAllByDoctorID: (doctor_id) => {
        return axios.get(`${baseURL}/all/doctor/${doctor_id}`);
    },
    create: (obj) => {
        return axios.post(`${baseURL}/create`, obj);
    },
    update: (obj, patient_id) => {
        return axios.put(`${baseURL}/update/${patient_id}`, obj);
    }
};

export default patientAPI;