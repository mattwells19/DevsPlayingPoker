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
			class="btn-ghost text-xs rounded-full py-1.5 px-2 flex items-center gap-1.5"
			onClick={props.onReset}
			title={intl.t("manualReset") as string}
		>
			<span
				class="inline-flex h-3 w-3 rounded-full"
				classList={{
					"bg-green": props.connStatus === "connected",
					"bg-yellow": props.connStatus === "connecting",
					"bg-red": props.connStatus === "disconnected",
				}}
			></span>
			{intl.t(props.connStatus)}
		</button>
	);
};

export default ConnectionStatusBadge;
