// Wiederverwendbare, interaktive Checkliste – Filmwerkstatt Sonderwoche
// Jeder Punkt kann angeklickt/angetippt werden, zeigt dabei eine kurze
// Begründung ("Warum ist das wichtig?") und lässt sich an-/abhaken.

// Rendert eine Checkliste in `container` (ul-Element).
// items: [{ id, text, why }]
// onChange(allChecked, checkedCount, total) wird bei jeder Änderung aufgerufen.
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
        <div class="checklist-explain" id="why-${item.id}">💡 ${item.why}</div>
      </span>
    `;
    container.appendChild(li);

    const checkbox = li.querySelector("input[type=checkbox]");
    const explain = li.querySelector(".checklist-explain");

    function toggle() {
      checkbox.checked = !checkbox.checked;
      state[item.id] = checkbox.checked;
      li.classList.toggle("is-checked", checkbox.checked);
      explain.classList.add("is-visible");
      fireChange();
    }

    checkbox.addEventListener("click", (e) => {
      e.stopPropagation();
      state[item.id] = checkbox.checked;
      li.classList.toggle("is-checked", checkbox.checked);
      explain.classList.add("is-visible");
      fireChange();
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
