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
		const modeCounter = new Map<number, number>();

		const numStats = voters.reduce(
			(acc, { selection, confidence }) => {
				if (selection === null || selection === "N/A") {
					return acc;
				}
				const selectionNum = parseInt(selection, 10);

				const currCount = modeCounter.get(selectionNum) ?? 0;
				const newCount = currCount + 1;
				const currModeCount = modeCounter.get(acc.mode) ?? -1;

				return {
					high: selectionNum > acc.high ? selectionNum : acc.high,
					low: selectionNum < acc.low ? selectionNum : acc.low,
					mode:
						newCount > currModeCount ||
						(newCount === currModeCount && selectionNum > acc.mode)
							? selectionNum
							: acc.mode,
					totalConfidence: acc.totalConfidence + confidence,
					voterCount: acc.voterCount + 1,
				};
			},
			{
				high: -1,
				low: Infinity,
				mode: -1,
				totalConfidence: 0,
				voterCount: 0,
			},
		);

		const avgConfidence: ConfidenceValue = Math.round(
			numStats.totalConfidence / numStats.voterCount,
		);

		return [
			{ label: "Low", value: numStats.low.toString() },
			{ label: "High", value: numStats.high.toString() },
			{ label: "Mode", value: numStats.mode.toString() },
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
		const rightSizeStats = voters.reduce(
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
			{ yes: 0, no: 0, totalConfidence: 0 },
		);

		const voterCount = rightSizeStats.yes + rightSizeStats.no;
		const avgConfidence: ConfidenceValue = Math.round(
			rightSizeStats.totalConfidence / voterCount,
		);

		return [
			{
				label: "Yes",
				value: `${Math.round((rightSizeStats.yes / voterCount) * 100)}%`,
			},
			{
				label: "No",
				value: `${Math.round((rightSizeStats.no / voterCount) * 100)}%`,
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
