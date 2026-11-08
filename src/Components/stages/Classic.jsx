import { useEffect, useMemo } from "react";
import Shuffler from "../shuffler";

const BG_COLORS = ["#54C8C6", "#55B68B", "#75AF57", "#CFB734", "#CF5C34"];

export default function Classic({ draw, onSettled }) {
  const colors = useMemo(() => new Shuffler(BG_COLORS), []);
  // a new color for every draw, picked once per draw id
  const bgColor = useMemo(
    () => (draw ? colors.next() : BG_COLORS[0]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draw?.id, colors]
  );

  useEffect(() => {
    if (draw) onSettled(draw.id);
  }, [draw, onSettled]);

  const text = draw?.name ?? "Vocactive";
  return (
    <div
      className="classic"
      style={{ background: bgColor, fontSize: 270 / (4 + text.length) + "vw" }}
    >
      {text}
    </div>
  );
}
