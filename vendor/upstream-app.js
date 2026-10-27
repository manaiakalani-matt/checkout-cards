const STORAGE_KEY = "flashcards.v1";

const starterCards = [
  { front: "HTTP", back: "Hypertext Transfer Protocol — how browsers talk to servers." },
  { front: "Git", back: "A version control system for tracking changes in files." },
  { front: "CSS", back: "Cascading Style Sheets — language for styling web pages." },
];

const els = {
  progress: document.getElementById("progress"),
  card: document.getElementById("card"),
  cardText: document.getElementById("card-text"),
  cardTextBack: document.getElementById("card-text-back"),
  prev: document.getElementById("prev"),
  next: document.getElementById("next"),
  form: document.getElementById("add-form"),
  front: document.getElementById("front"),
  back: document.getElementById("back"),
  delete: document.getElementById("delete"),
};

let cards = loadCards();
let index = 0;
let showingBack = false;

function loadCards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...starterCards];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [...starterCards];
  } catch {
    return [...starterCards];
  }
}

function saveCards() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function render() {
  if (!cards.length) {
    els.progress.textContent = "0 / 0";
    els.cardText.textContent = "No cards yet. Add one below.";
    if (els.cardTextBack) els.cardTextBack.textContent = "";
    els.card.classList.remove("is-flipped");
    return;
  }

  index = (index + cards.length) % cards.length;
  const card = cards[index];
  els.progress.textContent = `${index + 1} / ${cards.length}`;
  els.cardText.textContent = showingBack ? card.back : card.front;
  if (els.cardTextBack) els.cardTextBack.textContent = card.back;
  els.card.classList.toggle("is-flipped", showingBack);
}

function flipCard() {
  if (!cards.length) return;
  showingBack = !showingBack;
  render();
}

function nextCard() {
  if (!cards.length) return;
  index += 1;
  showingBack = false;
  render();
}

function prevCard() {
  if (!cards.length) return;
  index -= 1;
  showingBack = false;
  render();
}

els.card.addEventListener("click", flipCard);
els.prev.addEventListener("click", prevCard);
els.next.addEventListener("click", nextCard);

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const front = els.front.value.trim();
  const back = els.back.value.trim();
  if (!front || !back) return;
  cards.push({ front, back });
  index = cards.length - 1;
  showingBack = false;
  saveCards();
  els.form.reset();
  render();
});

els.delete.addEventListener("click", () => {
  if (!cards.length) return;
  cards.splice(index, 1);
  showingBack = false;
  saveCards();
  render();
});

window.addEventListener("keydown", (event) => {
  const target = event.target;
  const isInput = target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT");
  if (isInput) return; // Do not intercept when typing in form textareas

  if (event.code === "Space") {
    event.preventDefault();
    flipCard();
  } else if (event.code === "ArrowRight") {
    event.preventDefault();
    nextCard();
  } else if (event.code === "ArrowLeft") {
    event.preventDefault();
    prevCard();
  }
});

render();
