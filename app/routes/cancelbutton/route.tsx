import { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  // Respond with JavaScript content
  const jsContent = `
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Dynamic script from Remix server is loaded.');
      
      const orderElement = document.querySelector('order');
      if (orderElement) {
        // Get the values of data-order-number and data-order-item
        const orderNumber = orderElement.dataset.orderNumber;
        const orderItem = orderElement.dataset.orderItem;
        console.log('orderNumber:', orderNumber);

        // Use fetch to send a POST request with the orderNumber
        fetch("https://pressed-oem-mitsubishi-chef.trycloudflare.com/order/view", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId: orderNumber })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(\`HTTP error! status: \${response.status}\`);
            }
            return response.json();
        })
        .then(data => {
          if (data.error) {
            console.error('Error:', data.error);
          } else {
            console.log('Order data:', data);
            // You can process data here, e.g., update the DOM based on data
          }
        })
        .catch(error => {
          alert(\`Request failed: \${error.message}\`);
        });
      } else {
        console.error('Order element not found');
      }
    });
  `;

  // Return JavaScript as a response with the correct content-type
  return new Response(jsContent, {
    headers: {
      "Content-Type": "application/javascript",
    },
  });
};
