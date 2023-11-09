import axios from 'axios';

const baseURL = `${process.env.REACT_APP_API_URL}/api/category`;

const categoryAPI = {
	getAll: () => {
		return axios.get(`${baseURL}/all`);
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
		return axios.post(`${baseURL}/create`, obj);
	},
	update: (obj, category_id) => {
		return axios.put(`${baseURL}/update/${category_id}`, obj);
	},
	delete: (category_id) => {
		return axios.delete(`${baseURL}/delete/${category_id}`);
	},
};

export default categoryAPI;
