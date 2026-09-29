import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.scss";
import App from "./App.tsx";
import { DataProvider } from "./DataContext";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <DataProvider>
            <App />
        </DataProvider>
    </StrictMode>,
);
