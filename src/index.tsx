import React from "react";
import ReactDOM from "react-dom";
import { App } from "./components/App";
import { loadConfig } from "./utils/config";

loadConfig().then(() => {
    const container = document.getElementById("app");
    const root = ReactDOM.createRoot(container!);
    root.render(<App />);
});
