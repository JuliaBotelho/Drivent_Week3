import { authenticateToken } from "@/middlewares";
import { Router } from "express";
import { getHotels, getHotelRooms } from "@/controllers";

const hotelsRouter = Router();

hotelsRouter.all("/*", authenticateToken)
hotelsRouter.get("", getHotels);
hotelsRouter.get("/:hotelId", getHotelRooms);

export { hotelsRouter };