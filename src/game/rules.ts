import { GameState } from './types';

export type MoveResult =
    | {ok: true; newState: GameState}
    | {ok: false; error: string};

export function applyMove(state: GameState, action: any): MoveResult {
    switch (action.type) {
        case 'DRAW_CARD':
            return drawCard(state, action.playerId);
        case 'DISCARD_CARD':
            return discardCard(state, action.playerId, action.cardId);
        default:
            return {ok: false, error: `Unknown action type: ${action.type}`};
    }
}