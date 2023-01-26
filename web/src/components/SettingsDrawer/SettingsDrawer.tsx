import { IntlKey, useIntl } from "@/i18n";
import {
	createSignal,
	JSX,
	onCleanup,
	onMount,
	ParentComponent,
	Show,
} from "solid-js";
import { Portal } from "solid-js/web";

export interface SettingsDrawerActions {
	onSaveName?: (name: string) => void;
}

type SettingsDrawerProps = {
	isOpen: boolean;
	onClose: () => void;
} & SettingsDrawerActions;

const SettingsDrawer: ParentComponent<SettingsDrawerProps> = (props) => {
	const intl = useIntl();
	const [errorMsg, setErrorMsg] = createSignal<IntlKey | null>(null);

	onMount(() => {
		const escClose = (e: KeyboardEvent) => {
			if (e.key === "Escape" && props.isOpen) {
				props.onClose();
			}
		};
		document.addEventListener("keyup", escClose);
		onCleanup(() => document.removeEventListener("keyup", escClose));
	});

	const handleThemeChange: JSX.EventHandlerUnion<HTMLSelectElement, Event> = (
		e,
	) => {
		const selection = e.currentTarget.value;

		if (selection === "system") {
			localStorage.setItem("theme", "system");

			if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				document.body.classList.add("dark");
				document.documentElement.setAttribute("data-theme", "dark");
			} else {
				document.body.classList.remove("dark");
				document.documentElement.setAttribute("data-theme", "light");
			}
		} else if (selection === "light") {
			localStorage.setItem("theme", "light");
			document.body.classList.remove("dark");
			document.documentElement.setAttribute("data-theme", "light");
		} else if (selection === "dark") {
			localStorage.setItem("theme", "dark");
			document.body.classList.add("dark");
			document.documentElement.setAttribute("data-theme", "dark");
		}
	};

	return (
		<Portal>
			<Show when={props.isOpen}>
				<div
					onClick={props.onClose}
					class="absolute bg-black/25 inset-0 overflow-hidden"
				>
					<aside
						onClick={(e) => e.stopPropagation()}
						class="w-full max-w-xs p-4 absolute top-0 right-0 h-full flex flex-col gap-8 bg-base-100 animate-[slideIn_200ms_ease-in-out]"
					>
						<button
							onClick={props.onClose}
							title={intl.t("closeSettingsDrawer") as string}
							class="btn btn-square btn-ghost btn-primary ml-auto"
						>
							&#10005;
						</button>
						<div class="form-control">
							<label for="theme-select" class="label">
								{intl.t("theme")}
							</label>
							<select
								id="theme-select"
								name="theme-select"
								aria-describedby="theme-select-helptext"
								value={localStorage.getItem("theme") ?? "system"}
								onChange={handleThemeChange}
								class="select select-bordered"
							>
								<option value="system">{intl.t("system")}</option>
								<option value="light">{intl.t("light")}</option>
								<option value="dark">{intl.t("dark")}</option>
							</select>
							<p id="theme-select-helptext" class="label label-text-alt">
								{intl.t("savesAutomatically")}
							</p>
						</div>
						<Show when={props.onSaveName}>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									const formData = new FormData(e.currentTarget);
									const name = formData.get("name")?.toString().trim();

									if (!name || name.length === 0) {
										setErrorMsg("enterAName");
										return;
									}
									if (name.length > 10) {
										setErrorMsg("nameTooLong");
										return;
									}

									props.onSaveName!(name);
								}}
								class="form-control"
							>
								<label for="name" class="label">
									{intl.t("name")}
								</label>
								<div class="input-group w-full">
									<input
										id="name"
										name="name"
										type="text"
										required
										minLength="1"
										maxLength="10"
										autofocus
										value={localStorage.getItem("name") ?? ""}
										onInput={() => setErrorMsg(null)}
										aria-describedby="name-error-msg"
										aria-invalid={Boolean(errorMsg())}
										class="input input-bordered w-full"
									/>
									<button
										type="submit"
										title={intl.t("saveName") as string}
										class="btn btn-primary btn-square"
									>
										<svg
											viewBox="0 0 80 80"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											class="w-6 h-6"
										>
											<path
												data-v-334a4042=""
												d="M37.0538 40.1651C39.4957 38.7552 42.5043 38.7552 44.9462 40.1651C47.388 41.5749 48.8923 44.1804 48.8923 47C48.8923 49.8196 47.388 52.4251 44.9462 53.8349C42.5043 55.2448 39.4957 55.2448 37.0538 53.8349C34.612 52.4251 33.1077 49.8196 33.1077 47C33.1077 44.1804 34.612 41.5749 37.0538 40.1651Z"
												fill="currentColor"
											></path>
											<path
												data-v-334a4042=""
												fill-rule="evenodd"
												clip-rule="evenodd"
												d="M16 12H17.5V27C17.5 28.933 19.067 30.5 21 30.5H47C48.933 30.5 50.5 28.933 50.5 27V12.0031C51.5039 12.0424 52.4585 12.4585 53.1716 13.1716L66.8284 26.8284C67.5786 27.5786 68 28.596 68 29.6569V64C68 66.2091 66.2091 68 64 68H16C13.7909 68 12 66.2091 12 64V16C12 13.7909 13.7909 12 16 12ZM47.4462 35.8349C43.4573 33.5319 38.5427 33.5319 34.5538 35.8349C30.565 38.1379 28.1077 42.394 28.1077 47C28.1077 51.606 30.565 55.8621 34.5538 58.1651C38.5427 60.4681 43.4573 60.4681 47.4462 58.1651C51.435 55.8621 53.8923 51.606 53.8923 47C53.8923 42.394 51.435 38.1379 47.4462 35.8349Z"
												fill="currentColor"
											></path>
											<path
												data-v-334a4042=""
												d="M22.5 12H45.5V25.5H22.5V12Z"
												fill="currentColor"
											></path>
										</svg>
									</button>
								</div>
								<Show when={errorMsg()} keyed>
									{(msg) => (
										<p id="name-error-msg" class="text-error">
											{intl.t(msg)}
										</p>
									)}
								</Show>
							</form>
						</Show>
					</aside>
				</div>
			</Show>
		</Portal>
	);
};

export default SettingsDrawer;
