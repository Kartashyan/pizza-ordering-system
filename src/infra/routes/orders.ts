import { Router } from "express";
import { createOrderController } from "../../order-service/infra/CreateOrderController";
import { pickupOrderController } from "../../order-service/infra/PickupOrderController";
import { DomainEvents } from "../../shared/DomainEvents";
import { OrderReadyEvent } from "../../order-service/domain/events/OrderReadyEvent";
const router = Router();

DomainEvents.subscribeToEvent(
  OrderReadyEvent.eventName,
  (payload: { orderId: string }) => {
    console.log("Order ready for pickup", payload);
  }
);

router.get("/", (req, res) => {});

router.post("/", async (req, res) => createOrderController.execute(req, res));

router.get("/:orderId", (req, res) => {});

router.get("/:orderId/pickup", async (req, res) =>
  pickupOrderController.execute(req, res)
);

router.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  DomainEvents.subscribeToEvent(
    OrderReadyEvent.eventName,
    (payload: string) => {
      console.log("Order created", payload);
      // send a nodification to the kitchen (server sent events)
      res.write(`data: ${JSON.stringify(payload)}`);
    }
  );
});

export default router;