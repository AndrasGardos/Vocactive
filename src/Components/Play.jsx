import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Shuffler, { MODES, DEFAULT_MODE } from "./shuffler";
import { loadGroups } from "./storage";
import "./play.css";

const BG_COLORS = ["#54C8C6", "#55B68B", "#75AF57", "#CFB734", "#CF5C34"];

const lockLandscape = () => {
  // orientation lock is unsupported or denied on most desktop browsers
  try {
    screen.orientation?.lock?.("landscape").catch(() => {});
  } catch {
    /* not supported */
  }
};

export default function Play() {
  const { id } = useParams();
  const group = useMemo(() => loadGroups().find((g) => g.id === id), [id]);
  const fullScreenHandle = useFullScreenHandle();

  const [mode, setMode] = useState(DEFAULT_MODE);
  const [round, setRound] = useState(null);

  useEffect(lockLandscape, []);

  if (!group) {
    return <Navigate to="/" replace />;
  }

  const start = () => {
    const nameShuffler = new Shuffler(group.members, mode);
    const colorShuffler = new Shuffler(BG_COLORS);
    setRound({
      nameShuffler,
      colorShuffler,
      name: nameShuffler.next(),
      bgColor: colorShuffler.next(),
      count: 0,
    });
  };

  const nextName = () => {
    setRound({
      ...round,
      name: round.nameShuffler.next(),
      bgColor: round.colorShuffler.next(),
      count: round.count + 1,
    });
  };

  if (!round) {
    return (
      <Container component="main" maxWidth="xs">
        <Stack spacing={2} sx={{ mt: 4 }}>
          <Typography variant="h5" component="h1">
            {group.name}
          </Typography>
          <Typography>Hogyan sorsoljuk a neveket?</Typography>
          <RadioGroup
            value={mode}
            onChange={(event) => setMode(event.target.value)}
          >
            {MODES.map(({ id: modeId, title, description }) => (
              <FormControlLabel
                key={modeId}
                value={modeId}
                control={<Radio />}
                sx={{ alignItems: "flex-start", mb: 1 }}
                label={
                  <>
                    <Typography>{title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {description}
                    </Typography>
                  </>
                }
              />
            ))}
          </RadioGroup>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={start}
          >
            Indítás
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <FullScreen
      handle={fullScreenHandle}
      onChange={(isFullScreen) => isFullScreen && lockLandscape()}
    >
      <div className="container">
        {!fullScreenHandle.active && (
          <IconButton
            className="fullscreen-button"
            aria-label="Teljes képernyő"
            onClick={fullScreenHandle.enter}
          >
            <FullscreenIcon />
          </IconButton>
        )}
        <div
          style={{
            background: round.bgColor,
            fontSize: 270 / (4 + round.name.length) + "vw",
          }}
          onClick={nextName}
          className="play"
        >
          {round.name}
        </div>
        <div className="counter">{round.count}</div>
      </div>
    </FullScreen>
  );
}
