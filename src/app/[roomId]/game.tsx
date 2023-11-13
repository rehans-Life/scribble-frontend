import { useEffect } from "react";
import Canvas from "./canvas";
import { socket } from "@/utils/socket";
import GameOptions from "./game-options";
import { Room } from "@/utils/interfaces";
import { useDispatch } from "react-redux";
import { roomConnected, setRandomWords } from "@/redux/slices/roomSlice";
import Header from "./header";

export default function Game() {
  const dispatch = useDispatch();

  useEffect(() => {
    const onSelectWord = (words: string[]) => {
      dispatch(setRandomWords(words));
    };

    const onRoomChanges = (room: Room) => {
      dispatch(roomConnected(room));
    };

    socket.on("select-word", onSelectWord);
    socket.on("room-changed", onRoomChanges);

    return () => {
      socket.off("select-word", onSelectWord);
      socket.on("room-changed", onRoomChanges);
    };
  }, []);

  return (
    <div className="w-full max-w-[1100px] flex flex-col justify-center gap-y-2 h-full flex-grow md:py-6 py-2">
      <Header />
      <div className="w-full flex-grow flex flex-col md:grid md:grid-cols-[calc(100%-300px)_300px] gap-y-2 md:max-h-[600px] px-1 pb-1 md:p-0">
        <Canvas />
        <GameOptions />
      </div>
    </div>
  );
}
