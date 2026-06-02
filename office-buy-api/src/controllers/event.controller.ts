import { Request, Response } from "express";
import * as eventService from "../services/event.service";
import { EventStatus } from "@prisma/client";

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await eventService.getEvents();
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }

  try {
    const event = await eventService.getEventById(id);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  const {
    title,
    description,
    orderDeadline,
    pickupTime,
    paymentInfo,
    products,
  } = req.body;

  if (!title || !orderDeadline) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const event = await eventService.createEvent(req.session.userId!, {
      title,
      description,
      orderDeadline: new Date(orderDeadline),
      pickupTime: pickupTime ? new Date(pickupTime) : undefined,
      paymentInfo,
      products,
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }

  try {
    const event = await eventService.getEventById(id);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    if (event.organizerId !== req.session.userId && !req.session.isAdmin) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const { title, description, orderDeadline, pickupTime, paymentInfo } =
      req.body;
    const updated = await eventService.updateEvent(id, {
      title,
      description,
      orderDeadline: orderDeadline ? new Date(orderDeadline) : undefined,
      pickupTime: pickupTime ? new Date(pickupTime) : undefined,
      paymentInfo,
    });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateEventStatus = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }

  const { status } = req.body;
  if (!status || !Object.values(EventStatus).includes(status)) {
    res.status(400).json({ message: "Invalid status" });
    return;
  }

  try {
    const event = await eventService.getEventById(id);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    if (event.organizerId !== req.session.userId && !req.session.isAdmin) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const updated = await eventService.updateEventStatus(id, status);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }

  try {
    const event = await eventService.getEventById(id);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    if (event.organizerId !== req.session.userId && !req.session.isAdmin) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    await eventService.deleteEvent(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
