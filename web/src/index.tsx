/* @refresh reload */
import { render } from "solid-js/web";
import type { Component } from "solid-js";
import { Toaster } from "solid-toast";
import IntlProvider from "./i18n";
import App from "./App";

import "./interpretTheme";
import "virtual:uno.css";
import "./index.scss";

const Index: Component = () => {
	return (
		<IntlProvider locale="en">
			<App />
			<Toaster
				position="top-center"
				toastOptions={{ className: "toast-overrides" }}
			/>
		</IntlProvider>
	);
};

render(() => <Index />, document.getElementById("root") as HTMLElement);
