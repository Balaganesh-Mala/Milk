import { useState, useEffect } from "react";
import { fetchProfile, saveAddress } from "../api/project.api";
import { useNavigate } from "react-router-dom";

export default function EditAddressPage() {
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const navigate = useNavigate();

  const loadAddress = async () => {
    const res = await fetchProfile();
    if (res.data.user.addresses?.length > 0) {
      setAddress(res.data.user.addresses[0]);
    }
  };

  useEffect(() => {
    loadAddress();
  }, []);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await saveAddress(address);
      alert("Address saved");
      navigate("/account");
    } catch {
      alert("Failed to save address");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow p-6 rounded-xl mt-10">
      <h2 className="text-xl font-bold text-blue-900 mb-4">
        {address._id ? "Edit Address" : "Add Address"}
      </h2>

      <div className="space-y-3">
        <input name="street" value={address.street} onChange={handleChange} className="border p-2 w-full rounded" placeholder="Street" />
        <input name="city" value={address.city} onChange={handleChange} className="border p-2 w-full rounded" placeholder="City" />
        <input name="state" value={address.state} onChange={handleChange} className="border p-2 w-full rounded" placeholder="State" />
        <input name="pincode" value={address.pincode} onChange={handleChange} className="border p-2 w-full rounded" placeholder="Pincode" />
        <input name="phone" value={address.phone} onChange={handleChange} className="border p-2 w-full rounded" placeholder="Phone" />

        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg w-full" onClick={handleSubmit}>
          Save Address
        </button>
      </div>
    </div>
  );
}
