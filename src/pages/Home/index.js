import { Vertical } from '../../utils/AnimatedPage';
import Carousel from 'react-bootstrap/Carousel';

export default function Home() {
	return (
		<Vertical>
			<div className="container-fluid pt-4">
				<div className="row bg-light rounded mx-0 mb-4">
					<div className="col-md">
						<div className="rounded p-4 bg-secondary">
							<div className="row">
								<div className="col-md text-center">
									<span className="text-dark page-title">
										HỆ THỐNG QUẢN LÝ PHÒNG KHÁM NHA KHOA
									</span>
								</div>
							</div>
							<div className="row mb-5">
								<div className="col-md text-center mt-4">
									<img
										alt=""
										src={process.env.REACT_APP_LOGO}
										className="w-25"
									/>
								</div>
							</div>
							<div className="row">
								<div
									className="col-lg-6 p-5 wow fadeIn bg-primary rounded"
									data-wow-delay="0.1s"
								>
									<h1 className="text-white mb-5 custom-fs-1">Toohive</h1>
									<h1 className="text-white mb-5">Vì Sức Khỏe Của Bạn</h1>
									<div className="row g-4">
										<div className="col-sm-4">
											<div className="border-start border-light ps-4">
												<h2
													className="text-white mb-1"
													data-toggle="counter-up"
												>
													32
												</h2>
												<p className="text-light mb-0">Bác sĩ - Phụ tá</p>
											</div>
										</div>
										<div className="col-sm-4">
											<div className="border-start border-light ps-4">
												<h2
													className="text-white mb-1"
													data-toggle="counter-up"
												>
													102
												</h2>
												<p className="text-light mb-0">Trang thiết bị</p>
											</div>
										</div>
										<div className="col-sm-4">
											<div className="border-start border-light ps-4">
												<h2
													className="text-white mb-1"
													data-toggle="counter-up"
												>
													2305
												</h2>
												<p className="text-light mb-0">Bệnh nhân</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
									<Carousel>
										<Carousel.Item>
											<img
												className="d-block w-100 rounded"
												src={`${process.env.REACT_APP_CAROUSEL_1}`}
												alt=""
											/>
										</Carousel.Item>
										<Carousel.Item>
											<img
												className="d-block w-100 rounded"
												src={`${process.env.REACT_APP_CAROUSEL_2}`}
												alt=""
											/>
										</Carousel.Item>
										<Carousel.Item>
											<img
												className="d-block w-100 rounded"
												src={`${process.env.REACT_APP_CAROUSEL_3}`}
												alt=""
											/>
										</Carousel.Item>
									</Carousel>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Vertical>
	);
}
