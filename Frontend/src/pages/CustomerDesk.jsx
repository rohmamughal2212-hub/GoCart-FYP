import React from "react";

const CustomerDesk = () => {
  return (
    <div className="mt-16 pb-16">
      <div className="mb-6">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#1B3A6B" }}>CUSTOMER DESK</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">We're Here to Help</h1>
        <p className="text-sm text-gray-500 mt-2">Welcome to the GoCart Customer Desk. Our dedicated support team is committed to providing timely assistance, resolving concerns, and ensuring a smooth shopping experience for every customer.</p>
        <div className="mt-4 h-1 w-16 rounded-full" style={{ background: "#1B3A6B" }} />
      </div>

      <div className="space-y-6 text-gray-700">
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <p>Whether you need help with an order, delivery, payment, product information, returns, refunds, or general inquiries, our Customer Desk is ready to assist you.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">How Can We Help You?</h2>
          <p className="mt-3">Our Customer Support Team can assist with:</p>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li><strong>Order Assistance</strong> — Order placement support, order status updates, order modifications, order cancellation requests.</li>
            <li><strong>Delivery Support</strong> — Delivery tracking, delivery delays, incorrect delivery information, delivery-related concerns.</li>
            <li><strong>Payment Assistance</strong> — Payment verification, online payment issues, refund status inquiries, billing-related questions.</li>
            <li><strong>Returns &amp; Refunds</strong> — Return requests, refund processing updates, product exchange inquiries, return eligibility verification.</li>
            <li><strong>Product Support</strong> — Product availability, product specifications, product recommendations, stock inquiries.</li>
            <li><strong>General Customer Support</strong> — Account assistance, website support, feedback and suggestions, general information requests.</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Customer Service Commitment</h2>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>Providing professional customer support.</li>
            <li>Responding to inquiries promptly.</li>
            <li>Resolving concerns fairly and efficiently.</li>
            <li>Maintaining customer satisfaction.</li>
            <li>Continuously improving our services.</li>
          </ul>
          <p className="mt-3">Every customer inquiry is important to us, and we strive to provide accurate and helpful assistance whenever needed.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Submit a Support Request</h2>
          <p className="mt-3">To help us assist you more efficiently, please provide the following information when contacting our support team:</p>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>Full Name</li>
            <li>Contact Number</li>
            <li>Email Address (if applicable)</li>
            <li>Order Number (if applicable)</li>
            <li>Description of the Issue or Inquiry</li>
          </ul>
          <p className="mt-3">Providing complete information helps us resolve your request more quickly.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Business &amp; Partnership Inquiries</h2>
          <p className="mt-3">For business collaborations, supplier opportunities, partnerships, or corporate matters, please contact our business support team. All business-related inquiries are reviewed by the appropriate department for further assistance.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Customer Feedback</h2>
          <p className="mt-3">Your feedback helps us improve. We welcome suggestions, compliments, and recommendations regarding products, delivery services, website experience, customer service, and overall shopping experience.</p>
          <p className="mt-3">Customer feedback plays an important role in helping us maintain and improve our service standards.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Contact Information</h2>
          <p className="mt-3"><strong>GoCart</strong><br/>Gujranwala, Punjab, Pakistan</p>
          <p className="mt-3"><strong>Customer Helpline:</strong> 0300-XXXXXXX</p>
          <p className="mt-3"><strong>Customer Support:</strong> xxxxxxxxxxxxxxxxx</p>
          <p className="mt-3"><strong>Business Support:</strong> xxxxxxxxxxxxxxxxx</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Support Hours</h2>
          <p className="mt-3">Customer Support Availability:</p>
          <p className="mt-3">Monday – Sunday<br/>09:00 AM – 09:00 PM</p>
          <p className="mt-3">Support availability may vary during public holidays, special events, or maintenance periods.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Your Satisfaction Is Our Priority</h2>
          <p className="mt-3">At GoCart, we believe that exceptional customer service is just as important as quality products. Our Customer Desk is dedicated to ensuring that every customer receives the support, assistance, and attention they deserve throughout their shopping journey.</p>
        </section>
      </div>
    </div>
  );
};

export default CustomerDesk;
