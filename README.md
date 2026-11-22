# 🔥 Ember Duel

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/e0426685-cloud/best-card-game-20261122-1826-entry/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/e0426685-cloud/best-card-game-20261122-1826-entry/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An original card battler built for the **make.fun "Make the best card game"** bounty
(`best-card-game-20261122-1826`).

## The game

You are the Ember Knight. Bramble the Thorn Warden holds the other side of the
table. Each of you has **30 life** and a deck of 24 cards in four original suits:

| Suit | Glyph | Does |
|------|-------|------|
| Flame | ▲ | Damage |
| Tide | ● | Healing |
| Thorn | ◆ | Shield |
| Stone | ■ | Ember |

Each turn you gain ember (up to 10) and draw a card. Spend ember to play cards:
damage hits the enemy's shield first, then life. Play two cards of the same suit
in one turn and they **resonate** for +2 power. Reduce Bramble to 0 life before
yours runs out.

Bramble plays after you end your turn — it finishes you when it can, shields up
when hurt, and otherwise spends its ember on its biggest cards. Its plan is
readable, so you can counter it.

## Play

- Serve `game/` with any static server (`node serve.ts` → http://localhost:8080),
  or open `game/index.html` directly.
- Mouse: click a card to play it, click **End Turn** to pass.
- Keyboard: `1–5` play a card, `Enter` ends the turn, `N` new duel, `H` help.

## Layout

- `game/index.html` — the table
- `game/styles.css` — table, cards, overlays
- `game/src/cards.js` — the card catalogue and deck builder
- `game/src/state.js` — game state, turns, card resolution (pure rules)
- `game/src/ai.js` — Bramble's decisions
- `game/src/render.js` — DOM rendering
- `game/src/input.js` — mouse + keyboard input
- `game/src/shots.js` — deterministic `?shot=` states for screenshots
- `game/src/main.js` — bootstrap
- `main.ts` — the entry program: copies `game/` + `screenshots/` to `/output`
  and writes `dossier.json`
- `screenshots/` — real renders of the game's own code

## License

MIT — see [LICENSE](LICENSE).
