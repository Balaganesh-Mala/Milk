import Order from "../models/order.model.js";
import { shiprocketLogin, createShipment, trackShipment } from "../services/shiprocket.service.js";
import { fakeShipOrder, fakeTrackOrder } from "../services/fakeCourier.service.js";

// Toggle REAL or FAKE mode
const USE_FAKE_COURIER = true;

export const shipOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.trackingId) {
      return res.status(400).json({ message: "Order already shipped" });
    }

    let shipment;

    if (USE_FAKE_COURIER) {
      shipment = await fakeShipOrder(order);
    } else {
      const token = await shiprocketLogin();
      shipment = await createShipment(order, token);
    }

    order.trackingId = shipment.trackingId || shipment.awb_code;
    order.shipmentId = shipment.shipmentId || shipment.shipment_id;
    order.courierName = shipment.courier || shipment.courier_company_id;
    order.orderStatus = "Shipped";
    order.shipmentStatus = "Shipped";

    await order.save();

    res.json({
      success: true,
      message: "Shipment created!",
      trackingId: order.trackingId,
    });

  } catch (error) {
    console.error("Shipping Error:", error);
    res.status(500).json({ message: "Shipping failed", error: error.message });
  }
};


export const getTrackingDetails = async (req, res) => {
  try {
    const trackingId = req.params.trackingId;
    let tracking;

    if (USE_FAKE_COURIER) {
      tracking = await fakeTrackOrder(trackingId);
    } else {
      const token = await shiprocketLogin();
      tracking = await trackShipment(trackingId, token);
    }

    // 🔥 find matching order in DB
    const order = await Order.findOne({ trackingId });

    if (order) {
      // Save tracking history entry
      order.trackingHistory.push({
        date: new Date(),
        status: tracking.current_status || tracking.status || "Updated",
      });

      // Update current shipment status
      order.shipmentStatus =
        tracking.current_status || tracking.status || "Updated";

      await order.save();
    }

    // Send structured response back
    return res.json({
      trackingId: tracking.trackingId || trackingId,
      courier: tracking.courier || order?.courierName,
      status: tracking.current_status || tracking.status,
      history: tracking.history || order?.trackingHistory || [],
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to fetch tracking" });
  }
};
