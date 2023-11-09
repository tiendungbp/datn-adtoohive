import { createSlice } from "@reduxjs/toolkit";

//LƯU THÔNG TIN DANH MỤC / DỊCH VỤ ĐƯỢC CHỌN Ở DATATABLE
const dataSlice = createSlice({
    name: "data",
    initialState: {},
    reducers: {
        setData(state, action) {
            return action.payload;
        },
    },
});

const { actions, reducer } = dataSlice;
export const { setData } = actions;
export default reducer;