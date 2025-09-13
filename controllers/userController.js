import Stripe from "stripe";
import supabase from "../config/supabaseClient.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const signupUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !role)
      return res.status(400).json({ error: "Email, password, and role are required" });

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) throw authError;

    const user = authData.user;
    if (!user) return res.status(400).json({ error: "Failed to create user" });

    const customer = await stripe.customers.create({ email, name });

    const { data: insertData, error: insertError } = await supabase
      .from("users")
      .insert([{ id: user.id, email, name, role, stripe_customer_id: customer.id }])
      .select();
    if (insertError) throw insertError;

    res.status(201).json({ user: insertData[0], message: "User created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    res.json({ user: data.user, session: data.session });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Separate GET /profile handler
export const getProfile = async (req, res) => {
  try {
    const { id } = req.user;

    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, phone, role, stripe_customer_id, created_at")
      .eq("id", id)
      .single();
    if (error) throw error;

    res.json({ user: data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Separate PUT /profile handler
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { name, email, phone } = req.body;

    if (!name && !email && !phone)
      return res.status(400).json({ error: "At least one field must be provided" });

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select();
    if (error) throw error;

    const user = data[0];
    if ((name || email) && user.stripe_customer_id) {
      await stripe.customers.update(user.stripe_customer_id, { name, email });
    }

    res.json({ user, message: "Profile updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
