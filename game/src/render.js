// Ember Duel — renders the table into the DOM: hands, life bars, log,
// the cards played this turn, and the win / loss overlays.

import { SUITS, MAX_LIFE } from './cards.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderCardFace(card, { keyHint = '', playable = false, affordable = true } = {}) {
  const suit = SUITS[card.suit];
  const node = el('article', `card suit-${card.suit}${playable ? ' playable' : ''}${affordable ? '' : ' unaffordable'}`);
  node.dataset.uid = card.uid;
  node.appendChild(el('span', 'cost', String(card.cost)));
  node.appendChild(el('div', 'suit-glyph', suit.glyph));
  node.appendChild(el('div', 'card-name', card.name));
  node.appendChild(el('div', 'card-value', String(card.value)));
  node.appendChild(el('div', 'card-kind', `${suit.label} · ${card.kind}`));
  node.appendChild(el('div', 'card-text', card.text));
  if (keyHint) node.appendChild(el('span', 'card-key', keyHint));
  return node;
}

export function renderCardBack() {
  const node = el('article', 'card face-down');
  node.appendChild(el('div', 'back-mark', '◆'));
  return node;
}

function setLife(fillId, textId, fighter) {
  const fill = document.getElementById(fillId);
  const text = document.getElementById(textId);
  if (fill) fill.style.width = `${Math.max(0, (fighter.life / MAX_LIFE) * 100)}%`;
  if (text) text.textContent = `${fighter.life} / ${MAX_LIFE}`;
}

function setStat(id, text) {
  const node = document.getElementById(id);
  if (node) node.textContent = text;
}

export function renderGame(game, playedThisTurn) {
  const { player, opponent } = game;

  setLife('playerLifeFill', 'playerLifeText', player);
  setLife('opponentLifeFill', 'opponentLifeText', opponent);
  setStat('playerShield', `🛡 Shield ${player.shield}`);
  setStat('opponentShield', `🛡 Shield ${opponent.shield}`);
  setStat('playerEmber', `◆ Ember ${player.ember} / ${player.maxEmber}`);
  setStat('opponentEmber', `◆ Ember ${opponent.ember} / ${opponent.maxEmber}`);
  setStat('playerDeck', `🂠 Deck ${player.deck.length}`);
  setStat('opponentDeck', `🂠 Deck ${opponent.deck.length}`);

  const scoreLine = document.getElementById('scoreLine');
  if (scoreLine) {
    scoreLine.textContent = `Duels won ${window.__emberDuelsWon ?? 0} · Damage dealt ${game.damageDealtByPlayer} · Turn ${game.turn}`;
  }

  const banner = document.getElementById('turnBanner');
  if (banner) {
    banner.textContent = game.winner
      ? (game.winner === 'player' ? '🏆 Victory!' : '💀 Defeat')
      : (game.phase === 'player' ? 'Your turn — play a card' : 'Bramble is thinking…');
    banner.classList.toggle('foe-turn', game.phase === 'opponent');
  }

  const foeHand = document.getElementById('opponentHand');
  foeHand.replaceChildren();
  for (const _card of opponent.hand) foeHand.appendChild(renderCardBack());

  const yourHand = document.getElementById('playerHand');
  yourHand.replaceChildren();
  player.hand.forEach((card, index) => {
    const affordable = player.ember >= card.cost;
    const node = renderCardFace(card, {
      keyHint: String(index + 1),
      playable: game.phase === 'player' && affordable,
      affordable,
    });
    node.addEventListener('click', () => window.__emberPlayCard?.(index));
    yourHand.appendChild(node);
  });

  const playedArea = document.getElementById('playedArea');
  playedArea.replaceChildren();
  if (playedThisTurn.length === 0) {
    playedArea.appendChild(el('span', 'empty-note', 'Cards played this turn appear here'));
  } else {
    for (const card of playedThisTurn.slice(-4)) {
      const node = renderCardFace(card);
      node.classList.add('played');
      playedArea.appendChild(node);
    }
  }

  const logPanel = document.getElementById('logPanel');
  logPanel.replaceChildren();
  for (const entry of game.log.slice(-6)) {
    logPanel.appendChild(el('div', `log-${entry.kind}`, entry.text));
  }
  logPanel.scrollTop = logPanel.scrollHeight;

  const endTurnBtn = document.getElementById('endTurnBtn');
  if (endTurnBtn) endTurnBtn.disabled = game.phase !== 'player' || !!game.winner;

  const status = document.getElementById('status');
  if (status) {
    status.textContent = game.winner
      ? (game.winner === 'player' ? 'Victory. Bramble is defeated.' : 'Defeat. Bramble wins the duel.')
      : `Your life ${player.life}, Bramble's life ${opponent.life}. Turn ${game.turn}.`;
  }
}

export function showEndScreen(game, duelsWon) {
  const screen = document.getElementById('endScreen');
  const title = document.getElementById('endTitle');
  const text = document.getElementById('endText');
  const stats = document.getElementById('endStats');
  const won = game.winner === 'player';
  title.textContent = won ? '🏆 VICTORY!' : '💀 DEFEAT';
  title.classList.toggle('lost', !won);
  text.textContent = won
    ? 'Bramble the Thorn Warden falls — the ember is yours!'
    : 'Your ember fades — Bramble keeps the table. Duel again?';
  stats.textContent = `Turns played: ${game.turn} · Damage you dealt: ${game.damageDealtByPlayer} · `
    + `Cards you played: ${game.cardsPlayedByPlayer} · Duels won: ${duelsWon}`;
  screen.classList.remove('hidden');
}

export function hideEndScreen() {
  document.getElementById('endScreen').classList.add('hidden');
}

export function showTitleScreen() {
  document.getElementById('titleScreen').classList.remove('hidden');
}

export function hideTitleScreen() {
  document.getElementById('titleScreen').classList.add('hidden');
}
