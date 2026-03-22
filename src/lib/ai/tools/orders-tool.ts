import { tool } from 'ai';
import { z } from 'zod';
import { db } from '../db';

export type OrderSummary = {
  id: string;
  total: number;
  status: string;
};

export type GetUserOrdersResult = {
  email: string;
  orders: OrderSummary[];
};

export const getUserOrders = tool({
  description: 'Get user orders by email.',
  inputSchema: z.object({
    email: z.string().email(),
  }),
  execute: async ({ email }): Promise<GetUserOrdersResult> => {
    const startedAt = new Date().toISOString();
    console.log(
      `[tool:getUserOrders] start ${startedAt} email=${email}`
    );

    const rows = db
      .prepare(
        `
        SELECT id, total, status
        FROM orders
        WHERE user_email = ?
        ORDER BY created_at DESC
        `
      )
      .all(email) as OrderSummary[];

    console.log(
      `[tool:getUserOrders] success ${new Date().toISOString()} email=${email} orders=${rows.length}`
    );

    return {
      email,
      orders: rows,
    };
  },
});
