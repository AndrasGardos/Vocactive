import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import Shuffler, { MODES, DEFAULT_MODE } from "./shuffler";
import { loadGroups, loadPrefs, savePrefs } from "./storage";
import { isSoundEnabled, setSoundEnabled } from "./sound";
import { STAGES, DEFAULT_STAGE } from "./stages";
import "./play.css";

const lockLandscape = () => {
  // orientation lock is unsupported or denied on most desktop browsers
  try {
    screen.orientation?.lock?.("landscape").catch(() => {});
  } catch {
    /* not supported */
  }
};

const validId = (list, id, fallback) => (list.some((item) => item.id === id) ? id : fallback);

function StagePicker({ value, onChange }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
      {STAGES.map(({ id, icon, title, description }) => (
        <Card
          key={id}
          variant="outlined"
          sx={{
            borderWidth: 2,
            borderColor: value === id ? "primary.main" : "divider",
            bgcolor: value === id ? "action.selected" : "background.paper",
          }}
        >
          <CardActionArea
            onClick={() => onChange(id)}
            aria-pressed={value === id}
            sx={{ p: 1.5, height: "100%", display: "block" }}
          >
            <Typography sx={{ fontSize: 32, lineHeight: 1.2 }}>{icon}</Typography>
            <Typography sx={{ fontWeight: 500 }}>{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
}

export default function Play() {
  const { id } = useParams();
  const group = useMemo(() => loadGroups().find((g) => g.id === id), [id]);
  const fullScreenHandle = useFullScreenHandle();

  const [prefs] = useState(loadPrefs);
  const [mode, setMode] = useState(validId(MODES, prefs.mode, DEFAULT_MODE));
  const [stageId, setStageId] = useState(validId(STAGES, prefs.stage, DEFAULT_STAGE));
  const [round, setRound] = useState(null);
  const [settledId, setSettledId] = useState(null);
  const [sound, setSound] = useState(isSoundEnabled);

  useEffect(lockLandscape, []);

  const onSettled = useCallback((drawId) => setSettledId(drawId), []);

  const busy = round?.draw != null && settledId !== round.draw.id;

  const nextName = useCallback(() => {
    if (busy) return;
    setRound((r) => ({
      ...r,
      draw: { name: r.nameShuffler.next(), id: (r.draw?.id ?? 0) + 1 },
    }));
  }, [busy]);

  useEffect(() => {
    if (!round) return;
    const onKey = (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        nextName();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [round, nextName]);

  if (!group || group.members.length === 0) {
    return <Navigate to="/" replace />;
  }

  const start = () => {
    savePrefs({ mode, stage: stageId });
    setSettledId(null);
    setRound({ nameShuffler: new Shuffler(group.members, mode), draw: null });
  };

  const toggleSound = (event) => {
    event.stopPropagation();
    setSoundEnabled(!sound);
    setSound(!sound);
  };

  if (!round) {
    return (
      <Container component="main" maxWidth="sm">
        <Stack spacing={2} sx={{ my: 4 }}>
          <Typography variant="h5" component="h1">
            {group.name}
          </Typography>
          <Typography variant="h6" component="h2">
            Megjelenítés
          </Typography>
          <StagePicker value={stageId} onChange={setStageId} />
          <Typography variant="h6" component="h2">
            Hogyan sorsoljuk a neveket?
          </Typography>
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
          <Button component={Link} to="/" startIcon={<ArrowBackIcon />}>
            Vissza
          </Button>
        </Stack>
      </Container>
    );
  }

  const { Component } = STAGES.find((s) => s.id === stageId);
  const count = round.draw?.id ?? 0;

  return (
    <FullScreen
      handle={fullScreenHandle}
      onChange={(isFullScreen) => isFullScreen && lockLandscape()}
    >
      <div className={`container ${busy ? "busy" : ""}`} onClick={nextName}>
        <Component members={group.members} draw={round.draw} onSettled={onSettled} />
        {!round.draw && <div className="start-hint">Kattints a sorsoláshoz!</div>}
        <div className="toolbar" onClick={(event) => event.stopPropagation()}>
          <IconButton aria-label="Vissza a beállításokhoz" onClick={() => setRound(null)}>
            <ArrowBackIcon />
          </IconButton>
          <span className="toolbar-spacer" />
          <IconButton aria-label={sound ? "Hang kikapcsolása" : "Hang bekapcsolása"} onClick={toggleSound}>
            {sound ? <VolumeUpIcon /> : <VolumeOffIcon />}
          </IconButton>
          {!fullScreenHandle.active && (
            <IconButton aria-label="Teljes képernyő" onClick={fullScreenHandle.enter}>
              <FullscreenIcon />
            </IconButton>
          )}
        </div>
        {count > 0 && <div className="counter">{count}</div>}
      </div>
    </FullScreen>
  );
}
