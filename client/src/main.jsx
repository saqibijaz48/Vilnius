import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store.js";
import { Toaster } from "./components/ui/toaster.jsx";
import { LanguageProvider } from "./contexts/LanguageContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <LanguageProvider>
        <App />
        <Toaster />
      </LanguageProvider>
    </Provider>
  </BrowserRouter>
);
