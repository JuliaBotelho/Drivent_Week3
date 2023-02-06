import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { fetchTicketTypes, getTickets, createTicket } from "@/controllers";

const ticketsRouter = Router();

ticketsRouter
  .all("/*", authenticateToken)
  .get("/types", fetchTicketTypes)
  .get("", getTickets)
  .post("", createTicket);

export { ticketsRouter };
