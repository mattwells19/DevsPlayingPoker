import type {
	IntlShape as CoreIntlShape,
	ResolvedIntlConfig as CoreResolvedIntlConfig,
} from "@formatjs/intl";
import type { JSXElement } from "solid-js";
import type * as messages from "./translations/en.json";

export type ResolvedIntlConfig = CoreResolvedIntlConfig<JSXElement>;
export type IntlShape = CoreIntlShape<JSXElement>;
export type IntlConfig = Partial<
	Omit<ResolvedIntlConfig, "locale" | "messages">
> &
	Required<Pick<ResolvedIntlConfig, "locale" | "messages">>;

export type IntlMessages = typeof messages;
export type IntlKey = Exclude<keyof IntlMessages, `_${string}_`>;
