import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX, Sparkles, Trophy, Crosshair, Zap, Play } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';
import { shouldPlayerWin, playOutcomeCelebration } from '../../services/gameEngine';

interface FishingGameProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

interface Fish {
  id: number;
  type: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  hp: number;
  maxHp: number;
  multiplier: number;
  size: number;
}

const FISH_TYPES = [
  { type: 'clown', name: 'Nemo Clownfish', icon: '🐠', hp: 2, multiplier: 2, size: 36 },
  { type: 'blowfish', name: 'Pufferfish', icon: '🐡', hp: 4, multiplier: 5, size: 42 },
  { type: 'squid', name: 'Deep Squid', icon: '🦑', hp: 6, multiplier: 8, size: 48 },
  { type: 'turtle', name: 'Golden Sea Turtle', icon: '🐢', hp: 10, multiplier: 15, size: 54 },
  { type: 'shark', name: 'Hammerhead Shark', icon: '🦈', hp: 16, multiplier: 30, size: 65 },
  { type: 'dragon', name: 'Golden Dragon Boss', icon: '🐉', hp: 30, multiplier: 100, size: 85 },
];

export const FishingGame: React.FC<FishingGameProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bulletPower, setBulletPower] = useState(10);
  const [fishes, setFishes] = useState<Fish[]>([]);
  const [coinsWon, setCoinsWon] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  const [autoShoot, setAutoShoot] = useState(false);
  const [cannonAngle, setCannonAngle] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const nextFishId = useRef(1);
  const nextCoinId = useRef(1);

  // Bullet power levels
  const powers = [5, 10, 25, 50, 100, 250, 500];

  // Spawn Fishes
  useEffect(() => {
    const initialFishes: Fish[] = [];
    for (let i = 0; i < 8; i++) {
      const template = FISH_TYPES[Math.floor(Math.random() * (i > 5 ? FISH_TYPES.length : 3))];
      initialFishes.push({
        id: nextFishId.current++,
        type: template.type,
        name: template.name,
        icon: template.icon,
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 10,
        speedX: (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.3),
        speedY: (Math.random() - 0.5) * 0.2,
        hp: template.hp,
        maxHp: template.hp,
        multiplier: template.multiplier,
        size: template.size,
      });
    }
    setFishes(initialFishes);

    const spawnInterval = setInterval(() => {
      setFishes((prev) => {
        if (prev.length >= 12) return prev;
        const template = FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)];
        const fromLeft = Math.random() > 0.5;
        return [
          ...prev,
          {
            id: nextFishId.current++,
            type: template.type,
            name: template.name,
            icon: template.icon,
            x: fromLeft ? -5 : 105,
            y: Math.random() * 65 + 10,
            speedX: (fromLeft ? 1 : -1) * (0.2 + Math.random() * 0.3),
            speedY: (Math.random() - 0.5) * 0.2,
            hp: template.hp,
            maxHp: template.hp,
            multiplier: template.multiplier,
            size: template.size,
          },
        ];
      });
    }, 2500);

    return () => clearInterval(spawnInterval);
  }, []);

  // Fish Movement Loop
  useEffect(() => {
    const moveTimer = setInterval(() => {
      setFishes((prev) =>
        prev
          .map((f) => {
            let nextX = f.x + f.speedX;
            let nextY = f.y + f.speedY;
            if (nextY < 5 || nextY > 75) f.speedY = -f.speedY;
            return {
              ...f,
              x: nextX,
              y: nextY,
            };
          })
          .filter((f) => f.x > -15 && f.x < 115)
      );
    }, 50);

    return () => clearInterval(moveTimer);
  }, []);

  // Shoot Bullet at target
  const handleShootAt = (clientX: number, clientY: number, targetFishId?: number) => {
    if (userBalance < bulletPower) {
      alert('Insufficient balance for cannon shot!');
      setAutoShoot(false);
      return;
    }

    soundService.playCannonShoot();
    onUpdateBalance(userBalance - bulletPower);

    // Calculate cannon angle
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const cannonX = rect.left + rect.width / 2;
      const cannonY = rect.bottom - 40;
      const angle = (Math.atan2(clientY - cannonY, clientX - cannonX) * 180) / Math.PI + 90;
      setCannonAngle(angle);
    }

    // Determine fish hit
    setFishes((prev) => {
      let hitFish = prev.find((f) => f.id === targetFishId);
      if (!hitFish && prev.length > 0) {
        hitFish = prev[Math.floor(Math.random() * prev.length)];
      }

      if (!hitFish) return prev;

      const newHp = hitFish.hp - 1;

      // Check if fish dies governed by game engine & RTP
      const isLucky = shouldPlayerWin('fishing_ocean_king', adminSettings, 0.35);
      const isDead = newHp <= 0 || (isLucky && Math.random() < 0.4);

      if (isDead) {
        const reward = Math.round(bulletPower * hitFish.multiplier);
        playOutcomeCelebration(reward, bulletPower, hitFish.multiplier >= 30);
        onUpdateBalance(userBalance - bulletPower + reward);
        onRecordBet('fishing_ocean_king', 'Fish Hunter Ocean King', bulletPower, reward, hitFish.multiplier);

        // Add floating coin reward
        setCoinsWon((c) => [
          ...c,
          {
            id: nextCoinId.current++,
            text: `+₨ ${reward.toLocaleString()} (${hitFish.name})`,
            x: hitFish.x,
            y: hitFish.y,
          },
        ]);

        return prev.filter((f) => f.id !== hitFish!.id);
      } else {
        return prev.map((f) => (f.id === hitFish!.id ? { ...f, hp: newHp } : f));
      }
    });
  };

  // Auto Shoot interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoShoot) {
      timer = setInterval(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          handleShootAt(rect.left + rect.width * (0.3 + Math.random() * 0.4), rect.top + rect.height * 0.3);
        }
      }, 350);
    }
    return () => clearInterval(timer);
  }, [autoShoot, userBalance, bulletPower]);

  return (
    <div className="max-w-4xl mx-auto space-y-3 p-2 sm:p-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#0e1424] border border-amber-500/30 rounded-2xl p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundService.playClick();
              onBack();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-black text-amber-300 uppercase">FISH HUNTER 777</h2>
            <span className="text-[11px] text-slate-400">Ocean King Boss &bull; Tap / Click Fish to Shoot</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm font-black text-amber-300">₨ {userBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Aquarium Game Canvas Screen */}
      <div
        ref={containerRef}
        onClick={(e) => handleShootAt(e.clientX, e.clientY)}
        className="relative h-96 sm:h-[450px] rounded-3xl border-4 border-cyan-500/40 bg-gradient-to-b from-[#031d3d] via-[#021329] to-[#010914] overflow-hidden shadow-2xl cursor-crosshair select-none"
      >
        {/* Deep ocean light ripples */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400 via-transparent to-transparent pointer-events-none"></div>

        {/* Swimming Fishes */}
        {fishes.map((f) => (
          <div
            key={f.id}
            onClick={(e) => {
              e.stopPropagation();
              handleShootAt(e.clientX, e.clientY, f.id);
            }}
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              transform: `scaleX(${f.speedX > 0 ? -1 : 1})`,
            }}
            className="absolute transition-transform duration-75 cursor-pointer group flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
          >
            <span
              style={{ fontSize: `${f.size}px` }}
              className="drop-shadow-2xl filter group-hover:brightness-125 transition"
            >
              {f.icon}
            </span>
            {/* HP Bar */}
            <div className="w-10 bg-slate-900/80 rounded-full h-1 mt-1 border border-white/20 overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all"
                style={{ width: `${(f.hp / f.maxHp) * 100}%` }}
              ></div>
            </div>
            <span className="text-[8px] font-black text-yellow-300 bg-black/60 px-1 rounded shadow">
              {f.multiplier}x
            </span>
          </div>
        ))}

        {/* Floating Coin Rewards */}
        {coinsWon.slice(-4).map((coin) => (
          <div
            key={coin.id}
            style={{ left: `${coin.x}%`, top: `${coin.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-xs sm:text-sm font-black text-amber-300 bg-black/80 px-2 py-0.5 rounded-full border border-amber-400 animate-bounce pointer-events-none shadow-xl"
          >
            {coin.text}
          </div>
        ))}

        {/* Bottom Cannon */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
          <div
            style={{ transform: `rotate(${cannonAngle}deg)` }}
            className="w-8 h-12 bg-gradient-to-t from-cyan-600 to-amber-400 rounded-t-xl border-2 border-white shadow-2xl transition-transform duration-100"
          ></div>
          <div className="w-16 h-8 bg-slate-900 border-2 border-amber-400 rounded-full flex items-center justify-center text-[10px] font-black text-amber-300 -mt-2">
            ₨ {bulletPower}
          </div>
        </div>
      </div>

      {/* Cannon Controls */}
      <div className="bg-[#0e1424] border border-amber-500/30 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase">Cannon Power:</span>
          <div className="flex gap-1.5">
            {powers.map((p) => (
              <button
                key={p}
                onClick={() => {
                  soundService.playChip();
                  setBulletPower(p);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  bulletPower === p
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md scale-105'
                    : 'bg-slate-900 border border-slate-800 text-slate-400'
                }`}
              >
                ₨ {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundService.playClick();
              setAutoShoot(!autoShoot);
            }}
            className={`px-6 py-3.5 rounded-2xl font-black text-xs transition uppercase cursor-pointer ${
              autoShoot
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                : 'bg-cyan-700 hover:bg-cyan-600 text-white'
            }`}
          >
            {autoShoot ? 'PAUSE AUTO' : '⚡ AUTO CANNON'}
          </button>

          <div className="flex-1 text-center text-xs text-slate-400">
            💡 Tap or Click anywhere in the ocean to aim & fire cannon!
          </div>
        </div>
      </div>
    </div>
  );
};
