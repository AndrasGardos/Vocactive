import Classic from "./Classic";
import Wheel from "./Wheel";
import SlotMachine from "./SlotMachine";
import Spotlight from "./Spotlight";
import FlapBoard from "./FlapBoard";
import Bubbles from "./Bubbles";

// Each stage gets { members, draw, onSettled }: `draw` is { name, id } (or null
// before the first draw); the stage animates towards draw.name and calls
// onSettled(draw.id) when the name is fully revealed.
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
    id: "slot",
    icon: "🎰",
    title: "Nyerőgép",
    description: "Kaszinós tárcsa villogó égőkkel és karral – a nyerő sorban áll meg.",
    Component: SlotMachine,
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
];

export const DEFAULT_STAGE = "classic";
