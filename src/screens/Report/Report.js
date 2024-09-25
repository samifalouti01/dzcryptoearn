import React, { useState } from "react";
import { supabase } from '../../supabaseClient';
import "./Report.css";

const Report = () => {
  const [formData, setFormData] = useState({
    adLink: "",
    message: "",
    adType: "select", // Default value
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: { user }, error: userError } = await supabase.auth.getUser(); // Get the authenticated user

    if (userError || !user) {
      console.error("User not authenticated or error retrieving user:", userError);
      return; // Exit if there's an error or no user
    }

    const reportData = {
      user_email: user.email,
      ad_link: formData.adLink,
      problem: formData.adType === "other" ? formData.message : formData.adType,
    };

    const { error } = await supabase
      .from('report') // Replace with your actual table name
      .insert([reportData]);

    if (error) {
      console.error("Error submitting report:", error);
    } else {
      console.log("Report submitted:", reportData);
      // Reset form or provide feedback to user
      setFormData({ adLink: "", message: "", adType: "select" });
    }
  };

  return (
    <div>
        <div className="banner">
        <div className="banner-content">
          <p>
            📢 If you encounter any inappropriate advertisements, please report them immediately. 📢 Review our Terms of Use for more information. 📢 We strictly prohibit erotic and gambling advertisements.
          </p>
        </div>
      </div>
      <div className="banner">
        <div className="banner-arabic">
          <p style={{ fontSize: '1em' }}>
            📢 إذا صادفت أي إعلانات غير لائقة، يرجى الإبلاغ عنها فورًا. 📢 راجع شروط الاستخدام الخاصة بنا لمزيد من المعلومات. 📢 نحن نحظر بشدة الإعلانات الإباحية وإعلانات المقامرة.
          </p>
        </div>
      </div>
        <div className="report-container">
        <h2 className="report-title">Submit a Report</h2>
        <form className="report-form" onSubmit={handleSubmit}>
            <div className="form-group">
            <label htmlFor="adLink">Ad Link:</label>
            <input
                type="url"
                id="adLink"
                name="adLink"
                value={formData.adLink}
                onChange={handleChange}
                required
            />
            </div>
            <div className="form-group">
            <label htmlFor="adType">Ad Type:</label>
            <select
                id="adType"
                name="adType"
                value={formData.adType}
                onChange={handleChange}
                required
            >
                <option value="select">Select an option</option>
                <option value="erotic">Erotic ads</option>
                <option value="gambling">Gambling ads</option>
                <option value="other">Other</option>
            </select>
            </div>
            {formData.adType === "other" && (
            <div className="form-group">
                <label htmlFor="message">Message:</label>
                <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                ></textarea>
            </div>
            )}
            <button type="submit" className="submit-button">Submit Report</button>
        </form>
        </div>
    </div>
  );
};

export default Report;
