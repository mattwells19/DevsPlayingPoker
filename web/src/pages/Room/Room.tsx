import { Link, useNavigate, useParams } from "solid-app-router";
import {
	Component,
	createResource,
	createSignal,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import { createStore } from "solid-js/store";
import styles from "./Room.module.scss";
import type { WebSocketEvent, RoomSchema } from "@/shared-types";
import ModeratorView from "./views/moderator";
import VoterView from "./views/voter/VoterView";
import Header from "@/components/Header";

const RoomCheckWrapper: Component = () => {
	const navigate = useNavigate();
	const { roomCode } = useParams();
	const [manualShow, setManualShow] = createSignal(true);

	const handleReset = () => {
		setManualShow(true);
		setManualShow(false);
	};

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
		<>
			<Header className={styles.header}>
				<div class={styles.homeLinkContainer}>
					<Link href="/">Home</Link>
				</div>
				<button
					class={styles.roomCodeBtn}
					onClick={() => navigator.clipboard.writeText(roomCode)}
					title="Click to copy code."
				>
					<h1>{roomCode}</h1>
				</button>
			</Header>
			<Show when={done() && manualShow()} fallback={<h1>Checking room...</h1>}>
				<Room roomCode={roomCode} resetConnection={handleReset} />
			</Show>
		</>
	);
};

interface RoomDetails {
	currentUserId: string;
	roomData: RoomSchema;
	dispatchEvent: (event: WebSocketEvent) => void;
}

interface EmptyRoomDetails {
	currentUserId: "";
	roomData: null;
	dispatchEvent: () => void;
}

interface RoomProps {
	roomCode: string;
	resetConnection: () => void;
}

const Room: Component<RoomProps> = ({ roomCode, resetConnection }) => {
	const navigate = useNavigate();
	const [roomDetails, setRoomDetails] = createStore<
		RoomDetails | EmptyRoomDetails
	>({
		currentUserId: "",
		dispatchEvent: () => null,
		roomData: null,
	});

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
			ws.send(
				JSON.stringify({
					event: "Join",
					roomCode: roomCode,
					name: userName,
				}),
			);
		});

		ws.addEventListener("message", (messageEvent) => {
			const data = JSON.parse(messageEvent.data) as WebSocketEvent;

			switch (data.event) {
				case "RoomUpdate":
					setRoomDetails({
						roomData: data.roomData,
						dispatchEvent: (e) => ws.send(JSON.stringify(e)),
					});
					break;
				case "Connected":
					sessionStorage.setItem("userId", data.userId);
					setRoomDetails({ currentUserId: data.userId });
				default:
					return;
			}
		});

		ws.addEventListener("close", (closeEvent) => {
			// 1000 means closed normally
			if (closeEvent.code !== 1000) {
				resetConnection();
			} else {
				console.error(closeEvent.reason);
			}
		});

		onCleanup(() => {
			ws.close();
		});
	});

	return (
		<main class={styles.room}>
			<Show
				when={
					roomDetails.currentUserId && roomDetails.roomData
						? ([
								roomDetails.currentUserId,
								roomDetails.roomData,
								roomDetails.dispatchEvent,
						  ] as const)
						: null
				}
				fallback={<p>Connecting...</p>}
				keyed
			>
				{([currentUserId, roomData, dispatchEvent]) => (
					<Show
						// is the current user the moderator?
						when={roomData.moderator?.id === currentUserId}
						fallback={
							<VoterView
								roomDetails={roomData}
								dispatchEvent={dispatchEvent}
								currentUserId={currentUserId}
							/>
						}
					>
						<ModeratorView
							state={roomData.state}
							voters={roomData.voters}
							dispatchEvent={dispatchEvent}
						/>
					</Show>
				)}
			</Show>
		</main>
	);
};

export default RoomCheckWrapper;

{
	/* <main class={styles.room}>
<Show
	when={roomDetails.currentUserId}
	fallback={<p>Connecting...</p>}
	keyed
>
	{(currentUserId) => (
		<Show when={roomDetails.roomData} keyed>
			{(roomData) => (
				<Show
					// is the current user the moderator?
					when={roomData.moderator?.id === currentUserId}
					fallback={
						<VoterView
							roomDetails={roomData}
							dispatchEvent={roomDetails.dispatchEvent}
							currentUserId={currentUserId}
						/>
					}
				>
					<ModeratorView
						state={roomData.state}
						voters={roomData.voters}
						dispatchEvent={roomDetails.dispatchEvent}
					/>
				</Show>
			)}
		</Show>
	)}
</Show>
</main> */
}
