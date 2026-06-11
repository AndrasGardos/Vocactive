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

const membersFormatted = (members) => {
  if (members.length < 8) {
    return members.join(",");
  }
  return members.slice(0, 5).join(",") + " + " + (members.length - 5);
};

export default function Group({ group, groups, setGroups }) {
  const { id, name, members } = group;
  const [editing, setEditing] = useState(false);

  const deleteGroup = () => {
    //TODO : proper dialog here
    if (window.confirm("Biztosan kitörlöd " + name + " csoportot?")) {
      setGroups(groups.filter((g) => g.id !== id));
    }
  };

  const handleMembersChange = (event) => {
    setGroups(
      groups.map((g) =>
        g.id === id ? { ...g, members: event.target.value.split(",") } : g
      )
    );
  };

  return (
    <Card sx={{ minWidth: 370, m: "10px" }}>
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
            value={members.join(",")}
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
        >
          Start
        </Button>
        <Button
          onClick={() => setEditing(!editing)}
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
