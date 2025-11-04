// Vercel Blob Storage - Modern, serverless file storage
// No API keys needed - uses Vercel's built-in Blob storage

import { put, head } from '@vercel/blob';
import { ENV } from './_core/env';

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/**
 * Upload file to Vercel Blob Storage
 * @param relKey - Relative path/key for the file (e.g., "uploads/image.jpg")
 * @param data - File data as Buffer, Uint8Array, or string
 * @param contentType - MIME type (default: "application/octet-stream")
 * @returns Object with key and public URL
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  
  try {
    // Convert data to format that @vercel/blob accepts
    // The put() function can accept Buffer, Blob, File, or ReadableStream
    let blobData: Blob | Buffer;
    
    if (typeof data === 'string') {
      blobData = new Blob([data], { type: contentType });
    } else if (Buffer.isBuffer(data)) {
      blobData = data; // Buffer works directly
    } else {
      // Uint8Array - convert to Buffer for Node.js compatibility
      blobData = Buffer.from(data);
    }

    // Upload to Vercel Blob
    // Note: BLOB_READ_WRITE_TOKEN is automatically available in Vercel environment
    // For local dev, it will use VERCEL_BLOB_STORE_ID if set, or require manual token
    const { url } = await put(key, blobData, {
      contentType,
      access: 'public', // Files are publicly accessible
    });

    return { key, url };
  } catch (error) {
    console.error('[Storage] Upload failed:', error);
    throw new Error(
      `Storage upload failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get file URL from Vercel Blob Storage
 * Note: In production, you should store the URL returned from storagePut in your database.
 * This function attempts to retrieve the blob, but for better performance, store URLs when uploading.
 * @param relKey - Relative path/key for the file
 * @param _expiresIn - Not used (Vercel Blob URLs are always accessible if public)
 * @returns Object with key and public URL
 */
export async function storageGet(
  relKey: string,
  _expiresIn = 300
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  
  try {
    // Try to get blob info using head() to verify it exists and get its URL
    // Note: In Vercel production, BLOB_READ_WRITE_TOKEN is automatically set
    const blob = await head(key);
    
    if (!blob.url) {
      throw new Error(`Blob not found for key: ${key}`);
    }
    
    return {
      key,
      url: blob.url,
    };
  } catch (error) {
    // If head() fails (blob doesn't exist), return a helpful error
    console.error('[Storage] Get failed:', error);
    throw new Error(
      `Storage get failed for key "${key}": ${error instanceof Error ? error.message : String(error)}. ` +
      `Make sure the file was uploaded and the URL was stored in your database.`
    );
  }
}
