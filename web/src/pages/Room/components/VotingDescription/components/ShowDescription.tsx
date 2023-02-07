import { useIntl } from "@/i18n";
import mergeClassNames from "@/utils/mergeClassNames";
import { Component, createEffect, JSXElement, Show } from "solid-js";
import Icon from "@/components/Icon";
import { useRoom } from "../../../RoomContext";
import styles from "../VotingDescription.module.scss";

function formatStringWithUrl(str: string): JSXElement {
	const urlStartIndex = str.indexOf("https://");
	if (urlStartIndex === -1) {
		return str;
	}

	const fullUrl = str.substring(urlStartIndex).split(/\s/)[0];
	const bits = str.split(fullUrl);

	return (
		<>
			{formatStringWithUrl(bits[0])}
			<a
				href={fullUrl}
				target="_blank"
				referrerPolicy="no-referrer"
				class="link text-secondary dark:text-accent"
			>
				{fullUrl}
			</a>
			{formatStringWithUrl(bits[1])}
		</>
	);
}

const ShowDescription: Component<{ onStartEditing: () => void }> = (props) => {
	const intl = useIntl();
	const room = useRoom();

	let detailsRef: HTMLDetailsElement | null = null;
	let prevVotingDescription = "";

	createEffect(() => {
		if (
			detailsRef &&
			room.roomData.votingDescription !== prevVotingDescription
		) {
			detailsRef.open = true;
		}
		prevVotingDescription = room.roomData.votingDescription;
	});

	const formattedDescription = () =>
		formatStringWithUrl(room.roomData.votingDescription);

	return (
		<section class="my-10">
			<Show when={room.roomData.votingDescription}>
				<details
					open
					ref={(el) => (detailsRef = el)}
					class="border border-base-content border-opacity-20 rounded-lg my-2 group"
				>
					<summary
						class={mergeClassNames(
							styles.showDescSummary,
							"rounded-lg group-open:rounded-b-none py-2 px-4 flex items-center cursor-pointer",
						)}
					>
						<Icon
							name="caret-down"
							fill="none"
							stroke-width="2.5"
							stroke="currentColor"
							class="w-4 h-4 mr-2 group-open:rotate-90"
						/>
						<p class="flex-grow text-xl font-bold">
							{intl.t("whatWereVotingOn")}
						</p>
						<Show
							when={
								room.roomData.moderator?.id === room.currentUserId &&
								room.roomData.state === "Results"
							}
						>
							<div
								class={mergeClassNames(styles.formGroup, "inline-flex gap-2")}
							>
								<form
									onSubmit={(e) => {
										e.preventDefault();
										props.onStartEditing();
									}}
								>
									<button type="submit" class="btn btn-primary btn-sm">
										{intl.t("edit")}
									</button>
								</form>
								<form
									onSubmit={(e) => {
										e.preventDefault();
										room.dispatchEvent({
											event: "UpdateVotingDescription",
											value: "",
										});
									}}
								>
									<button type="submit" class="btn btn-ghost btn-sm">
										{intl.t("clear")}
									</button>
								</form>
							</div>
						</Show>
					</summary>
					<pre class="w-full overflow-hidden whitespace-pre-line p-4 h-auto border-t border-base-content border-opacity-20 font-sans">
						{formattedDescription()}
					</pre>
				</details>
			</Show>
			<Show
				when={
					room.roomData.moderator?.id === room.currentUserId &&
					room.roomData.state === "Results" &&
					!room.roomData.votingDescription
				}
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						props.onStartEditing();
					}}
					class="flex justify-center"
				>
					<button
						type="submit"
						class="btn btn-sm btn-secondary dark:btn-accent btn-outline dark:btn-outline"
					>
						{intl.t("addVotingDesc")}
					</button>
				</form>
			</Show>
		</section>
	);
};

export default ShowDescription;
