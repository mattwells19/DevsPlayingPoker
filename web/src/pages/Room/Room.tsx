import { useNavigate, useParams } from "solid-app-router";
import {
	Component,
	createEffect,
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
	const params = useParams();

	const userName = localStorage.getItem("name");
	if (!userName) {
		navigate(`/join/${params.roomCode}`);
		return;
	}

	const [roomExists] = createResource(params.roomCode, () =>
		fetch(`/api/v1/rooms/${params.roomCode}/checkRoomExists`).then((res) => {
			if (res.status !== 200) {
				navigate("/");
				return false;
			}
			return true;
		}),
	);

	return (
		<>
			<Header>
				<button
					class={styles.roomCodeBtn}
					onClick={() => navigator.clipboard.writeText(params.roomCode)}
					title="Click to copy code."
				>
					<h1>{params.roomCode}</h1>
				</button>
			</Header>
			<Show
				when={roomExists() && userName ? userName : null}
				fallback={<h1>Checking room...</h1>}
				keyed
			>
				{(userName) => <Room roomCode={params.roomCode} userName={userName} />}
			</Show>
		</>
	);
};

interface RoomProps {
	roomCode: string;
	userName: string;
}

const wsProtocol = window.location.protocol.includes("https") ? "wss" : "ws";
const wsPath = `${wsProtocol}://${window.location.host}/ws`;

const Room: Component<RoomProps> = (props) => {
	const navigate = useNavigate();
	const [roomDetails, setRoomDetails] =
		createStore<RoomDetails>(defaultRoomDetails);
	const [ws, setWs] = createSignal<WebSocket>(
		new WebSocket(`${wsPath}/${props.roomCode}`),
	);

	createEffect(() => {
		ws().addEventListener("open", () => {
			const joinEvent: JoinEvent = {
				event: "Join",
				name: props.userName,
			};
			ws().send(JSON.stringify(joinEvent));
		});

		ws().addEventListener("message", (messageEvent) => {
			const data = JSON.parse(messageEvent.data) as WebSocketTriggeredEvent;

			switch (data.event) {
				case "RoomUpdate":
					setRoomDetails({
						roomData: data.roomData,
						dispatchEvent: (e) => ws().send(JSON.stringify(e)),
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

		ws().addEventListener("close", (closeEvent) => {
			// 1000 means closed normally
			if (closeEvent.code !== 1000) {
				setWs(new WebSocket(`${wsPath}/${props.roomCode}`));
			}
		});
	});

	onCleanup(() => {
		ws().close(1000);
	});

	return (
		<main class={styles.room}>
			<Show
				when={roomDetails.currentUserId && roomDetails.roomData}
				fallback={<p>Connecting...</p>}
			>
				{/* ⚠ RoomContext assumes roomData is defined */}
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
