import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage/HomePage';
import { WeatherPage } from './pages/WeatherPage/WeatherPage';
import { ScrollToTop } from './components/ScrollToTop/ScrollToTop';

// Lazy load less frequently accessed pages
const CountyPage = lazy(() => import('./pages/CountyPage/CountyPage').then(m => ({ default: m.CountyPage })));
const AboutPage = lazy(() => import('./pages/AboutPage/AboutPage').then(m => ({ default: m.AboutPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage/TermsPage').then(m => ({ default: m.TermsPage })));
const WeatherRedirect = lazy(() => import('./pages/WeatherRedirect/WeatherRedirect').then(m => ({ default: m.WeatherRedirect })));

function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <div style={{ textAlign: 'center', color: '#718096' }}>Loading...</div>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/weather/:countySlug/:slug" element={<WeatherPage />} />
          <Route path="/weather/:slug" element={<WeatherRedirect />} />
          <Route path="/county/:countySlug" element={<CountyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
