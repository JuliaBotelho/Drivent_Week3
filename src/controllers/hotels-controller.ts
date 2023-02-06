import { AuthenticatedRequest } from "@/middlewares";
import { Request, Response } from "express";
import httpStatus from "http-status";
import hotelsService from "@/services/hotels-service";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    try {
        const fetchedHotels = await hotelsService.fetchHotels(userId);
        return res.status(httpStatus.OK).send(fetchedHotels);
    } catch (e) {
        if (e.name === "NotFoundError"){
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        console.log(e.message)
        return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
}

export async function getHotelRooms(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const hotelId = Number(req.params.hotelId);
    try {
        const hotelRooms = await hotelsService.fetchHotelRooms(hotelId, userId);
        return res.status(httpStatus.OK).send(hotelRooms);
    } catch (e) {
        if (e.name === "NotFoundError"){
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        console.log(e.message)
        return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
}