import { Shuffler, standardShuffler } from '../../src/utils/randomUtils'
import * as deck from '../../src/models/deck'
import * as hand from '../../src/models/hand'
import * as uno from '../../src/models/uno'

export function createInitialDeck(): deck.Deck {
  return deck.createInitialDeck()
}

export type HandProps = {
  players: string[]
  dealer: number
  shuffler?: Shuffler<deck.Card>
  cardsPerPlayer?: number
}

// Updated createHand function
export function createHand(props: HandProps): hand.Hand {
  return hand.createHand({
    players: props.players,
    dealer: props.dealer,
    shuffler: props.shuffler ?? standardShuffler,
    cardsPerPlayer: props.cardsPerPlayer ?? 7,
  });
}

export function createGame(props: Partial<uno.Props>): uno.Game {
  return uno.createGame(props)
}
