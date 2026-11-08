import { useEffect, useState } from "react";
import { pickIndexOf, scatter } from "../layout";
import { sounds } from "../sound";
import "./spotlight.css";

const HOPS = 18;

export default function Spotlight({ members, draw, onSettled }) {
  const [layout] = useState(() => scatter(members.length, { padX: 13, padY: 8 }));
  const [lit, setLit] = useState(null);
  const [beamMs, setBeamMs] = useState(300);
  const [revealedId, setRevealedId] = useState(null);
  const revealed = draw !== null && revealedId === draw.id;
  const n = members.length;

  useEffect(() => {
    if (!draw) return;
    const target = pickIndexOf(members, draw.name);
    const hops = [];
    for (let i = 0; i < HOPS - 1; i++) {
      let next = Math.floor(Math.random() * n);
      if (n > 1 && next === (hops[i - 1] ?? target)) next = (next + 1) % n;
      hops.push(next);
    }
    if (n > 1 && hops[hops.length - 1] === target) hops[hops.length - 1] = (target + 1) % n;
    hops.push(target);

    const timers = [];
    let elapsed = 450; // let the previous winner settle back first
    hops.forEach((index, i) => {
      // hops start quick and slow down towards the end
      const gap = 90 + 650 * (i / (HOPS - 1)) ** 2.4;
      timers.push(
        setTimeout(() => {
          setBeamMs(Math.min(gap * 0.85, 450));
          setLit(index);
          sounds.blip();
        }, elapsed)
      );
      elapsed += gap;
    });
    timers.push(
      setTimeout(() => {
        setRevealedId(draw.id);
        sounds.fanfare();
        onSettled(draw.id);
      }, elapsed + 400)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw?.id]);

  const cellWidth = (100 - 2 * layout.padX) / layout.cols; // in vw
  const cellFont = (name) =>
    `min(${38 / layout.cols}vw, ${34 / layout.rows}vh, ${(cellWidth * 1.5) / Math.max(name.length, 4)}vw)`;
  const beam = lit === null ? null : revealed ? { x: 50, y: 50 } : layout.cells[lit];

  return (
    <div className={`spot-stage ${revealed ? "revealed" : ""}`}>
      <div className="spot-curtain left" />
      <div className="spot-curtain right" />
      {members.map((name, i) => {
        const cell = layout.cells[i];
        const winner = revealed && i === lit;
        return (
          <div
            key={i}
            className={`spot-name ${i === lit ? "lit" : ""} ${winner ? "winner" : ""}`}
            style={{
              left: winner ? "50%" : cell.x + "%",
              top: winner ? "50%" : cell.y + "%",
              fontSize: winner ? `min(16vmin, ${160 / name.length}vw)` : cellFont(name),
              transform: `translate(-50%, -50%) rotate(${winner ? 0 : cell.rotate}deg)`,
            }}
          >
            {name}
          </div>
        );
      })}
      <div
        className={`spot-beam ${beam ? "on" : ""}`}
        style={{
          left: (beam?.x ?? 50) + "%",
          top: (beam?.y ?? 50) + "%",
          transitionDuration: `${beamMs}ms, ${beamMs}ms, 0.8s, 0.8s, 0.5s`,
        }}
      />
    </div>
  );
}
