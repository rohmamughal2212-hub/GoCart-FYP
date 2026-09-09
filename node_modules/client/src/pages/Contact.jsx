import React from "react";

const Contact = () => {
  return (
    <div className="mt-16 pb-16">
      <div className="mb-6">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#1B3A6B" }}>CONTACT US</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Contact GoCart</h1>
        <p className="text-sm text-gray-500 mt-2">Effective Date: 14 June, 2026</p>
        <div className="mt-4 h-1 w-16 rounded-full" style={{ background: "#1B3A6B" }} />
      </div>

      <div className="space-y-6 text-gray-700">
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <p>At GoCart, we are committed to providing excellent customer service and support. Whether you have questions about our products, orders, deliveries, refunds, or general inquiries, our team is here to assist you.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Customer Support</h2>
          <p className="mt-3">For assistance regarding orders, deliveries, returns, refunds, account issues, or general questions, please contact our support team.</p>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li><strong>Helpline:</strong> 0300-XXXXXXX</li>
            <li><strong>Availability:</strong> Monday – Sunday, 9:00 AM – 10:00 PM (PKT)</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Store Location</h2>
          <p className="mt-3">GoCart<br/>Gujranwala, Punjab, Pakistan</p>
          <p className="mt-2">Currently, GoCart operates exclusively within Gujranwala and serves customers throughout the city and surrounding areas.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Email Support</h2>
          <p className="mt-3">For detailed inquiries, business requests, partnerships, feedback, or support-related concerns, you may contact us via email.</p>
          <p className="mt-3"><strong>Email:</strong> xxxxxxxxxxxxxxx</p>
          <p className="mt-3">Our team aims to respond to all email inquiries within 24–48 business hours.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Business &amp; Partnership Inquiries</h2>
          <p className="mt-3">If you are interested in partnering with GoCart, supplying products, advertising opportunities, or discussing business collaborations, please contact our management team through our official support channels.</p>
          <p className="mt-3"><strong>Business Email:</strong> xxxxxxxxxxxxxxxx</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Order &amp; Delivery Assistance</h2>
          <p className="mt-3">If you require assistance regarding:</p>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>Order status and tracking</li>
            <li>Delivery updates</li>
            <li>Missing or incorrect items</li>
            <li>Product availability</li>
            <li>Refunds and returns</li>
            <li>Payment-related concerns</li>
          </ul>
          <p className="mt-3">Please have your order number available when contacting our support team to help us assist you more efficiently.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Feedback &amp; Suggestions</h2>
          <p className="mt-3">We value customer feedback and continuously strive to improve our services. If you have suggestions, comments, or recommendations, we encourage you to share them with us. Your feedback helps us enhance the shopping experience for all GoCart customers.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Response Times</h2>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li><strong>Phone Support:</strong> Immediate during operating hours</li>
            <li><strong>Email Support:</strong> Within 24–48 business hours</li>
            <li><strong>General Inquiries:</strong> Within 1–2 business days</li>
          </ul>
          <p className="mt-3">Response times may vary during peak periods, holidays, promotional campaigns, or high-volume seasons.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Customer Satisfaction</h2>
          <p className="mt-3">At GoCart, customer satisfaction remains our top priority. We are dedicated to resolving concerns fairly, professionally, and promptly.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Thank You</h2>
          <p className="mt-3">Thank you for choosing GoCart. We appreciate your trust and look forward to serving you.</p>
          <p className="mt-3"><strong>GoCart</strong><br/>Location: Gujranwala, Punjab, Pakistan<br/>Helpline: 0300-XXXXXXX<br/>Email: support@gocart.pk<br/>Website: go-cart.com</p>
        </section>
      </div>
    </div>
  );
};

export default Contact;
