import { Route, Routes } from "solid-app-router";
import type { Component } from "solid-js";
import Landing from "./pages/Landing";
import Room from "./pages/Room/Room.tsx";

const App: Component = () => {
	return (
		<Routes>
			<Route path="/" component={Room} />
		</Routes>
	);
};

export default App;
