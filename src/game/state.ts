import { createDeck, shuffleDeck, drawCards, drawCard, discardCard} from './deck';
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

/*
 * This function allows a player to draw a card from the deck in the game state.
 * It finds the player by their id, draws a card from the deck, and updates the player's drawnCard property to allow the player to view the card they drew. 
 * The function returns a new game state with the updated player and deck.
 * If the player is not found or the deck is empty, it throws an error.
 * 
 * Params:
 * - state: GameState - The current state of the game
 * - playerId: string - The unique identifier of the player who is drawing a card
 * 
 * Returns:
 * - GameState - A new game state with the updated player and deck after drawing a card.
 * 
 * Throws:
 * - Error - If the player is not found or if the deck is empty.
 */
export function drawCardFromDeck(state: GameState, playerId: string): GameState {
    const playerIndex = state.players.findIndex(player => player.id === playerId);

    if (playerIndex === -1) {
        throw new Error(`Player with id ${playerId} not found`);
    }

    const card = drawCard(state.deck);

    if (!card) {
        throw new Error('Deck is empty');
    }

    const updatedPlayers = [...state.players];
    updatedPlayers[playerIndex] = {
        ...updatedPlayers[playerIndex],
        drawnCard: card
    };

    return {
        ...state,
        players: updatedPlayers
    };
}

/*
 * This function allows a player to draw a card from the discard pile in the game state.
 * It finds the player by their id, draws a card from the discard pile, and updates the player's drawnCard property to allow the player to view the card they drew. 
 * The function returns a new game state with the updated player and discard pile.
 * 
 * Params:
 * - state: GameState - The current state of the game
 * - playerId: string - The unique identifier of the player who is drawing a card
 * 
 * Returns:
 * - GameState - A new game state with the updated player and discard pile after drawing a card.
 * 
 * Throws:
 * - Error - If the player is not found or if the discard pile is empty.
 */
export function drawCardFromDiscard(state: GameState, playerId: string): GameState {
    const playerIndex = state.players.findIndex(player => player.id === playerId);

    if (playerIndex === -1) {
        throw new Error(`Player with id ${playerId} not found`);
    }

    const card = drawCard(state.discardPile);

    if (!card) {
        throw new Error('Discard pile is empty');
    }

    const updatedPlayers = [...state.players];
    updatedPlayers[playerIndex] = {
        ...updatedPlayers[playerIndex],
        drawnCard: card
    };

    return {
        ...state,
        players: updatedPlayers
    };
}

/*
 * This function allows a player to replace a card in their hand with the card they have drawn from the deck.
 * It finds the player by their id, checks if they have drawn a card, and replaces the specified card in their hand with the drawn card.
 * The replaced card is then added to the discard pile. The function returns a new game state with the updated player and discard pile.
 * 
 * Params:
 * - state: GameState - The current state of the game
 * - playerId: string - The unique identifier of the player who is replacing a card
 * - cardId: number - The id of the card in the player's hand to be replaced
 * 
 * Returns:
 * - { gameState: GameState; discardedCard: Card } - An object containing the new game state and the card that was discarded.
 * 
 * Throws:
 * - Error - If the player is not found, if they have not drawn a card, or if the specified card is not found in their hand.
 */
export function replaceCardInDeck(state: GameState, playerId: string, cardId: string): { gameState: GameState; discardedCard: Card } {
    const playerIndex = state.players.findIndex(player => player.id === playerId);

    if (playerIndex === -1) {
        throw new Error(`Player with id ${playerId} not found`);
    }

    const player = state.players[playerIndex];

    if (!player.drawnCard) {
        throw new Error(`Player with id ${playerId} has not drawn a card`);
    }

    const cardIndex = player.hand.findIndex(card => card.id === cardId);

    if (cardIndex < 0 || cardIndex >= player.hand.length) {
        throw new Error(`Card ${cardId} not found in player's hand`);
    }

    const updatedHand = [...player.hand];
    const replacedCard = updatedHand[cardIndex];
    updatedHand[cardIndex] = player.drawnCard;

    const updatedPlayers = [...state.players];
    updatedPlayers[playerIndex] = {
        ...player,
        hand: updatedHand,
        drawnCard: undefined // Clear the drawn card after replacement
    };

    discardCard(state.discardPile, replacedCard); // Add the replaced card to the discard pile

    return {
        gameState: {
            ...state,
            players: updatedPlayers
        },
        discardedCard: replacedCard
    };
}

/*
 * This function allows a player to discard the card they have drawn from the deck without replacing any card in their hand.
 * It finds the player by their id, checks if they have drawn a card, and adds that card to the discard pile. 
 * The function returns a new game state with the updated player and discard pile.
 * 
 * Params:
 * - state: GameState - The current state of the game
 * - playerId: string - The unique identifier of the player who is discarding a card
 * 
 * Returns:
 * - GameState - A new game state with the updated player and discard pile after discarding the drawn card.
 * 
 * Throws:
 * - Error - If the player is not found or if they have not drawn a card.
 */
export function discardDrawnCard(state: GameState, playerId: string): GameState {
    const playerIndex = state.players.findIndex(player => player.id === playerId);

    if (playerIndex === -1) {
        throw new Error(`Player with id ${playerId} not found`);
    }

    const player = state.players[playerIndex];

    if (!player.drawnCard) {
        throw new Error(`Player with id ${playerId} has not drawn a card`);
    }

    const updatedPlayers = [...state.players];
    updatedPlayers[playerIndex] = {
        ...player,
        drawnCard: undefined // Clear the drawn card after discarding
    };

    discardCard(state.discardPile, player.drawnCard); // Add the drawn card to the discard pile

    return {
        ...state,
        players: updatedPlayers
    };
}

/*
 * This is a utility function that allows a player to view a specific card in their hand by its id.
 * This is used for special rules where a player may need to view a card in their (or others') hand without drawing it.
 * 
 * Params:
 * - state: GameState - The current state of the game
 * - playerId: string - The unique identifier of the player whose card is to be viewed
 * - cardId: number - The id of the card to be viewed
 * 
 * Returns:
 * - Card - The card at the specified index in the player's hand
 * 
 * Throws:
 * - Error - If the player or card is not found
 */
export function viewPlayerCard(state: GameState, playerId: string, cardId: string): Card {
    const player = state.players.find(player => player.id === playerId);

    if (!player) {
        throw new Error(`Player with id ${playerId} not found`);
    }

    const card= player.hand.find(card => card.id === cardId)

    if (!card) {
        throw new Error(`Card ${cardId} not found in player's hand`);
    }

    return card;
}

/*
 * This function allows two players to swap cards between their hands in the game state.
 * It finds both players by their ids, checks if the specified cards are in their hands, and swaps the cards.
 * The function returns a new game state with the updated players' hands.
 * 
 * Params:
 * - state: GameState - The current state of the game
 * - playerId1: string - The unique identifier of the first player
 * - cardId1: string - The unique identifier of the card in the first player's hand to be swapped
 * - playerId2: string - The unique identifier of the second player
 * - cardId2: string - The unique identifier of the card in the second player's hand to be swapped
 * 
 *  Returns:
 * - GameState - A new game state with the updated players' hands after swapping the cards.
 * 
 * Throws:
 * - Error - If either player or card is not found
 */
export function swapCardsBetweenPlayers(state: GameState, playerId1: string, cardId1: string, playerId2: string, cardId2: string): GameState {
    const playerIndex1 = state.players.findIndex(player => player.id === playerId1);
    const playerIndex2 = state.players.findIndex(player => player.id === playerId2);

    if (playerIndex1 === -1 || playerIndex2 === -1) {
        throw new Error(`One or both players not found`);
    }

    const player1 = state.players[playerIndex1];
    const player2 = state.players[playerIndex2];

    const cardIndex1 = player1.hand.findIndex(card => card.id === cardId1);
    const cardIndex2 = player2.hand.findIndex(card => card.id === cardId2);

    if (cardIndex1 === -1 || cardIndex2 === -1) {
        throw new Error(`One or both cards not found in players' hands`);
    }

    const updatedHand1 = [...player1.hand];
    const updatedHand2 = [...player2.hand];

    // Swap the cards
    [updatedHand1[cardIndex1], updatedHand2[cardIndex2]] = [updatedHand2[cardIndex2], updatedHand1[cardIndex1]];
    
    const updatedPlayers = [...state.players];
    updatedPlayers[playerIndex1] = {
        ...player1,
        hand: updatedHand1
    };
    updatedPlayers[playerIndex2] = {
        ...player2,
        hand: updatedHand2
    };

    return {
        ...state,
        players: updatedPlayers
    };
}

// export function jumpInDiscard(state: GameState, playerId1: string, cardId: string)