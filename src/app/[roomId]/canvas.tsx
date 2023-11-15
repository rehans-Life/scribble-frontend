import { CanvasState, Line as LineInterface, User } from "@/utils/interfaces";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Stage as s } from "konva/lib/Stage";
import { Layer as l } from "konva/lib/Layer";
import { socket } from "@/utils/socket";
import { useSelector } from "react-redux";
import {
  getCanvasState,
  getDrawer,
  getRandomWords,
  getRoom,
  getUsers,
} from "@/redux/slices/roomSlice";
import { HexColorPicker } from "react-colorful";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowBigLeftIcon,
  LucidePaintBucket,
  Pen,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LuAlarmClock } from "react-icons/lu";
import { IoPerson } from "react-icons/io5";
import { VscSymbolKeyword } from "react-icons/vsc";
import { MdQuestionMark } from "react-icons/md";
import RoomSelect from "@/components/room-select";
import { AnimatePresence, motion } from "framer-motion";
import BounceIn from "@/components/bounce-in";

export default function Canvas() {
  const room = useSelector(getRoom);
  const drawer = useSelector(getDrawer);
  const users = useSelector(getUsers);
  const randomWords = useSelector(getRandomWords);
  const canvasState = useSelector(getCanvasState);

  const [tool, setTool] = useState<"pen" | "bucket">("pen");
  const [lines, setLines] = useState<LineInterface[]>([]);
  const [color, setColor] = useState<string>("#BE3144");
  const [canvasStates, setCanvasStates] = useState<CanvasState[]>([]);
  const [strokeWidth, setStrokeWidth] = useState<number>(5);

  const isDrawing = useRef<boolean>(false);
  const stageRef = useRef<s | null>(null);
  const layerRef = useRef<l | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const rectRef = useRef<Konva.Rect | null>(null);
  const imageRef = useRef<Konva.Image | null>(null);

  const resizePaste = useRef<boolean>(false);
  const supportsPassive = useRef<boolean>(false);

  const isDrawer = useMemo<boolean>(() => {
    return drawer?.id === socket.id;
  }, [drawer]);

  const isAdmin = useMemo<boolean>(() => {
    if (!users) return false;
    return users.some(({ id, role }) => id === socket.id && role === "admin");
  }, [users]);

  useLayoutEffect(() => {
    onResize();
  }, [drawer?.id]);

  const preventDefault = (e: TouchEvent) => {
    e.preventDefault();
  };

  const disableScroll = () => {
    window.addEventListener(
      "touchmove",
      preventDefault,
      supportsPassive.current ? { passive: false } : false
    );
  };

  const enableScroll = () => {
    window.removeEventListener("touchmove", preventDefault);
  };

  useEffect(() => {
    if (isDrawing.current) {
      disableScroll();
    } else {
      enableScroll();
    }
  }, [isDrawing.current]);

  const createCanvasState = useCallback(() => {
    const clonedLayer = layerRef.current?.clone();

    clonedLayer?.findOne("Rect")?.remove();

    const newCanvasState: CanvasState = {
      backgroundColor: rectRef.current?.getAttr("fillLinearGradientColorStops"),
      dataUrl: clonedLayer?.toDataURL({
        mimeType: "image/png",
        pixelRatio: 2,
        x: 0,
        y: 0,
        height: stageRef.current?.getSize().height,
        width: stageRef.current?.getSize().width,
      }) as string,
    };

    return newCanvasState;
  }, []);

  const emitBoardChange = useCallback(() => {
    if (!isDrawer) return;

    const newCanvasState: CanvasState = createCanvasState();

    socket.emit("board-change", room?.id, newCanvasState);
  }, [room, createCanvasState]);

  const clearBoard = useCallback(() => {
    isDrawing.current = false;
    rectRef.current?.fillLinearGradientColorStops([1, "white"]);
    setLines([]);
    setCanvasStates([canvasStates[0]]);
    imageRef.current?.image(undefined);
  }, [canvasStates]);

  useLayoutEffect(() => {
    if (resizePaste.current) {
      resizePaste.current = false;
      return;
    }
    emitBoardChange();
  }, [lines]);

  useEffect(() => {
    socket.on("new-member-joined", emitBoardChange);
    socket.on("clear-board", clearBoard);

    return () => {
      socket.off("new-member-joined", emitBoardChange);
      socket.off("clear-board", clearBoard);
    };
  }, [clearBoard, emitBoardChange]);

  const sortedUsers = useMemo<User[] | undefined>(() => {
    if (!room?.users) return [];

    const copiedUsers = room?.users.concat();
    copiedUsers?.sort((a, b) => b.additionalPoints - a.additionalPoints);
    return copiedUsers;
  }, [room?.users]);

  const pasteCanvasState = (canvasState: CanvasState) => {
    rectRef.current?.fillLinearGradientColorStops(canvasState.backgroundColor);

    const newLayerImage = new Image();

    newLayerImage.onload = function () {
      const widthFit =
        (stageRef.current?.getSize().width as number) / newLayerImage.width;

      const heightFit =
        (stageRef.current?.getSize().height as number) / newLayerImage.height;

      const scale = widthFit > heightFit ? heightFit : widthFit;

      imageRef.current?.height(newLayerImage.height * scale);
      imageRef.current?.width(newLayerImage.width * scale);

      centreRectShape(imageRef.current as Konva.Image);

      imageRef.current?.image(newLayerImage);
      setLines([]);
    };

    newLayerImage.src = canvasState.dataUrl;
    imageRef.current?.moveToTop();
  };

  useLayoutEffect(() => {
    if (!canvasState) return;
    pasteCanvasState(canvasState);
  }, [canvasState]);

  const resizeImg = useCallback(() => {
    const widthFit =
      (stageRef.current?.getSize().width as number) /
      imageRef.current?.getWidth();

    const heightFit =
      (stageRef.current?.getSize().height as number) /
      imageRef.current?.getHeight();

    const scale = widthFit > heightFit ? heightFit : widthFit;

    imageRef.current?.height(imageRef.current?.getHeight() * scale);
    imageRef.current?.width(imageRef.current?.getWidth() * scale);

    centreRectShape(imageRef.current as Konva.Image);
  }, []);

  function centreRectShape(shape: Konva.Shape) {
    shape.x(
      ((stageRef.current?.width() as number) - (shape.width() as number)) / 2
    );

    shape.y(
      ((stageRef.current?.height() as number) - (shape.height() as number)) / 2
    );
  }

  const onResize = useCallback(() => {
    const height = stageContainerRef.current?.clientHeight as number;
    const width = stageContainerRef.current?.clientWidth as number;

    const newStageHeight = height;
    const newStageWidth = width;

    stageRef.current?.height(newStageHeight);
    stageRef.current?.width(newStageWidth);

    rectRef.current?.fillLinearGradientEndPoint({
      x: newStageWidth,
      y: newStageHeight,
    });

    rectRef.current?.height(newStageHeight);
    rectRef.current?.width(newStageWidth);

    if (canvasStates.length > 1) {
      resizePaste.current = true;
      pasteCanvasState(canvasStates[canvasStates.length - 1]);
    }
  }, [canvasStates]);

  useLayoutEffect(() => {
    rectRef.current = new Konva.Rect({
      x: 0,
      y: 0,
      fillLinearGradientStartPoint: {
        x: 0,
        y: 0,
      },
      fillLinearGradientColorStops: [1, "white"],
    });

    imageRef.current = new Konva.Image({
      x: 0,
      y: 0,
      image: undefined,
    });

    onResize();

    layerRef.current?.add(rectRef.current);

    imageRef.current?.height(stageRef.current?.getSize().height as number);
    imageRef.current?.width(stageRef.current?.getSize().width as number);
    layerRef.current?.add(imageRef.current);
  }, []);

  useEffect(() => {
    const initialCanvasState = createCanvasState();
    if (initialCanvasState) setCanvasStates([initialCanvasState]);

    try {
      window.addEventListener(
        "test",
        () => {},
        Object.defineProperty({}, "passive", {
          get: function () {
            supportsPassive.current = true;
          },
        })
      );
    } catch (e) {}
  }, []);

  useEffect(() => {
    window.addEventListener("resize", onResize);
    window.addEventListener("resize", resizeImg);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("resize", resizeImg);
    };
  }, [onResize, resizeImg]);

  const handleMouseDown = (
    event: KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    if (!isDrawer) return;

    if (tool === "bucket") {
      rectRef.current?.fillLinearGradientColorStops([1, color]);
      emitBoardChange();
      return;
    }
    isDrawing.current = true;
    const pos = event.target.getStage()?.getPointerPosition() as {
      x: number;
      y: number;
    };

    const newLine: LineInterface = {
      tool,
      points: [pos?.x, pos?.y],
      color,
      strokeWidth,
    };

    setLines([...lines, newLine]);
  };

  const handleMouseMove = (
    event: KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    if (!isDrawing.current || !isDrawer) return;

    const lastLine = lines[lines.length - 1];
    const pos = event.target.getStage()?.getPointerPosition() as {
      x: number;
      y: number;
    };
    // Extending the current line to the current cursor poisition
    lastLine.points = lastLine?.points.concat([pos.x, pos.y]);

    // updating the last line in the lines state.
    lines.splice(lines.length - 1, 1, lastLine);

    // Updating lines through splice method doesnt work we
    // gotta set state to be able to cause a re render and
    // see the changes.
    setLines(lines.concat());
  };

  const handleMouseUp = (_: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isDrawer) return;
    isDrawing.current = false;
    setCanvasStates([...canvasStates, createCanvasState()]);
  };

  const Feature = ({ children }: { children: React.ReactNode }) => {
    return (
      <span className="w-10 h-10 rounded-md bg-white overflow-hidden p-[0.15rem] flex items-center justify-center">
        {children}
      </span>
    );
  };

  return (
    <div className="lg:h-full h-auto flex flex-col">
      <div
        ref={stageContainerRef}
        className="w-full h-[300px] md:h-[500px] lg:h-full relative flex items-center justify-center overflow-hidden"
      >
        <AnimatePresence>
          {room?.gameState !== "drawing" && (
            <motion.div
              initial={{ opacity: 0, zIndex: -1 }}
              animate={{ opacity: 1, zIndex: 50 }}
              exit={{
                opacity: 0,
                zIndex: -1,
                transition: { delay: 0.6, ease: "easeIn" },
              }}
              transition={{
                ease: "easeIn",
              }}
              className="absolute flex items-center justify-center top-0 bottom-0 left-0 right-0 rounded-md bg-[rgba(3,5,42,0.65)]"
            ></motion.div>
          )}
        </AnimatePresence>
        <BounceIn initialDelay={0} isVisible={room?.gameState === "finished"}>
          <div className="flex flex-col items-center justify-center gap-y-10 p-2">
            <div className="flex flex-col items-center gap-y-1">
              <div className="text-white text-center md:text-3xl text-lg font-medium">
                The correct word was{" "}
                <span className="text-orange-200 ml-2 font-semibold">
                  {room?.guessWord}
                </span>
              </div>
              <div className="md:text-lg text-center text-md text-white">
                Time is up!
              </div>
            </div>
            <div className="w-full flex flex-col max-h-36 md:max-h-[300px] overflow-y-auto  scrollbar scrollbar-thumb-slate-400 scrollbar-w-1.5 scrollbar-thumb scrollbar-thumb-rounded-md scroll">
              {sortedUsers?.map((user, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className={`md:text-lg text-md font-medium`}>
                    {user.name}
                  </div>
                  <div
                    className={`md:text-lg text-md font-semibold ${
                      user.additionalPoints ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {user.additionalPoints && "+"}
                    {user.additionalPoints}
                  </div>
                </div>
              ))}
            </div>
          </div>{" "}
        </BounceIn>
        <BounceIn
          initialDelay={0.4}
          isVisible={room?.gameState === "selecting"}
        >
          {drawer?.id === socket.id ? (
            <div className="flex flex-col items-center gap-y-4">
              <div className="text-white md:text-3xl xs:text-2xl text-xl font-medium">
                Choose a word
              </div>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {randomWords.map((word, index) => (
                  <div
                    key={index}
                    className="md:border-4 border-[3px] border-white text-white py-1 px-2 sm:text-lg text-md rounded-sm md:text-lg text-sm xs:text-md font-semibold cursor-pointer"
                    onClick={() => {
                      socket.emit("word-selected", room?.id, word);
                    }}
                  >
                    {word}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-white md:text-xl text-center text-md font-medium p-1">
              {drawer?.name} is selecting a word...
            </div>
          )}
        </BounceIn>
        <BounceIn initialDelay={0} isVisible={room?.gameState === "waiting"}>
          <div className="grid md:grid-cols-1 grid-cols-2 gap-3 p-3 w-full h-full">
            <RoomSelect
              label="Players"
              value={room?.players.toString() ?? ""}
              onChange={(val) => {
                socket.emit("update-room", room?.id, {
                  players: parseInt(val),
                });
              }}
              disabled={!isAdmin}
              options={new Array(20)
                .fill(0)
                .map((_, index) => (index + 2).toString())}
            >
              <IoPerson className="md:text-2xl sm:text-xl text-lg" />
            </RoomSelect>
            <RoomSelect
              label="Draw Time"
              value={room?.gameTime.toString() ?? ""}
              onChange={(val) => {
                socket.emit("update-room", room?.id, {
                  gameTime: parseInt(val),
                });
              }}
              disabled={!isAdmin}
              options={new Array(12)
                .fill(20)
                .map((val, index) => (val * (index + 1)).toString())}
            >
              <LuAlarmClock className="md:text-2xl sm:text-xl text-lg" />
            </RoomSelect>
            <RoomSelect
              label="Word Count"
              value={room?.wordCount.toString() ?? ""}
              onChange={(val) => {
                socket.emit("update-room", room?.id, {
                  wordCount: parseInt(val),
                });
              }}
              disabled={!isAdmin}
              options={new Array(4)
                .fill(0)
                .map((_, index) => (index + 2).toString())}
            >
              <VscSymbolKeyword className="md:text-2xl sm:text-xl text-lg" />
            </RoomSelect>
            <RoomSelect
              label="Hints"
              value={room?.hints.toString() ?? ""}
              onChange={(val) => {
                socket.emit("update-room", room?.id, {
                  hints: parseInt(val),
                });
              }}
              disabled={!isAdmin}
              options={new Array(6).fill(0).map((_, index) => index.toString())}
            >
              <MdQuestionMark className="md:text-2xl sm:text-xl text-lg" />
            </RoomSelect>
            <Button
              onClick={() => socket.emit("start-game", room?.id)}
              className="w-full md:col-span-1 col-span-2 mt-5 rounded-sm md:text-xl text-lg md:h-12 h-10 bg-blue-800 hover:bg-blue-900"
            >
              Start Game!
            </Button>
          </div>
        </BounceIn>
        <Stage
          ref={stageRef}
          className={`rounded-md overflow-hidden ${
            isDrawer ? "cursor-crosshair" : "cursor-default"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer ref={layerRef}>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                lineJoin="round"
                lineCap="round"
                globalCompositeOperation="source-over"
              />
            ))}
          </Layer>
        </Stage>
      </div>
      {isDrawer && (
        <div className="px-3 md:px-6 py-2 flex flex-row justify-between items-center flex-wrap gap-y-2">
          <div className="flex gap-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Feature>
                  <div
                    className="w-full h-full rounded-md"
                    style={{
                      backgroundColor: color,
                    }}
                  ></div>
                </Feature>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-2">
                <HexColorPicker color={color} onChange={setColor} />
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Feature>
                  <div
                    style={{
                      height: strokeWidth,
                      width: strokeWidth,
                    }}
                    className="rounded-full bg-black"
                  ></div>
                </Feature>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-10 p-0">
                {[1, 5, 10, 20, 30].map((width, index) => (
                  <DropdownMenuItem
                    key={index}
                    className={`${
                      width === strokeWidth ? "bg-slate-300" : ""
                    } flex items-center justify-center py-2 h-10 w-10 hover:bg-slate-300 rounded-none px-0 cursor-pointer`}
                    onClick={() => setStrokeWidth(width)}
                  >
                    <div
                      style={{
                        height: width,
                        width: width,
                      }}
                      className="rounded-full bg-black"
                    ></div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex gap-x-2">
            <div
              className={`${tool === "pen" ? "bg-slate-300" : "bg-white"} 
            w-10 h-10 px-0 flex items-center justify-center text-black rounded-md hover:bg-slate-300 ease-out duration-150 transition-all cursor-pointer`}
              onClick={() => setTool("pen")}
            >
              <Pen className="w-4" />
            </div>
            <div
              className={`${tool === "bucket" ? "bg-slate-300" : "bg-white"} 
            w-10 h-10 px-0 flex items-center justify-center text-black rounded-md hover:bg-slate-300 ease-out duration-150 transition-all cursor-pointer`}
              onClick={() => setTool("bucket")}
            >
              <LucidePaintBucket className="w-4" />
            </div>
          </div>
          <div className="flex gap-x-2">
            <div
              className={`bg-white 
            w-10 h-10 px-0 flex items-center justify-center text-black rounded-md hover:bg-slate-300 ease-out duration-150 transition-all cursor-pointer`}
              onClick={() => {
                isDrawing.current = false;
                if (canvasStates.length === 1) return;
                canvasStates.pop();
                pasteCanvasState(canvasStates[canvasStates.length - 1]);
                setCanvasStates(canvasStates);
              }}
            >
              <ArrowBigLeftIcon className="w-4" />
            </div>
            <div
              className={`bg-white
            w-10 h-10 px-0 flex items-center justify-center text-black rounded-md hover:bg-slate-300 ease-out duration-150 transition-all cursor-pointer`}
              onClick={clearBoard}
            >
              <Trash2Icon className="w-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
