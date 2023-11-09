import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserEdit, faBars } from "@fortawesome/free-solid-svg-icons";
import { setStatus } from "../../slices/togglerStatusSlice";
import { Link } from "react-router-dom";
import Notification from "../Notification";

export default function Navbar() {

    //XỬ LÝ CLICK TOGGLER
    const togglerStatus = useSelector(state => state.togglerStatus);
    const dispatch = useDispatch();
    const handleClickToggler = () => dispatch(setStatus(!togglerStatus));

    return (
        <nav className="navbar navbar-expand bg-secondary navbar-dark sticky-top px-4 py-2">
            <Link to="/" className="navbar-brand d-flex d-lg-none me-4">
                <h2 className="text-primary mb-0"><FontAwesomeIcon icon={faUserEdit}/></h2>
            </Link>
            <button className="btn sidebar-toggler flex-shrink-0 text-primary bg-light" onClick={handleClickToggler}>
                <FontAwesomeIcon icon={faBars}/>
            </button>
            <div className="navbar-nav align-items-center ms-auto">
                <Notification />
            </div>
        </nav>
    );
};