import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { contactSubmissions } from "@db/schema";
import { desc, eq } from "drizzle-orm";
import { captureLead } from "./lib/crm";

export const contactRouter = createRouter({
  submit: publicQuery
    .input(z.object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      email: z.string().email("Valid email is required"),
      phone: z.string().optional(),
      country: z.string().optional(),
      message: z.string().min(1, "Message is required"),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(contactSubmissions).values({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone || null,
        country: input.country || null,
        message: input.message,
      });
      // CRM: every contact-form submission becomes (or enriches) a lead
      await captureLead({
        name: `${input.firstName} ${input.lastName}`,
        email: input.email,
        phone: input.phone || null,
        country: input.country || null,
        source: "contact_form",
        notes: input.message,
      });
      return { success: true, message: "Thank you for your message! We will get back to you within 24 hours." };
    }),

  list: publicQuery
    .query(async () => {
      const db = getDb();
      return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
    }),

  markRead: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(contactSubmissions)
        .set({ isRead: "yes" })
        .where(eq(contactSubmissions.id, input.id));
      return { success: true };
    }),

  stats: publicQuery
    .query(async () => {
      const db = getDb();
      const all = await db.select().from(contactSubmissions);
      const total = all.length;
      const unread = all.filter(c => c.isRead === "no").length;
      return { total, unread };
    }),
});
