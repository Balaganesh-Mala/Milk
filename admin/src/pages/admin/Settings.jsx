import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminAxios";
import Swal from "sweetalert2";
import { getPublicSettings } from "../../api/settings.api";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logo, setLogo] = useState(null);

  const [form, setForm] = useState({
    storeName: "",
    supportEmail: "",
    supportPhone: "",
    address: "",
    logo: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Load current settings
  const loadSettings = async () => {
    try {
      const res = await adminApi.get("/settings");
      setForm(res.data.settings);
    } catch (err) {
      Swal.fire("Error", "Failed to load settings", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadSetting = async () => {
      try {
        const res = await getPublicSettings();
        const logoUrl = res.data.settings?.logo?.[0]?.url;
        setLogo(logoUrl);
      } catch (err) {
        console.log("Settings Load Error:", err);
      }
    };

    loadSetting();
    loadSettings();
  }, []);

  // Upload Logo
  const handleLogoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const body = new FormData();
  body.append("logo", file);   // ✅ FIXED

  try {
    const res = await adminApi.put("/settings", body, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setForm({ ...form, logo: res.data.settings.logo[0].url });

    Swal.fire("Uploaded!", "Logo updated successfully", "success");
  } catch (error) {
    Swal.fire("Error", "Failed to upload logo", "error");
  }
};


  const saveSettings = async () => {
    setSaving(true);
    try {
      await adminApi.put("/settings", form);
      Swal.fire("Saved!", "Settings updated successfully", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to save changes", "error");
    }
    setSaving(false);
  };

  if (loading)
    return <div className="p-6 text-center">Loading settings...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Store Details */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-medium mb-4">Store Details</h2>

          <label className="block text-sm mb-1">Store Name</label>
          <input
            type="text"
            name="storeName"
            value={form.storeName}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg mb-4"
          />

          <label className="block text-sm mb-1">Support Email</label>
          <input
            type="email"
            name="supportEmail"
            value={form.supportEmail}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg mb-4"
          />

          <label className="block text-sm mb-1">Support Phone</label>
          <input
            type="text"
            name="supportPhone"
            value={form.supportPhone}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg mb-4"
          />

          <label className="block text-sm mb-1">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg mb-4"
          />

        </div>

        {/* Logo & App Settings */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-medium mb-4">Branding</h2>

          <label className="block text-sm mb-2">Logo</label>
          <div className="flex items-center gap-4 mb-4">
            {form.logo ? (
              <img
                src={logo || form.logo  }
                alt="Logo"
                className="h-16 w-16 object-cover rounded-lg border"
              />
            ) : (
              <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                No Logo
              </div>
            )}

            <input type="file" onChange={handleLogoUpload} />
          </div>

        </div>
      </div>

      <button
        onClick={saveSettings}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl mt-6"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
};

export default Settings;
