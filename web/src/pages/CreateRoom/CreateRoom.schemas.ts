import zod from "zod";

export type NumberRange = [number, number];

export interface CreateRoomFields {
	moderatorName: string;
	voterOptions: keyof typeof optionsSchemaMap;
	numberOfOptions: NumberRange | null;
	noVote: boolean;
}

export const numberPatternSchema = zod.object({
	voterOptions: zod.enum(["fibonacci", "linear"]),
	numberOfOptions: zod.tuple([
		zod.number().min(0).max(13),
		zod.number().min(2).max(14),
	]),
	noVote: zod.boolean(),
});

export const rightSizeSchema = zod.object({
	voterOptions: zod.literal("yesNo"),
	numberOfOptions: zod.literal(null),
	noVote: zod.literal(false),
});

export const optionsSchemaMap = {
	fibonacci: numberPatternSchema,
	linear: numberPatternSchema,
	yesNo: rightSizeSchema,
};

export const nameSchema = {
	moderatorName: zod
		.string()
		.min(1, { message: "Must provide a value for name." })
		.max(10, { message: "Name too long. Must be no more than 10 characters." }),
};
