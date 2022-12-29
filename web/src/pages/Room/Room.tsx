import { Link, useNavigate, useParams } from "solid-app-router";
import {
	Component,
	createResource,
	createSignal,
	onCleanup,
	Show,
} from "solid-js";
import { createStore } from "solid-js/store";
import styles from "./Room.module.scss";
import type { JoinEvent, WebSocketTriggeredEvent } from "@/shared-types";
import ModeratorView from "./views/moderator";
import VoterView from "./views/voter/VoterView";
import Header from "@/components/Header";
import {
	defaultRoomDetails,
	RoomContextProvider,
	RoomDetails,
} from "./RoomContext";

const RoomCheckWrapper: Component = () => {
	const navigate = useNavigate();
	const { roomCode } = useParams();
	const [manualShow, setManualShow] = createSignal(true);

	const handleReset = () => {
		setManualShow(false);
		setManualShow(true);
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
			<Header class={styles.header}>
				<div class={styles.homeLinkContainer}>
					<Link href="/">
						<span aria-hidden>🏠</span>
						Home
					</Link>
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

interface RoomProps {
	roomCode: string;
	resetConnection: () => void;
}

const Room: Component<RoomProps> = ({ roomCode, resetConnection }) => {
	const navigate = useNavigate();
	const [roomDetails, setRoomDetails] =
		createStore<RoomDetails>(defaultRoomDetails);

	const userName = localStorage.getItem("name");
	if (!userName) {
		navigate(`/join/${roomCode}`);
		return;
	}

	const wsProtocol = window.location.protocol.includes("https") ? "wss" : "ws";
	const ws = new WebSocket(`${wsProtocol}://${window.location.host}/ws`);

	ws.addEventListener("open", () => {
		const joinEvent: JoinEvent = {
			event: "Join",
			roomCode: roomCode,
			name: userName,
		};
		ws.send(JSON.stringify(joinEvent));
	});

	ws.addEventListener("message", (messageEvent) => {
		const data = JSON.parse(messageEvent.data) as WebSocketTriggeredEvent;

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
				break;
			case "Kicked":
				navigate("/");
				break;
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

	return (
		<main class={styles.room}>
			<Show when={roomDetails.roomData} fallback={<p>Connecting...</p>}>
				{/* 🚧 RoomContext assumes roomData is defined */}
				<RoomContextProvider value={roomDetails}>
					<Show
						// is the current user the moderator?
						when={
							roomDetails.roomData.moderator?.id === roomDetails.currentUserId
						}
						fallback={<VoterView />}
					>
						<ModeratorView />
					</Show>
				</RoomContextProvider>
			</Show>
		</main>
	);
};

export default RoomCheckWrapper;
