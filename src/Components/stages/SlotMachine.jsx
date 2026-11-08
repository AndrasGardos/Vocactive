import { useEffect, useRef, useState } from "react";
import { randomItem } from "../layout";
import { sounds } from "../sound";
import "./slot.css";

const SPIN_MS = 4500;
const STRIP_LENGTH = 40;
const BULBS = 22;

// ease out with a small overshoot, like a reel clicking into place
const easeOutBack = (t) => {
  const c1 = 1.2;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};

const buildStrip = (members, first, target) => {
  const strip = [randomItem(members), first ?? randomItem(members)];
  while (strip.length < STRIP_LENGTH) {
    let name = randomItem(members);
    if (members.length > 1 && name === strip[strip.length - 1]) name = randomItem(members);
    strip.push(name);
  }
  strip.push(target, randomItem(members));
  return strip;
};

export default function SlotMachine({ members, draw, onSettled }) {
  const [strip, setStrip] = useState(() => ["?", "?", "?"]);
  // position of the reel in rows; row `pos + 1` is in the pay line
  const [pos, setPos] = useState(0);
  const [blur, setBlur] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [lever, setLever] = useState(0);
  const lastName = useRef(null);

  useEffect(() => {
    if (!draw) return;
    const newStrip = buildStrip(members, lastName.current, draw.name);
    const end = newStrip.length - 3;
    const start = performance.now();
    let lastRow = 0;
    let lastPos = 0;
    let frame;
    setStrip(newStrip);
    setPos(0);
    setPhase("spinning");
    setLever((l) => l + 1);
    sounds.clunk();

    const step = (now) => {
      const t = Math.min(1, (now - start) / SPIN_MS);
      const p = end * easeOutBack(t);
      setPos(p);
      setBlur(Math.min(1, Math.abs(p - lastPos) / 0.6));
      lastPos = p;
      if (Math.round(p) !== lastRow) {
        lastRow = Math.round(p);
        sounds.tick();
      }
      if (t < 1) {
        frame = requestAnimationFrame(step);
      } else {
        lastName.current = draw.name;
        setBlur(0);
        setPhase("won");
        sounds.fanfare();
        onSettled(draw.id);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw?.id]);

  const longest = Math.max(...members.map((m) => m.length), 4);
  const fontSize = `min(9vh, ${110 / longest}vw)`;

  return (
    <div className={`slot-stage ${phase}`}>
      <div className="slot-machine">
        <div className="slot-title">JACKPOT</div>
        <div className="slot-bulbs">
          {Array.from({ length: BULBS }, (_, i) => (
            <span
              key={i}
              className="slot-bulb"
              style={{
                left: `calc(${((i % (BULBS / 2)) / (BULBS / 2 - 1)) * 100}% - ${(i % (BULBS / 2)) / (BULBS / 2 - 1) * 2}vmin)`,
                top: i < BULBS / 2 ? 0 : "calc(100% - 2vmin)",
                animationDelay: `${-0.1 * i}s`,
              }}
            />
          ))}
        </div>
        <div className="slot-window">
          <div
            className="slot-reel"
            style={{
              transform: `translateY(${-pos * 33.333}%)`,
              filter: blur ? `blur(${blur * 0.8}vh)` : "none",
            }}
          >
            {strip.map((name, i) => (
              <div key={i} className="slot-row" style={{ fontSize }}>
                {name}
              </div>
            ))}
          </div>
          <div className="slot-payline" />
          <div className="slot-glass" />
        </div>
      </div>
      <div className="slot-lever">
        <div key={lever} className="slot-arm">
          <div className="slot-knob" />
        </div>
        <div className="slot-lever-base" />
      </div>
    </div>
  );
}
