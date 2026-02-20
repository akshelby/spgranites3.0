import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

if (typeof (window as any).__hideSplash === 'function') {
  setTimeout(() => (window as any).__hideSplash(), 1800);
}
