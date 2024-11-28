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
  Tag,
  LegacyStack,
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
  console.log(data)
  const settingsData = {
    reasons: JSON.parse(data.reasons),
    products: JSON.parse(data.products),
    reasonRequired: data.reasonRequired === 'true'
  };

  const appId = await getAppId(admin.graphql);
  await createAppMetafield(
    admin.graphql, 
    appId.id, 
    "settings", 
    JSON.stringify(settingsData), 
    "single_line_text_field"
  );
  return json({ success: true, message: "Settings saved successfully" });
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const appId = await getAppId(admin.graphql);
  const settings = await retrieveMetafield(admin.graphql, appId.id, "settings");
  // Provide default values if no settings exist
  const defaultSettings = {
    reasons: [],
    products: [],
    reasonRequired: false
  };

  return json(settings?.value ? JSON.parse(settings.value) : defaultSettings);
}

interface TagWithHiddenIDProps {
  label: string;
  id: string;
}

interface ReasonInputProps {
  reason: string;
  index: number;
  onChange: (newValue: string, index: number) => void;
}

function ReasonInput({ reason, index, onChange }: ReasonInputProps) {
  const [localValue, setLocalValue] = useState<string>(reason);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue, index);
  };


  return (
    <TextField
      label="Reason"
      labelHidden
      value={localValue}
      placeholder="Add your customized reason here."
      onChange={handleChange}
      autoComplete="off"
    />
  );
}

export default function OrderSettingsPage() {
  const settings = useLoaderData<typeof loader>();
  const [cleanFormState, setCleanFormState] = useState({
    reasons: settings.reasons,
    products: settings.products,
    reasonRequired: settings.reasonRequired
  });
  
  const [reasons, setReasons] = useState<string[]>(settings.reasons);
  const [products, setProducts] = useState<TagWithHiddenIDProps[]>(
    settings.products.map((p: string) => {
      const [id, label] = p.split('&&');
      return { id, label };
    })
  );
  const [checked, setChecked] = useState(settings.reasonRequired);
  // Compare current values with cleanFormState
  const isDirty = 
  JSON.stringify(reasons) !== JSON.stringify(cleanFormState.reasons) ||
  JSON.stringify(products.map(p => `${p.id}&&${p.label}`)) !== JSON.stringify(cleanFormState.products) ||
  checked !== cleanFormState.reasonRequired;

  const handleChangeCheckbox = async(newChecked: boolean) => (setChecked(newChecked));
  
  const addProduct = (newProduct: TagWithHiddenIDProps) => {
    setProducts((prevProducts) => [...prevProducts, newProduct]);
  };
  
  const handleAddReasons = async () => {
    setReasons((prevReasons) => ([
      ...prevReasons,
      '' 
    ]));
  };

  const handleChangeString = (newValue: string, index: number) => {
    setReasons((prevState) => {
      const newState = [...prevState];
      newState[index] = newValue;
      return newState;
    });
  };

  async function selectProduct() {
    const selectProducts = await window.shopify.resourcePicker({
      type: "product",
      action: "select", // customized action verb, either 'select' or 'add',
    });
    if (selectProducts) {
      const { id, title, variants } = selectProducts[0];
      const productId = variants[0].id ?? id;
      const productLabel = variants[0].displayName ?? title;
  
      // Check if the product ID already exists in the products array
      const isProductAlreadyAdded = products.some((product) => product.id === productId);
  
      if (!isProductAlreadyAdded) {
        addProduct({ label: productLabel, id: productId});
      }
    }
  }
  
  const handleRemoveProducts = useCallback(async(id: string) => {
      setProducts((previousTags) =>
        previousTags.filter((previousTag) => previousTag.id !== id),
      );
  },[])

  const TagWithHiddenID = products.map((product) => (
    <div key={`product-${product.id}`}>
      <input type="hidden" value={product.id} id={`hidden-id-${product.id}`} />
      <Tag
        size="large"
        onRemove={() => handleRemoveProducts(product.id)}
      >
        {product.label}
      </Tag>
    </div>
  )
);


  const handleRemoveReasons = async(index: number) => {
    setReasons((reasons) => 
      reasons.filter((_, i) => i !== index) // Filter out the item at the specified index
    );
  };

  const submit = useSubmit();
  const handleSaveButton = () => {
    const data = {
      reasonRequired: checked.toString(),
      reasons: JSON.stringify(reasons),
      products: JSON.stringify(products.map((product) => product.id+ '&&' + product.label))
    };
    setCleanFormState({
      reasons: reasons,
      products: products.map((product) => product.id+ '&&' + product.label),
      reasonRequired: checked
    });
    submit(data, { method: "post" });
  };
  

  const resourceName = {
    singular: 'reason',
    plural: 'reasons',
  };
  

  const rowMarkup = reasons.map((reason, index) => (
    <IndexTable.Row id={`reason-row-${index}`} key={`reason-${index}`} position={index}>
      <IndexTable.Cell>
        <ReasonInput reason={reason} index={index} onChange={handleChangeString} />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Button variant="plain" tone="critical" onClick={() => handleRemoveReasons(index)}>
          Remove
        </Button>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));
  

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
              itemCount={1}
              headings={[
                {id: 'reasons', title: 'Reasons'},
                {id: 'actions', title: 'Actions'},
              ]}
              selectable={false}
              >
                {rowMarkup}
            </IndexTable>
            <InlineStack align="start">
              <Button onClick={() => {handleAddReasons()}}>Add reason</Button>
            </InlineStack>
            {/* <Divider borderColor="border" /> */}
            <IndexTable
              condensed={useBreakpoints().smDown}
              resourceName={resourceName}
              itemCount={1}
              headings={[
                {title: 'Products'},
                {title: ''},
              ]}
              selectable={false}
              >
            </IndexTable>
            {true?
            <>
              <Card>
              <LegacyStack spacing="tight">{TagWithHiddenID}</LegacyStack>
              </Card>
              <InlineStack align="start">
                <Button onClick={() => { selectProduct(); } }>Select product</Button>
              </InlineStack>
            </>
              :
            <EmptyState
              heading="Manage your allowed Products"
              action={{onAction: selectProduct, content: 'Select product'}}
              image={emptyStateImage}
            >
              <p>Specify the items eligible for cancellation</p>
            </EmptyState>}
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
