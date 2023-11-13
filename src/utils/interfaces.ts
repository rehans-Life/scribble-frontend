export interface User {
  id: string;
  position: number;
  name: string;
  guessed: boolean;
  points: number;
  additionalPoints: number;
  role: "admin" | "player";
}

export interface CanvasState {
  backgroundColor: [number, string];
  dataUrl: string;
}

export interface Room {
  id: string;
  users: User[];
  drawer: string;
  guessWord: string;
  hintWord: string;
  gameState: "drawing" | "selecting" | "finished" | "waiting";
  players: number;
  wordCount: number;
  hints: number;
  drawerTime: number;
  gameTime: number;
  gapTime: number;
}

export interface UpdateRoom {
  id?: string;
  users?: User[];
  drawer?: string;
  guessWord: string;
  gameState?: "drawing" | "selecting" | "finished" | "waiting";
}

export interface Message {
  content: string;
  username?: string;
  type:
    | "error"
    | "correct-guess"
    | "default"
    | "player-joined"
    | "player-left"
    | "room-owner"
    | "drawing"
    | "local"
    | "finished";
}

export interface Line {
  points: Array<number>;
  tool: "pen" | "brush";
  color: string;
  strokeWidth: number;
}
