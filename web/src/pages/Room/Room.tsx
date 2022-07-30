import { useNavigate, useParams } from "solid-app-router";
import {
	Component,
	createResource,
	createSignal,
	Match,
	onCleanup,
	onMount,
	Show,
	Switch,
} from "solid-js";
import styles from "./Room.module.scss";
import type { JoinEvent, WebSocketEvent, RoomSchema } from "@/shared-types";
import VoterTable from "./components/VoterTable";
import Button from "@/components/Button";

const RoomCheckWrapper: Component = () => {
	const navigate = useNavigate();
	const { roomCode } = useParams();

	const [done] = createResource(roomCode, () =>
		fetch(`/api/v1/rooms/${roomCode}/checkRoomExists`).then((res) => {
			if (res.status !== 200) {
				navigate("/");
				return false;
			}
			return true;
		}),
	);

	return (
		<Switch fallback={<h1>Loading...</h1>}>
			<Match when={done() === true}>
				<Room roomCode={roomCode} />
			</Match>
		</Switch>
	);
};

interface RoomDetails {
	roomDetails: RoomSchema;
	dispatchEvent: (event: WebSocketEvent) => void;
}

const Room: Component<{ roomCode: string }> = ({ roomCode }) => {
	const navigate = useNavigate();
	const [currentUserId, setCurrentUserId] = createSignal<string | null>(null);
	const [roomDetails, setRoomDetails] = createSignal<RoomDetails | null>(null);

	const userName = localStorage.getItem("name");
	if (!userName) {
		navigate(`/join/${roomCode}`);
		return;
	}

	onMount(() => {
		const wsProtocol = window.location.protocol.includes("https")
			? "wss"
			: "ws";
		const ws = new WebSocket(`${wsProtocol}://${window.location.host}/ws`);

		ws.addEventListener("open", () => {
			const joinPayload: JoinEvent = {
				event: "Join",
				roomCode: roomCode,
				name: userName,
			};

			ws.send(JSON.stringify(joinPayload));
		});

		ws.addEventListener("message", (e) => {
			const data = JSON.parse(e.data) as WebSocketEvent;

			switch (data.event) {
				case "RoomUpdate":
					setRoomDetails({
						roomDetails: data.roomData,
						dispatchEvent: (e) => ws.send(JSON.stringify(e)),
					});
					break;
				case "Connected":
					sessionStorage.setItem("userId", data.userId);
					setCurrentUserId(data.userId);
				default:
					return;
			}
		});

		onCleanup(() => ws.close());
	});

	return (
		<main class={styles.room}>
			<Show when={roomDetails()}>
				{({ roomDetails: details, dispatchEvent }) => (
					<Switch>
						{/* is the current user the moderator? */}
						<Match when={details.moderator?.id === currentUserId()}>
							<Switch>
								<Match when={details.state === "Results"}>
									<Button
										onClick={() => dispatchEvent({ event: "StartVoting" })}
										disabled={details.voters.length === 0}
									>
										{details.voters.some((voter) => voter.selection !== null)
											? "Reset Votes & Start Voting"
											: "Start Voting"}
									</Button>
								</Match>
								<Match when={details.state === "Voting"}>
									<Button
										onClick={() => dispatchEvent({ event: "StopVoting" })}
									>
										Stop Voting
									</Button>
								</Match>
							</Switch>
							<VoterTable roomState={details.state} voters={details.voters} />
						</Match>
						{/* if not the moderator, determine which UI to show based on room state */}
						<Match when={details.state === "Results"}>
							<p>Waiting for {details.moderator?.name}...</p>
							<VoterTable roomState={details.state} voters={details.voters} />
						</Match>
						<Match when={details.state === "Voting"}>
							<div>TODO: card options go here</div>
						</Match>
					</Switch>
				)}
			</Show>
		</main>
	);
};

export default RoomCheckWrapper;
