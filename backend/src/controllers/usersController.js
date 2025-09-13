import db from "../DB/pg.js";
function sanitizeAadhaar(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length !== 12) {
    throw new Error("aadhar_number must be exactly 12 digits");
  }
  return digits;
}

export const createUser = async (req, res) => {
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
