import { createContext, ParentComponent, Show, useContext } from "solid-js";
import type { RoomSchema, WebScoketMessageEvent } from "@/shared-types";
import { useIntl } from "@/i18n";

export interface RoomDetails {
	currentUserId: string;
	roomData: RoomSchema;
	dispatchEvent: (event: WebScoketMessageEvent) => void;
}

export const defaultRoomDetails: RoomDetails = {
	currentUserId: "",
	dispatchEvent: () => null,
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
	const intl = useIntl();

	return (
		<RoomContext.Provider value={props.roomDetails}>
			<Show
				fallback={<p>{intl.t("connecting")}</p>}
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
