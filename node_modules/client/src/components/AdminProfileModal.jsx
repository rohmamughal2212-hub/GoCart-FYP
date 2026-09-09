import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const AdminProfileModal = ({ onClose, adminUser }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [form, setForm] = useState({
    firstName: adminUser?.name || "Admin",
    lastName: "",
    phoneNumber: "+92-300-1234567",
    address: "Karachi, Pakistan",
    postalCode: "75500",
  });
  const [saving, setSaving] = useState(false);

  // Load saved data from localStorage
  useEffect(() => {
    const savedAdmin = localStorage.getItem("adminProfile");
    if (savedAdmin) {
      const adminData = JSON.parse(savedAdmin);
      setForm(adminData);
      if (adminData.profileImage) {
        setPreviewImage(adminData.profileImage);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(file);
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setPreviewImage(null);
  };

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    setSaving(true);
    try {
      // Simulate API call
      setTimeout(() => {
        const profileData = { ...form };
        if (previewImage) {
          profileData.profileImage = previewImage;
        }
        localStorage.setItem("adminProfile", JSON.stringify(profileData));
        toast.success("Profile updated successfully!");
        setSaving(false);
        onClose();
      }, 500);
    } catch (error) {
      toast.error("Error saving profile");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-gradient-to-b from-sky-300 to-blue-700 rounded-full flex items-center justify-center text-4xl overflow-hidden">
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                "👤"
              )}
            </div>

            <div className="flex gap-2">
              <label className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded cursor-pointer transition">
                📤 Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {previewImage && (
                <button
                  onClick={handleRemoveImage}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
                >
                  🗑️ Remove
                </button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleInputChange}
                placeholder="Enter last name"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleInputChange}
                placeholder="Enter address"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none"
              ></textarea>
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={form.postalCode}
                onChange={handleInputChange}
                placeholder="Enter postal code"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Email
            </label>
            <input
              type="email"
              value={adminUser?.email || ""}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-800 rounded hover:bg-gray-100 transition font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfileModal;
