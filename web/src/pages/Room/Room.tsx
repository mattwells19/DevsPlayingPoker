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
import { useIntl } from "@/i18n";
import VotingDescription from "./components/VotingDescription";

const RoomCheckWrapper: Component = () => {
	const intl = useIntl();
	const navigate = useNavigate();
	const params = useParams();

	const userName = localStorage.getItem("name");
	if (!userName) {
		navigate(`/join/${params.roomCode}`);
		return;
	}

	const userId = sessionStorage.getItem("userId");

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
					title={intl.t("copyCode") as string}
				>
					<h1>{params.roomCode}</h1>
				</button>
			</Header>
			<Show
				when={roomExists() && userName ? userName : null}
				fallback={<h1>{intl.t("checkingRoom")}</h1>}
				keyed
			>
				{(userName) => (
					<Room
						roomCode={params.roomCode}
						userName={userName}
						userId={userId}
					/>
				)}
			</Show>
		</>
	);
};

interface RoomProps {
	roomCode: string;
	userName: string;
	userId: string | null;
}

const wsProtocol = window.location.protocol.includes("https") ? "wss" : "ws";
const wsPath = `${wsProtocol}://${window.location.host}/ws`;

const Room: Component<RoomProps> = (props) => {
	const navigate = useNavigate();
	const wsUrl = () => {
		const wsUrl = new URL(`${wsPath}/${props.roomCode}`);
		if (props.userId) {
			wsUrl.searchParams.set("userId", props.userId);
		}
		return wsUrl;
	};

	const [roomDetails, setRoomDetails] =
		createStore<RoomDetails>(defaultRoomDetails);
	const [ws, setWs] = createSignal<WebSocket>(new WebSocket(wsUrl()));

	createEffect(() => {
		let lastResponseTimestamp: number | null = null;
		let ponged = true;

		const pingInterval = setInterval(() => {
			if (
				!lastResponseTimestamp ||
				Date.now() - lastResponseTimestamp > 10000
			) {
				// if our last ping didn't get a pong then we must've disconnected
				if (!ponged) {
					ws().close(3002, "Ping didn't receive a pong.");
				} else {
					ponged = false;
					ws().send("PING");
				}
			}
		}, 10 * 1000);

		onCleanup(() => {
			clearInterval(pingInterval);
		});

		ws().addEventListener("open", () => {
			const joinEvent: JoinEvent = {
				event: "Join",
				name: props.userName,
			};
			ws().send(JSON.stringify(joinEvent));
		});

		ws().addEventListener("message", (messageEvent) => {
			lastResponseTimestamp = Date.now();
			if (messageEvent.data === "PONG") {
				ponged = true;
				return;
			}

			const data = JSON.parse(messageEvent.data) as WebSocketTriggeredEvent;

			switch (data.event) {
				case "RoomUpdate":
					setRoomDetails({
						roomData: data.roomData,
						dispatchEvent: (e) => ws().send(JSON.stringify(e)),
					});
					break;
				case "Connected": {
					if (data.userId !== props.userId) {
						sessionStorage.setItem("userId", data.userId);
					}
					setRoomDetails({ currentUserId: data.userId });
					break;
				}
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
				setWs(new WebSocket(wsUrl()));
			}
		});
	});

	onCleanup(() => {
		if (ws().readyState === WebSocket.OPEN) {
			ws().close(1000);
		}
	});

	return (
		<main class={styles.room}>
			<RoomContextProvider roomDetails={roomDetails} roomCode={props.roomCode}>
				<VotingDescription />
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
		</main>
	);
};

export default RoomCheckWrapper;
