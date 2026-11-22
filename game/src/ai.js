// Ember Duel — Bramble's turn: a readable, counterable opponent.
// Bramble plays greedily but with a visible plan: finish you when it can,
// shield up when hurt, and otherwise spend ember on its biggest cards.

import { playCard, effectiveValue } from './state.js';

export function scoreCardForAi(game, card) {
  const value = effectiveValue(game, card);
  const foe = game.opponent;
  const you = game.player;
  let score = value;
  switch (card.kind) {
    case 'damage':
      // Lethal damage is worth everything.
      if (value >= you.life + you.shield) score += 100;
      else if (value >= you.life) score += 40;
      break;
    case 'drain':
      if (value >= you.life + you.shield) score += 100;
      score += 3; // the small heal is a bonus
      break;
    case 'damage-shield':
      score += 2;
      break;
    case 'heal':
      // Healing matters most when Bramble is hurt.
      score = foe.life >= 26 ? 1 : value * (30 - foe.life) / 10;
      break;
    case 'heal-draw':
      score = foe.life >= 26 ? 3 : value + 2;
      break;
    case 'shield':
      score = you.life <= 10 ? value * 0.4 : value * 0.8;
      break;
    case 'shield-draw':
      score = value + 1;
      break;
    case 'ember':
      // Ember now buys bigger cards later; worth less this turn.
      score = 2 + (foe.ember >= 7 ? 0 : 1);
      break;
    default:
      break;
  }
  // Cheap cards that leave ember for a second play are slightly favoured.
  score += (4 - card.cost) * 0.25;
  return score;
}

export function chooseAiCard(game) {
  const foe = game.opponent;
  const affordable = foe.hand.filter((card) => card.cost <= foe.ember);
  if (affordable.length === 0) return null;
  let best = affordable[0];
  let bestScore = scoreCardForAi(game, best);
  for (const card of affordable.slice(1)) {
    const score = scoreCardForAi(game, card);
    if (score > bestScore) {
      best = card;
      bestScore = score;
    }
  }
  return best;
}

// Play Bramble's whole turn, one card at a time, with a callback between
// plays so the table can animate. Returns a promise that resolves when done.
export async function runOpponentTurn(game, onCardPlayed, waitMs = 650) {
  while (!game.winner) {
    const card = chooseAiCard(game);
    if (!card) break;
    playCard(game, game.opponent, game.player, card);
    if (onCardPlayed) onCardPlayed(card);
    if (game.winner) break;
    await new Promise((resolve) => { setTimeout(resolve, waitMs); });
  }
}
