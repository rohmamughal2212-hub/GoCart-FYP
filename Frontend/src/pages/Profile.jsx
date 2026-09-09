import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, setUser, axios } = useAppContext();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPreviewImage(user.profileImage || "");
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    console.log("Image change event - file:", file?.name, "size:", file?.size);
    if (!file) return;
    setProfileImageFile(file);
    const preview = URL.createObjectURL(file);
    console.log("Preview URL created:", preview);
    setPreviewImage(preview);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      if (form.newPassword) {
        formData.append("currentPassword", form.currentPassword);
        formData.append("newPassword", form.newPassword);
      }
      if (profileImageFile) {
        console.log("Adding file to FormData:", profileImageFile.name, "Size:", profileImageFile.size);
        formData.append("profileImage", profileImageFile);
      } else {
        console.log("No image file selected");
      }

      console.log("Sending profile update request...");
      const { data } = await axios.put("/api/user/profile", formData);
      console.log("Profile update response:", data);

      if (data.success) {
        console.log("Success! User profile received:", data.user);
        console.log("ProfileImage in response:", data.user.profileImage);
        const newProfileImage = data.user.profileImage || "";
        setUser((prev) => ({
          ...prev,
          name: data.user.name || prev?.name,
          email: data.user.email || prev?.email,
          phone: data.user.phone || prev?.phone,
          profileImage: newProfileImage || prev?.profileImage || "",
          cartItems: data.user.cartItems || prev?.cartItems,
          wishlist: data.user.wishlist || prev?.wishlist,
        }));
        setPreviewImage(newProfileImage);
        console.log("PreviewImage set to:", newProfileImage);
        toast.success(data.message);
        setForm((f) => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
        setProfileImageFile(null);
      } else {
        console.error("Update failed:", data.message);
        toast.error(data.message || "Profile update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error.response || error);
      const message = error.response?.data?.message || error.response?.data?.error || error.message || "Save failed";
      toast.error(message);
      // Keep the preview image if upload failed
      if (profileImageFile) {
        console.log("Upload error - keeping preview image");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-16">
      <h1 className="text-3xl font-medium mb-8">My Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={previewImage && previewImage.trim() ? previewImage : assets.profile_icon}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border border-gray-200"
              onError={(e) => { e.currentTarget.src = assets.profile_icon; }}
            />
            <label className="absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-2 cursor-pointer shadow-md">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M5 12H19" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </label>
          </div>
          <p className="text-sm text-gray-500">Upload a profile image</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            value={user?.email || ""}
            disabled
            className="w-full border border-gray-200 rounded px-3 py-2 bg-gray-50 text-gray-400 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+1 234 567 890"
            className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-indigo-400"
          />
        </div>

        <hr className="border-gray-200" />
        <p className="text-sm font-medium text-gray-600">Change Password (leave blank to keep current)</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-indigo-400"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-indigo-500 text-white rounded font-medium hover:bg-indigo-600 transition disabled:opacity-60 cursor-pointer"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
