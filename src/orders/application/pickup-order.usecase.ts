import { OrderRepository } from "../domain/ports/OrderRepositoryInterface";
import { OrderStatuses } from "../domain/entities/OrderStatusManager";
import { orderRepository } from "../infra/order-prisma.repo-adapter";
type Success = { success: true };
type Failure = { success: false; reason: string };
type UsecaseResponse = Success | Failure;

export class PickupOrderStatusUsecase {
  private orderRepository: OrderRepository;
  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }
  async execute(orderData: { id: string }): Promise<UsecaseResponse> {
    const order = await this.orderRepository.find(orderData.id);

    if (order.status === OrderStatuses.Completed) {
      return { success: false, reason: "Order is already completed" };
    }

    if (order.status !== OrderStatuses.ReadyForPickup) {
      return { success: false, reason: "Order is not ready for pickup" };
    }

    order.changeStatusTo(OrderStatuses.Completed);
    const result = await this.orderRepository.save(order);
    if (!result) {
      throw new Error("Failed to update order status");
    }
    return { success: true };
  }
}

export const pickupOrderStatusUsecase = new PickupOrderStatusUsecase(
  orderRepository
);