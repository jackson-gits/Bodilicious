import { AppProvider } from './context/AppContext';
import { Routes, Route, useLocation } from 'react-router-dom';
import { LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import SignInPage from './pages/SignInPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import AccountPage from './pages/AccountPage';
import TrackingPage from './pages/TrackingPage';
import PaymentPage from './pages/PaymentPage';
import ShippingPage from './pages/ShippingPage';
import ChatPage from './pages/ChatPage';
import GenericStaticPage from './pages/GenericStaticPage';
import PageTransition from './components/PageTransition';

function AppRoutes() {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/home" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/shop" element={<PageTransition><ShopPage /></PageTransition>} />
          <Route path="/product" element={<PageTransition><ProductPage /></PageTransition>} />
          <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />
          <Route path="/wishlist" element={<PageTransition><WishlistPage /></PageTransition>} />
          <Route path="/payment" element={<PageTransition><PaymentPage /></PageTransition>} />
          <Route path="/chat" element={<PageTransition><ChatPage /></PageTransition>} />
          <Route path="/signin" element={<PageTransition><SignInPage /></PageTransition>} />
          <Route path="/account" element={<PageTransition><AccountPage /></PageTransition>} />
          <Route path="/tracking" element={<PageTransition><TrackingPage /></PageTransition>} />
          <Route path="/shipping" element={<PageTransition><ShippingPage /></PageTransition>} />

          {/* Static Pages */}
          <Route path="/contact" element={<PageTransition><GenericStaticPage /></PageTransition>} />
          <Route path="/faqs" element={<PageTransition><GenericStaticPage /></PageTransition>} />
          <Route path="/stores" element={<PageTransition><GenericStaticPage /></PageTransition>} />
          <Route path="/terms-sale" element={<PageTransition><GenericStaticPage /></PageTransition>} />
          <Route path="/terms-use" element={<PageTransition><GenericStaticPage /></PageTransition>} />
          <Route path="/accessibility" element={<PageTransition><GenericStaticPage /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><GenericStaticPage /></PageTransition>} />
          <Route path="/careers" element={<PageTransition><GenericStaticPage /></PageTransition>} />
          <Route path="/students" element={<PageTransition><GenericStaticPage /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <LazyMotion features={domAnimation} strict>
        <AppRoutes />
      </LazyMotion>
    </AppProvider>
  );
}
