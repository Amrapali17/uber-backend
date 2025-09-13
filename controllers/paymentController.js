import Stripe from "stripe";
import supabase from "../config/supabaseClient.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const IS_DEV = process.env.NODE_ENV !== "production";

export const createPayment = async (req, res) => {
  const { ride_id, amount, currency = "usd" } = req.body;
  if (!ride_id) return res.status(400).json({ error: "ride_id is required" });
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

  try {
    const { data: rideArray, error: rideError } = await supabase
      .from("rides")
      .select("*")
      .eq("id", ride_id);

    if (rideError) throw rideError;
    if (!rideArray.length) return res.status(404).json({ error: "Ride not found" });

    const paymentIntentData = {
      amount: Math.round(amount * 100),
      currency,
      payment_method_types: ["card"],
    };

    if (IS_DEV) {
      paymentIntentData.payment_method = "pm_card_visa";
      paymentIntentData.confirm = true;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    const { data: paymentArray, error } = await supabase
      .from("payments")
      .insert([{
        ride_id,
        amount,
        currency,
        status: paymentIntent.status === "succeeded" ? "completed" : "pending",
        stripe_payment_intent_id: paymentIntent.id
      }])
      .select();
    if (error) return res.status(500).json({ error: error.message });

    res.json({ clientSecret: paymentIntent.client_secret, payment: paymentArray[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { payment_intent_id } = req.body;
    if (!payment_intent_id) return res.status(400).json({ error: "payment_intent_id is required" });

    const { data, error } = await supabase
      .from("payments")
      .update({ status: "completed" })
      .eq("stripe_payment_intent_id", payment_intent_id)
      .select()
      .single();
    if (error) throw error;

    res.json({ payment: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
