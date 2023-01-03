import { Component, createSignal, For, Show } from "solid-js";
import { useNavigate } from "solid-app-router";
import { ButtonLink } from "@/components/Button";
import styles from "./Landing.module.scss";
import Header from "@/components/Header";

const Landing: Component = () => {
	const roomCodeInputsRefs: Array<HTMLInputElement | null> =
		Array(4).fill(null);
	const navigate = useNavigate();

	const [error, setError] = createSignal<string | null>(null);

	const handleInputChange = (formElement: EventTarget & HTMLFormElement) => {
		const formData = new FormData(formElement);

		const roomCode = formData
			.getAll("roomCode")
			.filter((v) => v.toString().trim().length === 1)
			.join("")
			.toUpperCase();

		if (roomCode.length === 4) {
			fetch(`/api/v1/rooms/${roomCode}/checkRoomExists`).then(({ status }) => {
				switch (status) {
					case 200:
						navigate(`/room/${roomCode}`);
						break;
					case 204:
						setError("A room does not exist with that code. Try again.");
						break;
					case 429:
						setError("Too many attempts. Please wait and try again later.");
						break;
				}
			});
		}
	};

	return (
		<>
			<Header />
			<main class={styles.landing}>
				<section class={styles.copy}>
					<h1>🃏 Devs Playing Poker</h1>
					<p>
						If you have items you want to effort as fast as possible you've come
						to the right place.
					</p>
				</section>
				<div class={styles.roomOps}>
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
												setError(null);

												if (e.currentTarget.value === "") {
													roomCodeInputsRefs[index - 1]?.focus();
												}
											}
										}}
										onPaste={(e) => {
											const pastedData = e.clipboardData?.getData("text");

											if (
												index === 0 &&
												pastedData &&
												pastedData.length === 4
											) {
												pastedData.split("").forEach((letter, index) => {
													const element = roomCodeInputsRefs[index];

													if (element) {
														element.value = letter;
														// focus last input
														if (index === pastedData.length - 1) {
															element.focus();
														}
													}
												});
											}
										}}
									/>
								)}
							</For>
						</form>
						<div class={styles.errorMsg}>
							<Show when={error()} keyed>
								{(errorMsg) => <p aria-live="polite">{errorMsg}</p>}
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
				</div>
			</main>
		</>
	);
};

export default Landing;
