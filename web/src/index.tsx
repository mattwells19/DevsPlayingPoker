/* @refresh reload */
import { render } from "solid-js/web";
import type { Component } from "solid-js";
import { Router } from "@solidjs/router";
import { Toaster } from "solid-toast";
import IntlProvider from "./i18n";
import App from "./App";

import "./interpretTheme";
import "./index.scss";
import "virtual:uno.css";
import "@unocss/reset/tailwind-compat.css";

const Index: Component = () => {
	return (
		<IntlProvider locale="en">
			<Router>
				<App />
				<Toaster
					position="top-center"
					toastOptions={{ className: "toast-overrides" }}
				/>
			</Router>
		</IntlProvider>
	);
};

render(() => <Index />, document.getElementById("root") as HTMLElement);
