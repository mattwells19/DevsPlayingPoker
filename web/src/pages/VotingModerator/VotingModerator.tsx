import Icon from "@/components/Icon";
import { useIntl } from "@/i18n";
import { Component, createSignal, Show } from "solid-js";
import { RoomContextProvider } from "../Room/RoomContext";
import VoterView from "../Room/views/VoterView";
import useWs from "../Room/ws";

const VotingModerator: Component = () => {
	const [details, setDetails] = createSignal<{
		roomCode: string;
		userName: string;
		userId: string;
	} | null>(null);

	const broadcastChannel = new BroadcastChannel("VotingModerator");

	broadcastChannel.postMessage("sync");
	broadcastChannel.addEventListener("message", (e) => {
		if (e.data === "sync") {
			return;
		} else if (e.data === "close") {
			setDetails(null);
		} else if ("roomCode" in e.data) {
			setDetails(e.data);
		}
	});

	return (
		<Show when={details()} keyed fallback={"Waiting for room"}>
			{(d) => (
				<VotingModeratorContent
					userName={d.userName}
					roomCode={d.roomCode}
					userId={d.userId}
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
				<span
					class="tooltip tooltip-right"
					data-tip={intl.t("copyCode") as string}
				>
					<button
						type="button"
						class="btn btn-ghost"
						onClick={() => navigator.clipboard.writeText(props.roomCode)}
						aria-label={intl.t("copyCode") as string}
					>
						<h1 class="text-4xl font-bold">{props.roomCode}</h1>
					</button>
				</span>
			</header>
			<main class="max-w-[30rem] m-auto">
				<button
					type="button"
					class="badge uppercase"
					classList={{
						"badge-success": connStatus() === "connected",
						"badge-warning": connStatus() === "connecting",
						"badge-error": connStatus() === "disconnected",
					}}
					onClick={() => ws().close(3003, "Manual reset.")}
					title={intl.t("manualReset") as string}
				>
					{intl.t(connStatus())}
					<Icon name="refresh" boxSize="14" class="ml-1" />
				</button>
				<RoomContextProvider
					roomDetails={roomDetails}
					roomCode={props.roomCode}
				>
					<VoterView />
				</RoomContextProvider>
			</main>
		</>
	);
};

export default VotingModerator;
