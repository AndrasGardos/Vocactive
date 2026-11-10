import { useEffect, useRef, useState } from "react";
import { pickIndexOf } from "../layout";
import { sounds } from "../sound";
import "./wheel.css";

const COLORS = ["#FF5E5B", "#FFB400", "#00A6A6", "#7B5CFF", "#2EC4B6", "#FF7AA2", "#3A86FF", "#8AC926"];
const SPIN_MS = 6000;
const R = 100; // wheel radius in SVG units

const easeOut = (t) => 1 - (1 - t) ** 4;

const slicePath = (i, n) => {
  if (n === 1) return `M ${-R} 0 A ${R} ${R} 0 1 1 ${-R} 0.01 Z`;
  const a0 = (i / n) * 2 * Math.PI;
  const a1 = ((i + 1) / n) * 2 * Math.PI;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M 0 0 L ${R * Math.cos(a0)} ${R * Math.sin(a0)} A ${R} ${R} 0 ${large} 1 ${R * Math.cos(a1)} ${R * Math.sin(a1)} Z`;
};

const sliceColor = (i, n) => {
  let color = COLORS[i % COLORS.length];
  // avoid the first and last slice sharing a color
  if (i === n - 1 && n > 1 && color === COLORS[0]) color = COLORS[(i + 1) % COLORS.length];
  return color;
};

export default function Wheel({ members, draw, onSettled }) {
  const n = members.length;
  const slice = 360 / n;
  const [angle, setAngle] = useState(0);
  const [result, setResult] = useState(null);
  const winner = draw && result?.id === draw.id ? result.index : null;
  const angleRef = useRef(0);
  const [kick, setKick] = useState(0);

  useEffect(() => {
    if (!draw) return;
    const index = pickIndexOf(members, draw.name);
    // pointer is on the right (0°); slice i spans [i*slice, (i+1)*slice] before rotation
    const landing = index * slice + slice * (0.15 + Math.random() * 0.7);
    const from = angleRef.current;
    const base = from - (((from % 360) + 360) % 360);
    const to = base - landing - 360 * (5 + Math.floor(Math.random() * 3));
    const start = performance.now();
    let lastSlice = Math.floor(from / slice);
    let frame;

    const step = (now) => {
      const t = Math.min(1, (now - start) / SPIN_MS);
      const a = from + (to - from) * easeOut(t);
      angleRef.current = a;
      setAngle(a);
      const current = Math.floor(a / slice);
      if (current !== lastSlice) {
        lastSlice = current;
        sounds.tick();
        setKick((k) => k + 1);
      }
      if (t < 1) {
        frame = requestAnimationFrame(step);
      } else {
        setResult({ id: draw.id, index });
        sounds.fanfare();
        onSettled(draw.id);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw?.id]);

  return (
    <div className="wheel-stage">
      <div className="wheel-rays" />
      <div className="wheel-wrap">
        <svg viewBox="-110 -110 220 220" className="wheel-svg">
          <circle r="108" className="wheel-rim" />
          <g transform={`rotate(${angle})`}>
            {members.map((name, i) => {
              const mid = (i + 0.5) * slice;
              const fontSize = Math.min(14, (2 * Math.PI * R * 0.55) / n, (R * 0.62) / (name.length * 0.58));
              return (
                <g key={i} className={winner === i ? "slice winner" : winner !== null ? "slice dim" : "slice"}>
                  <path d={slicePath(i, n)} fill={sliceColor(i, n)} />
                  <text
                    transform={`rotate(${mid}) translate(${R * 0.9} 0)`}
                    textAnchor="end"
                    dominantBaseline="central"
                    fontSize={fontSize}
                  >
                    {name}
                  </text>
                </g>
              );
            })}
            {Array.from({ length: n }, (_, i) => (
              <circle
                key={i}
                className="wheel-peg"
                cx={R * 0.985 * Math.cos((i / n) * 2 * Math.PI)}
                cy={R * 0.985 * Math.sin((i / n) * 2 * Math.PI)}
                r="1.6"
              />
            ))}
          </g>
          <circle r="16" className="wheel-hub" />
          <text className="wheel-hub-text" textAnchor="middle" dominantBaseline="central">?</text>
        </svg>
        <div key={kick} className="wheel-pointer" />
      </div>
      {winner !== null && draw && (
        <div
          className="wheel-banner"
          style={{
            background: sliceColor(winner, n),
            fontSize: `min(11vmin, ${150 / draw.name.length}vw)`,
          }}
        >
          {draw.name}
        </div>
      )}
    </div>
  );
}
