import { assert, assertEquals } from "deno-asserts";
import { describe, it, afterEach } from "deno-bdd";
import sinon from "sinon";
import { ObjectId } from "mongo";
import eventHandlers from "../../events/mod.ts";
import { RoomSchema } from "../../types/schemas.ts";
import rooms from "../../models/rooms.ts";
import utils from "../utils/mod.ts";

const mockRoomData: RoomSchema = {
	_id: new ObjectId(),
	lastUpdated: new Date(),
	moderator: null,
	options: ["1", "2", "3"],
	roomCode: "ABCD",
	roomPassword: null,
	state: "Results",
	voters: [],
	votingDescription: "",
	votingStartedAt: null,
};

describe("Join Room Tests", () => {
	afterEach(() => {
		sinon.restore();
	});

	it("assigns the user to join as the moderator", async () => {
		const mockUserId = crypto.randomUUID();

		const sendRoomDataSpy = sinon.spy(utils, "sendRoomData");
		const updateByIdStub = sinon
			.stub(rooms, "updateById")
			.withArgs(mockRoomData._id, {
				$set: {
					moderator: { id: mockUserId, name: "test" },
				},
			})
			.resolves({
				...mockRoomData,
				moderator: {
					id: mockUserId,
					name: "test",
				},
			});

		const msg = await eventHandlers.Join[0](
			mockRoomData,
			{ userId: mockUserId },
			{ event: "Join", name: "test", roomPassword: null },
		);

		assertEquals(msg, undefined);
		assert(updateByIdStub.calledOnce);
		assert(sendRoomDataSpy.calledOnce);
	});

	it("assigns user to voter if mdoerator exists", async () => {
		const mockUserId = crypto.randomUUID();

		const initialMockRoomData: RoomSchema = {
			...mockRoomData,
			moderator: {
				id: crypto.randomUUID(),
				name: "test-moderator",
			},
		};

		const sendRoomDataSpy = sinon.spy(utils, "sendRoomData");
		const updateByIdStub = sinon
			.stub(rooms, "updateById")
			.withArgs(mockRoomData._id, {
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
			})
			.resolves({
				...initialMockRoomData,
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
			initialMockRoomData,
			{ userId: mockUserId },
			{ event: "Join", name: "test", roomPassword: null },
		);

		assertEquals(msg, undefined);
		assert(updateByIdStub.calledOnce);
		assert(sendRoomDataSpy.calledOnce);
	});

	it("does not update DB if voter is rejoining", async () => {
		const mockUserId = crypto.randomUUID();
		const roomUpdateSpy = sinon.spy(rooms, "updateById");

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
			{ event: "Join", name: "test", roomPassword: null },
		);

		assertEquals(msg, undefined);
		assert(roomUpdateSpy.notCalled);
	});

	it("does not update DB if moderator is rejoining", async () => {
		const mockUserId = crypto.randomUUID();
		const roomUpdateSpy = sinon.spy(rooms, "updateById");

		const msg = await eventHandlers.Join[0](
			{
				...mockRoomData,
				moderator: {
					id: mockUserId,
					name: "test-moderator",
				},
			},
			{ userId: mockUserId },
			{ event: "Join", name: "test-moderator", roomPassword: null },
		);

		assertEquals(msg, undefined);
		assert(roomUpdateSpy.notCalled);
	});

	it("handles name that is too long", async () => {
		const mockUserId = crypto.randomUUID();

		const sendRoomDataSpy = sinon.spy(utils, "sendRoomData");
		const updateByIdStub = sinon
			.stub(rooms, "updateById")
			.withArgs(mockRoomData._id, {
				$set: {
					moderator: { id: mockUserId, name: "my name is longer th" },
				},
			})
			.resolves({
				...mockRoomData,
				moderator: {
					id: mockUserId,
					name: "my name is longer th",
				},
			});

		const msg = await eventHandlers.Join[0](
			mockRoomData,
			{ userId: mockUserId },
			{
				event: "Join",
				name: "my name is longer than 20 characters",
				roomPassword: null,
			},
		);

		assertEquals(msg, undefined);
		assert(updateByIdStub.calledOnce);
		assert(sendRoomDataSpy.calledOnce);
	});

	it("handles duplicate names", async () => {
		const mockUserId = crypto.randomUUID();

		const initialMockRoomData: RoomSchema = {
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
		};

		const sendRoomDataSpy = sinon.spy(utils, "sendRoomData");
		const updateByIdStub = sinon
			.stub(rooms, "updateById")
			.withArgs(mockRoomData._id, {
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
			})
			.resolves({
				...initialMockRoomData,
				voters: [
					...initialMockRoomData.voters,
					{
						id: mockUserId,
						name: "test (2)",
						confidence: null,
						selection: null,
					},
				],
			});

		const msg = await eventHandlers.Join[0](
			initialMockRoomData,
			{ userId: mockUserId },
			{ event: "Join", name: "test", roomPassword: null },
		);

		assertEquals(msg, undefined);
		assert(updateByIdStub.calledOnce);
		assert(sendRoomDataSpy.calledOnce);
	});
});
