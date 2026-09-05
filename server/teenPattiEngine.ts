import { GameRoom, RoomPlayer } from './types.js';

export interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: number; // 2..14 (14 is Ace)
  label: string;
  color: 'red' | 'black';
}

export interface TeenPattiGameState {
  pot: number;
  bootAmount: number;
  currentStake: number;
  activeSeatIndex: number;
  turnTimeout: number;
  stage: 'betting' | 'showdown' | 'ended';
  winnerId: string | null;
  winnerHandName: string;
  log: string[];
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
const LABELS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export class TeenPattiEngine {
  public static createDeck(): Card[] {
    const deck: Card[] = [];
    SUITS.forEach(suit => {
      LABELS.forEach((lbl, idx) => {
        deck.push({
          suit,
          value: idx + 2,
          label: lbl,
          color: suit === '♥' || suit === '♦' ? 'red' : 'black',
        });
      });
    });
    return deck.sort(() => Math.random() - 0.5);
  }

  public static evaluateHand(cards: Card[]): { rank: number; name: string; highVal: number } {
    if (!cards || cards.length < 3) return { rank: 0, name: 'High Card', highVal: 0 };
    const sorted = [...cards].sort((a, b) => b.value - a.value);
    const isFlush = cards.every(c => c.suit === cards[0].suit);
    const isTrio = cards[0].value === cards[1].value && cards[1].value === cards[2].value;
    const isSeq =
      (sorted[0].value - sorted[1].value === 1 && sorted[1].value - sorted[2].value === 1) ||
      (sorted[0].value === 14 && sorted[1].value === 3 && sorted[2].value === 2); // A-2-3

    if (isTrio) return { rank: 6, name: `Trail (${sorted[0].label})`, highVal: sorted[0].value };
    if (isFlush && isSeq) return { rank: 5, name: 'Pure Sequence', highVal: sorted[0].value };
    if (isSeq) return { rank: 4, name: 'Sequence', highVal: sorted[0].value };
    if (isFlush) return { rank: 3, name: 'Color (Flush)', highVal: sorted[0].value };
    if (sorted[0].value === sorted[1].value || sorted[1].value === sorted[2].value) {
      const pairVal = sorted[0].value === sorted[1].value ? sorted[0].value : sorted[1].value;
      const pairLbl = LABELS[pairVal - 2] || 'Pair';
      return { rank: 2, name: `Pair (${pairLbl})`, highVal: pairVal };
    }
    return { rank: 1, name: `High Card (${sorted[0].label})`, highVal: sorted[0].value };
  }

  public static initializeGame(room: GameRoom): TeenPattiGameState {
    const deck = this.createDeck();
    const boot = room.stake;

    room.players.forEach(p => {
      p.cards = [deck.pop()!, deck.pop()!, deck.pop()!];
      p.isPacked = false;
      p.isSeen = false;
      p.currentBet = boot;
      p.coins = Math.max(0, p.coins - boot);
    });

    const pot = boot * room.players.length;

    return {
      pot,
      bootAmount: boot,
      currentStake: boot,
      activeSeatIndex: 0,
      turnTimeout: 15,
      stage: 'betting',
      winnerId: null,
      winnerHandName: '',
      log: [`Round started! Boot of ${boot} coins collected into table pot (${pot} coins).`],
    };
  }

  public static advanceTurn(room: GameRoom, state: TeenPattiGameState) {
    const activePlayers = room.players.filter(p => !p.isPacked);
    if (activePlayers.length <= 1) {
      // Game over by default
      const winner = activePlayers[0] || room.players[0];
      state.stage = 'ended';
      state.winnerId = winner.id;
      const handEval = this.evaluateHand(winner.cards || []);
      state.winnerHandName = handEval.name;
      winner.coins += state.pot;
      state.log.push(`🎉 ${winner.name} won ${state.pot} coins! All other players packed.`);
      return;
    }

    let nextSeat = (state.activeSeatIndex + 1) % room.players.length;
    while (room.players[nextSeat].isPacked) {
      nextSeat = (nextSeat + 1) % room.players.length;
    }
    state.activeSeatIndex = nextSeat;
  }

  public static placeBet(
    room: GameRoom,
    state: TeenPattiGameState,
    playerId: string,
    multiplier: number = 1
  ): boolean {
    const player = room.players.find(p => p.id === playerId);
    if (!player || player.isPacked || room.players[state.activeSeatIndex]?.id !== playerId) {
      return false;
    }

    const base = player.isSeen ? state.currentStake * 2 : state.currentStake;
    const betAmount = base * multiplier;

    player.coins = Math.max(0, player.coins - betAmount);
    player.currentBet = (player.currentBet || 0) + betAmount;
    state.pot += betAmount;

    state.log.push(
      `${player.name} played ${player.isSeen ? 'CHAAL' : 'BLIND'} of ${betAmount} coins.`
    );

    this.advanceTurn(room, state);
    return true;
  }

  public static packPlayer(room: GameRoom, state: TeenPattiGameState, playerId: string): boolean {
    const player = room.players.find(p => p.id === playerId);
    if (!player || player.isPacked) return false;

    player.isPacked = true;
    state.log.push(`${player.name} packed (folded).`);
    this.advanceTurn(room, state);
    return true;
  }

  public static showdown(room: GameRoom, state: TeenPattiGameState): boolean {
    const contenders = room.players.filter(p => !p.isPacked);
    if (contenders.length < 2) return false;

    let bestPlayer = contenders[0];
    let bestEval = this.evaluateHand(bestPlayer.cards || []);

    for (let i = 1; i < contenders.length; i++) {
      const pEval = this.evaluateHand(contenders[i].cards || []);
      if (
        pEval.rank > bestEval.rank ||
        (pEval.rank === bestEval.rank && pEval.highVal > bestEval.highVal)
      ) {
        bestPlayer = contenders[i];
        bestEval = pEval;
      }
    }

    state.stage = 'ended';
    state.winnerId = bestPlayer.id;
    state.winnerHandName = bestEval.name;
    bestPlayer.coins += state.pot;
    state.log.push(
      `🏆 SHOWDOWN: ${bestPlayer.name} won the pot of ${state.pot} coins with ${bestEval.name}!`
    );

    return true;
  }
}
