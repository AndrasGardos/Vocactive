import { memo, useEffect, useMemo, useState } from "react";
import { sounds } from "../sound";
import "./flap.css";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÖŐÚÜŰ0123456789";
const TICK_MS = 65;
const MAX_COLS = 14;
const MAX_ROWS = 3;

const upper = (text) => text.toLocaleUpperCase("hu");

// wraps a name into board rows at word boundaries
const wrap = (name, cols) => {
  const rows = [];
  let line = "";
  for (const word of upper(name).split(/\s+/)) {
    for (let w = word; w; w = w.slice(cols)) {
      const piece = w.slice(0, cols);
      if (!line) line = piece;
      else if (line.length + 1 + piece.length <= cols) line += " " + piece;
      else {
        rows.push(line);
        line = piece;
      }
    }
  }
  if (line) rows.push(line);
  return rows;
};

const toGrid = (text, cols, rows) => {
  const lines = wrap(text, cols).slice(0, rows);
  const top = Math.floor((rows - lines.length) / 2);
  return Array.from({ length: rows }, (_, r) => {
    const line = lines[r - top] ?? "";
    const pad = Math.floor((cols - line.length) / 2);
    return Array.from({ length: cols }, (_, c) => line[c - pad] ?? " ");
  });
};

const Tile = memo(function Tile({ char }) {
  const [prev, setPrev] = useState(char);
  const [shown, setShown] = useState(char);
  // remember the character being flipped away (adjusting state during render)
  if (char !== shown) {
    setPrev(shown);
    setShown(char);
  }
  return (
    <div className="flap-tile">
      <div className="flap-half top">
        <span>{char}</span>
      </div>
      <div className="flap-half bottom">
        <span>{prev}</span>
      </div>
      {prev !== char && (
        <div key={char + prev} className="flap-leaf">
          <div className="flap-half top">
            <span>{prev}</span>
          </div>
          <div className="flap-half bottom">
            <span>{char}</span>
          </div>
        </div>
      )}
    </div>
  );
});

const clock = () =>
  new Date().toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" });

export default function FlapBoard({ members, draw, onSettled }) {
  const { cols, rows } = useMemo(() => {
    const longestWord = Math.max(...members.flatMap((m) => m.split(/\s+/).map((w) => w.length)), 8);
    const c = Math.min(MAX_COLS, Math.max(longestWord, 10));
    const r = Math.min(MAX_ROWS, Math.max(...members.map((m) => wrap(m, c).length)));
    return { cols: c, rows: r };
  }, [members]);

  const [grid, setGrid] = useState(() => toGrid("VOCACTIVE", cols, rows));
  const [doneId, setDoneId] = useState(null);
  const done = draw !== null && doneId === draw.id;
  const [time, setTime] = useState(clock);

  useEffect(() => {
    if (!draw) return;
    const target = toGrid(draw.name, cols, rows);
    // every tile spins a while; tiles further right/down settle later
    const remaining = target.map((line, r) =>
      line.map((_, c) => 8 + c * 2 + r * 4 + Math.floor(Math.random() * 4))
    );
    let first = true;
    const timer = setInterval(() => {
      if (first) setTime(clock());
      first = false;
      let moving = 0;
      setGrid(
        target.map((line, r) =>
          line.map((char, c) => {
            const left = --remaining[r][c];
            if (left > 0) {
              moving++;
              return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
            }
            return char;
          })
        )
      );
      if (moving > 0) {
        sounds.flap();
      } else {
        clearInterval(timer);
        setDoneId(draw.id);
        sounds.clunk();
        onSettled(draw.id);
      }
    }, TICK_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw?.id]);

  const tileSize = `min(${88 / cols}vw, ${52 / rows}vh)`;

  return (
    <div className={`flap-stage ${done ? "done" : ""}`} style={{ "--tile": tileSize }}>
      <div className="flap-header">
        <span className="flap-sign">✈ INDULÁS</span>
        <span className="flap-clock">{time}</span>
      </div>
      <div className="flap-board">
        {grid.map((line, r) => (
          <div key={r} className="flap-row">
            {line.map((char, c) => (
              <Tile key={c} char={char} />
            ))}
          </div>
        ))}
      </div>
      <div className="flap-footer">
        <span className="flap-status">{done ? "BESZÁLLÁS" : draw ? "KÉSÉS..." : "VÁRAKOZÁS"}</span>
        <span>KAPU {draw ? (draw.id % 12) + 1 : "-"}</span>
      </div>
    </div>
  );
}
