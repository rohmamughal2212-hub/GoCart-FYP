import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAppContext } from "../context/AppContext";
import { categories as CATEGORY_LIST } from "../assets/assets";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.replace(/^"|"$/g, "") || "http://127.0.0.1:5000";

// Featured categories from home page - matching actual product categories in localProducts database
const FEATURED_CATEGORIES = [
  "Electronics",
  "Sports",
  "Grocery",
  "Meat",
  "Beauty",
  "Kitchen",
  "Garments",
  "Baby Items",
];

const initialMessages = [];

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expectingPage, setExpectingPage] = useState(false);
  const [initialPromptPending, setInitialPromptPending] = useState(false);
  const { user, navigate, setSearchQuery, products } = useAppContext();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // When chat opens, send a friendly personalized greeting once
  useEffect(() => {
    if (!open) return;
    if (messages.length > 0) return;
    const name = user?.name || null;
    const greeting = name
      ? `Hi ${name}! How are you? How may I help you today?`
      : "Hi! How are you? How may I help you today?";
    const followUp = "Would you like me to open a specific page for you? Please reply 'yes' or 'no'.";
    setMessages([{ sender: "bot", text: greeting }, { sender: "bot", text: followUp }]);
    setInitialPromptPending(true);
  }, [open]);

  const sendQuestion = async (question) => {
    const userMessage = { sender: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    // simple page-open flow handling
    const lc = question.toLowerCase();

    // If initial yes/no follow-up is pending, require yes/no first
    if (initialPromptPending) {
      if (/^\s*yes\s*$/.test(lc) || /^\s*y(es)?[,!.]*/.test(lc)) {
        setInitialPromptPending(false);
        setMessages((prev) => [...prev, { sender: "bot", text: "Sure — which page would you like me to open? (e.g. orders, cart, profile, wishlist, products, contact)" }] );
        setExpectingPage(true);
        setLoading(false);
        return;
      }

      if (/^\s*no\s*$/.test(lc) || /^\s*n(oi)?[,!.]*/.test(lc)) {
        setInitialPromptPending(false);
        setMessages((prev) => [...prev, { sender: "bot", text: "You can find anything on this website — just tell me what you need and I'll help (products, pages, categories)." }]);
        setLoading(false);
        return;
      }

      // Not a yes/no answer — ask again
      setMessages((prev) => [...prev, { sender: "bot", text: "Please reply with 'yes' or 'no' so I can help you open a page." }]);
      setLoading(false);
      return;
    }

    // If we previously asked for which page to open
    if (expectingPage) {
      handleOpenPageByText(question);
      setExpectingPage(false);
      setLoading(false);
      return;
    }

    // direct commands: user typed e.g. "open my orders" or "go to cart"
    if (/(open|go to|goto|show|take me to)\s+/.test(lc) || /^(orders|order|cart|profile|wishlist|products|contact|home)\b/.test(lc)) {
      const opened = handleOpenPageByText(question);
      if (opened) {
        setLoading(false);
        return;
      }
      // if command not recognized, fall through to backend
    }

    // product name suggestion: if user typed product-like query, suggest matches
    const suggestMatches = () => {
      let q = question.trim().toLowerCase().replace(/[^a-z0-9\s]/g, "");
      
      // Extract search term from intent phrases: "i want X", "where is X", "show me X", etc.
      const intentMatch = question.toLowerCase().match(/(i want|want|looking for|where is|show me|find|search for|do you have|need)\s+(.+)/i);
      if (intentMatch && intentMatch[2]) {
        q = intentMatch[2].trim().toLowerCase().replace(/[^a-z0-9\s]/g, "");
      }
      
      if (!q || q.length < 2 || !Array.isArray(products) || products.length === 0) return { directMatches: [], categoryMatches: [], searchQuery: q };
      
      // simple singular handling: strip trailing 's' for short plural forms
      const qVariants = [q];
      if (q.endsWith("s") && q.length > 2) qVariants.push(q.slice(0, -1));

      const directMatches = [];
      const categoryMatches = [];
      
      for (const p of products) {
        // Skip unavailable products
        if (p.name === "Eggs 12 pcs" || p.name === "Amul Milk 1L") continue;

        // Only show products from featured categories
        if (!FEATURED_CATEGORIES.includes(p.category)) continue;

        const name = (p.name || "").toLowerCase();
        const nameClean = name.replace(/[^a-z0-9\s]/g, "");
        const category = ((p.category || "") + "").toLowerCase();
        const desc = (Array.isArray(p.description) ? p.description.join(' ') : (p.description || '')).toLowerCase();
        const descClean = desc.replace(/[^a-z0-9\s]/g, "");

        // Check for direct name/description matches
        const matched = qVariants.some(v => {
          const queryWords = v.split(/\s+/);
          const allWordsInName = queryWords.every(qw => nameClean.includes(qw));
          const allWordsInDesc = queryWords.every(qw => descClean.includes(qw));
          return allWordsInName || allWordsInDesc;
        });

        // Check for category matches (if no direct name match, but search term relates to category)
        const categoryMatched = qVariants.some(v => {
          const queryWords = v.split(/\s+/);
          return queryWords.every(qw => category.includes(qw));
        });

        if (matched) {
          directMatches.push(p);
        } else if (categoryMatched) {
          categoryMatches.push(p);
        }
      }
      
      return { directMatches, categoryMatches, searchQuery: q };
    };

    const { directMatches, categoryMatches, searchQuery } = suggestMatches();
    const allMatches = [...directMatches, ...categoryMatches];
    const intentRegex = /(i want|want|looking for|where is|show me|find|search for|do you have|need)\s+/i;
    
    if (allMatches && allMatches.length > 0) {
      // show suggestions with actions
      let suggestionText = "";
      if (directMatches.length > 0) {
        suggestionText = directMatches.length === 1
          ? `Found this product:`
          : `I found ${directMatches.length} matching products:`;
      } else if (categoryMatches.length > 0) {
        suggestionText = `We don't have that exact product, but here are other ${searchQuery} items from our categories:`;
      }
      
      const limited = allMatches.slice(0, 6).map(p => ({ id: p._id, name: p.name, category: p.category }));
      // add a 'show all' option at the top
      const suggestionsArr = [{ id: "SHOW_ALL", name: "Show all matching products", query: question }, ...limited];
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: suggestionText, suggestions: suggestionsArr }
      ]);
      setLoading(false);
      return;
    }

    // If user expresses intent to find something but no matches found, reply clearly
    if ((!allMatches || allMatches.length === 0) && intentRegex.test(question)) {
      const searchTerm = question.toLowerCase().match(/(i want|want|looking for|where is|show me|find|search for|do you have|need)\s+(.+)/i)?.[2] || "this product";
      setMessages((prev) => [...prev, { sender: "bot", text: `Sorry, ${searchTerm} is not available right now. Try searching for something else or let me know if you need any other help!` }]);
      setLoading(false);
      return;
    }

    // if user answered yes/no to the follow-up
    if (/^\s*yes\s*$/.test(lc) || /^\s*y(es)?[,!.]*/.test(lc)) {
      // prompt for which page
      setMessages((prev) => [...prev, { sender: "bot", text: "Sure — which page would you like me to open? (e.g. orders, cart, profile, wishlist, products, contact)" }]);
      setExpectingPage(true);
      setLoading(false);
      return;
    }

    if (/^\s*no\s*$/.test(lc) || /^\s*n(oi)?[,!.]*/.test(lc)) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Alright — I'm here if you need any help. Ask me anything!" }]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/support/query`, { question });
      const botText = response.data?.answer || "Sorry, I couldn't find an answer right now.";
      setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Something went wrong while fetching the answer. Please try again or visit the Contact page.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (productId) => {
    const p = products.find((x) => x._id === productId);
    if (!p) return;
    const category = encodeURIComponent((p.category || "").toString());
    const path = `/product/${category}/${p._id}`;
    setMessages((prev) => [...prev, { sender: "bot", text: `Opening product: ${p.name}` }]);
    try { navigate(path); } catch (e) {}
  };

  const handleShowAllMatches = (query) => {
    const q = (query || "").trim();
    if (!q) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Opening all products." }]);
      try { navigate("/products"); } catch (e) {}
      return;
    }
    setMessages((prev) => [...prev, { sender: "bot", text: `Showing all products matching "${q}".` }]);
    try { setSearchQuery(q); navigate("/products"); } catch (e) {}
  };

  const handleOpenPageByText = (text) => {
    const lc = text.toLowerCase();
    // direct mappings
    const mapping = [
      { keys: ["orders", "my orders", "order"], path: "/my-orders" },
      { keys: ["cart"], path: "/cart" },
      { keys: ["profile", "account", "my account"], path: "/profile" },
      { keys: ["wishlist", "favourites", "favorites"], path: "/wishlist" },
      { keys: ["products", "product", "shop", "all products", "all items"], path: "/products" },
      { keys: ["contact"], path: "/contact" },
      { keys: ["home", "main"], path: "/" },
    ];

    for (const m of mapping) {
      for (const k of m.keys) {
        if (lc.includes(k)) {
          setMessages((prev) => [...prev, { sender: "bot", text: `Opening ${m.path === "/" ? "home" : k} for you now.` }]);
          try { navigate(m.path); } catch (e) {}
          return true;
        }
      }
    }

    // category matching
    for (const cat of CATEGORY_LIST) {
      const t = (cat.text || "").toLowerCase();
      const p = (cat.path || "").toLowerCase();
      if (lc.includes(t) || lc.includes(p)) {
        const target = `/products/${p}`;
        setMessages((prev) => [...prev, { sender: "bot", text: `Opening ${cat.text} category for you.` }]);
        try { navigate(target); } catch (e) {}
        return true;
      }
    }

    // search / find commands: "search for iphone" or "find wireless headphones"
    const searchMatch = lc.match(/(?:search for|find|show me|search|look for)\s+(.+)/);
    if (searchMatch) {
      const query = searchMatch[1].trim();
      setMessages((prev) => [...prev, { sender: "bot", text: `Searching products for "${query}" and opening products list.` }]);
      try { setSearchQuery(query); navigate("/products"); } catch (e) {}
      return true;
    }

    // trending / featured
    if (lc.includes("trending") || lc.includes("trending products") || lc.includes("best sellers") || lc.includes("popular")) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Opening products — showing trending/featured items." }]);
      try { navigate("/products"); } catch (e) {}
      return true;
    }

    // not matched
    setMessages((prev) => [...prev, { sender: "bot", text: "Sorry, I couldn't recognise that page or filter. Try: orders, cart, profile, wishlist, products, a category name, or 'search for <term>'." }]);
    setExpectingPage(true);
    return false;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    sendQuestion(trimmed);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className="flex flex-col items-end gap-2">
        {open && (
          <div className="w-[320px] max-w-full rounded-3xl border border-slate-300/20 bg-white/95 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between rounded-t-3xl bg-slate-950 px-4 py-3 text-white">
              <div>
                <p className="text-sm font-semibold">GoCart Assistant</p>
                <p className="text-xs text-slate-300">Ask me anything about GoCart.</p>
              </div>
              <button
                className="text-slate-300 hover:text-white"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
            <div className="max-h-[420px] overflow-y-auto px-4 py-3 space-y-3 text-sm text-slate-900">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`rounded-2xl px-3 py-2 ${message.sender === "bot" ? "bg-slate-100 text-slate-900 self-start" : "bg-slate-900 text-white self-end"}`}
                >
                  <div>{message.text}</div>
                  {message.suggestions && Array.isArray(message.suggestions) && (
                    <div className="mt-2 flex flex-col gap-2">
                      {message.suggestions.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => s.id === "SHOW_ALL" ? handleShowAllMatches(s.query) : handleSuggestionClick(s.id)}
                          className="text-left px-3 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-xs"
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSubmit} className="border-t border-slate-200 px-4 py-3 bg-white rounded-b-3xl">
              <label htmlFor="chatbot-input" className="sr-only">Type your question</label>
              <div className="flex gap-2">
                <input
                  id="chatbot-input"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  className="flex-1 rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="Ask about orders, delivery, returns..."
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        )}

        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-xl transition hover:bg-slate-800"
          aria-label="Open chat"
        >
          <span className="text-xl">💬</span>
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
