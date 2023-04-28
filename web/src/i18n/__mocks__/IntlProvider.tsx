import { createContext, ParentComponent, useContext } from "solid-js";
import { createIntlCache, createIntl } from "@formatjs/intl";
import { createMutable } from "solid-js/store";
import type { IntlConfig, IntlKey, IntlShape, SupportedLocale } from "../types";
import messages from "../translations/en.json";

// If we add any more defaults to the IntlConfig consider extracting to a separate file
const defaultRichTextElements: IntlConfig["defaultRichTextElements"] = {
	b: (chunks) => <span class="font-bold">{chunks}</span>,
};

interface IntlContextValue {
	t: (
		key: IntlKey,
		values?: Parameters<IntlShape["formatMessage"]>[1],
	) => ReturnType<IntlShape["formatMessage"]>;
}

const cache = createMutable(createIntlCache());
const intlShape = createIntl(
	{
		locale: "en",
		messages,
		defaultRichTextElements,
	},
	cache,
);
const intl: IntlContextValue = {
	t: (key, values) => intlShape.formatMessage({ id: key }, values),
};
const IntlContext = createContext(intl);

interface IntlProviderProps {
	locale: SupportedLocale;
}

const IntlProvider: ParentComponent<IntlProviderProps> = (props) => {
	return (
		<IntlContext.Provider value={intl}>{props.children}</IntlContext.Provider>
	);
};

export default IntlProvider;
export const useIntl = () => useContext(IntlContext)!;
