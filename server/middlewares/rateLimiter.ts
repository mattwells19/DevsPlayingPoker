import type { NextFunction, OpineRequest, OpineResponse } from "../deps.ts";

interface LimitInfo {
	attemptsRemaining: number;
	lastRequestTimestamp: number;
}

const rateLimitMap = new Map<string, LimitInfo>();

const windowMs = 60 * 1000;
const attempts = 5;

export default function rateLimiter(
	req: OpineRequest,
	res: OpineResponse,
	next: NextFunction,
) {
	const timestamp = Date.now();
	const ip = req.ip;

	const ipLimitInfo = rateLimitMap.get(ip);

	if (
		ipLimitInfo &&
		// last request was within the window
		timestamp - ipLimitInfo.lastRequestTimestamp < windowMs &&
		ipLimitInfo.attemptsRemaining === 0
	) {
		return res.setStatus(429).send({
			success: false,
			message: "Too many requests. Try again later.",
		});
	}

	rateLimitMap.set(ip, {
		attemptsRemaining: (ipLimitInfo?.attemptsRemaining ?? attempts) - 1,
		lastRequestTimestamp: timestamp,
	});

	return next();
}

/*
const rateLimitMap = new Map<string, Array<number>>();

const windowMs = 10 * 1000;
const attempts = 5;

export default function rateLimiter(
	req: OpineRequest,
	res: OpineResponse,
	next: NextFunction,
) {
	const timestamp = Date.now();
	const ip = req.ip;

	const ipRequestTimestamps = rateLimitMap.get(ip);

	console.log(ip, ipRequestTimestamps);

	if (ipRequestTimestamps) {
		const timestampsInWindow = ipRequestTimestamps.filter(
			(requestTimestamp) => Date.now() - requestTimestamp < windowMs,
		);
		const usedAttempts = attempts - timestampsInWindow.length;

		// Since we're tracking failed attempts as well this is to prevent memory overflow from a barage of bad requests
		// prepend most recent timestamp to maintain sort order (more recent = lower index)
		const limitedTimestampsInWindow = [timestamp, ...timestampsInWindow].slice(
			0,
			attempts,
		);

		rateLimitMap.set(ip, limitedTimestampsInWindow);

		if (usedAttempts <= 0) {
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
*/
