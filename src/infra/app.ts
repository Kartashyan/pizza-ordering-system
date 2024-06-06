import express from "express";
import bodyParser from "body-parser";

import ordersRouter from "./routes/orders";
import menuRouter from "./routes/menu";
import kitchenRouter from "./routes/kitchen";
import { PrismaClient } from "@prisma/client";
import { kitchenQueue } from "../order-service/infra/KitchenQueue";
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

app.use("/api/orders", ordersRouter);
app.use("/api/menu", menuRouter);
app.use("/api/kitchen", kitchenRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // add panding orders to the kitchen queue ordered by creation date
  prisma.order.findMany({ where: { status: "Pending" } }).then((orders) => {
    orders.forEach((order) => {
      kitchenQueue.enqueue(order.id);
    });
  });
});