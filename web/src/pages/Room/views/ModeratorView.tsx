import { Component, Match, onCleanup, Switch } from "solid-js";
import type {
	KickVoterEvent,
	ModeratorChangeEvent,
	Voter,
} from "@/shared-types";
import VoterTable from "../components/VoterTable";
import type { VoterClickAction } from "../components/VoterTable";
import { useRoom } from "../RoomContext";
import { useIntl } from "@/i18n";
import Icon from "@/components/Icon";

interface ModeratorViewProps {}

const ModeratorView: Component<ModeratorViewProps> = () => {
	const intl = useIntl();
	const room = useRoom();

	const broadcaster = new BroadcastChannel("VotingModerator");

	// if voting window is already listening, push the updates so it will connect
	broadcaster.postMessage({
		roomCode: room.roomData.roomCode,
		userName: room.roomData.moderator?.name,
		userId: room.currentUserId,
	});

	// When the voting window is opened it will send a 'sync' command asking for connetion data
	broadcaster.addEventListener("message", (e) => {
		if (e.data === "sync") {
			broadcaster.postMessage({
				roomCode: room.roomData.roomCode,
				userName: room.roomData.moderator?.name,
				userId: room.currentUserId,
			});
		}
	});

	// need to let the voting window we're headed out so it can disconnect
	const cleanup = () => {
		broadcaster.postMessage("close");
		broadcaster.close();
	};
	window.addEventListener("beforeunload", cleanup);
	onCleanup(() => {
		cleanup();
		window.removeEventListener("beforeunload", cleanup);
	});

	function handleVoterAction(action: VoterClickAction, voter: Voter) {
		const event = (() => {
			switch (action) {
				case "kickVoter":
					return {
						event: "KickVoter",
						voterId: voter.id,
					} as KickVoterEvent;
				case "makeModerator":
					return {
						event: "ModeratorChange",
						newModeratorId: voter.id,
					} as ModeratorChangeEvent;
			}
		})();

		if (event) {
			room.dispatchEvent(event);
		}
	}

	return (
		<>
			<Switch>
				<Match when={room.roomData.state === "Results"}>
					<button
						class="btn btn-primary w-full mb-4"
						onClick={() => room.dispatchEvent({ event: "StartVoting" })}
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
						class="btn btn-primary w-full mb-4"
						onClick={() => room.dispatchEvent({ event: "StopVoting" })}
					>
						{intl.t("stopVoting")}
					</button>
				</Match>
			</Switch>
			<VoterTable onVoterAction={handleVoterAction} />
			<button
				type="button"
				aria-haspopup="true"
				class="btn btn-outline btn-sm mt-4"
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
				Vote
			</button>
		</>
	);
};

export default ModeratorView;
