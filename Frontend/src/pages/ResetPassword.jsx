import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const { token } = useParams();
  const { axios, navigate } = useAppContext();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setSaving(true);
    try {
      const { data } = await axios.post(`/api/user/reset-password/${token}`, { password: form.password });
      if (data.success) {
        toast.success(data.message);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-24 px-4">
      <h1 className="text-3xl font-medium mb-2">Reset Password</h1>
      <p className="text-gray-500 mb-8">Enter your new password below.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          required
          placeholder="New password (min. 6 characters)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-3 outline-none focus:border-indigo-400"
        />
        <input
          type="password"
          required
          placeholder="Confirm new password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-3 outline-none focus:border-indigo-400"
        />
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-indigo-500 text-white rounded font-medium hover:bg-indigo-600 transition disabled:opacity-60 cursor-pointer"
        >
          {saving ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
