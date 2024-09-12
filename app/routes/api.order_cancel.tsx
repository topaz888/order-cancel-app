import {
    Button,
    FormLayout,
    Page,
    TextField,
  } from "@shopify/polaris";
  import { TitleBar } from "@shopify/app-bridge-react";
  import { authenticate } from "~/shopify.server";
  import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
  import { Form, useLoaderData } from "@remix-run/react";
  
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
    const { data: { orderEditBegin: {calculatedOrder, userErrors} } } = await response.json();
    if (userErrors.length) {
      throw new Error(`GraphQL error: ${userErrors.map((e: any) => e.message).join(", ")}`);
    }
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
    const { data: { orderEditCommit: { userErrors, order } } } = await response.json();

    if (userErrors.length) {
      throw new Error(`GraphQL error: ${userErrors.map((e: any) => e.message).join(", ")}`);
    }
  
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
          lineItemId: `gid://shopify/CalculatedLineItem/${lineItemId}`,
          quantity: 0,
        },
      }
    );
    const { data: {orderEditSetQuantity: { userErrors, calculatedOrder }}} = await response.json();

    if (userErrors.length) {
      throw new Error(`GraphQL error: ${userErrors.map((e: any) => e.message).join(", ")}`);
    }
  
    return {
      calculatedOrderId: calculatedOrder?.id,
    };
  }

  export const loader: LoaderFunction = async () => {
    return json({});
  };

  export const action: ActionFunction = async ({ request }) => {
    // console.log("action")
    const { admin } = await authenticate.public.appProxy(request);
    const formData = await request.formData();
    const orderId = formData.get("orderId");
    const lineItemId = formData.get("lineItemId");
    if (!admin || !admin.graphql) {
      throw new Error("GraphQL client not available.");
    }
    
    if (!orderId) {
      throw new Error("Order ID is required");
    }
  
    if (typeof orderId !== "string") {
      throw new Error("Invalid order ID");
    }
    if (typeof lineItemId !== "string") {
      throw new Error("Invalid order ID");
    }
    try {
      // Initialize the order edit
      const calculatedOrder = await orderEditBegin(orderId, admin.graphql);
  
      // Assuming you want to set the quantity of all line items to 0
      await orderEditSetQuantity(calculatedOrder.calculatedOrderId, lineItemId, admin.graphql);
  
      // Commit the order edit
      await orderEditCommit(calculatedOrder.calculatedOrderId, admin.graphql);
  
      return json({ success: `${orderId} cancelled` }, { status: 200 });
    } catch (error) {
      return json({ error: "Error cancelling order" }, { status: 500 });
    }
  };
  