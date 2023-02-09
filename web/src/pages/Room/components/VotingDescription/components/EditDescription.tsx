import { Component, createEffect } from "solid-js";
import { useRoom } from "../../../RoomContext";
import zod from "zod";
import { useIntl } from "@/i18n";

const votingDescSchema = zod
	.string()
	.trim()
	.max(1000)
	.refine((val) => val.split("\n").length - 1 < 10);

const EditDescription: Component<{ onStopEditing: () => void }> = (props) => {
	const intl = useIntl();
	const room = useRoom();
	let textareaRef: HTMLTextAreaElement | null = null;

	createEffect(() => {
		if (textareaRef) {
			textareaRef.focus();
			textareaRef.setSelectionRange(0, -1);
		}
	});

	return (
		<form
			class="form-control my-10"
			onSubmit={(e) => {
				e.preventDefault();
				const formData = new FormData(e.currentTarget);
				const votingDesc = formData.get("votingDesc")?.toString();
				const schemaCheck = votingDescSchema.safeParse(votingDesc);

				if (schemaCheck.success) {
					if (schemaCheck.data !== room.roomData.votingDescription) {
						room.dispatchEvent({
							event: "UpdateVotingDescription",
							value: schemaCheck.data,
						});
					}
					props.onStopEditing();
				}
			}}
		>
			<label for="votingDesc" class="label">
				{intl.t("votingDesc")}
			</label>
			<textarea
				id="votingDesc"
				name="votingDesc"
				class="textarea textarea-bordered"
				rows="3"
				maxLength="300"
				autofocus
				ref={(el) => (textareaRef = el)}
				aria-describedby="votingDesc-helper-text"
			>
				{room.roomData.votingDescription}
			</textarea>
			<p class="label label-text-alt" id="votingDesc-helper-text">
				{intl.t("votingDescHelperText")}
			</p>
			<div role="group" class="flex justify-end gap-2">
				<button type="submit" class="btn btn-primary btn-sm">
					{intl.t("update")}
				</button>
				<button
					type="button"
					class="btn btn-ghost btn-sm"
					onClick={props.onStopEditing}
				>
					{intl.t("cancel")}
				</button>
			</div>
		</form>
	);
};

export default EditDescription;
