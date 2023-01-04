import { numberPatternSchema, rightSizeSchema } from "./CreateRoom.schemas";

export type VoterOptions = "" | "fibonacci" | "linear" | "yesNo";

export const availableOptions: Record<VoterOptions, Array<string>> = {
	"": [],
	fibonacci: [
		"1",
		"2",
		"3",
		"5",
		"8",
		"13",
		"21",
		"34",
		"55",
		"89",
		"144",
		"233",
		"377",
		"610",
		"987",
	],
	linear: [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"10",
		"11",
		"12",
		"13",
		"14",
		"15",
	],
	yesNo: ["Yes", "No"],
};

export function getOptions(
	optionsSelect: VoterOptions,
	numberOfOptions: number | null,
): Array<string> {
	const options = availableOptions[optionsSelect];
	return numberOfOptions ? options.slice(0, numberOfOptions) : options;
}

export function getFormValues(form: HTMLFormElement) {
	const formData = new FormData(form);

	const moderatorName = formData.get("moderatorName") as string;
	const voterOptions = formData.get("voterOptions") as VoterOptions;

	if (voterOptions === "yesNo") {
		return {
			moderatorName,
			voterOptions,
			numberOfOptions: null,
			noVote: false,
		};
	} else {
		const numberOfOptions = formData.get("numberOfOptions")?.toString();
		const noVote = formData.get("noVote");

		return {
			moderatorName,
			voterOptions,
			numberOfOptions: numberOfOptions ? parseInt(numberOfOptions, 10) : 8,
			noVote: noVote ? noVote === "yes" : false,
		};
	}
}

export function safeJSONParse<T>(value: string): T | undefined {
	try {
		return JSON.parse(value);
	} catch {
		return undefined;
	}
}

export function getDefaultValues() {
	const name = localStorage.getItem("name") ?? "";

	const formValues = (() => {
		const rawSavedFormValues = localStorage.getItem("newRoomFields");
		const parsedSavedFormValues = rawSavedFormValues
			? safeJSONParse(rawSavedFormValues)
			: undefined;

		const numPatternSchemaCheck = numberPatternSchema.safeParse(
			parsedSavedFormValues,
		);

		if (numPatternSchemaCheck.success) {
			return numPatternSchemaCheck.data;
		}

		const rightSizeSchemaCheck = rightSizeSchema.safeParse(
			parsedSavedFormValues,
		);
		if (rightSizeSchemaCheck.success) {
			return rightSizeSchemaCheck.data;
		}

		return undefined;
	})();

	const list = (() => {
		if (!formValues) return "";

		const { voterOptions, numberOfOptions, noVote } = formValues;
		const fieldOptions = getOptions(voterOptions, numberOfOptions);

		const updatedList = fieldOptions.join(", ");
		if (noVote) {
			return updatedList + ", 🚫";
		} else {
			return updatedList;
		}
	})();

	return {
		name,
		formValues,
		list,
	};
}
