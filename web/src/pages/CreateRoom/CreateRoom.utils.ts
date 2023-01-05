import type { RoomSchema } from "@/shared-types";
import {
	CreateRoomFields,
	numberPatternSchema,
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
		? options.slice(numberOfOptions[0], numberOfOptions[1])
		: options;
}

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
		const numberOfOptionsMin =
			formData.get("numberOfOptions[0]")?.toString() ?? "0";
		const numberOfOptionsMax =
			formData.get("numberOfOptions[1]")?.toString() ?? "5";
		const noVote = formData.get("noVote");

		return {
			moderatorName,
			voterOptions,
			numberOfOptions: [
				parseInt(numberOfOptionsMin),
				parseInt(numberOfOptionsMax),
			],
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

	const formValues = ((): Zod.infer<
		typeof numberPatternSchema | typeof rightSizeSchema
	> => {
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

		return {
			voterOptions: "fibonacci",
			numberOfOptions: [0, 5],
			noVote: false,
		};
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
