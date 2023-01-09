import { createContext, JSXElement, useContext } from "solid-js";
import type * as messages from "./translations/en.json";

export type IntlMessages = typeof messages;
export type IntlKey = Exclude<keyof IntlMessages, `_${string}_`>;

export type IntlContextValue = (
	key: IntlKey,
	values?: Record<string, any>,
) => string | NonNullable<JSXElement>;

export const IntlContext = createContext<IntlContextValue>(() => "");

export const useIntl = () => useContext(IntlContext);
