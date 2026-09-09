import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const { axios, navigate } = useAppContext();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await axios.post("/api/user/forgot-password", { email });
      if (data.success) {
        setSent(true);
        setPreviewUrl(data.previewUrl || "");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-24 px-4">
      <h1 className="text-3xl font-medium mb-2">Forgot Password</h1>
      <p className="text-gray-500 mb-8">Enter your email and we&rsquo;ll send you a reset link.</p>

      {sent ? (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-green-700">
          <p className="font-medium">Check your inbox!</p>
          <p className="text-sm mt-1">If that email exists in our system, a password reset link has been sent.</p>
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-3 text-indigo-600 hover:underline text-sm"
            >
              Open email preview
            </a>
          )}
          <button onClick={() => navigate("/")} className="mt-4 text-indigo-500 hover:underline text-sm">
            Back to home
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-3 outline-none focus:border-indigo-400"
          />
          <button
            type="submit"
            disabled={sending}
            className="w-full py-3 bg-indigo-500 text-white rounded font-medium hover:bg-indigo-600 transition disabled:opacity-60 cursor-pointer"
          >
            {sending ? "Sending..." : "Send Reset Link"}
          </button>
          <p className="text-center text-sm text-gray-500">
            <button type="button" onClick={() => navigate("/")} className="text-indigo-500 hover:underline">
              Back to login
            </button>
          </p>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
