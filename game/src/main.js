// Ember Duel — bootstrap: owns the game object, wires input to the rules,
// runs Bramble's turn, and applies ?shot= states for screenshots.

import { createGame, playCard, endPlayerTurn, startPlayerTurn, startOpponentTurn } from './state.js';
import { runOpponentTurn } from './ai.js';
import {
  renderGame, showEndScreen, hideEndScreen, showTitleScreen, hideTitleScreen,
} from './render.js';
import { bindInput } from './input.js';
import { applyShotState } from './shots.js';

let game = createGame();
let playedThisTurn = [];
let duelsWon = 0;
let aiRunning = false;
let endCounted = false;

window.__emberDuelsWon = 0;

function refresh() {
  if (game.winner && !endCounted) {
    endCounted = true;
    if (game.winner === 'player') {
      duelsWon += 1;
      window.__emberDuelsWon = duelsWon;
    }
  }
  renderGame(game, playedThisTurn);
  if (game.winner) showEndScreen(game, duelsWon);
}

function playCardByIndex(index) {
  if (game.phase !== 'player' || game.winner || aiRunning) return;
  const card = game.player.hand[index];
  if (!card) return;
  if (game.player.ember < card.cost) return;
  if (playCard(game, game.player, game.opponent, card)) {
    playedThisTurn.push(card);
    refresh();
  }
}

window.__emberPlayCard = playCardByIndex;
window.__emberGame = () => game;

async function endTurn() {
  if (game.phase !== 'player' || game.winner || aiRunning) return;
  if (!endPlayerTurn(game)) return;
  playedThisTurn = [];
  refresh();
  aiRunning = true;
  startOpponentTurn(game);
  await runOpponentTurn(game, (card) => {
    playedThisTurn.push(card);
    refresh();
  });
  aiRunning = false;
  if (game.winner) {
    refresh();
    return;
  }
  startPlayerTurn(game);
  playedThisTurn = [];
  refresh();
}

function startDuel() {
  game = createGame();
  playedThisTurn = [];
  aiRunning = false;
  endCounted = false;
  hideEndScreen();
  hideTitleScreen();
  document.getElementById('helpScreen').classList.add('hidden');
  refresh();
}

bindInput({
  startDuel,
  endTurn,
  playCardByIndex,
  showHelp: () => document.getElementById('helpScreen').classList.remove('hidden'),
  hideHelp: () => document.getElementById('helpScreen').classList.add('hidden'),
});

// Screenshot states: ?shot=title shows the title screen, ?shot=table a mid-duel
// table, ?shot=win / ?shot=loss the end screens over a finished table.
const shot = new URLSearchParams(window.location.search).get('shot');
const shotState = applyShotState(game, shot);
if (shotState === 'table' || shotState === 'win' || shotState === 'loss') {
  hideTitleScreen();
} else {
  // No ?shot= (a real first visit) and ?shot=title both open on the title screen.
  showTitleScreen();
}
refresh();
