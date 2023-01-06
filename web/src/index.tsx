/* @refresh reload */
import { render } from "solid-js/web";
import { Component, createSignal } from "solid-js";
import { Router } from "solid-app-router";
import IntlProvider, { SupportedLocale } from "./i18n/IntlProvider";
import App from "./App";

import "./index.scss";

const Index: Component = () => {
	const [locale, setLocale] = createSignal<SupportedLocale>("en");
	return (
		<IntlProvider locale={locale()}>
			<Router>
				<button
					onClick={() => setLocale((prev) => (prev === "es" ? "en" : "es"))}
				>
					Toggle Locale
				</button>
				<App />
			</Router>
		</IntlProvider>
	);
};

render(() => <Index />, document.getElementById("root") as HTMLElement);
