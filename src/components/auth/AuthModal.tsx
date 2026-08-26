import React, { useState } from 'react';
import { 
  Lock, 
  Phone, 
  User, 
  KeyRound, 
  Gift, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight, 
  LogIn, 
  UserPlus, 
  Crown,
  Users
} from 'lucide-react';
import { UserAccount } from '../../types';
import { soundService } from '../../services/sound';
import { loadAllUsers, saveUserData, saveAllUsers, getUrlReferralCode, defaultPresetUsers } from '../../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'switch'>('login');
  
  // Login Form State
  const [loginPhone, setLoginPhone] = useState('03127654321');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginError, setLoginError] = useState('');
  
  // Register Form State
  const [regPhone, setRegPhone] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regRefCode, setRegRefCode] = useState(getUrlReferralCode());
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    soundService.playClick();

    const allUsers = loadAllUsers();
    const cleanPhone = loginPhone.trim();
    
    // Find matching user by phone or username
    const found = allUsers.find(
      (u) => (u.phone === cleanPhone || u.username.toLowerCase() === cleanPhone.toLowerCase())
    );

    if (found) {
      if (found.isFrozen) {
        soundService.playBeep(250);
        setLoginError('This account is currently locked or frozen by administrator.');
        return;
      }
      if (found.password && found.password !== loginPassword && loginPassword !== 'password123') {
        soundService.playBeep(250);
        setLoginError('Invalid password. Default demo password is "password123".');
        return;
      }
      
      const updatedUser: UserAccount = {
        ...found,
        isLoggedIn: true,
      };
      saveUserData(updatedUser);
      soundService.playWin();
      onLoginSuccess(updatedUser);
      onClose();
    } else {
      // Auto-create for convenience if not found
      const newUser: UserAccount = {
        id: 'USR_' + Math.floor(100000 + Math.random() * 900000),
        phone: cleanPhone.startsWith('03') ? cleanPhone : '0300' + Math.floor(1000000 + Math.random() * 9000000),
        username: cleanPhone || 'Player_' + Math.floor(1000 + Math.random() * 9000),
        avatar: '👑',
        balance: 3000,
        unwithdrawnBalance: 3000,
        vipLevel: 1,
        vipExp: 500,
        referralCode: 'ref' + Math.floor(1000 + Math.random() * 9000),
        referredBy: '8khvdc',
        currency: 'PKR',
        registeredAt: new Date().toISOString(),
        isLoggedIn: true,
        role: 'user',
        password: loginPassword || 'password123',
        pin: '123456',
        dailyStreak: 1,
        totalDeposited: 3000,
        totalWithdrawn: 0,
        totalBetAmount: 0,
        totalWonAmount: 0,
      };
      saveUserData(newUser);
      soundService.playWin();
      onLoginSuccess(newUser);
      onClose();
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    soundService.playClick();

    if (!regPhone || regPhone.length < 10) {
      setRegError('Please enter a valid 11-digit mobile number (e.g. 03011234567).');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }

    const allUsers = loadAllUsers();
    const existing = allUsers.find((u) => u.phone === regPhone.trim());
    if (existing) {
      setRegError('An account with this phone number already exists! Please login instead.');
      return;
    }

    const newUser: UserAccount = {
      id: 'USR_' + Math.floor(100000 + Math.random() * 900000),
      phone: regPhone.trim(),
      username: regUsername.trim() || 'Lucky_' + regPhone.slice(-4),
      avatar: '🌟',
      balance: 1500, // 1500 PKR initial welcome bonus
      unwithdrawnBalance: 1500,
      vipLevel: 1,
      vipExp: 200,
      referralCode: 'r' + Math.floor(10000 + Math.random() * 90000),
      referredBy: regRefCode.trim() || '8khvdc',
      currency: 'PKR',
      registeredAt: new Date().toISOString(),
      isLoggedIn: true,
      role: 'user',
      password: regPassword,
      pin: regPin || '123456',
      dailyStreak: 1,
      totalDeposited: 1500,
      totalWithdrawn: 0,
      totalBetAmount: 0,
      totalWonAmount: 0,
    };

    saveUserData(newUser);
    setRegSuccess(true);
    soundService.playJackpot();
    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
    }, 1200);
  };

  const handleSwitchToPreset = (targetUser: UserAccount) => {
    soundService.playCoin();
    const active = { ...targetUser, isLoggedIn: true };
    saveUserData(active);
    onLoginSuccess(active);
    onClose();
  };

  const handleGuestLogin = () => {
    soundService.playCoin();
    const guest: UserAccount = {
      id: 'GUEST_' + Math.floor(100000 + Math.random() * 900000),
      phone: '0399' + Math.floor(1000000 + Math.random() * 9000000),
      username: 'Guest_VIP_' + Math.floor(1000 + Math.random() * 9000),
      avatar: '🎮',
      balance: 2500,
      unwithdrawnBalance: 2500,
      vipLevel: 1,
      vipExp: 100,
      referralCode: 'guest' + Math.floor(100 + Math.random() * 900),
      referredBy: '8khvdc',
      currency: 'PKR',
      registeredAt: new Date().toISOString(),
      isLoggedIn: true,
      role: 'user',
      pin: '000000',
      dailyStreak: 1,
      totalDeposited: 2500,
      totalWithdrawn: 0,
      totalBetAmount: 0,
      totalWonAmount: 0,
    };
    saveUserData(guest);
    onLoginSuccess(guest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
      <div 
        className="w-full max-w-md bg-[#0f1422] border-2 border-amber-500/40 rounded-3xl p-5 shadow-2xl relative text-white max-h-[92vh] overflow-y-auto"
        id="auth-modal-card"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            soundService.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border border-slate-700 transition cursor-pointer"
        >
          ✕
        </button>

        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 shadow-xl shadow-amber-500/20 border-2 border-amber-300 mb-2">
            <span className="font-black text-slate-950 text-2xl tracking-tighter italic">777</span>
          </div>
          <h3 className="text-xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
            777 Premier Portal
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Official Licensed Gaming Platform &bull; Pakistan & Global
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 bg-slate-900/90 p-1 rounded-2xl border border-amber-500/30 mb-5">
          <button
            onClick={() => {
              soundService.playClick();
              setTab('login');
            }}
            className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'login'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login</span>
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              setTab('register');
            }}
            className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'register'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              setTab('switch');
            }}
            className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'switch'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Switch / Test</span>
          </button>
        </div>

        {/* LOGIN TAB */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            {loginError && (
              <div className="bg-rose-500/20 border border-rose-500/50 rounded-xl p-2.5 text-xs text-rose-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Mobile Number or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="03012345678 or Player Name"
                  className="w-full bg-[#0a0d14] border border-slate-700 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[10px] text-amber-400/80">Demo: password123</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#0a0d14] border border-slate-700 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/20 text-sm tracking-wider flex items-center justify-center gap-2 transform active:scale-95 transition cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>LOG IN TO 777 PORTAL</span>
            </button>

            {/* Quick 1-Click Guest */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleGuestLogin}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold underline transition cursor-pointer"
              >
                🎮 Quick 1-Click Guest Play (+₨ 2,500 Demo)
              </button>
            </div>
          </form>
        )}

        {/* REGISTER TAB */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            {regError && (
              <div className="bg-rose-500/20 border border-rose-500/50 rounded-xl p-2.5 text-xs text-rose-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-2.5 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Account registered! +₨ 1,500 Welcome Bonus Credited.</span>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Mobile Number (JazzCash / EasyPaisa)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="03001234567"
                  className="w-full bg-[#0a0d14] border border-slate-700 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-sm font-semibold text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Nickname
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-amber-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="VIP Name"
                    className="w-full bg-[#0a0d14] border border-slate-700 focus:border-amber-400 rounded-xl pl-8 pr-2 py-2 text-xs font-semibold text-white placeholder-slate-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Withdrawal 6-Digit PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-amber-400">
                    <KeyRound className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="password"
                    maxLength={6}
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-[#0a0d14] border border-slate-700 focus:border-amber-400 rounded-xl pl-8 pr-2 py-2 text-xs font-semibold text-white placeholder-slate-500 outline-none transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Password (min 6 chars)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Set account password"
                  className="w-full bg-[#0a0d14] border border-slate-700 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-sm font-semibold text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Invitation / Agent Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400">
                  <Gift className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={regRefCode}
                  onChange={(e) => setRegRefCode(e.target.value)}
                  placeholder="8khvdc"
                  className="w-full bg-[#0a0d14] border border-amber-500/40 rounded-xl pl-9 pr-3 py-2 text-xs font-black text-amber-300 uppercase outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                  Bonus Active
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-emerald-500/20 text-sm tracking-wider flex items-center justify-center gap-2 transform active:scale-95 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>REGISTER & CLAIM +₨ 1,500</span>
            </button>
          </form>
        )}

        {/* SWITCH ACCOUNTS FOR TESTING */}
        {tab === 'switch' && (
          <div className="space-y-2.5">
            <p className="text-xs text-slate-300 font-medium">
              Instantly switch test roles to experience different balance tiers and admin powers:
            </p>

            {defaultPresetUsers.map((u) => {
              const isCurrent = currentUser.id === u.id;
              return (
                <div
                  key={u.id}
                  onClick={() => handleSwitchToPreset(u)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isCurrent
                      ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                      {u.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-100">{u.username}</span>
                        {u.role === 'admin' ? (
                          <span className="text-[10px] bg-red-500/30 text-red-300 border border-red-500/40 px-1.5 py-0.5 rounded font-black">
                            ADMIN
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-500/30 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold">
                            VIP {u.vipLevel}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-amber-400 font-black">
                        ₨ {u.balance.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <button className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-amber-300 border border-slate-700 hover:bg-amber-500 hover:text-slate-950 transition">
                    {isCurrent ? 'Active' : 'Select'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Security Assurance Badge */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-2 text-[10px] text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>256-Bit SSL Encrypted &bull; 100% Guaranteed Payouts &bull; Curacao Certified</span>
        </div>
      </div>
    </div>
  );
};
