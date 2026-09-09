import React from "react";

const Privacy = () => {
  return (
    <div className="mt-16 pb-16">
      <div className="mb-6">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#1B3A6B" }}>PRIVACY POLICY</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mt-2">Last Updated: June 14, 2026</p>
        <div className="mt-4 h-1 w-16 rounded-full" style={{ background: "#1B3A6B" }} />
      </div>

      <div className="space-y-6 text-gray-700">
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Introduction</h2>
          <p className="mt-3">GoCart is committed to protecting your personal information and maintaining transparency regarding how your data is handled. We collect only the information necessary to provide our services, improve customer experience, process orders, and communicate effectively with our customers. This Privacy Policy applies to all visitors, customers, and users of the GoCart website and services.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Information We Collect</h3>
          <p className="mt-3">Depending on how you interact with our website and services, we may collect the following information:</p>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li><strong>Personal Information:</strong> Full Name, Email Address, Phone Number, Delivery Address, Billing Information, Account Registration Details.</li>
            <li><strong>Order Information:</strong> Products Purchased, Order History, Transaction Information, Delivery Preferences.</li>
            <li><strong>Technical Information:</strong> IP Address, Browser Type, Device Information, Operating System, Website Usage Data, Pages Visited, Date and Time of Access.</li>
            <li><strong>Customer Communications:</strong> Records of communications when you contact GoCart via phone, email, contact forms, or support channels.</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold">How We Use Your Information</h3>
          <p className="mt-3">GoCart may use collected information for order processing, customer support, website improvement, communications, and security purposes including fraud prevention and detection.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Information Sharing</h3>
          <p className="mt-3">We do not sell, rent, or trade personal information to third parties. We may share limited information with trusted service providers for payment processing, delivery, website maintenance, and customer support. We may disclose information to comply with legal obligations or to protect our rights.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Data Security &amp; Retention</h3>
          <p className="mt-3">We implement reasonable technical and organizational measures to protect customer data. We retain information only as long as necessary for business purposes, legal obligations, dispute resolution, and record-keeping, and will delete or anonymize data when no longer required.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Cookies &amp; Tracking</h3>
          <p className="mt-3">Our website may use cookies and similar technologies to remember preferences, analyze traffic, and improve performance. You may disable cookies through your browser settings, but some features may not function properly.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Third-Party Services</h3>
          <p className="mt-3">Our site may link to third-party websites and services. We are not responsible for third-party privacy practices; users should review those privacy policies before sharing personal information.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Customer Rights &amp; Contact</h3>
          <p className="mt-3">Subject to applicable laws, customers may request access, correction, deletion, or restriction of their personal information. Requests may be submitted through official GoCart contact channels. For privacy inquiries, contact GoCart at our Gujranwala office or via customer helpline.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Children's Privacy &amp; Marketing</h3>
          <p className="mt-3">GoCart is not directed to children and we do not knowingly collect information from individuals not legally permitted to share personal data. Users may opt out of marketing communications as described in this policy.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Changes to This Policy &amp; Governing Law</h3>
          <p className="mt-3">We may update this Privacy Policy at any time; changes take effect when published. This policy is governed by the laws of Pakistan and disputes fall under Pakistani courts.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <p className="mt-3"><strong>GoCart</strong><br/>Location: Gujranwala, Punjab, Pakistan<br/>Customer Helpline: 0300-XXXXXXX</p>
        </section>

        <p className="text-sm text-gray-600">At GoCart, protecting customer privacy is part of our commitment to a safe, reliable, and trustworthy shopping experience. By using our website and services, you acknowledge that you have read and understood this Privacy Policy.</p>
      </div>
    </div>
  );
};

export default Privacy;
