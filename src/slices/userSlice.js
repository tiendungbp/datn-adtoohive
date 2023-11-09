import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        user: null,
        login: false
    },
    reducers: {
        setUserInfo(state, action) {
            state.user = action.payload.user;
            state.login = action.payload.login;
        },
    },
});

const { actions, reducer } = userSlice;
export const { setUserInfo } = actions;
export default reducer;