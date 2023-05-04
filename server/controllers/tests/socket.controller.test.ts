import { assert } from "deno-asserts";
import { describe, it, afterEach, beforeEach } from "deno-bdd";
import sinon from "sinon";
import { handleClose } from "../socket.controller.ts";
import sockets, { UserSocket } from "../../models/sockets.ts";
import rooms from "../../models/rooms.ts";

describe("Socket Controller Tests", () => {
	afterEach(() => {
		sinon.restore();
	});

	describe("Handle Close Tests", () => {
		let clock: sinon.SinonFakeTimers;

		beforeEach(() => {
			clock = sinon.useFakeTimers();
		});

		it("removes user if they dont rejoin", () => {
			const mockUserSocket = {
				id: `${crypto.randomUUID()}-ABCD`,
				roomCode: "ABCD",
				socket: {},
			} as UserSocket;

			const socketsGetStub = sinon.stub(sockets, "get").returns(null);
			const socketsDeleteStub = sinon.stub(sockets, "delete");
			sinon
				.stub(rooms, "findByRoomCode")
				.withArgs(mockUserSocket.roomCode)
				.resolves(undefined);

			handleClose(mockUserSocket);
			clock.tick(4000);

			assert(socketsGetStub.calledOnce);
			assert(socketsDeleteStub.calledWith(mockUserSocket.id));
		});

		it("removes user if they join a different room", () => {
			const mockUserSocketPre = {
				id: `${crypto.randomUUID()}-ABCD`,
				roomCode: "ABCD",
				socket: {},
			} as UserSocket;
			const mockUserSocketPost = {
				id: `${crypto.randomUUID()}-EFGH`,
				roomCode: "EFGH",
				socket: mockUserSocketPre.socket, // same WebSocket object, different room
			} as UserSocket;

			const socketsGetStub = sinon
				.stub(sockets, "get")
				.returns(mockUserSocketPost);
			const socketsDeleteStub = sinon.stub(sockets, "delete");
			sinon
				.stub(rooms, "findByRoomCode")
				.withArgs(mockUserSocketPre.roomCode)
				.resolves(undefined);

			handleClose(mockUserSocketPre);
			clock.tick(4000);

			assert(socketsGetStub.calledOnce);
			assert(socketsDeleteStub.calledWith(mockUserSocketPre.id));
		});

		it("does not remove user if they do rejoin", () => {
			const mockUserSocketPre = {
				id: `${crypto.randomUUID()}-ABCD`,
				roomCode: "ABCD",
				socket: {},
			} as UserSocket;
			const mockUserSocketPost = {
				id: `${crypto.randomUUID()}-ABCD`,
				roomCode: "ABCD",
				socket: {},
			} as UserSocket;

			const socketsGetStub = sinon
				.stub(sockets, "get")
				.withArgs(mockUserSocketPre.id)
				.returns(mockUserSocketPost);
			const socketsDeleteSpy = sinon.stub(sockets, "delete");

			handleClose(mockUserSocketPre);
			clock.tick(4000);

			assert(socketsGetStub.calledOnce);
			assert(socketsDeleteSpy.notCalled);
		});
	});
});
