import React from "react";
import {createRoot} from "react-dom/client";
import { App } from "./components/App";
import { loadConfig } from "./utils/config";

loadConfig().then(() => {
    const container = document.getElementById("app");
    const root = createRoot(container!);
    root.render(<App />);
});
