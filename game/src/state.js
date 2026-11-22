// Ember Duel — game state, turns, and card resolution.
// Pure rules: no DOM here, so the same logic can be unit-tested from Node.

import {
  MAX_LIFE, START_HAND, MAX_EMBER, RESONANCE_BONUS, buildDeck, shuffleDeck,
} from './cards.js';

export function makeFighter(name) {
  return {
    name,
    life: MAX_LIFE,
    shield: 0,
    ember: 3,
    maxEmber: 3,
    deck: [],
    discard: [],
    hand: [],
  };
}

export function createGame(random = Math.random) {
  const game = {
    player: makeFighter('You'),
    opponent: makeFighter('Bramble'),
    turn: 1,
    phase: 'player', // 'player' | 'opponent' | 'over'
    winner: null, // 'player' | 'opponent' | null
    lastSuitPlayed: null,
    log: [],
    damageDealtByPlayer: 0,
    cardsPlayedByPlayer: 0,
  };
  for (const fighter of [game.player, game.opponent]) {
    fighter.deck = shuffleDeck(buildDeck(), random);
    drawCards(game, fighter, START_HAND);
  }
  addLog(game, 'info', 'The duel begins. You hold 30 life and 3 ember.');
  return game;
}

export function addLog(game, kind, text) {
  game.log.push({ kind, text });
  if (game.log.length > 40) game.log.shift();
}

export function drawCards(game, fighter, count) {
  for (let i = 0; i < count; i += 1) {
    if (fighter.deck.length === 0) {
      if (fighter.discard.length === 0) return; // nothing left to draw
      fighter.deck = shuffleDeck(fighter.discard);
      fighter.discard = [];
      addLog(game, 'info', `${fighter.name} reshuffle the discard pile into the deck.`);
    }
    fighter.hand.push(fighter.deck.pop());
  }
}

export function resonanceBonus(game, card) {
  return game.lastSuitPlayed === card.suit ? RESONANCE_BONUS : 0;
}

export function effectiveValue(game, card) {
  return card.value + resonanceBonus(game, card);
}

export function canPlayCard(game, fighter, card) {
  return game.phase === 'player' && fighter.ember >= card.cost;
}

export function dealDamage(game, target, amount, sourceName) {
  let remaining = amount;
  if (target.shield > 0) {
    const blocked = Math.min(target.shield, remaining);
    target.shield -= blocked;
    remaining -= blocked;
    addLog(game, 'info', `${target.name}'s shield blocks ${blocked}.`);
  }
  if (remaining > 0) {
    target.life = Math.max(0, target.life - remaining);
    addLog(game, 'info', `${sourceName} hits ${target.name} for ${remaining}.`);
  }
  if (target.life === 0) endDuel(game, sourceName === 'You' ? 'player' : 'opponent');
}

export function healFighter(game, fighter, amount) {
  const healed = Math.min(amount, MAX_LIFE - fighter.life);
  fighter.life += healed;
  if (healed > 0) addLog(game, 'info', `${fighter.name} restore ${healed} life.`);
}

export function gainShield(game, fighter, amount) {
  fighter.shield += amount;
  addLog(game, 'info', `${fighter.name} gain ${amount} shield.`);
}

export function gainEmber(game, fighter, amount) {
  fighter.ember = Math.min(MAX_EMBER, fighter.ember + amount);
  addLog(game, 'info', `${fighter.name} gain ${amount} ember.`);
}

// Resolve one card. `actor` plays it, `target` receives damage/healing as the card says.
export function playCard(game, actor, target, card) {
  const handIndex = actor.hand.findIndex((held) => held.uid === card.uid);
  if (handIndex === -1) return false;
  if (actor.ember < card.cost) return false;

  actor.ember -= card.cost;
  actor.hand.splice(handIndex, 1);
  actor.discard.push(card);

  const value = effectiveValue(game, card);
  const resonated = resonanceBonus(game, card) > 0;
  const who = actor === game.player ? 'You' : 'Bramble';
  addLog(game, actor === game.player ? 'you' : 'foe',
    `${who} play ${card.name}${resonated ? ' — RESONANCE +2!' : ''}.`);
  game.lastSuitPlayed = card.suit;
  if (actor === game.player) game.cardsPlayedByPlayer += 1;

  switch (card.kind) {
    case 'damage':
      if (actor === game.player) game.damageDealtByPlayer += value;
      dealDamage(game, target, value, who);
      break;
    case 'heal':
      healFighter(game, actor, value);
      break;
    case 'heal-draw':
      healFighter(game, actor, value);
      drawCards(game, actor, 1);
      break;
    case 'drain': {
      if (actor === game.player) game.damageDealtByPlayer += value;
      dealDamage(game, target, value, who);
      healFighter(game, actor, 3);
      break;
    }
    case 'shield':
      gainShield(game, actor, value);
      break;
    case 'damage-shield': {
      if (actor === game.player) game.damageDealtByPlayer += value;
      dealDamage(game, target, value, who);
      gainShield(game, actor, 2);
      break;
    }
    case 'shield-draw':
      gainShield(game, actor, value);
      drawCards(game, actor, 1);
      break;
    case 'ember':
      gainEmber(game, actor, value);
      break;
    default:
      break;
  }
  return true;
}

export function endPlayerTurn(game) {
  if (game.phase !== 'player' || game.winner) return false;
  game.phase = 'opponent';
  game.lastSuitPlayed = null;
  addLog(game, 'info', '— Bramble takes the table —');
  return true;
}

export function startPlayerTurn(game) {
  game.turn += 1;
  game.phase = 'player';
  game.lastSuitPlayed = null;
  const fighter = game.player;
  fighter.maxEmber = Math.min(MAX_EMBER, fighter.maxEmber + 1);
  fighter.ember = fighter.maxEmber;
  drawCards(game, fighter, 1);
  addLog(game, 'info', `Turn ${game.turn}: your ember refills to ${fighter.maxEmber}.`);
}

export function startOpponentTurn(game) {
  const fighter = game.opponent;
  fighter.maxEmber = Math.min(MAX_EMBER, fighter.maxEmber + 1);
  fighter.ember = fighter.maxEmber;
  drawCards(game, fighter, 1);
}

export function endDuel(game, winner) {
  game.winner = winner;
  game.phase = 'over';
  addLog(game, 'info', winner === 'player'
    ? 'Bramble falls. The ember is yours!'
    : 'Your ember fades. Bramble keeps the table.');
}

export function isGameOver(game) {
  return game.winner !== null;
}
