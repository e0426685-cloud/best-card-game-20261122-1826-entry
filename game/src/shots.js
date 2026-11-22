// Ember Duel — deterministic screenshot states, driven by ?shot=.
// The game itself renders every state; this only deals the hands and
// life totals a photographer would want to show, so the screenshots are
// real renders of the game's own code.

import { addLog } from './state.js';

function findCard(game, id) {
  const fromHand = game.player.hand.find((card) => card.id === id);
  if (fromHand) return fromHand;
  const fromDeck = game.player.deck.find((card) => card.id === id);
  if (fromDeck) {
    game.player.hand.push(fromDeck);
    game.player.deck.splice(game.player.deck.indexOf(fromDeck), 1);
    return fromDeck;
  }
  return null;
}

function setHand(game, ids) {
  game.player.hand = [];
  for (const id of ids) findCard(game, id);
  while (game.player.hand.length < 5) {
    const spare = game.player.deck.pop();
    if (!spare) break;
    game.player.hand.push(spare);
  }
}

function setOpponentHand(game, count) {
  while (game.opponent.hand.length < count) {
    const spare = game.opponent.deck.pop();
    if (!spare) break;
    game.opponent.hand.push(spare);
  }
}

export function applyShotState(game, shot) {
  if (!shot) return null;
  if (shot === 'title') {
    return 'title';
  }
  if (shot === 'table') {
    game.player.life = 24;
    game.opponent.life = 18;
    game.opponent.shield = 4;
    game.player.ember = 6;
    game.player.maxEmber = 6;
    game.turn = 4;
    game.damageDealtByPlayer = 23;
    setHand(game, ['wildfire', 'briar-guard', 'tide-mend', 'quake-slam', 'stone-hoard']);
    setOpponentHand(game, 5);
    addLog(game, 'you', 'You play Cinder Strike — RESONANCE +2!');
    addLog(game, 'foe', 'Bramble plays Thorn Whip.');
    addLog(game, 'info', 'Turn 4: your ember refills to 6.');
    return 'table';
  }
  if (shot === 'win') {
    game.player.life = 11;
    game.opponent.life = 0;
    game.winner = 'player';
    game.phase = 'over';
    game.turn = 7;
    game.damageDealtByPlayer = 41;
    game.cardsPlayedByPlayer = 12;
    setHand(game, ['wildfire', 'tide-mend', 'briar-guard', 'ember-lash', 'root-bind']);
    setOpponentHand(game, 3);
    addLog(game, 'you', 'You play Wildfire — RESONANCE +2!');
    addLog(game, 'info', 'Bramble falls. The ember is yours!');
    return 'win';
  }
  if (shot === 'loss') {
    game.player.life = 0;
    game.opponent.life = 14;
    game.opponent.shield = 3;
    game.winner = 'opponent';
    game.phase = 'over';
    game.turn = 8;
    game.damageDealtByPlayer = 29;
    game.cardsPlayedByPlayer = 11;
    setHand(game, ['cinder-strike', 'tide-mend', 'granite-wall', 'ember-lash', 'still-waters']);
    setOpponentHand(game, 4);
    addLog(game, 'foe', 'Bramble plays Quake Slam.');
    addLog(game, 'info', 'Your ember fades. Bramble keeps the table.');
    return 'loss';
  }
  return null;
}

