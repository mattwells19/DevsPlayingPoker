import { Navigate, Route, Routes } from "@solidjs/router";
import type { Component } from "solid-js";
import Landing from "./pages/Landing";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import Room from "./pages/Room";
import VotingModerator from "./pages/VotingModerator";

const App: Component = () => {
	return (
		<Routes>
			<Route path="/" component={Landing} />
			<Route path="/create-room" component={CreateRoom} />
			<Route path="/join/:roomCode" component={JoinRoom} />
			<Route path="/room/:roomCode" component={Room} />
			<Route path="/voting-moderator" component={VotingModerator} />
			<Route path="*" element={<Navigate href="/" />} />
		</Routes>
	);
};

export default App;
