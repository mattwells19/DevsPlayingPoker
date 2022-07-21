export interface CreateRoomRequest {
	moderatorName: string;
	options: number[];
}

export interface JoinRoomRequest {
	name: string;
}
