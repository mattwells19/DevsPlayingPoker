import {
	createMemo,
	createResource,
	mergeProps,
	on,
	ParentComponent,
	Show,
} from "solid-js";
import { IntlContext } from "./IntlContext";
import { createIntlCache, createIntl } from "@formatjs/intl";
import { createMutable } from "solid-js/store";
import type { IntlConfig, IntlMessages } from "./types";

export type SupportedLocale = "en";

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

interface IntlProviderProps {
	locale: SupportedLocale;
}

const IntlProvider: ParentComponent<IntlProviderProps> = (props) => {
	const cache = createMutable(createIntlCache());

	const [messages] = createResource<IntlMessages, SupportedLocale>(
		() => props.locale,
		(locale) => importMessages(locale),
	);

	const intl = createMemo(
		on(messages, (messages) => {
			return createIntl(
				{
					locale: props.locale,
					messages,
					defaultRichTextElements,
				},
				cache,
			);
		}),
	);

	return (
		<Show
			when={messages() && intl() ? intl() : null}
			fallback={<h1>Loading translations</h1>}
			keyed
		>
			{(intl) => (
				<IntlContext.Provider value={intl}>
					{props.children}
				</IntlContext.Provider>
			)}
		</Show>
	);
};

export default IntlProvider;
