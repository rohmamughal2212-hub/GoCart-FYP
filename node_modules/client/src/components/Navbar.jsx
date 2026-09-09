import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const {
    user,
    setUser,
    setCartItems,
    showUserLogin,
    setShowUserLogin,
    navigate,
    searchQuery,
    setSearchQuery,
    cartCount,
    axios,
  } = useAppContext();

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/user/logout");
      if (data.success) {
        localStorage.removeItem("userToken");
        setUser(null);
        setCartItems({});
        navigate("/");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Navigate to products whenever search query changes
  useEffect(() => {
    if (searchQuery.length > 0) {
      navigate("/products");
    }
  }, [searchQuery]);

  return (
    <nav className="relative z-50 flex items-center justify-between px-6 py-4 border-b border-gray-300 bg-white transition-all md:px-16 lg:px-24 xl:px-32">
      <Link to="/">
        <img src={assets.logo} alt="GoCart" className="h-10 md:h-12 w-auto" />
      </Link>

      {/* Desktop Menu */}
      <div className="hidden sm:flex items-center gap-8 ml-6 flex-nowrap">
        <div className="flex items-center gap-4 whitespace-nowrap">
          <Link to="/">Home</Link>
          <Link to="/products">All Products</Link>
        </div>
        <div className="flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
          <input
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
            className="py-1.5 w-40 bg-transparent outline-none placeholder-gray-500"
            type="text"
            placeholder="Search products"
          />
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10.836 10.615 15 14.695"
              stroke="#7A7B7D"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              clipRule="evenodd"
              d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783"
              stroke="#7A7B7D"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Cart */}
        <div
          onClick={() => navigate("/cart")}
          className="relative cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
            <path
              d="M.583.583h2.333l1.564 7.81a1.17 1.17 0 0 0 1.166.94h5.67a1.17 1.17 0 0 0 1.167-.94l.933-4.893H3.5m2.333 8.75a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0m6.417 0a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0"
              stroke="#615fff"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="absolute -top-2 -right-3 text-xs text-white bg-indigo-500 w-[18px] h-[18px] rounded-full flex items-center justify-center">
            {cartCount()}
          </span>
        </div>

        {/* User */}
        {user ? (
          <div className="relative group">
            <img
              src={
                user.profileImage && user.profileImage.trim()
                  ? user.profileImage
                  : assets.profile_icon
              }
              alt={user.name || "User avatar"}
              className="w-10 h-10 rounded-full object-cover cursor-pointer border border-gray-200"
              onError={(e) => { e.currentTarget.src = assets.profile_icon; }}
            />
            <ul className="absolute right-0 top-full z-[60] hidden w-40 translate-y-2 rounded-md border border-gray-200 bg-white py-2 text-sm shadow-lg group-hover:block">
              <li
                onClick={() => navigate("/profile")}
                className="p-2.5 cursor-pointer hover:bg-gray-50"
              >
                My Profile
              </li>
              <li
                onClick={() => navigate("/my-orders")}
                className="p-2.5 cursor-pointer hover:bg-gray-50"
              >
                My Orders
              </li>
              <li
                onClick={() => navigate("/wishlist")}
                className="p-2.5 cursor-pointer hover:bg-gray-50"
              >
                Wishlist
              </li>
              <li
                onClick={logout}
                className="p-2.5 cursor-pointer hover:bg-gray-50 text-red-500"
              >
                Logout
              </li>
            </ul>
          </div>
        ) : (
          <button
            onClick={() => {
              setOpen(false);
              setShowUserLogin(true);
            }}
            className="cursor-pointer px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full"
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile icons */}
      <div className="flex items-center gap-6 md:hidden">
        <div
          className="relative cursor-pointer"
          onClick={() => navigate("/cart")}
        >
          <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
            <path
              d="M.583.583h2.333l1.564 7.81a1.17 1.17 0 0 0 1.166.94h5.67a1.17 1.17 0 0 0 1.167-.94l.933-4.893H3.5m2.333 8.75a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0m6.417 0a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0"
              stroke="#615fff"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="absolute -top-2 -right-3 text-xs text-white bg-indigo-500 w-[18px] h-[18px] rounded-full flex items-center justify-center">
            {cartCount()}
          </span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          className="sm:hidden"
        >
          <svg width="21" height="15" viewBox="0 0 21 15" fill="none">
            <rect width="21" height="1.5" rx=".75" fill="#426287" />
            <rect x="8" y="6" width="13" height="1.5" rx=".75" fill="#426287" />
            <rect
              x="6"
              y="13"
              width="15"
              height="1.5"
              rx=".75"
              fill="#426287"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${open ? "flex" : "hidden"} absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm md:hidden z-50`}
      >
        <Link onClick={() => setOpen(false)} to="/">
          Home
        </Link>
        <Link onClick={() => setOpen(false)} to="/products">
          Products
        </Link>
        <div className="flex items-center gap-2 border border-gray-300 px-3 rounded-full w-full">
          <input
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500 text-sm"
            type="text"
            placeholder="Search products"
          />
        </div>
        {user ? (
          <>
            <button
              onClick={() => {
                navigate("/profile");
                setOpen(false);
              }}
              className="w-full text-left py-1"
            >
              My Profile
            </button>
            <button
              onClick={() => {
                navigate("/my-orders");
                setOpen(false);
              }}
              className="w-full text-left py-1"
            >
              My Orders
            </button>
            <button
              onClick={() => {
                navigate("/wishlist");
                setOpen(false);
              }}
              className="w-full text-left py-1"
            >
              Wishlist
            </button>
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="w-full text-left py-1 text-red-500"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              setOpen(false);
              setShowUserLogin(true);
            }}
            className="cursor-pointer px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
