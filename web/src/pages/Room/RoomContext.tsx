import { createContext, ParentComponent, Show, useContext } from "solid-js";
import type { RoomSchema, WebScoketMessageEvent } from "@/shared-types";

export interface RoomDetails {
	currentUserId: string;
	userIsModerator: boolean;
	roomData: RoomSchema;
	dispatchEvent: (event: WebScoketMessageEvent) => void;
}

export const defaultRoomDetails: RoomDetails = {
	currentUserId: "",
	dispatchEvent: () => null,
	userIsModerator: false,
	roomData: {} as RoomSchema,
};

const RoomContext = createContext<RoomDetails>(defaultRoomDetails);

interface RoomContextProviderProps {
	roomDetails: RoomDetails;
	roomCode: string;
}

export const RoomContextProvider: ParentComponent<RoomContextProviderProps> = (
	props,
) => {
	return (
		<RoomContext.Provider value={props.roomDetails}>
			<Show
				when={
					props.roomDetails.currentUserId &&
					props.roomDetails.roomData &&
					props.roomDetails.roomData.roomCode === props.roomCode
				}
			>
				{props.children}
			</Show>
		</RoomContext.Provider>
	);
};

export const useRoom = () => useContext(RoomContext);
