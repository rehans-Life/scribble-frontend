"use client";

import { useDispatch } from "react-redux";
import { useToast } from "./ui/use-toast";
import { useEffect } from "react";
import { socket } from "@/utils/socket";
import { CanvasState, Message, Room, User } from "@/utils/interfaces";
import {
  addMessage,
  roomConnected,
  setCanvas,
  setUsers,
} from "@/redux/slices/roomSlice";
import { useSetAtom } from "jotai";
import { timerAtom } from "@/atoms/timerAtom";

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const setTimerAtom = useSetAtom(timerAtom);

  useEffect(() => {
    const onNewMessageRecieved = (message: Message) => {
      dispatch(addMessage(message));
    };

    const onBoardChange = (newCanvas: CanvasState) => {
      dispatch(setCanvas(newCanvas));
    };

    const onMembersChanged = (users: User[]) => {
      dispatch(setUsers(users));
    };

    const onTimer = (time: number) => {
      setTimerAtom(time);
    };

    const onError = (error: string) => {
      toast({
        description: error,
      });
    };

    const onRoomChanges = (room: Room) => {
      dispatch(roomConnected(room));
    };

    socket.on("room-changed", onRoomChanges);
    socket.on("board-change", onBoardChange);
    socket.on("members-changed", onMembersChanged);
    socket.on("new-message-recieved", onNewMessageRecieved);
    socket.on("new-timer", onTimer);
    socket.on("error", onError);

    return () => {
      socket.off("members-changed", onMembersChanged);
      socket.off("new-message-recieved", onNewMessageRecieved);
      socket.off("error", onError);
      socket.off("board-change", onBoardChange);
      socket.off("new-timer", onTimer);
      socket.off("room-changed", onRoomChanges);
    };
  }, []);

  return children;
}
