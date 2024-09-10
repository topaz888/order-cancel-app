import { redirect } from '@remix-run/node';
import { shopifyApi } from '@shopify/shopify-api';
import { ApiVersion } from '@shopify/shopify-app-remix/server';

const ShopifyApi = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN!,
  shop: process.env.SHOPIFY_SHOP_NAME!,
  scopes: ['read_orders', 'write_orders'],
  hostName: 'your-app-hostname.com',
  apiVersion: ApiVersion.July24,
  isEmbeddedApp: true,
});

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return redirect("https://partners.shopify.com");
  }

  // Start the OAuth flow
  return ShopifyApi.auth.begin({
    shop,
    callbackPath: "/auth/callback",
    isOnline: true, // Set to false if you want offline sessions
    rawRequest: new URL("/auth/callback", process.env.SHOPIFY_APP_URL!),
  });
}

export default ShopifyApi;