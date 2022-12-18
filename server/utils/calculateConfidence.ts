import { ConfidenceValue } from "../types/schemas.ts";

const calculateConfidence = (timeStarted: Date | null): ConfidenceValue => {
	if (!timeStarted) {
		throw new Error(
			`Unable to calculate voting confidence.  No timeStarted found.`,
		);
	}
	const currentTime = new Date();
	const millisecondsElapsed = currentTime.getTime() - timeStarted.getTime();
	const secondsElapsed = millisecondsElapsed / 1000;

	if (secondsElapsed < 5) {
		return ConfidenceValue.high;
	}
	if (secondsElapsed < 15) {
		return ConfidenceValue.medium;
	}
	return ConfidenceValue.low;
};

export default calculateConfidence;
