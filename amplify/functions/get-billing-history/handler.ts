import Stripe from 'stripe';
import type { Handler } from 'aws-lambda';;

export const handler: Handler = async (event) => {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const defaultCustomerId = process.env.DEFAULT_STRIPE_CUSTOMER_ID;

    if (!stripeSecret || !defaultCustomerId) {
        throw new Error('Configuration Error: Missing Stripe environment variables.');
    }   

    const stripe = new Stripe(stripeSecret);

    try {
        // Get last 5 invoices for the default customer
        const invoices = await stripe.invoices.list({
            customer: defaultCustomerId,
            limit: 5
        });
        
        const history = invoices.data.map(invoice => ({
            id: invoice.id,
            date: new Date(invoice.created * 1000).toISOString(),
            amount: (invoice.total / 100).toFixed(2), // Convert cents to dollars
            currency: invoice.currency.toUpperCase(),
            status: invoice.status || 'unknown',
            pdfUrl: invoice.hosted_invoice_url || '#' // link to the PDF file for invoice
        }));

        return history;

    } catch (error) {
        console.error('Error fetching billing history from stripe:', error);
        throw new Error(`Failed to retrieve billing history: ${(error as Error).message}`);
    }
};