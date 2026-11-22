// Ember Duel — the card catalogue and the deck builder.
// Four original suits, each with its own shape and colour:
//   flame ▲ (damage), tide ● (healing), thorn ◆ (shield), stone ■ (ember).

export const SUITS = {
  flame: { glyph: '▲', label: 'Flame', verb: 'damage' },
  tide: { glyph: '●', label: 'Tide', verb: 'healing' },
  thorn: { glyph: '◆', label: 'Thorn', verb: 'shield' },
  stone: { glyph: '■', label: 'Stone', verb: 'ember' },
};

// One entry per unique card. kind is what the card does; value is its base number.
export const CARD_CATALOGUE = [
  { id: 'cinder-strike', name: 'Cinder Strike', suit: 'flame', kind: 'damage', cost: 2, value: 5, text: 'Deal 5 damage.' },
  { id: 'wildfire', name: 'Wildfire', suit: 'flame', kind: 'damage', cost: 4, value: 9, text: 'Deal 9 damage.' },
  { id: 'ember-lash', name: 'Ember Lash', suit: 'flame', kind: 'damage', cost: 1, value: 3, text: 'Deal 3 damage.' },
  { id: 'tide-mend', name: 'Tide Mend', suit: 'tide', kind: 'heal', cost: 2, value: 6, text: 'Restore 6 life.' },
  { id: 'still-waters', name: 'Still Waters', suit: 'tide', kind: 'heal-draw', cost: 1, value: 3, text: 'Restore 3 life, draw 1 card.' },
  { id: 'riptide', name: 'Riptide', suit: 'tide', kind: 'drain', cost: 3, value: 4, text: 'Deal 4 damage, restore 3 life.' },
  { id: 'briar-guard', name: 'Briar Guard', suit: 'thorn', kind: 'shield', cost: 2, value: 6, text: 'Gain 6 shield.' },
  { id: 'thorn-whip', name: 'Thorn Whip', suit: 'thorn', kind: 'damage-shield', cost: 2, value: 4, text: 'Deal 4 damage, gain 2 shield.' },
  { id: 'root-bind', name: 'Root Bind', suit: 'thorn', kind: 'shield-draw', cost: 1, value: 3, text: 'Gain 3 shield, draw 1 card.' },
  { id: 'stone-hoard', name: 'Stone Hoard', suit: 'stone', kind: 'ember', cost: 1, value: 3, text: 'Gain 3 ember.' },
  { id: 'granite-wall', name: 'Granite Wall', suit: 'stone', kind: 'shield', cost: 3, value: 9, text: 'Gain 9 shield.' },
  { id: 'quake-slam', name: 'Quake Slam', suit: 'stone', kind: 'damage', cost: 4, value: 8, text: 'Deal 8 damage.' },
];

export const MAX_LIFE = 30;
export const START_HAND = 4;
export const MAX_EMBER = 10;
export const RESONANCE_BONUS = 2;

export function buildDeck() {
  const deck = [];
  for (const card of CARD_CATALOGUE) {
    deck.push({ ...card, uid: card.id + '-a' });
    deck.push({ ...card, uid: card.id + '-b' });
  }
  return deck;
}

export function shuffleDeck(deck, random = Math.random) {
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function cardById(id) {
  return CARD_CATALOGUE.find((card) => card.id === id) ?? null;
}
