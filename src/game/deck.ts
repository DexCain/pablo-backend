import {Card, SUITS, RANKS} from './types';
import { Rng } from './rng';

export interface DeckOptions {
    jokers?: number; // Number of jokers to include in the deck, default is 2
}

// This is a function to create a standard deck of cards, including jokers if specified. It returns an array of Card objects.
export function createDeck({ jokers = 2 }: DeckOptions = {}): Card[] {
    
    const cards: Card[] = SUITS.flatMap(suit => 
        RANKS.map((rank, index) => {
            let value: number;

            if (rank === 13 && (suit === 'spades' || suit === 'clubs')) {
                value = -2; // Assign a value of -2 for King of Spades and King of Clubs
            } else {
                value = index + 1;
            }

            return {
                kind: 'standard' as const,
                id: `${suit}-${rank}`,
                suit,
                rank,
                value
            };
        }
    ));

    for (let i = 0; i < jokers; i++) {
        cards.push({
            kind: 'joker' as const,
            id: `joker-${i + 1}`,
            color: i % 2 === 0 ? 'red' : 'black',
            value: 0 // Assign a value of 0 for jokers
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

export function drawCard<T>(deck: T[]): T | undefined {
    return deck.pop();
}

export function drawCards<T>(deck: T[], count: number): T[] {
    const cards: T[] = [];
    for (let i = 0; i < count; i++) {
        const card = drawCard(deck);
        if (!card) break;
        cards.push(card);
    }
    return cards;
}

export function discardCard<T>(deck: T[], card: T): void {
    deck.push(card);
}