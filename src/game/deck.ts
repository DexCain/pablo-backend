import {Card, SUITS, RANKS} from './types';
import { Rng } from './rng';

export interface DeckOptions {
    jokers?: number; // Number of jokers to include in the deck, default is 2
}

// This is a function to create a standard deck of cards, including jokers if specified. It returns an array of Card objects.
export function createDeck({ jokers = 2 }: DeckOptions = {}): Card[] {
    
    const cards: Card[] = SUITS.flatMap(suit => 
        RANKS.map((rank, index) => ({
            kind: 'standard' as const,
            id: `${suit}-${rank}`,
            suit,
            rank,
            value: index + 1
        })
    ));

    for (let i = 0; i < jokers; i++) {
        cards.push({
            kind: 'joker' as const,
            id: `joker-${i + 1}`,
            color: i % 2 === 0 ? 'red' : 'black'
        });
    }

    return cards;
}

export function shuffleDeck<T>(deck: T[], rng: Rng): T[] {
    const shuffledDeck = [...deck];
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
    return shuffledDeck;
}
