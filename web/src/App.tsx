import { Navigate, Route, Routes } from "solid-app-router";
import type { Component } from "solid-js";
import Landing from "./pages/Landing";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import Room from "./pages/Room";

const App: Component = () => {
	return (
		<>
			<header>
				<button
					onClick={() => {
						document.body.classList.toggle("dark");
						localStorage.setItem(
							"theme",
							document.body.classList.contains("dark") ? "dark" : "light",
						);
					}}
				>
					Toggle Theme
				</button>
			</header>
			<Routes>
				<Route path="/" component={Landing} />
				<Route path="/create-room" component={CreateRoom} />
				<Route path="/join/:roomCode" component={JoinRoom} />
				<Route path="/room/:roomCode" component={Room} />
				<Route path="*" element={<Navigate href="/" />} />
			</Routes>
		</>
	);
};

export default App;
