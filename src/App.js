import "./assets/scss/bootstrap.min.scss";
import "./assets/scss/style.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { publicRoutes, adminRoutes, receptionistRoutes, doctorRoutes, assistantRoutes } from "./routes";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import { MainLayout } from "./layouts";

function App() {

    //KIỂM TRA ĐĂNG NHẬP VÀ PHÂN QUYỀN
    const isLogin = useSelector(state => state.user.login);
    const user = useSelector(state => state.user.user);
    let prefix;
    if(user) prefix = user.user_id.slice(0, 2);
    let employeeRoutes = [];

    if(isLogin) {
        if(prefix === "qt") {
            employeeRoutes = adminRoutes;
        }
        else if(prefix === "lt") {
            employeeRoutes = receptionistRoutes;
        }
        else if(prefix === "bs") {
            employeeRoutes =  doctorRoutes;
        }
        else {
            employeeRoutes = assistantRoutes;
        };
    };

    return (
        <Router>
            <div className="App">
                <Routes>
                    {
                        isLogin
                        ?
                        employeeRoutes.map((route, index) => {
                            let Page = route.page;
                            return (
                                <Route
                                    path={route.path}
                                    element={
                                        <MainLayout>
                                            <Page/>
                                        </MainLayout>
                                    }
                                    key={index}/>
                            );
                
                        })
                        :
                        publicRoutes.map((route, index) => {
                            let Page = route.page;
                            return (
                                <Route
                                    path={route.path}
                                    element={<Page/>}
                                    key={index}
                                />
                            );
                        })
                    }
                </Routes>
                <Toaster />
            </div>
        </Router>
    );
}
export default App;  