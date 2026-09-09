import React from "react";

const Cancellation = () => {
  return (
    <div className="mt-16 pb-16">
      <div className="mb-6">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#1B3A6B" }}>CANCELLATION OPTION</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Cancellation Policy</h1>
        <p className="text-sm text-gray-500 mt-2">Last Updated: June 14, 2026</p>
        <div className="mt-4 h-1 w-16 rounded-full" style={{ background: "#1B3A6B" }} />
      </div>

      <div className="space-y-6 text-gray-700">
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <p>At GoCart, we understand that customers may occasionally need to cancel an order. This Cancellation Policy explains the conditions under which orders may be canceled and how refunds are processed for prepaid and Cash on Delivery (COD) orders.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Order Cancellation Before Dispatch</h2>
          <p className="mt-3">Customers may request order cancellation before the order has been processed, packed, or dispatched for delivery.</p>
          <p className="mt-3">If the cancellation request is approved before dispatch:</p>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>The order will be canceled without additional charges.</li>
            <li>Prepaid orders will be eligible for a full refund.</li>
            <li>COD orders will be canceled without any payment obligation.</li>
          </ul>
          <p className="mt-3">GoCart reserves the right to verify cancellation requests before approval.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Order Cancellation After Dispatch</h2>
          <p className="mt-3">Once an order has been packed, dispatched, or handed over for delivery, cancellation may no longer be possible.</p>
          <p className="mt-3">In such cases:</p>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>The customer may refuse delivery where permitted.</li>
            <li>Additional delivery or handling charges may apply if incurred.</li>
            <li>Refund eligibility will be subject to product condition and return verification.</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Prepaid Orders</h2>
          <p className="mt-3">Orders paid through online payment methods are considered prepaid orders.</p>
          <h3 className="text-base font-semibold mt-3">Refund Eligibility</h3>
          <p className="mt-3">If a prepaid order is successfully canceled before dispatch:</p>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>A full refund of the product amount will be processed.</li>
            <li>Refunds will be issued through the original payment method whenever possible.</li>
          </ul>
          <h3 className="text-base font-semibold mt-3">Refund Processing Time</h3>
          <p className="mt-3">Approved refunds may take approximately 5–10 business days to appear, depending on the customer's bank, payment provider, or financial institution.</p>
          <p className="mt-3">GoCart shall not be responsible for delays caused by third-party payment processors or banking systems.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Cash on Delivery (COD) Orders</h2>
          <p className="mt-3">Customers who select Cash on Delivery may cancel their orders before dispatch without any cancellation fee.</p>
          <p className="mt-3">However:</p>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>Repeated refusal of COD orders may result in restrictions on future COD purchases.</li>
            <li>GoCart reserves the right to limit or disable COD services for customers with a history of canceled or refused deliveries.</li>
            <li>Customers are encouraged to place COD orders only when genuinely intending to complete the purchase.</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Non-Cancellable Orders</h2>
          <p className="mt-3">Certain orders may not be eligible for cancellation, including:</p>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>Customized or special-order products.</li>
            <li>Perishable food items after processing.</li>
            <li>Fresh meat products after preparation or dispatch.</li>
            <li>Products specifically marked as non-cancellable.</li>
            <li>Orders already delivered to the customer.</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Cancellation by GoCart</h2>
          <p className="mt-3">GoCart reserves the right to cancel orders under certain circumstances, including but not limited to:</p>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>Product unavailability.</li>
            <li>Pricing or technical errors.</li>
            <li>Suspected fraudulent activity.</li>
            <li>Incomplete customer information.</li>
            <li>Payment verification issues.</li>
            <li>Circumstances beyond our operational control.</li>
          </ul>
          <p className="mt-3">If GoCart cancels a prepaid order, the customer will receive a full refund of the amount paid.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Failed Deliveries</h2>
          <p className="mt-3">Orders may be canceled if:</p>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>The customer is unavailable after reasonable delivery attempts.</li>
            <li>Incorrect delivery information is provided.</li>
            <li>The customer refuses to accept the order without valid reason.</li>
          </ul>
          <p className="mt-3">GoCart reserves the right to review future order eligibility in such cases.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">How to Request a Cancellation</h2>
          <p className="mt-3">To request an order cancellation, customers should contact GoCart Customer Support as soon as possible and provide:</p>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>Order Number</li>
            <li>Customer Name</li>
            <li>Contact Number</li>
            <li>Reason for Cancellation</li>
          </ul>
          <p className="mt-3">Cancellation requests are subject to review and approval based on the order status.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Contact Information</h2>
          <p className="mt-3"><strong>GoCart</strong><br/>Location: Gujranwala, Punjab, Pakistan<br/>Customer Helpline: 0300-XXXXXXX<br/>Customer Support Email: xxxxxxxxxxxxxxx<br/>Business Inquiries: xxxxxxxxxxxxxxxx</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Cancellation Commitment</h2>
          <p className="mt-3">At GoCart, we aim to provide a fair and transparent cancellation process for all customers. We encourage customers to review their orders carefully before placing them and to contact us promptly if cancellation is required.</p>
        </section>
      </div>
    </div>
  );
};

export default Cancellation;
