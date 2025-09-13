import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    disabilities: "",
    phone: "",
    serviceCategory: "",
    llType: "",
    vehicleType: "",
    registrationService: "",
    otherService: "",
    aadhar: "",
    llNumber: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.disabilities) newErrors.disabilities = "Please select disability";
    if (!form.phone) newErrors.phone = "Phone is required";
    if (!form.serviceCategory) newErrors.serviceCategory = "Please select a service category";
    if (!form.aadhar) newErrors.aadhar = "Aadhar number is required";
    if (!form.llNumber) newErrors.llNumber = "LL Application number is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      try {
        const response = await axios.post("http://localhost:3000/users", form);
        console.log("User registered:", response.data);
        navigate("/book");
      } catch (error) {
        console.error("Registration error:", error);
        // Optionally set error state here to display error message to user
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          User Registration
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

          <select
            name="disabilities"
            onChange={handleChange}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Disability</option>
            <option value="visual">Visual Impairment</option>
            <option value="hearing">Hearing Impairment</option>
            <option value="mobility">Mobility Impairment</option>
            <option value="cognitive">Cognitive Impairment</option>
            <option value="none">None</option>
          </select>
          {errors.disabilities && (
            <p className="text-red-500 text-sm">{errors.disabilities}</p>
          )}

          <input
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

          <input
            name="aadhar"
            placeholder="Aadhar Number"
            onChange={handleChange}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.aadhar && <p className="text-red-500 text-sm">{errors.aadhar}</p>}

          <input
            name="llNumber"
            placeholder="LL Application Number"
            onChange={handleChange}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.llNumber && (
            <p className="text-red-500 text-sm">{errors.llNumber}</p>
          )}

          <select
            name="serviceCategory"
            onChange={handleChange}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Service Category</option>
            <option value="drivingLicense">Driving Licence</option>
            <option value="vehicleRegistration">Vehicle Registration</option>
            <option value="otherServices">Other Services</option>
            <option value="taxFeeCollection">Tax / Fee Collection</option>
            <option value="vehicleDocuments">Vehicle Documents</option>
          </select>
          {errors.serviceCategory && (
            <p className="text-red-500 text-sm">{errors.serviceCategory}</p>
          )}

          {form.serviceCategory === "drivingLicense" && (
            <select
              name="llType"
              onChange={handleChange}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Licence Type</option>
              <option value="MC">Motorcycle / Scooter (MC)</option>
              <option value="LMV">Car / Jeep (LMV)</option>
              <option value="HMV">Truck / Bus (HMV)</option>
              <option value="HGMV">Goods Vehicle (HGMV)</option>
              <option value="PSV">Passenger Vehicle (PSV)</option>
            </select>
          )}

          {form.serviceCategory === "vehicleRegistration" && (
            <>
              <select
                name="vehicleType"
                onChange={handleChange}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Vehicle Type</option>
                <option value="twoWheeler">Two-wheeler</option>
                <option value="lmv">Light Motor Vehicle (4-wheeler)</option>
                <option value="heavyVehicle">Heavy Vehicle (Truck/Bus)</option>
                <option value="tractor">Tractor / Special Vehicle</option>
              </select>
              <select
                name="registrationService"
                onChange={handleChange}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Registration Service (Optional)</option>
                <option value="new">New Registration</option>
                <option value="renewal">Renewal</option>
                <option value="transfer">Transfer of Ownership</option>
                <option value="duplicate">Duplicate RC</option>
                <option value="addressChange">Change of Address</option>
              </select>
            </>
          )}

          {form.serviceCategory === "otherServices" && (
            <select
              name="otherService"
              onChange={handleChange}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Service</option>
              <option value="permits">Permits</option>
              <option value="taxFee">Tax / Fee Payment</option>
              <option value="pucNocCertificates">PUC / NOC / Certificates</option>
            </select>
          )}

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
