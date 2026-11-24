import { describe, it, expect } from 'vitest';
import { createDeck, shuffleDeck } from '../../../src/game/deck';
import { mulberryRng } from '../../../src/game/rng';

describe('Create Deck', () => {
    it('Creates 52 Unique Standard Cards', () => {
        const deck = createDeck({ jokers: 0 });
        const uniqueCards = new Set(deck.map(card => card.id));
        expect(deck).toHaveLength(52); // Ensures that the deck has 52 cards
        expect(uniqueCards.size).toBe(52); // Ensures that all cards are unique
    });

    it('Includes Jokers When Specified', () => {
        const deck = createDeck({ jokers: 2 });
        const jokerCount = deck.filter(card => card.kind === 'joker').length;
        expect(jokerCount).toBe(2); // Ensures that there are 2 jokers in the deck

        const uniqueCards = new Set(deck.map(card => card.id));
        expect(uniqueCards.size).toBe(54); // Ensures that all cards are unique, including jokers
    });
});

describe('Shuffle Deck', () => {
    it('Shuffle maintains the same cards', () => {
        const originalDeck = createDeck({ jokers: 2 });
        const rng = mulberryRng(12345); // Using a fixed seed for reproducibility
        const shuffledDeck = shuffleDeck(originalDeck, rng);

        // Check that the shuffled deck has the same length and unique cards
        expect(shuffledDeck).toHaveLength(originalDeck.length);
        const originalIds = new Set(originalDeck.map(card => card.id));
        const shuffledIds = new Set(shuffledDeck.map(card => card.id));
        expect(originalIds).toEqual(shuffledIds); // Ensures that all cards are still present after shuffling
    });

    it('Shuffle changes the order of cards', () => {
        const originalDeck = createDeck({ jokers: 2 });
        const rng = mulberryRng(12345);
        const shuffledDeck = shuffleDeck(originalDeck, rng);
        
        // Check that the order of cards has changed
        const isOrderChanged = originalDeck.some((card, index) => card.id !== shuffledDeck[index].id);
        expect(isOrderChanged).toBe(true); // Ensures that the order of cards has changed after shuffling
    });

    it('Shuffle is reproducible with the same seed', () => {
        const originalDeck = createDeck({ jokers: 2 });
        const rng1 = mulberryRng(12345);
        const rng2 = mulberryRng(12345);
        const shuffledDeck1 = shuffleDeck(originalDeck, rng1);
        const shuffledDeck2 = shuffleDeck(originalDeck, rng2);

        // Check that shuffling with the same seed produces the same order
        const ids1 = shuffledDeck1.map(card => card.id);
        const ids2 = shuffledDeck2.map(card => card.id);
        expect(ids1).toEqual(ids2); // Ensures that shuffling with the same seed produces the same order
    });

    it('Does not modify the original deck', () => {
        const originalDeck = createDeck({ jokers: 2 });
        const rng = mulberryRng(12345);
        const originalDeckCopy = [...originalDeck];

        shuffleDeck(originalDeck, rng);

        // Check that the original deck has not been modified
        expect(originalDeck).toEqual(originalDeckCopy); // Ensures that the original deck remains unchanged after shuffling
    });
});