import { createDeck, shuffleDeck } from './deck';
import { GameState, PlayerState } from './types';
import { mulberryRng } from './rng';    

export function createGame(id: string, playerNames: string[]): GameState {
    const players: PlayerState[] = playerNames.map((name, index) => ({
        id: `player-${index + 1}`,
        name,
        hand: [],
        score: 0
    }));

    const deck = shuffleDeck(createDeck(), mulberryRng(Date.now()));

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
