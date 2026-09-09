import React from "react";

const Careers = () => {
  return (
    <div className="mt-16 pb-16">
      <div className="mb-6">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#1B3A6B" }}>CAREERS</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Join the GoCart Team</h1>
        <p className="text-sm text-gray-500 mt-2">Explore current opportunities and join our growing family in Gujranwala</p>
        <div className="mt-4 h-1 w-16 rounded-full" style={{ background: "#1B3A6B" }} />
      </div>

      <div className="space-y-10 text-gray-700">
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">No Vacancies Available at This Time</h2>
          <p className="mt-3 text-gray-600">Thank you for your interest in joining the GoCart team.</p>
          <p className="mt-3 text-gray-600">Currently, there are <strong>no active job openings available</strong>. However, as GoCart continues to grow and expand its operations, new employment opportunities will be announced on this page. We encourage interested candidates to visit this section regularly for future career opportunities.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Future Opportunities May Include</h2>
          <div className="mt-4 grid md:grid-cols-2 gap-2">
            <ul className="list-disc pl-5 space-y-1">
              <li>Store Managers</li>
              <li>Cashiers</li>
              <li>Customer Service Representatives</li>
              <li>Sales Associates</li>
            </ul>
            <ul className="list-disc pl-5 space-y-1">
              <li>Inventory &amp; Warehouse Staff</li>
              <li>Delivery Personnel</li>
              <li>Marketing Executives</li>
              <li>Administrative Staff</li>
            </ul>
          </div>
          <p className="mt-3 text-sm text-gray-500">Please note that the above positions are indicative only and may vary based on business requirements.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Join Our Talent Pool</h2>
          <p className="mt-3 text-gray-600">If you would like to be considered for future opportunities, you may submit your resume once recruitment opens. Our hiring team will review applications for relevant positions as vacancies become available.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Location &amp; Employment Type</h2>
          <p className="mt-3 text-gray-700"><strong>GoCart — Gujranwala, Punjab, Pakistan</strong></p>
          <p className="mt-2 text-gray-600">Employment Type: Full-Time | Part-Time | Contract Positions (as announced)</p>
        </section>

        <p className="mt-6 font-semibold text-gray-800">Grow Your Career With GoCart — We are committed to building a talented team that helps shape the future of modern retail in Gujranwala. Stay connected for upcoming career opportunities.</p>
      </div>
    </div>
  );
};

export default Careers;
