import { encodeBase64 } from "encodig/base64";

export async function hashWithSalt(text: string): Promise<string> {
	const salt = Deno.env.get("SALT_KEY");
	if (!salt) {
		throw new Error("Dev didn\tt add the salt so the food tastes awful.");
	}

	const buffer = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(salt + text),
	);
	return encodeBase64(buffer);
}
