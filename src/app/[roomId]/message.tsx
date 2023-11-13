import { Message } from "@/utils/interfaces";

export default function Message({ message }: { message: Message }) {
  const common =
    "text-[11px] md:text-[13px] w-full font-medium p-1 py-2 odd:bg-white even:bg-slate-200";

  switch (message.type) {
    case "correct-guess":
      return (
        <div
          className={`text-[10px] md:text-[13px] font-semibold bg-green-200 text-green-600 p-1 py-2`}
        >
          <p> {message.content}</p>
        </div>
      );
    case "drawing":
      return <div className={`text-blue-600 ${common}`}>{message.content}</div>;
    case "finished":
    case "player-joined":
      return (
        <div className={`text-green-600 ${common}`}>{message.content}</div>
      );
    case "room-owner":
      return (
        <div className={`text-yellow-600 ${common}`}>{message.content}</div>
      );
    case "error":
    case "player-left":
      return <div className={`text-red-600 ${common}`}>{message.content}</div>;
    default:
      return (
        <div
          className={`${
            message.type === "local" ? "text-green-500" : "text-black"
          } text-black-600 ${common}`}
        >
          <span className="font-semibold mr-1 break-words">
            {message.username}:
          </span>{" "}
          <span className="break-words">{message.content}</span>
        </div>
      );
  }
}
