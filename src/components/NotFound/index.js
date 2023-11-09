import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Vertical } from "../../utils/AnimatedPage";

export default function NotFound() {

    const isLogin = useSelector(state => state.user.login);

    return (
        <Vertical>
            <div className="container-xxl py-5 wow fadeInUp" data-wow-delay="0.1s">
                <div className="container text-center">
                    <div className="row justify-content-center">
                        <div className="col-lg-6">
                            <i className="bi bi-exclamation-triangle display-1 text-primary"></i>
                            <h1 className="display-1">404</h1>
                            <h1 className="mb-4">Không Tìm Thấy Trang</h1>
                            <p className="mb-4">{isLogin ? 'Có vẻ như bạn đã truy cập sai đường dẫn' : 'Bạn chưa đăng nhập vào hệ thống quản lý'}</p>
                            <Link to="/" className="btn btn-primary rounded-pill py-3 px-5">{isLogin ? 'Quay về trang chủ': 'Đăng nhập'}</Link>
                        </div>
                    </div>
                </div>
            </div>
        </Vertical>
    );
};