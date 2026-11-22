// Ember Duel — logic tests for the pure rules in game/src/state.js.
// Run: node tests/logic.test.mjs
import assert from 'node:assert/strict';
import {
  createGame, playCard, endPlayerTurn, startPlayerTurn, startOpponentTurn,
  drawCards, effectiveValue, canPlayCard, isGameOver,
} from '../game/src/state.js';
import { chooseAiCard } from '../game/src/ai.js';
import { buildDeck, shuffleDeck, cardById } from '../game/src/cards.js';

let seed = 42;
const seeded = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

check('deck has 24 cards, 12 unique x2', () => {
  const deck = buildDeck();
  assert.equal(deck.length, 24);
  assert.equal(new Set(deck.map((c) => c.id)).size, 12);
});

check('new game: 30 life, 4-card hands, 3 ember', () => {
  const g = createGame(seeded);
  assert.equal(g.player.life, 30);
  assert.equal(g.opponent.life, 30);
  assert.equal(g.player.hand.length, 4);
  assert.equal(g.opponent.hand.length, 4);
  assert.equal(g.player.ember, 3);
  assert.equal(g.phase, 'player');
});

check('damage card hurts shield first, then life', () => {
  const g = createGame(seeded);
  g.opponent.shield = 4;
  const strike = cardById('cinder-strike');
  g.player.hand = [{ ...strike, uid: 'cinder-strike-t' }];
  g.player.ember = 5;
  assert.equal(playCard(g, g.player, g.opponent, g.player.hand[0]), true);
  assert.equal(g.opponent.shield, 0);
  assert.equal(g.opponent.life, 29); // 5 damage: 4 blocked, 1 through
  assert.equal(g.player.ember, 3);
});

check('resonance: same suit twice in a turn adds +2', () => {
  const g = createGame(seeded);
  const lash = { ...cardById('ember-lash'), uid: 'a' };
  const strike = { ...cardById('cinder-strike'), uid: 'b' };
  g.player.hand = [lash, strike];
  g.player.ember = 10;
  playCard(g, g.player, g.opponent, lash);
  assert.equal(g.opponent.life, 27); // 3 damage
  assert.equal(effectiveValue(g, strike), 7); // 5 + 2 resonance
  playCard(g, g.player, g.opponent, strike);
  assert.equal(g.opponent.life, 20); // 7 more damage
});

check('cannot play a card you cannot afford', () => {
  const g = createGame(seeded);
  const fire = { ...cardById('wildfire'), uid: 'w' };
  g.player.hand = [fire];
  g.player.ember = 2;
  assert.equal(playCard(g, g.player, g.opponent, fire), false);
  assert.equal(g.opponent.life, 30);
});

check('heal cannot exceed max life; ember caps at 10', () => {
  const g = createGame(seeded);
  g.player.life = 29;
  const mend = { ...cardById('tide-mend'), uid: 'm' };
  g.player.hand = [mend];
  g.player.ember = 5;
  playCard(g, g.player, g.opponent, mend);
  assert.equal(g.player.life, 30);
  const hoard = { ...cardById('stone-hoard'), uid: 'h' };
  g.player.hand = [hoard];
  g.player.ember = 9;
  playCard(g, g.player, g.opponent, hoard);
  assert.equal(g.player.ember, 10);
});

check('turn flow: end turn, opponent starts, new turn refills ember and draws', () => {
  const g = createGame(seeded);
  assert.equal(endPlayerTurn(g), true);
  assert.equal(g.phase, 'opponent');
  startOpponentTurn(g);
  assert.equal(g.opponent.maxEmber, 4);
  startPlayerTurn(g);
  assert.equal(g.phase, 'player');
  assert.equal(g.turn, 2);
  assert.equal(g.player.ember, 4);
  assert.equal(g.player.hand.length, 5);
});

check('lethal damage ends the duel with the player as winner', () => {
  const g = createGame(seeded);
  g.opponent.life = 3;
  const lash = { ...cardById('ember-lash'), uid: 'l' };
  g.player.hand = [lash];
  g.player.ember = 5;
  playCard(g, g.player, g.opponent, lash);
  assert.equal(isGameOver(g), true);
  assert.equal(g.winner, 'player');
});

check('AI picks a lethal card when it has one', () => {
  const g = createGame(seeded);
  g.player.life = 3;
  const lash = { ...cardById('ember-lash'), uid: 'l' };
  const guard = { ...cardById('briar-guard'), uid: 'g' };
  g.opponent.hand = [guard, lash];
  g.opponent.ember = 5;
  assert.equal(chooseAiCard(g).id, 'ember-lash');
});

check('drawing from an empty deck reshuffles the discard pile', () => {
  const g = createGame(seeded);
  g.player.deck = [];
  g.player.discard = [{ ...cardById('cinder-strike'), uid: 'x' }];
  drawCards(g, g.player, 1);
  assert.equal(g.player.hand.length, 5);
  assert.equal(g.player.deck.length, 0);
});

check('canPlayCard respects phase and ember', () => {
  const g = createGame(seeded);
  const fire = { ...cardById('wildfire'), uid: 'w' };
  assert.equal(canPlayCard(g, g.player, fire), false); // 3 ember < 4 cost
  g.player.ember = 5;
  assert.equal(canPlayCard(g, g.player, fire), true);
});

console.log(`\n${passed} logic tests passed`);
