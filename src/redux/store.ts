import { configureStore } from "@reduxjs/toolkit";
import roomReducers from "./slices/roomSlice";

export const store = configureStore({
  reducer: {
    room: roomReducers,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
