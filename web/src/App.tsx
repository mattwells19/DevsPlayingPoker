import { Route, Routes } from "solid-app-router";
import type { Component } from "solid-js";
import Landing from "./pages/Landing";

const App: Component = () => {
  return (
    <Routes>
      <Route path="/" component={Landing} />
    </Routes>
  );
};

export default App;
