import {
	NextFunction,
	OpineRequest,
	OpineResponse,
	getCookies,
	setCookie,
	ObjectId,
} from "../deps.ts";
import constants from "../utils/constants.ts";
import db from "../utils/db.ts";

export async function handleCookie(
	req: OpineRequest,
	res: OpineResponse,
	next: NextFunction,
) {
	const cookies = getCookies(req.headers);
	const sessionId = cookies["session"];

	if (sessionId) {
		const session = await db.sessions.findOne({
			_id: new ObjectId(sessionId),
			environment: constants.environment,
		});

		// session still valid, update cookie header and continue
		if (session && session.maxAge.valueOf() > Date.now()) {
			if (!res.headers) {
				res.headers = new Headers();
			}

			setCookie(res.headers, {
				name: "session",
				value: session._id.toString(),
				maxAge: session.maxAge.valueOf(),
				path: "/",
				sameSite: "Strict",
				secure: constants.environment !== "local",
				httpOnly: true,
			});

			return next();
		}
	}

	// if there's no sessionId in the cookie list or it is invalid, start a new session
	const maxAge = Date.now() + constants.sessionTimeout;
	await db.sessions
		.insertOne({
			maxAge: new Date(maxAge),
			environment: constants.environment,
		})
		.then((newSession) => {
			if (!res.headers) {
				res.headers = new Headers();
			}

			setCookie(res.headers, {
				name: "session",
				value: newSession.toString(),
				maxAge,
				path: "/",
				sameSite: "Strict",
				secure: constants.environment !== "local",
				httpOnly: true,
			});

			next();
		});
}
