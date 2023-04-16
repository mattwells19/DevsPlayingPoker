import { useIntl } from "@/i18n";
import mergeClassNames from "@/utils/mergeClassNames";
import { Link, useLocation } from "@solidjs/router";
import { createSignal, ParentComponent, Show, splitProps } from "solid-js";
import Icon from "../Icon";
import SettingsDrawer, { SettingsDrawerActions } from "../SettingsDrawer";

interface HeaderProps extends SettingsDrawerActions {
	class?: string;
}

const Header: ParentComponent<HeaderProps> = (props) => {
	const intl = useIntl();
	const location = useLocation();
	const [drawerOpen, setDrawerOpen] = createSignal<boolean>(false);
	const [componentProps, actions] = splitProps(props, ["class", "children"]);

	return (
		<>
			<header class={mergeClassNames("flex mb-4", props.class)}>
				<div class="flex-1 flex flex-start items-center">
					<Show when={location.pathname !== "/"}>
						<Link href="/">
							<span aria-hidden="true" class="mr-1">
								🏠
							</span>
							{intl.t("home")}
						</Link>
					</Show>
				</div>
				<div class="flex-1">{componentProps.children}</div>
				<div class="flex-1 flex justify-end">
					<a
						href="https://github.com/lvl-mattwells/DevsPlayingPoker"
						target="_blank"
						class="btn-icon"
						title={intl.t("viewGithub") as string}
					>
						<Icon
							name="github"
							boxSize="24"
							fill="currentColor"
							aria-label={intl.t("viewGithub") as string}
						/>
					</a>
					<button
						type="button"
						onClick={[setDrawerOpen, true]}
						title={intl.t("openSettingsDrawer") as string}
						class="btn-icon"
					>
						<Icon
							name="user-solid"
							aria-label={intl.t("openSettingsDrawer") as string}
							boxSize="24"
						/>
					</button>
				</div>
			</header>
			<SettingsDrawer
				isOpen={drawerOpen()}
				onClose={() => setDrawerOpen(false)}
				{...actions}
			/>
		</>
	);
};

export default Header;
