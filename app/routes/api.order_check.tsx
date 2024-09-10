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
  
  async function getOrder(graphql: (query: string, variables: object) => Promise<Response>, orderId: string | null) {
    const response = await graphql(
      `
        query getOrder($id: ID!) {
            order(id: $id) {
            lineItems(first:20){
                edges{
                node{
                    id,
                    unfulfilledQuantity
                }
                }
            }
            }
        }
      `,
      {
        variables: {
          id: `gid://shopify/Order/${orderId}`
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch order: ${response.statusText}`);
    }
  
    const { data, errors } = await response.json();
  

    if (errors) {
      throw new Error(`GraphQL error: ${errors.map((e: any) => e.message).join(", ")}`);
    }

    return data.order;
  }

  export async function loader({ request }: { request: Request }) {
    try {
      const { admin } = await authenticate.public.appProxy(request);
      const {searchParams} = new URL(request.url);
      const orderid = searchParams.get("order")
      const shop = searchParams.get("shop");
      const customerId = searchParams.get("logged_in_customer_id")
      if(!orderid){
        throw new Error("Order Id not available.");
      }
      if (!admin || !admin.graphql) {
        throw new Error("GraphQL client not available.");
      }

      const order = await getOrder(admin?.graphql, orderid);
      const response = order.lineItems.edges.map((edge: { node: { id: any; unfulfilledQuantity: any; } }) => ({
        id: edge.node.id,
        unfulfillable_quantity: edge.node.unfulfilledQuantity,
      }));

      return json({ line_items: response });
    } catch (errors) {
        return json({ error: "Failed to retrieve order" }, { status: 500 });
    }
  }
  