import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import LoyaltyCardPage from './components/LoyaltyCardPage.jsx';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/ibm-plex-mono/500.css';
import './index.css';

// Pas de librairie de routing dans ce projet (site une-page à ancres) : on
// se contente ici de détecter l'unique route à part, /carte/<code>, ouverte
// en scannant le QR code d'une carte de fidélité physique.
const cardMatch = window.location.pathname.match(/^\/carte\/([^/]+)\/?$/);

const root = cardMatch ? (
  <AppProvider>
    <AuthProvider>
      <LoyaltyCardPage code={cardMatch[1].toUpperCase()} />
    </AuthProvider>
  </AppProvider>
) : (
  <App />
);

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode>{root}</React.StrictMode>);
