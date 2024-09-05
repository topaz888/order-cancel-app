import axios from 'axios';

const SHOPIFY_API_VERSION = '2023-04';
const SHOPIFY_BASE_URL = `https://${process.env.SHOPIFY_STORE_NAME}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}`;

const shopifyClient = axios.create({
  baseURL: SHOPIFY_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
  },
});

export async function cancelOrder(orderId: string) {
  try {
    const response = await shopifyClient.post(`/orders/${orderId}/cancel.json`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
}
