import { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { BtnSpinner } from "../components/Loading";
import toast from "react-hot-toast";

const FIELDS = [
  { name: "firstName",  label: "First Name",  type: "text",   half: true },
  { name: "lastName",   label: "Last Name",   type: "text",   half: true },
  { name: "email",      label: "Email",       type: "email",  half: false },
  { name: "street",     label: "Street",      type: "text",   half: false },
  { name: "city",       label: "City",        type: "text",   half: true },
  { name: "state",      label: "State",       type: "text",   half: true },
  { name: "zipCode",    label: "Zip Code",    type: "number", half: true },
  { name: "country",    label: "Country",     type: "text",   half: true },
  { name: "phone",      label: "Phone",       type: "tel",    half: false },
];

const Address = () => {
  const { axios, user, navigate } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: user?.email || "",
    street: "", city: "", state: "", zipCode: "", country: "", phone: "",
  });

  useEffect(() => { if (!user) navigate("/cart"); }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("/api/address/add", { address: form });
      if (data.success) {
        toast.success(data.message);
        navigate("/cart");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 pb-16 flex flex-col md:flex-row gap-8">
      {/* Form */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Add Delivery Address</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FIELDS.map(({ name, label, type, half }) => (
            <div key={name} className={half ? "" : "md:col-span-2"}>
              <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-indigo-400 transition-colors text-sm"
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <BtnSpinner />}
              {loading ? "Saving…" : "Save Address"}
            </button>
          </div>
        </form>
      </div>

      {/* Illustration */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <img src={assets.add_address_iamge} alt="Address" className="max-w-xs w-full" />
      </div>
    </div>
  );
};

export default Address;
