import axios from 'axios';

const baseURL = `${process.env.REACT_APP_API_URL}/api/appointment`;

const appointmentAPI = {
	getAll: () => {
		return axios.get(`${baseURL}/all`);
	},
	getByID: (appointment_id, user_id) => {
		return axios.get(`${baseURL}/${appointment_id}/${user_id}`);
	},
	getAllByDoctorID: (doctor_id) => {
		return axios.get(`${baseURL}/all/doctor/${doctor_id}`);
	},
	booking: (obj) => {
		return axios.post(`${baseURL}/booking`, obj);
	},
	accept: (obj) => {
		return axios.post(`${baseURL}/accept`, obj);
	},
	cancel: (obj) => {
		return axios.post(`${baseURL}/employee/cancel`, obj);
	},
	saveDetails: (obj) => {
		return axios.post(`${baseURL}/save/details`, obj);
	},
};

export default appointmentAPI;
