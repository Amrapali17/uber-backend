import supabase from "../config/supabaseClient.js";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];

  // Get Supabase user
  const { data: supUser, error } = await supabase.auth.getUser(token);
  if (error || !supUser.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // Fetch role from users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("email", supUser.user.email)
    .single();

  if (userError || !userData) {
    return res.status(401).json({ error: "User not found" });
  }

  // Attach user info to request
  req.user = {
    id: userData.id,
    email: userData.email,
    role: userData.role, // <- this now correctly reflects admin/driver/rider
    name: userData.name
  };

  next();
};
