import { json, LoaderFunction } from '@remix-run/node';
import {Card, Text} from '@shopify/polaris';
import React from 'react';
import { authenticate } from '~/shopify.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);

  if ( params.id ) {
    return json({
      id: params.id
    });
  }

  return;
};

export default function CardDefault() {
  return (
    <Card>
      <Text as="h2" variant="bodyMd">
        Success
      </Text>
    </Card>
  );
}