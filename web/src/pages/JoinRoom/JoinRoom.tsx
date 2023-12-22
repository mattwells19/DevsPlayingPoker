import Header from "@/components/Header";
import Icon from "@/components/Icon";
import { IntlKey, useIntl } from "@/i18n";
import { useNavigate, useParams, useSearchParams } from "@solidjs/router";
import { Component, createSignal, Show } from "solid-js";

const JoinRoom: Component = () => {
	const intl = useIntl();
	const navigate = useNavigate();
	const { roomCode } = useParams();
	const [searchParams] = useSearchParams();

	const [showPassword, setShowPassword] = createSignal<boolean>(false);
	const [errorMsg, setErrorMsg] = createSignal<IntlKey | null>(null);

	function handleSubmit(form: HTMLFormElement) {
		const formData = new FormData(form);
		const name = formData.get("name")?.toString().trim();
		const roomPassword = formData.get("roomPassword")?.toString();

		if (!name || name.length === 0) {
			setErrorMsg("enterAName");
			return;
		}
		if (name.length > 20) {
			setErrorMsg("nameTooLong");
			return;
		}

		localStorage.setItem("name", name);
		navigate(`/room/${roomCode}`, { state: { roomPassword } });
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
						<label for="name" class="label-required">
							{intl.t("name")}
						</label>
						<input
							id="name"
							name="name"
							type="text"
							required
							minLength="1"
							maxLength="20"
							autofocus
							value={localStorage.getItem("name") ?? ""}
							onInput={() => setErrorMsg(null)}
							aria-describedby="name-error-msg"
							aria-invalid={Boolean(errorMsg())}
						/>
						<Show when={errorMsg()}>
							{(msg) => (
								<p id="name-error-msg" class="text-red mt-1">
									{intl.t(msg())}
								</p>
							)}
						</Show>
					</div>

					<Show when={searchParams.hasPassword}>
						<div class="form-control mt-4">
							<label for="roomPassword" class="label-required">
								{intl.t("roomPassword")}
							</label>
							<div class="flex w-full">
								<input
									id="roomPassword"
									name="roomPassword"
									required
									type={showPassword() ? "text" : "password"}
									class="border-r-0 rounded-r-none flex-1"
								/>
								<button
									type="button"
									title={
										intl.t(
											showPassword() ? "concealPassword" : "showPassword",
										) as string
									}
									onClick={() => setShowPassword((prev) => !prev)}
									class="btn-ghost border-t border-r border-b border-color rounded-l-none p-2.5"
								>
									<Icon
										name={showPassword() ? "eye-crossed" : "eye"}
										aria-label={
											intl.t(
												showPassword() ? "concealPassword" : "showPassword",
											) as string
										}
										class="w-6 h-6"
									/>
								</button>
							</div>
						</div>
					</Show>
					<button type="submit" class="btn mt-8">
						{intl.t("done")}
					</button>
				</form>
			</main>
		</>
	);
};

export default JoinRoom;
