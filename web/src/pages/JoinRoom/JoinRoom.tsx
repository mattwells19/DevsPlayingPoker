import Button from "@/components/Button";
import Header from "@/components/Header";
import { IntlKey, useFormatMessage } from "@/i18n";
import { useNavigate, useParams } from "solid-app-router";
import { Component, createSignal, Show } from "solid-js";
import styles from "./JoinRoom.module.scss";

const JoinRoom: Component = () => {
	const t = useFormatMessage();
	const navigate = useNavigate();
	const { roomCode } = useParams();

	const [errorMsg, setErrorMsg] = createSignal<IntlKey | null>(null);

	function handleSubmit(form: HTMLFormElement) {
		const formData = new FormData(form);
		const name = formData.get("name")?.toString().trim();

		if (!name || name.length === 0) {
			setErrorMsg("enterAName");
			return;
		}
		if (name.length > 10) {
			setErrorMsg("nameTooLong");
			return;
		}

		localStorage.setItem("name", name);
		navigate(`/room/${roomCode}`);
	}

	return (
		<>
			<Header />
			<main class={styles.join}>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit(e.currentTarget);
					}}
				>
					<label for="name">{t("name")}</label>
					<input
						id="name"
						name="name"
						type="text"
						required
						minLength="1"
						maxLength="10"
						autofocus
						value={localStorage.getItem("name") ?? ""}
						onInput={() => setErrorMsg(null)}
						aria-describedby="name-error-msg"
						aria-invalid={Boolean(errorMsg())}
					/>
					<Show when={errorMsg()} keyed>
						{(msg) => <p id="name-error-msg">{t(msg)}</p>}
					</Show>
					<Button type="submit">{t("done")}</Button>
				</form>
			</main>
		</>
	);
};

export default JoinRoom;
