import React from "react";

function PrivacyPolicy() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Privacy Policy</h1>
      <p className="mb-4">
        At RentSaathi, we respect your privacy and are committed to keeping your personal information safe. This page explains how we handle your data in simple terms.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">What Data We Collect</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Name</li>
        <li>Email</li>
        <li>Phone number</li>
        <li>City</li>
        <li>Property listing details</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">Why We Collect Data</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>To help you create an account</li>
        <li>To let you post and browse property or vehicle listings</li>
        <li>To make it easy for renters and owners to contact each other</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">Data Storage &amp; Security</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Your data is stored securely using Firebase</li>
        <li>We do not sell or misuse your personal information</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">Third-Party Services</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Firebase Authentication</li>
        <li>Firebase Firestore</li>
        <li>Firebase Storage (for images)</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">Your Rights</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>You can update or delete your account at any time</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">Contact Us</h2>
      <p className="mb-4">
        If you have any questions or need help, please email us at <a href="mailto:support@rentsaathi.in" className="text-blue-600 underline">support@rentsaathi.in</a>
      </p>

      <p className="text-sm text-gray-500 mt-8">Last updated: January 20, 2026</p>
    </div>
  );
}

export default PrivacyPolicy;
