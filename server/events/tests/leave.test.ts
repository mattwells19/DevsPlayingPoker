import { assert } from "deno-asserts";
import { describe, it, afterEach } from "deno-bdd";
import sinon from "sinon";
import { ObjectId } from "mongo";
import handleLeave from "../leave.ts";
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

describe("Handle Leave Tests", () => {
	afterEach(() => {
		sinon.restore();
	});

	it("can remove a voter from the room", async () => {
		const mockUserId = crypto.randomUUID();

		const initialMockRoomData: RoomSchema = {
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
		};

		const sendRoomDataSpy = sinon.spy(utils, "sendRoomData");
		const updateByIdStub = sinon
			.stub(rooms, "updateById")
			.withArgs(initialMockRoomData._id, {
				$pull: { voters: { id: mockUserId } },
			})
			.resolves({
				...initialMockRoomData,
				voters: [],
			});

		await handleLeave(initialMockRoomData, mockUserId);

		assert(updateByIdStub.calledOnce);
		assert(sendRoomDataSpy.calledOnce);
	});

	it("reassigns moderator with at least one voter in the room", async () => {
		const mockUserId = crypto.randomUUID();
		const mockVoterId = crypto.randomUUID();

		const initialMockRoomData: RoomSchema = {
			...mockRoomData,
			moderator: {
				id: mockUserId,
				name: "test-moderator",
			},
			voters: [
				{
					id: mockVoterId,
					name: "test",
					confidence: null,
					selection: null,
				},
			],
		};

		const sendRoomDataSpy = sinon.spy(utils, "sendRoomData");
		const updateByIdStub = sinon
			.stub(rooms, "updateById")
			.withArgs(initialMockRoomData._id, {
				$set: {
					moderator: { id: mockVoterId, name: "test" },
				},
				$pull: { voters: { id: mockVoterId } },
			})
			.resolves({
				...initialMockRoomData,
				moderator: {
					id: mockVoterId,
					name: "test",
				},
				voters: [],
			});

		await handleLeave(initialMockRoomData, mockUserId);

		assert(updateByIdStub.calledOnce);
		assert(sendRoomDataSpy.calledOnce);
	});

	it("deletes room if moderator leaves with no voters", async () => {
		const mockUserId = crypto.randomUUID();

		const sendRoomDataSpy = sinon.spy(utils, "sendRoomData");
		const initialMockRoomData: RoomSchema = {
			...mockRoomData,
			moderator: {
				id: mockUserId,
				name: "test-moderator",
			},
		};

		const deleteByRoomCodeStub = sinon
			.stub(rooms, "deleteByRoomCode")
			.withArgs(initialMockRoomData.roomCode)
			.resolves(1);

		await handleLeave(initialMockRoomData, mockUserId);

		assert(deleteByRoomCodeStub.calledOnce);
		assert(sendRoomDataSpy.notCalled);
	});
});
