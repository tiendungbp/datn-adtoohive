// import { useSelector, useDispatch } from "react-redux";
// import axios from "axios";
// import jwt_decode from "jwt-decode";


// const axiosJWT = axios.create({baseURL: "http://localhost:9090"});
// const data = useSelector(state => state.user.user);
// const dispatch = useDispatch();


// axiosJWT.interceptors.request.use(async(config) => {
//     let date = new Date();
//     const decodedToken = jwt_decode(data.access_token);
//     if(decodedToken.exp < date.getTime() / 1000) {
//         const res = await axios(`${process.env.REACT_APP_API_URL}/api/auth/refresh-token`, {
//             method: "post",
//             withCredentials: true
//         });
//         Cookies.set("refreshToken", res.data.data.refresh_token);
//         const refreshUser = {
//             ...data,
//             access_token: res.data.data.access_token
//         };
//         dispatch(setUserInfo({user: refreshUser, login: true}));
//         config.headers["token"] = `Bearer ${res.data.data.access_token}`;
//     };
//     return config;
// }, e => {
//     return Promise.reject(e);
// });

// export default axiosJWT;
