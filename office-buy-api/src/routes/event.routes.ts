import { Router } from "express";
import * as eventController from "../controllers/event.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", eventController.getEvents);
router.post("/", requireAuth, eventController.createEvent);
router.get("/:id", eventController.getEventById);
router.patch("/:id", requireAuth, eventController.updateEvent);
router.patch("/:id/status", requireAuth, eventController.updateEventStatus);
router.delete("/:id", requireAuth, eventController.deleteEvent);

export default router;
