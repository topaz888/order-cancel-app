import { json } from "@remix-run/node";


export async function getAppId(graphql: (query: string) => Promise<Response>) {
    const response = await graphql(
         `#graphql
          query {
            currentAppInstallation {
              id
            }
          }
        `
        );
    const { data: { userErrors, currentAppInstallation } } = await response.json();
    console.log(currentAppInstallation)
    return currentAppInstallation;
}

export async function createAppMetafield(appId: string, key: string, value: string, graphql: (query: string, variables: object) => Promise<Response>) {
  const response = await graphql(
   `  
    mutation CreateAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafieldsSetInput) {
        metafields {
          id
          namespace
          key
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
        metafieldsSetInput: [
          {
            namespace: "app_custom",
            key: key,
            type: "single_line_text_field",
            value: value,
            ownerId: appId
          }
        ]
      },
    }
  )
}

export async function retrieveMetafield(ownerId: string, namespace: string, key: string, graphql: (query: string, variables: object) => Promise<Response>) {
  const response = await graphql(
    `
    query AppInstallationMetafield($namespace: String!, $key: String!, $ownerId: ID!) {
      appInstallation(id: $ownerId) {
        metafield(namespace: $namespace, key: $key) {
          id,
          value
        }
      }
    }
    `,
    {
      id: ownerId,
      namespace:namespace,
      key:key
    }
  );
}

// export async function updateMetafield(ownerId: string,namespace: string, key: string, graphql: (query: string, variables: object) => Promise<Response>) {
//   const response = await graphql(
//     `
//     mutation updateMetafield($id: ID!, $metafieldsSetInput: [MetafieldsSetInput!]!){
//       productUpdate(
//       input : {
//         id: "gid://shopify/Product/1",
//         metafields: [
//           {
//             id: "gid://shopify/Metafield/1",
//             value: "hang dry"
//           }
//         ]
//       }) {
//         product {
//           metafields(first: 10) {
//             edges {
//               node {
//                 namespace
//                 key
//                 value
//               }
//             }
//           }
//         }
//       }
//     }
//     `,
//     {
//       variables: {
//         id: "gid://shopify/Order/6292901888161",
//         key: key,
//         namespace: namespace
//       },
//     }
//   );
// }