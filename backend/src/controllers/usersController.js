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




 const getUserOtp = async (req, res) => {
  const userId = Number(req.params.user_id ?? req.body?.user_id);
  if (!userId) return res.status(400).json({ error: "user_id is required" });

  try {
    const r = await db.query(
      `SELECT id AS token_id,otp_code_hash AS otp_code
         FROM token
        WHERE applicant_id = $1
          AND status = 'ACTIVE'
        ORDER BY (finish_requested_at IS NOT NULL) DESC,  -- prefer ones where OTP was requested
                 finish_requested_at DESC NULLS LAST,
                 created_at DESC
        LIMIT 1`,
      [userId]
    );

    if (!r.rows.length) {
      return res.status(404).json({ error: "Active token not found for this user" });
    }
    const { token_id, otp_code } = r.rows[0];
    if (!otp_code) {
      return res.status(404).json({ error: "OTP not set for this token" });
    }

    return res.json({ user_id: userId, token_id, otp: String(otp_code) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};


 const cancelApplication = async (req, res) => {
  const { aadhar_number, token_no } = req.body || {};
  if (!aadhar_number || !token_no) {
    return res.status(400).json({ error: "aadhar_number and token_no are required" });
  }

  let aadhaar;
  try {
    aadhaar = sanitizeAadhaar(aadhar_number);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  try {
    const u = await db.query(
      `SELECT id, full_name FROM app_user WHERE aadhar_number = $1`,
      [aadhaar]
    );
    if (!u.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = u.rows[0].id;

    const t = await db.query(
      `SELECT id, token_no, status, slot_ts
         FROM token
        WHERE applicant_id = $1
          AND token_no = $2
          AND status = 'ACTIVE'
        ORDER BY created_at DESC
        LIMIT 1`,
      [userId, token_no]
    );
    if (!t.rows.length) {
      return res.status(404).json({ error: "Active token not found for this user/token_no" });
    }
    const token = t.rows[0];

    const upd = await db.query(
      `UPDATE token
          SET status = 'CANCELLED'
        WHERE id = $1 AND status = 'ACTIVE'
        RETURNING id, token_no, slot_ts, status`,
      [token.id]
    );
    if (!upd.rows.length) {
      return res.status(409).json({ error: "Token is not ACTIVE or was already updated" });
    }
    const cancelled = upd.rows[0];

    const del = await db.query(
      `DELETE FROM slot_selection
        WHERE applicant_id = $1 AND slot_ts = $2
        RETURNING id`,
      [userId, token.slot_ts]
    );

    return res.status(200).json({
      message: "Application cancelled",
      token: cancelled,
      slot_selection_deleted: del.rowCount > 0
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export {createUser,getUserOtp,cancelApplication}

export const loginUser = async (req, res) => {
  const { phone, password } = req.body || {};
  if (!phone || !password) {
    return res.status(400).json({ error: "phone and password are required" });
  }

  try {
    const r = await db.query(
      `SELECT id, full_name, aadhar_number, ll_application_number, phone, is_admin
         FROM app_user
        WHERE phone = $1
        LIMIT 1`,
      [phone]
    );
    if (!r.rows.length) {
      return res.status(401).json({ error: "Invalid phone or password" });
    }
    return res.json({ message: "Login successful", user: r.rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getPendingUsers = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT u.full_name, u.aadhar_number
         FROM token t
         JOIN app_user u ON u.id = t.applicant_id
        WHERE t.status = 'ACTIVE'
          AND t.slot_local_date = ((now() AT TIME ZONE 'Asia/Kolkata')::date)
        ORDER BY t.created_at ASC`
    );

    const rows = r.rows.map((row) => ({
      name: row.full_name,
      aadharNumber: row.aadhar_number,
    }));

    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};