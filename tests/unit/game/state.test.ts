import { describe, it, expect } from 'vitest';

import { calculateScore, createGame, drawCardFromDeck, drawCardFromDiscard, discardDrawnCard, viewPlayerCard, swapCardsBetweenPlayers, replaceCardInDeck } from '../../../src/game/state';
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

describe('Score Calculation with Negative Values', () => {
    it('Calculates the score correctly when there are negative value cards', () => {
        const player: TotalPlayerState = {
            id: 'player-4',
            name: 'David',
            hand: [
                { kind: 'standard', id: 'card-1', suit: 'spades', rank: 13, value: -2 }, // King of Spades
                { kind: 'standard', id: 'card-2', suit: 'clubs', rank: 13, value: -2 }, // King of Clubs
            ],
            score: 0
        };

        const updatedPlayer = calculateScore(player);
        expect(updatedPlayer.score).toBe(-4); // -2 + -2 = -4
    });
});

describe('Deck and Discard Pile Management', () => {
    it('Draws a card from the deck and adds it to the player\'s hand', () => {
        const playerNames = ['Alice'];
        const game = createGame('game-1', playerNames);
        const initialDeckSize = game.deck.length;

        const updatedGame = drawCardFromDeck(game, 'player-1');
        const updatedPlayer = updatedGame.players.find(player => player.id === 'player-1');

        expect(updatedPlayer?.drawnCard).toBeDefined(); // Expect that the player has a drawn card
        expect(updatedGame.deck.length).toBe(initialDeckSize - 1); // Expect that the deck size has decreased by 1
    });

    it('Draws a card from the discard pile and adds it to the player\'s hand', () => {
        const playerNames = ['Alice'];
        const game = createGame('game-1', playerNames);

        // Simulate discarding a card to the discard pile
        const cardToDiscard = game.players[0].hand[0];
        game.discardPile.push(cardToDiscard);

        const updatedGame = drawCardFromDiscard(game, 'player-1');
        const updatedPlayer = updatedGame.players.find(player => player.id === 'player-1');

        expect(updatedPlayer?.drawnCard).toBeDefined(); // Expect that the player has a drawn card
        expect(updatedGame.discardPile.length).toBe(0); // Expect that the discard pile is now empty
    });

    it('Discards the drawn card and clears the drawn card from the player\'s state', () => {
        const playerNames = ['Alice'];
        const game = createGame('game-1', playerNames);

        // Simulate drawing a card from the deck
        const gameAfterDraw = drawCardFromDeck(game, 'player-1');
        const drawnCard = gameAfterDraw.players[0].drawnCard;

        const updatedGame = discardDrawnCard(gameAfterDraw, 'player-1');
        const updatedPlayer = updatedGame.players.find(player => player.id === 'player-1');

        expect(updatedPlayer?.drawnCard).toBeUndefined(); // Expect that the player no longer has a drawn card
    });
});

describe('Replace Card in Deck', () => {
    it('Replaces a card in the player\'s hand with the drawn card and adds the replaced card to the discard pile', () => {
        const playerNames = ['Alice'];
        const game = createGame('game-1', playerNames);

        // Simulate drawing a card from the deck
        const gameAfterDraw = drawCardFromDeck(game, 'player-1');
        const drawnCard = gameAfterDraw.players[0].drawnCard;

        // Replace the first card in the player's hand with the drawn card
        const cardToReplace = gameAfterDraw.players[0].hand[0];
        const { gameState: updatedGame, discardedCard } = replaceCardInDeck(gameAfterDraw, 'player-1', cardToReplace.id);

        const updatedPlayer = updatedGame.players.find(player => player.id === 'player-1');

        expect(updatedPlayer?.hand).toContainEqual(drawnCard); // Expect that the player's hand now contains the drawn card
        expect(updatedPlayer?.hand).not.toContainEqual(cardToReplace); // Expect that the player's hand no longer contains the replaced card
        expect(updatedGame.discardPile).toContainEqual(discardedCard); // Expect that the discarded card is now in the discard pile
    });
});

describe('View Player Card', () => {
    it('Allows a player to view a specific card in their hand', () => {
        const playerNames = ['Alice'];
        const game = createGame('game-1', playerNames);

        const cardToView = game.players[0].hand[0];
        const viewedCard = viewPlayerCard(game, 'player-1', cardToView.id);

        expect(viewedCard).toEqual(cardToView); // Expect that the viewed card matches the card in the player's hand
    });

    it('Throws an error if the player tries to view a card that is not in their hand', () => {
        const playerNames = ['Alice'];
        const game = createGame('game-1', playerNames);

        const cardNotInHand = game.deck[0]

        expect(() => viewPlayerCard(game, 'player-1', cardNotInHand.id)).toThrow(`Card ${cardNotInHand.id} not found in player's hand`);
    });

    it('Allows a player to view a specific card in another player\'s hand', () => {
        const playerNames = ['Alice', 'Bob'];
        const game = createGame('game-1', playerNames);

        const cardToView = game.players[1].hand[0];
        const viewedCard = viewPlayerCard(game, 'player-2', cardToView.id);

        expect(viewedCard).toEqual(cardToView); // Expect that the viewed card matches the card in the other player's hand
    });
});

describe('Swap Cards Between Players', () => {
    it('Swaps cards between two players', () => {
        const playerNames = ['Alice', 'Bob'];
        const game = createGame('game-1', playerNames);

        const player1CardToSwap = game.players[0].hand[0];
        const player2CardToSwap = game.players[1].hand[0];

        const updatedGame = swapCardsBetweenPlayers(game, 'player-1', player1CardToSwap.id, 'player-2', player2CardToSwap.id);

        const updatedPlayer1 = updatedGame.players.find(player => player.id === 'player-1');
        const updatedPlayer2 = updatedGame.players.find(player => player.id === 'player-2');

        expect(updatedPlayer1?.hand).toContainEqual(player2CardToSwap); // Expect that player 1 now has player 2's card
        expect(updatedPlayer2?.hand).toContainEqual(player1CardToSwap); // Expect that player 2 now has player 1's card
        expect(updatedPlayer1?.hand).not.toContainEqual(player1CardToSwap) // Expect that player 1 no longer has their original swapped card
        expect(updatedPlayer2?.hand).not.toContainEqual(player2CardToSwap) // Expect that player 2 no longer has their original swapped card
    });
});