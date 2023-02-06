import { prisma } from "@/config";
import { Console } from "console";

async function findHotels() {
    return prisma.hotel.findMany();
}

async function findHotelsRooms(hotelId: number) {

    return prisma.hotel.findUnique({
        where: {
          id: hotelId,
        },
        include:{
            Rooms: true,
        }
    });
}

const hotelRepository = {
    findHotels,
    findHotelsRooms
}

export default hotelRepository;