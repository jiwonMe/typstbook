import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/App";
import { applyStoredColorMode } from "@/lib/theme";
import "@/index.css";

applyStoredColorMode();

const root = document.getElementById("root");
if (!root) {
  throw new Error("#root is missing");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
