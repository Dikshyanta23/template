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
  // Default values for 20 questions
  const defaultQuestions = Array(20).fill({
    text: 'Default Question Text',
    options: [
      { text: 'Option 1', explanation: 'Explanation for Option 1' },
      { text: 'Option 2', explanation: 'Explanation for Option 2' },
      { text: 'Option 3', explanation: 'Explanation for Option 3' },
      { text: 'Option 4', explanation: 'Explanation for Option 4' },
    ],
    correctAnswer: 0, // Default correct answer index
  });

  const [formData, setFormData] = useState({
    title: 'Default Course Title',
    description: 'Default Course Description',
    collection: '',
    topics: 'Topic1, Topic2, Topic3',
    image: null,
    questions: defaultQuestions,
  });
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [newCollectionDialogOpen, setNewCollectionDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');

  // Fetch collections on component mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get('/api/collections');
        setCollections(response.data.collections);
      } catch (err) {
        console.error('Error fetching collections:', err);
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
        const [_, optionIndex, key] = field.split('-');
        updatedQuestions[index].options[optionIndex][key] = value;
      } else if (field === 'correctAnswer') {
        updatedQuestions[index].correctAnswer = parseInt(value, 10);
      }
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Validate questions before submission
  const validateQuestions = () => {
    const newErrors = {};
    formData.questions.forEach((question, index) => {
      if (!question.text.trim()) {
        newErrors[`question-${index}-text`] = 'Question text is required';
      }
      question.options.forEach((option, optionIndex) => {
        if (!option.text.trim()) {
          newErrors[`question-${index}-option-${optionIndex}-text`] = 'Option text is required';
        }
        if (!option.explanation.trim()) {
          newErrors[`question-${index}-option-${optionIndex}-explanation`] =
            'Explanation is required';
        }
      });
      if (
        typeof question.correctAnswer !== 'number' ||
        question.correctAnswer < 0 ||
        question.correctAnswer > 3
      ) {
        newErrors[`question-${index}-correctAnswer`] = 'Correct answer must be a valid index (0-3)';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

      // Append transformed questions
      const transformedQuestions = formData.questions.map((question) => ({
        text: question.text,
        options: question.options.map((option) => ({
          text: option.text,
          explanation: option.explanation,
        })),
        correctAnswer: question.correctAnswer,
      }));
      formDataToSend.append('questions', JSON.stringify(transformedQuestions));

      // Send the data to the backend
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
      const response = await axios.post('/api/admin/collections', {
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
          />

          {/* Collection */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="collection-label">Collection</InputLabel>
            <Select
              labelId="collection-label"
              name="collection"
              value={formData.collection}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, collection: e.target.value }))
              }
              label="Collection"
              required
            >
              {collections.map((collection) => (
                <MenuItem key={collection._id} value={collection._id}>
                  {collection.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Add New Collection Button */}
          <Button
            onClick={() => setNewCollectionDialogOpen(true)}
            variant="outlined"
            color="primary"
            sx={{ mb: 2 }}
          >
            Add New Collection
          </Button>

          {/* Topics */}
          <TextField
            label="Topics (comma-separated)"
            name="topics"
            value={formData.topics}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />

          {/* Image Upload */}
          <TextField
            type="file"
            name="image"
            onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.files[0] }))}
            fullWidth
            margin="normal"
            required
          />

          {/* Questions Section */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Questions (Exactly 20 Required)
            </Typography>
            {formData.questions.map((question, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Question {index + 1}</Typography>
                <TextField
                  label="Question Text"
                  value={question.text}
                  onChange={(e) =>
                    handleQuestionChange(index, 'text', e.target.value)
                  }
                  fullWidth
                  margin="normal"
                  required
                />
                <Grid container spacing={2}>
                  {[0, 1, 2, 3].map((optionIndex) => (
                    <Grid item xs={6} key={optionIndex}>
                      <TextField
                        label={`Option ${optionIndex + 1}`}
                        value={question.options[optionIndex].text}
                        onChange={(e) =>
                          handleQuestionChange(
                            index,
                            `option-${optionIndex}-text`,
                            e.target.value
                          )
                        }
                        fullWidth
                        margin="normal"
                        required
                      />
                      <TextField
                        label={`Explanation for Option ${optionIndex + 1}`}
                        value={question.options[optionIndex].explanation}
                        onChange={(e) =>
                          handleQuestionChange(
                            index,
                            `option-${optionIndex}-explanation`,
                            e.target.value
                          )
                        }
                        fullWidth
                        margin="normal"
                        required
                      />
                    </Grid>
                  ))}
                </Grid>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Correct Answer</InputLabel>
                  <Select
                    value={question.correctAnswer || ''}
                    onChange={(e) =>
                      handleQuestionChange(index, 'correctAnswer', e.target.value)
                    }
                    label="Correct Answer"
                    required
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

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

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