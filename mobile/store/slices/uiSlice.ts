import { createSlice } from '@reduxjs/toolkit';

interface UIState {
    magicEnabled: boolean;
    isSidebarOpen: boolean;
    theme: 'light' | 'dark' | 'system';
}

const initialState: UIState = {
    magicEnabled: true,
    isSidebarOpen: false,
    theme: 'light',
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
        setTheme: (state, action) => {
            state.theme = action.payload;
        },
    },
});

export const { toggleMagic, setSidebarOpen, setTheme } = uiSlice.actions;
export default uiSlice.reducer;

