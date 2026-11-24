export type Rng = () => number; // A function that returns a random number between 0 and 1, used for shuffling the deck and other random operations in the game.

export function mulberryRng(seed: number): Rng {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return () => ((t ^ t >>> 14) >>> 0) / 4294967296;
}