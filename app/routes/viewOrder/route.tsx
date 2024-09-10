import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { error } from "console";
import { authenticate } from "../../shopify.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const orderId = params.orderId;
  const { admin, session } = await authenticate.admin(request);
  console.log("order Id has been GET")

  try {
    // Use the custom `admin.rest.resources.Order.get` to fetch the order
    if(!orderId){
        throw error('Order Id does not exist');
    }
    const order = await admin.rest.resources.Order.find({
        session: session,
        id: orderId,
        fields: "id,line_items,name,fulfillable_quantity",
    });
    return json({ order });
  } catch (error) {
    console.error("Retrieve Order: " + error);
    return json({ error: "Failed to retrieve the order" }, { status: 500 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  console.log("Order ID has been POST");

  try {
    // Get the orderId from the request body (since it's a POST request now)
    const body = await request.json();
    const orderId = body.orderId;

    if (!orderId) {
      throw new Error("Order ID does not exist");
    }

    // Use the custom `admin.rest.resources.Order.find` to fetch the order
    const order = await admin.rest.resources.Order.find({
      session: session,
      id: orderId.toString(),
      fields: "id,line_items,name,fulfillable_quantity",
    });

    return json({ order });
  } catch (error) {
    console.error("Retrieve Order: " + error);
    return json({ error: "Failed to retrieve the order" }, { status: 500 });
  }
};
