import { prisma } from "../lib/prisma";
import { EventStatus } from "@prisma/client";

export const getEvents = async () => {
  return prisma.event.findMany({
    where: { status: EventStatus.OPEN },
    include: {
      organizer: {
        select: { id: true, displayName: true },
      },
      _count: {
        select: { orders: true },
      },
    },
    orderBy: { orderDeadline: "asc" },
  });
};

export const getEventById = async (id: number) => {
  return prisma.event.findUnique({
    where: { id },
    include: {
      organizer: {
        select: { id: true, displayName: true },
      },
      products: {
        where: { isAvailable: true },
        orderBy: { id: "asc" },
      },
    },
  });
};

export const createEvent = async (
  organizerId: number,
  data: {
    title: string;
    description?: string;
    orderDeadline: Date;
    pickupTime?: Date;
    paymentInfo?: string;
    products?: { name: string; price: number; description?: string }[];
  },
) => {
  return prisma.event.create({
    data: {
      organizerId,
      title: data.title,
      description: data.description,
      orderDeadline: data.orderDeadline,
      pickupTime: data.pickupTime,
      paymentInfo: data.paymentInfo,
      products: data.products ? { create: data.products } : undefined,
    },
    include: {
      products: true,
    },
  });
};

export const updateEvent = async (
  id: number,
  data: {
    title?: string;
    description?: string;
    orderDeadline?: Date;
    pickupTime?: Date;
    paymentInfo?: string;
  },
) => {
  return prisma.event.update({
    where: { id },
    data,
  });
};

export const updateEventStatus = async (id: number, status: EventStatus) => {
  return prisma.event.update({
    where: { id },
    data: { status },
  });
};

export const deleteEvent = async (id: number) => {
  return prisma.event.delete({
    where: { id },
  });
};
