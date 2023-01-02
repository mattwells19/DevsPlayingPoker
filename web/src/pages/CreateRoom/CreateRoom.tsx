import { Component, createSignal, onMount, Show } from "solid-js";
import { useNavigate } from "solid-app-router";
import post from "@/utils/post";
import Button from "@/components/Button";
import styles from "./CreateRoom.module.scss";
import Header from "@/components/Header";
import zod from "zod";
import type { RoomSchema } from "@/shared-types";

const numberPatternSchema = zod.object({
	voterOptions: zod.enum(["fibonacci", "linear"]),
	// 15 from slider + 1 no-vote option
	numberOfOptions: zod
		.number()
		.min(2)
		.max(15 + 1),
	noVote: zod.boolean(),
});

const rightSizeSchema = zod.object({
	voterOptions: zod.literal("yes-no"),
	options: zod.tuple([zod.literal("Yes"), zod.literal("No")]),
});

const nameSchema = {
	moderatorName: zod
		.string()
		.min(1, { message: "Must provide a value for name." })
		.max(10, { message: "Name too long. Must be no more than 10 characters." }),
};

function safeJSONParse<T>(value: string): T | undefined {
	try {
		return JSON.parse(value);
	} catch {
		return undefined;
	}
}

const availableOptions = {
	fibonacci: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987],
	linear: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
	yesNo: ["Yes", "No"],
};

type VoterOptions = "" | "fibonacci" | "linear" | "yes-no";

function getFormValues(form: HTMLFormElement) {
	const formData = new FormData(form);

	const moderatorName = formData.get("moderatorName") as string;
	const voterOptions = formData.get("voterOptions") as VoterOptions;

	if (voterOptions === "yes-no") {
		return {
			moderatorName,
			voterOptions,
			options: availableOptions.yesNo,
		};
	} else {
		const numberOfOptions = formData.get("numberOfOptions")?.toString();
		const noVote = formData.get("noVote");

		return {
			moderatorName,
			voterOptions,
			numberOfOptions: numberOfOptions ? parseInt(numberOfOptions, 10) : 8,
			noVote: noVote ? noVote === "yes" : false,
		};
	}
}

const CreateRoom: Component = () => {
	const defaultName = localStorage.getItem("name") ?? "";
	const defaultFormValues = (() => {
		const rawSavedFormValues = localStorage.getItem("newRoomFields");
		const parsedSavedFormValues = rawSavedFormValues
			? safeJSONParse(rawSavedFormValues)
			: undefined;

		const numPatternSchemaCheck = numberPatternSchema.safeParse(
			parsedSavedFormValues,
		);

		if (numPatternSchemaCheck.success) {
			return numPatternSchemaCheck.data;
		}

		const rightSizeSchemaCheck = rightSizeSchema.safeParse(
			parsedSavedFormValues,
		);
		if (rightSizeSchemaCheck.success) {
			return rightSizeSchemaCheck.data;
		}

		return undefined;
	})();

	const defaultList = (() => {
		if (!defaultFormValues) return "";

		const { voterOptions } = defaultFormValues;

		if (voterOptions === "yes-no") {
			return availableOptions.yesNo.join(", ");
		}

		let fieldOptions: RoomSchema["options"] = [];

		if (voterOptions === "fibonacci") {
			fieldOptions = availableOptions.fibonacci.slice(
				0,
				defaultFormValues.numberOfOptions,
			);
		} else if (voterOptions === "linear") {
			fieldOptions = availableOptions.linear.slice(
				0,
				defaultFormValues.numberOfOptions,
			);
		}

		const updatedList = fieldOptions.join(", ");
		if (defaultFormValues.noVote) {
			return updatedList + ", 🚫";
		} else {
			return updatedList;
		}
	})();

	const [list, setList] = createSignal<string>(defaultList);
	const [optionsSelect, setOptionsSelect] = createSignal<VoterOptions>(
		defaultFormValues ? defaultFormValues.voterOptions : "",
	);
	const [error, setError] = createSignal<string | null>(null);
	const navigate = useNavigate();

	const handleSubmit = (form: EventTarget & HTMLFormElement): void => {
		const formData = getFormValues(form);

		if (!formData.voterOptions) {
			return;
		}

		const schemaCheck = (
			formData.voterOptions === "yes-no" ? rightSizeSchema : numberPatternSchema
		)
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

		const finalOptions = (() => {
			if (formData.voterOptions === "yes-no") {
				return availableOptions.yesNo;
			}

			let fieldOptions: Array<number> = [];

			if (formData.voterOptions === "fibonacci") {
				fieldOptions = availableOptions.fibonacci.slice(
					0,
					formData.numberOfOptions,
				);
			} else if (formData.voterOptions === "linear") {
				fieldOptions = availableOptions.linear.slice(
					0,
					formData.numberOfOptions,
				);
			}

			if (formData.noVote) {
				fieldOptions = [0, ...fieldOptions];
			}

			return fieldOptions;
		})();

		post("/api/v1/create", { options: finalOptions })
			.then((res) => {
				localStorage.setItem("newRoomFields", JSON.stringify(formData));
				localStorage.setItem("name", formData.moderatorName);
				navigate(`/room/${res.roomCode}`);
			})
			.catch((err) => setError(err));
	};

	const handleChange = (form: EventTarget & HTMLFormElement) => {
		const { voterOptions, noVote, numberOfOptions } = getFormValues(form);
		setError(null);
		setOptionsSelect(voterOptions);

		if (voterOptions === "") {
			setList("");
			return;
		}

		if (voterOptions === "yes-no") {
			setList(availableOptions.yesNo.join(", "));
			return;
		}

		let fieldOptions: RoomSchema["options"] = [];

		if (voterOptions === "fibonacci") {
			fieldOptions = availableOptions.fibonacci.slice(0, numberOfOptions);
		} else if (voterOptions === "linear") {
			fieldOptions = availableOptions.linear.slice(0, numberOfOptions);
		}

		const updatedList = fieldOptions.join(", ");
		if (noVote) {
			setList(updatedList + ", 🚫");
		} else {
			setList(updatedList);
		}
	};

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
							id="voterOptions"
							name="voterOptions"
							required
							value={defaultFormValues?.voterOptions ?? ""}
						>
							<option value="">Select options</option>
							<option value="fibonacci">Fibonacci</option>
							<option value="linear">Linear</option>
							<option value="yes-no">Yes/No</option>
						</select>
					</div>

					<Show when={optionsSelect() !== "yes-no"}>
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
								value={
									defaultFormValues?.voterOptions !== "yes-no"
										? defaultFormValues?.numberOfOptions
										: ""
								}
							/>
						</div>

						<fieldset>
							<legend>Include no-vote option?</legend>

							<label class={styles.radio}>
								<input
									type="radio"
									name="noVote"
									value="yes"
									checked={
										defaultFormValues &&
										defaultFormValues.voterOptions !== "yes-no" &&
										defaultFormValues.noVote
									}
								/>
								Yes
							</label>

							<label class={styles.radio}>
								<input
									type="radio"
									name="noVote"
									value="no"
									checked={
										!defaultFormValues ||
										defaultFormValues.voterOptions === "yes-no" ||
										!defaultFormValues.noVote
									}
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
