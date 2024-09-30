import { ActionFunction, json } from "@remix-run/node";
import { useFetcher, useSubmit } from "@remix-run/react";
import {
  Card,
  Page,
  BlockStack,
  Badge,
  Checkbox,
  IndexTable,
  useIndexResourceState,
  useBreakpoints,
  TextField,
  Button,
  Form,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import { getAppId } from "~/models/appMetafields";
import { authenticate } from "~/shopify.server";

export const action: ActionFunction = async ({ request }) => {
    const { session, admin } = await authenticate.admin(request);
  const { shop } = session;

  const data : any  = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };
  const appId = await getAppId(admin.graphql);
  // gid://shopify/AppInstallation/508810821793

  return json({ success: true, message: "Settings saved successfully" });
};

export default function OrderSettingsPage() {
  const [reasons, setReasons] = useState<string[]>(['']);
  // const [cleanFormState, setCleanFormState] = useState<string[]>(qrCode);
  // const isDirty = JSON.stringify(reasons) !== JSON.stringify(cleanFormState);
  const fetcher = useFetcher();

  const handleChangeString = async (newValue: string, index: number) => {
    const updatedReasons = [...reasons];
    updatedReasons[index] = newValue;
    setReasons(updatedReasons)
  };

  
  const [checked, setChecked] = useState(false);
  const handleChangeCheckbox = async(newChecked: boolean) => (setChecked(newChecked));

  const handleAddReasons = async () => {
    setReasons((prevReasons) => ([
      ...prevReasons,
      '' 
    ]));
  };

  const handleRemoveReasons = async(index: number) => {
    setReasons((reasons) => 
      reasons.filter((_, i) => i !== index) // Filter out the item at the specified index
    );
  };

  const submit = useSubmit();
  const handleSaveButton = () => {
    const data = {
      reasonRequired: checked.toString(),
      reasons: reasons,
    };
    submit(data, { method: "post" });
  };
  

  const resourceName = {
    singular: 'reason',
    plural: 'reasons',
  };

  const rowMarkup = reasons.map(
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
      primaryAction={{content: 'Save', disabled: reasons.length === 0,
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
              itemCount={reasons.length}
              headings={[
                {title: 'Reasons'},
                {title: ''},
              ]}
              selectable={false}
              >
                {rowMarkup}
            </IndexTable>
            <Button onClick={() => {handleAddReasons()}}>Add reason</Button>
          </BlockStack>
        </Card>
    </Page>
  );
}
