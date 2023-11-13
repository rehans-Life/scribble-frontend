import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  Room,
  UpdateRoom,
  User,
  Message,
  CanvasState,
} from "../../utils/interfaces";
import { RootState } from "../store";

interface RoomState {
  isRoomConnected: boolean;
  room: Room | null;
  users: User[];
  messages: Array<Message>;
  randomWords: Array<string>;
  canvasState: CanvasState | null;
}

const initialState: RoomState = {
  isRoomConnected: false,
  room: null,
  users: [],
  messages: [],
  randomWords: [],
  canvasState: null,
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    roomConnected: (state, action: PayloadAction<Room>) => {
      state.isRoomConnected = true;
      state.room = action.payload;
      state.users = action.payload.users;
    },
    updateRoom: (state, action: PayloadAction<UpdateRoom>) => {
      if (!state.room) return;

      state.room = {
        ...state.room,
        ...action.payload,
      };
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages = [action.payload, ...state.messages];
    },
    setCanvas: (state, action: PayloadAction<CanvasState>) => {
      state.canvasState = action.payload;
    },
    leftRoom: (state, action: PayloadAction<null>) => {
      state.isRoomConnected = false;
      state.messages = [];
      state.room = null;
      state.randomWords = [];
      state.canvasState = null;
      state.users = [];
    },
    setRandomWords: (state, action: PayloadAction<Array<string>>) => {
      state.randomWords = action.payload;
    },
  },
});

export const isRoomConnected = (state: RootState) => state.room.isRoomConnected;
export const getRoom = (state: RootState) => state.room.room;
export const getDrawer = (state: RootState): User | undefined => {
  return state.room?.users.find(({ id }) => state.room.room?.drawer === id);
};
export const getRandomWords = (state: RootState) => state.room.randomWords;
export const getUsers = (state: RootState) => state.room.users;
export const getUser =
  (userId: string) =>
  (state: RootState): User | undefined => {
    return state.room?.users?.find(({ id }) => userId === id);
  };
export const getMessages = (state: RootState) => state.room.messages;
export const getCanvasState = (state: RootState) => state.room.canvasState;

export const {
  roomConnected,
  setUsers,
  leftRoom,
  setRandomWords,
  updateRoom,
  addMessage,
  setCanvas,
} = roomSlice.actions;

export default roomSlice.reducer;
