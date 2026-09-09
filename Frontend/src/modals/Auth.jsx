import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Auth = () => {
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const { setShowUserLogin, fetchUser, axios, navigate } = useAppContext();

  const resetRegisterState = () => {
    setOtp("");
    setOtpSent(false);
    setSendLoading(false);
    setVerifyLoading(false);
    setOtpMessage("");
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    resetRegisterState();
  };

  useEffect(() => {
    if (state === "register") {
      resetRegisterState();
    } else {
      resetForm();
    }
  }, [state]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { data } = await axios.post("/api/user/login", { email, password });
      if (data.success) {
        if (data.token) localStorage.setItem("userToken", data.token);
        toast.success(data.message);
        setShowUserLogin(false);
        await fetchUser();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!name.trim() || !email.trim() || !password) {
      toast.error("Name, email, and password are required to send OTP.");
      return;
    }

    setSendLoading(true);
    try {
      const { data } = await axios.post("/api/user/send-otp", { name, email, password });
      if (data.success) {
        setOtpSent(true);
        setOtpMessage(data.message);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSendLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP sent to your email.");
      return;
    }

    setVerifyLoading(true);
    try {
      const { data } = await axios.post("/api/user/verify-otp", { email, otp });
      if (data.success) {
        if (data.token) localStorage.setItem("userToken", data.token);
        toast.success(data.message);
        setShowUserLogin(false);
        resetForm();
        await fetchUser();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div onClick={() => setShowUserLogin(false)} className="fixed inset-0 z-30 flex items-center justify-center text-gray-600 pointer-events-none">
      <form
        onSubmit={state === "login" ? handleLoginSubmit : (e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col gap-4 m-auto items-start p-8 py-10 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white pointer-events-auto"
      >
        <button
          type="button"
          onClick={() => setShowUserLogin(false)}
          aria-label="Close"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <p className="text-2xl font-medium m-auto">
          <span className="text-indigo-500">User</span> {state === "login" ? "Login" : "Register"}
        </p>

        {state === "register" && (
          <div className="w-full">
            <p className="text-sm font-medium">Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="Your name"
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500 text-sm"
              type="text"
              required
            />
          </div>
        )}

        <div className="w-full">
          <p className="text-sm font-medium">Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="your@email.com"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500 text-sm"
            type="email"
            required
          />
        </div>

        <div className="w-full">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Password</p>
            {state === "login" && (
              <button
                type="button"
                onClick={() => {
                  setShowUserLogin(false);
                  navigate("/forgot-password");
                }}
                className="text-xs text-indigo-500 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative mt-1 w-full">
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="min. 6 characters"
              className="border border-gray-200 rounded w-full p-2 pr-10 outline-indigo-500 text-sm"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-500 hover:text-indigo-500"
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 3.5 9.8 7-0.5 1.3-1.3 2.5-2.3 3.5M6.2 6.2C4.6 7.3 3.4 8.8 2.2 12c1.3 3.5 4.8 7 9.8 7 1.5 0 2.8-.3 4-.8" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.2 12c1.3-3.5 4.8-7 9.8-7s8.5 3.5 9.8 7c-1.3 3.5-4.8 7-9.8 7s-8.5-3.5-9.8-7z" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {state === "register" && (
          <div className="w-full rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-800">Email OTP Verification</p>
            <p className="mt-2">
              Click <strong>Send OTP</strong> to receive a 6-digit code at your email address. OTP expires in 10 minutes.
            </p>
            {otpSent && (
              <p className="mt-2 text-sm text-green-700">{otpMessage || "OTP sent successfully."}</p>
            )}

            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendLoading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 transition text-white py-2.5 rounded-md font-medium disabled:opacity-70"
              >
                {sendLoading ? "Sending OTP..." : otpSent ? "Resend OTP" : "Send OTP"}
              </button>

              {otpSent && (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">OTP Code</p>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500 text-sm"
                      maxLength={6}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyLoading}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 transition text-white py-2.5 rounded-md font-medium disabled:opacity-70"
                  >
                    {verifyLoading ? "Verifying OTP..." : "Verify OTP & Create Account"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {state === "register" ? (
          <p className="text-sm">
            Already have an account?{" "}
            <span onClick={() => setState("login")} className="text-indigo-500 cursor-pointer hover:underline">
              Login
            </span>
          </p>
        ) : (
          <p className="text-sm">
            Don&rsquo;t have an account?{" "}
            <span onClick={() => setState("register")} className="text-indigo-500 cursor-pointer hover:underline">
              Register
            </span>
          </p>
        )}

        {state === "login" && (
          <button
            type="submit"
            disabled={loginLoading}
            className="bg-indigo-500 hover:bg-indigo-600 transition text-white w-full py-2.5 rounded-md cursor-pointer font-medium flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loginLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Login
          </button>
        )}
      </form>
    </div>
  );
};

export default Auth;
