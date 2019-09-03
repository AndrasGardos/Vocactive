import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AddGroup from "./AddGroup";
import Group from "./Group";

const useStyles = makeStyles(theme => ({
  classes: {
    marginTop: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  }
}));

export default function App() {
  const savedGroups = JSON.parse(localStorage.groups || "[]");
  const [groups, _setGroups] = useState(savedGroups);

  const setGroups = toWhat => {
    _setGroups(toWhat);
    // TODO : debounce - rapid calls from changing members
    localStorage.groups = JSON.stringify(toWhat);
  };

  const classes = useStyles();
  return (
    <div className={classes.classes}>
      <AddGroup groups={groups} setGroups={setGroups} />
      {groups.map(group => (
        <Group
          key={group.id}
          id={group.id}
          name={group.name}
          members={group.members}
          groups={groups}
          setGroups={setGroups}
        />
      ))}
    </div>
  );
}
