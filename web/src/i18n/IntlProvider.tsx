import { Component, createResource, JSXElement, Show } from "solid-js";
import { IntlContextValue, IntlMessages, IntlContext } from "./IntlContext";
import { bold, dynamicInlineValue } from "./formatters";

/**
 * Inspired by: https://github.com/formatjs/formatjs/blob/main/packages/react-intl/examples/StaticTypeSafetyAndCodeSplitting/intlHelpers.tsx
 */

export type SupportedLocale = "en";

export function importMessages(locale: SupportedLocale): Promise<IntlMessages> {
	switch (locale) {
		case "en":
			return import(`./translations/${locale}.json`);
		default:
			throw new Error("Invalid locale.");
	}
}

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
