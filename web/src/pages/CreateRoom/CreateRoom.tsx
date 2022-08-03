import { Component, createSignal } from "solid-js";
import Button from "@/components/Button";

import styles from "./CreateRoom.module.scss";

const options = {
	fibonacci: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987],
	linear: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
	select: [],
};

const defaultNumberOfOptions = 5;

const CreateRoom: Component = () => {
	// maybe move to a store?
	const [moderatorName, setModeratorName] = createSignal("");
	const [selectedOptions, setSelectedOptions] = createSignal([]);
	const [voterOptions, setVoterOptions] = createSignal([]);
	const [numberOfOptions, setNumberOfOptions] = createSignal(
		defaultNumberOfOptions,
	);

	const onFormSubmit = async (e) => {
		const postBody = {
			moderatorName: moderatorName(),
			options: selectedOptions(),
		};

		const requestOptions = {
			method: "POST",
			body: JSON.stringify(postBody),
		};

		// add error handling
		// add state after room creation
		await fetch("/api/v1/create", requestOptions);
	};

	const formOnInput = (e) => {
		switch (e.target.name) {
			case "moderatorName":
				setModeratorName(e.target.value);
				break;
			case "voterOptions": {
				const voterOptionsValue = e.target.value;
				const currentOptions = options[voterOptionsValue];
				const limitedOptions = currentOptions.slice(0, numberOfOptions());
				setVoterOptions(voterOptionsValue);
				setSelectedOptions(limitedOptions);
				break;
			}
			case "numberOfOptions": {
				const currentVoterOptions = options[voterOptions()];
				const numberOfOptionsValue = e.target.value;
				const limitedOptions = currentVoterOptions.slice(
					0,
					numberOfOptionsValue,
				);
				setNumberOfOptions(numberOfOptionsValue);
				setSelectedOptions(limitedOptions);
				break;
			}
			case "select":
				setSelectedOptions([]);
				break;
			default:
				break;
		}
	};

	return (
		<main class={styles.createRoom}>
			<section class={styles.createRoomForm}>
				<label for="moderatorName">
					Your name
					<span class={styles.required}>*</span>
				</label>

				<input name="moderatorName" type="text" onInput={formOnInput} />

				<div class={styles.seperator}>
					<hr />
				</div>

				<label for="voterOptions">
					What options would you like voters have to choose from?
					<span class={styles.required}>*</span>
				</label>

				<select name="voterOptions" onInput={formOnInput}>
					<option value="select">Select options</option>
					<option value="fibonacci">Fibonacci</option>
					<option value="linear">Linear</option>
				</select>

				<label for="numberOfOptions">Number of options</label>

				<input
					type="range"
					name="numberOfOptions"
					min="2"
					max="15"
					value={numberOfOptions()}
					step="1"
					onInput={formOnInput}
				/>

				{/* <p>Include no-vote option?</p>
				<input type="radio" name="noVote" value="yes" onInput={formOnInput} />
				<label for="noVote">Yes</label>

				<input type="radio" name="noVote" value="no" checked onInput={formOnInput} />
				<label for="noVote">No</label> */}

				<div class={styles.finalPreview}>
					<p>Final preview</p>
					<span>{selectedOptions().join(", ")}</span>
				</div>

				<div class={styles.seperator}>
					<hr />
				</div>

				<Button onClick={onFormSubmit}>Done</Button>
			</section>
		</main>
	);
};

export default CreateRoom;
