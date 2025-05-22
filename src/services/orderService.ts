import { findOrdersWithFilters } from "../repositories/orderRepository";
import { QueryFilters } from "../types/query.d";
import { isValidDate } from "../utils/date";

export async function getOrders(filters: QueryFilters) {
  const { startDate, endDate, orderId } = filters;

  if (startDate && !isValidDate(startDate)) {
    throw new Error("Invalid start date.");
  }

  if (endDate && !isValidDate(endDate)) {
    throw new Error("Invalid end date.");
  }

  if (startDate && endDate && startDate > endDate) {
    throw new Error("The start date cannot be greater than the end date.");
  }

  if (orderId && isNaN(Number(orderId))) {
    throw new Error("Invalid order ID.");
  }

  return findOrdersWithFilters(filters);
}