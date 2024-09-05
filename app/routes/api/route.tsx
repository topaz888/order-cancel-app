import { json, LoaderFunction } from "@remix-run/node";
import {
    Card,
    EmptyState,
    Layout,
    Page,
    IndexTable,
    Thumbnail,
    Text,
    Icon,
    InlineStack,
  } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);

  if (params.key === "new") {
    return json({
      destination: "product",
      title: "",
    });
  }

  return json({});
};

export default function UpdateOrder() {
    return (
        <Page>
          <Layout>
            <Layout.Section>
              <Card padding="0">
              <p>Allow customers to scan codes and buy products using their phones.</p>
              </Card>
            </Layout.Section>
          </Layout>
        </Page>
    );
}