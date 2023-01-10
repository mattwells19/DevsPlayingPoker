/* @refresh reload */
import { render } from "solid-js/web";
import type { Component } from "solid-js";
import { Router } from "solid-app-router";
import IntlProvider from "./i18n";
import App from "./App";

import "./index.scss";

const Index: Component = () => {
	return (
		<Router>
			<IntlProvider locale="en">
				<App />
			</IntlProvider>
		</Router>
	);
};

render(() => <Index />, document.getElementById("root") as HTMLElement);
