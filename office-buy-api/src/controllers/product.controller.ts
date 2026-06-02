import { Request, Response } from "express";
import * as productService from "../services/product.service";
import * as eventService from "../services/event.service";
import { EventStatus } from "@prisma/client";

export const createProduct = async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.id);

  if (isNaN(eventId)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }

  const { name, price, description } = req.body;

  if (!name || price === undefined) {
    res.status(400).json({ message: "Missing required fields" });
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

    if (event.status !== EventStatus.OPEN) {
      res.status(409).json({ message: "Event is not open" });
      return;
    }

    const product = await productService.createProduct(eventId, {
      name,
      price,
      description,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.id);
  const productId = parseInt(req.params.pid);

  if (isNaN(eventId) || isNaN(productId)) {
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

    if (event.status !== EventStatus.OPEN) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const { name, price, description, isAvailable } = req.body;
    const product = await productService.updateProduct(productId, eventId, {
      name,
      price,
      description,
      isAvailable,
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
