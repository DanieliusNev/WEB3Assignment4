// Types for UNO deck
export type Type = 'NUMBERED' | 'SKIP' | 'REVERSE' | 'DRAW' | 'WILD' | 'WILD DRAW';
export type Color = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW';

export type Card = Readonly<{
  type: Type;
  color?: Color;
  number?: number;
}>;

export type Deck = readonly Card[];

// Define and export colors
export const colors: Color[] = ['RED', 'BLUE', 'GREEN', 'YELLOW'];

/**
 * Function to create the initial UNO deck according to the rules.
 * - Each color (RED, BLUE, GREEN, YELLOW) has:
 *   - One '0' card.
 *   - Two cards each for numbers 1–9.
 *   - Two "SKIP", "REVERSE", and "DRAW" cards.
 * - Additionally:
 *   - Four "WILD" cards.
 *   - Four "WILD DRAW" cards.
 */
export const createInitialDeck = (): Deck => {
  // Create numbered cards (0–9)
  const createNumberedCards = (colors: Color[]): Card[] =>
    colors.flatMap((color) =>
      Array.from({ length: 10 }, (_, number) =>
        number === 0
          ? [{ type: 'NUMBERED' as const, color, number }] // `as const` ensures the type matches
          : [
              { type: 'NUMBERED' as const, color, number },
              { type: 'NUMBERED' as const, color, number },
            ]
      ).flat()
    );

  // Create action cards (SKIP, REVERSE, DRAW)
  const createActionCards = (colors: Color[], actionType: Type): Card[] =>
    colors.flatMap((color) =>
      Array(2)
        .fill(null)
        .map(() => ({ type: actionType, color }))
    );

  // Create wild cards (WILD, WILD DRAW)
  const createWildCards = (actionType: Type, count: number): Card[] =>
    Array(count)
      .fill(null)
      .map(() => ({ type: actionType }));

  // Combine all cards into the initial deck
  const numberedCards = createNumberedCards(colors);
  const skipCards = createActionCards(colors, 'SKIP');
  const reverseCards = createActionCards(colors, 'REVERSE');
  const drawCards = createActionCards(colors, 'DRAW');
  const wildCards = createWildCards('WILD', 4);
  const wildDrawCards = createWildCards('WILD DRAW', 4);

  return [
    ...numberedCards,
    ...skipCards,
    ...reverseCards,
    ...drawCards,
    ...wildCards,
    ...wildDrawCards,
  ];
};

/**
 * Shuffles the deck using Fisher-Yates algorithm for fairness.
 * @param deck The deck to shuffle.
 * @returns A shuffled deck.
 */
export const shuffleDeck = (deck: Deck): Deck => {
  const shuffled = [...deck]; // Create a mutable copy for shuffling
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Draws a card from the deck.
 * @param deck The deck to draw from.
 * @returns A tuple containing the drawn card and the updated deck.
 */
export const drawCard = (deck: Deck): [Card | undefined, Deck] => {
  if (deck.length === 0) return [undefined, deck];
  const [card, ...remainingDeck] = deck;
  return [card, remainingDeck];
};
