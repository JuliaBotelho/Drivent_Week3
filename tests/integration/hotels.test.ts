import app, { init } from "@/app";
import { prisma } from "@/config";
import { TicketStatus, Hotel } from "@prisma/client";
import httpStatus from "http-status";
import supertest from "supertest";
import {
    createEnrollmentWithAddress,
    createUser,
    createTicketTypeInPerson,
    createTicketTypeNoHotel,
    createTicketTypeRemote,
    createTicket,
    createPayment,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
    await init();
    await prisma.hotel.createMany({
        data: [
            {
                name: "Pernambuco Palace",
                image: "https://www.melhoresdestinos.com.br/wp-content/uploads/2021/04/resort-salinas-maragogi-capa-05.jpg"
            },
            {
                name: "Minas Gerais Palace",
                image: "https://viajandocomamalarosa.com.br/wp-content/uploads/2020/05/Ocean-Palace.jpg"
            },
            {
                name: "Goiás Palace",
                image: "https://media-cdn.tripadvisor.com/media/photo-s/19/84/9a/36/salinas-maceio-all-inclusive.jpg"
            }
        ]
    });
    const hotels = await prisma.hotel.findMany();
    await prisma.room.createMany({
        data: [
            {
                name: "Suite Premium",
                capacity: 3,
                hotelId: hotels[0].id

            },
            {
                name: "Suite Presidencial",
                capacity: 2,
                hotelId: hotels[0].id

            },
            {
                name: "Suite Premium",
                capacity: 3,
                hotelId: hotels[1].id

            },
            {
                name: "Suite Premium",
                capacity: 2,
                hotelId: hotels[1].id

            },
            {
                name: "Suite Premium",
                capacity: 3,
                hotelId: hotels[2].id

            },
            {
                name: "Suite Presidencial",
                capacity: 2,
                hotelId: hotels[2].id

            },
        ]
    });
})

afterAll(async () => {
    await cleanDb();
})

const server = supertest(app);

describe("GET/Hotels", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/hotels");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with 404-not found status if enrollment does not exists", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
        expect(response.status).toEqual(httpStatus.NOT_FOUND)
    })

    it("should respond with 404-not found status if a ticket was not created", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
        expect(response.status).toEqual(httpStatus.NOT_FOUND)
    })

    it("should respond with 402-payment required status if the payment wasn't concluded", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeInPerson();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
        expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED)
    })

    it("should respond with 402-payment required status if the event is remote", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeRemote();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        const payment = await createPayment(ticket.id, ticketType.price);

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
        expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED)
    })

    it("should respond with 402-payment required status if the ticket does note include hotel stay", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeNoHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        const payment = await createPayment(ticket.id, ticketType.price);

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
        expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED)
    })

    it("should return all hotels listed in table Hotel and respond with status 200", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeInPerson();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        const payment = await createPayment(ticket.id, ticketType.price);

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
        expect(response.status).toEqual(httpStatus.OK)
        expect(response.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    image: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                })
            ])
        )
    })

})

describe("GET/hotels/:hotelId", () => {
    it("should respond with status 401 if no token is given", async () => {
        const hotels = await prisma.hotel.findMany();

        const response = await server.get(`/hotels/${Number(hotels[0].id)}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with 404-not found status if enrollment does not exists", async () => {
        const hotels = await prisma.hotel.findMany();
        const user = await createUser();
        const token = await generateValidToken(user);

        const response = await server.get(`/hotels/${Number(hotels[0].id)}`).set("Authorization", `Bearer ${token}`);
        expect(response.status).toEqual(httpStatus.NOT_FOUND)
    })

    it("should respond with 404-not found status if a ticket was not created", async () => {
        const hotels = await prisma.hotel.findMany();
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);

        const response = await server.get(`/hotels/${Number(hotels[0].id)}`).set("Authorization", `Bearer ${token}`);
        expect(response.status).toEqual(httpStatus.NOT_FOUND)
    })

    it("should respond with 402-payment required status if the payment wasn't concluded", async () => {
        const hotels = await prisma.hotel.findMany();
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeInPerson();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

        const response = await server.get(`/hotels/${Number(hotels[0].id)}`).set("Authorization", `Bearer ${token}`);
        expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED)
    })

    it("should respond with 402-payment required status if the event is remote", async () => {
        const hotels = await prisma.hotel.findMany();
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeRemote();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        const payment = await createPayment(ticket.id, ticketType.price);

        const response = await server.get(`/hotels/${Number(hotels[0].id)}`).set("Authorization", `Bearer ${token}`);
        expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED)
    })

    it("should respond with 402-payment required status if the ticket does note include hotel stay", async () => {
        const hotels = await prisma.hotel.findMany();
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeNoHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        const payment = await createPayment(ticket.id, ticketType.price);

        const response = await server.get(`/hotels/${Number(hotels[0].id)}`).set("Authorization", `Bearer ${token}`);
        expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED)
    })

    it("should return all rooms listed in table Rooms and respond with status 200 that references the hotel Id", async () => {
        const hotels = await prisma.hotel.findMany();
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeInPerson();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        const payment = await createPayment(ticket.id, ticketType.price);

        const response = await server.get(`/hotels/${Number(hotels[0].id)}`).set("Authorization", `Bearer ${token}`);
        expect(response.status).toBeGreaterThanOrEqual(httpStatus.OK)
        expect(response.body).toEqual(
            expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
                image: expect.any(String),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                Rooms: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                        capacity: expect.any(Number),
                        hotelId: expect.any(Number),
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                    })
                ])
            })
        );
    })
})