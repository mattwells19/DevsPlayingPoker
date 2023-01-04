import { Component, createEffect, createSignal, Show } from "solid-js";
import { useNavigate } from "solid-app-router";
import RangeSlider from "./components/RangeSlider";
import post from "@/utils/post";
import Button from "@/components/Button";
import Header from "@/components/Header";
import styles from "./CreateRoom.module.scss";
import {
	getOptions,
	VoterOptions,
	getFormValues,
	getDefaultValues,
} from "./CreateRoom.utils";
import { nameSchema, optionsSchemaMap } from "./CreateRoom.schemas";

const CreateRoom: Component = () => {
	const defaults = getDefaultValues();
	let formRef: HTMLFormElement;
	const [list, setList] = createSignal<string>(defaults.list);
	const [optionsSelect, setOptionsSelect] = createSignal<VoterOptions>(
		defaults.formValues?.voterOptions ?? "",
	);
	const [error, setError] = createSignal<string | null>(null);
	const navigate = useNavigate();

	const handleSubmit = (form: EventTarget & HTMLFormElement): void => {
		const formData = getFormValues(form);

		if (formData.voterOptions === "") {
			return;
		}

		const schemaCheck = optionsSchemaMap[formData.voterOptions]
			.extend(nameSchema)
			.safeParse(formData);

		if (!schemaCheck.success) {
			const allErrorMessages = schemaCheck.error.flatten().fieldErrors;

			const singleErrorMessage = Object.entries(allErrorMessages)
				.map(([key, value]) => `${key}: ${value.join("; ")}`)
				.join("\n");

			setError(singleErrorMessage);
			return;
		}

		const options = getOptions(formData.voterOptions, formData.numberOfOptions);

		if (formData.noVote) {
			options.unshift("N/A");
		}

		post("/api/v1/create", { options })
			.then((res) => {
				localStorage.setItem("newRoomFields", JSON.stringify(formData));
				localStorage.setItem("name", formData.moderatorName);
				navigate(`/room/${res.roomCode}`);
			})
			.catch((err) => setError(err));
	};

	const handleChange = (form: EventTarget & HTMLFormElement) => {
		const formData = getFormValues(form);
		setError(null);

		if (optionsSelect() !== formData.voterOptions) {
			// allow the effect to set the values since elements may need to be mounted
			setOptionsSelect(formData.voterOptions);
			return;
		}

		if (optionsSelect() === "") {
			setList("");
			return;
		}

		const options = getOptions(optionsSelect(), formData.numberOfOptions);

		if (formData.noVote) {
			options.push("🚫");
		}

		setList(options.join(", "));
	};

	createEffect(() => {
		const formData = getFormValues(formRef);

		if (optionsSelect() === "") {
			setList("");
			return;
		}

		const options = getOptions(optionsSelect(), formData.numberOfOptions);

		if (formData.noVote) {
			options.push("🚫");
		}

		setList(options.join(", "));
	});

	return (
		<>
			<Header />
			<main class={styles.createRoom}>
				<form
					class={styles.createRoomForm}
					ref={(el) => (formRef = el)}
					onInput={(e) => handleChange(e.currentTarget)}
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit(e.currentTarget);
					}}
				>
					<div>
						<label for="moderatorName">
							Your name
							<span class={styles.required}>*</span>
						</label>
						<input
							autofocus
							id="moderatorName"
							name="moderatorName"
							required
							minLength="1"
							maxLength="10"
							type="text"
							value={defaults.name}
						/>
					</div>

					<div class={styles.seperator}>
						<hr />
					</div>

					<div>
						<label for="voterOptions">
							What options would you like voters to have to choose from?
							<span class={styles.required}>*</span>
						</label>
						<select
							id="voterOptions"
							name="voterOptions"
							required
							value={defaults.formValues?.voterOptions ?? ""}
						>
							<option value="">Select options</option>
							<option value="fibonacci">Fibonacci</option>
							<option value="linear">Linear</option>
							<option value="yesNo">Yes/No</option>
						</select>
					</div>

					<Show when={optionsSelect() !== "yesNo"}>
						<div>
							<label for="numberOfOptions">
								Number of options (min: 2, max: 15)
							</label>
							<RangeSlider
								id="numberOfOptions"
								name="numberOfOptions"
								min={0}
								max={14}
								step={1}
								value={defaults.formValues?.numberOfOptions ?? undefined}
							/>
						</div>

						<fieldset>
							<legend>Include no-vote option?</legend>

							<label class={styles.radio}>
								<input
									type="radio"
									name="noVote"
									value="yes"
									checked={defaults.formValues && defaults.formValues.noVote}
								/>
								Yes
							</label>

							<label class={styles.radio}>
								<input
									type="radio"
									name="noVote"
									value="no"
									checked={!defaults.formValues || !defaults.formValues.noVote}
								/>
								No
							</label>
						</fieldset>
					</Show>

					<dl class={styles.finalPreview}>
						<dt>Final preview</dt>
						<dd>{list}</dd>
					</dl>

					<div class={styles.seperator}>
						<hr />
					</div>

					<Show when={error()} keyed>
						{(errorMsg) => <p class={styles.error}>Error: {errorMsg}</p>}
					</Show>

					<Button type="submit">Done</Button>
				</form>
			</main>
		</>
	);
};

export default CreateRoom;
