import supabase from "../config/supabaseClient.js";

export const sendNotification = async (req, res) => {
  try {
    const { driver_id, message } = req.body;
    if (!driver_id || !message) return res.status(400).json({ error: "Missing fields" });

    const { data, error } = await supabase
      .from("notifications")
      .insert([{ user_id: driver_id, message }])
      .select()
      .single();
    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });
    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
