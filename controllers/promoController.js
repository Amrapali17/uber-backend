import supabase from "../config/supabaseClient.js";
import { handleError } from "../utils/errorHandler.js";

export const getPromoCodes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
};

export const addPromoCode = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const { code, discount_percent, max_uses, valid_until } = req.body;
    if (!code || !discount_percent || !max_uses) return res.status(400).json({ error: "Missing required fields" });

    const { data, error } = await supabase
      .from("promo_codes")
      .insert([{ code, discount_percent, max_uses, valid_until }])
      .select()
      .single();
    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    handleError(res, err);
  }
};
