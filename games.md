# Casino & Betting Platform - Master Game Specifications (games.md)

## 0. Architecture & Tech Stack Guidelines
- **Frontend:** Next.js, React, Tailwind CSS (for UI/UX and responsive layouts), Framer Motion (for animations).
- **Backend/Logic:** Laravel or Node.js (for RNG logic, wallet deduction, and state management).
- **Real-time:** WebSockets (Socket.io/Pusher) for multiplayer sync and crash multipliers.
- **RNG:** All games MUST use a cryptographic Provably Fair algorithm for outcomes.

## 1. Card & Multiplayer Games
**Core Logic:** Standard 52-card deck arrays. Shuffle logic using Fisher-Yates. Betting phases with timers (e.g., 15 seconds to place bets).
- **Teen Patti (Classic & 20-20):** 3-card hand rankings (Trail/Trio > Straight Flush > Sequence > Color > Pair > High Card). UI: Virtual table, chip selection, blind/chaal buttons.
- **Dragon vs Tiger / Red vs Black:** 2 main betting zones. 1 card drawn for each. Highest card wins. Tie pays 8:1. UI: Split screen animation for card reveals.
- **Andar Bahar:** Joker card drawn first. Cards dealt alternately to Andar and Bahar until a matching rank appears. UI: Central slot for Joker, left/right stacks for A/B.
- **Baccarat:** Player vs Banker. Closest to 9 wins. Face cards = 0. Third card draw rules apply. 
- **Texas Hold'em Poker & Rummy:** Multiplayer lobbies, turn-based state machines, pot management, and complex hand-evaluation algorithms.
- **Blackjack:** Player vs Dealer. Target 21. Hit, Stand, Double Down, Split actions. Dealer must draw to 16, stand on 17.
- **Ludo (Quick & Classic):** 4-player grid logic, dice roll state, token movement arrays, and safe zones. Quick mode has a 10-minute timer.

## 2. Slot Games (RNG & Payline Logic)
**Core Logic:** Grid-based 2D arrays. RNG selects symbols based on weighted probabilities (RTP typically 92-96%). 
- **3x3 Grid Classic Slots:** 777 Classic, Crazy 777, Money Coming, Piggy Bank. 1 to 5 paylines. Simple multiplier mechanics. UI: Spinning reel animations with blur effects.
- **5x3 / Multi-way Video Slots:** Fortune Gems (1 & 2), Aztec Gems/Gold, Roma Slots, Golden Empire, Super Ace, Boxing King, Fruit Party, Fortuner King.
- **Mechanics:** 
  - *Wilds & Scatters:* Substitute symbols and trigger Free Spins.
  - *Cascading Reels:* Winning symbols explode, new ones drop (Super Ace, Fruit Party).
  - *Multipliers:* Progressive multipliers for consecutive wins.

## 3. Table, Roulette & Dice Games
- **Roulette (European Classic):** 37 numbers (0-36). Array of betting zones (Straight up 35:1, Dozens 2:1, Colors/Evens 1:1). UI: Spinning wheel animation synced with RNG final angle.
- **Zoo / Car Roulette:** Instead of numbers, the wheel has animal or car brand icons with different multiplier weights (e.g., Ferrari 20x, BMW 5x).
- **Sic Bo & Dice Roll / Master:** 3 Dice rolling logic. Bets on total sums, triples, doubles, or specific numbers.
- **7 Up Down:** 2 Dice. Bet on Sum < 7, Sum = 7 (pays higher), Sum > 7. 

## 4. Crash, Arcade & Skill Games
**Core Logic:** Multiplier increases from 1.00x upwards. Crash point determined by server seed before round starts: `Crash = 0.99 * e / (2^52 - h)`.
- **Crash / Aviator:** Line graph or plane taking off. Users must "Cash Out" before the crash. UI: Canvas/SVG live graph, dual betting panels, live player list.
- **Mines / Mine Logic:** 5x5 Grid (25 tiles). User selects number of mines (1-24). Each safe click increases the multiplier. Clicking a mine resets bet to 0. 
- **Plinko:** Pyramid of pegs. User drops a ball. RNG determines the path (Left/Right decisions). Pockets at the bottom represent multipliers (edges are high, center is low).
- **Chicken Road (1 & 2):** Grid traversal. User steps across rows. Each step has a safe path and a hidden hazard.
- **Fishing (Fish Hunter / Mega Fishing):** Canvas-based 2D shooter. Fish have HP. Bullets cost money. RNG determines if a hit registers a kill based on bullet cost vs fish multiplier.
- **Hi-Lo:** One card shown. User guesses if the next card will be Higher, Lower, or Equal. Multipliers scale based on probability.
- **Lucky Spin / Prize Wheel:** segmented circle with varying prizes. RNG picks the segment. 

## 5. Prediction & Real Money Systems
- **Color Prediction:** 3 minutes countdown. Bet on Red, Green, Violet, or Numbers 0-9. RNG selects winning color. UI: Countdown timer, history trend charts.
- **Sports / Cricket Match Prediction:** API integration for live odds or manual admin odds input. Binary outcomes (Team A vs Team B).
- **Wallet & Real Money Core:** Centralized transaction ledger. Every game action triggers `deductBalance()` on play and `addBalance()` on win. Must include rollback logic for network drops.
