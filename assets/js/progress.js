// Fortschritts- und Freischaltungslogik – Filmwerkstatt Sonderwoche
// Speichert alles in localStorage (Prefix "fws_", damit es sich nicht mit den
// "bws_"-Keys des Schwesterprojekts Bildwerkstatt_Sonderwoche in die Quere kommt,
// falls beide Tools auf demselben Gerät genutzt werden).

export const MODULES = [
  { num: 1, title: "Technikabnahme", path: "module/01-aufnahmetechnik.html" },
  { num: 2, title: "Bildsprache drauf haben", path: "module/02-bildsprache.html" },
  { num: 3, title: "Die Zug-Challenge", path: "module/03-zug-challenge.html" },
  { num: 4, title: "Filmformate kombinieren", path: "module/04-filmformate.html" },
];

const SPICKZETTEL_PATH = "spickzettel.html";

const KEYS = {
  moduleStatus: (num) => `fws_modul${num}_status`,
  wunschformat: "fws_wunschformat",
};

export { KEYS };

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    /* localStorage evtl. nicht verfügbar (privater Modus) */
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {}
}

export function getModuleStatus(num) {
  return safeGet(KEYS.moduleStatus(num)) || "locked";
}

export function isModuleDone(num) {
  return getModuleStatus(num) === "done";
}

export function isModuleUnlocked(num) {
  if (num === 1) return true;
  return isModuleDone(num - 1);
}

export function markModuleDone(num) {
  safeSet(KEYS.moduleStatus(num), "done");
}

export function isSpickzettelUnlocked() {
  return MODULES.every((m) => isModuleDone(m.num));
}

export function saveWunschformat(formatId) {
  safeSet(KEYS.wunschformat, formatId);
}

export function getWunschformat() {
  return safeGet(KEYS.wunschformat) || "";
}

export function getOverallProgress() {
  let done = 0;
  const total = MODULES.length;
  MODULES.forEach((m) => {
    if (isModuleDone(m.num)) done += 1;
  });
  return { done, total, percent: Math.round((done / total) * 100) };
}

export function resetAllProgress() {
  MODULES.forEach((m) => safeRemove(KEYS.moduleStatus(m.num)));
  safeRemove(KEYS.wunschformat);
}

// ---------- UI-Helfer ----------

function pathPrefix() {
  const path = window.location.pathname;
  if (path.includes("/module/")) return "../";
  return "";
}

export function renderProgressBar(container, currentStepLabel) {
  if (!container) return;
  const { done, total, percent } = getOverallProgress();
  container.innerHTML = `
    <div class="progress-wrap__label">
      <span>${currentStepLabel}</span>
      <span>${done} / ${total} Module</span>
    </div>
    <div class="progress-bar"><div class="progress-bar__fill" style="width:${percent}%"></div></div>
  `;
}

export function renderModuleList(container) {
  if (!container) return;
  const prefix = pathPrefix();
  let html = "";
  MODULES.forEach((m) => {
    const unlocked = isModuleUnlocked(m.num);
    const done = isModuleDone(m.num);
    const statusIcon = done ? "✅" : unlocked ? "▶" : "🔒";
    const cls = ["module-item"];
    if (done) cls.push("is-done");
    if (!unlocked) cls.push("is-locked");
    const href = unlocked ? prefix + m.path : "#";
    const tag = unlocked ? "a" : "span";
    html += `
      <li>
        <${tag} class="${cls.join(" ")}" ${unlocked ? `href="${href}"` : 'aria-disabled="true"'}>
          <span class="module-item__num">${m.num}</span>
          <span class="module-item__body">
            <span class="module-item__title">${m.title}</span>
            <span class="module-item__meta">${done ? "Erledigt" : unlocked ? "Bereit zum Start" : "Erst nach vorherigem Modul freigeschaltet"}</span>
          </span>
          <span class="module-item__status" aria-hidden="true">${statusIcon}</span>
        </${tag}>
      </li>`;
  });

  const spUnlocked = isSpickzettelUnlocked();
  const spCls = ["module-item"];
  if (!spUnlocked) spCls.push("is-locked");
  const spHref = spUnlocked ? prefix + SPICKZETTEL_PATH : "#";
  const spTag = spUnlocked ? "a" : "span";
  html += `
    <li>
      <${spTag} class="${spCls.join(" ")}" ${spUnlocked ? `href="${spHref}"` : 'aria-disabled="true"'}>
        <span class="module-item__num">🎬</span>
        <span class="module-item__body">
          <span class="module-item__title">Spickzettel fürs Lager</span>
          <span class="module-item__meta">${spUnlocked ? "Bereit zum Anschauen/Drucken" : "Erst nach allen 4 Modulen freigeschaltet"}</span>
        </span>
        <span class="module-item__status" aria-hidden="true">${spUnlocked ? "▶" : "🔒"}</span>
      </${spTag}>
    </li>`;

  container.innerHTML = html;
}

export function setupResetButton(button) {
  if (!button) return;
  button.addEventListener("click", () => {
    const ok = window.confirm(
      "Willst du wirklich deinen gesamten Fortschritt löschen? Alle Module werden zurückgesetzt. Das kann nicht rückgängig gemacht werden."
    );
    if (!ok) return;
    resetAllProgress();
    const prefix = pathPrefix();
    window.location.href = prefix ? prefix + "index.html" : "index.html";
  });
}

export function enforceUnlock(kind, num) {
  const prefix = pathPrefix();
  let unlocked = true;
  if (kind === "module") unlocked = isModuleUnlocked(num);
  if (kind === "spickzettel") unlocked = isSpickzettelUnlocked();
  if (!unlocked) {
    window.location.href = prefix + "index.html";
  }
  return unlocked;
}

export function renderModuleNav(container, currentNum) {
  if (!container) return;
  const prefix = pathPrefix();
  const prevM = MODULES.find((m) => m.num === currentNum - 1);
  const nextM = MODULES.find((m) => m.num === currentNum + 1);
  let leftHtml = `<a class="btn btn--secondary" href="${prefix}index.html">← Übersicht</a>`;
  if (prevM) {
    leftHtml = `<a class="btn btn--secondary" href="${prefix}${prevM.path}">← Modul ${prevM.num}</a>`;
  }
  let rightHtml = "";
  if (nextM) {
    const unlocked = isModuleUnlocked(nextM.num);
    rightHtml = unlocked
      ? `<a class="btn" href="${prefix}${nextM.path}">Modul ${nextM.num} →</a>`
      : `<button class="btn is-disabled" disabled>Modul ${nextM.num} 🔒</button>`;
  } else {
    const spUnlocked = isSpickzettelUnlocked();
    rightHtml = spUnlocked
      ? `<a class="btn" href="${prefix}${SPICKZETTEL_PATH}">Zum Spickzettel →</a>`
      : `<button class="btn is-disabled" disabled>Spickzettel 🔒</button>`;
  }
  container.innerHTML = `${leftHtml}${rightHtml}`;
}
