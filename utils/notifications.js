import supabase from "../config/supabaseClient.js";

export const sendNotification = async (user_id, ride_id, message) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert([{ user_id, ride_id, message }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Notification error:", err.message);
    return null;
  }
};
