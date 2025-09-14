import db from "../DB/pg.js";

 const selectTimeSlot = async (req, res) => {
  const { applicant_id, slot_ts } = req.body || {};

  if (!applicant_id || !slot_ts) {
    return res.status(400).json({ error: "applicant_id and slot_ts are required" });
  }

  const d = new Date(slot_ts);
  if (isNaN(d.getTime())) {
    return res.status(400).json({ error: "slot_ts must be a valid ISO datetime" });
  }

  try {
    const u = await db.query("SELECT id FROM app_user WHERE id = $1", [applicant_id]);
    if (u.rows.length === 0) {
      return res.status(404).json({ error: "Applicant not found" });
    }

    const sql = `
      INSERT INTO slot_selection (applicant_id, slot_ts)
      VALUES ($1, $2)
      ON CONFLICT (applicant_id)
      DO UPDATE SET slot_ts = EXCLUDED.slot_ts, updated_at = now()
      RETURNING id, applicant_id, slot_ts, created_at, updated_at;
    `;
    const ins = await db.query(sql, [applicant_id, slot_ts]);

    return res.status(201).json({
      message: "Slot saved",
      selection: ins.rows[0],
    });
  } 
   
  catch (err) {
    console.error(err);
    if (err.code === "23514") {
      return res.status(409).json({ error: "Slot is full (capacity 5). Please choose another slot." });
    }
    return res.status(500).json({ message: "Server error" });
  }
};


export {selectTimeSlot}