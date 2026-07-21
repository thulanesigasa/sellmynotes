"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, File as FileIcon, X, CheckCircle2, Sparkles } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { uploadRawNote, NoteMetadata } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<NoteMetadata>({
    title: '',
    institution: '',
    course_code: '',
    description: '',
    price_zar: 0,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
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

  const analyzeFile = async (selectedFile: File) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    const toastId = toast.loading('AI is scanning, auto-straightening, and valuating your notes...');
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('http://localhost:8000/api/notes/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('AI analysis failed');
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setAnalysisResult(result);
        
        let fileToSave = selectedFile;
        if (result.straightened_image) {
          try {
            const arr = result.straightened_image.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            const straightenedFile = new File([u8arr], selectedFile.name, { type: mime });
            fileToSave = straightenedFile;
            setFile(straightenedFile);
            toast.info('AI detected page rotation and has straightened your uploaded notes image!', {
              duration: 5000
            });
          } catch (decodeErr) {
            console.error('Failed to parse straightened image:', decodeErr);
          }
        }

        setMetadata({
          title: result.extracted_metadata.title,
          institution: result.extracted_metadata.institution,
          course_code: result.extracted_metadata.course_code,
          description: result.extracted_metadata.description,
          price_zar: result.valuation.final_price_zar,
          ocr_text: result.ocr_text,
          suggested_price: result.valuation.base_price_zar,
          ai_review_comment: result.extracted_metadata.ai_review_comment,
          ai_review_rating: result.extracted_metadata.ai_review_rating,
        });
        toast.dismiss(toastId);
        toast.success('AI Scanner completed! Metadata & valuation suggestions successfully extracted.');
      }
    } catch (err: any) {
      console.error('Error analyzing note:', err);
      toast.dismiss(toastId);
      toast.error('AI was unable to extract note metadata. Please enter details manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        analyzeFile(selectedFile);
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
        analyzeFile(selectedFile);
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    if (!metadata.title || !metadata.institution || !metadata.course_code || !metadata.description || metadata.price_zar <= 0) {
      toast.error('Please fill in all fields including a valid selling price.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      toast.loading('Initializing secure direct cloud upload...');
      
      await uploadRawNote(file, metadata, (progress) => {
        setUploadProgress(progress);
      });
      
      toast.dismiss();
      toast.success('Upload complete! Your notes are now saved as a draft.');
      
      // Reset form state
      setFile(null);
      setMetadata({ title: '', institution: '', course_code: '', description: '', price_zar: 0, ocr_text: '', suggested_price: 0, ai_review_comment: '', ai_review_rating: 0 });
      setAnalysisResult(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Redirect user
      setTimeout(() => {
        router.push('/seller');
      }, 1500);
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Upload failed: ${error.message || 'Unknown network error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <Toaster position="top-right" richColors />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sell Your Notes</h1>
        <p className="text-gray-500 mb-8">Upload your study materials securely to calculate their smart valuation.</p>

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
                  className="mt-2 text-sm text-red-500 hover:text-red-700 flex items-center border-b border-transparent hover:border-red-700"
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

          {/* AI Scanning Loader */}
          {isAnalyzing && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-8 flex flex-col items-center justify-center space-y-4">
              <div className="scanning-loader">
                <span className="scanning-bar"></span>
                <span className="scanning-bar"></span>
                <span className="scanning-bar"></span>
              </div>
              <div className="text-sm font-semibold text-blue-900">AI Note Valuation Engine Analysing...</div>
              <div className="text-xs text-blue-700 max-w-sm text-center">Reading PDF pages, running OCR, extracting course modules, and calculating suggested marketplace value. This takes about 5 seconds.</div>
            </div>
          )}

          {/* AI Smart Review */}
          {analysisResult && !isAnalyzing && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-150 rounded-xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <span className="font-bold text-gray-900 text-base">AI Smart Valuation Review</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                  <span>Score:</span>
                  <span>{analysisResult.valuation.quality_score}/10</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <span className="block font-semibold text-xs text-gray-500 uppercase tracking-wider">Suggested ZAR Price</span>
                  <span className="text-2xl font-extrabold text-gray-900 mt-1 block">R{analysisResult.valuation.final_price_zar}</span>
                  <span className="text-xs text-gray-400 block mt-0.5">(Includes 40% platform markup on base R{analysisResult.valuation.base_price_zar})</span>
                </div>
                <div>
                  <span className="block font-semibold text-xs text-gray-500 uppercase tracking-wider">AI Valuation Reasoning</span>
                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{analysisResult.valuation.reasoning}</p>
                </div>
              </div>
              <div className="bg-white/80 border border-blue-50 rounded-lg p-3 text-xs text-blue-800 flex items-start space-x-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p><strong>Autofill Active:</strong> AI successfully extracted module codes and names. You can inspect the pre-filled fields below and tweak them before publishing.</p>
              </div>
            </div>
          )}

          {/* Real-time Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <span>Uploading direct to cloud...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Metadata Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Document Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={metadata.title || ''}
                onChange={handleChange}
                placeholder="e.g. Intro to Machine Learning Finals"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="institution" className="block text-sm font-medium text-gray-700">Institution</label>
              <input
                type="text"
                id="institution"
                name="institution"
                value={metadata.institution}
                onChange={handleChange}
                placeholder="e.g. University of Cape Town or Pretoria High School"
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
            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between items-center">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                {analysisResult && (
                  <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 animate-pulse font-medium">
                    <Sparkles className="h-3 w-3 fill-blue-100" /> AI Refined Summary
                  </span>
                )}
              </div>
              <textarea
                id="description"
                name="description"
                value={metadata.description}
                onChange={handleChange}
                placeholder="Describe your study notes (topics covered, chapter summaries, format, neatness)..."
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                  analysisResult ? 'border-blue-300 ring-2 ring-blue-50 bg-blue-50/5' : 'border-gray-300'
                }`}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="price_zar" className="block text-sm font-medium text-gray-700">
                Selling Price (ZAR) {analysisResult && <span className="text-xs text-blue-600 font-medium">(AI Suggested: R{analysisResult.valuation.final_price_zar})</span>}
              </label>
              <div className="relative rounded-lg shadow-sm max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">R</span>
                </div>
                <input
                  type="number"
                  name="price_zar"
                  id="price_zar"
                  value={metadata.price_zar || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setMetadata(prev => ({ ...prev, price_zar: val }));
                  }}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                  placeholder="e.g. 150"
                  min={10}
                  max={500}
                  required
                />
              </div>
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
                Direct Cloud Upload ({uploadProgress}%)
              </span>
            ) : (
              <span className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Publish Notes & Set Price
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
