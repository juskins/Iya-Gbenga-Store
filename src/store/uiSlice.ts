import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: { filterSheetOpen: false, mobileNavOpen: false, toast: null as string | null },
  reducers: {
    setFilterSheet(state, action: PayloadAction<boolean>) {
      state.filterSheetOpen = action.payload;
    },
    setMobileNav(state, action: PayloadAction<boolean>) {
      state.mobileNavOpen = action.payload;
    },
    showToast(state, action: PayloadAction<string>) {
      state.toast = action.payload;
    },
    hideToast(state) {
      state.toast = null;
    },
  },
});

export const { setFilterSheet, setMobileNav, showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
