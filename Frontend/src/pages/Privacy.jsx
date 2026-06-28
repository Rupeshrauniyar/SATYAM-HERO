import React from "react";
import "../styles.css";

export default function Privacy() {
  return (
    <div className="p-4">
      <div className="x-page-header">
        <h1>Privacy Policy</h1>
      </div>

      <div className="x-panel">
        <p className="text-sm text-x-text-secondary mb-4">This Privacy Policy explains how CivicReport collects, uses, shares, and protects your information. Please read carefully.</p>

        <h3 className="font-bold">1. Information We Collect</h3>
        <p className="text-sm text-x-text-secondary mb-3">We collect information you provide when creating or updating your account, submitting reports, and interacting with the app (e.g., phone number, name, reports, comments).</p>

        <h3 className="font-bold">2. How We Use Information</h3>
        <p className="text-sm text-x-text-secondary mb-3">We use data to provide and improve services, authenticate users, send notifications, and generate insights for authorities.</p>

        <h3 className="font-bold">3. Sharing</h3>
        <p className="text-sm text-x-text-secondary mb-3">We do not sell personal data. We may share report details with government authorities to resolve civic issues. Aggregated, non-identifying data may be used for analytics.</p>

        <h3 className="font-bold">4. Your Choices</h3>
        <p className="text-sm text-x-text-secondary mb-3">You can delete your account, control notification preferences, and manage language and appearance from Settings.</p>

        <h3 className="font-bold">5. Contact</h3>
        <p className="text-sm text-x-text-secondary mb-3">For questions, contact support@civicreport.example (replace with real address).</p>

        <div className="mt-4 text-sm text-x-text-secondary">
          <p>Links</p>
          <ul className="list-disc list-inside">
            <li><a href="/" className="text-x-accent">Home</a></li>
            <li><a href="/profile" className="text-x-accent">Profile</a></li>
            <li><a href="/settings" className="text-x-accent">Settings</a></li>
            <li><a href="/privacy" className="text-x-accent">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
