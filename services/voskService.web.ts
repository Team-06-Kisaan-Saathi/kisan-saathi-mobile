
/**
 * Web version of VoskService (No-op)
 * Local speech recognition models are not supported on web.
 */

export const MODELS_ROOT_DIR = '';
export const EN_MODEL_PATH = '';

export async function getExistingModelPath(): Promise<string | null> {
    return null;
}

export async function downloadAndSetupModel(
    onProgress?: (progress: number) => void
): Promise<string> {
    console.warn('[VoskService] Speech recognition models are not supported on web.');
    onProgress?.(1.0);
    return '';
}
