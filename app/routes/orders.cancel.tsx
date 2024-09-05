import {
  Page,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "~/shopify.server";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

async function getOrder(graphql: (query: string, variables: object) => Promise<Response>) {
  const response = await graphql(
    `
      query getOrder($id: ID!) {
        order(id: $id) {
          name,
          id,
          email,
          totalOutstandingSet {
            presentmentMoney {
              amount
            }
          }
        }
      }
    `,
    {
      variables: {
        id: "gid://shopify/Order/6292901888161",
      },
    }
  );
  const { data: { order } } = await response.json();

  return {
    orderName: order?.name,
    orderId: order?.id,
    orderEmail: order?.email,
  };
}

async function orderEditBegin(orderId: string, graphql: (query: string, variables: object) => Promise<Response>) {
  const response = await graphql(
    `
      mutation orderEditBegin($id: ID!) {
        orderEditBegin(id: $id) {
          calculatedOrder {
            # CalculatedOrder fields
            id,
            lineItems(first: 10) {
              nodes {
                id,
                quantity
              }
            }
          }
          userErrors {
            field
            message
          }
        }
    }
    `,
    {
      variables: {
        id: `gid://shopify/Order/${orderId}`,
      },
    }
  );
  const { data: { userErrors, calculatedOrder } } = await response.json();

  return {
    calculatedOrderId: calculatedOrder?.id,
  };
}

async function orderEditCommit(calculatedOrderId: string, graphql: (query: string, variables: object) => Promise<Response>) {
  const response = await graphql(
    `
     mutation orderEditCommit($id: ID!) {
      orderEditCommit(id: $id) {
        order {
          # Order fields
          name,
          id,
        customer{
            displayName,
            email,
            phone
          },
          totalOutstandingSet{
            presentmentMoney {
              amount
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
    `,
    {
      variables: {
        id: calculatedOrderId
      },
    }
  );
  const { data: { userErrors, order } } = await response.json();

  return {
    orderId: order?.id,
  };
}

async function orderEditSetQuantity(calculatedOrderId: string, lineItemId: string, graphql: (query: string, variables: object) => Promise<Response>) {
  const response = await graphql(
    `
    mutation orderEditSetQuantity($id: ID!, $lineItemId: ID!, $quantity: Int!) {
      orderEditSetQuantity(id: $id, lineItemId: $lineItemId, quantity: $quantity) {
        calculatedLineItem {
          # CalculatedLineItem fields
          id
        }
        calculatedOrder {
          # CalculatedOrder fields
          id
          lineItems(first: 5){
            edges{
              node{
                id
                quantity
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
    `,
    {
      variables: {
        id: calculatedOrderId,
        lineItemId: lineItemId,
        quantity: 0
      },
    }
  );
  const { data: { userErrors, calculatedOrder } } = await response.json();

  return {
    calculatedOrderId: calculatedOrder?.id,
  };
}

export async function loader({ request }: { request: Request }) {
  const { admin } = await authenticate.admin(request);
  const order = await getOrder(admin.graphql);

  return json({
    orderName: order?.orderName,
  });
}

export const action: ActionFunction = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const orderId = formData.get("orderId");
  const lineItemId = formData.get("lineItemId");
  
  if (!orderId) {
    return json({ error: "Order ID is required" }, { status: 400 });
  }

  if (typeof lineItemId !== "string") {
    return json({ error: "Invalid order ID" }, { status: 400 });
  }

  try {
    // Initialize the order edit
    const calculatedOrder = await orderEditBegin(lineItemId, admin.graphql);

    // Assuming you want to set the quantity of all line items to 0
    await orderEditSetQuantity(calculatedOrder.calculatedOrderId, lineItemId, admin.graphql);

    // Commit the order edit
    await orderEditCommit(calculatedOrder.calculatedOrderId, admin.graphql);

    return redirect(`/orders/${orderId}/success`);
  } catch (error) {
    return json({ error: "Error cancelling order" }, { status: 500 });
  }
};

export default function OrderPage() {
  const { orderName } = useLoaderData<typeof loader>();

  const handleCancelOrder = async () => {
    try {
      console.log('Order canceled successfully:', orderName);
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  return (
    <Page>
      <TitleBar title="Order Page">
        <button onClick={() => handleCancelOrder()}>Cancel Order {orderName}</button>
        <Form method="post">
          <input type="hidden" name="orderId" value={0} />
          <input type="hidden" name="lineItemId" value={0} />
          <button type="submit">Cancel Order {orderName}</button>
        </Form>
      </TitleBar>
    </Page>
  );
}
