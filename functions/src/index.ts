import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as crypto from 'crypto';
import sharp from 'sharp';

admin.initializeApp();

const THUMB_MAX_WIDTH = 200;
const THUMB_MAX_HEIGHT = 200;
const THUMB_PREFIX = 'thumb_';


export const generateThumbnail = functions
  .runWith({
    memory: '1GB',
    timeoutSeconds: 300,
  })
  .storage
  .bucket('jirani-5f130.firebasestorage.app')
  .object()
  .onFinalize(async (object: functions.storage.ObjectMetadata) => {
    console.log('Starting thumbnail generation for:', object.name);

    const filePath = object.name;
    const contentType = object.contentType;
    const bucket = admin.storage().bucket(object.bucket);

    // Exit if this is triggered on a file that is not an image
    if (!contentType?.startsWith('image/')) {
      console.log('This is not an image.');
      return null;
    }

    // Exit if this is a thumbnail
    if (filePath?.startsWith(THUMB_PREFIX)) {
      console.log('Already a Thumbnail.');
      return null;
    }

    // Exit if the image is missing required data
    if (!filePath) {
      console.log('File path is missing');
      return null;
    }

    const workingDir = path.join(os.tmpdir(), 'thumbs');
    const fileName = path.basename(filePath);
    const thumbFilePath = path.join(path.dirname(filePath), `${THUMB_PREFIX}${fileName}`);
    const tempFilePath = path.join(workingDir, fileName);
    const tempThumbFilePath = path.join(workingDir, `${THUMB_PREFIX}${fileName}`);

    try {
      // Create the temp directory if it doesn't exist
      await fs.promises.mkdir(workingDir, { recursive: true });

      console.log('Downloading original file:', filePath);
      // Download file from bucket
      await bucket.file(filePath).download({ destination: tempFilePath });

      console.log('Generating thumbnail...');
      // Generate thumbnail using sharp
      await sharp(tempFilePath)
        .resize(THUMB_MAX_WIDTH, THUMB_MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .withMetadata()
        .toFile(tempThumbFilePath);

      console.log('Uploading thumbnail:', thumbFilePath);
      // Upload thumbnail to bucket
      await bucket.upload(tempThumbFilePath, {
        destination: thumbFilePath,
        metadata: {
          contentType: 'image/jpeg',
          metadata: {
            isThumb: 'true',
            originalPath: filePath,
            firebaseStorageDownloadTokens: crypto.randomUUID(),
          },
          cacheControl: 'public, max-age=31536000',
        },
      });

      // Update the original file's metadata
      await bucket.file(filePath).setMetadata({
        metadata: {
          thumbnailPath: thumbFilePath,
          hasThumbnail: 'true',
        },
      });

      // Clean up temporary files
      try {
        await fs.promises.unlink(tempFilePath);
        await fs.promises.unlink(tempThumbFilePath);
        await fs.promises.rmdir(workingDir);
      } catch (cleanupError) {
        console.warn('Error cleaning up temporary files:', cleanupError);
      }

      console.log('Thumbnail created successfully:', thumbFilePath);
      return {
        success: true,
        thumbnailPath: thumbFilePath,
        originalPath: filePath,
      };
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      // Clean up any temporary files that might exist
      try {
        await fs.promises.unlink(tempFilePath);
        await fs.promises.unlink(tempThumbFilePath);
        await fs.promises.rmdir(workingDir);
      } catch (cleanupError) {
        console.warn('Error cleaning up after failure:', cleanupError);
      }
      throw new functions.https.HttpsError('internal', 'Error generating thumbnail', error);
    }
  });
