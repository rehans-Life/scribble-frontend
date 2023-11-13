"use client";

import Header from "@/app/[roomId]/header";
import { isRoomConnected } from "@/redux/slices/roomSlice";
import { Room } from "@/utils/interfaces";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import Game from "./game";

export default function Room() {
  const connectedToRoom = useSelector(isRoomConnected);
  const router = useRouter();

  useEffect(() => {
    if (connectedToRoom === false) {
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedToRoom]);

  return (
    <div className="flex flex-col md:min-h-screen h-auto items-center">
      <Game />
    </div>
  );
}
