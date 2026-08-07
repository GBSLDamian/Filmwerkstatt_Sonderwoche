// Zuordnungsspiel Filmformate – Filmwerkstatt Sonderwoche
// Lädt data/formate.json, lässt Format-Karten mit Merkmalskarten
// (Perspektive/Rhythmus/Musik) verbinden.

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function merkmalText(f) {
  return `${f.perspektive.split(",")[0].split(".")[0]} · ${f.rhythmus.split(",")[0].split(".")[0]} · ${f.musik.split(",")[0].split(".")[0]}`;
}

// container: { cardsEl, rulesEl, feedbackEl, onAllMatched(formate) }
export async function initFormatMatcher({ cardsEl, rulesEl, feedbackEl, onAllMatched }) {
  const res = await fetch("../data/formate.json");
  const data = await res.json();
  const formate = data.formate;

  let selectedCard = null;
  let matchedCount = 0;

  const shuffledCards = shuffle(formate);
  const shuffledRules = shuffle(formate);

  shuffledCards.forEach((f) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "memory-card";
    el.textContent = f.name;
    el.dataset.id = f.id;
    el.addEventListener("click", () => {
      if (el.classList.contains("is-matched")) return;
      cardsEl.querySelectorAll(".memory-card").forEach((c) => c.classList.remove("is-flipped"));
      el.classList.add("is-flipped");
      selectedCard = el;
    });
    cardsEl.appendChild(el);
  });

  shuffledRules.forEach((f) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "memory-card";
    el.textContent = merkmalText(f);
    el.dataset.id = f.id;
    el.addEventListener("click", () => {
      if (el.classList.contains("is-matched") || !selectedCard) return;
      const correct = selectedCard.dataset.id === f.id;
      if (correct) {
        selectedCard.classList.add("is-matched");
        selectedCard.classList.remove("is-flipped");
        el.classList.add("is-matched");
        matchedCount++;
        feedbackEl.className = "exercise-feedback is-visible is-correct";
        feedbackEl.innerHTML = `<strong>Richtig kombiniert:</strong> ${selectedCard.textContent} – ${f.zweck}`;
        selectedCard = null;
        if (matchedCount === formate.length && typeof onAllMatched === "function") {
          onAllMatched(formate);
        }
      } else {
        feedbackEl.className = "exercise-feedback is-visible is-incorrect";
        feedbackEl.innerHTML = "<strong>Das passt noch nicht zusammen.</strong> Versuch es nochmals.";
        if (selectedCard) selectedCard.classList.remove("is-flipped");
        selectedCard = null;
      }
    });
    rulesEl.appendChild(el);
  });

  return formate;
}
