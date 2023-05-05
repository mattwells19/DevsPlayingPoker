import type { RoomSchema } from "@/shared-types";
import {
	CreateRoomFields,
	numberPatternSchema,
	NumberRange,
	rightSizeSchema,
} from "./CreateRoom.schemas";

export const availableOptions: Record<
	CreateRoomFields["voterOptions"],
	RoomSchema["options"]
> = {
	fibonacci: [
		"0.5",
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
	optionsSelect: CreateRoomFields["voterOptions"],
	numberOfOptions: CreateRoomFields["numberOfOptions"],
): Array<string> {
	const options = availableOptions[optionsSelect];
	return numberOfOptions
		? // slice doesn't include the last index, but we need it so +1 to include it
		  options.slice(numberOfOptions[0], numberOfOptions[1] + 1)
		: options;
}

export const defaultRangeSelect: NumberRange = [0, 5];

export function getFormValues(form: HTMLFormElement): CreateRoomFields {
	const formData = new FormData(form);

	const moderatorName = formData.get("moderatorName") as string;
	const voterOptions = formData.get(
		"voterOptions",
	) as CreateRoomFields["voterOptions"];

	if (voterOptions === "yesNo") {
		return {
			moderatorName,
			voterOptions,
			numberOfOptions: null,
			noVote: false,
		};
	} else {
		const numberOfOptionsMin = formData.get("numberOfOptions[0]")?.toString();
		const numberOfOptionsMax = formData.get("numberOfOptions[1]")?.toString();
		const noVote = formData.get("noVote");

		return {
			moderatorName,
			voterOptions,
			numberOfOptions:
				numberOfOptionsMin && numberOfOptionsMax
					? [parseInt(numberOfOptionsMin), parseInt(numberOfOptionsMax)]
					: defaultRangeSelect,
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
	const savedOptions = localStorage.getItem("newRoomOptions");
	const options = savedOptions
		? (safeJSONParse(savedOptions) as Array<string>)
		: ["1", "2", "3", "5", "8", "13"];

	return {
		name,
		options,
	};
}
