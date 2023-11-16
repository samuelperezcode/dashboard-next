'use server'

import { sql } from "@vercel/postgres"
import { CreateInvoice } from "./schemas"
 

export async function createInvoice(formData:FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })
  const amountInCents = amount * 100
  const date = new Date().toString().split('T')[0]

  await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `
}