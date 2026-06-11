import { BrowserRouter, Routes, Route } from "react-router";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Groups from "./Components/Groups";
import Play from "./Components/Play";

export default function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <Routes>
        <Route
          path="/"
          element={
            <Container component="main" maxWidth="xs">
              <Groups />
            </Container>
          }
        />
        <Route path="/groups/:id" element={<Play />} />
      </Routes>
    </BrowserRouter>
  );
}
