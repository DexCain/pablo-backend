import { discardDrawnCard, drawCardFromDeck, replaceCardInDeck } from './state';
import { GameState, GameAction} from './types';

export type MoveResult =
    | {ok: true; newState: GameState}
    | {ok: false; error: string};

export function applyMove(state: GameState, action: GameAction): MoveResult {
    switch (action.type) { 
        case 'DRAW_CARD':
            return {ok: true, newState: drawCardFromDeck(state, action.playerId)};
        case 'REPLACE_CARD':
            return {ok: true, newState: replaceCardInDeck(state, action.playerId, action.cardIndex).gameState};
        default:
            return {ok: false, error: `Unknown action type: ${action.type}`};
    }
}