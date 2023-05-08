import { Navigate, useParams } from "@solidjs/router";
import { Component, createSignal, Show } from "solid-js";
import ModeratorView from "./views/ModeratorView";
import VoterView from "./views/VoterView";
import Header from "@/components/Header";
import { RoomContextProvider } from "./RoomContext";
import { useIntl } from "@/i18n";
import VotingDescription from "./components/VotingDescription";
import toast from "solid-toast";
import useWs from "./ws";
import ConnectionStatusBadge from "./components/ConnectionStatusBadge";
import { Tooltip } from "@/components/Tooltip";

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
				<Tooltip
					arrow
					tip={intl.t("copyCode")}
					positioning={{ placement: "right" }}
				>
					<button
						type="button"
						class="btn-ghost py-2"
						onClick={() => navigator.clipboard.writeText(params.roomCode)}
						aria-label={intl.t("copyCode") as string}
					>
						<h1 class="text-4xl font-bold">{params.roomCode}</h1>
					</button>
				</Tooltip>
			</Header>
			<Show
				when={userName}
				fallback={<Navigate href={`/join/${params.roomCode}`} />}
			>
				{(userName) => (
					<RoomContent roomCode={params.roomCode} userName={userName()} />
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
		<main class="max-w-[30rem] m-auto relative mt-4">
			<ConnectionStatusBadge
				connStatus={connStatus()}
				onReset={() => ws().close(3003, "Manual reset.")}
			/>
			<RoomContextProvider roomDetails={roomDetails} roomCode={props.roomCode}>
				<VotingDescription />
				<Show fallback={<VoterView />} when={roomDetails.userIsModerator}>
					<ModeratorView />
				</Show>
			</RoomContextProvider>
		</main>
	);
};

export default Room;
