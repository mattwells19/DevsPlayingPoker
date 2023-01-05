import { Component, createEffect, createSignal, Show } from "solid-js";
import { useNavigate } from "solid-app-router";
import RangeSlider from "./components/RangeSlider";
import post from "@/utils/post";
import Button from "@/components/Button";
import Header from "@/components/Header";
import styles from "./CreateRoom.module.scss";
import {
	getOptions,
	getFormValues,
	getDefaultValues,
	availableOptions,
} from "./CreateRoom.utils";
import {
	nameSchema,
	optionsSchemaMap,
	CreateRoomFields,
} from "./CreateRoom.schemas";

const CreateRoom: Component = () => {
	const defaults = getDefaultValues();
	let formRef: HTMLFormElement;
	const [list, setList] = createSignal<string>(defaults.list);
	const [optionsSelect, setOptionsSelect] = createSignal<
		CreateRoomFields["voterOptions"]
	>(defaults.formValues.voterOptions);
	const [error, setError] = createSignal<string | null>(null);
	const navigate = useNavigate();

	const handleSubmit = (form: EventTarget & HTMLFormElement): void => {
		const formData = getFormValues(form);

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

		const options = getOptions(optionsSelect(), formData.numberOfOptions);

		if (formData.noVote) {
			options.push("🚫");
		}

		setList(options.join(", "));
	};

	createEffect(() => {
		const formData = getFormValues(formRef);

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
							value={defaults.formValues.voterOptions}
						>
							<option value="fibonacci">Fibonacci</option>
							<option value="linear">Linear</option>
							<option value="yesNo">Yes/No</option>
						</select>
					</div>

					<Show when={optionsSelect() !== "yesNo"}>
						<RangeSlider
							id="numberOfOptions"
							name="numberOfOptions"
							label={`Number of options (min: ${
								availableOptions[optionsSelect()][0]
							}, max: ${availableOptions[optionsSelect()].slice(-1)})`}
							min={0}
							max={15}
							step={1}
							value={defaults.formValues.numberOfOptions ?? undefined}
						/>

						<fieldset>
							<legend>Include no-vote option?</legend>

							<label class={styles.radio}>
								<input
									type="radio"
									name="noVote"
									value="yes"
									checked={defaults.formValues.noVote}
								/>
								Yes
							</label>

							<label class={styles.radio}>
								<input
									type="radio"
									name="noVote"
									value="no"
									checked={!defaults.formValues.noVote}
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
