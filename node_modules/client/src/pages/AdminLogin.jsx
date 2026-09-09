import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const { axios, navigate } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Hardcoded admin credentials
    const ADMIN_EMAIL = "test@gocart.com";
    const ADMIN_PASSWORD = "testing";

    // Check credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setLoading(true);
      try {
        // Simulate API call delay
        setTimeout(() => {
          localStorage.setItem("adminToken", "gocart-admin-token-" + Date.now());
          localStorage.setItem("adminUser", JSON.stringify({
            name: email.split("@")[0],
            email,
          }));
          toast.success("Admin login successful!");
          navigate("/admin/dashboard");
          setLoading(false);
        }, 500);
      } catch (error) {
        toast.error("Login error");
        setLoading(false);
      }
    } else {
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* Lock Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-black rounded-full w-16 h-16 flex items-center justify-center">
            <span className="text-3xl">🔒</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center text-3xl font-semibold text-slate-900 mb-2">
          GOCART
        </h1>

        {/* Subtitle */}
        <p className="text-center text-gray-600 mb-8 text-sm">
          Sign in to manage your admin panel.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-slate-700"
          />

          {/* Password Input */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-slate-700"
          />

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded transition duration-200 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Back to Website Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-gray-800 text-sm hover:underline"
          >
            ← Back to Website
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
