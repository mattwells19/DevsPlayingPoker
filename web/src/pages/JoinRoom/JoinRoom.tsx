import Button from "@/components/Button";
import { useNavigate, useParams } from "solid-app-router";
import { Component, createSignal, Show } from "solid-js";
import styles from "./JoinRoom.module.scss";

const JoinRoom: Component = () => {
	const navigate = useNavigate();
	const { roomCode } = useParams();

	const [loading, setLoading] = createSignal<boolean>(false);
	const [errorMsg, setErrorMsg] = createSignal<string | null>(null);

	function handleSubmit(form: HTMLFormElement) {
		const formData = new FormData(form);
		const name = formData.get("name")?.toString().trim();

		if (!name || name.length === 0) {
			setErrorMsg("Please enter a name.");
			return;
		}

		localStorage.setItem("name", name);

		setLoading(true);
		fetch(`/api/rooms/${roomCode}/join`, {
			method: "POST",
			body: JSON.stringify({ name }),
		})
			.then(async (res) => {
				if (res.ok) {
					navigate(`/room/${roomCode}`);
				} else {
					const errorBody = await res.json();
					throw new Error(errorBody.message);
				}
			})
			.catch((e) => {
				if (e instanceof Error) {
					setErrorMsg(e.message);
				} else {
					setErrorMsg("An unexpected error occured.");
				}
			})
			.finally(() => {
				setLoading(false);
			});
	}

	return (
		<main class={styles.join}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					handleSubmit(e.currentTarget);
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
					value={localStorage.getItem("name") ?? ""}
					onInput={() => setErrorMsg(null)}
					aria-describedby="name-error-msg"
					aria-invalid={Boolean(errorMsg())}
				/>
				<Show when={errorMsg() !== null}>
					<p id="name-error-msg">{errorMsg()}</p>
				</Show>
				<Button loading={loading()} type="submit">
					Done
				</Button>
			</form>
		</main>
	);
};

export default JoinRoom;
