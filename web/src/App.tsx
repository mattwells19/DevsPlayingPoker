import { Route, Routes } from "solid-app-router";
import type { Component } from "solid-js";
import Landing from "./pages/Landing";

const App: Component = () => {
	return (
		<Routes>
			<Route path="/" component={Landing} />
			<Route path="/create-room" component={() => <p>Create Room</p>} />
		</Routes>
	);
};

export default App;
