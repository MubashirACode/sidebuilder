// main.tsx
import React from "react";
import "./index.css";

import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // ← Add if needed
import App from "./App.tsx";
import { Providers } from "./providers.tsx"; // Adjust path

const queryClient = new QueryClient(); // Create a QueryClient instance

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}> {/* ← Wrap if not included in AuthQueryProvider */}
      <BrowserRouter>
        <Providers>
          <App />
        </Providers>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);