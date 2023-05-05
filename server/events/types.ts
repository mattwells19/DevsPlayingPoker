import type { RoomSchema } from "../types/schemas.ts";
import type { WebScoketMessageEvent } from "../types/socket.ts";

interface EventFunctionError {
	message: string;
}

interface SocketContext {
	userId: string;
}

export type EventFunction<Event extends WebScoketMessageEvent> = (
	roomData: RoomSchema,
	context: SocketContext,
	event: Event,
) => Promise<EventFunctionError | void> | (EventFunctionError | void);
