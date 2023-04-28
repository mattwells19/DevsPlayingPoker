import { render } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import Landing from "./Landing";
import IntlProvider from "../../i18n/IntlProvider";
import { Router } from "@solidjs/router";

vi.mock("../../i18n/IntlProvider");

describe("Landing page tests", () => {
	function renderLanding() {
		return render(() => <Landing />, {
			wrapper: (props) => (
				<IntlProvider locale="en">
					<Router>{props.children}</Router>
				</IntlProvider>
			),
		});
	}

	it("shows error if room code does not exist", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 204 }));
		const user = userEvent.setup();

		const page = renderLanding();
		expect(
			page.getByText("Already have a room code? Enter it here"),
		).toBeInTheDocument();

		await user.type(page.getByLabelText("Room Code letter 1"), "A");
		expect(page.getByLabelText("Room Code letter 1")).toHaveValue("A");
		expect(page.getByLabelText("Room Code letter 2")).toHaveFocus();

		await user.type(page.getByLabelText("Room Code letter 2"), "B");
		expect(page.getByLabelText("Room Code letter 2")).toHaveValue("B");
		expect(page.getByLabelText("Room Code letter 3")).toHaveFocus();

		await user.type(page.getByLabelText("Room Code letter 3"), "C");
		expect(page.getByLabelText("Room Code letter 3")).toHaveValue("C");
		expect(page.getByLabelText("Room Code letter 4")).toHaveFocus();

		await user.type(page.getByLabelText("Room Code letter 4"), "D");
		expect(page.getByLabelText("Room Code letter 4")).toHaveValue("D");
		expect(page.getByLabelText("Room Code letter 4")).toHaveFocus();

		expect(fetch).toHaveBeenCalledWith("/api/v1/rooms/ABCD/checkRoomExists");

		expect(
			page.queryByText("A room does not exist with that code. Try again."),
		).toBeInTheDocument();

		await user.keyboard("{Backspace}");

		expect(
			page.queryByText("A room does not exist with that code. Try again."),
		).not.toBeInTheDocument();
	});

	it("submits when pasting a room code", async () => {
		// 429 = too many requests
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 429 }));
		const user = userEvent.setup();

		const page = renderLanding();

		const firstInput = page.getByLabelText("Room Code letter 1");

		firstInput.focus();
		await user.paste("ABCD");

		expect(fetch).toHaveBeenCalledWith("/api/v1/rooms/ABCD/checkRoomExists");

		expect(
			page.queryByText("Too many attempts. Please wait and try again later."),
		).toBeInTheDocument();
	});

	it.todo("redirects to join room page if no name and valid room code");
	it.todo("redirects to room page if name and valid room code");
});
