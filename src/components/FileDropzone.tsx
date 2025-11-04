"use client"

import * as React from "react"
import { useDropzone, FileRejection, Accept } from "react-dropzone"
import { Upload, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from '@/lib/utils'

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void
  files?: File[]
  onRemoveFile: () => void
  maxSizeMB?: number
}

export function FileDropzone({
  onFilesSelected,
  files = [],
  onRemoveFile,
  maxSizeMB = 5,
}: FileDropzoneProps) {
  const [error, setError] = React.useState<string | null>(null);


  // Accept only document/text files
  const acceptedFileTypes: Accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.apple.pages': ['.pages'],
    'text/plain': ['.txt'],
    'text/markdown': ['.md', '.markdown'],
  }



  const handleDrop = React.useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setError(null)
    
    if (rejectedFiles && rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File is too large. Maximum size is ${maxSizeMB}MB`)
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload PDF, Word, Pages, Markdown, or TXT file.')
      } else {
        setError('File was rejected. Please check the file type and size.')
      }
      return
    }
    
    if (acceptedFiles.length === 0) return;
    
    // Take only the first file (single file upload)
    const file = acceptedFiles[0];
    onFilesSelected([file]);
  }, [maxSizeMB, onFilesSelected]);



  const removeFile = React.useCallback(() => {
    onRemoveFile();
    setError(null);
  }, [onRemoveFile]);



  const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({
    onDrop: handleDrop,
    accept: acceptedFileTypes,
    multiple: false,
    maxSize: maxSizeMB * 1024 * 1024,
  });



  return (
    <>
      {files.length > 0 ? (
        <div className="mt-4 p-4 rounded-lg border bg-card">
          <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
              <FileText className="size-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" title={files[0].name}>
                  {files[0].name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                  {(files[0].size / (1024 * 1024)).toFixed(2)} MB
                  </p>
              </div>
              </div>
              <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-destructive hover:bg-destructive/10 cursor-pointer"
              onClick={removeFile}
              aria-label={`Remove ${files[0].name}`}
              >
              <X className="size-4" />
              </Button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md mx-auto">
          <div
          {...getRootProps()}
          className={cn(
            'border-dashed border-2 border-muted/80 bg-muted/30 flex flex-col items-center justify-center py-8 px-4 rounded-2xl cursor-pointer text-muted-foreground hover:bg-accent/30 outline-none transition-colors min-h-[160px]',
            isDragActive && 'border-primary bg-accent/40',
            isFocused && 'ring-2 ring-primary',
          )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2 text-center select-none pointer-events-none">
              <span className="flex items-center justify-center rounded-full border p-3 mb-1 mx-auto">
                <Upload className="size-7 text-primary" />
              </span>
              <span className="font-medium text-base">
                Click or drag a document here
              </span>
              <span className="text-xs opacity-70">
                PDF, Word, Pages, Markdown, or TXT
              </span>
              <span className="text-xs opacity-70">Maximum {maxSizeMB}MB</span>
              {error && <span className="pt-2 text-destructive text-sm font-medium">{error}</span>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}