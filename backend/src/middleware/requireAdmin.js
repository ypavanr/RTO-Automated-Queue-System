import db from "../DB/pg.js";

export default async function requireAdmin(req, res, next) {
  try {
    const rawUserId = req.header("x-user-id");
    const userId = Number(rawUserId);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const q = await db.query("SELECT is_admin FROM app_user WHERE id = $1", [userId]);
    if (!q.rows.length || q.rows[0].is_admin !== true) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}


