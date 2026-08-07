// Countdown-Timer – Filmwerkstatt Sonderwoche
// Start/Pause/Reset, grosse gut lesbare Anzeige, Vibration bei Ablauf (falls verfügbar).

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Erstellt einen Timer in `container` (leeres div-Element).
// durationSeconds: Startzeit in Sekunden.
// onComplete(): wird aufgerufen, wenn der Timer abgelaufen ist.
export function createTimer(container, durationSeconds, onComplete) {
  if (!container) return null;

  let remaining = durationSeconds;
  let intervalId = null;
  let running = false;

  container.innerHTML = `
    <div class="timer">
      <div class="timer__display" aria-live="polite">${formatTime(remaining)}</div>
      <div class="timer__controls">
        <button type="button" class="btn" data-action="start">▶ Start</button>
        <button type="button" class="btn btn--secondary" data-action="pause">⏸ Pause</button>
        <button type="button" class="btn btn--secondary" data-action="reset">↺ Reset</button>
      </div>
    </div>
  `;

  const timerEl = container.querySelector(".timer");
  const display = container.querySelector(".timer__display");
  const startBtn = container.querySelector('[data-action="start"]');
  const pauseBtn = container.querySelector('[data-action="pause"]');
  const resetBtn = container.querySelector('[data-action="reset"]');

  function render() {
    display.textContent = formatTime(remaining);
  }

  function tick() {
    remaining -= 1;
    render();
    if (remaining <= 0) {
      stop();
      timerEl.classList.remove("is-running");
      timerEl.classList.add("is-done");
      display.textContent = "Los geht's!";
      if (navigator.vibrate) {
        try {
          navigator.vibrate([200, 100, 200]);
        } catch (e) {}
      }
      if (typeof onComplete === "function") onComplete();
    }
  }

  function start() {
    if (running || remaining <= 0) return;
    running = true;
    timerEl.classList.add("is-running");
    timerEl.classList.remove("is-done");
    intervalId = setInterval(tick, 1000);
  }

  function stop() {
    running = false;
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  }

  function reset() {
    stop();
    remaining = durationSeconds;
    timerEl.classList.remove("is-running", "is-done");
    render();
  }

  startBtn.addEventListener("click", start);
  pauseBtn.addEventListener("click", stop);
  resetBtn.addEventListener("click", reset);

  return { start, stop, reset };
}
