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
import { Loader2 } from "lucide-react";
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-y-7">
        <div className="flex flex-col gap-y-2">
          <Label>Username</Label>
          <Input
            type="text"
            placeholder="qwerty"
            maxLength={18}
            {...register("username", { required: true, maxLength: 18 })}
          />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Room ID</Label>
          <Input
            type="text"
            readOnly
            {...register("roomId", { required: true })}
          />
        </div>
        <Button type="submit" className="bg-blue-800 hover:bg-blue-900">
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
