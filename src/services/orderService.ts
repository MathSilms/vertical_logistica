import { findOrdersWithFilters } from "../repositories/orderRepository";
import { QueryFilters } from "../types/query.ds";
import { isValidDate } from "../utils/date";

export async function getOrders(filters: QueryFilters) {
  const { startDate, endDate, orderId } = filters;

  if (startDate && !isValidDate(startDate)) {
    throw new Error("Data de início inválida.");
  }

  if (endDate && !isValidDate(endDate)) {
    throw new Error("Data de fim inválida.");
  }

  if (startDate && endDate && startDate > endDate) {
    throw new Error("A data de início não pode ser maior que a data de fim.");
  }

  if (orderId && isNaN(Number(orderId))) {
    throw new Error("ID do pedido inválido.");
  }

  return findOrdersWithFilters(filters);
}