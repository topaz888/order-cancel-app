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
} from "@shopify/polaris";
import { useCallback, useState } from "react";

export default function OrderSettingsPage() {
  const [value, setValue] = useState('');

  const handleChangeString = useCallback(
    (newValue: string) => setValue(newValue),
    [],
  );
  
  const [checked, setChecked] = useState(false);
  const handleChange = useCallback(
    (newChecked: boolean) => setChecked(newChecked),
    [],
  );

  const [reasons, setReasons] = useState(['']);

  const handleAddReasons = useCallback(() => {
    setReasons((prevReasons) => ([
      ...prevReasons,
      '' // Replace '' with the actual value you want to set
    ]));
  }, []);

  const handleRemoveReasons = useCallback((index: number) => {
    setReasons((reasons) => 
      reasons.filter((_, i) => i !== index) // Filter out the item at the specified index
    );
  }, []);
  

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
        id={reason}
        key={index}
        position={index}
      >
        <IndexTable.Cell>
          <TextField
            label="Store name"
            labelHidden={true}
            value={value}
            placeholder='Add you customized reason here.'
            onChange={handleChangeString}
            autoComplete="off"
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
      primaryAction={{content: 'Save', disabled: true}}
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
              onChange={handleChange}
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
