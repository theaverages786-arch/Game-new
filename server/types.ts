export type GameType = 'ludo' | 'teen_patti' | 'rummy';

export interface RoomPlayer {
  id: string; // socket.id or unique player id
  name: string;
  avatar: string;
  isBot?: boolean;
  coins: number;
  seatIndex: number;
  ready: boolean;
  // Game specific state
  ludoColor?: 'red' | 'green' | 'yellow' | 'blue';
  cards?: any[];
  isPacked?: boolean;
  isSeen?: boolean;
  currentBet?: number;
}

export interface GameRoom {
  id: string;
  code: string;
  name: string;
  gameType: GameType;
  stake: number; // In play-money coins
  maxPlayers: number;
  players: RoomPlayer[];
  status: 'waiting' | 'in_progress' | 'finished';
  currentTurn: number; // seatIndex or socket id
  createdAt: number;
  gameState: any;
}
