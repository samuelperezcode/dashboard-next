'use server'

import { sql } from "@vercel/postgres"
import { CreateInvoice, UpdateInvoice } from "./schemas"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
 
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State ,formData:FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  const { amount, customerId, status} = validatedFields.data

  const amountInCents = amount * 100
  const date = new Date().toISOString().split('T')[0]
  console.log(date)
  
  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `
    
  } catch (error) {
   return {message: 'Database Error: Failed to Create Invoice.'} 
  }

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}

export async function updateInvoice(id: string, formData: FormData) {
  const {customerId,amount, status} = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })

  const amountInCents = amount * 100
 try {
  await sql`
  UPDATE invoices 
  SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
  WHERE  id = ${id}
  `
 } catch (error) {
  return {message: 'Database Error: Failed to Update Invoice'}
 }

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')

}

export async function deleteInvoice(id: string){
  try {
    await sql`
    DELETE FROM invoices WHERE id = ${id}
    `  
  } catch (error) {
    return {message: 'Database error: Failed to Delete Invoice'}  
  }
  
  revalidatePath('/dashboard/invoices')
}