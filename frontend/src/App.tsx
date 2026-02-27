import { AppProvider } from './context/AppContext';
import { Routes, Route } from 'react-router-dom';
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

function AppRoutes() {

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/shipping" element={<ShippingPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/chat" element={<ChatPage />} />

        {/* Static Pages */}
        <Route path="/contact" element={<GenericStaticPage />} />
        <Route path="/shipping" element={<GenericStaticPage />} />
        <Route path="/faqs" element={<GenericStaticPage />} />
        <Route path="/stores" element={<GenericStaticPage />} />
        <Route path="/terms-sale" element={<GenericStaticPage />} />
        <Route path="/terms-use" element={<GenericStaticPage />} />
        <Route path="/accessibility" element={<GenericStaticPage />} />
        <Route path="/privacy" element={<GenericStaticPage />} />
        <Route path="/careers" element={<GenericStaticPage />} />
        <Route path="/students" element={<GenericStaticPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
