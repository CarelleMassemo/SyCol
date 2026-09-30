import { lazy, Suspense } from 'react';
import { AppProvider } from './context/AppContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Team from './components/Team';
import Products from './components/Products';
import Services from './components/Services';
import Footer from './components/Footer';
import Toast from './components/Toast';

// Sections situées plus bas dans la page : chargées en différé (code-splitting)
// pour que le premier écran (Hero) s'affiche le plus vite possible.
const Reviews = lazy(() => import('./components/Reviews.jsx'));
const Contact = lazy(() => import('./components/Contact.jsx'));

function SectionFallback() {
  return <div className="h-[400px] flex items-center justify-center text-muted text-sm">Chargement…</div>;
}

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <CartProvider>
          <Header />
          <main>
            <Hero />
            <About />
            <Team />
            <Products />
            <Services />
            <Suspense fallback={<SectionFallback />}>
              <Reviews />
            </Suspense>
            <Suspense fallback={<SectionFallback />}>
              <Contact />
            </Suspense>
          </main>
          <Footer />
          <Toast />
        </CartProvider>
      </AuthProvider>
    </AppProvider>
  );
}
