// client/src/pages/admin/CreateCourse.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  Alert,
} from '@mui/material';
import axios from 'axios';

export default function CreateCourse() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    collection: '',
    topics: '',
    image: null,
    questions: Array(20).fill({
      text: 'Default Question Text',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: 0,
    }),
    // questions: Array(20).fill({ text: '', options: ['', '', '', ''], correctAnswer: 0 }),
  });
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({}); // For real-time validation
  const [newCollectionDialogOpen, setNewCollectionDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [imagePreview, setImagePreview] = useState(null); // For image preview
  const [collectionsLoading, setCollectionsLoading] = useState(true); // Loading indicator for collections

  // Fetch existing collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get('/api/collections');
        setCollections(response.data.collections);
      } catch (err) {
        console.error('Error fetching collections:', err);
        setError('Failed to load collections');
      } finally {
        setCollectionsLoading(false); // Stop loading indicator
      }
    };
    fetchCollections();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle question changes
  const handleQuestionChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedQuestions = [...prev.questions];
      if (field === 'text') {
        updatedQuestions[index].text = value;
      } else if (field.startsWith('option')) {
        const optionIndex = parseInt(field.split('-')[1], 10);
        updatedQuestions[index].options[optionIndex] = value;
      } else if (field === 'correctAnswer') {
        updatedQuestions[index].correctAnswer = parseInt(value, 10);
      }
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Handle file upload
  const handleFileChange = (e) => {
  
    
    const file = e.target.files[0];
    console.log('Selected file: ', file);
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file)); // Set image preview
    } else {
      console.error('No file selected');
    }
  };

  // Real-time validation for questions
  const validateQuestions = () => {
    const newErrors = {};
    formData.questions.forEach((question, index) => {
      if (!question.text.trim()) {
        newErrors[`question-${index}-text`] = 'Question text is required';
      }
      if (question.options.some(option => !option.trim())) {
        newErrors[`question-${index}-options`] = 'All options must be filled';
      }
      if (!question.options.some(option => option.trim())) {
        newErrors[`question-${index}-correctAnswer`] = 'At least one correct answer is required';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateQuestions()) {
      return; // Stop submission if validation fails
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('collection', formData.collection);
      formDataToSend.append('topics', formData.topics);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      formDataToSend.append('questions', JSON.stringify(formData.questions));
  
      for (const [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }
  
      const response = await axios.post('/api/courses', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      console.log('Course created successfully:', response.data);
      alert('Course created successfully!');
      setLoading(false);
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Failed to create course');
      setLoading(false);
    }
  };

  // Handle adding a new collection
  const handleAddNewCollection = async () => {
    try {
      const response = await axios.post('/api/collections', {
        name: newCollectionName,
        description: newCollectionDescription,
      });
      setCollections((prev) => [...prev, response.data.collection]);
      setNewCollectionDialogOpen(false);
      setNewCollectionName('');
      setNewCollectionDescription('');
    } catch (err) {
      console.error('Error adding new collection:', err);
      setError('Failed to add new collection');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create New Course
      </Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <TextField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
            error={!!errors.title}
            helperText={errors.title}
          />

          {/* Description */}
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={4}
            margin="normal"
            required
            error={!!errors.description}
            helperText={errors.description}
          />

          {/* Collection */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="collection-label">Collection</InputLabel>
            <Select
              labelId="collection-label"
              name="collection"
              value={formData.collection}
              onChange={handleInputChange}
              label="Collection"
              required
            >
              {collectionsLoading ? (
                <MenuItem disabled>Loading collections...</MenuItem>
              ) : (
                collections.map((collection) => (
                  <MenuItem key={collection._id} value={collection._id}>
                    {collection.name}
                  </MenuItem>
                ))
              )}
              <MenuItem onClick={() => setNewCollectionDialogOpen(true)}>
                + Add New Collection
              </MenuItem>
            </Select>
          </FormControl>

          {/* Topics */}
          <TextField
            label="Topics (comma-separated)"
            name="topics"
            value={formData.topics}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            placeholder="e.g., Algebra, Calculus, Geometry"
            required
            error={!!errors.topics}
            helperText={errors.topics}
          />

          {/* Image Upload */}
          <Button variant="contained" component="label" fullWidth sx={{ mt: 2 }}>
            Upload Image
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          {imagePreview && (
  <Box sx={{ mt: 2 }}>
    <img src={imagePreview} alt="Preview" style={{ width: '100px', height: 'auto' }} />
  </Box>
)}

          {/* Questions Section */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Questions (Exactly 20 Required)
            </Typography>
            {formData.questions.map((question, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  Question {index + 1}
                </Typography>
                <TextField
                  label="Question Text"
                  value={question.text}
                  onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  error={!!errors[`question-${index}-text`]}
                  helperText={errors[`question-${index}-text`]}
                />
                <Grid container spacing={2}>
                  {[0, 1, 2, 3].map((optionIndex) => (
                    <Grid item xs={6} key={optionIndex}>
                      <TextField
                        label={`Option ${optionIndex + 1}`}
                        value={question.options[optionIndex]}
                        onChange={(e) =>
                          handleQuestionChange(index, `option-${optionIndex}`, e.target.value)
                        }
                        fullWidth
                        margin="normal"
                        required
                        error={!!errors[`question-${index}-options`]}
                        helperText={errors[`question-${index}-options`]}
                      />
                    </Grid>
                  ))}
                </Grid>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Correct Answer</InputLabel>
                  <Select
                    value={question.correctAnswer}
                    onChange={(e) =>
                      handleQuestionChange(index, 'correctAnswer', e.target.value)
                    }
                    label="Correct Answer"
                    required
                    error={!!errors[`question-${index}-correctAnswer`]}
                    helperText={errors[`question-${index}-correctAnswer`]}
                  >
                    {[0, 1, 2, 3].map((optionIndex) => (
                      <MenuItem key={optionIndex} value={optionIndex}>
                        Option {optionIndex + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            ))}
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Creating Course...' : 'Create Course'}
          </Button>
        </form>
      </Paper>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Add New Collection Dialog */}
      <Dialog open={newCollectionDialogOpen} onClose={() => setNewCollectionDialogOpen(false)}>
        <DialogTitle>Add New Collection</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            fullWidth
            margin="dense"
            required
          />
          <TextField
            label="Description"
            value={newCollectionDescription}
            onChange={(e) => setNewCollectionDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            margin="dense"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewCollectionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNewCollection} variant="contained" color="primary">
            Add Collection
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}