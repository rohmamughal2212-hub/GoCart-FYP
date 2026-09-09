const knowledgeEntries = [
  {
    keywords: ["order", "status", "my order", "order status"],
    answer:
      "For order status, please check the My Orders page once you are signed in. If you need help changing or cancelling an order, provide your order number and we can guide you further.",
  },
  {
    keywords: ["delivery", "deliver", "shipping", "track"],
    answer:
      "GoCart delivers within Gujranwala. Delivery details are shown in your order summary. If your delivery is delayed or incorrect, contact support with your order number and delivery address.",
  },
  {
    keywords: ["refund", "return", "exchange", "money back"],
    answer:
      "If you received a damaged, incorrect, or defective item, please contact support immediately. Our refund and return policy is available on the Refund page and our team can help you start the process.",
  },
  {
    keywords: ["payment", "pay", "card", "cash", "checkout"],
    answer:
      "GoCart supports secure online payment. If you have trouble paying or need help with a payment method, please tell me the exact issue and I will guide you.",
  },
  {
    keywords: ["product", "available", "stock", "availability", "category", "electronics", "sports", "grocery", "meat", "beauty", "kitchen", "garments", "baby"],
    answer:
      "You can browse product categories from the Products page. If you need a recommendation or want to know whether a specific item is in stock, ask me about the item name or category.",
  },
  {
    keywords: ["support", "help", "customer", "desk", "contact"],
    answer:
      "Our Customer Desk is ready to help with orders, delivery, payments, refunds, and general questions. You can also visit the Customer Desk or Contact pages for direct support details.",
  },
  {
    keywords: ["refund policy", "refunds", "return policy", "returns"],
    answer:
      "Refunds and returns are handled through our support process. If your item is damaged or not as described, please contact us with order details and we will help you start a refund or return.",
  },
  {
    keywords: ["privacy", "policy", "terms", "conditions", "safety"],
    answer:
      "You can review our Privacy Policy, Terms & Conditions, and Safety pages for detailed information about using GoCart. If you have a specific question, ask me and I will point you to the right information.",
  },
  {
    keywords: ["where", "deliver", "area", "location"],
    answer:
      "GoCart currently operates in Gujranwala, Punjab, Pakistan. For delivery service details, please check the delivery information on the Customer Desk or Contact pages.",
  },
  {
    keywords: ["order cancellation", "cancel", "cancel order"],
    answer:
      "If you want to cancel an order, contact our support team as soon as possible with your order number. Order cancellation requests are handled quickly when placed early.",
  },
];

const normalizeText = (text) => text.trim().toLowerCase();

const findBestAnswer = (question) => {
  const normalized = normalizeText(question);
  if (!normalized) {
    return "Please type your question and I will do my best to help you with GoCart support and website information.";
  }

  const scores = knowledgeEntries.map((entry) => {
    const score = entry.keywords.reduce((acc, keyword) => {
      if (normalized.includes(keyword)) {
        return acc + 1;
      }
      return acc;
    }, 0);
    return { entry, score };
  });

  const best = scores.reduce((bestSoFar, current) => {
    return current.score > bestSoFar.score ? current : bestSoFar;
  }, { entry: null, score: 0 });

  if (best.score > 0) {
    return best.entry.answer;
  }

  const fallback =
    "I could not find a direct answer in the website support content. Please ask about orders, delivery, payments, products, refunds, or contact support, and I will do my best to help.";

  return fallback;
};

export const handleSupportQuery = (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== "string") {
    return res.status(400).json({ success: false, message: "Please provide a valid question." });
  }

  const answer = findBestAnswer(question);
  return res.json({ success: true, answer });
};
