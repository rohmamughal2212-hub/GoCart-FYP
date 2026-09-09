import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Products from "./pages/Products";
import SingleProduct from "./pages/SingleProduct";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import { useAppContext } from "./context/AppContext";
import Auth from "./modals/Auth";
import WelcomePopup from "./modals/WelcomePopup";
import ProductCategory from "./pages/ProductCategory";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import Contact from "./pages/Contact";
import Safety from "./pages/Safety";
import Cancellation from "./pages/Cancellation";
import CustomerDesk from "./pages/CustomerDesk";
import Address from "./pages/Address";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-9 h-9 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
  </div>
);

const RequireAuth = ({ children }) => {
  const { user, userLoading } = useAppContext();
  if (userLoading) return <Spinner />;
  return user ? children : <Navigate to="/" replace />;
};

const AdminAuthCheck = () => {
  const adminToken = localStorage.getItem("adminToken");
  return adminToken ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/admin/login" replace />;
};

const App = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const { showUserLogin } = useAppContext();

  return (
    <div className="text-default min-h-screen">
      <Navbar />
      {showUserLogin && <Auth />}
      <WelcomePopup />
      <Toaster />
      <div className={isAdminPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/cancellation" element={<Cancellation />} />
          <Route path="/customer-desk" element={<CustomerDesk />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:category" element={<ProductCategory />} />
          <Route path="/product/:category/:id" element={<SingleProduct />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminAuthCheck />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* User-protected routes */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/add-address" element={<RequireAuth><Address /></RequireAuth>} />
          <Route path="/my-orders" element={<RequireAuth><MyOrders /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />

        </Routes>
      </div>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default App;
