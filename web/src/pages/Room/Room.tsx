import { Component } from "solid-js";

const Room: Component = () => {
	const ws = new WebSocket("ws://localhost:3000/ws");
	ws.addEventListener("open", () => {
		ws.send(
			JSON.stringify({
				event: "Join",
				roomCode: "BABA",
				name: "Matt",
			}),
		);
	});

	ws.addEventListener("message", (e) => {
		console.log(e.data);
	});

	return <p>Room</p>;
};

export default Room;
