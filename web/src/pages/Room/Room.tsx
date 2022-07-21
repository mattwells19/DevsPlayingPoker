import { useNavigate, useParams } from "solid-app-router";
import { Component } from "solid-js";
import styles from "./Room.module.scss";

const Room: Component = () => {
	const navigate = useNavigate();
	const { roomCode } = useParams();

	if (!localStorage.getItem("name")) {
		navigate(`/join/${roomCode}`);
	}

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

	return (
		<main class={styles.room}>
			<h1>The room</h1>
		</main>
	);
};

export default Room;
