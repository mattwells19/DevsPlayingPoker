import { useFormatMessage } from "@/i18n";
import type { ConfidenceValue, Voter } from "@/shared-types";
import type { MetricProps } from "../Metric";
import { ConfidenceEmojiMap, ConfidenceTextMap } from "./VoterTable";

export default function getStats(voters: Array<Voter>): Array<MetricProps> {
	const t = useFormatMessage();
	const selections = voters.map((voter) => voter.selection);

	const isNumbers = selections.every(
		(selection) =>
			selection === null || selection === "N/A" || !isNaN(Number(selection)),
	);
	if (isNumbers) {
		const modeCounter = new Map<number, number>();

		const numStats = voters.reduce(
			(acc, { selection, confidence }) => {
				if (selection === null || selection === "N/A") {
					return acc;
				}
				const selectionNum = Number(selection);

				const currCount = modeCounter.get(selectionNum) ?? 0;
				const newCount = currCount + 1;
				modeCounter.set(selectionNum, newCount);

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
			{ label: t("low"), value: numStats.low.toString() },
			{ label: t("high"), value: numStats.high.toString() },
			{ label: t("mode"), value: numStats.mode.toString() },
			{
				label: t("confidence"),
				value: ConfidenceEmojiMap[avgConfidence],
				title: t(ConfidenceTextMap[avgConfidence]) as string,
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
				title: t("didNotVote") as string,
			},
			{
				label: t("confidence"),
				value: ConfidenceEmojiMap[avgConfidence],
				title: t(ConfidenceTextMap[avgConfidence]) as string,
			},
		];
	}

	return [];
}
