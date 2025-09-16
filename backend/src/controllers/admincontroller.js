import db from "../DB/pg.js";

const formatAadhaar = (a12) =>
  String(a12 ?? "").replace(/\D/g, "").slice(0, 12)
    .replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");


export const getApplications = async (req, res) => {
  const limit = Number(req.query.limit ?? 500);
  const offset = Number(req.query.offset ?? 0);
  const slot_ts = req.query.slot_ts || null;
  const status = String(req.query.status ?? "ACTIVE").toUpperCase();
  const todayOnly = (req.query.today ?? "true").toLowerCase() !== "false";

  try {
    const params = [];
    let where = "1=1";

    if (status !== "ALL") {
      params.push(status);
      where += ` AND t.status = $${params.length}`;
    }
    if (slot_ts) {
      params.push(slot_ts);
      where += ` AND t.slot_ts = $${params.length}`;
    } else if (todayOnly) {
      where += ` AND t.slot_local_date = ((now() AT TIME ZONE 'Asia/Kolkata')::date)`;
    }

    params.push(limit, offset);

    const sql = `
      WITH vc AS (
        SELECT applicant_id, ARRAY_AGG(DISTINCT vehicle_class ORDER BY vehicle_class) AS vehicle_classes
        FROM user_vehicle_class
        GROUP BY applicant_id
      ),
      dis AS (
        SELECT applicant_id, ARRAY_AGG(DISTINCT disability ORDER BY disability) AS disabilities
        FROM disabilities
        GROUP BY applicant_id
      ),
      base AS (
        SELECT
          t.id  AS token_id,
          t.token_no,
          t.status,
          t.is_priority,
          t.slot_ts,
          t.created_at AS token_created_at,
          -- Coarse finish state only; no OTP details or times
          CASE
            WHEN t.otp_verified_at IS NOT NULL THEN 'VERIFIED'
            WHEN t.finish_requested_at IS NOT NULL THEN 'REQUESTED'
            ELSE 'NONE'
          END AS finish_state,

          u.id  AS user_id,
          u.full_name,
          u.aadhar_number,
          u.ll_application_number,
          u.phone,

          COALESCE(vc.vehicle_classes, '{}') AS vehicle_classes,
          COALESCE(dis.disabilities, '{}')    AS disabilities,
          COALESCE(ss.created_at, t.created_at) AS slot_selected_at
        FROM token t
        JOIN app_user u             ON u.id = t.applicant_id
        LEFT JOIN slot_selection ss ON ss.applicant_id = u.id AND ss.slot_ts = t.slot_ts
        LEFT JOIN vc                ON vc.applicant_id  = u.id
        LEFT JOIN dis               ON dis.applicant_id = u.id
        WHERE ${where}
      )
      SELECT
        *,
        ROW_NUMBER() OVER (
          PARTITION BY slot_ts
          ORDER BY is_priority DESC, slot_selected_at ASC, token_created_at ASC
        ) AS rank_in_slot
      FROM base
      ORDER BY
        slot_ts ASC,
        is_priority DESC,
        slot_selected_at ASC,
        token_created_at ASC
      LIMIT $${params.length-1} OFFSET $${params.length};
    `;

    const r = await db.query(sql, params);

    const rows = r.rows.map(row => ({
      token_id: row.token_id,
      token_no: row.token_no,
      status: row.status,
      is_priority: row.is_priority,
      slot_ts: row.slot_ts,
      rank_in_slot: Number(row.rank_in_slot),
      finish_state: row.finish_state, 

      user: {
        id: row.user_id,
        full_name: row.full_name,
        aadhar_number: formatAadhaar(row.aadhar_number),
        ll_application_number: row.ll_application_number,
        phone: row.phone
      },

      vehicle_classes: row.vehicle_classes || [],
      disabilities: row.disabilities || [],
      slot_selected_at: row.slot_selected_at
    }));

    return res.json({ count: rows.length, rows });
  } catch (err) {
    console.error(err); 
    return res.status(500).json({ message: "Server error" });
  }
};


export const getNextApplication = async (req, res) => {
  const q = { ...req.query, limit: "1", offset: "0" };
  req.query = q;
  try {
    const limit = Number(q.limit);
    const offset = Number(q.offset);
    const slot_ts = q.slot_ts || null;
    const status = String(q.status ?? "ACTIVE").toUpperCase();
    const todayOnly = (q.today ?? "true").toLowerCase() !== "false";

    const params = [];
    let where = "1=1";
    if (status !== "ALL") { params.push(status); where += ` AND t.status = $${params.length}`; }
    if (slot_ts) { params.push(slot_ts); where += ` AND t.slot_ts = $${params.length}`; }
    else if (todayOnly) { where += ` AND t.slot_local_date = ((now() AT TIME ZONE 'Asia/Kolkata')::date)`; }

    const sql = `
      WITH vc AS (
        SELECT applicant_id, ARRAY_AGG(DISTINCT vehicle_class ORDER BY vehicle_class) AS vehicle_classes
        FROM user_vehicle_class
        GROUP BY applicant_id
      ),
      dis AS (
        SELECT applicant_id, ARRAY_AGG(DISTINCT disability ORDER BY disability) AS disabilities
        FROM disabilities
        GROUP BY applicant_id
      ),
      base AS (
        SELECT
          t.id  AS token_id,
          t.token_no,
          t.status,
          t.is_priority,
          t.slot_ts,
          t.created_at AS token_created_at,
          CASE
            WHEN t.otp_verified_at IS NOT NULL THEN 'VERIFIED'
            WHEN t.finish_requested_at IS NOT NULL THEN 'REQUESTED'
            ELSE 'NONE'
          END AS finish_state,

          u.id  AS user_id,
          u.full_name,
          u.aadhar_number,
          u.ll_application_number,
          u.phone,

          COALESCE(vc.vehicle_classes, '{}') AS vehicle_classes,
          COALESCE(dis.disabilities, '{}')    AS disabilities,
          COALESCE(ss.created_at, t.created_at) AS slot_selected_at
        FROM token t
        JOIN app_user u             ON u.id = t.applicant_id
        LEFT JOIN slot_selection ss ON ss.applicant_id = u.id AND ss.slot_ts = t.slot_ts
        LEFT JOIN vc                ON vc.applicant_id  = u.id
        LEFT JOIN dis               ON dis.applicant_id = u.id
        WHERE ${where}
      )
      SELECT *,
        ROW_NUMBER() OVER (
          PARTITION BY slot_ts
          ORDER BY is_priority DESC, slot_selected_at ASC, token_created_at ASC
        ) AS rank_in_slot
      FROM base
      ORDER BY
        slot_ts ASC,
        is_priority DESC,
        slot_selected_at ASC,
        token_created_at ASC
      LIMIT 1;
    `;
    const r = await db.query(sql, params);
    if (!r.rows.length) return res.status(404).json({ message: "No applications found" });

    const row = r.rows[0];
    return res.json({
      token_id: row.token_id,
      token_no: row.token_no,
      status: row.status,
      is_priority: row.is_priority,
      slot_ts: row.slot_ts,
      rank_in_slot: Number(row.rank_in_slot),
      finish_state: row.finish_state,
      user: {
        id: row.user_id,
        full_name: row.full_name,
        aadhar_number: formatAadhaar(row.aadhar_number),
        ll_application_number: row.ll_application_number,
        phone: row.phone
      },
      vehicle_classes: row.vehicle_classes || [],
      disabilities: row.disabilities || [],
      slot_selected_at: row.slot_selected_at
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


export const verifyOtpAndFinishByUser = async (req, res) => {
  const { user_id, otp } = req.body || {};
  if (!user_id || !otp) {
    return res.status(400).json({ error: "user_id and otp are required" });
  }
  if (!/^\d{6}$/.test(String(otp))) {
    return res.status(400).json({ error: "OTP must be a 6-digit code" });
  }

  try {
    const r = await db.query(
      `SELECT id, otp_code_hash AS otp_code
         FROM token
        WHERE applicant_id=$1 AND status='ACTIVE'
        ORDER BY (finish_requested_at IS NOT NULL) DESC,
                 finish_requested_at DESC NULLS LAST,
                 created_at DESC
        LIMIT 1`,
      [user_id]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Active token not found" });

    const t = r.rows[0];
    if (String(otp) !== String(t.otp_code)) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    await db.query(
      `UPDATE token
          SET otp_verified_at = now(),
              status = 'FINISHED'
        WHERE id = $1`,
      [t.id]
    );

    const c = await db.query(
      `SELECT COUNT(*)::int AS finished_today
         FROM token
        WHERE status='FINISHED'
          AND slot_local_date = ((now() AT TIME ZONE 'Asia/Kolkata')::date)`
    );

    return res.status(200).json({
      message: "Finished",
      finished_today: c.rows[0].finished_today
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};
export const getTodayStats = async (req, res) => {
  try {
    const stats = await db.query(
      `SELECT
         SUM(CASE WHEN status = 'ACTIVE'    THEN 1 ELSE 0 END)::int    AS active_today,
         SUM(CASE WHEN status = 'FINISHED'  THEN 1 ELSE 0 END)::int    AS finished_today,
         SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END)::int    AS cancelled_today,
         COUNT(*)::int                                              AS total_today
       FROM token
       WHERE slot_local_date = ((now() AT TIME ZONE 'Asia/Kolkata')::date)`
    );

    return res.json(stats.rows[0]);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const revealOtpToUser = async (req, res) => {
  const { user_id } = req.body || {};
  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    const r = await db.query(
      `SELECT id
         FROM token
        WHERE applicant_id = $1 AND status = 'ACTIVE'
        ORDER BY (finish_requested_at IS NOT NULL) DESC,
                 finish_requested_at DESC NULLS LAST,
                 created_at DESC
        LIMIT 1`,
      [user_id]
    );
    if (!r.rows.length) {
      return res.status(404).json({ error: "Active token not found" });
    }

    const tokenId = r.rows[0].id;
    const upd = await db.query(
      `UPDATE token
          SET finish_requested_at = COALESCE(finish_requested_at, now())
        WHERE id = $1
        RETURNING finish_requested_at`,
      [tokenId]
    );

    if (!upd.rows.length) {
      return res.status(500).json({ error: "Could not mark OTP requested" });
    }

    return res.json({ message: "OTP sent to applicant" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};