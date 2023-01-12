import {
	createComputed,
	createContext,
	createResource,
	ParentComponent,
	useContext,
} from "solid-js";
import { createIntlCache, createIntl } from "@formatjs/intl";
import { createMutable, createStore } from "solid-js/store";
import type {
	IntlConfig,
	IntlKey,
	IntlMessages,
	IntlShape,
	SupportedLocale,
} from "./types";

export function importMessages(locale: SupportedLocale): Promise<IntlMessages> {
	switch (locale) {
		case "en":
			// see README for why this is this way
			return import.meta.env.DEV
				? import(`./translations/${locale}.json`)
				: fetch(`/translations/${locale}.json`).then((res) => res.json());
		default:
			throw new Error("Invalid locale.");
	}
}

// If we add any more defaults to the IntlConfig consider extracting to a separate file
const defaultRichTextElements: IntlConfig["defaultRichTextElements"] = {
	b: (chunks) => <b>{chunks}</b>,
};

interface IntlContextValue {
	t: (
		key: IntlKey,
		values?: Parameters<IntlShape["formatMessage"]>[1],
	) => ReturnType<IntlShape["formatMessage"]>;
}

const [intl, setIntl] = createStore<IntlContextValue>({
	t: () => "Loading...",
});
const IntlContext = createContext(intl);
const cache = createMutable(createIntlCache());

interface IntlProviderProps {
	locale: SupportedLocale;
}

const IntlProvider: ParentComponent<IntlProviderProps> = (props) => {
	const [messages] = createResource<IntlMessages, SupportedLocale>(
		() => props.locale,
		(locale) => importMessages(locale),
	);

	createComputed(() => {
		if (messages()) {
			const intlShape = createIntl(
				{
					locale: props.locale,
					messages: messages()!,
					defaultRichTextElements,
				},
				cache,
			);

			setIntl({
				t: (key, values) => intlShape.formatMessage({ id: key }, values),
			});
		}
	});

	return (
		<IntlContext.Provider value={intl}>{props.children}</IntlContext.Provider>
	);
};

export default IntlProvider;
export const useIntl = () => useContext(IntlContext)!;
