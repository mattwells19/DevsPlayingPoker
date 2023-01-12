import Button from "@/components/Button";
import { useIntl } from "@/i18n";
import { Component, createEffect, JSXElement, Show } from "solid-js";
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
			<a href={fullUrl} target="_blank" referrerPolicy="no-referrer">
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

	createEffect(() => {
		if (detailsRef) {
			detailsRef.open = true;
		}
	});

	const formattedDescription = () =>
		formatStringWithUrl(room.roomData.votingDescription);

	return (
		<section class={styles.showDesc}>
			<Show when={room.roomData.votingDescription}>
				<details open ref={(el) => (detailsRef = el)}>
					<summary>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="2.5"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M8.25 4.5l7.5 7.5-7.5 7.5"
							/>
						</svg>
						<p>{intl.t("whatWereVotingOn")}</p>
						<Show
							when={
								room.roomData.moderator?.id === room.currentUserId &&
								room.roomData.state === "Results"
							}
						>
							<div class={styles.formGroup}>
								<form
									onSubmit={(e) => {
										e.preventDefault();
										props.onStartEditing();
									}}
								>
									<Button type="submit">{intl.t("edit")}</Button>
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
									<Button type="submit" variant="outline">
										{intl.t("clear")}
									</Button>
								</form>
							</div>
						</Show>
					</summary>
					<pre>{formattedDescription()}</pre>
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
					class={styles.addDescForm}
					onSubmit={(e) => {
						e.preventDefault();
						props.onStartEditing();
					}}
				>
					<Button type="submit" variant="outline">
						{intl.t("addVotingDesc")}
					</Button>
				</form>
			</Show>
		</section>
	);
};

export default ShowDescription;
