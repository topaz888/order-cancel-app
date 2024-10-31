import React, { useState } from 'react';
import {
  Page,
  Layout,
  Card,
  DataTable,
  Checkbox,
  Button,
  Modal,
  TextField,
  ResourceList,
  ResourceItem
} from '@shopify/polaris';

interface ProductItem {
  id: string;
  name: string;
}

function CancellationSettings() {
  const [isReasonRequired, setIsReasonRequired] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);
  const [isModalActive, setIsModalActive] = useState(false);
  const [newReason, setNewReason] = useState<string>('');
  const [allowedProducts, setAllowedProducts] = useState<ProductItem[]>([]); // type as ProductItem[]
  const [isProductModalActive, setIsProductModalActive] = useState(false);
  const [newProduct, setNewProduct] = useState<string>('');

  // Toggle modal for adding reasons
  const toggleModal = () => setIsModalActive(!isModalActive);

  // Toggle modal for adding products
  const toggleProductModal = () => setIsProductModalActive(!isProductModalActive);

  // Add new reason to the table
  const addReason = () => {
    setReasons([...reasons, newReason]);
    setNewReason('');
    toggleModal();
  };

  // Add new product to the list
  const addProduct = () => {
    const newProductItem = { id: Math.random().toString(36).substr(2, 9), name: newProduct }; // creating unique id
    setAllowedProducts([...allowedProducts, newProductItem]);
    setNewProduct('');
    toggleProductModal();
  };

  return (
    <Page title="Cancellation Settings">
      <Layout>
        <Layout.Section>
          {/* Reason Selection Required Checkbox */}
          <Card>
            <Checkbox
              label="Require Cancellation Reason"
              checked={isReasonRequired}
              onChange={(newChecked) => setIsReasonRequired(newChecked)}
            />
          </Card>

          {/* Table of Reasons */}
          <Card>
            <DataTable
              columnContentTypes={['text', 'text']}
              headings={['Reason', 'Actions']}
              rows={reasons.map((reason) => [
                reason,
                <Button onClick={() => setReasons(reasons.filter((r) => r !== reason))}>Delete</Button>,
              ])}
            />
            <Button onClick={toggleModal} variant='primary'>Add Reason</Button>
          </Card>

          {/* List of Allowed Products */}
          <Card>
            <ResourceList
              resourceName={{ singular: 'product', plural: 'products' }}
              items={allowedProducts}
              renderItem={(product) => (
                <ResourceItem onClick={()=>{}} id={product.id} accessibilityLabel={`View details for ${product.name}`}>
                  {product.name}
                </ResourceItem>
              )}
            />
            <Button onClick={toggleProductModal} variant='primary'>Add Product</Button>
          </Card>
        </Layout.Section>
      </Layout>

      {/* Modal for Adding New Reason */}
      {isModalActive && (
        <Modal
          open={isModalActive}
          onClose={toggleModal}
          title="Add a New Reason"
          primaryAction={{
            content: 'Add Reason',
            onAction: addReason,
          }}
        >
          <Modal.Section>
            <TextField
              label="Reason"
              value={newReason}
              onChange={(value) => setNewReason(value)}
              autoComplete="off"
            />
          </Modal.Section>
        </Modal>
      )}

      {/* Modal for Adding New Product */}
      {isProductModalActive && (
        <Modal
          open={isProductModalActive}
          onClose={toggleProductModal}
          title="Add a New Product"
          primaryAction={{
            content: 'Add Product',
            onAction: addProduct,
          }}
        >
          <Modal.Section>
            <TextField
              label="Product Name or SKU"
              value={newProduct}
              onChange={(value) => setNewProduct(value)}
              autoComplete="off"
            />
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
}

export default CancellationSettings;
