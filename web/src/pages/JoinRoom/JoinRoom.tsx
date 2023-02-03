import Header from "@/components/Header";
import { IntlKey, useIntl } from "@/i18n";
import { useNavigate, useParams } from "solid-app-router";
import { Component, createSignal, Show } from "solid-js";

const JoinRoom: Component = () => {
	const intl = useIntl();
	const navigate = useNavigate();
	const { roomCode } = useParams();

	const [errorMsg, setErrorMsg] = createSignal<IntlKey | null>(null);

	function handleSubmit(form: HTMLFormElement) {
		const formData = new FormData(form);
		const name = formData.get("name")?.toString().trim();

		if (!name || name.length === 0) {
			setErrorMsg("enterAName");
			return;
		}
		if (name.length > 10) {
			setErrorMsg("nameTooLong");
			return;
		}

		localStorage.setItem("name", name);
		navigate(`/room/${roomCode}`);
	}

	return (
		<>
			<Header />
			<main class="max-w-md m-auto">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit(e.currentTarget);
					}}
					class="flex flex-col"
				>
					<div class="form-control">
						<label
							for="name"
							class="label after:content-['*'] after:text-error justify-start gap-1"
						>
							{intl.t("name")}
						</label>
						<input
							id="name"
							name="name"
							type="text"
							class="input input-bordered"
							required
							minLength="1"
							maxLength="10"
							autofocus
							value={localStorage.getItem("name") ?? ""}
							onInput={() => setErrorMsg(null)}
							aria-describedby="name-error-msg"
							aria-invalid={Boolean(errorMsg())}
						/>
						<Show when={errorMsg()} keyed>
							{(msg) => (
								<p id="name-error-msg" class="text-error mt-1">
									{intl.t(msg)}
								</p>
							)}
						</Show>
					</div>
					<button type="submit" class="btn btn-primary mt-8">
						{intl.t("done")}
					</button>
				</form>
			</main>
		</>
	);
};

export default JoinRoom;
