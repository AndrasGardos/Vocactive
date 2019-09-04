import React, { useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  iconbutton: {
    position: "absolute",
    right: "15px",
    top: "15px"
  }
}));
export default function SettingsButton() {
  const classes = useStyles();
  return (
    <IconButton className={classes.iconbutton}>
      <Icon>settings</Icon>
    </IconButton>
  );
}
