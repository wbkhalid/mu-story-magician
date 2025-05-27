import { BlobServiceClient } from '@azure/storage-blob';

const AZURE_STORAGE_CONNECTION_STRING = process.env.NEXT_PUBLIC_AZURE_STORAGE_CONNECTION_STRING;
const BLOB_CONTAINER_NAME = process.env.NEXT_PUBLIC_AZURE_BLOB_CONTAINER_NAME;

if (!AZURE_STORAGE_CONNECTION_STRING || !BLOB_CONTAINER_NAME) {
  throw new Error('Azure Storage connection string or container name is missing.');
}

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

export async function uploadPdfToAzureBlob(fileBuffer, fileName) {
  try {
    // Ensure fileName is a string
    if (typeof fileName !== 'string') {
      throw new Error('fileName must be a string.');
    }

    const containerClient = blobServiceClient.getContainerClient(BLOB_CONTAINER_NAME);
    await containerClient.createIfNotExists();

    const blobClient = containerClient.getBlockBlobClient(fileName);

    if (!Buffer.isBuffer(fileBuffer)) {
      throw new Error('fileBuffer must be a Buffer.');
    }

    await blobClient.upload(fileBuffer, fileBuffer.length);

    return blobClient.url;
  } catch (error) {
    console.error('Error uploading file to Azure Blob Storage:', error.message);
    throw error;
  }
}
