// Interaktive Technik-Karten & Checklisten – Filmwerkstatt Sonderwoche

// Einfache Checkliste mit Begründung beim Antippen (z. B. für Selbstchecks).
// items: [{ id, text, why }]
export function renderChecklist(container, items, onChange) {
  if (!container) return { isAllChecked: () => false };

  container.innerHTML = "";
  const state = {};

  items.forEach((item) => {
    state[item.id] = false;

    const li = document.createElement("li");
    li.dataset.itemId = item.id;
    li.innerHTML = `
      <input type="checkbox" id="chk-${item.id}" aria-describedby="why-${item.id}">
      <span class="checklist-item__text">
        <label for="chk-${item.id}" style="margin:0; font-weight:600; cursor:pointer;">${item.text}</label>
        ${item.why ? `<div class="checklist-explain" id="why-${item.id}">💡 ${item.why}</div>` : ""}
      </span>
    `;
    container.appendChild(li);

    const checkbox = li.querySelector("input[type=checkbox]");
    const explain = li.querySelector(".checklist-explain");

    function toggle() {
      checkbox.checked = !checkbox.checked;
      apply();
    }
    function apply() {
      state[item.id] = checkbox.checked;
      li.classList.toggle("is-checked", checkbox.checked);
      if (explain) explain.classList.add("is-visible");
      fireChange();
    }

    checkbox.addEventListener("click", (e) => {
      e.stopPropagation();
      apply();
    });
    li.addEventListener("click", (e) => {
      if (e.target === checkbox) return;
      toggle();
    });
  });

  function fireChange() {
    const checkedCount = Object.values(state).filter(Boolean).length;
    const allChecked = checkedCount === items.length;
    if (typeof onChange === "function") onChange(allChecked, checkedCount, items.length);
  }

  return {
    isAllChecked: () => Object.values(state).filter(Boolean).length === items.length,
    getCheckedCount: () => Object.values(state).filter(Boolean).length,
  };
}

// Technik-Karten mit iPhone-/Android-Tabs und einer kurzen Verständnisfrage je
// Technik. Eine Karte gilt erst als "erledigt", wenn die Frage beantwortet wurde
// (nicht schon beim blossen Anklicken) – so bewirkt das Abhaken tatsächlich etwas.
// items: [{ id, title, why, iphone?, android?, universal?, check: { frage, optionen, loesung, erklaerung } }]
export function renderTechniqueCards(container, items, onProgress) {
  if (!container) return;
  container.innerHTML = "";
  const answered = new Set();

  items.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "tech-card";

    const platformHtml = item.universal
      ? `<div class="tech-card__universal">${item.universal}</div>`
      : `
        <div class="tech-card__tabs" role="tablist">
          <button type="button" class="tech-card__tab is-active" data-platform="iphone">📱 iPhone</button>
          <button type="button" class="tech-card__tab" data-platform="android">🤖 Android</button>
        </div>
        <div class="tech-card__platform" data-platform-content="iphone">${item.iphone}</div>
        <div class="tech-card__platform" data-platform-content="android" hidden>${item.android}</div>
      `;

    card.innerHTML = `
      <div class="tech-card__header">
        <span class="tech-card__num">${idx + 1}</span>
        <h3 class="mb-0">${item.title}</h3>
        <span class="tech-card__status" data-role="status">○</span>
      </div>
      <p class="text-muted">${item.why}</p>
      ${platformHtml}
      <div class="tech-card__check">
        <p class="mb-0" style="font-weight:600;">${item.check.frage}</p>
        <div class="tree-options" style="margin-top:0.6rem;">
          ${item.check.optionen.map((o, i) => `<button type="button" class="tree-option-btn" data-idx="${i}">${o}</button>`).join("")}
        </div>
        <div class="exercise-feedback" data-role="feedback"></div>
      </div>
    `;
    container.appendChild(card);

    if (!item.universal) {
      const tabs = card.querySelectorAll(".tech-card__tab");
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          tabs.forEach((t) => t.classList.remove("is-active"));
          tab.classList.add("is-active");
          card.querySelectorAll("[data-platform-content]").forEach((el) => {
            el.hidden = el.dataset.platformContent !== tab.dataset.platform;
          });
        });
      });
    }

    const buttons = card.querySelectorAll(".tech-card__check [data-idx]");
    const feedback = card.querySelector('[data-role="feedback"]');
    const status = card.querySelector('[data-role="status"]');
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        buttons.forEach((b) => (b.disabled = true));
        const correct = Number(btn.dataset.idx) === item.check.loesung;
        feedback.className = "exercise-feedback is-visible " + (correct ? "is-correct" : "is-incorrect");
        feedback.innerHTML = `<strong>${correct ? "Genau!" : "Nicht ganz."}</strong> ${item.check.erklaerung}`;
        card.classList.add("is-done");
        status.textContent = "✅";
        answered.add(item.id);
        if (typeof onProgress === "function") onProgress(answered.size, items.length);
      });
    });
  });
}
