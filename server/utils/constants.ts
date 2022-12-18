import type { SessionSchema } from "../types/schemas.ts";

export default {
	sessionTimeout: 60 * 60 * 1000,
	environment: (Deno.env.get("ENVIRONMENT") ??
		"local") as SessionSchema["environment"],
};
