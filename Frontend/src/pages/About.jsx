import React from "react";

const About = () => {
  return (
    <div className="mt-16 pb-16">
      <div className="mb-6">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#1B3A6B" }}>WELCOME</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Welcome to GoCart</h1>
        <p className="text-sm text-gray-500 mt-2">Your Trusted Family Shopping Destination in Gujranwala</p>
        <div className="mt-4 h-1 w-16 rounded-full" style={{ background: "#1B3A6B" }} />
      </div>

      <div className="space-y-10 text-gray-700">
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">What We Offer</h2>
          <p className="mt-3 text-gray-600">We provide a wide selection of products chosen for quality, affordability, and convenience.</p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <ul className="list-disc pl-5 space-y-1">
              <li>Electronics &amp; Gadgets</li>
              <li>Sports &amp; Fitness Products</li>
              <li>Grocery &amp; Daily Essentials</li>
              <li>Fresh &amp; Quality Meat Products</li>
            </ul>
            <ul className="list-disc pl-5 space-y-1">
              <li>Beauty &amp; Personal Care</li>
              <li>Kitchen &amp; Home Essentials</li>
              <li>Garments &amp; Fashion Wear</li>
              <li>Baby Care &amp; Kids Products</li>
            </ul>
          </div>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Why Choose GoCart?</h2>
          <p className="mt-3 text-gray-600">Trusted by local families for everyday shopping needs.</p>
          <ul className="mt-4 grid md:grid-cols-2 gap-2 list-inside text-gray-700">
            <li>✔ Wide Range of Quality Products</li>
            <li>✔ Competitive &amp; Affordable Prices</li>
            <li>✔ Convenient Shopping Experience</li>
            <li>✔ Customer-Focused Service</li>
            <li>✔ Reliable Product Availability</li>
            <li>✔ Family-Friendly Shopping Environment</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Our Commitment</h2>
          <p className="mt-3 text-gray-600">At GoCart, we aim to make shopping seamless and trustworthy. Our team maintains high standards for product selection, pricing, and customer service to ensure a great experience for every household.</p>
          <p className="mt-4 text-gray-600">Under the supervision of the <strong>GoCart Board of Directors</strong>, we continuously work to uphold retail excellence and service integrity.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Location &amp; Contact Information</h2>
          <p className="mt-3 text-gray-700"><strong>GoCart – Gujranwala, Punjab, Pakistan</strong></p>
          <p className="mt-2 text-gray-600">Branch Network: Currently serving customers through our exclusive Gujranwala branch.</p>
          <p className="mt-2 text-gray-600">Customer Helpline: <strong>0300-XXXXXXX</strong></p>
        </section>

        <p className="mt-6 font-semibold text-gray-800">GoCart — Making Family Shopping Easier, Smarter &amp; More Convenient Every Day.</p>
      </div>
    </div>
  );
};

export default About;
