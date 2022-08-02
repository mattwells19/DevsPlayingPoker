import { Route, Routes } from "solid-app-router";
import type { Component } from "solid-js";
import Landing from "./pages/Landing";
import CreateRoom from "./pages/CreateRoom";

const App: Component = () => {
	return (
		<Routes>
			<Route path="/" component={Landing} />
			<Route path="/create-room" component={CreateRoom} />
		</Routes>
	);
};

export default App;
