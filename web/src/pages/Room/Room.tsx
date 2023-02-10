import { Navigate, useNavigate, useParams } from "solid-app-router";
import {
	batch,
	Component,
	createEffect,
	createSignal,
	onCleanup,
	Show,
} from "solid-js";
import { createStore } from "solid-js/store";
import type { JoinEvent, WebSocketTriggeredEvent } from "@/shared-types";
import ModeratorView from "./views/ModeratorView";
import VoterView from "./views/VoterView";
import Header from "@/components/Header";
import {
	defaultRoomDetails,
	RoomContextProvider,
	RoomDetails,
} from "./RoomContext";
import { useIntl } from "@/i18n";
import VotingDescription from "./components/VotingDescription";
import toast from "solid-toast";
import Icon from "@/components/Icon";

const [updateNameFn, setUpdateNameFn] = createSignal<
	((name: string) => void) | undefined
>();

const Room: Component = () => {
	const intl = useIntl();
	const params = useParams();

	const userName = localStorage.getItem("name");

	return (
		<>
			<Header onSaveName={updateNameFn()}>
				<span
					class="tooltip tooltip-right"
					data-tip={intl.t("copyCode") as string}
				>
					<button
						type="button"
						class="btn btn-ghost"
						onClick={() => navigator.clipboard.writeText(params.roomCode)}
						aria-label={intl.t("copyCode") as string}
					>
						<h1 class="text-4xl font-bold">{params.roomCode}</h1>
					</button>
				</span>
			</Header>
			<Show
				when={userName}
				fallback={<Navigate href={`/join/${params.roomCode}`} />}
				keyed
			>
				{(userName) => (
					<RoomContent roomCode={params.roomCode} userName={userName} />
				)}
			</Show>
		</>
	);
};

interface RoomContentProps {
	roomCode: string;
	userName: string;
}

const wsProtocol = window.location.protocol.includes("https") ? "wss" : "ws";
const wsPath = `${wsProtocol}://${window.location.host}/ws`;

const RoomContent: Component<RoomContentProps> = (props) => {
	const intl = useIntl();
	const navigate = useNavigate();
	const savedUserId = sessionStorage.getItem("userId");
	const [connStatus, setConnStatus] = createSignal<
		"connecting" | "connected" | "disconnected"
	>("connecting");

	const wsUrl = () => {
		const wsUrl = new URL(`${wsPath}/${props.roomCode}`);
		if (savedUserId) {
			wsUrl.searchParams.set("userId", savedUserId);
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
			setConnStatus("connecting");
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

					if (data.userId !== savedUserId) {
						sessionStorage.setItem("userId", data.userId);
					}

					batch(() => {
						setConnStatus("connected");
						setRoomDetails({ currentUserId: data.userId });
					});
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
			setConnStatus("disconnected");
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
