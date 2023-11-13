import CreateRoomForm from "@/components/create-room-form";
import JoinRoomForm from "@/components/join-room-form";
import { ThemeToggler } from "@/components/theme-toggler";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { nanoid } from "nanoid";

export default function RoomForm() {
  const nanoId = nanoid();

  return (
    <div className="flex justify-center items-center h-screen p-5">
      <Card className="w-[400px] max-w-full">
        <CardHeader>
          <CardTitle> Scribble</CardTitle>
          <CardDescription>
            Scribble is a free online multiplayer drawing and guessing
            pictionary game.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-y-7">
            <CreateRoomForm roomId={nanoId} />
            <div className="flex items-center gap-x-2">
              <Separator className="flex-1" />
              <p className="text-xs text-muted-foreground align-top">OR</p>
              <Separator className="flex-1" />
            </div>
            <JoinRoomForm />
          </div>
        </CardContent>
      </Card>
      <div className="absolute bottom-5 text-white">
        <p className="text-sm text-center px-3">
          Crafted by{" "}
          <a className="cursor-pointer font-medium border-b-2 border-muted">
            Rehan
          </a>
          , The source code is on{" "}
          <a className="cursor-pointer font-medium border-b-2 border-muted">
            GitHub
          </a>
        </p>
      </div>
    </div>
  );
}
