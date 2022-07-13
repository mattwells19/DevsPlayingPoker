import { Navigate, Route, Routes } from "solid-app-router";
import type { Component } from "solid-js";
import Landing from "./pages/Landing";
import JoinRoom from "./pages/JoinRoom";
import Room from "./pages/Room";

const App: Component = () => {
	return (
		<Routes>
			<Route path="/" component={Landing} />
			<Route path="/join/:roomCode" component={JoinRoom} />
			<Route path="/room/:roomCode" component={Room} />
			<Route path="*" element={<Navigate href="/" />} />
		</Routes>
	);
};

export default App;
