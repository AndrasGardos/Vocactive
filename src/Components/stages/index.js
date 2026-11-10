import Classic from "./Classic";
import Wheel from "./Wheel";
import Spotlight from "./Spotlight";
import FlapBoard from "./FlapBoard";
import Bubbles from "./Bubbles";
import Galton from "./Galton";
import Fishing from "./Fishing";
import Mosaic from "./Mosaic";

// Each stage gets { members, draw, skip, onSettled }: `draw` is { name, id } (or
// null before the first draw); the stage animates towards draw.name and calls
// onSettled(draw.id) when the name is fully revealed. Stages marked `skippable`
// get `skip: true` when the teacher clicks during the animation.
export const STAGES = [
  {
    id: "classic",
    icon: "🎨",
    title: "Klasszikus",
    description: "Óriási név a teljes képernyőn, minden kattintásra új színnel. Azonnali.",
    Component: Classic,
  },
  {
    id: "wheel",
    icon: "🎡",
    title: "Szerencsekerék",
    description: "Mindenki neve egy cikk a keréken. Pörög, kattog, lassul… és megáll.",
    Component: Wheel,
  },
  {
    id: "spotlight",
    icon: "🔦",
    title: "Reflektor",
    description: "Sötét színpad, a fénycsóva névről névre ugrál, majd a kiválasztott a színpad közepére lép.",
    Component: Spotlight,
  },
  {
    id: "flap",
    icon: "🛫",
    title: "Reptéri tábla",
    description: "Kattogó, lapozós betűtábla, ami betűről betűre rakja ki a nevet.",
    Component: FlapBoard,
  },
  {
    id: "bubbles",
    icon: "🎈",
    title: "Lufipukkasztás",
    description: "Minden név egy lufi. Egyesével kipukkannak – aki utoljára marad, az felel.",
    Component: Bubbles,
  },
  {
    id: "galton",
    icon: "⚪",
    title: "Golyózó",
    description: "Egy golyó pattog le a tüskék között, és egy név rekeszében köt ki. Közben megmutatja, hogyan működik a véletlen (Galton-deszka).",
    Component: Galton,
  },
  {
    id: "fishing",
    icon: "🎣",
    title: "Horgászat",
    description: "A nevek halak a tóban. Leereszkedik a horog, néhány hal megkóstolja, de csak egy akad horogra.",
    Component: Fishing,
  },
  {
    id: "mosaic",
    icon: "🧩",
    title: "Ki rejtőzik?",
    description: "A név csempék mögé bújik, amelyek egyenként lepotyognak. Találjátok ki, ki az! Kattintásra azonnal felfedi.",
    Component: Mosaic,
    skippable: true,
  },
];

export const DEFAULT_STAGE = "classic";
