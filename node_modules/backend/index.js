import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/connectDB.js";
import { connectCloudinary } from "./config/cloudinary.js";

import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import addressRoutes from "./routes/address.routes.js";
import orderRoutes from "./routes/order.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import supportRoutes from "./routes/support.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

await connectDB();

try {
  await connectCloudinary();
} catch (error) {
  console.warn("Warning: Cloudinary connection failed. Continuing without Cloudinary.");
  console.warn(error);
}

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "https://grocery-fyp.vercel.app",
  "https://gocart-co.vercel.app",
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .map((origin) => origin.replace(/"/g, ""));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: Origin ${origin} not allowed`));
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));
// Note: avoid calling app.options with a wildcard path like "/*" because
// certain versions of path-to-regexp used by Express may parse "*" as a
// wildcard parameter name and throw. Default preflight handling is enabled
// by the `cors` middleware above, so no explicit app.options call is needed.
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
  res.redirect('https://gocart-frontend.vercel.app');
});

// Minimal request logger (production-safe)
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    console.info(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Handle JSON parse errors from express.json()
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    console.warn('JSON parse error:', err.message);
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
  }
  next(err);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running', uptime: process.uptime() });
});

const mount = (pathStr, handler) => {
  try {
    console.log(`Mounting ${pathStr}`);
    app.use(pathStr, handler);
    console.log(`Mounted ${pathStr}`);
  } catch (err) {
    console.error(`Error mounting ${pathStr}:`, err);
    throw err;
  }
};

// Mount routers one-by-one during debugging. Start with userRoutes.
try {
  console.log('Mounting /api/user');
  app.use('/api/user', userRoutes);
  console.log('Mounted /api/user');
} catch (err) {
  console.error('Error mounting /api/user', err);
}

// Uncomment and mount additional routers after verifying /api/user
const routers = [
  ['/api/admin', adminRoutes],
  ['/api/product', productRoutes],
  ['/api/cart', cartRoutes],
  ['/api/address', addressRoutes],
  ['/api/order', orderRoutes],
  ['/api/review', reviewRoutes],
  ['/api/coupon', couponRoutes],
  ['/api/newsletter', newsletterRoutes],
  ['/api/support', supportRoutes],
];
for (const [pathStr, router] of routers) {
  try {
    console.log(`Mounting ${pathStr}`);
    app.use(pathStr, router);
    console.log(`Mounted ${pathStr}`);
  } catch (err) {
    console.error(`Error mounting ${pathStr}:`, err);
  }
}

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
