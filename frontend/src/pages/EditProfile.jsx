import { useEffect, useState } from "react";
import { fetchProfile, updateProfile } from "../api/project.api";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  // Load existing user details
  const loadProfile = async () => {
    try {
      const res = await fetchProfile();
      setUser(res.data.user);
    } catch (err) {
      console.log("Profile fetch failed");
      navigate("/login");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await updateProfile(user);

      alert("Profile updated successfully!");
      navigate("/account");
    } catch (err) {
      alert("Update failed, try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        
        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
          Edit Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={user.name}
            className="w-full p-3 border rounded-lg"
            onChange={handleChange}
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={user.email}
            className="w-full p-3 border rounded-lg"
            onChange={handleChange}
          />

          {/* Phone */}
          <input
            type="number"
            name="phone"
            placeholder="Phone Number"
            value={user.phone}
            className="w-full p-3 border rounded-lg"
            onChange={handleChange}
          />

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </form>

        {/* Back button */}
        <button
          onClick={() => navigate("/account")}
          className="mt-4 w-full bg-gray-200 py-3 rounded-lg font-medium hover:bg-gray-300"
        >
          Cancel
        </button>

      </div>
    </div>
  );
}
