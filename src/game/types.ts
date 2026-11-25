export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface StandardCard {
    kind: 'standard';
    id: string; // unique id to identify the card and use it for animations
    suit: Suit;
    rank: Rank;
    value: number; // This is the value of the card in the game, for example, 2-10 for numbered cards, 11, 12, & 13 for face cards, and 1 for Ace.
}

export interface JokerCard {
    kind: 'joker';
    id: string; // unique id to identify the card and use it for animations
    color: 'red' | 'black';
    value: number; // This is the value of the card in the game, for example, 0 for jokers.
}

export type Card = StandardCard | JokerCard;

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export interface VisiblePlayerState {
    id: string; // unique id to identify the player
    name: string;
    score: number; // The player's current score in the game
    drawnCard?: Card; // The card that the player has drawn, if any
}

export interface TotalPlayerState extends VisiblePlayerState {
    hand: Card[]
}

export interface GameState {
    id: string; // unique id to identify the game
    version: number; // version of the game state, useful for syncing
    players: TotalPlayerState[]; // The players currently in the game
    deck: Card[]; // The remaining cards in the deck
    discardPile: Card[]; // The cards that have been played and are no longer in the deck
    currentPlayerId: string; // The id of the player whose turn it is
    round: number; // The current round of the game
    phase: 'waiting' | 'playing' | 'roundEnd' | 'gameEnd'; // The current phase of the game
    winnerId?: string; // The id of the player who won the game, if the game has ended
}

export type DrawSource = 'deck' | 'discard';

export type GameAction =
    | { type: 'DRAW_CARD'; playerId: string; source: DrawSource }
    | { type: 'REPLACE_CARD'; playerId: string; cardId: string }