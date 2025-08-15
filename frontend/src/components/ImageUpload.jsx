import React, { useState, useCallback } from 'react';
import { Box, Button, Typography, LinearProgress, Alert } from '@mui/material';
import { PhotoCamera, PictureAsPdf, CloudUpload } from '@mui/icons-material';

const ImageUpload = ({ onUploadComplete, loading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
  setUploadError('');

  // ADD THIS DEBUG CODE:
  console.log('File selected:', {
    name: file.name,
    type: file.type,
    size: file.size
  });

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'image/PNG'];
  if (!validTypes.includes(file.type)) {
    console.log('File type rejected:', file.type); // DEBUG
    setUploadError('Please upload an image (JPG, PNG) or PDF file');
    return;
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    console.log('File size rejected:', file.size); // DEBUG
    setUploadError('File size must be less than 10MB');
    return;
  }

  console.log('File validated, calling onUploadComplete'); // DEBUG
  onUploadComplete(file);
};


  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          border: `2px dashed ${dragActive ? '#00ffc3' : '#555'}`,
          borderRadius: 3,
          p: 4,
          textAlign: 'center',
          bgcolor: dragActive ? 'rgba(0, 255, 195, 0.1)' : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          '&:hover': {
            borderColor: '#00ffc3',
            bgcolor: 'rgba(0, 255, 195, 0.05)'
          }
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload').click()}
      >
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.PNG,.JPG,.JPEG,.PDF"

          style={{ display: 'none' }}
          onChange={handleFileSelect}
          disabled={loading}
        />

        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />

        <Typography variant="h6" sx={{ mb: 1 }}>
          📸 Upload Recipe Image or PDF
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Drag & drop files here, or click to select
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PhotoCamera fontSize="small" />
            <Typography variant="body2">JPG, PNG</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PictureAsPdf fontSize="small" />
            <Typography variant="body2">PDF</Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          color="primary"
          disabled={loading}
          sx={{ mt: 1 }}
        >
          Choose Files
        </Button>
      </Box>

      {loading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            🤖 Processing image with AI...
          </Typography>
        </Box>
      )}

      {uploadError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {uploadError}
        </Alert>
      )}
    </Box>
  );
};

export default ImageUpload;
