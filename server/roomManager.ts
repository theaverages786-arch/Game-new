import { Server, Socket } from 'socket.io';
import { GameRoom, RoomPlayer, GameType } from './types.js';
import { LudoEngine, LudoColor } from './ludoEngine.js';
import { TeenPattiEngine } from './teenPattiEngine.js';
import { RummyEngine } from './rummyEngine.js';

export class RoomManager {
  private io: Server;
  private rooms: Map<string, GameRoom> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.createPresetRooms();
  }

  private createPresetRooms() {
    // Seed standard public rooms for immediate instant play
    this.createRoom({
      id: 'room_ludo_public',
      code: 'LUDO-777',
      name: 'Lahore Champions (4-Player)',
      gameType: 'ludo',
      stake: 500,
      maxPlayers: 4,
    });

    this.createRoom({
      id: 'room_tp_public',
      code: 'TP-VIP',
      name: 'Karachi High Rollers (5-Seat)',
      gameType: 'teen_patti',
      stake: 200,
      maxPlayers: 5,
    });

    this.createRoom({
      id: 'room_rummy_public',
      code: 'RUMMY-PRO',
      name: 'Royal Rummy Lounge (2-Player)',
      gameType: 'rummy',
      stake: 1000,
      maxPlayers: 2,
    });
  }

  public getPublicRooms(): GameRoom[] {
    return Array.from(this.rooms.values()).map(r => ({
      ...r,
      // Hide internal decks for security
      gameState: r.gameState ? { ...r.gameState, drawPile: undefined } : null,
    }));
  }

  public createRoom(options: {
    id?: string;
    code?: string;
    name: string;
    gameType: GameType;
    stake: number;
    maxPlayers: number;
  }): GameRoom {
    const id = options.id || `room_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const code =
      options.code ||
      `${options.gameType.toUpperCase().slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const room: GameRoom = {
      id,
      code,
      name: options.name,
      gameType: options.gameType,
      stake: options.stake,
      maxPlayers: options.maxPlayers,
      players: [],
      status: 'waiting',
      currentTurn: 0,
      createdAt: Date.now(),
      gameState: null,
    };

    this.rooms.set(id, room);
    return room;
  }

  public joinRoom(roomIdOrCode: string, player: RoomPlayer, socket: Socket): GameRoom | null {
    let room = this.rooms.get(roomIdOrCode);
    if (!room) {
      room = Array.from(this.rooms.values()).find(
        r => r.code.toUpperCase() === roomIdOrCode.toUpperCase()
      );
    }
    if (!room) return null;

    if (room.players.length >= room.maxPlayers && !room.players.some(p => p.id === player.id)) {
      return null;
    }

    const existingIdx = room.players.findIndex(p => p.id === player.id);
    if (existingIdx >= 0) {
      room.players[existingIdx] = { ...room.players[existingIdx], ...player };
    } else {
      player.seatIndex = room.players.length;
      room.players.push(player);
    }

    socket.join(room.id);
    this.broadcastRoom(room.id);
    return room;
  }

  public fillWithBots(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const botNames = [
      { name: 'Raja Malik', avatar: '👳‍♂️' },
      { name: 'Ali King', avatar: '🦁' },
      { name: 'Usman 786', avatar: '🧔' },
      { name: 'Shahid VIP', avatar: '🕶️' },
    ];

    while (room.players.length < room.maxPlayers) {
      const idx = room.players.length;
      const profile = botNames[idx - 1] || { name: `Player ${idx + 1}`, avatar: '🤖' };
      room.players.push({
        id: `bot_${Date.now()}_${idx}`,
        name: profile.name,
        avatar: profile.avatar,
        isBot: true,
        coins: 25000,
        seatIndex: idx,
        ready: true,
      });
    }

    this.startGame(roomId);
  }

  public startGame(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length < 2) return;

    room.status = 'in_progress';

    if (room.gameType === 'ludo') {
      room.gameState = LudoEngine.initializeGame(room);
    } else if (room.gameType === 'teen_patti') {
      room.gameState = TeenPattiEngine.initializeGame(room);
    } else if (room.gameType === 'rummy') {
      room.gameState = RummyEngine.initializeGame(room);
    }

    this.broadcastRoom(roomId);
  }

  public broadcastRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    this.io.to(roomId).emit('room_updated', room);
    this.io.emit('lobby_rooms', this.getPublicRooms());
  }

  public handleSocketEvents(socket: Socket) {
    // Send initial rooms list on connect
    socket.emit('lobby_rooms', this.getPublicRooms());

    // Create custom room
    socket.on('create_room', (data, callback) => {
      const newRoom = this.createRoom({
        name: data.name || `${data.gameType.toUpperCase()} Table`,
        gameType: data.gameType,
        stake: data.stake || 500,
        maxPlayers: data.maxPlayers || 4,
      });
      if (callback) callback({ success: true, room: newRoom });
      this.io.emit('lobby_rooms', this.getPublicRooms());
    });

    // Join room
    socket.on('join_room', ({ roomId, player }, callback) => {
      const room = this.joinRoom(roomId, player, socket);
      if (room) {
        if (callback) callback({ success: true, room });
      } else {
        if (callback) callback({ success: false, message: 'Room full or not found' });
      }
    });

    // Add Bots to Room
    socket.on('fill_bots', ({ roomId }) => {
      this.fillWithBots(roomId);
    });

    // Start Game
    socket.on('start_game', ({ roomId }) => {
      this.startGame(roomId);
    });

    // --- Ludo Events ---
    socket.on('ludo_roll_dice', ({ roomId, color }) => {
      const room = this.rooms.get(roomId);
      if (!room || room.gameType !== 'ludo' || !room.gameState) return;

      const result = LudoEngine.rollDice(room.gameState, color);
      this.broadcastRoom(roomId);

      // Bot automatic reaction if needed
      if (room.gameState.hasRolled && room.gameState.currentTurnColor !== color) {
        // Passed turn
      }
    });

    socket.on('ludo_move_pawn', ({ roomId, color, pawnId }) => {
      const room = this.rooms.get(roomId);
      if (!room || room.gameType !== 'ludo' || !room.gameState) return;

      LudoEngine.movePawn(room.gameState, color, pawnId);
      this.broadcastRoom(roomId);
    });

    // --- Teen Patti Events ---
    socket.on('tp_bet', ({ roomId, playerId, multiplier }) => {
      const room = this.rooms.get(roomId);
      if (!room || room.gameType !== 'teen_patti' || !room.gameState) return;

      TeenPattiEngine.placeBet(room, room.gameState, playerId, multiplier);
      this.broadcastRoom(roomId);
    });

    socket.on('tp_pack', ({ roomId, playerId }) => {
      const room = this.rooms.get(roomId);
      if (!room || room.gameType !== 'teen_patti' || !room.gameState) return;

      TeenPattiEngine.packPlayer(room, room.gameState, playerId);
      this.broadcastRoom(roomId);
    });

    socket.on('tp_see_cards', ({ roomId, playerId }) => {
      const room = this.rooms.get(roomId);
      if (!room || !room.gameState) return;
      const player = room.players.find(p => p.id === playerId);
      if (player) {
        player.isSeen = true;
        this.broadcastRoom(roomId);
      }
    });

    socket.on('tp_showdown', ({ roomId }) => {
      const room = this.rooms.get(roomId);
      if (!room || room.gameType !== 'teen_patti' || !room.gameState) return;

      TeenPattiEngine.showdown(room, room.gameState);
      this.broadcastRoom(roomId);
    });

    // --- Rummy Events ---
    socket.on('rummy_draw', ({ roomId, playerId, from }) => {
      const room = this.rooms.get(roomId);
      if (!room || room.gameType !== 'rummy' || !room.gameState) return;

      RummyEngine.drawCard(room, room.gameState, playerId, from);
      this.broadcastRoom(roomId);
    });

    socket.on('rummy_discard', ({ roomId, playerId, cardId }) => {
      const room = this.rooms.get(roomId);
      if (!room || room.gameType !== 'rummy' || !room.gameState) return;

      RummyEngine.discardCard(room, room.gameState, playerId, cardId);
      this.broadcastRoom(roomId);
    });

    socket.on('rummy_declare', ({ roomId, playerId }) => {
      const room = this.rooms.get(roomId);
      if (!room || room.gameType !== 'rummy' || !room.gameState) return;

      RummyEngine.declareHand(room, room.gameState, playerId);
      this.broadcastRoom(roomId);
    });
  }
}
