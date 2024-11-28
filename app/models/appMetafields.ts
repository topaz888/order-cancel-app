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
    // console.log(currentAppInstallation)
    return currentAppInstallation;
}

export async function createAppMetafield(graphql: (query: string, variables: object) => Promise<Response>, appId: string, key: string, value: string, type:string) {
  const response = await graphql(
   `  
    mutation CreateAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafieldsSetInput) {
        metafields {
          id
          namespace
          key
          value
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
            type: type,
            value: value,
            ownerId: appId
          }
        ]
      },
    }
  )
  const { data: { metafieldsSet:{userErrors, metafields} } } = await response.json();
  // console.log(metafields)
  return metafields;
}

export async function retrieveMetafield(graphql: (query: string, variables: object) => Promise<Response>, ownerId: string, key: string) {
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
      variables: {
        ownerId: ownerId,
        namespace: "app_custom",
        key:key
      }
    }
  )
  const { data: { appInstallation:{ metafield } } } = await response.json();
  // console.log(metafield)
  return metafield;
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