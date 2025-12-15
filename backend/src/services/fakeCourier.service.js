export const fakeShipOrder = async (order) => {
  // Fake tracking ID
  const trackingId = "TEST" + Date.now().toString().slice(-6);

  return {
    trackingId,
    shipmentId: "SHIP" + Math.floor(Math.random() * 100000),
    courier: "FAKECOURIER",
  };
};

export const fakeTrackOrder = async (trackingId) => {
  // Random simulated statuses
  const statuses = ["Booked", "In Transit", "Out for Delivery", "Delivered"];

  return {
    trackingId,
    courier: "FAKECOURIER",
    current_status: statuses[Math.floor(Math.random() * statuses.length)],
    history: [
      { date: "2025-01-01", status: "Booked" },
      { date: "2025-01-02", status: "In Transit" },
      { date: "2025-01-03", status: "Out for Delivery" },
      { date: "2025-01-04", status: "Delivered" },
    ],
  };
};
