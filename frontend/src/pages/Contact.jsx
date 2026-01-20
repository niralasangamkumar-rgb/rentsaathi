import React from "react";

function Contact() {
  return (
    <div className="max-w-md mx-auto px-4 py-8 text-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Contact Us</h1>
      <p className="mb-3">
        If you need support, want to report an issue, or have feedback or suggestions, please feel free to reach out to us.
      </p>
      <p className="mb-3">
        You can email us at:{" "}
        <a
          href="mailto:rentsaathiofficial@gmail.com"
          className="text-blue-600 underline break-all"
        >
          rentsaathiofficial@gmail.com
        </a>
      </p>
      <p className="mb-3">We usually respond within 24–48 hours.</p>
      <p className="mb-3">Service available across India.</p>
      <p className="mt-6">Thank you for using RentSaathi!</p>
    </div>
  );
}

export default Contact;
