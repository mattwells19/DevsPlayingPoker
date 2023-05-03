import { useIntl } from "@/i18n";
import mergeClassNames from "@/utils/mergeClassNames";
import { Link, useLocation } from "@solidjs/router";
import { ParentComponent, Show, splitProps } from "solid-js";
import Icon from "../Icon";
import SettingsDrawer, { SettingsDrawerActions } from "../SettingsDrawer";

interface HeaderProps extends SettingsDrawerActions {
	class?: string;
}

const Header: ParentComponent<HeaderProps> = (props) => {
	const intl = useIntl();
	const location = useLocation();
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
				<div class="flex-1 flex justify-center items-center">
					{componentProps.children}
				</div>
				<div class="flex-1 flex justify-end items-center">
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
					<SettingsDrawer {...actions}>
						{(openProps) => (
							<button
								type="button"
								title={intl.t("openSettingsDrawer") as string}
								class="btn-icon"
								{...openProps}
							>
								<Icon
									name="user-solid"
									aria-label={intl.t("openSettingsDrawer") as string}
									boxSize="24"
								/>
							</button>
						)}
					</SettingsDrawer>
				</div>
			</header>
		</>
	);
};

export default Header;
