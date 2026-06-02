import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { requireAuth } from "../middlewares/auth.middleware";

// Product routes 會被掛在 /api/events/:id/products 底下
// 因此 :id 是定義在父路由（event routes）的參數
// 預設情況下子路由存取不到父路由的參數
// req.params.id 在 product controller 裡會是 undefined
// { mergeParams: true } 就是告訴 Express：把父路由的參數合併進來
// 讓 product controller 可以用 req.params.id 拿到活動 ID
const router = Router({ mergeParams: true });

router.post("/", requireAuth, productController.createProduct);
router.patch("/:pid", requireAuth, productController.updateProduct);

export default router;
