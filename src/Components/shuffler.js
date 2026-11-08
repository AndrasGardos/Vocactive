export const MODES = [
  {
    id: "random",
    title: "Teljesen véletlenszerű",
    description:
      "Minden húzás független a korábbiaktól: ugyanaz a diák akár többször " +
      "egymás után is sorra kerülhet.",
  },
  {
    id: "single-deck",
    title: "Egy pakli",
    description:
      "Mindenki pontosan egyszer kerül sorra, és csak akkor keverünk újra, " +
      "ha már mindenki sorra került.",
  },
  {
    id: "double-deck",
    title: "Dupla pakli",
    description:
      "Mintha minden diák neve két kártyán szerepelne: mindenki pontosan " +
      "kétszer kerül sorra, mielőtt újrakevernénk, de ugyanaz a diák soha " +
      "nem jön kétszer egymás után.",
  },
];

export const DEFAULT_MODE = "single-deck";

// A group with a single student (or mostly identical names) has no order
// without repeats, so after this many tries settle for the fewest repeats.
const MAX_SHUFFLES = 50;

const shuffle = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const countBackToBack = (deck, previous) =>
  deck.filter((card, i) => card === (i === 0 ? previous : deck[i - 1]))
    .length;

export default class Shuffler {
  constructor(items, mode = DEFAULT_MODE) {
    this.items = items;
    this.mode = mode;
    this.deck = this.buildDeck();
  }

  buildDeck(previous) {
    const cards =
      this.mode === "double-deck" ? [...this.items, ...this.items] : this.items;
    let best = shuffle(cards);
    let bestRepeats = countBackToBack(best, previous);
    for (let attempt = 1; attempt < MAX_SHUFFLES && bestRepeats > 0; attempt++) {
      const deck = shuffle(cards);
      const repeats = countBackToBack(deck, previous);
      if (repeats < bestRepeats) {
        best = deck;
        bestRepeats = repeats;
      }
    }
    return best;
  }

  next() {
    if (this.mode === "random") {
      return this.items[Math.floor(Math.random() * this.items.length)];
    }
    const item = this.deck.shift();
    if (this.deck.length === 0) {
      this.deck = this.buildDeck(item);
    }
    return item;
  }
}
