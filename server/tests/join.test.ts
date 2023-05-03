import { assertEquals } from "deno-asserts";
import {
	spy,
	assertSpyCall,
	assertSpyCalls,
	stub,
	returnsNext,
	Stub,
} from "deno-mock";
import { ObjectId } from "mongo";
import eventHandlers from "../events/mod.ts";
import { RoomSchema } from "../types/schemas.ts";
import rooms from "../models/rooms.ts";

const mockRoomData: RoomSchema = {
	_id: new ObjectId(),
	lastUpdated: new Date(),
	moderator: null,
	options: ["1", "2", "3"],
	roomCode: "ABCD",
	state: "Results",
	voters: [],
	votingDescription: "",
	votingStartedAt: null,
};

let roomUpdateMock!: Stub;

function stubUpdateRoomById(res: RoomSchema) {
	if (roomUpdateMock && !roomUpdateMock.restored) {
		roomUpdateMock.restore();
	}
	roomUpdateMock = stub(
		rooms,
		"updateById",
		returnsNext([Promise.resolve(res)]),
	);
}

Deno.test("assigns the user to join as the moderator", async () => {
	const mockUserId = crypto.randomUUID();
	stubUpdateRoomById({
		...mockRoomData,
		moderator: {
			id: mockUserId,
			name: "test",
		},
	});

	const msg = await eventHandlers.Join[0](
		mockRoomData,
		{ userId: mockUserId },
		{ event: "Join", name: "test" },
	);
	assertEquals(msg, undefined);

	assertSpyCall(roomUpdateMock, 0, {
		args: [
			mockRoomData._id,
			{
				$set: {
					moderator: { id: mockUserId, name: "test" },
				},
			},
		],
	});
});

Deno.test("assigns user to voter if mdoerator exists", async () => {
	const mockUserId = crypto.randomUUID();
	stubUpdateRoomById({
		...mockRoomData,
		moderator: {
			id: crypto.randomUUID(),
			name: "test-moderator",
		},
		voters: [
			{
				id: mockUserId,
				name: "test",
				confidence: null,
				selection: null,
			},
		],
	});

	const msg = await eventHandlers.Join[0](
		{
			...mockRoomData,
			moderator: {
				id: crypto.randomUUID(),
				name: "test-moderator",
			},
		},
		{ userId: mockUserId },
		{ event: "Join", name: "test" },
	);
	assertEquals(msg, undefined);

	assertSpyCall(roomUpdateMock, 0, {
		args: [
			mockRoomData._id,
			{
				$push: {
					voters: {
						$each: [
							{
								id: mockUserId,
								name: "test",
								confidence: null,
								selection: null,
							},
						],
					},
				},
			},
		],
	});
});

Deno.test("does not update DB if voter is rejoining", async () => {
	const mockUserId = crypto.randomUUID();
	if (roomUpdateMock && !roomUpdateMock.restored) roomUpdateMock.restore();
	const roomUpdateSpy = spy(rooms, "updateById");

	const msg = await eventHandlers.Join[0](
		{
			...mockRoomData,
			moderator: {
				id: crypto.randomUUID(),
				name: "test-moderator",
			},
			voters: [
				{
					id: mockUserId,
					name: "test",
					confidence: null,
					selection: null,
				},
			],
		},
		{ userId: mockUserId },
		{ event: "Join", name: "test" },
	);
	assertEquals(msg, undefined);

	assertSpyCalls(roomUpdateSpy, 0);

	roomUpdateSpy.restore();
});

Deno.test("does not update DB if moderator is rejoining", async () => {
	const mockUserId = crypto.randomUUID();
	if (roomUpdateMock && !roomUpdateMock.restored) roomUpdateMock.restore();
	const roomUpdateSpy = spy(rooms, "updateById");

	const msg = await eventHandlers.Join[0](
		{
			...mockRoomData,
			moderator: {
				id: mockUserId,
				name: "test-moderator",
			},
		},
		{ userId: mockUserId },
		{ event: "Join", name: "test-moderator" },
	);
	assertEquals(msg, undefined);

	assertSpyCalls(roomUpdateSpy, 0);

	roomUpdateSpy.restore();
});

Deno.test("handles name that is too long", async () => {
	const mockUserId = crypto.randomUUID();
	stubUpdateRoomById({
		...mockRoomData,
		moderator: {
			id: mockUserId,
			name: "my name is longer th",
		},
	});

	const msg = await eventHandlers.Join[0](
		mockRoomData,
		{ userId: mockUserId },
		{ event: "Join", name: "my name is longer than 20 characters" },
	);
	assertEquals(msg, undefined);

	assertSpyCall(roomUpdateMock, 0, {
		args: [
			mockRoomData._id,
			{
				$set: {
					moderator: { id: mockUserId, name: "my name is longer th" },
				},
			},
		],
	});
});

Deno.test("handles duplicate names", async () => {
	const mockUserId = crypto.randomUUID();
	stubUpdateRoomById({
		...mockRoomData,
		voters: [
			...mockRoomData.voters,
			{
				id: mockUserId,
				name: "test (2)",
				confidence: null,
				selection: null,
			},
		],
	});

	const msg = await eventHandlers.Join[0](
		{
			...mockRoomData,
			moderator: {
				id: crypto.randomUUID(),
				name: "test",
			},
			voters: [
				{
					id: crypto.randomUUID(),
					name: "test (1)",
					confidence: null,
					selection: null,
				},
			],
		},
		{ userId: mockUserId },
		{ event: "Join", name: "test" },
	);
	assertEquals(msg, undefined);

	assertSpyCall(roomUpdateMock, 0, {
		args: [
			mockRoomData._id,
			{
				$push: {
					voters: {
						$each: [
							{
								id: mockUserId,
								name: "test (2)",
								confidence: null,
								selection: null,
							},
						],
					},
				},
			},
		],
	});
});
