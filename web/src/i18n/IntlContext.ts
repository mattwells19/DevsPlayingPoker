import { createContext, useContext } from "solid-js";
import { IntlKey, IntlShape } from "./types";

export const IntlContext = createContext<IntlShape | null>(null);

export const useIntl = (): IntlShape => {
	const ctx = useContext(IntlContext);
	if (!ctx) throw new Error("Oops, missing that IntlProvider it seems.");
	return ctx;
};

type FormatMessageFn = (
	key: IntlKey,
	values?: Parameters<IntlShape["formatMessage"]>[1],
) => ReturnType<IntlShape["formatMessage"]>;

export const useFormatMessage = (): FormatMessageFn => {
	const intl = useContext(IntlContext);
	if (!intl) return () => "💩";

	return (key, values) => intl.formatMessage({ id: key }, values);
};
