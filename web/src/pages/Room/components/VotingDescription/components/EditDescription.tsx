import { Component, createEffect } from "solid-js";
import { useRoom } from "../../../RoomContext";
import zod from "zod";
import { useIntl } from "@/i18n";

const votingDescSchema = zod
	.string()
	.trim()
	.max(1000)
	.refine((val) => val.split("\n").length - 1 < 10);

interface EditDescriptionProps {
	onStopEditing: () => void;
}

const EditDescription: Component<EditDescriptionProps> = (props) => {
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
			<label for="votingDesc">{intl.t("votingDesc")}</label>
			<textarea
				id="votingDesc"
				name="votingDesc"
				class="input"
				rows="3"
				maxLength="1000"
				autofocus
				ref={(el) => (textareaRef = el)}
				aria-describedby="votingDesc-helper-text"
			>
				{room.roomData.votingDescription}
			</textarea>
			<p class="text-sm" id="votingDesc-helper-text">
				{intl.t("votingDescHelperText")}
			</p>
			<div role="group" class="flex justify-end gap-2 mt-3">
				<button type="submit" class="btn btn-sm">
					{intl.t("update")}
				</button>
				<button
					type="button"
					class="btn-ghost btn-sm"
					onClick={props.onStopEditing}
				>
					{intl.t("cancel")}
				</button>
			</div>
		</form>
	);
};

export default EditDescription;
