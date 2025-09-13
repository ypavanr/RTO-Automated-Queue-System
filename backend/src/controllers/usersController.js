import db from "../DB/pg.js";
function sanitizeAadhaar(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length !== 12) {
    throw new Error("aadhar_number must be exactly 12 digits");
  }
  return digits;
}
 const createUser = async (req, res) => {
  const {
    full_name,
    aadhar_number,
    ll_application_number,
    phone,
    vehicle_classes = [],  
    disabilities = []      
  } = req.body || {};

  if (!full_name || !aadhar_number || !ll_application_number) {
    return res
      .status(400)
      .json({ error: "full_name, aadhar_number, ll_application_number are required" });
  }

  let aadhaar;
  try {
    aadhaar = sanitizeAadhaar(aadhar_number);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  try {
    const byAadhaar = await db.query(
      "SELECT id FROM app_user WHERE aadhar_number = $1",
      [aadhaar]
    );
    if (byAadhaar.rows.length > 0) {
      return res.status(401).json({ message: "Aadhaar already exists. User is already registered." });
    }

    const byLL = await db.query(
      "SELECT id FROM app_user WHERE ll_application_number = $1",
      [ll_application_number]
    );
    if (byLL.rows.length > 0) {
      return res.status(401).json({ message: "LL application number already exists." });
    }

    const userInsert = await db.query(
      `INSERT INTO app_user (full_name, aadhar_number, ll_application_number, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, aadhar_number, ll_application_number, phone, created_at`,
      [full_name, aadhaar, ll_application_number, phone || null]
    );

    if (userInsert.rows.length === 0) {
      return res.status(500).json({ error: "Could not create user" });
    }

    const user = userInsert.rows[0];

    if (Array.isArray(vehicle_classes) && vehicle_classes.length > 0) {
      for (const vc of vehicle_classes) {
        if (!vc) continue;
        await db.query(
          `INSERT INTO user_vehicle_class (applicant_id, vehicle_class)
           VALUES ($1, $2)
           ON CONFLICT (applicant_id, vehicle_class) DO NOTHING`,
          [user.id, vc]
        );
      }
    }

    if (Array.isArray(disabilities) && disabilities.length > 0) {
      for (const d of disabilities) {
        if (!d) continue;
        await db.query(
          `INSERT INTO disabilities (applicant_id, disability)
           VALUES ($1, $2)
           ON CONFLICT (applicant_id, disability) DO NOTHING`,
          [user.id, d]
        );
      }
    }

    return res.status(201).json({
      message: "User registered successfully!",
      user
    });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(401).json({ message: "Duplicate: Aadhaar or LL application already exists." });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

function formatAadhaar(a12) {
  const digits = String(a12 ?? "").replace(/\D/g, "").slice(0, 12);
  return digits.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");
}


 const getPendingUsers = async (req, res) => {
  const limit = Number(req.query.limit ?? 100);
  const offset = Number(req.query.offset ?? 0);

  try {
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
      )
      SELECT
        u.id,
        u.full_name,
        u.aadhar_number,
        u.ll_application_number,
        u.phone,
        COALESCE(vc.vehicle_classes, '{}') AS vehicle_classes,
        COALESCE(dis.disabilities, '{}')    AS disabilities,
        COALESCE(array_length(dis.disabilities, 1), 0) AS disability_count,
        ss.slot_ts AS selected_slot_ts
      FROM app_user u
      LEFT JOIN vc  ON vc.applicant_id  = u.id
      LEFT JOIN dis ON dis.applicant_id = u.id
      LEFT JOIN slot_selection ss ON ss.applicant_id = u.id
      WHERE NOT EXISTS (SELECT 1 FROM token t WHERE t.applicant_id = u.id)
      ORDER BY disability_count DESC, u.created_at ASC
      LIMIT $1 OFFSET $2;
    `;
    const r = await db.query(sql, [limit, offset]);

    const rows = r.rows.map(row => ({
      id: row.id,
      full_name: row.full_name,
      aadhar_number: formatAadhaar(row.aadhar_number),
      ll_application_number: row.ll_application_number,
      phone: row.phone,
      vehicle_classes: row.vehicle_classes || [],
      disabilities: row.disabilities || [],
      selected_slot_ts: row.selected_slot_ts 
    }));

    return res.json({ count: rows.length, rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

 const getNextPendingUser = async (_req, res) => {
  try {
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
      )
      SELECT
        u.id,
        u.full_name,
        u.aadhar_number,
        u.ll_application_number,
        u.phone,
        COALESCE(vc.vehicle_classes, '{}') AS vehicle_classes,
        COALESCE(dis.disabilities, '{}')    AS disabilities,
        COALESCE(array_length(dis.disabilities, 1), 0) AS disability_count,
        ss.slot_ts AS selected_slot_ts
      FROM app_user u
      LEFT JOIN vc  ON vc.applicant_id  = u.id
      LEFT JOIN dis ON dis.applicant_id = u.id
      LEFT JOIN slot_selection ss ON ss.applicant_id = u.id
      WHERE NOT EXISTS (SELECT 1 FROM token t WHERE t.applicant_id = u.id)
      ORDER BY disability_count DESC, u.created_at ASC
      LIMIT 1;
    `;
    const r = await db.query(sql);
    if (r.rows.length === 0) {
      return res.status(404).json({ message: "No pending users" });
    }

    const u = r.rows[0];
    return res.json({
      id: u.id,
      full_name: u.full_name,
      aadhar_number: formatAadhaar(u.aadhar_number),
      ll_application_number: u.ll_application_number,
      phone: u.phone,
      vehicle_classes: u.vehicle_classes || [],
      disabilities: u.disabilities || [],
      selected_slot_ts: u.selected_slot_ts 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


export {createUser,getNextPendingUser,getPendingUsers}