// Spreads n items over the screen in a jittered grid, returning percentages.
// padX / padY keep a margin (in percent) free at the edges.
export const scatter = (n, { padX = 0, padY = 0 } = {}) => {
  const aspect = (window.innerWidth * (100 - 2 * padX)) / (window.innerHeight * (100 - 2 * padY));
  const cols = Math.max(1, Math.round(Math.sqrt(n * aspect * 0.6)));
  const rows = Math.ceil(n / cols);
  const cells = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols);
    // center the last, possibly incomplete row
    const inRow = row === rows - 1 ? n - row * cols : cols;
    const col = i % cols;
    cells.push({
      x: ((col + 0.5 + (cols - inRow) / 2) / cols) * 100 + (Math.random() - 0.5) * (40 / cols),
      y: ((row + 0.5) / rows) * 100 + (Math.random() - 0.5) * (30 / rows),
      rotate: (Math.random() - 0.5) * 14,
    });
  }
  const scale = (v, pad) => pad + (v * (100 - 2 * pad)) / 100;
  return {
    cells: cells.map((c) => ({ ...c, x: scale(c.x, padX), y: scale(c.y, padY) })),
    cols,
    rows,
    padX,
    padY,
  };
};

export const pickIndexOf = (items, value) => {
  const matches = items.flatMap((item, i) => (item === value ? [i] : []));
  return matches[Math.floor(Math.random() * matches.length)];
};

export const randomItem = (items) => items[Math.floor(Math.random() * items.length)];
