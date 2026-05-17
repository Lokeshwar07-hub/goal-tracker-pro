import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Production on Vercel (or any static host): set VITE_API_URL to your API origin.
// Local dev leaves this unset — Vite proxies /api to localhost:8080.
const apiBase = import.meta.env.VITE_API_URL;
if (apiBase) {
  setBaseUrl(apiBase.replace(/\/+$/, ""));
}

// BUG FIX: The original main.tsx had no StrictMode wrapper and no guard for
// a missing #root element, which silently fails with a null-reference TypeError
// (crashing the entire bundle) when the HTML is served with an unexpected base
// path and the browser fetches the wrong index.html.
const rootEl = document.getElementById("root");

if (!rootEl) {
  throw new Error(
    '[AtomQuest] Could not find #root element. ' +
    'Check that index.html contains <div id="root"></div> ' +
    'and that Vite is serving the correct index.html.',
  );
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
