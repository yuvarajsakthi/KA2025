
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CSVRow {
  internId: string;
  fullName: string;
  hackerrankUrl: string;
  leetcodeUrl: string;
}

interface CSVUploaderProps {
  onDataUpload: (data: CSVRow[]) => void;
}

export const CSVUploader = ({ onDataUpload }: CSVUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return {
        internId: values[0] || '',
        fullName: values[1] || '',
        hackerrankUrl: values[2] || '',
        leetcodeUrl: values[3] || ''
      };
    }).filter(row => row.fullName && (row.hackerrankUrl || row.leetcodeUrl));
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV file.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const text = await file.text();
      const data = parseCSV(text);
      
      if (data.length === 0) {
        toast({
          title: 'No valid data found',
          description: 'Please check your CSV format.',
          variant: 'destructive',
        });
        return;
      }

      setUploadedFile(file);
      onDataUpload(data);
      
      toast({
        title: 'CSV uploaded successfully',
        description: `Found ${data.length} valid profiles.`,
      });
    } catch (error) {
      toast({
        title: 'Error parsing CSV',
        description: 'Please check your file format.',
        variant: 'destructive',
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    onDataUpload([]);
  };

  return (
    <div className="w-full max-w-md">
      {!uploadedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Drag and drop your CSV file here, or click to browse
          </p>
          <Button variant="outline" asChild>
            <label className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              {uploadedFile.name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFile}
            className="text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
