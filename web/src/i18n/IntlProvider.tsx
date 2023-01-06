import {
	Component,
	createContext,
	createResource,
	JSXElement,
	Show,
	useContext,
} from "solid-js";
import type * as messages from "./translations/en.json";
import { bold, dynamicInlineValue } from "./formatters";

/**
 * Inspired by: https://github.com/formatjs/formatjs/blob/main/packages/react-intl/examples/StaticTypeSafetyAndCodeSplitting/intlHelpers.tsx
 */

export type IntlMessages = typeof messages;
export type IntlKey = Exclude<keyof IntlMessages, `_${string}_`>;

export type SupportedLocale = "en" | "es";

export function importMessages(locale: SupportedLocale): Promise<IntlMessages> {
	switch (locale) {
		case "en":
		case "es":
			return import(`./translations/${locale}.json`);
		default:
			throw new Error("Invalid locale.");
	}
}

type IntlContextValue = (
	key: IntlKey,
	values?: Record<string, any>,
) => string | NonNullable<JSXElement>;

const IntlContext = createContext<IntlContextValue>(() => "");

interface IntlProviderProps {
	locale: SupportedLocale;
	children: JSXElement;
}

const IntlProvider: Component<IntlProviderProps> = (props) => {
	const [t] = createResource<IntlContextValue, SupportedLocale>(
		() => props.locale,
		(locale) =>
			importMessages(locale).then((messages) => (key, values) => {
				if (!Object.hasOwn(messages, key)) {
					console.warn(`Missing tranlsation for key: '${key}'.`);
					return "💩";
				}

				let msg: ReturnType<IntlContextValue> = messages[key];
				msg = dynamicInlineValue(msg, values);
				msg = bold(msg) ?? msg;

				return msg;
			}),
	);

	return (
		<Show when={t()} fallback={<h1>Loading translations</h1>} keyed>
			{(t) => (
				<IntlContext.Provider value={t}>{props.children}</IntlContext.Provider>
			)}
		</Show>
	);
};

export default IntlProvider;

export const useIntl = () => useContext(IntlContext);
