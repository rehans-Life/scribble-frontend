import CreateRoomForm from "@/components/create-room-form";
import JoinRoomForm from "@/components/join-room-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { nanoid } from "nanoid";

export default function RoomForm() {
  const nanoId = nanoid();

  return (
    <div className="flex flex-col justify-center items-center flex-1 md:p-12 px-2 py-8">
      <Card className="w-[400px] max-w-full bg-[rgba(12,44,150,0.75)] text-white border-none">
        <CardHeader>
          <CardTitle className="text-3xl sm:text-left text-center">
            Scribble
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-y-7">
            <CreateRoomForm roomId={nanoId} />
            <div className="flex items-center gap-x-2">
              <Separator className="flex-1 bg-white" />
              <p className="text-xs text-white align-top">OR</p>
              <Separator className="flex-1" />
            </div>
            <JoinRoomForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
