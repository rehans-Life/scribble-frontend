import {
  addMessage,
  getDrawer,
  getMessages,
  getRoom,
  getUser,
} from "@/redux/slices/roomSlice";
import { useDispatch, useSelector } from "react-redux";
import Message from "./message";
import { Input } from "@/components/ui/input";
import { FormEvent, useEffect, useRef, useState } from "react";
import { socket } from "@/utils/socket";
import { useAtomValue } from "jotai";
import { timerAtom } from "@/atoms/timerAtom";
import Users from "./users";

export default function GameOptions() {
  const room = useSelector(getRoom);
  const drawer = useSelector(getDrawer);
  const user = useSelector(getUser(socket.id));
  const messages = useSelector(getMessages);

  const timeValue = useAtomValue(timerAtom);

  const [message, setMessage] = useState<string>("");
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const dispatch = useDispatch();

  useEffect(() => {
    const observer = new MutationObserver(() => {
      messagesRef.current?.scrollTo({
        top: messagesRef.current.scrollHeight,
      });
    });

    observer.observe(messagesRef.current!, {
      childList: true,
    });

    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (drawer?.id === socket.id || user?.guessed) {
      dispatch(
        addMessage({
          username: user?.name,
          content: message,
          type: "local",
        })
      );
    } else {
      socket.emit("guess-word", room?.id, message, timeValue);
    }

    setMessage("");
  };

  return (
    <>
      <div className="flex md:flex-col items-start gap-1 h-[250px] md:h-full w-full md:pl-2">
        <Users />
        <div className="flex flex-col justify-end w-full md:flex-grow flex-1 h-full bg-white relative rounded-sm overflow-hidden">
          <div
            ref={messagesRef}
            className="h-full md:max-h-[310px] flex flex-col-reverse overflow-y-scroll overflow-x-hidden scrollbar scrollbar-thumb-slate-400 scrollbar-w-1.5 scrollbar-thumb scrollbar-thumb-rounded-md scroll"
          >
            {messages?.map((message, index) => (
              <Message message={message} key={index} />
            ))}
          </div>
          <div className="sticky border-t bottom-0 p-2 md:flex justify-center items-center hidden">
            <form
              onSubmit={handleSubmit}
              className="flex justify-center items-center w-full"
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter new message"
                className="bg-white border-slate-500 border p-2 rounded-md w-full outline-slate-900"
              />
            </form>
          </div>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex justify-center items-center w-full md:hidden"
      >
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter new message"
          className="bg-white border-slate-500 border p-2 rounded-md w-full outline-blue-900"
        />
      </form>
    </>
  );
}
