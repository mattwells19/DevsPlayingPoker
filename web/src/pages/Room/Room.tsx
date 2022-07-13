import { useNavigate, useParams } from "solid-app-router";
import { Component } from "solid-js";
import styles from "./Room.module.scss";

const Room: Component = () => {
	const navigate = useNavigate();
	const { roomCode } = useParams();

	if (!localStorage.getItem("name")) {
		navigate(`/join/${roomCode}`);
	}

	return (
		<main class={styles.room}>
			<h1>The room</h1>
		</main>
	);
};

export default Room;
