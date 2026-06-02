import { prisma } from "../lib/prisma";

export const createProduct = async (
  eventId: number,
  data: {
    name: string;
    price: number;
    description?: string;
  },
) => {
  return prisma.product.create({
    data: {
      eventId,
      name: data.name,
      price: data.price,
      description: data.description,
    },
  });
};

export const updateProduct = async (
  id: number,
  eventId: number,
  data: {
    name?: string;
    price?: number;
    description?: string;
    isAvailable?: boolean;
  },
) => {
  const product = await prisma.product.findUnique({ where: { id } });

  // 商品不存在 或 商品不屬於這個活動
  if (!product || product.eventId !== eventId) return null;

  return prisma.product.update({ where: { id }, data });
};
