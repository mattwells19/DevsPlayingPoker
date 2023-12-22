import { Component, Match, Switch, onCleanup } from "solid-js";
import VoterTable from "../components/VoterTable";
import { useRoom } from "../RoomContext";
import { useIntl } from "@/i18n";
import Icon from "@/components/Icon";

interface ModeratorViewProps {
	roomPassword: string | null;
}

const ModeratorView: Component<ModeratorViewProps> = (props) => {
	const intl = useIntl();
	const room = useRoom();

	const broadcaster = new BroadcastChannel("VotingModerator");

	// When the voting window is opened it will send a 'sync' command asking for connetion data
	broadcaster.addEventListener("message", (e) => {
		if (e.data === "sync") {
			broadcaster.postMessage({
				roomCode: room.roomData.roomCode,
				roomPassword: props.roomPassword,
				userName: room.roomData.moderator?.name,
				userId: room.currentUserId,
			});
		}
	});

	// need to let the voting window know we're headed out so it can close
	const cleanup = () => {
		broadcaster.postMessage("close");
		broadcaster.close();
	};
	window.addEventListener("beforeunload", cleanup);
	onCleanup(() => {
		cleanup();
		window.removeEventListener("beforeunload", cleanup);
	});

	return (
		<>
			<Switch>
				<Match when={room.roomData.state === "Results"}>
					<button
						class="btn w-full mb-4 disabled:(opacity-60 hover:bg-brand-orange)"
						onClick={() => room.dispatchEvent({ event: "StartVoting" })}
						type="button"
						disabled={room.roomData.voters.length === 0}
					>
						{intl.t(
							room.roomData.voters.some((voter) => voter.selection !== null)
								? "resetAndStartVoting"
								: "startVoting",
						)}
					</button>
				</Match>
				<Match when={room.roomData.state === "Voting"}>
					<button
						class="btn w-full mb-4"
						onClick={() => room.dispatchEvent({ event: "StopVoting" })}
					>
						{intl.t("stopVoting")}
					</button>
				</Match>
			</Switch>
			<VoterTable />
			<button
				type="button"
				aria-haspopup="true"
				class="btn-outline btn-sm mt-4"
				onClick={() =>
					window.open(
						"/voting-moderator",
						"DPP-Voting-Moderator",
						"popup,width=618,height=1000",
					)
				}
			>
				<span aria-hidden="true">
					<Icon
						name="arrow-top-right-on-square"
						boxSize="18"
						class="mr-2"
						aria-label="Popup"
						stroke-width="2"
					/>
				</span>
				{intl.t("vote")}
			</button>
		</>
	);
};

export default ModeratorView;
