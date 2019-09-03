import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Groups from "./Components/Groups";
import Play from "./Components/Play";

export default function App() {
  return (
    <Router>
      <Route
        path="/"
        exact
        render={() => (
          <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Groups />
          </Container>
        )}
      />
      <Route path="/groups/:id" component={Play} />
    </Router>
  );
}
