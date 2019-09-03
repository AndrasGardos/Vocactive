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
import { Link } from "react-router-dom";

const useStyles = makeStyles(theme => ({
  card: {
    minWidth: 370,
    margin: "10px"
  }
}));

export default function App({ id, name, members, groups, setGroups }) {
  const classes = useStyles();
  const [editing, setEditing] = useState(false);

  const membersFormatted = members => {
    if (members.length < 8) {
      return members.join(",");
    } else {
      let shorter = members.slice(0, 5);
      let andAlso = members.length - 5;
      return shorter.join(",") + " + " + andAlso;
    }
  };

  const deleteGroup = _ => {
    //TODO : proper dialog here
    if (window.confirm("Biztosan kitörlöd " + name + " csoportot?")) {
      let newGroups = groups.filter(x => x.id !== id);
      setGroups(newGroups);
    }
  };

  const handleChangeGroup = event => {
    let newGroups = groups.map(x =>
      x.id !== id
        ? x
        : {
            id: id,
            name: name,
            members: event.target.value.split(",")
          }
    );
    setGroups(newGroups);
  };

  return (
    <Card className={classes.card}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item>
            <Avatar>
              <Icon>group</Icon>
            </Avatar>
          </Grid>
          <Grid item>
            <Typography component="h2">
              {name} ({members.length})
            </Typography>
            {!editing ? (
              <Typography color="textSecondary" variant="caption" gutterBottom>
                {membersFormatted(members)}
              </Typography>
            ) : (
              ""
            )}
          </Grid>

          {editing ? (
            <Grid item>
              <TextField
                id="members"
                label="Csoport tagjai"
                multiline
                fullWidth
                value={members.join(",")}
                margin="normal"
                onChange={handleChangeGroup}
              />
            </Grid>
          ) : (
            ""
          )}
        </Grid>
      </CardContent>
      <CardActions>
        <Link to={"/groups/" + id} style={{ textDecoration: "none" }}>
          <Button color="primary" size="small">
            <Icon>play_arrow</Icon>
            Start
          </Button>
        </Link>
        <Button
          onClick={_ => setEditing(!editing)}
          color="secondary"
          size="small"
        >
          <Icon>edit</Icon>
          Módosítás
        </Button>
        <Button onClick={deleteGroup} color="secondary" size="small">
          <Icon>delete</Icon>
          Törlés
        </Button>
      </CardActions>
    </Card>
  );
}
