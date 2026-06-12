import express from "express";
import session from "express-session";
import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/event.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7天
    },
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/events/:id/products", productRoutes);
app.use("/api/events/:id/orders", orderRoutes);

app.get("/", (req, res) => {
  res.json({ message: "office-buy-api is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
