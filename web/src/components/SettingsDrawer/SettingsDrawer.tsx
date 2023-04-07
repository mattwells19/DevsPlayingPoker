import { IntlKey, useIntl } from "@/i18n";
import { createSignal, JSX, ParentComponent, Show } from "solid-js";
import Icon from "../Icon";
import { Dialog, DialogCloseTrigger, DrawerContent } from "../Dialog";

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
		<Dialog isOpen={props.isOpen} onClose={props.onClose} role="dialog">
			<DrawerContent>
				<DialogCloseTrigger
					onClick={props.onClose}
					title={intl.t("closeSettingsDrawer") as string}
					class="btn btn-square btn-ghost btn-primary block ml-auto"
				>
					&#10005;
				</DialogCloseTrigger>
				<div class="form-control my-8">
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
							if (name.length > 20) {
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
								maxLength="20"
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
								<Icon
									name="save"
									aria-label={intl.t("saveName") as string}
									fill="none"
									class="w-6 h-6"
								/>
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
			</DrawerContent>
		</Dialog>
	);
};

export default SettingsDrawer;
