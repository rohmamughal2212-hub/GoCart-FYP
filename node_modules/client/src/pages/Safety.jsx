import React from "react";

const Safety = () => {
  return (
    <div className="mt-16 pb-16">
      <div className="mb-6">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#1B3A6B" }}>SAFETY INFORMATION</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Safety Information</h1>
        <p className="text-sm text-gray-500 mt-2">Last Updated: June 14, 2026</p>
        <div className="mt-4 h-1 w-16 rounded-full" style={{ background: "#1B3A6B" }} />
      </div>

      <div className="space-y-6 text-gray-700">
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <p>At GoCart, the safety and well-being of our customers are among our highest priorities. We are committed to providing quality products and maintaining responsible business practices to help ensure a safe shopping experience for all customers.</p>
          <p className="mt-3">Please read the following Safety Information carefully before purchasing, handling, or using any products available through GoCart.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">General Product Safety</h2>
          <p className="mt-3">Customers should always use products according to the manufacturer's instructions, warnings, and safety guidelines.</p>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>Read all labels and instructions carefully.</li>
            <li>Follow recommended usage guidelines.</li>
            <li>Keep products away from children when required.</li>
            <li>Store products according to manufacturer recommendations.</li>
            <li>Inspect products for visible damage before use.</li>
          </ul>
          <p className="mt-3">Improper use of products may result in injury, damage, or reduced product performance.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Electronics Safety</h2>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>Use only approved chargers and power adapters.</li>
            <li>Do not expose electronic products to water unless specifically designed for such use.</li>
            <li>Avoid overheating by ensuring proper ventilation.</li>
            <li>Keep electrical devices away from flammable materials.</li>
            <li>Disconnect damaged electrical products immediately.</li>
            <li>Do not attempt unauthorized repairs.</li>
          </ul>
          <p className="mt-3">If an electronic product becomes excessively hot, emits unusual odors, or shows signs of malfunction, discontinue use immediately and seek professional assistance.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Kitchen &amp; Household Products</h2>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>Follow manufacturer instructions.</li>
            <li>Use products only for their intended purpose.</li>
            <li>Keep sharp objects away from children.</li>
            <li>Inspect products regularly for wear and damage.</li>
            <li>Replace damaged items when necessary.</li>
          </ul>
          <p className="mt-3">Customers are responsible for safe handling and proper storage of household products.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Grocery &amp; Food Products</h2>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>Check expiration dates before consumption.</li>
            <li>Follow storage instructions on packaging.</li>
            <li>Refrigerate products when required.</li>
            <li>Do not consume products if packaging is damaged or compromised.</li>
            <li>Be aware of ingredient information and potential allergens.</li>
          </ul>
          <p className="mt-3">Customers with allergies or dietary restrictions should carefully review product labels before use.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Fresh Meat Products</h2>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>Refrigerate or freeze meat products promptly after purchase.</li>
            <li>Maintain appropriate storage temperatures.</li>
            <li>Avoid cross-contamination with other foods.</li>
            <li>Cook meat thoroughly according to food safety recommendations.</li>
            <li>Discard products that show signs of spoilage.</li>
          </ul>
          <p className="mt-3">GoCart recommends following local food safety guidelines for handling and preparation of meat products.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Beauty &amp; Personal Care Products</h2>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>Read ingredient lists carefully.</li>
            <li>Perform a patch test when appropriate.</li>
            <li>Discontinue use if irritation occurs.</li>
            <li>Avoid contact with eyes unless intended for such use.</li>
            <li>Keep products out of reach of children.</li>
          </ul>
          <p className="mt-3">Individuals with known sensitivities should consult a healthcare professional if necessary.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Baby &amp; Children's Products</h2>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>Adult supervision is recommended whenever applicable.</li>
            <li>Follow age recommendations provided by manufacturers.</li>
            <li>Inspect products regularly for damage or wear.</li>
            <li>Remove and replace damaged products immediately.</li>
            <li>Keep small parts away from young children to prevent choking hazards.</li>
          </ul>
          <p className="mt-3">Parents and guardians are responsible for ensuring safe product usage.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Sports &amp; Fitness Equipment</h2>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>Use proper protective equipment where required.</li>
            <li>Follow manufacturer safety instructions.</li>
            <li>Inspect equipment before each use.</li>
            <li>Do not use damaged equipment.</li>
            <li>Use products only within intended limits.</li>
          </ul>
          <p className="mt-3">Participation in physical activities carries inherent risks, and users assume responsibility for safe usage.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Product Recalls &amp; Safety Notices</h2>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>GoCart may remove affected products from sale.</li>
            <li>Customers may be notified when reasonably possible.</li>
            <li>Additional instructions may be provided regarding returns or replacements.</li>
          </ul>
          <p className="mt-3">Customers are encouraged to follow all recall instructions issued by manufacturers.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Customer Responsibility</h2>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>Use products safely and responsibly.</li>
            <li>Read product instructions before use.</li>
            <li>Follow safety warnings and recommendations.</li>
            <li>Ensure products are suitable for their intended use.</li>
            <li>Supervise children when using age-sensitive products.</li>
          </ul>
          <p className="mt-3">Failure to follow product instructions may increase the risk of injury or damage.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Limitation of Responsibility</h2>
          <p className="mt-3">GoCart acts as a retailer and distributor of products supplied by manufacturers and vendors. While we strive to offer quality products, GoCart cannot guarantee product suitability for every individual circumstance, safe usage when manufacturer instructions are ignored, or protection from misuse, negligence, or improper handling.</p>
          <p className="mt-3">Customers are responsible for evaluating product suitability before purchase and use.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Reporting Safety Concerns</h2>
          <p className="mt-3">If you believe a product purchased from GoCart presents a safety concern, please contact our customer support team immediately. Providing details such as product name, order information, description of the issue, and supporting photographs (if available) will help us investigate the matter promptly.</p>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Contact Information</h2>
          <p className="mt-3"><strong>GoCart</strong><br/>Location: Gujranwala, Punjab, Pakistan<br/>Branch Network: Currently Operating in Gujranwala Only<br/>Customer Helpline: 0300-XXXXXXX<br/>Customer Support Email: xxxxxxxxxxxxxxx<br/>Business Inquiries: xxxxxxxxxxxxxxxx</p>
        </section>

        <p className="text-sm text-gray-600">At GoCart, we are committed to maintaining a safe and responsible shopping environment. We encourage all customers to use products responsibly, follow manufacturer guidelines, and contact us whenever assistance or safety-related information is needed.</p>
      </div>
    </div>
  );
};

export default Safety;
