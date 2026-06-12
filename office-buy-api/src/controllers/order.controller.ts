import { Request, Response } from "express";
import * as orderService from "../services/order.service";
import * as eventService from "../services/event.service";
import { EventStatus, PaymentStatus, PickupStatus } from "@prisma/client";

export const getOrders = async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.id);

  if (isNaN(eventId)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }

  try {
    const event = await eventService.getEventById(eventId);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    if (event.organizerId !== req.session.userId && !req.session.isAdmin) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const orders = await orderService.getOrdersByEventId(eventId);
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.id);
  const orderId = parseInt(req.params.oid);

  if (isNaN(eventId) || isNaN(orderId)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  try {
    const event = await eventService.getEventById(eventId);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    if (event.organizerId !== req.session.userId && !req.session.isAdmin) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const order = await orderService.getOrderById(orderId);
    if (!order || order.eventId !== eventId) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.id);

  if (isNaN(eventId)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }

  const { note, items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const event = await eventService.getEventById(eventId);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    if (event.status !== EventStatus.OPEN) {
      res.status(409).json({ message: "Event is not open" });
      return;
    }

    const order = await orderService.createOrder(eventId, req.session.userId!, {
      note,
      items,
    });

    if (!order) {
      res
        .status(400)
        .json({ message: "Some products are unavailable or not found" });
      return;
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyOrder = async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.id);

  if (isNaN(eventId)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }

  try {
    const order = await orderService.getMyOrder(eventId, req.session.userId!);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.id);
  const orderId = parseInt(req.params.oid);

  if (isNaN(eventId) || isNaN(orderId)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  try {
    const event = await eventService.getEventById(eventId);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    if (event.status !== EventStatus.OPEN) {
      res.status(409).json({ message: "Event is not open" });
      return;
    }

    const existing = await orderService.getOrderById(orderId);
    if (!existing || existing.eventId !== eventId) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    if (existing.participantId !== req.session.userId) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const { note, items } = req.body;
    const order = await orderService.updateOrder(orderId, eventId, {
      note,
      items,
    });

    if (!order) {
      res
        .status(400)
        .json({ message: "Some products are unavailable or not found" });
      return;
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.id);
  const orderId = parseInt(req.params.oid);

  if (isNaN(eventId) || isNaN(orderId)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  const { paymentStatus, pickupStatus } = req.body;

  if (!paymentStatus && !pickupStatus) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  if (paymentStatus && !Object.values(PaymentStatus).includes(paymentStatus)) {
    res.status(400).json({ message: "Invalid paymentStatus" });
    return;
  }

  if (pickupStatus && !Object.values(PickupStatus).includes(pickupStatus)) {
    res.status(400).json({ message: "Invalid pickupStatus" });
    return;
  }

  try {
    const event = await eventService.getEventById(eventId);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    if (event.organizerId !== req.session.userId && !req.session.isAdmin) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const existing = await orderService.getOrderById(orderId);
    if (!existing || existing.eventId !== eventId) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    const order = await orderService.updateOrderStatus(orderId, {
      paymentStatus,
      pickupStatus,
    });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const exportOrders = async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.id);

  if (isNaN(eventId)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }

  try {
    const event = await eventService.getEventById(eventId);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    if (event.organizerId !== req.session.userId && !req.session.isAdmin) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const csv = await orderService.exportOrdersAsCsv(eventId);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="orders-${eventId}.csv"`,
    );
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
