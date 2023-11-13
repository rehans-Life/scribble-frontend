"use client";

import { getDrawer, getRoom, getUser } from "@/redux/slices/roomSlice";
import { Message, Room } from "@/utils/interfaces";
import { socket } from "@/utils/socket";
import { ReactNode, useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface AudioState {
  [key: string]: HTMLAudioElement;
}

export default function SoundProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const urls: string[] = [
    "tick",
    "correct-guess",
    "game-end-fail",
    "game-end-success",
    "leave-game",
    "to-draw",
    "join-game",
  ];

  const room = useSelector(getRoom);
  const drawer = useSelector(getDrawer);
  const user = useSelector(getUser(socket.id));

  const [audios] = useState<AudioState | null>(
    typeof Audio !== "undefined"
      ? urls.reduce((acc: AudioState, curr) => {
          acc[curr] = new Audio(`audios/${curr}.mp3`);
          return acc;
        }, {})
      : null
  );

  useEffect(() => {
    if (!audios) return;

    const onTimer = (time: number) => {
      if (room?.gameState === "drawing" && time <= 9) audios["tick"].play();
      if (room?.gameState === "selecting" && time <= 3) audios["tick"].play();
    };

    const onCorrectGuessMessage = (message: Message) => {
      if (message.type === "correct-guess") {
        audios["correct-guess"].play();
      }
    };

    const onNewMemeberJoined = () => {
      audios["join-game"].play();
    };

    const onMemberLeft = () => {
      audios["leave-game"].play();
    };

    const onRoomChanged = (room: Room) => {
      if (
        room.gameState === "finished" &&
        ((user?.id === room.drawer &&
          room.users.every(
            ({ guessed, id }) => guessed || id === room.drawer
          )) ||
          user?.guessed)
      ) {
        audios["game-end-success"].play();
      }

      if (
        room.gameState === "finished" &&
        ((user?.id !== room.drawer && !user?.guessed) ||
          (user?.id === room.drawer &&
            room.users.some(
              ({ guessed, id }) => !guessed && id !== room.drawer
            )))
      ) {
        audios["game-end-fail"].play();
      }
    };

    socket.on("new-timer", onTimer);
    socket.on("new-message-recieved", onCorrectGuessMessage);
    socket.on("room-changed", onRoomChanged);
    socket.on("new-member-joined", onNewMemeberJoined);
    socket.on("member-left", onMemberLeft);

    return () => {
      socket.off("new-timer", onTimer);
      socket.off("new-message-recieved", onCorrectGuessMessage);
      socket.off("room-changed", onRoomChanged);
      socket.off("new-member-joined", onNewMemeberJoined);
      socket.off("member-left", onMemberLeft);
    };
  }, [room, user, audios]);

  useEffect(() => {
    if (!drawer?.id || !audios) return;
    audios["to-draw"].play();
  }, [drawer?.id, audios]);

  return children;
}
