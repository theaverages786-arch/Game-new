import { io, Socket } from 'socket.io-client';

export interface GameRoom {
  id: string;
  code: string;
  name: string;
  gameType: 'ludo' | 'teen_patti' | 'rummy';
  stake: number;
  maxPlayers: number;
  players: any[];
  status: 'waiting' | 'in_progress' | 'finished';
  currentTurn: number;
  createdAt: number;
  gameState: any;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private lobbyRoomsCallbacks: ((rooms: GameRoom[]) => void)[] = [];
  private roomUpdatedCallbacks: ((room: GameRoom) => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      // Connect to origin or localhost:3000
      const url = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      this.socket = io(url, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('⚡ Connected to KhelClub Multiplayer Socket.io server:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('🔌 Disconnected from Socket.io server');
      });

      this.socket.on('lobby_rooms', (rooms: GameRoom[]) => {
        this.lobbyRoomsCallbacks.forEach(cb => cb(rooms));
      });

      this.socket.on('room_updated', (room: GameRoom) => {
        this.roomUpdatedCallbacks.forEach(cb => cb(room));
      });
    } catch (e) {
      console.warn('Socket.io initialization error, falling back to local simulation:', e);
    }
  }

  public getSocketId(): string {
    return this.socket?.id || `client_${Date.now()}`;
  }

  public onLobbyRooms(callback: (rooms: GameRoom[]) => void): () => void {
    this.lobbyRoomsCallbacks.push(callback);
    return () => {
      this.lobbyRoomsCallbacks = this.lobbyRoomsCallbacks.filter(cb => cb !== callback);
    };
  }

  public onRoomUpdated(callback: (room: GameRoom) => void): () => void {
    this.roomUpdatedCallbacks.push(callback);
    return () => {
      this.roomUpdatedCallbacks = this.roomUpdatedCallbacks.filter(cb => cb !== callback);
    };
  }

  public createRoom(
    data: { name: string; gameType: 'ludo' | 'teen_patti' | 'rummy'; stake: number; maxPlayers: number },
    callback?: (res: { success: boolean; room: GameRoom }) => void
  ) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('create_room', data, callback);
    } else {
      // Offline mock fallback
      const room: GameRoom = {
        id: `local_room_${Date.now()}`,
        code: `${data.gameType.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        name: data.name,
        gameType: data.gameType,
        stake: data.stake,
        maxPlayers: data.maxPlayers,
        players: [],
        status: 'waiting',
        currentTurn: 0,
        createdAt: Date.now(),
        gameState: null,
      };
      if (callback) callback({ success: true, room });
    }
  }

  public joinRoom(
    roomId: string,
    player: { id: string; name: string; avatar: string; coins: number },
    callback?: (res: { success: boolean; room?: GameRoom; message?: string }) => void
  ) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_room', { roomId, player }, callback);
    } else {
      // Local fallback
      if (callback) callback({ success: true });
    }
  }

  public fillBots(roomId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('fill_bots', { roomId });
    }
  }

  public startGame(roomId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('start_game', { roomId });
    }
  }

  // --- Ludo Methods ---
  public ludoRollDice(roomId: string, color: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('ludo_roll_dice', { roomId, color });
    }
  }

  public ludoMovePawn(roomId: string, color: string, pawnId: number) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('ludo_move_pawn', { roomId, color, pawnId });
    }
  }

  // --- Teen Patti Methods ---
  public tpBet(roomId: string, playerId: string, multiplier: number) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('tp_bet', { roomId, playerId, multiplier });
    }
  }

  public tpPack(roomId: string, playerId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('tp_pack', { roomId, playerId });
    }
  }

  public tpSeeCards(roomId: string, playerId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('tp_see_cards', { roomId, playerId });
    }
  }

  public tpShowdown(roomId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('tp_showdown', { roomId });
    }
  }

  // --- Rummy Methods ---
  public rummyDraw(roomId: string, playerId: string, from: 'draw' | 'discard') {
    if (this.socket && this.socket.connected) {
      this.socket.emit('rummy_draw', { roomId, playerId, from });
    }
  }

  public rummyDiscard(roomId: string, playerId: string, cardId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('rummy_discard', { roomId, playerId, cardId });
    }
  }

  public rummyDeclare(roomId: string, playerId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('rummy_declare', { roomId, playerId });
    }
  }
}

export const socketService = new SocketService();
