import { useNavigate, useParams } from "solid-app-router";
import {
	Component,
	createMemo,
	createResource,
	createSignal,
	For,
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
import OptionCard from "@/components/OptionCard";

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

	// the user object of the current user if they're a voter. null if they're the moderator
	const currentVoter = createMemo(
		() =>
			roomDetails()?.roomDetails.voters.find(
				(voter) => voter.id === currentUserId(),
			) ?? null,
	);

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
							<fieldset
								onchange={(e) => {
									const selectionValue = e.target.hasAttribute("value")
										? (e.target as HTMLInputElement).value
										: null;
									if (!selectionValue) throw new Error("Didn't get a value");
									const selection = parseInt(selectionValue, 10);

									dispatchEvent({
										event: "OptionSelected",
										selection,
									});
								}}
							>
								<legend>
									{currentVoter()?.selection !== null
										? "Got it! You can change your mind if you want. Otherwise sit tight."
										: "Make a selection"}
								</legend>
								<For each={details.options}>
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
				)}
			</Show>
		</main>
	);
};

export default RoomCheckWrapper;
