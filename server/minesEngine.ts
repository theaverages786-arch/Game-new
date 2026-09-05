import crypto from 'crypto';

export interface MinesSession {
  id: string;
  betAmount: number;
  mineCount: number;
  gridSize: number;
  mines: number[]; // Index array of mines 0..24
  revealedTiles: number[];
  serverSeed: string; // Secret until round ends
  serverSeedHash: string; // SHA-256 revealed upfront
  clientSeed: string;
  nonce: number;
  status: 'active' | 'cashed_out' | 'busted';
  currentMultiplier: number;
  nextMultiplier: number;
  gemsFound: number;
  totalGems: number;
  payout: number;
  createdAt: number;
  multiplierLadder: number[];
}

export class MinesEngine {
  private sessions: Map<string, MinesSession> = new Map();
  private defaultRtp: number = 0.97; // 97% Return to Player (3% House Edge)

  constructor() {
    // Cleanup expired sessions every 10 minutes
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 10 * 60 * 1000);
  }

  /**
   * Generates SHA-256 hash of a seed string
   */
  public sha256(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Combinatorial Multiplier Formula for Mines
   * P(k safe steps) = product_{i=0..k-1} (25 - mines - i) / (25 - i)
   * Multiplier = (RTP / P)
   */
  public calculateMultiplier(mineCount: number, gems: number, gridSize: number = 25, rtp: number = this.defaultRtp): number {
    if (gems <= 0) return 1.0;
    const safeTiles = gridSize - mineCount;
    if (gems > safeTiles) gems = safeTiles;

    let probability = 1.0;
    for (let i = 0; i < gems; i++) {
      probability *= (safeTiles - i) / (gridSize - i);
    }

    const rawMultiplier = (1 / probability) * rtp;
    // Format to 2 decimal places with a floor for mathematical safety
    const rounded = Math.floor(rawMultiplier * 100) / 100;
    return Math.max(1.02, rounded);
  }

  /**
   * Generates precalculated step ladder for the selected mine count
   */
  public getMultiplierLadder(mineCount: number, gridSize: number = 25, rtp: number = this.defaultRtp): number[] {
    const totalGems = gridSize - mineCount;
    const ladder: number[] = [];
    for (let g = 1; g <= totalGems; g++) {
      ladder.push(this.calculateMultiplier(mineCount, g, gridSize, rtp));
    }
    return ladder;
  }

  /**
   * Cryptographic Provably Fair deterministic grid generator
   * Uses HMAC-SHA256 of serverSeed with clientSeed:nonce to seed Fisher-Yates shuffle
   */
  public generateMinesPositions(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    mineCount: number,
    gridSize: number = 25
  ): number[] {
    const hmac = crypto.createHmac('sha256', serverSeed);
    hmac.update(`${clientSeed}:${nonce}`);
    const hash = hmac.digest('hex');

    // Create array of tiles [0..24]
    const indices: number[] = Array.from({ length: gridSize }, (_, i) => i);

    // Deterministic shuffle using slices of 4 bytes (32 bits) from hash
    let hashIndex = 0;
    for (let i = indices.length - 1; i > 0; i--) {
      // Wrap hash or extend if needed
      if (hashIndex + 8 > hash.length) {
        const subHmac = crypto.createHmac('sha256', serverSeed);
        subHmac.update(`${clientSeed}:${nonce}:${hashIndex}`);
        const extraHash = subHmac.digest('hex');
        hashIndex = 0;
      }

      const hexChunk = hash.substring(hashIndex, hashIndex + 8);
      hashIndex += 8;
      const randInt = parseInt(hexChunk, 16);
      const j = randInt % (i + 1);

      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // First `mineCount` indices are the bombs
    const mines = indices.slice(0, mineCount).sort((a, b) => a - b);
    return mines;
  }

  /**
   * Start a new authoritative game round
   */
  public startSession(
    betAmount: number,
    mineCount: number,
    customClientSeed?: string,
    customNonce?: number
  ): {
    session: Omit<MinesSession, 'serverSeed' | 'mines'>;
    serverSeedHash: string;
  } {
    if (betAmount <= 0) {
      throw new Error('Bet amount must be greater than 0');
    }
    if (mineCount < 1 || mineCount > 24) {
      throw new Error('Number of mines must be between 1 and 24');
    }

    const sessionId = 'mn_' + crypto.randomBytes(16).toString('hex');
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const serverSeedHash = this.sha256(serverSeed);
    const clientSeed = customClientSeed || crypto.randomBytes(12).toString('hex');
    const nonce = customNonce !== undefined ? customNonce : 1;
    const gridSize = 25;

    const mines = this.generateMinesPositions(serverSeed, clientSeed, nonce, mineCount, gridSize);
    const ladder = this.getMultiplierLadder(mineCount, gridSize);

    const session: MinesSession = {
      id: sessionId,
      betAmount,
      mineCount,
      gridSize,
      mines,
      revealedTiles: [],
      serverSeed,
      serverSeedHash,
      clientSeed,
      nonce,
      status: 'active',
      currentMultiplier: 1.0,
      nextMultiplier: ladder[0] || 1.04,
      gemsFound: 0,
      totalGems: gridSize - mineCount,
      payout: 0,
      createdAt: Date.now(),
      multiplierLadder: ladder,
    };

    this.sessions.set(sessionId, session);

    // Return sanitized session (without secret serverSeed or mines)
    const { serverSeed: _, mines: __, ...publicSession } = session;
    return {
      session: publicSession,
      serverSeedHash,
    };
  }

  /**
   * Reveal a tile on the 5x5 grid
   */
  public revealTile(
    sessionId: string,
    tileIndex: number
  ): {
    isMine: boolean;
    tileIndex: number;
    gemsFound: number;
    currentMultiplier: number;
    nextMultiplier: number | null;
    payout: number;
    status: 'active' | 'cashed_out' | 'busted';
    revealedTiles: number[];
    mines?: number[]; // Revealed when busted or completed
    serverSeed?: string; // Revealed when round terminates
  } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Game session not found or has expired');
    }
    if (session.status !== 'active') {
      throw new Error(`Game is already finished (${session.status})`);
    }
    if (tileIndex < 0 || tileIndex >= session.gridSize) {
      throw new Error('Invalid tile index');
    }
    if (session.revealedTiles.includes(tileIndex)) {
      throw new Error('Tile already revealed');
    }

    const isMine = session.mines.includes(tileIndex);

    if (isMine) {
      // Player hit a bomb!
      session.status = 'busted';
      session.payout = 0;
      session.currentMultiplier = 0;
      session.revealedTiles.push(tileIndex);

      return {
        isMine: true,
        tileIndex,
        gemsFound: session.gemsFound,
        currentMultiplier: 0,
        nextMultiplier: null,
        payout: 0,
        status: 'busted',
        revealedTiles: session.revealedTiles,
        mines: session.mines,
        serverSeed: session.serverSeed,
      };
    }

    // Safe tile (Diamond / Gem)
    session.revealedTiles.push(tileIndex);
    session.gemsFound += 1;
    session.currentMultiplier = this.calculateMultiplier(session.mineCount, session.gemsFound, session.gridSize);
    session.payout = Math.floor(session.betAmount * session.currentMultiplier);

    const isCompleted = session.gemsFound === session.totalGems;

    if (isCompleted) {
      // Auto cashout upon clearing all safe tiles
      session.status = 'cashed_out';
      return {
        isMine: false,
        tileIndex,
        gemsFound: session.gemsFound,
        currentMultiplier: session.currentMultiplier,
        nextMultiplier: null,
        payout: session.payout,
        status: 'cashed_out',
        revealedTiles: session.revealedTiles,
        mines: session.mines,
        serverSeed: session.serverSeed,
      };
    }

    // Next step multiplier
    session.nextMultiplier = this.calculateMultiplier(session.mineCount, session.gemsFound + 1, session.gridSize);

    return {
      isMine: false,
      tileIndex,
      gemsFound: session.gemsFound,
      currentMultiplier: session.currentMultiplier,
      nextMultiplier: session.nextMultiplier,
      payout: session.payout,
      status: 'active',
      revealedTiles: session.revealedTiles,
    };
  }

  /**
   * Cash out current active session
   */
  public cashOut(sessionId: string): {
    status: 'cashed_out';
    payout: number;
    multiplier: number;
    gemsFound: number;
    mines: number[];
    serverSeed: string;
    serverSeedHash: string;
    clientSeed: string;
    nonce: number;
  } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Game session not found or has expired');
    }
    if (session.status !== 'active') {
      throw new Error(`Cannot cash out, game is ${session.status}`);
    }
    if (session.gemsFound === 0) {
      throw new Error('Must reveal at least one diamond before cashing out');
    }

    session.status = 'cashed_out';
    session.payout = Math.floor(session.betAmount * session.currentMultiplier);

    return {
      status: 'cashed_out',
      payout: session.payout,
      multiplier: session.currentMultiplier,
      gemsFound: session.gemsFound,
      mines: session.mines,
      serverSeed: session.serverSeed,
      serverSeedHash: session.serverSeedHash,
      clientSeed: session.clientSeed,
      nonce: session.nonce,
    };
  }

  /**
   * Independent Provably Fair Verification
   * Players can verify past rounds with serverSeed, clientSeed, nonce, and mineCount
   */
  public verifyGame(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    mineCount: number,
    gridSize: number = 25
  ): {
    serverSeedHash: string;
    mines: number[];
    multiplierLadder: number[];
  } {
    const serverSeedHash = this.sha256(serverSeed);
    const mines = this.generateMinesPositions(serverSeed, clientSeed, nonce, mineCount, gridSize);
    const multiplierLadder = this.getMultiplierLadder(mineCount, gridSize);

    return {
      serverSeedHash,
      mines,
      multiplierLadder,
    };
  }

  /**
   * Get public details of an active session
   */
  public getSession(sessionId: string): Omit<MinesSession, 'serverSeed' | 'mines'> | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    const { serverSeed: _, mines: __, ...publicSession } = session;
    return publicSession;
  }

  private cleanupExpiredSessions() {
    const cutoff = Date.now() - 30 * 60 * 1000; // 30 mins
    for (const [id, session] of this.sessions.entries()) {
      if (session.createdAt < cutoff) {
        this.sessions.delete(id);
      }
    }
  }
}

export const minesEngine = new MinesEngine();
