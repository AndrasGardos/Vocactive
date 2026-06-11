import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

const parseMembers = (value) =>
  value
    .split(",")
    .map((member) => member.trim())
    .filter(Boolean);

export default function AddGroup({ groups, setGroups }) {
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState("");

  const members = parseMembers(groupMembers);

  const addGroup = () => {
    const groupToAdd = {
      name: groupName.trim(),
      members,
      id: crypto.randomUUID(),
    };
    setGroups([...groups, groupToAdd]);
    setGroupName("");
    setGroupMembers("");
  };

  return (
    <Card sx={{ minWidth: 370, m: "10px" }}>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Avatar sx={{ bgcolor: "secondary.dark" }}>
            <GroupAddIcon />
          </Avatar>
          <Typography component="h2">Új csoport</Typography>
        </Stack>
        <form noValidate autoComplete="off">
          <TextField
            id="name"
            label="Csoport neve"
            placeholder="pl. 9.c emelt"
            value={groupName}
            fullWidth
            onChange={(event) => setGroupName(event.target.value)}
            margin="normal"
          />
          <TextField
            id="members"
            label="Csoport tagjai (vesszővel elválasztva)"
            multiline
            fullWidth
            placeholder="András,Béla,Cecil,Dániel"
            value={groupMembers}
            onChange={(event) => setGroupMembers(event.target.value)}
            margin="normal"
            helperText={members.length + " csoporttag"}
          />
        </form>
      </CardContent>
      <CardActions>
        <Button
          color="primary"
          size="small"
          startIcon={<AddIcon />}
          onClick={addGroup}
          disabled={!groupName.trim() || members.length === 0}
        >
          Hozzáadás
        </Button>
      </CardActions>
    </Card>
  );
}
