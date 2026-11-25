import { describe, it, expect } from 'vitest';

import { calculateScore, createGame } from '../../../src/game/state';
import { TotalPlayerState } from '../../../src/game';

describe('Game State Creation', () => {
    it('Creates a game state with the correct number of players', () => {
        const playerNames = ['Alice', 'Bob', 'Charlie'];
        const game = createGame('game-1', playerNames);

        expect(game.players).toHaveLength(3);
    });

    it('Initializes players with 4 cards in their hands', () => {
        const playerNames = ['Alice', 'Bob'];
        const game = createGame('game-1', playerNames);

        game.players.forEach((player: TotalPlayerState) => {
            expect(player.hand).toHaveLength(4); // Each player should start with 4 cards
         
        });
    });

    it('Initializes the deck with 54 cards', () => {
        const playerNames = ['Alice', 'Bob'];
        const game = createGame('game-1', playerNames);

        let totalPlayerCards = 0;
        game.players.forEach((player: TotalPlayerState) => {
            totalPlayerCards += player.hand.length;
        });

        expect(game.deck).toHaveLength(54 - totalPlayerCards);
    });
});

describe('Score Calculation', () => {
    it('Calculates the score correctly for a player', () => {
        const player: TotalPlayerState = {
            id: 'player-1',
            name: 'Alice',
            hand: [
                { kind: 'standard', id: 'card-1', suit: 'hearts', rank: 2, value: 2 },
                { kind: 'standard', id: 'card-2', suit: 'spades', rank: 10, value: 10 },
                { kind: 'standard', id: 'card-3', suit: 'diamonds', rank: 5, value: 5 }
            ],
            score: 0
        };

        const updatedPlayer = calculateScore(player);
        expect(updatedPlayer.score).toBe(17); // 2 + 10 + 5 = 17
    });

    it('Calculates the score correctly when there are no standard cards', () => {
        const player: TotalPlayerState = {
            id: 'player-2',
            name: 'Bob',
            hand: [
                { kind: 'joker', id: 'joker-1', color: 'red', value: 0 },
                { kind: 'joker', id: 'joker-2', color: 'black', value: 0 }
            ],
            score: 0
        };

        const updatedPlayer = calculateScore(player);
        expect(updatedPlayer.score).toBe(0); // No standard cards, so score should be 0
    });

    it('Calculates the score correctly with a mix of standard and joker cards', () => {
        const player: TotalPlayerState = {
            id: 'player-3',
            name: 'Charlie',
            hand: [
                { kind: 'standard', id: 'card-1', suit: 'hearts', rank: 3, value: 3 },
                { kind: 'joker', id: 'joker-1', color: 'red', value: 0 },
                { kind: 'standard', id: 'card-2', suit: 'spades', rank: 7, value: 7 },
                { kind: 'standard', id: 'card-2', suit: 'spades', rank: 1, value: 1 },
                { kind: 'standard', id: 'card-2', suit: 'spades', rank: 13, value: -2 }
            ],
            score: 0
        };

        const updatedPlayer = calculateScore(player);
        expect(updatedPlayer.score).toBe(9); // 3 + 7 + 1 + -2 = 9
    });

});