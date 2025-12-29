import { createSlice } from '@reduxjs/toolkit';

interface UIState {
    magicEnabled: boolean;
    isSidebarOpen: boolean;
}

const initialState: UIState = {
    magicEnabled: true,
    isSidebarOpen: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleMagic: (state) => {
            state.magicEnabled = !state.magicEnabled;
        },
        setSidebarOpen: (state, action) => {
            state.isSidebarOpen = action.payload;
        },
    },
});

export const { toggleMagic, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;

