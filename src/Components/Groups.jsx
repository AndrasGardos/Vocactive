import { useState } from "react";
import Stack from "@mui/material/Stack";
import AddGroup from "./AddGroup";
import Group from "./Group";
import { loadGroups, saveGroups } from "./storage";

export default function Groups() {
  const [groups, setGroupsState] = useState(loadGroups);

  const setGroups = (newGroups) => {
    setGroupsState(newGroups);
    saveGroups(newGroups);
  };

  return (
    <Stack sx={{ mt: 3, alignItems: "center" }}>
      <AddGroup groups={groups} setGroups={setGroups} />
      {groups.map((group) => (
        <Group
          key={group.id}
          group={group}
          groups={groups}
          setGroups={setGroups}
        />
      ))}
    </Stack>
  );
}
