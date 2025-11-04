import React from 'react';
import './Privacy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-page">
      <div className="logo-container">
        <img 
          src="images/App_logo.jpg" 
          alt="Logo" 
          className="logo" 
        />
      </div>
      <div className="policy-container">
        <h1>Privacy Policy for SWASTHA Your PeeCeeSakhi!</h1>
        <p><strong>Effective Date:</strong> 2025</p>

        <p>At <strong>SWASTHA</strong>, your privacy is very important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our website, including the PCOS detection model, journal tracking, and chatbot features.</p>

        <h2>1. Information We Collect</h2>
        <p>We may collect the following information when you register or use our services:</p>
        <ul>
          <li><strong>Username</strong> – to personalize your account.</li>
          <li><strong>Email address</strong> – to send updates and support.</li>
          <li><strong>Password</strong> – for account security (stored securely and encrypted).</li>
        </ul>
        <p>We do <strong>not</strong> collect sensitive health data unless you voluntarily enter it in the journal or chatbot, and it is used only to improve your experience on our platform.</p>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>Create and manage your account.</li>
          <li>Provide personalized services such as the PCOS detection model and journal tracking.</li>
          <li>Communicate important updates, reminders, or changes to our services.</li>
        </ul>

        <h2>3. How We Protect Your Information</h2>
        <ul>
          <li>Your password is securely <strong>encrypted</strong> in our database.</li>
          <li>We implement strict <strong>security measures</strong> to protect your data from unauthorized access.</li>
          <li>Sensitive health information entered in journals or chatbots is stored securely and is accessible only to you.</li>
        </ul>

        <h2>4. Sharing Your Information</h2>
        <p>We <strong>do not sell or share your personal information</strong> with third parties for marketing purposes. Data may only be shared if <strong>required by law</strong> or to protect the rights and safety of our users.</p>

        <h2>5. Cookies and Tracking</h2>
        <p>Our website may use cookies or similar technologies to improve your experience, such as remembering your login session and preferences.</p>

        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal information.</li>
          <li>Update or correct your account details.</li>
          <li>Request deletion of your account and associated data.</li>
        </ul>
        <p>To exercise these rights, contact us at <strong>swasthayourpeeceesakhi@gmail.com</strong>.</p>

        <h2>7. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated <strong>Effective Date</strong>.</p>

        <h2>8. Contact Us</h2>
        <p>If you have questions about this Privacy Policy or your data, contact us at:</p>
        <p><strong>Email:</strong> swasthayourpeeceesakhi@gmail.com</p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
