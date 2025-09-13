import supabase from "../config/supabaseClient.js";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];


  const { data: supUser, error } = await supabase.auth.getUser(token);
  if (error || !supUser.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }


  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("email", supUser.user.email)
    .single();

  if (userError || !userData) {
    return res.status(401).json({ error: "User not found" });
  }


  req.user = {
    id: userData.id,
    email: userData.email,
    role: userData.role, 
    name: userData.name
  };

  next();
};
