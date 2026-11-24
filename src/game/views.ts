import { GameState, PlayerState } from './types';

export interface PlayerView {
    you: PlayerState;
    opponents: PlayerState[];
    deckCount: number; // Number of cards remaining in the deck
    discardPileCount: number; // Number of cards in the discard pile
    currentPlayerId: string; // The id of the player whose turn it is
    round: number; // The current round of the game
    phase: 'waiting' | 'playing' | 'roundEnd' | 'gameEnd'; // The current phase of the game
    winnerId?: string; // The id of the player who won the game, if the game has ended
}

export function viewFor(state: GameState, playerId: string): PlayerView {
    const you = state.players.find(p => p.id === playerId);
    if (!you) {
        throw new Error(`Player with id ${playerId} not found in game state`);
    }

    const opponents = state.players.filter(p => p.id !== playerId);

    return {
        you,
        opponents,
        deckCount: state.deck.length,
        discardPileCount: state.discardPile.length,
        currentPlayerId: state.currentPlayerId,
        round: state.round,
        phase: state.phase,
        winnerId: state.winnerId
    };
}