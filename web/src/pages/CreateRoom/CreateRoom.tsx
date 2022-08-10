import { Component, createSignal, Show } from "solid-js";
import Button from "@/components/Button";

import styles from "./CreateRoom.module.scss";
import useCreateRoom from "./hooks/useCreateRoom";

const defaultNumberOfOptions = 5;

const CreateRoom: Component = () => {
	const { fields, updateField, submit } = useCreateRoom();

	const handleSubmit = (event: Event): void => {
		event.preventDefault();
		submit();
	};

	return (
		<main class={styles.createRoom}>
			<form class={styles.createRoomForm} onSubmit={handleSubmit}>
				<label for="moderatorName">
					Your name
					<span class={styles.required}>*</span>
				</label>

				<input name="moderatorName" type="text" onInput={updateField} />

				<div class={styles.seperator}>
					<hr />
				</div>

				<label for="voterOptions">
					What options would you like voters have to choose from?
					<span class={styles.required}>*</span>
				</label>

				<select name="voterOptions" onInput={updateField}>
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
					value={fields.numberOfOptions}
					step="1"
					disabled={fields.disabled}
					onInput={updateField}
				/>

				<label for="noVote">Include no-vote option?</label>

				<label class={styles.radio} for="noVote">
					<input
						type="radio"
						name="noVote"
						value="yes"
						onInput={updateField}
						disabled={fields.disabled}
					/>
					Yes
				</label>

				<label class={styles.radio} for="noVote">
					<input
						type="radio"
						name="noVote"
						value="no"
						onInput={updateField}
						disabled={fields.disabled}
					/>
					No
				</label>

				<div class={styles.finalPreview}>
					<p>Final preview</p>
					<span>{fields.selectedOptions.join(", ")}</span>
				</div>

				<div class={styles.seperator}>
					<hr />
				</div>

				<Show when={fields.error !== null}>
					<p class={styles.error}>Error: {fields.error}</p>
				</Show>

				<Button type="submit" disabled={fields.disabled}>
					Done
				</Button>
			</form>
		</main>
	);
};

export default CreateRoom;
