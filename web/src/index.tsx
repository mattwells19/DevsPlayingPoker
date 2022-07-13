/* @refresh reload */
import { render } from "solid-js/web";
import { Component } from "solid-js";
import { Router } from "solid-app-router";
import App from "./App";

import "./index.scss";

const Index: Component = () => {
	return (
		<Router>
			<App />
		</Router>
	);
};

render(() => <Index />, document.getElementById("root") as HTMLElement);
