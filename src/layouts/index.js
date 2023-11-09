import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export function MainLayout({ children }) {

    const togglerStatus = useSelector(state => state.togglerStatus);

    return (
        <div className="container-fluid position-relative d-flex p-0">
            <Sidebar />
            <div className={`content bg-light ${togglerStatus ? 'open' : ''}`}>
                <Navbar />
                {children}
            </div>
        </div>
    );
};