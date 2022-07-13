import Button from "@/components/Button";
import { useNavigate, useParams } from "solid-app-router";
import {
	Component,
	createEffect,
	createResource,
	createSignal,
} from "solid-js";
import styles from "./JoinRoom.module.scss";

const JoinRoom: Component = () => {
	const navigate = useNavigate();
	const { roomCode } = useParams();

	const [voterName, setVoterName] = createSignal<string | null>(
		localStorage.getItem("name") ?? null,
	);
	const [joinRoomResult] = createResource(voterName, (name) =>
		fetch("/api/join", {
			method: "POST",
			body: JSON.stringify({ roomCode, name }),
		}).then((res) => res.ok),
	);

	createEffect(() => {
		if (joinRoomResult()) {
			navigate(`/room/${roomCode}`);
		}
	});

	return (
		<main class={styles.join}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const formData = new FormData(e.currentTarget);
					const name = formData.get("name")?.toString().trim();
					if (name && name.length > 0) {
						localStorage.setItem("name", name);
						setVoterName(name);
					}
				}}
			>
				<label for="name">Name</label>
				<input
					id="name"
					name="name"
					type="text"
					required
					minLength="1"
					autofocus
					value={voterName() ?? ""}
				/>
				<Button type="submit">Done</Button>
			</form>
		</main>
	);
};

export default JoinRoom;
