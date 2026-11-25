import { createDeck, shuffleDeck, drawCards } from './deck';
import { Card, GameState, TotalPlayerState } from './types';
import { mulberryRng } from './rng';    

/*
 * This function calculates the score of a player based on the cards in their hand. 
 * It sums up the values of all standard cards and ignores jokers (as they are worth 0 points). 
 * The function returns a new player state with the updated score.
 * 
 * Params:
 * - player: TotalPlayerState - The current state of the player, including their hand
 * 
 * Returns:
 * - TotalPlayerState - A new player state with the updated score based on the cards in their hand.
 */
export function calculateScore(player: TotalPlayerState): TotalPlayerState {
    let total = 0;

    player.hand.forEach(card => {
        if (card.kind === 'standard') {
            total += card.value;
        }
    });

    return {
        ...player,
        score: total
    };
}

/*
 * This function updates the scores of all players in the game state.
 * It maps over the array of players, applying the calculateScore function to each one.
 *
 * Params:
 * - players: TotalPlayerState[] - An array of player states to update scores for
 * 
 * Returns:
 * - TotalPlayerState[] - A new array of player states with updated scores.
 */ 
export function updateAllScores(players: TotalPlayerState[]): TotalPlayerState[] {
    return players.map(calculateScore);
}

/*
 * This function creates a new game state with the specified id and player names.
 * It initializes a shuffled deck of cards, deals 4 cards to each player, and sets the initial game state.
 * 
 * Params:
 * - id: string - The unique identifier for the game
 * - playerNames: string[] - An array of player names to create player states for
 * 
 * Returns:
 * - GameState - The initial state of the game, including players, deck, and other game properties.
 */
export function createGame(id: string, playerNames: string[]): GameState {
    // Create a shuffled deck with 2 jokers.
    const deck: Card[] = shuffleDeck<Card>(createDeck(), mulberryRng(Date.now()));

    // Create a list of player objects
    const players: TotalPlayerState[] = playerNames.map((name, index) => {
        // We will deal players each 4 cards (none of which are visible state)
        let hand: Card[] = drawCards(deck, 4)

        return {
            id: `player-${index + 1}`,
            name,
            hand,
            score: 0
        }
    });

    return {
        id,
        version: 1,
        players,
        deck,
        discardPile: [],
        currentPlayerId: players[0].id,
        round: 1,
        phase: 'waiting'
    };
}
