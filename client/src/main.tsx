import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Handle share from other apps (Web Share Target API)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHARE_URL') {
      const { url, title, text } = event.data;
      // Redirect to share handler
      window.location.href = `/share?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title || '')}&text=${encodeURIComponent(text || '')}`;
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
