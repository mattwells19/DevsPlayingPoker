/* @refresh reload */
import { render } from "solid-js/web";
import type { Component } from "solid-js";
import { Router } from "solid-app-router";
import IntlProvider from "./i18n";
import App from "./App";

import "./interpretTheme";
import "./index.scss";

const Index: Component = () => {
	return (
		<IntlProvider locale="en">
			<Router>
				<App />
			</Router>
		</IntlProvider>
	);
};

render(() => <Index />, document.getElementById("root") as HTMLElement);
