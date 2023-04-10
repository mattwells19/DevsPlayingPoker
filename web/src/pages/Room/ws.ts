import { useIntl } from "@/i18n";
import { JoinEvent, WebSocketTriggeredEvent } from "@/shared-types";
import { useNavigate } from "@solidjs/router";
import { batch, createEffect, createSignal, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import toast from "solid-toast";
import { defaultRoomDetails, RoomDetails } from "./RoomContext";

const wsProtocol = window.location.protocol.includes("https") ? "wss" : "ws";
const wsPath = `${wsProtocol}://${window.location.host}/ws`;

interface WsOptions {
	userName: string;
	roomCode: string;
	initialUserId: string | null;
	onNewUserId: (newUserId: string) => void;
}

export default function useWs(options: WsOptions) {
	const intl = useIntl();
	const navigate = useNavigate();

	const [savedUserId, setSavedUserId] = createSignal<string | null>(
		options.initialUserId,
	);
	const [connStatus, setConnStatus] = createSignal<
		"connecting" | "connected" | "disconnected"
	>("connecting");

	const wsUrl = () => {
		const wsUrl = new URL(`${wsPath}/${options.roomCode}`);
		if (savedUserId()) {
			wsUrl.searchParams.set("userId", savedUserId()!);
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
		});

		ws().addEventListener("message", (messageEvent) => {
			lastResponseTimestamp = Date.now();
			if (messageEvent.data === "PONG") {
				ponged = true;
				return;
			}

			const data = JSON.parse(messageEvent.data) as WebSocketTriggeredEvent;

			switch (data.event) {
				case "Connected": {
					if (!data.roomExists) {
						toast.error(
							intl.t("thatRoomDoesntExist", { roomCode: options.roomCode }),
						);
						return navigate("/");
					}

					if (data.userId !== savedUserId()) {
						options.onNewUserId(data.userId);
					}

					const joinEvent: JoinEvent = {
						event: "Join",
						name: options.userName,
					};
					ws().send(JSON.stringify(joinEvent));

					batch(() => {
						setConnStatus("connected");
						setSavedUserId(data.userId);
						setRoomDetails({ currentUserId: data.userId });
					});
					break;
				}
				case "RoomUpdate": {
					setRoomDetails({
						roomData: data.roomData,
						userIsModerator: data.roomData.moderator?.id === savedUserId(),
						dispatchEvent: (e) => ws().send(JSON.stringify(e)),
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

	return { ws, connStatus, roomDetails };
}
