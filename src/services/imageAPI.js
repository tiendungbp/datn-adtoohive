import axios from "axios";

const imageAPI = {
    uploadImageToCloud: (formData) => {
        return axios.post("https://api.cloudinary.com/v1_1/dcteqnz2i/image/upload", formData);
    },
};

export default imageAPI;