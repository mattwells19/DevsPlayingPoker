import { IntlKey, useIntl } from "@/i18n";
import { useRoom } from "@/pages/Room/RoomContext";
import { ConfidenceValue, Voter } from "@/shared-types";
import { Component, JSXElement, Show } from "solid-js";

export const ConfidenceEmojiMap: Record<ConfidenceValue, string> = {
	[ConfidenceValue.high]: "💪",
	[ConfidenceValue.medium]: "😌",
	[ConfidenceValue.low]: "😰",
};

export const ConfidenceTextMap: Record<ConfidenceValue, IntlKey> = {
	[ConfidenceValue.high]: "highConfidence",
	[ConfidenceValue.medium]: "mediumConfidence",
	[ConfidenceValue.low]: "lowConfidence",
};

function formatSelection(selection: string | null): string {
	if (selection === null || selection === "N/A") {
		return "☕";
	}

	return selection;
}

interface VoterTableRowProps {
	name: JSXElement;
	selection: Voter["selection"];
	confidence: Voter["confidence"];
	hiddenAction: JSXElement;
}

const VoterTableRow: Component<VoterTableRowProps> = (props) => {
	const room = useRoom();
	const intl = useIntl();

	return (
		<tr>
			<td colspan="2" class="p-4" classList={{ "py-3": room.userIsModerator }}>
				<div class="flex items-center justify-between group">
					{props.name}
					<Show when={room.userIsModerator}>{props.hiddenAction}</Show>
				</div>
			</td>
			<td class="text-center">
				{room.roomData.state === "Results"
					? formatSelection(props.selection)
					: props.selection !== null
					? "✅"
					: "❌"}
			</td>
			<td
				class="text-center"
				title={
					intl.t(
						props.confidence !== null
							? ConfidenceTextMap[props.confidence]
							: "waitingForSelection",
					) as string
				}
			>
				{props.confidence !== null
					? ConfidenceEmojiMap[props.confidence]
					: "❓"}
			</td>
		</tr>
	);
};

export default VoterTableRow;
