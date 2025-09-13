import supabase from "../config/supabaseClient.js";
import { handleError } from "../utils/errorHandler.js";
import { sendNotification } from "../utils/notifications.js";


export const requestRide = async (req, res) => {
  try {
    const rider_id = req.user.id;
    let { pickup_location, dropoff_location, fare, promo_code } = req.body;

    if (!pickup_location || !dropoff_location || !fare)
      return res.status(400).json({ error: "Missing required fields" });

    let discount = 0;
    if (promo_code) {
      const { data: promo, error: promoError } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", promo_code)
        .single();
      if (promoError || !promo) return res.status(400).json({ error: "Invalid promo code" });
      if (promo.used_count >= promo.max_uses) return res.status(400).json({ error: "Promo code fully used" });

      discount = (fare * promo.discount_percent) / 100;
      fare -= discount;

      await supabase.from("promo_codes").update({ used_count: promo.used_count + 1 }).eq("id", promo.id);
    }

    const { data: ride, error: rideError } = await supabase
      .from("rides")
      .insert([{ rider_id, pickup_location, dropoff_location, fare, discount, promo_code, status: "requested" }])
      .select()
      .single();
    if (rideError) throw rideError;

    const { data: drivers } = await supabase.from("users").select("id").eq("role", "driver");
    drivers.forEach(d => sendNotification(d.id, ride.id, "New ride requested"));

    res.status(201).json({ ride });
  } catch (err) {
    handleError(res, err);
  }
};


export const acceptRide = async (req, res) => {
  try {
    const driver_id = req.user.id;
    const { ride_id } = req.body;
    if (!ride_id) return res.status(400).json({ error: "ride_id is required" });

    const { data: ride, error } = await supabase
      .from("rides")
      .update({ driver_id, status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", ride_id)
      .select()
      .single();
    if (error) throw error;

    sendNotification(ride.rider_id, ride_id, `Your ride has been accepted by driver`);
    res.json({ ride });
  } catch (err) {
    handleError(res, err);
  }
};


export const completeRide = async (req, res) => {
  try {
    const { ride_id, payment_intent_id } = req.body;
    if (!ride_id || !payment_intent_id)
      return res.status(400).json({ error: "ride_id and payment_intent_id are required" });

    const { data: ride, error: rideError } = await supabase
      .from("rides")
      .update({ status: "completed", completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", ride_id)
      .select()
      .single();
    if (rideError) throw rideError;

    await supabase.from("payments").update({ status: "completed" }).eq("stripe_payment_intent_id", payment_intent_id);

    sendNotification(ride.rider_id, ride_id, "Your ride is completed");
    sendNotification(ride.driver_id, ride_id, "Ride completed successfully");

    res.json({ ride });
  } catch (err) {
    handleError(res, err);
  }
};


export const cancelRide = async (req, res) => {
  try {
    const rider_id = req.user.id;
    const ride_id = req.params.ride_id || req.body.ride_id; 
    const reason = req.body.reason;

    if (!ride_id || !reason)
      return res.status(400).json({ error: "ride_id and reason are required" });

    const validReasons = [
      "Change of plans",
      "Driver too far",
      "Price too high",
      "Incorrect pickup location",
      "Other",
    ];
    if (!validReasons.includes(reason))
      return res.status(400).json({ error: "Invalid cancel reason" });

    const { data: ride, error } = await supabase
      .from("rides")
      .update({ status: "cancelled", cancel_reason: reason, updated_at: new Date().toISOString() })
      .eq("id", ride_id)
      .eq("rider_id", rider_id)
      .select()
      .single();
    if (error) throw error;

    if (ride.driver_id)
      sendNotification(ride.driver_id, ride.id, `Ride cancelled by rider: ${reason}`);

    if (ride.promo_code) {
      const { data: promo } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", ride.promo_code)
        .single();
      if (promo && promo.used_count > 0) {
        await supabase
          .from("promo_codes")
          .update({ used_count: promo.used_count - 1 })
          .eq("id", promo.id);
      }
    }

    res.json({ ride });
  } catch (err) {
    handleError(res, err);
  }
};


export const getRides = async (req, res) => {
  try {
    let query = supabase.from("rides").select("*").order("created_at", { ascending: false });
    if (req.user.role !== "admin") query = query.or(`rider_id.eq.${req.user.id},driver_id.eq.${req.user.id}`);

    const { data: rides, error } = await query;
    if (error) throw error;

    const riderIds = rides.map(r => r.rider_id).filter(Boolean);
    const driverIds = rides.map(r => r.driver_id).filter(Boolean);

    const { data: riders } = await supabase.from("users").select("id, name, phone").in("id", riderIds);
    const { data: drivers } = await supabase.from("users").select("id, name, phone").in("id", driverIds);

    const ridesWithUsers = rides.map(r => ({
      ...r,
      rider: riders.find(u => u.id === r.rider_id) || null,
      driver: drivers.find(u => u.id === r.driver_id) || null
    }));

    res.json(ridesWithUsers);
  } catch (err) {
    handleError(res, err);
  }
};


export const getAvailableRides = async (req, res) => {
  try {
    const { data, error } = await supabase.from("rides").select("*").eq("status", "requested").order("created_at", { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
};


export const getRideById = async (req, res) => {
  try {
    const { ride_id } = req.params;
    if (!ride_id) return res.status(400).json({ error: "ride_id is required" });

    const { data: ride, error } = await supabase
      .from("rides")
      .select(`
        id,
        pickup_location,
        dropoff_location,
        fare,
        discount,
        promo_code,
        status,
        cancel_reason,
        driver_lat,
        driver_lng,
        completed_at,
        rider:rider_id (id, name, phone),
        driver:driver_id (id, name, phone)
      `)
      .eq("id", ride_id)
      .single();
    if (error) throw error;

    res.json({ ride });
  } catch (err) {
    handleError(res, err);
  }
};


export const updateDriverLocation = async (req, res) => {
  try {
    const driver_id = req.user.id;
    const { ride_id } = req.params;
    const { lat, lng } = req.body;

    if (!ride_id || lat === undefined || lng === undefined)
      return res.status(400).json({ error: "ride_id, lat, lng are required" });

    const { data: ride, error } = await supabase
      .from("rides")
      .update({ driver_lat: lat, driver_lng: lng, updated_at: new Date().toISOString() })
      .eq("id", ride_id)
      .eq("driver_id", driver_id)
      .select()
      .single();
    if (error) throw error;

    res.json({ ride });
  } catch (err) {
    handleError(res, err);
  }
};
