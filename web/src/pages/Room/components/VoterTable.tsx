import { Component, For, Show } from "solid-js";
import type { RoomSchema } from "@/shared-types";

interface VoterTableProps {
	voters: RoomSchema["voters"];
	roomState: RoomSchema["state"];
}

const VoterTable: Component<VoterTableProps> = ({ roomState, voters }) => {
	return (
		<table>
			<thead>
				<tr>
					<th>Voters</th>
					<th>Voted</th>
					<th>Confidence</th>
				</tr>
			</thead>
			<tbody>
				<For each={voters}>
					{(voter) => (
						<tr>
							<td>{voter.name}</td>
							<td>
								{roomState === "Results"
									? voter.selection
									: voter.selection
									? "✅"
									: "❌"}
							</td>
							<td>{voter.confidence}</td>
						</tr>
					)}
				</For>
			</tbody>
			<tfoot>
				<tr>
					<Show when={roomState === "Results"}>
						<td colspan="3">Waiting to start voting</td>
					</Show>
				</tr>
			</tfoot>
		</table>
	);
};

export default VoterTable;
