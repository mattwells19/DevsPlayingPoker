import { useNavigate, useParams } from "solid-app-router";
import {
	Component,
	createResource,
	createSignal,
	Match,
	onCleanup,
	Show,
	Switch,
} from "solid-js";
import styles from "./Room.module.scss";
import { JoinEvent, WebSocketEvent } from "../../../../server/types/socket";
import { RoomSchema } from "../../../../server/models/room.model";

const RoomCheckWrapper: Component = () => {
	const navigate = useNavigate();
	const { roomCode } = useParams();

	const [done] = createResource(roomCode, () =>
		fetch(`/api/v1/rooms/${roomCode}/checkRoomExists`).then((res) => {
			if (res.status !== 200) {
				navigate("/");
			}
			return true;
		}),
	);

	return (
		<Switch fallback={<h1>Loading...</h1>}>
			<Match when={done()}>
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
	const [roomDetails, setRoomDetails] = createSignal<RoomDetails | null>(null);

	const userName = localStorage.getItem("name");
	if (!userName) {
		navigate(`/join/${roomCode}`);
		return;
	}

	const wsProtocol = window.location.protocol.includes("https") ? "wss" : "ws";
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
		if (e.data === "Connected") {
			console.info("Connected");
			return;
		}
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
			default:
				return;
		}
	});

	onCleanup(() => ws.close());

	return (
		<main class={styles.room}>
			<h1>The room</h1>
			<Show when={roomDetails()}>
				<pre>
					<code>{JSON.stringify(roomDetails(), null, 4)}</code>
				</pre>
			</Show>
		</main>
	);
};

export default RoomCheckWrapper;
