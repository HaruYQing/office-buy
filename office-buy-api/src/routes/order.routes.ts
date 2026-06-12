import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, orderController.getOrders);
router.post("/", requireAuth, orderController.createOrder);
// 靜態路徑 /me 和 /export 必須在動態路徑 /:oid 之前註冊
router.get("/me", requireAuth, orderController.getMyOrder);
router.get("/export", requireAuth, orderController.exportOrders);
router.get("/:oid", requireAuth, orderController.getOrderById);
router.patch("/:oid", requireAuth, orderController.updateOrder);
router.patch("/:oid/status", requireAuth, orderController.updateOrderStatus);

export default router;
