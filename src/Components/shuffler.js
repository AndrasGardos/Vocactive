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
      "Mintha minden diák neve két kártyán szerepelne: mindenki legfeljebb " +
      "kétszer kerülhet sorra, és csak a pakli kifogyása után keverünk újra.",
  },
];

export const DEFAULT_MODE = "single-deck";

const shuffle = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export default class Shuffler {
  constructor(items, mode = DEFAULT_MODE) {
    this.items = items;
    this.mode = mode;
    this.deck = this.buildDeck();
  }

  buildDeck() {
    const cards =
      this.mode === "double-deck" ? [...this.items, ...this.items] : this.items;
    return shuffle(cards);
  }

  next() {
    if (this.mode === "random") {
      return this.items[Math.floor(Math.random() * this.items.length)];
    }
    const item = this.deck.shift();
    if (this.deck.length === 0) {
      this.deck = this.buildDeck();
      // avoid drawing the same name twice in a row across the reshuffle,
      // unless the deck has only one distinct name
      while (new Set(this.items).size > 1 && this.deck[0] === item) {
        this.deck = this.buildDeck();
      }
    }
    return item;
  }
}
