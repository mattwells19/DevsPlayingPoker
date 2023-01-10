import { Component, createEffect, createSignal, Show } from "solid-js";
import { useRoom } from "../../RoomContext";
import ShowDescription from "./components/ShowDescription";
import EditDescription from "./components/EditDescription";

const VotingDescription: Component = () => {
	const [editing, setEditing] = createSignal<boolean>(false);
	const room = useRoom();

	createEffect(() => {
		if (room.roomData.state !== "Results") {
			setEditing(false);
		}
	});

	return (
		<Show
			fallback={<ShowDescription onStartEditing={() => setEditing(true)} />}
			when={editing()}
		>
			<EditDescription onStopEditing={() => setEditing(false)} />
		</Show>
	);
};

export default VotingDescription;
