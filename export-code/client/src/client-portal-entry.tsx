import { createRoot } from "react-dom/client";
import ClientPortalRouter from "./client-router";
import "./index.css";

// Create root for client portal
createRoot(document.getElementById("client-root")!).render(<ClientPortalRouter />);