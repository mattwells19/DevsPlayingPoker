import type { Component } from "solid-js";
import { useIntl } from "@/i18n";

interface ConnectionStatusBadgeProps {
	connStatus: "connecting" | "connected" | "disconnected";
	onReset: () => void;
}

const ConnectionStatusBadge: Component<ConnectionStatusBadgeProps> = (
	props,
) => {
	const intl = useIntl();

	return (
		<button
			type="button"
			class="btn btn-ghost btn-xs rounded-full pl-1"
			onClick={props.onReset}
			title={intl.t("manualReset") as string}
		>
			<span
				class="badge p-0.5 h-3 w-3 mr-1"
				classList={{
					"badge-success": props.connStatus === "connected",
					"badge-warning": props.connStatus === "connecting",
					"badge-error": props.connStatus === "disconnected",
				}}
			></span>
			{intl.t(props.connStatus)}
		</button>
	);
};

export default ConnectionStatusBadge;
