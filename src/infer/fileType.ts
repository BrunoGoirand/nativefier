type FileTypeResult = {
  ext: string;
  mime: string;
};

type FileTypeModule = {
  fileTypeFromBuffer: (
    data: Uint8Array | ArrayBuffer,
  ) => Promise<FileTypeResult | undefined>;
};
type ImportFileType = (moduleName: 'file-type') => Promise<FileTypeModule>;

// Keep the ESM-only file-type package loadable from Nativefier's CommonJS build.
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const importFileType = new Function(
  'moduleName',
  'return import(moduleName)',
) as ImportFileType;

export async function detectFileTypeFromBuffer(
  data: Buffer,
): Promise<FileTypeResult | undefined> {
  const fileType = await importFileType('file-type');
  return fileType.fileTypeFromBuffer(data);
}
