import React, { useState, useEffect } from 'react';
import { X, Radio, Users, Plus, ShieldCheck, Play, ArrowRight, Dices, Layers } from 'lucide-react';
import { soundService } from '../../services/sound';
import { socketService, GameRoom } from '../../services/socketService';

interface RoomLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  onSelectGameRoom: (gameType: string, roomCode?: string) => void;
}

export const RoomLobbyModal: React.FC<RoomLobbyModalProps> = ({
  isOpen,
  onClose,
  userCoins,
  onSelectGameRoom,
}) => {
  const [tab, setTab] = useState<'join' | 'create' | 'rooms'>('rooms');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [gameType, setGameType] = useState<'ludo' | 'teen_patti' | 'rummy'>('ludo');
  const [roomName, setRoomName] = useState('');
  const [stake, setStake] = useState(500);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [rooms, setRooms] = useState<GameRoom[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch initial or subscribe to rooms
    const unsubscribe = socketService.onLobbyRooms((updatedRooms) => {
      setRooms(updatedRooms);
    });

    // Fallback seed rooms for display
    if (rooms.length === 0) {
      setRooms([
        {
          id: 'room_ludo_public',
          code: 'LUDO-777',
          name: 'Lahore Champions (4-Player)',
          gameType: 'ludo',
          stake: 500,
          maxPlayers: 4,
          players: [
            { id: 'b1', name: 'Ali King', avatar: '🦁', coins: 25000 },
            { id: 'b2', name: 'Raja Malik', avatar: '👳‍♂️', coins: 34000 },
          ],
          status: 'waiting',
          currentTurn: 0,
          createdAt: Date.now(),
          gameState: null,
        },
        {
          id: 'room_tp_public',
          code: 'TP-VIP',
          name: 'Karachi High Rollers (5-Seat)',
          gameType: 'teen_patti',
          stake: 200,
          maxPlayers: 5,
          players: [
            { id: 'b3', name: 'Shahid VIP', avatar: '🕶️', coins: 18000 },
            { id: 'b4', name: 'Usman 786', avatar: '🧔', coins: 52000 },
          ],
          status: 'waiting',
          currentTurn: 0,
          createdAt: Date.now(),
          gameState: null,
        },
        {
          id: 'room_rummy_public',
          code: 'RUMMY-PRO',
          name: 'Royal Rummy Lounge (2-Player)',
          gameType: 'rummy',
          stake: 1000,
          maxPlayers: 2,
          players: [
            { id: 'b5', name: 'Hamza Pro', avatar: '👑', coins: 45000 },
          ],
          status: 'waiting',
          currentTurn: 0,
          createdAt: Date.now(),
          gameState: null,
        },
      ]);
    }

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleJoinByCode = () => {
    if (!roomCodeInput.trim()) return;
    soundService.playChip();
    const code = roomCodeInput.trim().toUpperCase();
    const found = rooms.find((r) => r.code.toUpperCase() === code);
    if (found) {
      onSelectGameRoom(found.gameType, found.code);
    } else {
      // Default to the prefix type if unrecognized
      if (code.includes('LUDO')) onSelectGameRoom('ludo', code);
      else if (code.includes('TP') || code.includes('PATTI')) onSelectGameRoom('teen_patti', code);
      else if (code.includes('RUMMY')) onSelectGameRoom('rummy', code);
      else onSelectGameRoom('ludo', code);
    }
    onClose();
  };

  const handleCreateRoom = () => {
    soundService.playChip();
    socketService.createRoom(
      {
        name: roomName.trim() || `${gameType.toUpperCase()} Table`,
        gameType,
        stake,
        maxPlayers: gameType === 'ludo' ? maxPlayers : gameType === 'teen_patti' ? 5 : 2,
      },
      (res) => {
        if (res.success && res.room) {
          onSelectGameRoom(res.room.gameType, res.room.code);
        } else {
          onSelectGameRoom(gameType);
        }
        onClose();
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0e1424] border border-amber-500/30 rounded-3xl p-5 shadow-2xl space-y-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-amber-300 uppercase tracking-wide">
              Multiplayer Game Rooms
            </h3>
          </div>
          <button
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs font-black">
          <button
            onClick={() => {
              soundService.playClick();
              setTab('rooms');
            }}
            className={`py-2 rounded-xl transition cursor-pointer ${
              tab === 'rooms' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Tables ({rooms.length})
          </button>
          <button
            onClick={() => {
              soundService.playClick();
              setTab('join');
            }}
            className={`py-2 rounded-xl transition cursor-pointer ${
              tab === 'join' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Enter Code
          </button>
          <button
            onClick={() => {
              soundService.playClick();
              setTab('create');
            }}
            className={`py-2 rounded-xl transition cursor-pointer ${
              tab === 'create' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            + Create Table
          </button>
        </div>

        {/* Tab 1: Live Public Tables */}
        {tab === 'rooms' && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {rooms.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-lg border border-slate-700">
                    {r.gameType === 'ludo' ? '🎲' : r.gameType === 'teen_patti' ? '🂡' : '🃏'}
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block">{r.name}</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-mono text-amber-400">Code: {r.code}</span>
                      <span>&bull;</span>
                      <span className="font-mono">Stake: {r.stake} Coins</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {r.players.length}/{r.maxPlayers}
                  </span>
                  <button
                    onClick={() => {
                      soundService.playChip();
                      onSelectGameRoom(r.gameType, r.code);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer transition"
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Enter Room Code */}
        {tab === 'join' && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-400">
              Enter a 6-to-8 character room code shared by your friend to jump directly into their private table.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. LUDO-777 or TP-VIP"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-mono text-amber-300 uppercase tracking-widest focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleJoinByCode}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase rounded-xl shadow cursor-pointer transition"
              >
                Connect
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Create Custom Table */}
        {tab === 'create' && (
          <div className="space-y-3 py-1">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Select Game</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'ludo', label: '🎲 Ludo 15×15' },
                  { id: 'teen_patti', label: '🂡 Teen Patti' },
                  { id: 'rummy', label: '🃏 Rummy' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGameType(g.id as any)}
                    className={`py-2 px-1 text-center text-xs font-black rounded-xl border transition cursor-pointer ${
                      gameType === g.id
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Table Name</label>
              <input
                type="text"
                placeholder="e.g. VIP Champions Table"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Play-Money Coin Stake</label>
              <div className="grid grid-cols-4 gap-2">
                {[100, 500, 2000, 10000].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStake(s)}
                    className={`py-1.5 text-xs font-black rounded-xl border transition cursor-pointer ${
                      stake === s
                        ? 'border-amber-400 bg-amber-400 text-slate-950 shadow'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {s} Coins
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateRoom}
              className="w-full py-3 mt-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg transition active:scale-95 cursor-pointer"
            >
              Launch Table & Invite Players
            </button>
          </div>
        )}

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Free Practice Coins Only</span>
          </div>
          <span className="font-mono text-amber-400 font-bold">
            Balance: {userCoins.toLocaleString()} Coins
          </span>
        </div>
      </div>
    </div>
  );
};
