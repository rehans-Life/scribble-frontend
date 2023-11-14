import { io } from "socket.io-client";

const URL =
  process.env.NODE_ENV === "production"
    ? (process.env.NEXT_PUBLIC_PROD_SOCKET_URL as string)
    : (process.env.NEXT_PUBLIC_DEV_SOCKET_URL as string);

export const socket = io(URL, {
  transports: ["websocket", "polling"],
});
