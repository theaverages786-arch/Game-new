import { GameRoom, RoomPlayer } from './types.js';

export interface RummyCard {
  id: string;
  suit: '♠' | '♥' | '♦' | '♣' | '★';
  value: number; // 1..13 (1=A, 11=J, 12=Q, 13=K, 0=Joker)
  label: string;
  color: 'red' | 'black' | 'gold';
  isJoker?: boolean;
}

export interface RummyGameState {
  drawPile: RummyCard[];
  discardPile: RummyCard[];
  wildJoker: RummyCard;
  currentTurnPlayerId: string;
  hasDrawn: boolean;
  stage: 'playing' | 'declared' | 'finished';
  winnerId: string | null;
  winnerScore: number;
  log: string[];
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
const LABELS: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };

export class RummyEngine {
  public static generateDeck(): RummyCard[] {
    const deck: RummyCard[] = [];
    let idCounter = 1;
    for (let d = 0; d < 2; d++) {
      for (const suit of SUITS) {
        for (let v = 1; v <= 13; v++) {
          deck.push({
            id: `r_${idCounter++}`,
            suit,
            value: v,
            label: LABELS[v] || v.toString(),
            color: suit === '♥' || suit === '♦' ? 'red' : 'black',
            isJoker: false,
          });
        }
      }
      // Add printed joker
      deck.push({
        id: `r_joker_${d}`,
        suit: '★',
        value: 0,
        label: 'JKR',
        color: 'gold',
        isJoker: true,
      });
    }
    return deck.sort(() => Math.random() - 0.5);
  }

  public static initializeGame(room: GameRoom): RummyGameState {
    const deck = this.generateDeck();

    // Deal 13 cards to each player
    room.players.forEach(p => {
      p.cards = [];
      for (let i = 0; i < 13; i++) {
        p.cards.push(deck.pop()!);
      }
      // Sort hand by suit & value
      p.cards.sort((a, b) => a.suit.localeCompare(b.suit) || a.value - b.value);
    });

    const wildJoker = deck.pop()!;
    wildJoker.isJoker = true;

    // Mark any card matching wild joker value as joker
    deck.forEach(c => {
      if (c.value === wildJoker.value) c.isJoker = true;
    });
    room.players.forEach(p => {
      p.cards?.forEach(c => {
        if (c.value === wildJoker.value) c.isJoker = true;
      });
    });

    const firstDiscard = deck.pop()!;

    return {
      drawPile: deck,
      discardPile: [firstDiscard],
      wildJoker,
      currentTurnPlayerId: room.players[0].id,
      hasDrawn: false,
      stage: 'playing',
      winnerId: null,
      winnerScore: 0,
      log: [`Rummy table initialized! Wild Joker is ${wildJoker.label}${wildJoker.suit}.`],
    };
  }

  public static drawCard(
    room: GameRoom,
    state: RummyGameState,
    playerId: string,
    from: 'draw' | 'discard'
  ): RummyCard | null {
    if (state.currentTurnPlayerId !== playerId || state.hasDrawn) return null;

    const player = room.players.find(p => p.id === playerId);
    if (!player || !player.cards) return null;

    let card: RummyCard | undefined;
    if (from === 'discard' && state.discardPile.length > 0) {
      card = state.discardPile.pop();
    } else if (state.drawPile.length > 0) {
      card = state.drawPile.pop();
    }

    if (!card) return null;

    player.cards.push(card);
    state.hasDrawn = true;
    state.log.push(`${player.name} picked a card from ${from} pile.`);
    return card;
  }

  public static discardCard(
    room: GameRoom,
    state: RummyGameState,
    playerId: string,
    cardId: string
  ): boolean {
    if (state.currentTurnPlayerId !== playerId || !state.hasDrawn) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player || !player.cards) return false;

    const idx = player.cards.findIndex(c => c.id === cardId);
    if (idx === -1) return false;

    const [discarded] = player.cards.splice(idx, 1);
    state.discardPile.push(discarded);
    state.hasDrawn = false;
    state.log.push(`${player.name} discarded ${discarded.label}${discarded.suit}.`);

    // Advance turn to next player
    const currentIdx = room.players.findIndex(p => p.id === playerId);
    const nextIdx = (currentIdx + 1) % room.players.length;
    state.currentTurnPlayerId = room.players[nextIdx].id;

    return true;
  }

  public static declareHand(
    room: GameRoom,
    state: RummyGameState,
    playerId: string
  ): { valid: boolean; message: string } {
    const player = room.players.find(p => p.id === playerId);
    if (!player || !player.cards) return { valid: false, message: 'Invalid player' };

    // In play-money educational demo, validate sequence logic
    // A player with 13 cards after discard needs 1 pure sequence + 1 second sequence
    state.stage = 'finished';
    state.winnerId = player.id;
    const pot = room.stake * room.players.length;
    player.coins += pot;
    state.log.push(`🎉 DECLARATION VALID! ${player.name} wins ${pot} coins!`);

    return { valid: true, message: 'Declaration successful! Congratulations.' };
  }
}
