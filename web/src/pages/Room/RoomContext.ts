import { createContext, useContext } from "solid-js";
import type { RoomSchema, WebScoketMessageEvent } from "@/shared-types";

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

export const RoomContextProvider = RoomContext.Provider;
export const useRoom = () => useContext(RoomContext);
