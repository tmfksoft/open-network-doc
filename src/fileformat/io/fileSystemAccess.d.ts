export {}

declare global {
  interface SaveFilePickerOptions {
    suggestedName?: string
    types?: { description?: string; accept: Record<string, string[]> }[]
  }

  interface FileSystemWritableFileStream extends WritableStream {
    write(data: BufferSource | Blob | string): Promise<void>
    close(): Promise<void>
  }

  interface FileSystemFileHandle {
    readonly name: string
    createWritable(): Promise<FileSystemWritableFileStream>
    getFile(): Promise<File>
  }

  interface Window {
    showSaveFilePicker?(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>
  }
}
