import React, { useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Icon from "@material-ui/core/Icon";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import uuid from "uuid-random";

const useStyles = makeStyles(theme => ({
  card: {
    minWidth: 370,
    margin: "10px"
  },
  addGroupIcon: {
    backgroundColor: theme.palette.secondary.dark
  }
}));

export default function AddGroup({ groups, setGroups }) {
  const classes = useStyles();
  const [newGroup, setNewGroup] = useState({
    groupName: "",
    groupMembers: ""
  });

  const handleChange = name => event => {
    setNewGroup({ ...newGroup, [name]: event.target.value });
  };

  const addGroup = () => {
    let groupToAdd = {
      name: newGroup.groupName,
      members: newGroup.groupMembers.split(","),
      id: uuid()
    };
    setGroups([...groups, groupToAdd]);
    setNewGroup({ groupName: "", groupMembers: "" });
  };

  const countMembers = () => {
    let members = newGroup.groupMembers;
    if (members.length === 0) {
      return 0;
    } else {
      return members.split(",").length;
    }
  };
  return (
    <Card className={classes.card}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item>
            <Avatar className={classes.addGroupIcon}>
              <Icon>group_add</Icon>
            </Avatar>
          </Grid>
          <Grid item>
            <Typography component="h2">Új csoport</Typography>
          </Grid>
        </Grid>
        <form noValidate autoComplete="off">
          <TextField
            id="name"
            label="Csoport neve"
            placeholder="pl. 9.c emelt"
            value={newGroup.groupName}
            fullWidth
            onChange={handleChange("groupName")}
            margin="normal"
          />
          <TextField
            id="members"
            label="Csoport tagjai (vesszővel elválasztva)"
            multiline
            fullWidth
            placeholder="András,Béla,Cecil,Dániel"
            value={newGroup.groupMembers}
            onChange={handleChange("groupMembers")}
            margin="normal"
            helperText={countMembers() + " csoporttag"}
          />
        </form>
      </CardContent>
      <CardActions>
        <Button color="primary" size="small" onClick={addGroup}>
          <Icon>add</Icon>
          Hozzáadás
        </Button>
      </CardActions>
    </Card>
  );
}
