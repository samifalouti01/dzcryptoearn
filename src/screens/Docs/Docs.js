// src/components/Docs.js
import React, { useState } from "react";
import "./Docs.css";

const Docs = () => {
  const [activeSection, setActiveSection] = useState("");

  const handleClick = (sectionId) => {
    setActiveSection(sectionId);
  };

  return (
    <div className="docs-container">
      <div className="side">
        <ul className="side-links">
          {["getting-started", "terms", "features", "ads", "shortlinks", "offers", "manage", "money", "report", "faqs"].map((section) => (
            <li key={section}>
              <a 
                href={`#${section}`} 
                onClick={() => handleClick(section)}
                className={activeSection === section ? "active" : ""}
              >
                {section.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} {/* Capitalizing the section names */}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="content">
        <h1 className="docs-title">Documentation</h1>

        <section id="getting-started" className={`doc-section ${activeSection === "getting-started" ? "active" : ""}`}>
          <h2 className="section-title">Getting Started</h2>
          <p>
            Welcome to our website! This documentation will guide you through the
            basic features and functionalities available on our platform.
          </p>
          <p>
            To begin, create an account by clicking on the "Sign Up" button on
            the homepage.
          </p>
        </section>

        <section id="terms" className={`doc-section ${activeSection === "terms" ? "active" : ""}`}>
          <h2 className="section-title">Terms of Use</h2>
          <p>
            By using our platform, you agree to comply with our terms of service.
            Please read through our policies carefully.
          </p>
        </section>

        <section id="features" className={`doc-section ${activeSection === "features" ? "active" : ""}`}>
          <h2 className="section-title">How to Use Features</h2>
          <h3>Feature 1: Dashboard</h3>
          <p>
            The dashboard provides an overview of your activities. You can track
            your performance, view stats, and access all features from here.
          </p>

          <h3>Feature 2: Reports</h3>
          <p>
            To submit a report, navigate to the "Report" section. Fill out the
            form with the required information and click "Submit."
          </p>
        </section>

        <section id="ads" className={`doc-section ${activeSection === "ads" ? "active" : ""}`}>
          <h2 className="section-title">How to Create Ads</h2>
          <p>
            To create an ad, go to the "Ads Management" section in the navbar. Click on "Create Ad" and fill in the necessary details.
          </p>
        </section>

        <section id="shortlinks" className={`doc-section ${activeSection === "shortlinks" ? "active" : ""}`}>
          <h2 className="section-title">How to Create Shortlinks Ads</h2>
          <p>
            To create a shortlinks ad, go to the "Ads Management" option and follow the prompts to enter your URL and customize your ad.
          </p>
        </section>

        <section id="offers" className={`doc-section ${activeSection === "offers" ? "active" : ""}`}>
          <h2 className="section-title">How to Create Offers</h2>
          <p>
            Navigate to the "Ads Management" section and click on "Create Offer." Fill in the details, including the offer's terms.
          </p>
        </section>

        <section id="manage" className={`doc-section ${activeSection === "manage" ? "active" : ""}`}>
          <h2 className="section-title">How to Manage Ads</h2>
          <p>
            You can manage your ads from the "Ads Management" section. Here, you can edit or delete your existing ads, shortlinks, and offers.
          </p>
        </section>

        <section id="money" className={`doc-section ${activeSection === "money" ? "active" : ""}`}>
          <h2 className="section-title">How to Withdraw and Deposit</h2>
          <p>
            To withdraw or deposit money, go to the "Withdraw" or "Deposit" sections and choose your preferred payment method. Follow the on-screen instructions.
          </p>
        </section>

        <section id="report" className={`doc-section ${activeSection === "report" ? "active" : ""}`}>
          <h2 className="section-title">How to Report a Problem</h2>
          <p>
            If you encounter any issues, please visit the "Support" section to fill out a problem report form.
          </p>
        </section>

        <section id="faqs" className={`doc-section ${activeSection === "faqs" ? "active" : ""}`}>
          <h2 className="section-title">FAQs</h2>
          <h3>Q: How do I reset my password?</h3>
          <p>
            A: You can reset your password by clicking on the "Forgot Password?"
            link on the login page. Follow the instructions sent to your email.
          </p>

          <h3>Q: How can I contact support?</h3>
          <p>
            A: For any support inquiries, please reach out to us through the
            contact form available on the "Contact Us" page.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Docs;
