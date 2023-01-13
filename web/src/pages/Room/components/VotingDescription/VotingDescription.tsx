import { Component, createComputed, createSignal, Show } from "solid-js";
import { useRoom } from "../../RoomContext";
import ShowDescription from "./components/ShowDescription";
import EditDescription from "./components/EditDescription";

const VotingDescription: Component = () => {
	const [editing, setEditing] = createSignal<boolean>(false);
	const room = useRoom();

	createComputed(() => {
		if (room.roomData.state !== "Results") {
			setEditing(false);
		}
	});

	return (
		<Show
			fallback={<ShowDescription onStartEditing={() => setEditing(true)} />}
			when={editing() && room.currentUserId === room.roomData.moderator?.id}
		>
			<EditDescription onStopEditing={() => setEditing(false)} />
		</Show>
	);
};

export default VotingDescription;
