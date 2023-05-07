import { useIntl } from "@/i18n";
import { Component, createSignal, Show } from "solid-js";
import { RoomContextProvider } from "../Room/RoomContext";
import VoterView from "../Room/views/VoterView";
import useWs from "../Room/ws";
import ConnectionStatusBadge from "../Room/components/ConnectionStatusBadge";
import { Tooltip } from "@/components/Tooltip";
import VotingDescription from "../Room/components/VotingDescription";

const VotingModerator: Component = () => {
	const [details, setDetails] = createSignal<{
		roomCode: string;
		userName: string;
		userId: string;
	} | null>(null);

	const broadcastChannel = new BroadcastChannel("VotingModerator");

	// ask the moderator window for the room data
	broadcastChannel.postMessage("sync");
	broadcastChannel.addEventListener("message", (e) => {
		if (e.data === "close") {
			// if moderator window is dipping it's time for us to go 💀
			window.close();
		} else if (typeof e.data === "object" && "roomCode" in e.data) {
			setDetails(e.data);
		}
	});

	return (
		<Show when={details()} fallback={"Waiting for room"}>
			{(d) => (
				<VotingModeratorContent
					userName={d().userName}
					roomCode={d().roomCode}
					userId={d().userId}
				/>
			)}
		</Show>
	);
};

interface VotingModeratorContentProps {
	userName: string;
	roomCode: string;
	userId: string;
}

const VotingModeratorContent: Component<VotingModeratorContentProps> = (
	props,
) => {
	const intl = useIntl();
	const { ws, connStatus, roomDetails } = useWs({
		userName: props.userName,
		roomCode: props.roomCode,
		initialUserId: `voter-${props.userId}`,
		onNewUserId: () => {},
	});

	return (
		<>
			<header class="flex justify-center">
				<Tooltip
					arrow
					tip={intl.t("copyCode")}
					positioning={{ placement: "right" }}
				>
					<button
						type="button"
						class="btn btn-ghost"
						onClick={() =>
							navigator.clipboard.writeText(roomDetails.roomData.roomCode)
						}
						aria-label={intl.t("copyCode") as string}
					>
						<h1 class="text-4xl font-bold">{roomDetails.roomData.roomCode}</h1>
					</button>
				</Tooltip>
			</header>
			<main class="max-w-[30rem] m-auto">
				<ConnectionStatusBadge
					connStatus={connStatus()}
					onReset={() => ws().close(3003, "Manual reset.")}
				/>
				<RoomContextProvider
					roomDetails={roomDetails}
					roomCode={props.roomCode}
				>
					<VotingDescription />
					<VoterView />
				</RoomContextProvider>
			</main>
		</>
	);
};

export default VotingModerator;
