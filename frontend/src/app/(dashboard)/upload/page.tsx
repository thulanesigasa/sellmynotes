"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, File as FileIcon, X, CheckCircle2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { uploadFileDirectly, NoteMetadata } from '@/lib/storage';

const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<NoteMetadata>({
    title: '',
    university: '',
    course_code: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (selectedFile: File): boolean => {
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      toast.error('Invalid file type. Please upload a PDF, JPG, or PNG.');
      return false;
    }
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return false;
    }
    return true;
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'course_code' && value.length > 10) return;
    setMetadata(prev => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }
    if (!metadata.title || !metadata.university || !metadata.course_code) {
      toast.error('Please fill in all metadata fields.');
      return;
    }

    try {
      setIsUploading(true);
      toast.loading('Initializing secure upload...');
      
      await uploadFileDirectly(file, metadata);
      
      toast.dismiss();
      toast.success('File uploaded successfully! AI processing has started.');
      
      // Reset form
      setFile(null);
      setMetadata({ title: '', university: '', course_code: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <Toaster position="top-right" richColors />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sell Your Notes</h1>
        <p className="text-gray-500 mb-8">Upload your study material and our AI will automatically value it.</p>

        <form onSubmit={handleUpload} className="space-y-8">
          {/* Drag & Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            
            {file ? (
              <div className="flex flex-col items-center space-y-3">
                <FileIcon className="h-12 w-12 text-blue-500" />
                <div className="text-sm font-medium text-gray-900">{file.name}</div>
                <div className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="mt-2 text-sm text-red-500 hover:text-red-700 flex items-center"
                >
                  <X className="h-4 w-4 mr-1" /> Remove File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <UploadCloud className="h-12 w-12 text-gray-400" />
                <div className="text-sm font-medium text-gray-900">Click to upload or drag and drop</div>
                <div className="text-xs text-gray-500">PDF, JPG, or PNG (MAX. 15MB)</div>
              </div>
            )}
          </div>

          {/* Metadata Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Document Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={metadata.title}
                onChange={handleChange}
                placeholder="e.g. Intro to Machine Learning Finals"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="university" className="block text-sm font-medium text-gray-700">University</label>
              <input
                type="text"
                id="university"
                name="university"
                value={metadata.university}
                onChange={handleChange}
                placeholder="e.g. University of Cape Town"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="course_code" className="block text-sm font-medium text-gray-700">Course Code</label>
              <input
                type="text"
                id="course_code"
                name="course_code"
                value={metadata.course_code}
                onChange={handleChange}
                placeholder="e.g. CSC1015F"
                maxLength={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition uppercase"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading || !file}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center transition-all ${
              isUploading || !file ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isUploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading securely to cloud...
              </span>
            ) : (
              <span className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Submit for AI Valuation
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
