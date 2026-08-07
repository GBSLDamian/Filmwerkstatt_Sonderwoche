// Drehplan-Tool (Shot-List-Builder) – Filmwerkstatt Sonderwoche
// Ersetzt die alten Countdown-Challenges: Lernende planen echte Einstellungen für
// ihre Mini-Produktion, bevor sie draussen mit der eigenen Handykamera filmen.
// Kein Backend nötig – alles läuft lokal, Plan wird in localStorage gespeichert.

const STORAGE_KEY = "fws_modul3_shotlist";

const EINSTELLUNGSGROESSEN = ["Totale", "Halbtotale", "Halbnah", "Nah", "Grossaufnahme", "Detail"];
const PERSPEKTIVEN = ["Vogelperspektive", "Augenhöhe", "Froschperspektive"];

function loadShots() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

function saveShots(shots) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shots));
  } catch (e) {}
}

let idCounter = 0;

// container: Element für die Shot-Liste
// statsEl: Element für die Live-Statistik ("3 Einstellungsgrössen, 2 Perspektiven")
// onChange(shots, meetsRequirement): Callback bei jeder Änderung
export function initShotlistBuilder({ container, statsEl, addBtn, onChange }) {
  let shots = loadShots();
  if (shots.length === 0) {
    shots = [{ id: idCounter++, groesse: "Totale", perspektive: "Augenhöhe", beschreibung: "" }];
  } else {
    idCounter = Math.max(...shots.map((s) => s.id), -1) + 1;
  }

  function render() {
    container.innerHTML = "";
    shots.forEach((shot, i) => {
      const row = document.createElement("div");
      row.className = "shot-row";
      row.innerHTML = `
        <div class="shot-row__num">${i + 1}</div>
        <div class="shot-row__fields">
          <select data-field="groesse" aria-label="Einstellungsgrösse">
            ${EINSTELLUNGSGROESSEN.map((g) => `<option ${g === shot.groesse ? "selected" : ""}>${g}</option>`).join("")}
          </select>
          <select data-field="perspektive" aria-label="Perspektive">
            ${PERSPEKTIVEN.map((p) => `<option ${p === shot.perspektive ? "selected" : ""}>${p}</option>`).join("")}
          </select>
          <input type="text" data-field="beschreibung" placeholder="Was ist im Bild? (z. B. Landschaft durchs Zugfenster)" value="${(shot.beschreibung || "").replace(/"/g, "&quot;")}">
        </div>
        <button type="button" class="shot-row__remove" aria-label="Shot entfernen" ${shots.length <= 1 ? "disabled" : ""}>✕</button>
      `;
      container.appendChild(row);

      row.querySelectorAll("[data-field]").forEach((el) => {
        el.addEventListener("input", () => {
          shot[el.dataset.field] = el.value;
          persist();
        });
      });
      row.querySelector(".shot-row__remove").addEventListener("click", () => {
        shots = shots.filter((s) => s.id !== shot.id);
        persist();
        render();
      });
    });
    updateStats();
  }

  function updateStats() {
    const groessen = new Set(shots.map((s) => s.groesse));
    const perspektiven = new Set(shots.map((s) => s.perspektive));
    const beschrieben = shots.filter((s) => (s.beschreibung || "").trim().length > 2).length;
    const meetsRequirement = shots.length >= 5 && groessen.size >= 3 && perspektiven.size >= 2 && beschrieben === shots.length;

    statsEl.innerHTML = `
      <div class="shot-stats__row">
        <span>${shots.length} Shots geplant</span>
        <span>${groessen.size} von 6 Einstellungsgrössen genutzt</span>
        <span>${perspektiven.size} von 3 Perspektiven genutzt</span>
      </div>
      ${
        meetsRequirement
          ? '<div class="exercise-feedback is-visible is-correct">Guter, abwechslungsreicher Drehplan – bereit zum Filmen!</div>'
          : `<div class="exercise-feedback is-visible is-neutral">Ziel: mind. 5 Shots, mind. 3 verschiedene Einstellungsgrössen, mind. 2 verschiedene Perspektiven, jeder Shot kurz beschrieben.</div>`
      }
    `;

    if (typeof onChange === "function") onChange(shots, meetsRequirement);
  }

  function persist() {
    saveShots(shots);
    updateStats();
  }

  addBtn.addEventListener("click", () => {
    shots.push({ id: idCounter++, groesse: "Nah", perspektive: "Augenhöhe", beschreibung: "" });
    persist();
    render();
  });

  render();
  return {
    getShots: () => shots,
  };
}
