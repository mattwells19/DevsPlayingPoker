import {
	Component,
	createContext,
	createResource,
	JSXElement,
	Show,
	useContext,
} from "solid-js";
import type * as messages from "./translations/en.json";

/**
 * Inspired by: https://github.com/formatjs/formatjs/blob/main/packages/react-intl/examples/StaticTypeSafetyAndCodeSplitting/intlHelpers.tsx
 */

export type IntlMessages = typeof messages;
export type IntlKey = Exclude<keyof IntlMessages, `_${string}_`>;

type SupportLocale = "en";

export function importMessages(locale: SupportLocale): Promise<IntlMessages> {
	switch (locale) {
		case "en":
			return import(`./translations/${locale}.json`);
		default:
			throw new Error("Invalid locale.");
	}
}

type IntlContextValue = (
	key: IntlKey,
	values?: Record<string, any>,
) => string | JSXElement;

const IntlContext = createContext<IntlContextValue>(() => "");

interface IntlProviderProps {
	locale: SupportLocale;
	children: JSXElement;
}

const IntlProvider: Component<IntlProviderProps> = (props) => {
	const [t] = createResource(async () => {
		const messages = await importMessages(props.locale);

		const t: IntlContextValue = (key, values) => {
			if (!messages) {
				throw new Error("This shouldn't happen because of the show.");
			} else {
				if (!(key in messages)) {
					console.warn(`Missing tranlsation for key: '${key}'.`);
					return "💩";
				}

				let msg = messages[key];
				if (!values) return msg;

				Object.entries(values).forEach(([key, value]) => {
					msg = msg.replace(`{${key}}`, value);
				});

				return msg;
			}
		};

		return t;
	});

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
