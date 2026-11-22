// Ember Duel — keyboard and button input. Mouse clicks are wired in render.js.

export function bindInput(actions) {
  document.getElementById('startBtn').addEventListener('click', actions.startDuel);
  document.getElementById('againBtn').addEventListener('click', actions.startDuel);
  document.getElementById('endTurnBtn').addEventListener('click', actions.endTurn);
  document.getElementById('newDuelBtn').addEventListener('click', actions.startDuel);
  document.getElementById('helpBtn').addEventListener('click', actions.showHelp);
  document.getElementById('closeHelpBtn').addEventListener('click', actions.hideHelp);

  document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key >= '1' && key <= '9') {
      actions.playCardByIndex(Number(key) - 1);
    } else if (key === 'enter') {
      actions.endTurn();
    } else if (key === 'n') {
      actions.startDuel();
    } else if (key === 'r') {
      actions.startDuel();
    } else if (key === 'h') {
      actions.showHelp();
    } else if (key === 'escape') {
      actions.hideHelp();
    }
  });
}
