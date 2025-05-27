import { BlobServiceClient } from '@azure/storage-blob';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const AZURE_STORAGE_CONNECTION_STRING = process.env.NEXT_PUBLIC_AZURE_STORAGE_CONNECTION_STRING;
const BLOB_CONTAINER_NAME = process.env.NEXT_PUBLIC_AZURE_BLOB_IMAGE_CONTAINER_NAME;

if (!AZURE_STORAGE_CONNECTION_STRING || !BLOB_CONTAINER_NAME) {
  throw new Error('Azure Storage connection string or container name is missing.');
}

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

async function downloadImage(imageUrl, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      return Buffer.from(response.data);
    } catch (error) {
      console.error(`Attempt ${attempt} - Error downloading image:`, error);
      if (attempt === retries) {
        throw new Error('Failed to download image after multiple attempts.');
      }
    }
  }
}

export async function uploadImageToAzureBlob(imageUrl) {
  const fileName = `story-image-${uuidv4()}.png`;
  try {
    if (typeof fileName !== 'string') {
      throw new Error('fileName must be a string.');
    }

    const containerClient = blobServiceClient.getContainerClient(BLOB_CONTAINER_NAME);
    await containerClient.createIfNotExists();

    const blobClient = containerClient.getBlockBlobClient(fileName);

    const fileBuffer = await downloadImage(imageUrl);

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
