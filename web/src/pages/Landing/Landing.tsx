import { Component, createSignal, For, JSX, Show } from "solid-js";
import { useNavigate, Link } from "@solidjs/router";
import Header from "@/components/Header";
import { IntlKey, useIntl } from "@/i18n";

const Landing: Component = () => {
	const intl = useIntl();
	const navigate = useNavigate();

	const [error, setError] = createSignal<IntlKey | null>(null);

	const roomCodeInputsRefs: Array<HTMLInputElement | null> =
		Array(4).fill(null);

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
						setError("roomDoesNotExist");
						break;
					case 429:
						setError("tooManyAttempts");
						break;
				}
			});
		}
	};

	const handlePaste: JSX.EventHandlerUnion<HTMLFormElement, ClipboardEvent> = (
		e,
	) => {
		e.preventDefault();
		const pastedData = e.clipboardData?.getData("text");

		if (pastedData && pastedData.length === 4) {
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

			// Firefox doesn't trigger onInput for pasted data so need to manually trigger
			handleInputChange(e.currentTarget);
		}
	};

	return (
		<>
			<Header
				onSaveName={(new_name) => localStorage.setItem("name", new_name)}
			/>
			<main class="max-w-md m-auto flex flex-col">
				<section class="text-center my-8 mx-0 py-0 px-2">
					<h1 class="text-5xl leading-snug font-bold">🃏 Devs Playing Poker</h1>
					<p class="text-xl mt-9">{intl.t("comeToTheRightPlace")}</p>
				</section>
				<div class="mt-12">
					<section class="text-center">
						<p class="mt-8 mb-4">{intl.t("enterRoomCodeHere")}</p>
						<form
							onInput={(e) => handleInputChange(e.currentTarget)}
							onPaste={(e) => handlePaste(e)}
							class="flex gap-1 justify-center"
						>
							<For each={[0, 1, 2, 3]}>
								{(index) => (
									<input
										class="input input-bordered w-12 h-12 uppercase text-center"
										id={`roomCode-${index + 1}`}
										name="roomCode"
										aria-label={`Room Code letter ${index + 1}`}
										type="text"
										minLength="1"
										maxLength="1"
										required
										autofocus={index === 0}
										autocomplete="off"
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
									/>
								)}
							</For>
						</form>
						<div class="h-4 grid place-items-center">
							<Show when={error()} keyed>
								{(errorMsg) => (
									<p aria-live="polite" class="my-4 mx-0 text-error">
										{intl.t(errorMsg)}
									</p>
								)}
							</Show>
						</div>
					</section>
					<div class="flex gap-4 items-center mt-8 mb-12 mx-0">
						<div class="divider flex-grow" />
						<span>{intl.t("or")}</span>
						<div class="divider flex-grow" />
					</div>
					<section class="flex justify-center">
						<Link href="/create-room" class="btn btn-primary">
							{intl.t("newRoom")}
						</Link>
					</section>
				</div>
			</main>
		</>
	);
};

export default Landing;
