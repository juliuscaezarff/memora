import prisma from "@memora/db";
import z from "zod";

import { protectedProcedure } from "../index";

const colorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const nameSchema = z.string().trim().min(1).max(32);

export const labelRouter = {
	getAll: protectedProcedure.handler(async ({ context }) => {
		return await prisma.label.findMany({
			where: { userId: context.session.user.id },
			orderBy: [{ createdAt: "asc" }, { name: "asc" }],
			include: {
				_count: { select: { bookmarks: true } },
			},
		});
	}),

	create: protectedProcedure
		.input(z.object({ name: nameSchema, color: colorSchema }))
		.handler(async ({ input, context }) => {
			return await prisma.label.create({
				data: {
					name: input.name,
					color: input.color.toLowerCase(),
					userId: context.session.user.id,
				},
			});
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: nameSchema,
				color: colorSchema,
			}),
		)
		.handler(async ({ input, context }) => {
			return await prisma.label.update({
				where: { id: input.id, userId: context.session.user.id },
				data: { name: input.name, color: input.color.toLowerCase() },
			});
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input, context }) => {
			return await prisma.label.delete({
				where: { id: input.id, userId: context.session.user.id },
			});
		}),

	setOnBookmark: protectedProcedure
		.input(
			z.object({
				bookmarkId: z.string(),
				labelId: z.string(),
				assigned: z.boolean(),
			}),
		)
		.handler(async ({ input, context }) => {
			const [bookmark, label] = await Promise.all([
				prisma.bookmark.findFirst({
					where: {
						id: input.bookmarkId,
						folder: { userId: context.session.user.id },
					},
					select: { id: true },
				}),
				prisma.label.findFirst({
					where: { id: input.labelId, userId: context.session.user.id },
					select: { id: true },
				}),
			]);

			if (!bookmark || !label) throw new Error("Bookmark or label not found");

			return await prisma.bookmark.update({
				where: { id: bookmark.id },
				data: {
					labels: input.assigned
						? { connect: { id: label.id } }
						: { disconnect: { id: label.id } },
				},
				include: { labels: { orderBy: { createdAt: "asc" } } },
			});
		}),
};
