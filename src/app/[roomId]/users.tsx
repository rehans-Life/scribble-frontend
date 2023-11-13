import { getDrawer, getUsers } from "@/redux/slices/roomSlice";
import { User } from "@/utils/interfaces";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { LuCrown } from "react-icons/lu";
import { PencilRulerIcon } from "lucide-react";
import { socket } from "@/utils/socket";

export default function Users() {
  const users = useSelector(getUsers);
  const drawer = useSelector(getDrawer);

  const rankedUsers = useMemo(() => {
    if (!users) return [];

    const copiedUsers = users.concat();
    copiedUsers.sort((a, b) => b.points - a.points);

    return copiedUsers;
  }, [users]);

  const User = ({
    rank,
    user,
    isDrawer,
  }: {
    rank: number;
    user: User;
    isDrawer: boolean;
  }) => {
    const { id, name, guessed, points, role } = user;
    return (
      <div
        className={`flex flex-row justify-between gap-x-2 relative px-2 py-2 text-black ${
          guessed
            ? "odd:bg-green-400 even:bg-green-500"
            : "odd:bg-white even:bg-slate-200"
        }
  `}
      >
        <div className="flex flex-col items-center">
          <div className="text-[14px] text-md font-semibold font-mono whitespace-nowrap">
            #<span className="ml-[0.09rem]">{rank}</span>
          </div>
          {role === "admin" && (
            <div className="text-md flex items-center justify-center">
              <LuCrown />
            </div>
          )}
        </div>
        <div className="flex flex-col items-center flex-1 relative z-20 justify-center">
          <div
            className={`${
              isDrawer && "text-blue-600"
            } text-[11px] md:text-sm text-center font-semibold text-black break-all`}
          >
            {name}
            {id === socket.id && "(You)"}
          </div>
          <div className="text-[9px] md:text-xs text-black">
            {points} points
          </div>
        </div>
        <div className=" absolute right-2 top-4 flex items-center justify-center">
          {isDrawer && <PencilRulerIcon className="h-5 w-5 md:h-6 md:w-6" />}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full md:flex-0 md:h-min">
      <div className="md:max-h-[35%] bg-white rounded-sm overflow-y-scroll overflow-x-hidden scrollbar scrollbar-thumb-slate-400 scrollbar-w-1.5 scrollbar-thumb scrollbar-thumb-rounded-md scroll">
        {rankedUsers?.map((user, index) => (
          <User
            key={user.id}
            rank={index + 1}
            user={user}
            isDrawer={user.id === drawer?.id}
          />
        ))}
      </div>
    </div>
  );
}
