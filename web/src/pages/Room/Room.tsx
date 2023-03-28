import { Navigate, useParams } from "solid-app-router";
import {
	Component,
	createEffect,
	createMemo,
	createSelector,
	createSignal,
	on,
	onCleanup,
	Show,
} from "solid-js";
import ModeratorView from "./views/ModeratorView";
import VoterView from "./views/VoterView";
import Header from "@/components/Header";
import { RoomContextProvider } from "./RoomContext";
import { useIntl } from "@/i18n";
import VotingDescription from "./components/VotingDescription";
import toast from "solid-toast";
import Icon from "@/components/Icon";
import useWs from "./ws";

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

const RoomContent: Component<RoomContentProps> = (props) => {
	const intl = useIntl();
	const { ws, connStatus, roomDetails } = useWs({
		userName: props.userName,
		roomCode: props.roomCode,
		initialUserId: sessionStorage.getItem("userId"),
		onNewUserId: (newUserId) => sessionStorage.setItem("userId", newUserId),
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
