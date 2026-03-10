import * as FileSystem from 'expo-file-system';
const FS: any = FileSystem;
import { unzip } from 'react-native-zip-archive';

/**
 * Service to manage Vosk speech recognition models.
 * Handles downloading, unzipping, and storage management.
 */

const MODEL_ZIP_URL = 'https://huggingface.co/localstack/vosk-models/resolve/main/vosk-model-small-en-in-0.4.zip';
const MODEL_FOLDER_NAME = 'vosk-model';
const MODEL_SUBFOLDER = 'vosk-model-small-en-in-0.4'; // Name inside the zip

// Paths in the device storage
export const MODELS_ROOT_DIR = `${FS.documentDirectory}${MODEL_FOLDER_NAME}/`;
export const EN_MODEL_PATH = `${MODELS_ROOT_DIR}${MODEL_SUBFOLDER}`;
const ZIP_TEMP_PATH = `${FS.cacheDirectory}vosk-model-en.zip`;

/**
 * Checks if the English Vosk model is already downloaded and extracted.
 * @returns {Promise<string | null>} The path to the model if it exists, null otherwise.
 */
export async function getExistingModelPath(): Promise<string | null> {
    try {
        const info = await FileSystem.getInfoAsync(EN_MODEL_PATH);
        if (info.exists && info.isDirectory) {
            const contents = await FileSystem.readDirectoryAsync(EN_MODEL_PATH);
            // Basic check: Vosk models usually have 'am' and 'conf' directories/files
            if (contents.length > 0) {
                return EN_MODEL_PATH;
            }
        }
    } catch (error) {
        console.error('[VoskService] Error checking model path:', error);
    }
    return null;
}

/**
 * Downloads and unzips the Vosk model if it doesn't exist.
 * @param onProgress Callback for download progress (0 to 1)
 * @returns {Promise<string>} The absolute path to the loaded model
 */
export async function downloadAndSetupModel(
    onProgress?: (progress: number) => void
): Promise<string> {
    // 1. Check if already exists
    const existingPath = await getExistingModelPath();
    if (existingPath) {
        console.log('[VoskService] Model already exists at:', existingPath);
        onProgress?.(1.0);
        return existingPath;
    }

    console.log('[VoskService] Model not found locally. Starting download...');

    // 2. Ensure the root models directory exists
    const rootInfo = await FileSystem.getInfoAsync(MODELS_ROOT_DIR);
    if (!rootInfo.exists) {
        await FileSystem.makeDirectoryAsync(MODELS_ROOT_DIR, { intermediates: true });
    }

    // 3. Create download resumable
    const downloadResumable = FileSystem.createDownloadResumable(
        MODEL_ZIP_URL,
        ZIP_TEMP_PATH,
        {},
        (downloadProgress) => {
            if (onProgress) {
                const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                // Download is 80% of the total process
                onProgress(progress * 0.8);
            }
        }
    );

    try {
        const result = await downloadResumable.downloadAsync();

        if (!result || result.status !== 200) {
            throw new Error(`Failed to download model zip. Status: ${result?.status}`);
        }

        console.log('[VoskService] Download complete. Unzipping to:', MODELS_ROOT_DIR);
        onProgress?.(0.9); // 90% after download

        // 4. Unzip
        // react-native-zip-archive's unzip takes (sourcePath, targetDirectory)
        // It will create the subfolder if it exists in the zip
        await unzip(ZIP_TEMP_PATH, MODELS_ROOT_DIR);

        console.log('[VoskService] Unzip complete.');
        onProgress?.(1.0);

        // 5. Cleanup zip file
        await FileSystem.deleteAsync(ZIP_TEMP_PATH, { idempotent: true });

        return EN_MODEL_PATH;
    } catch (error) {
        console.error('[VoskService] Setup error:', error);
        // Cleanup on failure
        try {
            await FileSystem.deleteAsync(ZIP_TEMP_PATH, { idempotent: true });
        } catch { }
        throw error;
    }
}
