import { useState } from 'react';
import { Page, Layout, Card, BlockStack, FormLayout, TextField, Button } from '@shopify/polaris';

export default function ContactPage() {
  // Declare state variables to store email and content input
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');

  // Handler function for form submission
  const handleSubmit = () => {
    // Logic to handle form submission
    console.log('Email:', email);
    console.log('Content:', content);

    // You can add additional actions, like sending the form data to a server
  };

  return (
    <Page title="Contact Us">
      <Layout>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <FormLayout>
                <TextField
                  type="email"
                  label="Account email"
                  value={email}
                  onChange={(value) => setEmail(value)}  // Update email state on change
                  autoComplete="email"
                />
                <TextField
                  type="text"
                  label="Message"
                  value={content}
                  onChange={(value) => setContent(value)}  // Update content state on change
                  autoComplete="off"
                  spellCheck={true}
                  multiline={4}
                />
                <Button onClick={handleSubmit} variant="primary">Submit</Button>
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
