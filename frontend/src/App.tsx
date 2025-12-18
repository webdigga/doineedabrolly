import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage/HomePage';
import { WeatherPage } from './pages/WeatherPage/WeatherPage';
import { CountyPage } from './pages/CountyPage/CountyPage';
import { AboutPage } from './pages/AboutPage/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage/PrivacyPage';
import { TermsPage } from './pages/TermsPage/TermsPage';
import { ScrollToTop } from './components/ScrollToTop/ScrollToTop';

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/weather/:slug" element={<WeatherPage />} />
        <Route path="/county/:countySlug" element={<CountyPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
