//import { Deck } from './deck';

export type Shuffler<T> = (deck: readonly T[]) => readonly T[];

export const standardShuffler: Shuffler<any> = (deck) => {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
