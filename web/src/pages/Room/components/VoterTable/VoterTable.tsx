import { Component, For, Match, Show, Switch } from "solid-js";
import Metric from "./components/Metric";
import { useRoom } from "../../RoomContext";
import getStats from "./getStats";
import { useIntl } from "@/i18n";
import KickVoterButton from "./components/KickVoterButton";
import TransferModeratorButton from "./components/TransferModeratorButton";
import { Tooltip } from "@/components/Tooltip";
import VoterTableRow from "./components/VoterTableRow";

interface VoterTableProps {}

const VoterTable: Component<VoterTableProps> = () => {
	const intl = useIntl();
	const room = useRoom();

	const stats = () => getStats(room.roomData.voters);

	const votingModerator = () =>
		room.roomData.voters.find(
			(voter) => voter.id === `voter-${room.roomData.moderator?.id}`,
		);

	const voters = () => {
		if (!votingModerator()) {
			return room.roomData.voters;
		}
		return room.roomData.voters.filter(
			(voter) => voter.id !== votingModerator()!.id,
		);
	};

	return (
		<div class="rounded-md overflow-hidden shadow-md dark:shadow-none dark:border border-color">
			<table class="w-full bg-slate-50 dark:bg-brand-navy">
				<Show when={!votingModerator()}>
					<caption class="bg-slate-50 dark:bg-brand-navy p-4">
						<div class="flex justify-between items-center">
							<span class="before:content-['👑'] before:mr-1">
								<Show
									fallback={intl.t("youAreTheModerator")}
									when={!room.userIsModerator}
								>
									{intl.t("xIsTheModerator", {
										moderatorName: room.roomData.moderator?.name,
									})}
								</Show>
							</span>
							<Show when={room.userIsModerator}>
								<TransferModeratorButton options={voters()} />
							</Show>
						</div>
					</caption>
				</Show>
				<thead class="border-b border-color">
					<tr>
						<th colspan="2" class="text-left px-4 py-2">
							{intl.t("voters")}
						</th>
						<th class="px-4 py-2">{intl.t("voted")}</th>
						<th class="px-4 py-2">{intl.t("confidence")}</th>
					</tr>
				</thead>
				<tbody>
					<Show when={votingModerator()} keyed>
						{(votingModerator) => (
							<VoterTableRow
								name={
									<Tooltip
										arrow
										tip={intl.t("xIsVotingModerator", {
											moderatorName: room.roomData.moderator?.name,
										})}
										positioning={{ placement: "top-start" }}
									>
										<span class="before:content-['👑'] before:mr-1">
											{room.roomData.moderator?.name}
										</span>
									</Tooltip>
								}
								confidence={votingModerator.confidence}
								selection={votingModerator.selection}
								hiddenAction={<TransferModeratorButton options={voters()} />}
							/>
						)}
					</Show>
					<For each={voters()}>
						{(voter) => (
							<VoterTableRow
								name={voter.name}
								confidence={voter.confidence}
								selection={voter.selection}
								hiddenAction={<KickVoterButton voter={voter} />}
							/>
						)}
					</For>
				</tbody>
				<tfoot class="text-center border-t border-color">
					<tr>
						<Switch>
							<Match when={room.roomData.state === "Voting"}>
								<td colspan="4" class="p-4">
									{intl.t("votingInProgress")}
								</td>
							</Match>
							<Match
								when={
									room.roomData.state === "Results" &&
									room.roomData.voters.every(
										(voter) => voter.selection === null,
									)
								}
							>
								<td colspan="4" class="p-4">
									{intl.t(
										room.roomData.voters.length > 0
											? "waitingToStartVoting"
											: "waitingForVoters",
									)}
								</td>
							</Match>
							<Match
								when={
									room.roomData.state === "Results" &&
									room.roomData.voters.every(
										(voter) => voter.selection === "N/A",
									)
								}
							>
								<td colspan="4" class="p-4">
									{intl.t("noVotes")}
								</td>
							</Match>
							<Match when={room.roomData.state === "Results"}>
								<For each={stats()}>
									{(stat) => <Metric class="p-4" {...stat} />}
								</For>
							</Match>
						</Switch>
					</tr>
				</tfoot>
			</table>
		</div>
	);
};

export default VoterTable;
