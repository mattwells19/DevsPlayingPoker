import type { NextFunction, OpineRequest, OpineResponse } from "../deps.ts";

const rateLimitMap = new Map<string, Array<number>>();

const windowMs = 30 * 1000;
const attempts = 10;

setInterval(() => {
	rateLimitMap.forEach((requestTimestamps, ip) => {
		const timestampsInWindow = requestTimestamps.filter(
			(requestTimestamp) => Date.now() - requestTimestamp < windowMs,
		);

		if (timestampsInWindow.length === 0) {
			rateLimitMap.delete(ip);
		}
	});
}, 30 * 1000);

export default function rateLimiter(
	req: OpineRequest,
	res: OpineResponse,
	next: NextFunction,
) {
	const timestamp = Date.now();
	const ip = req.ip;

	const ipRequestTimestamps = rateLimitMap.get(ip);

	if (ipRequestTimestamps) {
		const timestampsInWindow = ipRequestTimestamps.filter(
			(requestTimestamp) => Date.now() - requestTimestamp < windowMs,
		);
		const attemptsRemaining = attempts - timestampsInWindow.length;

		// Since we're tracking failed attempts as well this is to prevent memory overflow from a barage of bad requests
		// prepend most recent timestamp to maintain sort order (lower index = more recent request)
		const limitedTimestampsInWindow = [timestamp, ...timestampsInWindow].slice(
			0,
			attempts,
		);

		rateLimitMap.set(ip, limitedTimestampsInWindow);

		// https://developer.okta.com/docs/reference/rl-best-practices/
		const nextOpening =
			Date.now() +
			(windowMs -
				(Date.now() -
					limitedTimestampsInWindow[limitedTimestampsInWindow.length - 1]));
		res
			.setHeader("X-Rate-Limit-Limit", attempts.toString())
			.setHeader("X-Rate-Limit-Remaining", attemptsRemaining.toString())
			.setHeader("X-Rate-Limit-Reset", nextOpening.toString());

		if (attemptsRemaining <= 0) {
			return res.setStatus(429).send({
				success: false,
				message: "Too many requests. Try again later.",
			});
		}
	} else {
		rateLimitMap.set(ip, [timestamp]);
	}

	next();
}
