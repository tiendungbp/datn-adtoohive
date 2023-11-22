import axiosInstance from "../utils/customAxios";

const baseURL = `${process.env.REACT_APP_API_URL}/api/patient`;

const patientAPI = {
    getAll: () => {
        return axiosInstance.get(`${baseURL}/all`);
    },
    getByID: (patient_id) => {
        return axiosInstance.get(`${baseURL}/${patient_id}`);
    },
    getMedicalRecord: (patient_id) => {
        return axiosInstance.get(`${baseURL}/record/${patient_id}`);
    },
    getAllByDoctorID: (doctor_id) => {
        return axiosInstance.get(`${baseURL}/all/doctor/${doctor_id}`);
    },
    create: (obj) => {
        return axiosInstance.post(`${baseURL}/create`, obj);
    },
    update: (obj, patient_id) => {
        return axiosInstance.put(`${baseURL}/update/${patient_id}`, obj);
    }
};

export default patientAPI;