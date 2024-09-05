import {
  Page,
} from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";

export default function OrderPage() {
  async function handleCancelOrder() {
    try {
      const response = await fetch('/order/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: '6292901888161' }), // replace with actual order ID
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      const result = await response.json();
      console.log('Order canceled successfully:', result);
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  }

  return (
    <Page>
    <TitleBar  title="Order Page">
    <button onClick={() => handleCancelOrder()}>Cancel Order3</button>
    </TitleBar >
  </Page>
  )
}