import { shuffleDeck, createInitialDeck } from './deck';
import {  play, hasEnded, winner, score } from './hand';
import type { Hand } from './hand';
import type { Deck } from './deck';
import type { Color } from './deck';
import { createHand, HandProps } from './hand';

/**
 * A player in the game, identified by a unique name.
 */
export type Player = string;

/**
 * GameProps type for game creation.
 */
export type GameProps = {
  players: Player[];
  targetScore?: number;
  dealer?: number;
};

/**
 * The state of a UNO game.
 */
export type Game = Readonly<{
  players: readonly Player[];
  hands: readonly Hand[];
  currentHand: Hand | undefined;
  scores: Record<Player, number>;
  targetScore: number;
  deck: Deck;
}>;

/**
 * Creates a new game with the specified players and target score.
 */
export const createGame = (props: Partial<GameProps>): Game => {
    const {
      players = [],
      targetScore = 500,
      dealer = 0,
    } = props;
  
    if (players.length < 2) {
      throw new Error('UNO requires at least 2 players.');
    }
  
    const deck = shuffleDeck(createInitialDeck());
    const hand = createHand({ players, dealer, cardsPerPlayer: 7 });
  
    const scores = Object.fromEntries(players.map((player) => [player, 0]));
  
    return {
      players,
      hands: [hand],
      currentHand: hand,
      scores,
      targetScore,
      deck,
    };
  };
  

/**
 * Plays the current hand and moves to the next one.
 */
export const playHand = (game: Game): Game => {
    const { players, currentHand, scores, targetScore, deck } = game;
  
    if (!currentHand) {
      throw new Error('No current hand to play.');
    }
  
    if (hasEnded(currentHand)) {
      const winningPlayerIndex = winner(currentHand);
      if (winningPlayerIndex === undefined) {
        throw new Error('Game ended without a winner.');
      }
  
      const winningPlayer = players[winningPlayerIndex];
  
      // Update scores
      const handScore = score(currentHand);
      scores[winningPlayer] += handScore ?? 0;
  
      if (scores[winningPlayer] >= targetScore) {
        return {
          ...game,
          currentHand: undefined, // Game over
          scores,
        };
      }
  
      // Start a new hand
      const newHand = createHand({
        players,
        dealer: winningPlayerIndex, // Use the winner as the next dealer
        cardsPerPlayer: 7,
      });
  
      return {
        ...game,
        currentHand: newHand,
        hands: [...game.hands, newHand], // Append the new hand to the history
        scores,
      };
    }
  
    // Continue the current hand
    return {
      ...game,
      currentHand: play(0, undefined, currentHand), // Example play logic
    };
  };
  
/**
 * Determines if the game has a winner.
 */
export const isGameOver = (game: Game): boolean => {
  return game.currentHand === undefined;
};

/**
 * Gets the player who has won the game.
 */
export const getWinner = (game: Game): Player | undefined => {
  if (!isGameOver(game)) {
    return undefined;
  }

  const winningPlayer = Object.entries(game.scores).find(
    ([_, score]) => score >= game.targetScore
  );

  return winningPlayer?.[0];
};

// Export GameProps as Props
export { GameProps as Props };
