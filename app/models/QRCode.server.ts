import qrcode from "qrcode";
import invariant from "tiny-invariant";
import db from "../db.server";
import { QRCode } from "@prisma/client";

export interface QRCodeSupplemented extends QRCode {
    productDeleted?: boolean;
    productTitle?: string;
    productImage?: string;
    productAlt?: string;
    destinationUrl?: string;
    image?: string;
  }

export interface Product {
  title?: string;
  images?: {
    nodes: {
      altText: string;
      url: string;
    }[];
  };
}

interface GraphQLResponse {
  data: {
    product: Product;
  };
}

interface ValidationErrors {
  [key: string]: string;
}

export async function getQRCode(id: number, graphql: (query: string, variables: object) => Promise<Response>): Promise<QRCodeSupplemented | null> {
    const qrCode = await db.qRCode.findFirst({ where: { id } });
  
    if (!qrCode) {
      return null;
    }
  
    return supplementQRCode(qrCode, graphql);
  }
  
  export async function getQRCodes(shop: string, graphql: (query: string, variables: object) => Promise<Response>): Promise<QRCodeSupplemented[]> {
    const qrCodes = await db.qRCode.findMany({
      where: { shop },
      orderBy: { id: "desc" },
    });
  
    if (qrCodes.length === 0) return [];
  
    return Promise.all(
      qrCodes.map((qrCode: QRCode) => supplementQRCode(qrCode, graphql))
    );
  }
  
  export function getQRCodeImage(id: number): Promise<string> {
    const url = new URL(`/qrcodes/${id}/scan`, process.env.SHOPIFY_APP_URL!);
    return qrcode.toDataURL(url.href);
  }
  
  export function getDestinationUrl(qrCode: QRCode): string {
    if (qrCode.destination === "product") {
      return `https://${qrCode.shop}/products/${qrCode.productHandle}`;
    }
    console.log("qrCode.productVariantId ", qrCode.productVariantId)
    const match = /gid:\/\/shopify\/ProductVariant\/([0-9]+)/.exec(qrCode.productVariantId);
    invariant(match, "Unrecognized product variant ID");
  
    return `https://${qrCode.shop}/cart/${match[1]}:1`;
  }
  
  async function supplementQRCode(qrCode: QRCode, graphql: (query: string, variables: object) => Promise<Response>): Promise<QRCodeSupplemented> {
    const qrCodeImagePromise = getQRCodeImage(qrCode.id);
    
    const response = await graphql(
      `
        query supplementQRCode($id: ID!) {
          product(id: $id) {
            title
            images(first: 1) {
              nodes {
                altText
                url
              }
            }
          }
        }
      `,
      {
        variables: {
          'id': qrCode.productId,
        }
      }
    );
    const { data: { product } } = await response.json() as GraphQLResponse;
  
    return {
      ...qrCode,
      productDeleted: !product?.title,
      productTitle: product?.title,
      productImage: product?.images?.nodes[0]?.url,
      productAlt: product?.images?.nodes[0]?.altText,
      destinationUrl: getDestinationUrl(qrCode),
      image: await qrCodeImagePromise,
    };
  }
  
  export function validateQRCode(data: Partial<QRCode>): ValidationErrors | undefined {
    const errors: ValidationErrors = {};
  
    if (!data.title) {
      errors.title = "Title is required";
    }
  
    if (!data.productId) {
      errors.productId = "Product is required";
    }
  
    if (!data.destination) {
      errors.destination = "Destination is required";
    }
  
    if (Object.keys(errors).length) {
      return errors;
    }
  }