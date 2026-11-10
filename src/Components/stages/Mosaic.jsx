import { useEffect, useRef, useState } from "react";
import { sounds } from "../sound";
import "./mosaic.css";

const TILE_COLORS = ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#8338ec", "#ff8c42"];
const BACKGROUNDS = ["#fff3b0", "#caffbf", "#9bf6ff", "#ffc6ff", "#fdffb6", "#ffd6a5"];
const TILES = 40;
const COVER_MS = 600;

const shuffled = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const buildGrid = () => {
  const aspect = window.innerWidth / window.innerHeight;
  const cols = Math.max(4, Math.round(Math.sqrt(TILES * aspect)));
  const rows = Math.ceil(TILES / cols);
  return {
    cols,
    rows,
    tiles: Array.from({ length: cols * rows }, (_, i) => ({
      color: TILE_COLORS[(i * 7 + Math.floor(i / cols)) % TILE_COLORS.length],
      rot: Math.round((Math.random() - 0.5) * 120),
      dx: Math.round((Math.random() - 0.5) * 30),
    })),
  };
};

export default function Mosaic({ draw, skip, onSettled }) {
  const [grid] = useState(buildGrid);
  const count = grid.tiles.length;

  // tagged with the draw id, so a new draw starts with the wall fully covered
  const [fallen, setFallen] = useState({ id: null, set: new Set() });
  const [shown, setShown] = useState(null); // the name behind the wall
  const [doneId, setDoneId] = useState(null);
  const revealTimers = useRef([]);
  const gone = draw && fallen.id === draw.id ? fallen.set : null;
  const done = draw !== null && doneId === draw.id;

  useEffect(() => {
    if (!draw) return;
    const order = shuffled(grid.tiles.map((_, i) => i));
    const timers = (revealTimers.current = []);
    const drop = (index) =>
      setFallen((prev) => ({
        id: draw.id,
        set: new Set(prev.id === draw.id ? prev.set : []).add(index),
      }));
    // swap the name only once the wall has closed again
    timers.push(setTimeout(() => setShown({ name: draw.name, bg: BACKGROUNDS[draw.id % BACKGROUNDS.length] }), COVER_MS));
    let elapsed = COVER_MS + 500;
    order.forEach((index, k) => {
      // slow at first so the class can guess, faster towards the end
      elapsed += 300 - 230 * (k / count);
      timers.push(
        setTimeout(() => {
          drop(index);
          sounds.flap();
        }, elapsed)
      );
    });
    timers.push(
      setTimeout(() => {
        setDoneId(draw.id);
        sounds.fanfare();
        onSettled(draw.id);
      }, elapsed + 700)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw?.id]);

  // a click during the reveal drops every remaining tile at once
  useEffect(() => {
    if (!skip || !draw) return;
    revealTimers.current.forEach(clearTimeout);
    const timers = [];
    const showTimer = setTimeout(() => {
      setShown({ name: draw.name, bg: BACKGROUNDS[draw.id % BACKGROUNDS.length] });
      setFallen({ id: draw.id, set: new Set(grid.tiles.map((_, i) => i)) });
      sounds.pop();
    }, 0);
    timers.push(showTimer);
    timers.push(
      setTimeout(() => {
        setDoneId(draw.id);
        sounds.fanfare();
        onSettled(draw.id);
      }, 700)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  const name = shown?.name ?? "";

  return (
    <div className={`mosaic-stage ${done ? "done" : ""}`} style={{ background: shown?.bg ?? "#fff3b0" }}>
      <div className="mosaic-name" style={{ fontSize: `min(28vh, ${170 / Math.max(name.length, 3)}vw)` }}>
        {name}
      </div>
      <div
        className="mosaic-wall"
        style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)`, gridTemplateRows: `repeat(${grid.rows}, 1fr)` }}
      >
        {grid.tiles.map((tile, i) => (
          <div
            key={i}
            className={`mosaic-tile ${gone?.has(i) ? "fallen" : ""}`}
            style={{
              "--color": tile.color,
              "--rot": tile.rot + "deg",
              "--dx": tile.dx + "vw",
              "--delay": (i % grid.cols) * 25 + Math.floor(i / grid.cols) * 40 + "ms",
            }}
          >
            ?
          </div>
        ))}
      </div>
    </div>
  );
}
