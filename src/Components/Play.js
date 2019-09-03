import React, { useState, useEffect } from "react";
import "./play.css";
import Fullscreen from "react-full-screen";
import Icon from "@material-ui/core/Icon";
import Shuffler from "./shuffler";

export default function Play({ match }) {
  const groupId = match.params.id;
  const groupData = JSON.parse(localStorage.groups).find(x => x.id === groupId);
  const [nameShuffler, setNameShuffler] = useState(
    new Shuffler(groupData.members)
  );
  const bgColors = "#54C8C6 #55B68B #75AF57 #CFB734 #CF5C34".split(" ");
  const [colorShuffler, setColorShuffler] = useState(new Shuffler(bgColors));
  //const [groupMembers, setGroupMembers] = useState(groupData.members);
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");
  const [bgColor, setBgColor] = useState("");
  const [fullScreenEnabled, setFullScreenEnabled] = useState(false);

  useEffect(() => {
    setName(nameShuffler.next());
    setBgColor(colorShuffler.next());
  }, [nameShuffler, colorShuffler]);

  const nextName = _ => {
    setName(nameShuffler.next());
    setCount(count + 1);
    setBgColor(colorShuffler.next());
  };

  const enableFullScreen = _ => {
    setFullScreenEnabled(true);
  };

  window.screen.orientation.lock("landscape");

  return (
    <Fullscreen
      enabled={fullScreenEnabled}
      onChange={_ => window.screen.orientation.lock("landscape")}
    >
      <div className="container">
        {fullScreenEnabled ? (
          ""
        ) : (
          <Icon className="fullscreen-button" onClick={enableFullScreen}>
            fullscreen
          </Icon>
        )}
        <div
          style={{
            background: bgColor,
            fontSize: 270 / (4 + name.length) + "vw"
          }}
          onClick={nextName}
          className="play"
        >
          {name}
        </div>
        <div className="counter">{count}</div>
      </div>
    </Fullscreen>
  );
}
