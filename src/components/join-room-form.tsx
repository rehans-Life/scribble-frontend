"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { socket } from "@/utils/socket";
import { useEffect, useState } from "react";
import { Room } from "@/utils/interfaces";
import { useDispatch } from "react-redux";
import { roomConnected } from "@/redux/slices/roomSlice";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface Inputs {
  username: string;
  roomId: string;
}

export default function JoinRoomForm() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    socket.emit("join-room", data.roomId, data.username);
  };

  const { toast } = useToast();

  useEffect(() => {
    const onRoomJoined = (room: Room) => {
      dispatch(roomConnected(room));
      router.replace(`/${room.id}`);
    };

    const onRoomNotFound = () => {
      setLoading(false);
      toast({
        description: "Room not Found",
      });
    };

    socket.on("room-joined", onRoomJoined);
    socket.on("room-not-found", onRoomNotFound);

    return () => {
      socket.off("room-joined", onRoomJoined);
      socket.off("room-not-found", onRoomNotFound);
    };
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>Join a Room</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Join a room now!</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-5 my-2">
              {" "}
              <div className="flex flex-col gap-y-2">
                <FormField
                  name="username"
                  control={form.control}
                  rules={{ required: true }}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Username"
                            maxLength={18}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <FormField
                  name="roomId"
                  control={form.control}
                  rules={{ required: true }}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Room ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />{" "}
              </div>
              <Button type="submit" className="bg-blue-800 hover:bg-blue-900">
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5"></Loader2>
                ) : (
                  "Join"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
