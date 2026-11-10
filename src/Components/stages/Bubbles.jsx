import { useEffect, useState } from "react";
import { pickIndexOf, scatter } from "../layout";
import { sounds } from "../sound";
import "./bubbles.css";

const COLORS = ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#1dd1a1", "#5f27cd", "#ff9f43", "#54a0ff"];
const POP_MS = 5500; // total time of the popping, the last pops are the slowest
const REFILL_MS = 900;
const NONE = new Set();

export default function Bubbles({ members, draw, onSettled }) {
  const n = members.length;
  const [bubbles] = useState(() => {
    const { cells, cols, rows } = scatter(n, { padX: 6, padY: 11 });
    return {
      size: Math.min(80 / cols, (72 / rows) * (window.innerHeight / window.innerWidth)),
      items: cells.map((cell, i) => ({
        ...cell,
        color: COLORS[i % COLORS.length],
        floatMs: 2500 + Math.random() * 2500,
        floatDelay: -Math.random() * 4000,
      })),
    };
  });
  // both are tagged with the draw id, so a new draw starts from a clean slate
  const [poppedState, setPopped] = useState({ id: null, set: new Set() });
  const [result, setResult] = useState(null);
  const popped = draw && poppedState.id === draw.id ? poppedState.set : NONE;
  const winner = draw && result?.id === draw.id ? result.index : null;

  useEffect(() => {
    if (!draw) return;
    const target = pickIndexOf(members, draw.name);
    const order = members
      .map((_, i) => i)
      .filter((i) => i !== target)
      .sort(() => Math.random() - 0.5);
    const timers = [];

    // pop k (0-based) happens when n - k bubbles are left; fewer left = longer wait
    const weights = order.map((_, k) => 1 / (n - k - 1) ** 1.3);
    const total = weights.reduce((a, b) => a + b, 0);
    let elapsed = REFILL_MS;
    order.forEach((index, k) => {
      elapsed += Math.max(40, (weights[k] / total) * POP_MS);
      timers.push(
        setTimeout(() => {
          setPopped((prev) => ({
            id: draw.id,
            set: new Set(prev.id === draw.id ? prev.set : []).add(index),
          }));
          sounds.pop();
        }, elapsed)
      );
    });
    timers.push(
      setTimeout(() => {
        setResult({ id: draw.id, index: target });
        sounds.fanfare();
        onSettled(draw.id);
      }, elapsed + 500)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw?.id]);

  const left = n - popped.size;

  return (
    <div className={`bubble-stage ${left <= 2 && draw ? "tense" : ""}`}>
      {members.map((name, i) => {
        const b = bubbles.items[i];
        const isWinner = winner === i;
        const size = isWinner ? 60 : bubbles.size;
        return (
          <div
            key={i}
            className={`bubble ${popped.has(i) ? "popped" : ""} ${isWinner ? "winner" : ""}`}
            style={{
              left: isWinner ? "50%" : b.x + "%",
              top: isWinner ? "50%" : b.y + "%",
              width: isWinner ? "min(60vw, 80vh)" : `${size}vw`,
              "--color": b.color,
              "--float-ms": b.floatMs + "ms",
              "--float-delay": b.floatDelay + "ms",
            }}
          >
            <div className="bubble-body">
              <span
                style={{
                  fontSize: isWinner
                    ? `min(${90 / Math.max(name.length, 4)}vw, ${120 / Math.max(name.length, 4)}vh)`
                    : `${(size * 1.5) / Math.max(name.length, 4)}vw`,
                }}
              >
                {name}
              </span>
            </div>
            <div className="bubble-burst">
              {Array.from({ length: 8 }, (_, k) => (
                <i key={k} style={{ "--angle": k * 45 + "deg" }} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
