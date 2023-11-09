import { createSlice } from "@reduxjs/toolkit";

//LƯU THÔNG TIN LỊCH HẸN
//khi lễ tân chọn "lập hóa đơn" ở trang chi tiết lịch hẹn
//state này được dùng khi xác nhận bệnh nhân đã thanh toán
const appointmentSlice = createSlice({
    name: "appointment",
    initialState: null,
    reducers: {
        setAppointmentAction(state, action) {
            return action.payload;
        },
    },
});

const { actions, reducer } = appointmentSlice;
export const { setAppointmentAction } = actions;
export default reducer;