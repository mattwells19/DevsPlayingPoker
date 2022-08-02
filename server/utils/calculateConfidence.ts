import { ConfidenceValue } from "../models/room.model.ts";

const calculateConfidence = (timeStarted: Date): ConfidenceValue => {
	const currentTime = new Date();
	const millisecondsElapsed = currentTime.getTime() - timeStarted.getTime();
	const secondsElapsed = millisecondsElapsed / 1000;

	if (secondsElapsed < 15) {
		return ConfidenceValue.high;
	}
	if (secondsElapsed < 45) {
		return ConfidenceValue.medium;
	}
	return ConfidenceValue.low;
};

export default calculateConfidence;
