import { useDispatch, useSelector } from "react-redux";
import { Toggle } from "../../components/ui/toggle";
import { TbLogout } from "react-icons/tb";
import { getDrawer, getRoom, leftRoom } from "@/redux/slices/roomSlice";
import { socket } from "@/utils/socket";
import { useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { timerAtom } from "@/atoms/timerAtom";
import { LuAlarmClock } from "react-icons/lu";

export default function Header() {
  const room = useSelector(getRoom);
  const drawer = useSelector(getDrawer);
  const [audio] = useState<HTMLAudioElement | null>(
    typeof Audio !== "undefined" ? new Audio("/audios/tick.mp3") : null
  );

  const dispatch = useDispatch();

  const [timer, setTimer] = useAtom(timerAtom);

  const isDrawer = useMemo<boolean>(() => {
    return drawer?.id === socket.id;
  }, [drawer]);

  const leaveRoom = () => {
    socket.emit("leave-room");
    dispatch(leftRoom(null));
  };

  useEffect(() => {
    if (!timer || !isDrawer || !audio) return;

    const intervalId = setInterval(() => {
      const newTime = timer - 1;
      setTimer(newTime);
      socket.emit("set-time", room?.id, newTime);
      if (room?.gameState === "drawing" && newTime <= 9) audio.play();
      if (room?.gameState === "selecting" && newTime <= 3) audio.play();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [timer, isDrawer, audio]);

  useEffect(() => {
    if (!isDrawer) return;

    let newTimer = 0;

    if (room?.gameState === "selecting") {
      newTimer = room.drawerTime;
    }

    if (room?.gameState === "drawing") {
      newTimer = room.gameTime;
    }

    if (room?.gameState === "finished") {
      newTimer = room.gapTime;
    }

    setTimer(newTimer);
    socket.emit("set-time", room?.id, newTimer);
  }, [room]);

  return (
    <header className="bg-white rounded-[1px]">
      <div className="flex justify-between items-center px-2 sm:px-8 md:px-8 py-2">
        <div className="text-md font-semibold flex items-center gap-x-2 flex-col xs:flex-row">
          <span className="text-2xl">
            <LuAlarmClock />
          </span>
          <span className="flex xs:text-md text-sm items-center mt-1">
            {timer}
          </span>
        </div>
        {room?.gameState === "selecting" || room?.gameState === "waiting" ? (
          <div className="text-md sm:text-lg font-semibold font-mono uppercase">
            Waiting
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="text-sm md:text-lg font-medium font-mono">
              Guess Word
            </div>
            <div>
              {room &&
                Array.from(
                  (isDrawer || room.gameState === "finished"
                    ? room.guessWord
                    : room.hintWord) ?? ""
                ).map((char, index) => (
                  <span
                    className="mx-[2px] sm:mx-1 md:text-lg sm:text-sm text-xs font-medium"
                    key={index}
                  >
                    {char}
                  </span>
                ))}
            </div>
          </div>
        )}
        <Toggle variant={"outline"} onClick={leaveRoom} className="">
          <TbLogout className="text-md md:text-lg"></TbLogout>
        </Toggle>
      </div>
    </header>
  );
}
