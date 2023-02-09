import { Component, For, Match, Switch } from "solid-js";
import { useIntl } from "@/i18n";
import OptionCard from "../components/OptionCard";
import VoterTable from "../components/VoterTable";
import { useRoom } from "../RoomContext";

interface VoterViewProps {}

const VoterView: Component<VoterViewProps> = () => {
	const intl = useIntl();
	const room = useRoom();
	const currentVoter = () =>
		room.roomData.voters.find((voter) => voter.id === room.currentUserId);

	return (
		<Switch>
			<Match when={room.roomData.state === "Results"}>
				<p class="font-semibold mb-4 whitespace-nowrap overflow-hidden text-ellipsis">
					{intl.t("waitingForModerator", {
						moderatorName: room.roomData.moderator?.name,
					})}
				</p>
				<VoterTable />
			</Match>
			<Match when={room.roomData.state === "Voting"}>
				<fieldset
					class="flex flex-wrap gap-2 justify-center"
					onchange={(e) => {
						const selection = e.target.hasAttribute("value")
							? (e.target as HTMLInputElement).value
							: null;
						if (!selection) throw new Error("Didn't get a value");

						room.dispatchEvent({
							event: "OptionSelected",
							selection,
						});
					}}
				>
					<legend class="text-lg font-semibold mb-4 text-center w-full">
						{currentVoter()?.selection !== null
							? intl.t("optionSelected")
							: intl.t("makeSelection")}
					</legend>
					<For each={room.roomData.options}>
						{(option) => (
							<OptionCard
								selected={option === currentVoter()?.selection}
								value={option}
							/>
						)}
					</For>
				</fieldset>
			</Match>
		</Switch>
	);
};

export default VoterView;
