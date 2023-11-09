import { createSlice } from "@reduxjs/toolkit";

const togglerStatusSlice = createSlice({
    name: "togglerStatus",
    initialState: false,
    reducers: {
        setStatus(state, action) {
            return action.payload;
        },
    },
});

const { actions, reducer } = togglerStatusSlice;
export const { setStatus } = actions;
export default reducer;