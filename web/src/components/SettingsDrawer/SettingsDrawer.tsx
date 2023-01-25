import { IntlKey, useIntl } from "@/i18n";
import {
	createSignal,
	JSX,
	onCleanup,
	onMount,
	ParentComponent,
	Show,
} from "solid-js";
import Button from "../Button";
import styles from "./SettingsDrawer.module.scss";

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
			} else {
				document.body.classList.remove("dark");
			}
		} else if (selection === "light") {
			localStorage.setItem("theme", "light");
			document.body.classList.remove("dark");
		} else if (selection === "dark") {
			localStorage.setItem("theme", "dark");
			document.body.classList.add("dark");
		}
	};

	return (
		<div
			class={styles.backdrop}
			classList={{ [styles.open]: props.isOpen }}
			onClick={props.onClose}
		>
			<aside class={styles.drawer} onClick={(e) => e.stopPropagation()}>
				<Button
					variant="ghost"
					onClick={props.onClose}
					class={styles.closeBtn}
					title={intl.t("closeSettingsDrawer") as string}
				>
					&#10005;
				</Button>
				<div class={styles.themeSelect}>
					<label for="theme-select">Theme</label>
					<select
						id="theme-select"
						name="theme-select"
						aria-describedby="theme-select-helptext"
						value={localStorage.getItem("theme") ?? "system"}
						onChange={handleThemeChange}
					>
						<option value="system">System Setting</option>
						<option value="light">Light</option>
						<option value="dark">Dark</option>
					</select>
					<p id="theme-select-helptext">Saves automatically.</p>
				</div>
				<Show when={props.onSaveName}>
					<form
						class={styles.nameForm}
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
					>
						<label for="name">{intl.t("name")}</label>
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
						/>
						<Show when={errorMsg()} keyed>
							{(msg) => <p id="name-error-msg">{intl.t(msg)}</p>}
						</Show>
						<Button type="submit">{intl.t("saveName")}</Button>
					</form>
				</Show>
			</aside>
		</div>
	);
};

export default SettingsDrawer;
