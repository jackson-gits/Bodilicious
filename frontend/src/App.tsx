import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import SignInPage from './pages/SignInPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import AccountPage from './pages/AccountPage';

function PageRouter() {
  const { currentPage } = useApp();

  const pages = {
    home: <HomePage />,
    shop: <ShopPage />,
    product: <ProductPage />,
    signin: <SignInPage />,
    cart: <CartPage />,
    wishlist: <WishlistPage />,
    account: <AccountPage />,
  };

  return (
    <>
      <Navbar />
      {pages[currentPage]}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <PageRouter />
    </AppProvider>
  );
}
