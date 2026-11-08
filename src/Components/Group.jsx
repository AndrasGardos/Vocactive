import { useState } from "react";
import { Link } from "react-router";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import GroupIcon from "@mui/icons-material/Group";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { parseMembers } from "./storage";

const membersFormatted = (members) => {
  if (members.length < 8) {
    return members.join(",");
  }
  return members.slice(0, 5).join(",") + " + " + (members.length - 5);
};

export default function Group({ group, groups, setGroups }) {
  const { id, name, members } = group;
  // raw text while editing, so separators the teacher is still typing aren't stripped
  const [draft, setDraft] = useState(null);
  const editing = draft !== null;

  const deleteGroup = () => {
    //TODO : proper dialog here
    if (window.confirm("Biztosan kitörlöd " + name + " csoportot?")) {
      setGroups(groups.filter((g) => g.id !== id));
    }
  };

  const handleMembersChange = (event) => {
    setDraft(event.target.value);
    setGroups(
      groups.map((g) =>
        g.id === id ? { ...g, members: parseMembers(event.target.value) } : g
      )
    );
  };

  return (
    <Card sx={{ width: "100%", my: "10px" }}>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Avatar>
            <GroupIcon />
          </Avatar>
          <Box>
            <Typography component="h2">
              {name} ({members.length})
            </Typography>
            {!editing && (
              <Typography color="text.secondary" variant="caption" gutterBottom>
                {membersFormatted(members)}
              </Typography>
            )}
          </Box>
        </Stack>
        {editing && (
          <TextField
            id={"members-" + id}
            label="Csoport tagjai"
            multiline
            fullWidth
            value={draft}
            margin="normal"
            onChange={handleMembersChange}
          />
        )}
      </CardContent>
      <CardActions>
        <Button
          component={Link}
          to={"/groups/" + id}
          color="primary"
          size="small"
          startIcon={<PlayArrowIcon />}
          disabled={members.length === 0}
        >
          Start
        </Button>
        <Button
          onClick={() => setDraft(editing ? null : members.join(","))}
          color="secondary"
          size="small"
          startIcon={<EditIcon />}
        >
          Módosítás
        </Button>
        <Button
          onClick={deleteGroup}
          color="secondary"
          size="small"
          startIcon={<DeleteIcon />}
        >
          Törlés
        </Button>
      </CardActions>
    </Card>
  );
}
