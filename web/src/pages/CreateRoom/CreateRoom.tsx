import { Component, createSignal, onMount, Show } from "solid-js";
import { useNavigate } from "solid-app-router";
import post from "@/utils/post";
import Button from "@/components/Button";
import styles from "./CreateRoom.module.scss";
import Header from "@/components/Header";
import zod from "zod";

const createRoomSchema = zod.object({
	voterOptions: zod.enum(["fibonacci", "linear"]),
	numberOfOptions: zod.number().min(2).max(15),
	noVote: zod.boolean(),
});

const createRoomWithNameSchema = createRoomSchema.extend({
	moderatorName: zod
		.string()
		.min(1, { message: "Must provide a value for name." })
		.max(10, { message: "Name too long. Must be no more than 10 characters." }),
});

function safeJSONParse<T>(value: string): T | undefined {
	try {
		return JSON.parse(value);
	} catch {
		return undefined;
	}
}

const options = {
	fibonacci: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987],
	linear: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
};

function getFormValues(form: HTMLFormElement) {
	const formData = new FormData(form);

	return {
		moderatorName: formData.get("moderatorName") as string,
		voterOptions: formData.get("voterOptions") as "" | "fibonacci" | "linear",
		numberOfOptions: parseInt(formData.get("numberOfOptions")!.toString(), 10),
		noVote: formData.get("noVote") === "yes",
	};
}

const CreateRoom: Component = () => {
	const [list, setList] = createSignal<string>("");
	const [error, setError] = createSignal<string | null>(null);
	const navigate = useNavigate();

	const defaultName = localStorage.getItem("name") ?? "";
	const rawSavedFormValues = localStorage.getItem("newRoomFields");
	const parsedSavedFormValues = rawSavedFormValues
		? safeJSONParse(rawSavedFormValues)
		: undefined;

	const createRoomSchemaCheck = createRoomSchema.safeParse(
		parsedSavedFormValues,
	);
	const defaultFormValues = createRoomSchemaCheck.success
		? createRoomSchemaCheck.data
		: undefined;

	const handleSubmit = (form: EventTarget & HTMLFormElement): void => {
		const formData = getFormValues(form);
		let fieldOptions: Array<number> = [];

		if (!formData.voterOptions) {
			return;
		}
		if (formData.voterOptions === "fibonacci") {
			fieldOptions = options.fibonacci.slice(0, formData.numberOfOptions);
		} else if (formData.voterOptions === "linear") {
			fieldOptions = options.linear.slice(0, formData.numberOfOptions);
		}

		if (formData.noVote) {
			fieldOptions = [0, ...fieldOptions];
		}

		const createRoomWithNameSchemaCheck =
			createRoomWithNameSchema.safeParse(formData);

		if (!createRoomWithNameSchemaCheck.success) {
			const allErrorMessages =
				createRoomWithNameSchemaCheck.error.flatten().fieldErrors;

			const singleErrorMessage = Object.entries(allErrorMessages)
				.map(([key, value]) => `${key}: ${value.join("; ")}`)
				.join("\n");

			setError(singleErrorMessage);
			return;
		}

		post("/api/v1/create", { options: fieldOptions })
			.then((res) => {
				localStorage.setItem("newRoomFields", JSON.stringify(formData));
				localStorage.setItem("name", formData.moderatorName);
				navigate(`/room/${res.roomCode}`);
			})
			.catch((err) => setError(err));
	};

	const handleChange = (form: EventTarget & HTMLFormElement) => {
		const { voterOptions, noVote, numberOfOptions } = getFormValues(form);
		let fieldOptions: Array<number> = [];

		if (voterOptions === "") {
			setList("");
			return;
		}

		if (voterOptions === "fibonacci") {
			fieldOptions = options.fibonacci.slice(0, numberOfOptions);
		} else if (voterOptions === "linear") {
			fieldOptions = options.linear.slice(0, numberOfOptions);
		}

		const updatedList = fieldOptions.join(", ");
		if (noVote) {
			setList(updatedList + ", 🚫");
		} else {
			setList(updatedList);
		}
	};

	onMount(() => {
		if (!defaultFormValues) return;

		const { voterOptions, noVote, numberOfOptions } = defaultFormValues;
		let fieldOptions: Array<number> = [];

		if (voterOptions === "fibonacci") {
			fieldOptions = options.fibonacci.slice(0, numberOfOptions);
		} else if (voterOptions === "linear") {
			fieldOptions = options.linear.slice(0, numberOfOptions);
		}

		const updatedList = fieldOptions.join(", ");
		if (noVote) {
			setList(updatedList + ", 🚫");
		} else {
			setList(updatedList);
		}
	});

	return (
		<>
			<Header />
			<main class={styles.createRoom}>
				<form
					class={styles.createRoomForm}
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
							value={defaultName}
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
							name="voterOptions"
							required
							value={defaultFormValues?.voterOptions ?? ""}
						>
							<option value="">Select options</option>
							<option value="fibonacci">Fibonacci</option>
							<option value="linear">Linear</option>
						</select>
					</div>

					<div>
						<label for="numberOfOptions">
							Number of options (min: 2, max: 15)
						</label>
						<input
							type="range"
							id="numberOfOptions"
							name="numberOfOptions"
							min="2"
							max="15"
							step="1"
							value={defaultFormValues?.numberOfOptions}
						/>
					</div>

					<fieldset>
						<legend>Include no-vote option?</legend>

						<label class={styles.radio}>
							<input
								type="radio"
								name="noVote"
								value="yes"
								checked={defaultFormValues && defaultFormValues.noVote}
							/>
							Yes
						</label>

						<label class={styles.radio}>
							<input
								type="radio"
								name="noVote"
								value="no"
								checked={!defaultFormValues || !defaultFormValues.noVote}
							/>
							No
						</label>
					</fieldset>

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
