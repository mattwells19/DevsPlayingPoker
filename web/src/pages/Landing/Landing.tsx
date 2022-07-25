import {
	Component,
	createEffect,
	createResource,
	createSignal,
	For,
	Show,
} from "solid-js";
import { useNavigate } from "solid-app-router";
import { ButtonLink } from "@/components/Button";
import styles from "./Landing.module.scss";

const Landing: Component = () => {
	const roomCodeInputsRefs: Array<HTMLInputElement | null> =
		Array(4).fill(null);
	const navigate = useNavigate();

	const [roomCodeValue, setRoomCodeValue] = createSignal<string | null>(null);

	// async call gets triggered when roomCodeValue is truthy
	const [roomExists] = createResource<boolean, string>(
		roomCodeValue,
		(roomCode) =>
			fetch(`/api/v1/rooms/${roomCode}/checkRoomExists`).then(
				({ status }) => status === 200,
			),
	);

	const handleInputChange = (formElement: EventTarget & HTMLFormElement) => {
		const formData = new FormData(formElement);

		const roomCode = formData
			.getAll("roomCode")
			.filter((v) => v.toString().trim().length === 1)
			.join("")
			.toUpperCase();

		if (roomCode.length === 4) {
			// set room code to truthy value to trigger resource call
			setRoomCodeValue(roomCode);
		}
	};

	createEffect(() => {
		if (roomExists()) {
			navigate(`/room/${roomCodeValue()}`);
		}
	});

	return (
		<main class={styles.landing}>
			<section class={styles.roomCodeInputs}>
				<p>Already have a room code? Enter it here</p>
				<form onInput={(e) => handleInputChange(e.currentTarget)}>
					<For each={[0, 1, 2, 3]}>
						{(index) => (
							<input
								id={`roomCode-${index + 1}`}
								name="roomCode"
								aria-label={`Room Code letter ${index + 1}`}
								type="text"
								minLength="1"
								maxLength="1"
								required
								autofocus={index === 0}
								ref={(el) => (roomCodeInputsRefs[index] = el)}
								onInput={(e) => {
									if (e.currentTarget.value.trim().length > 0) {
										roomCodeInputsRefs[index + 1]?.focus();
									}
								}}
								onKeyDown={(e) => {
									if (e.key === "Backspace") {
										setRoomCodeValue(null);

										if (e.currentTarget.value === "") {
											roomCodeInputsRefs[index - 1]?.focus();
										}
									}
								}}
							/>
						)}
					</For>
				</form>
				<div class={styles.errorMsg}>
					<Show when={roomCodeValue() && roomExists() === false}>
						<p aria-live="polite">
							A room does not exist with that code. Try again.
						</p>
					</Show>
				</div>
			</section>
			<div class={styles.seperator}>
				<hr />
				<span>or</span>
				<hr />
			</div>
			<section>
				<ButtonLink class={styles.btnLink} href="/create-room">
					Start a new room
				</ButtonLink>
			</section>
		</main>
	);
};

export default Landing;
