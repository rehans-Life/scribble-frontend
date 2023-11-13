"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { socket } from "@/utils/socket";
import { Room } from "@/utils/interfaces";
import { roomConnected } from "@/redux/slices/roomSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2 } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { nanoid } from "nanoid";

interface Inputs {
  username: string;
  roomId: string;
}

export default function CreateRoomForm({ roomId }: { roomId: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors, defaultValues },
    setValue,
  } = useForm<Inputs>({
    defaultValues: {
      roomId,
    },
  });

  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState<boolean>(false);
  const [isCopying, setIsCopying] = useState<boolean>(false);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    socket.emit("create-room", data.roomId, data.username);
  };

  useEffect(() => {
    const onRoomCreated = (room: Room) => {
      dispatch(roomConnected(room));
      router.replace(`/${room.id}`);
    };

    const onRoomExists = () => {
      toast({
        title: "A room already exists with the given id",
      });
      setValue("roomId", nanoid());
      setLoading(false);
    };

    socket.on("room-created", onRoomCreated);
    socket.on("room-already-exists", onRoomExists);

    return () => {
      socket.off("room-created", onRoomCreated);
      socket.off("room-already-exists", onRoomExists);
    };
  }, []);

  const copyRoomId = async () => {
    setIsCopying(true);
    await navigator.clipboard.writeText(roomId);
    setTimeout(() => setIsCopying(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-y-7">
        <div className="flex flex-col gap-y-2">
          <Label>Username</Label>
          <Input
            type="text"
            placeholder="qwerty"
            className="text-black font-medium"
            maxLength={18}
            {...register("username", { required: true, maxLength: 18 })}
          />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Room ID</Label>
          <div className="relative h-auto w-auto">
            <Input
              type="text"
              className="text-black font-medium"
              readOnly
              {...register("roomId", { required: true })}
            />
            <div className="absolute top-0 bottom-0 right-2 flex items-center justify-center">
              {isCopying ? (
                <Check className="w-4 h-4 text-black" />
              ) : (
                <Copy
                  className="w-4 h-4 text-black cursor-pointer"
                  onClick={copyRoomId}
                />
              )}
            </div>
          </div>
        </div>
        <Button type="submit" className="bg-green-600 hover:bg-green-500">
          {" "}
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5"></Loader2>
          ) : (
            "Create a Room"
          )}
        </Button>
      </div>
    </form>
  );
}
