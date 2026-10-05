import { configureStore } from "@reduxjs/toolkit";
import cart from "./cartSlice";
import { cartListener } from "./cartWriteThrough";
import ui from "./uiSlice";

export const makeStore = () =>
  configureStore({
    reducer: { cart, ui },
    middleware: (getDefault) => getDefault().prepend(cartListener.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
