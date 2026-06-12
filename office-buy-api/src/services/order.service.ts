import { prisma } from "../lib/prisma";
import { PaymentStatus, PickupStatus } from "@prisma/client";

const orderInclude = {
  participant: { select: { id: true, displayName: true } },
  items: {
    include: {
      product: { select: { id: true, name: true } },
    },
  },
} as const;

export const getOrdersByEventId = async (eventId: number) => {
  return prisma.order.findMany({
    where: { eventId },
    include: orderInclude,
    orderBy: { createdAt: "asc" },
  });
};

export const getOrderById = async (id: number) => {
  return prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });
};

export const createOrder = async (
  eventId: number,
  participantId: number,
  data: {
    note?: string;
    items: { productId: number; quantity: number }[];
  },
) => {
  const products = await prisma.product.findMany({
    where: {
      id: { in: data.items.map((i) => i.productId) },
      eventId,
      isAvailable: true,
    },
  });

  if (products.length !== data.items.length) return null;

  const productMap = new Map(products.map((p) => [p.id, p]));

  return prisma.order.create({
    data: {
      eventId,
      participantId,
      note: data.note,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceSnapshot: productMap.get(item.productId)!.price,
        })),
      },
    },
    include: orderInclude,
  });
};

export const getMyOrder = async (eventId: number, participantId: number) => {
  return prisma.order.findFirst({
    where: { eventId, participantId },
    include: orderInclude,
  });
};

export const updateOrder = async (
  id: number,
  eventId: number,
  data: {
    note?: string;
    items?: { productId: number; quantity: number }[];
  },
) => {
  if (!data.items) {
    return prisma.order.update({
      where: { id },
      data: { note: data.note },
      include: orderInclude,
    });
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: data.items.map((i) => i.productId) },
      eventId,
      isAvailable: true,
    },
  });

  if (products.length !== data.items.length) return null;

  const productMap = new Map(products.map((p) => [p.id, p]));

  return prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany({ where: { orderId: id } });
    return tx.order.update({
      where: { id },
      data: {
        note: data.note,
        items: {
          create: data.items!.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceSnapshot: productMap.get(item.productId)!.price,
          })),
        },
      },
      include: orderInclude,
    });
  });
};

export const updateOrderStatus = async (
  id: number,
  data: {
    paymentStatus?: PaymentStatus;
    pickupStatus?: PickupStatus;
  },
) => {
  return prisma.order.update({
    where: { id },
    data,
    include: orderInclude,
  });
};

export const exportOrdersAsCsv = async (eventId: number) => {
  const orders = await prisma.order.findMany({
    where: { eventId },
    include: {
      participant: { select: { displayName: true } },
      items: {
        include: { product: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

  const header =
    "訂單ID,參加者名稱,商品名稱,數量,單價,小計,付款狀態,取貨狀態,備註";

  const rows = orders.flatMap((order) =>
    order.items.map((item) =>
      [
        order.id,
        order.participant.displayName,
        item.product.name,
        item.quantity,
        item.priceSnapshot / 100, // 單位由「分」轉為「元」
        (item.quantity * item.priceSnapshot) / 100, // 單位由「分」轉為「元」
        order.paymentStatus,
        order.pickupStatus,
        order.note ?? "",
      ]
        .map(escape)
        .join(","),
    ),
  );

  return [header, ...rows].join("\n");
};
