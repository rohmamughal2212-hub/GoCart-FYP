import React from "react";

const Refund = () => {
  return (
    <div className="mt-16 pb-16">
      <div className="mb-6">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#1B3A6B" }}>REFUND POLICY</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Refund Policy</h1>
        <p className="text-sm text-gray-500 mt-2">Effective Date: 14 June, 2026</p>
        <div className="mt-4 h-1 w-16 rounded-full" style={{ background: "#1B3A6B" }} />
      </div>

      <div className="space-y-6 text-gray-700">
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <p>At GoCart, customer satisfaction is important to us. If you are not completely satisfied with your purchase, please review our refund policy below.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Eligibility for Refunds</h3>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>The refund request is made on the same day of purchase or delivery.</li>
            <li>The product is unused, unopened, and in its original condition.</li>
            <li>The product is returned in its original packaging with all labels, tags, and accessories intact.</li>
            <li>The item shows no signs of damage, tampering, alteration, or misuse.</li>
            <li>A valid proof of purchase (receipt or order confirmation) is provided.</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Non-Refundable Items</h3>
          <p className="mt-3">Refunds will not be issued for:</p>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>Products that have been opened, used, consumed, or partially used.</li>
            <li>Items returned without original packaging.</li>
            <li>Products damaged due to customer handling or misuse.</li>
            <li>Perishable goods, fresh food items, or products with a short shelf life unless received in a damaged or defective condition.</li>
            <li>Clearance, promotional, or final-sale items where stated.</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Damaged or Incorrect Orders</h3>
          <p className="mt-3">If you receive a damaged, defective, or incorrect item, please contact our customer support team immediately on the day of delivery. We may request photos or additional information to verify the issue before processing a replacement or refund.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Refund Process</h3>
          <p className="mt-3">Once the returned item is inspected and approved, refunds will be processed using the original payment method whenever possible. Processing times may vary depending on your payment provider or bank. Customers will be notified once the refund has been approved and issued.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Right to Refuse Refund</h3>
          <p className="mt-3">GoCart reserves the right to refuse any refund request that does not meet the conditions outlined in this policy.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Contact Us</h3>
          <p className="mt-3"><strong>GoCart</strong><br/>Location: Gujranwala, Punjab, Pakistan<br/>Helpline: 0300-XXXXXXX<br/>Email: support@gocart.pk</p>
        </section>

        <p className="text-sm text-gray-600">By making a purchase from GoCart, you acknowledge and agree to this Refund Policy.</p>
      </div>
    </div>
  );
};

export default Refund;
