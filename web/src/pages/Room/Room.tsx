import { Navigate, useNavigate, useParams } from "solid-app-router";
import {
	Component,
	createEffect,
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
import toast from "solid-toast";

const [updateNameFn, setUpdateNameFn] = createSignal<
	((name: string) => void) | undefined
>();

const Room: Component = () => {
	const intl = useIntl();
	const params = useParams();

	const userName = localStorage.getItem("name");
	const userId = sessionStorage.getItem("userId");

	return (
		<>
			<Header onSaveName={updateNameFn()}>
				<button
					class={styles.roomCodeBtn}
					onClick={() => navigator.clipboard.writeText(params.roomCode)}
					title={intl.t("copyCode") as string}
				>
					<h1>{params.roomCode}</h1>
				</button>
			</Header>
			<Show
				when={userName}
				fallback={<Navigate href={`/join/${params.roomCode}`} />}
				keyed
			>
				{(userName) => (
					<RoomContent
						roomCode={params.roomCode}
						userName={userName}
						userId={userId}
					/>
				)}
			</Show>
		</>
	);
};

interface RoomContentProps {
	roomCode: string;
	userName: string;
	userId: string | null;
}

const wsProtocol = window.location.protocol.includes("https") ? "wss" : "ws";
const wsPath = `${wsProtocol}://${window.location.host}/ws`;

const RoomContent: Component<RoomContentProps> = (props) => {
	const intl = useIntl();
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
					if (!data.roomExists) {
						toast.error(
							intl.t("thatRoomDoesntExist", { roomCode: props.roomCode }),
						);
						return navigate("/");
					}

					if (data.userId !== props.userId) {
						sessionStorage.setItem("userId", data.userId);
					}
					setRoomDetails({ currentUserId: data.userId });
					break;
				}
				case "Kicked":
					toast(intl.t("youWereKicked"), { icon: "🥾" });
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

	setUpdateNameFn(() => (new_name) => {
		roomDetails.dispatchEvent({
			event: "ChangeName",
			value: new_name,
		});
		localStorage.setItem("name", new_name);
		toast.success(intl.t("nameUpdated"));
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

export default Room;
