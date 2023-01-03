import type { ConfidenceValue, Voter } from "@/shared-types";
import type { MetricProps } from "../Metric";
import { ConfidenceEmojiMap, ConfidenceTextMap } from "./VoterTable";

export default function getStats(voters: Array<Voter>): Array<MetricProps> {
	const selections = voters.map((voter) => voter.selection);

	const isNumbers = selections.every(
		(selection) =>
			selection === null || selection === "N/A" || !isNaN(parseInt(selection)),
	);
	if (isNumbers) {
		let high = -1,
			low = Infinity,
			mode = -1,
			voterCount = 0,
			avgConfidence: ConfidenceValue = 0;
		const modeCounter = new Map<number, number>();

		voters.forEach(({ selection, confidence }) => {
			if (selection === null || selection === "N/A") return;
			const selectionNum = parseInt(selection, 10);
			voterCount++;

			const currCount = modeCounter.get(selectionNum) ?? 0;
			const newCount = currCount + 1;

			const currModeCount = modeCounter.get(mode) ?? -1;
			if (
				newCount > currModeCount ||
				(newCount === currModeCount && selectionNum > mode)
			) {
				mode = selectionNum;
			}

			modeCounter.set(selectionNum, newCount);

			if (selectionNum > high) {
				high = selectionNum;
			}
			if (selectionNum < low) {
				low = selectionNum;
			}

			avgConfidence += confidence;
		});
		avgConfidence = Math.round(avgConfidence / voterCount);

		return [
			{ label: "Low", value: low.toString() },
			{ label: "High", value: high.toString() },
			{ label: "Mode", value: mode.toString() },
			{
				label: "Confidence",
				value: ConfidenceEmojiMap[avgConfidence],
				title: ConfidenceTextMap[avgConfidence],
			},
		];
	}

	const isRightSize = selections.every(
		(selection) =>
			selection === null || selection === "Yes" || selection === "No",
	);
	if (isRightSize) {
		const countMap = voters.reduce(
			(acc, curr) => {
				if (curr.selection === "Yes") {
					return {
						...acc,
						yes: acc.yes + 1,
						totalConfidence: acc.totalConfidence + curr.confidence,
					};
				} else if (curr.selection === "No") {
					return {
						...acc,
						no: acc.no + 1,
						totalConfidence: acc.totalConfidence + curr.confidence,
					};
				}
				return acc;
			},
			{ yes: 0, no: 0, totalConfidence: 0 as ConfidenceValue },
		);

		const voterCount = countMap.yes + countMap.no;
		const avgConfidence: ConfidenceValue = Math.round(
			countMap.totalConfidence / voterCount,
		);

		return [
			{
				label: "Yes",
				value: `${Math.round((countMap.yes / voterCount) * 100)}%`,
			},
			{
				label: "No",
				value: `${Math.round((countMap.no / voterCount) * 100)}%`,
			},
			{
				label: "DNV",
				value: voters.length - voterCount,
				title: "Did not vote",
			},
			{
				label: "Confidence",
				value: ConfidenceEmojiMap[avgConfidence],
				title: ConfidenceTextMap[avgConfidence],
			},
		];
	}

	return [];
}
