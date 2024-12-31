import { Card, Color, Deck, shuffleDeck, createInitialDeck } from './deck';
import { Shuffler, standardShuffler } from '../utils/randomUtils';


export type Action =
  | { type: 'PLAY'; player: number; cardIndex: number; chosenColor?: Color }
  | { type: 'DRAW'; player: number }
  | { type: 'SAY_UNO'; player: number }
  | { type: 'CATCH_UNO_FAILURE'; accuser: number; accused: number };

export type Hand = Readonly<{
  hands: ReadonlyArray<ReadonlyArray<Card>>;
  drawPile: Deck;
  discardPile: Deck;
  currentColor: Color | undefined;
  playerInTurn: number | undefined;
  direction: 1 | -1;
  unoCalled: boolean[];
}>;
/**
 * HandProps type for hand creation.
 */
export type HandProps = {
    players: readonly string[];
    dealer: number;
    shuffler?: Shuffler<Card>;
    cardsPerPlayer?: number;
  };

/**
 * Creates a new hand for a game.
 * @param players The players in the game.
 * @param dealer The dealer index.
 * @param shuffler The shuffler function to use for the deck.
 * @param cardsPerPlayer The number of cards each player starts with.
 */
export const createHand = ({
    players,
    dealer,
    shuffler = standardShuffler,
    cardsPerPlayer = 7,
  }: HandProps): Hand => {
    const shuffledDeck = shuffler(createInitialDeck());
    const hands = players.map((_, i) =>
      shuffledDeck.slice(i * cardsPerPlayer, (i + 1) * cardsPerPlayer)
    );
    const drawPile = shuffledDeck.slice(players.length * cardsPerPlayer + 1);
    const discardPile = [shuffledDeck[players.length * cardsPerPlayer]];
  
    return {
      hands,
      drawPile,
      discardPile,
      currentColor: discardPile[0].color,
      playerInTurn: (dealer + 1) % players.length, // First player is next to the dealer
      direction: 1,
      unoCalled: players.map(() => false),
    };
  };

// Utility: Get the top card of the discard pile
export const topOfDiscard = (hand: Hand): Card => {
  return hand.discardPile[hand.discardPile.length - 1];
};

// Utility: Determine if a card is playable
export const canPlay = (cardIndex: number, hand: Hand): boolean => {
  const currentPlayer = hand.playerInTurn;
  if (currentPlayer === undefined) return false;

  const card = hand.hands[currentPlayer][cardIndex];
  const topCard = topOfDiscard(hand);

  return (
    card.type === 'WILD' ||
    card.type === 'WILD DRAW' ||
    card.color === hand.currentColor ||
    (card.type === 'NUMBERED' && card.number === topCard.number)
  );
};

// Apply a play action
export const play = (
  cardIndex: number,
  chosenColor: Color | undefined,
  hand: Hand
): Hand => {
  const currentPlayer = hand.playerInTurn;
  if (currentPlayer === undefined) throw new Error('Invalid turn.');
  if (!canPlay(cardIndex, hand)) throw new Error('Illegal play.');

  const card = hand.hands[currentPlayer][cardIndex];
  const newHands = hand.hands.map((h, idx) =>
    idx === currentPlayer ? h.filter((_, idx) => idx !== cardIndex) : h
  );

  const nextPlayer =
    (currentPlayer + hand.direction + hand.hands.length) % hand.hands.length;

  return {
    ...hand,
    hands: newHands,
    discardPile: [...hand.discardPile, card],
    currentColor:
      card.type === 'WILD' || card.type === 'WILD DRAW'
        ? chosenColor
        : card.color,
    playerInTurn: nextPlayer,
    unoCalled: hand.unoCalled.map((called, idx) =>
      idx === currentPlayer ? false : called
    ),
  };
};

// Draw a card
export const draw = (hand: Hand): Hand => {
  const currentPlayer = hand.playerInTurn;
  if (currentPlayer === undefined) throw new Error('Invalid turn.');

  const [drawnCard, ...remainingDeck] = hand.drawPile;
  const newHands = hand.hands.map((h, idx) =>
    idx === currentPlayer ? [...h, drawnCard] : h
  );

  return {
    ...hand,
    hands: newHands,
    drawPile: remainingDeck,
  };
};

// Say "UNO"
export const sayUno = (player: number, hand: Hand): Hand => {
  if (hand.unoCalled[player]) throw new Error('UNO already called.');

  return {
    ...hand,
    unoCalled: hand.unoCalled.map((called, idx) =>
      idx === player ? true : called
    ),
  };
};

// Check for failure to say "UNO"
export const checkUnoFailure = (
  { accuser, accused }: { accuser: number; accused: number },
  hand: Hand
): boolean => {
  if (hand.hands[accused].length !== 1 || hand.unoCalled[accused]) {
    return false;
  }
  return true;
};

// Apply the penalty for failing to say "UNO"
export const catchUnoFailure = (
  { accuser, accused }: { accuser: number; accused: number },
  hand: Hand
): Hand => {
  if (!checkUnoFailure({ accuser, accused }, hand)) {
    throw new Error('No UNO failure detected.');
  }

  const penaltyCards = hand.drawPile.slice(0, 4);
  const newDrawPile = hand.drawPile.slice(4);
  const newHands = hand.hands.map((h, idx) =>
    idx === accused ? [...h, ...penaltyCards] : h
  );

  return {
    ...hand,
    hands: newHands,
    drawPile: newDrawPile,
  };
};

// Check if the hand has ended
export const hasEnded = (hand: Hand): boolean => {
  return hand.hands.some((h) => h.length === 0);
};

// Identify the winner of the hand
export const winner = (hand: Hand): number | undefined => {
  const winnerIndex = hand.hands.findIndex((h) => h.length === 0);
  return winnerIndex !== -1 ? winnerIndex : undefined;
};

// Check if the current player can play any card
export const canPlayAny = (hand: Hand): boolean => {
  return hand.hands[hand.playerInTurn!].some((_, idx) => canPlay(idx, hand));
};

// Calculate the score of the hand
export const score = (hand: Hand): number => {
  return hand.hands.flat().reduce((total, card) => {
    switch (card.type) {
      case 'NUMBERED':
        return total + (card.number || 0);
      case 'SKIP':
      case 'REVERSE':
      case 'DRAW':
        return total + 20;
      case 'WILD':
      case 'WILD DRAW':
        return total + 50;
      default:
        return total;
    }
  }, 0);
};
