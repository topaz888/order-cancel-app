import { useState } from 'react';
import { Page, Layout, Card, BlockStack, FormLayout, TextField, Button } from '@shopify/polaris';
import { sendEmail } from '~/models/emailTransfer.server';
import { ActionFunction, json, LoaderFunction } from '@remix-run/node';
import { useSubmit } from '@remix-run/react';
import { authenticate } from '~/shopify.server';

export const action: ActionFunction = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const data : any  = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };

  const result = await sendEmail(data.title, data.email, data.content);
  return json({ success: true, message: result });
};



export default function ContactPage() {
  // Declare state variables to store email and content input
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');

  // Handler function for form submission
  const submit = useSubmit();
  const handleSubmit = () => {
    const data = {
      title: JSON.stringify(title),
      email: JSON.stringify(email),
      content: JSON.stringify(content),
    };
    submit(data, { method: "post" });
        // Clear the form fields after submission
        setTitle('');
        setEmail('');
        setContent('');
  };

  return (
    <Page title="Contact Us">
      <Layout>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <FormLayout>
              <TextField
                  type="text"
                  label="Ttile"
                  value={title}
                  onChange={(value) => setTitle(value)}  // Update email state on change
                  autoComplete="email"
                />
                <TextField
                  type="email"
                  label="Your email address"
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
                <Button onClick={()=>handleSubmit()} variant="primary">Submit</Button>
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
