import zod from "zod";

export const numberPatternSchema = zod.object({
	voterOptions: zod.enum(["fibonacci", "linear"]),
	// 15 from slider + 1 no-vote option
	numberOfOptions: zod
		.number()
		.min(2)
		.max(15 + 1),
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
	"": undefined,
};

export const nameSchema = {
	moderatorName: zod
		.string()
		.min(1, { message: "Must provide a value for name." })
		.max(10, { message: "Name too long. Must be no more than 10 characters." }),
};
