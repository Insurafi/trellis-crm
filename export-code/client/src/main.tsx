import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add document title and meta description
document.title = "Trellis - Insurance Broker CRM";
// Add favicon
const favicon = document.createElement("link");
favicon.rel = "icon";
favicon.href = "https://cdn.jsdelivr.net/npm/remixicon@2.5.0/icons/Business/customer-service-2-line.svg";
document.head.appendChild(favicon);

createRoot(document.getElementById("root")!).render(<App />);
