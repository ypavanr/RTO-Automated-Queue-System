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

    // If an ACTIVE token exists for this user, block booking another slot
    const hasActiveToken = await db.query(
      `SELECT 1 FROM token WHERE applicant_id = $1 AND status = 'ACTIVE' LIMIT 1`,
      [applicant_id]
    );
    if (hasActiveToken.rows.length) {
      return res.status(409).json({ error: "You have already booked. Active token exists." });
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


 const getSlotsAvailability = async (req, res) => {
  const from = req.query.from;
  const to = req.query.to;
  if (!from || !to) return res.status(400).json({ error: "from and to are required (ISO)" });

  try {
    const r = await db.query(
      `SELECT slot_ts,
              COUNT(*)::int AS count,
              GREATEST(5-COUNT(*),0)::int AS remaining
         FROM slot_selection
        WHERE slot_ts >= $1 AND slot_ts < $2
        GROUP BY slot_ts
        ORDER BY slot_ts`,
      [from, to]
    );
    return res.json(r.rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};

 const getSlotQueue = async (req, res) => {
  const slot_ts = req.query.slot_ts;
  if (!slot_ts) return res.status(400).json({ error: "slot_ts is required" });

  try {
    const sql = `
      WITH vc AS (
        SELECT applicant_id, ARRAY_AGG(DISTINCT vehicle_class ORDER BY vehicle_class) AS vehicle_classes
        FROM user_vehicle_class GROUP BY applicant_id
      ),
      dis AS (
        SELECT applicant_id, ARRAY_AGG(DISTINCT disability ORDER BY disability) AS disabilities
        FROM disabilities GROUP BY applicant_id
      )
      SELECT
        t.id AS token_id, t.token_no, t.status, t.is_priority, t.slot_ts,
        u.id AS user_id, u.full_name, u.aadhar_number, u.ll_application_number, u.phone,
        COALESCE(vc.vehicle_classes,'{}') AS vehicle_classes,
        COALESCE(dis.disabilities,'{}')   AS disabilities,
        COALESCE(ss.created_at, t.created_at) AS slot_selected_at,
        ROW_NUMBER() OVER (
          PARTITION BY t.slot_ts
          ORDER BY t.is_priority DESC, COALESCE(ss.created_at,t.created_at) ASC, t.created_at ASC
        ) AS rank_in_slot
      FROM token t
      JOIN app_user u ON u.id=t.applicant_id
      LEFT JOIN slot_selection ss ON ss.applicant_id=u.id AND ss.slot_ts=t.slot_ts
      LEFT JOIN vc ON vc.applicant_id=u.id
      LEFT JOIN dis ON dis.applicant_id=u.id
      WHERE t.slot_ts=$1 AND t.status='ACTIVE'
      ORDER BY rank_in_slot;
    `;
    const r = await db.query(sql, [slot_ts]);
    return res.json({ count: r.rowCount, rows: r.rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};

export {selectTimeSlot,getSlotsAvailability,getSlotQueue}