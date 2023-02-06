import { notFoundError, conflictError } from "@/errors";
import ticketRepository from "@/repositories/ticket-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import paymentRepository from "@/repositories/payment-repository"
import hotelRepository from "@/repositories/hotel-repository";

async function fetchHotels(userId: number) {

    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) {
        throw notFoundError();
    }
    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket) {
        throw notFoundError();
    }
    const tType = await ticketRepository.findTickeWithTypeById(ticket.id);
    if (tType.TicketType.isRemote === true || tType.TicketType.includesHotel === false){
        throw conflictError("This event does not support hotel stay");
    }
    const payment = await paymentRepository.findPaymentByTicketId(ticket.id)
    if (!payment) {
        throw conflictError("Payment wasn't concluded");
    }

    const fetchedHotels = await hotelRepository.findHotels();
    if (!fetchedHotels) {
        throw notFoundError();
    }

    return fetchedHotels;
}

async function fetchHotelRooms(hotelId: number, userId: number) {
    const fetchedRooms = await hotelRepository.findHotelsRooms(hotelId);

    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) {
        throw notFoundError();
    }
    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket) {
        throw notFoundError();
    }
    const tType = await ticketRepository.findTickeWithTypeById(ticket.id);
    if (tType.TicketType.isRemote === true || tType.TicketType.includesHotel === false){
        throw conflictError("This event does not support hotel stay");
    }
    const payment = await paymentRepository.findPaymentByTicketId(ticket.id)
    if (!payment) {
        throw conflictError("Payment wasn't concluded");
    }

    if(!fetchedRooms){
         throw notFoundError();
     }
     
    return fetchedRooms;
}

const hotelsService = {
    fetchHotels,
    fetchHotelRooms
}

export default hotelsService;