import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { useFetcher, useLoaderData, useSubmit } from "@remix-run/react";
import {
  Card,
  Page,
  BlockStack,
  Badge,
  Checkbox,
  IndexTable,
  useIndexResourceState,
  useBreakpoints,
  Text,
  TextField,
  Button,
  Form,
  InlineError,
  InlineStack,
  Divider,
  SkeletonThumbnail,
  EmptyState,
  PageActions,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import { createAppMetafield, getAppId, retrieveMetafield } from "~/models/appMetafields";
import { authenticate } from "~/shopify.server";
import emptyStateImage from '../assets/images/productEmptyState.png';

export const action: ActionFunction = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const { shop } = session;

  const data : any  = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };
  const appId = await getAppId(admin.graphql);
  await createAppMetafield(admin.graphql, appId.id, "reasons", data.formState)
  await retrieveMetafield(admin.graphql, appId.id, "reasons")
  return json({ success: true, message: "Settings saved successfully" });
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const appId = await getAppId(admin.graphql);
  // const metafields = await createAppMetafield(admin.graphql, appId.id, "reasons", "test purpose1 test purpose 2")
  return json(await retrieveMetafield(admin.graphql, appId.id, "reasons"))
}

async function selectProduct() {
  const products = await window.shopify.resourcePicker({
    type: "product",
    action: "select", // customized action verb, either 'select' or 'add',
  });

  if (products) {
    const { images, id, variants, title, handle } = products[0];
    console.log(id);
    // setFormState({
    //   ...formState,
    //   productId: id,
    //   partialProductVariantId: variants[0].id,
    //   productTitle: title,
    //   productHandle: handle,
    //   productAlt: images[0]?.altText,
    //   productImage: images[0]?.originalSrc,
    // });
  }
}

export default function OrderSettingsPage() {
  const reasons = useLoaderData<typeof loader>();
  const initialFormState = reasons?.value ? JSON.parse(reasons.value) : [];
  const [formState, setFormState] = useState<string[]>(initialFormState);
  const [cleanFormState, setCleanFormState] = useState<string[]>(initialFormState);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);
  // const fetcher = useFetcher();

  const handleChangeString = async (newValue: string, index: number) => {
    const updatedReasons = [...formState];
    updatedReasons[index] = newValue;
    setFormState(updatedReasons)
  };

  
  const [checked, setChecked] = useState(false);
  const handleChangeCheckbox = async(newChecked: boolean) => (setChecked(newChecked));

  const handleAddReasons = async () => {
    setFormState((prevReasons) => ([
      ...prevReasons,
      '' 
    ]));
  };

  const handleRemoveReasons = async(index: number) => {
    setFormState((formState) => 
      formState.filter((_, i) => i !== index) // Filter out the item at the specified index
    );
  };

  const submit = useSubmit();
  const handleSaveButton = () => {
    const data = {
      reasonRequired: checked.toString(),
      formState: JSON.stringify(formState),
    };
    setCleanFormState(formState);
    submit(data, { method: "post" });
  };
  

  const resourceName = {
    singular: 'reason',
    plural: 'reasons',
  };

  const rowMarkup = formState.map(
    (
      reason,
      index,
    ) => (
      <IndexTable.Row
        id={index.toString()}
        key={index}
        position={index}
      >
        <IndexTable.Cell>
          <TextField
            label="Reason"
            labelHidden={true}
            value={reason}
            placeholder='Add you customized reason here.'
            onChange={async (newValue)=> await handleChangeString(newValue,index)}
            autoComplete="off"
            key={`textfield-${index}`}
          />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Button variant="plain" tone="critical" onClick={() => {handleRemoveReasons(index)}}>Remove</Button>
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Page
      backAction={{content: 'Products', url: '#'}}
      title="Order Editor Settings"
      titleMetadata={<Badge tone="success">Paid</Badge>}
      subtitle="Perfect for any pet"
      compactTitle
      primaryAction={{content: 'Save', disabled: !isDirty,
        onAction: () => {
          handleSaveButton();
        }}}
      secondaryActions={[
        {
          content: 'Reset',
          accessibilityLabel: 'Secondary action label',
          onAction: () => alert('Reset action'),
        }
      ]}
    >
      <Card>
        <BlockStack gap="500">
            <Checkbox
                label="Reason selection required"
                checked={checked}
                onChange={handleChangeCheckbox}
                bleedBlockStart='050'
                helpText="The customer must select a cancellation reason to cancel the order."
              />
            <IndexTable
              condensed={useBreakpoints().smDown}
              resourceName={resourceName}
              itemCount={formState.length}
              headings={[
                {id: 'reasons', title: 'Reasons'},
                {id: 'actions', title: ''},
              ]}
              selectable={false}
              >
                {rowMarkup}
            </IndexTable>
            <Button onClick={() => {handleAddReasons()}}>Add reason</Button>
            <Divider borderColor="border" />
            <IndexTable
              condensed={useBreakpoints().smDown}
              resourceName={resourceName}
              itemCount={formState.length}
              headings={[
                {title: 'Products'},
                {title: ''},
              ]}
              selectable={false}
              >
            </IndexTable>
            <EmptyState
              heading="Manage your allowed Products"
              action={{onAction: selectProduct, content: 'Select product'}}
              image={emptyStateImage}
            >
              <p>Specify the items eligible for cancellation</p>
            </EmptyState>
            {true ? (
              <InlineError
                message={"error"}
                fieldID="myFieldID"
              />
            ) : null}
          </BlockStack>
      </Card>
      <PageActions/>
    </Page>
  );
}
