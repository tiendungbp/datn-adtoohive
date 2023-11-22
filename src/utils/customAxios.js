import axios from "axios";
import jwtDecode from "jwt-decode";
import Cookies from "js-cookie";

let accessToken = localStorage.getItem("accessToken") ? localStorage.getItem("accessToken") : null;

const axiosInstance = axios.create({
    headers: {
        token: `Bearer ${accessToken}`
    }
});

axiosInstance.interceptors.request.use(async req => {
    const date = new Date();
    // if(!accessToken) {
        accessToken = localStorage.getItem("accessToken") ? localStorage.getItem("accessToken") : null;
        req.headers.token = `Bearer ${accessToken}`;
    // };
    const decodedToken = jwtDecode(accessToken);
    const isExpired = decodedToken.exp < date.getTime() / 1000;
    if(isExpired) {
        const refreshToken = Cookies.get("refreshToken");
        const res = await axios(`${process.env.REACT_APP_API_URL}/api/auth/token/refresh`, {
            method: "post",
            data: {refreshToken}
        });
        Cookies.set("refreshToken", res.data.data.refresh_token);
        localStorage.setItem("accessToken", res.data.data.access_token);
        req.headers.token = `Bearer ${res.data.data.access_token}`;
    };
    return req;
});

export default axiosInstance;