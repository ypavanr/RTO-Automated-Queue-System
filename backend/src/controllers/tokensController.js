import db from "../DB/pg.js";

async function nextTokenCodeForSlot(slotTs, prefix = "T") {
  const r = await db.query(
    `SELECT COALESCE(MAX((regexp_replace(token_no,'\\D','','g'))::int),0) + 1 AS next
       FROM token WHERE slot_ts = $1`,
    [slotTs]
  );
  return `${prefix}-${String(r.rows[0].next).padStart(3, "0")}`;
}

function generate6DigitOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const issueToken = async (req, res) => {
  const { applicant_id, prefix } = req.body || {};
  if (!applicant_id) return res.status(400).json({ error: "applicant_id is required" });

  try {
    const u = await db.query(`SELECT id FROM app_user WHERE id=$1`, [applicant_id]);
    if (!u.rows.length) return res.status(404).json({ error: "Applicant not found" });

    const sel = await db.query(
      `SELECT slot_ts FROM slot_selection WHERE applicant_id=$1`,
      [applicant_id]
    );
    if (!sel.rows.length) {
      return res.status(400).json({ error: "Applicant has not selected a slot" });
    }
    const slotTs = sel.rows[0].slot_ts;

    const existing = await db.query(
      `SELECT * FROM token
        WHERE applicant_id=$1 AND slot_ts=$2 AND status='ACTIVE'
        LIMIT 1`,
      [applicant_id, slotTs]
    );
    if (existing.rows.length) {
      return res.status(200).json({ message: "Token already exists", token: existing.rows[0] });
    }

    const isPriority =
      (await db.query(`SELECT 1 FROM disabilities WHERE applicant_id=$1 LIMIT 1`, [applicant_id]))
        .rows.length > 0;

    const code = await nextTokenCodeForSlot(slotTs, prefix || "T");
    const otp = generate6DigitOtp(); 

    const ins = await db.query(
      `INSERT INTO token (applicant_id, token_no, status, slot_ts, is_priority, otp_code_hash)
       VALUES ($1,$2,'ACTIVE',$3,$4,$5)
       RETURNING *`,
      [applicant_id, code, slotTs, isPriority, otp]
    );

    return res.status(201).json({ message: "Token issued", token: ins.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      const again = await db.query(
        `SELECT * FROM token
          WHERE applicant_id=$1 AND slot_ts=$2 AND status='ACTIVE'
          LIMIT 1`,
        [req.body.applicant_id, (await db.query(
          `SELECT slot_ts FROM slot_selection WHERE applicant_id=$1`,
          [req.body.applicant_id]
        )).rows?.[0]?.slot_ts]
      );
      if (again.rows.length) {
        return res.status(200).json({ message: "Token already exists", token: again.rows[0] });
      }
    }
    return res.status(500).json({ error: "Server error" });
  }
};

export const getActiveTokenForUser = async (req, res) => {
  const userId = Number(req.query.user_id ?? req.params.user_id);
  if (!userId) return res.status(400).json({ error: "user_id is required" });

  try {
    const r = await db.query(
      `SELECT id AS token_id, token_no, status, slot_ts, otp_code_hash AS otp_code
         FROM token
        WHERE applicant_id = $1 AND status = 'ACTIVE'
        ORDER BY created_at DESC
        LIMIT 1`,
      [userId]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Active token not found" });

    const t = r.rows[0];
    return res.json({
      token_id: t.token_id,
      token_no: t.token_no,
      status: t.status,
      slot_ts: t.slot_ts,
      otp: t.otp_code ? String(t.otp_code) : null
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};