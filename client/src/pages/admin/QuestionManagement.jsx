// client/src/pages/admin/QuestionManagement.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

export default function QuestionManagement() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [formData, setFormData] = useState({
    text: '',
    options: [
      { text: '', explanation: '', isCorrect: false },
      { text: '', explanation: '', isCorrect: false },
      { text: '', explanation: '', isCorrect: false },
      { text: '', explanation: '', isCorrect: false }
    ]
  });
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const [bulkJsonError, setBulkJsonError] = useState('');
  
  useEffect(() => {
    fetchData();
  }, [courseId]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, questionsRes] = await Promise.all([
        axios.get(`/api/courses/${courseId}`),
        axios.get(`/api/questions/course/${courseId}`)
      ]);
      
      setCourse(courseRes.data.course);
      setQuestions(questionsRes.data.questions);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;
    
    setFormData(prev => ({ ...prev, options: newOptions }));
    
    // Clear option errors
    if (formErrors.options && formErrors.options[index] && formErrors.options[index][field]) {
      const newErrors = { ...formErrors };
      newErrors.options[index][field] = '';
      setFormErrors(newErrors);
    }
  };
  
  const handleCorrectChange = (index) => {
    const newOptions = [...formData.options];
    newOptions[index].isCorrect = !newOptions[index].isCorrect;
    
    setFormData(prev => ({ ...prev, options: newOptions }));
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.text.trim()) {
      errors.text = 'Question text is required';
    }
    
    const optionErrors = [];
    let hasCorrectOption = false;
    
    formData.options.forEach((option, index) => {
      const optionError = {};
      
      if (!option.text.trim()) {
        optionError.text = 'Option text is required';
      }
      
      if (!option.explanation.trim()) {
        optionError.explanation = 'Explanation is required';
      }
      
      if (option.isCorrect) {
        hasCorrectOption = true;
      }
      
      if (Object.keys(optionError).length > 0) {
        optionErrors[index] = optionError;
      }
    });
    
    if (optionErrors.length > 0) {
      errors.options = optionErrors;
    }
    
    if (!hasCorrectOption) {
      errors.general = 'At least one option must be marked as correct';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleOpenDialog = (question = null) => {
    if (question) {
      setSelectedQuestion(question);
      setFormData({
        text: question.text,
        options: [...question.options]
      });
    } else {
      setSelectedQuestion(null);
      setFormData({
        text: '',
        options: [
          { text: '', explanation: '', isCorrect: false },
          { text: '', explanation: '', isCorrect: false },
          { text: '', explanation: '', isCorrect: false },
          { text: '', explanation: '', isCorrect: false }
        ]
      });
    }
    
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormErrors({});
  };
  
  const handleOpenDeleteDialog = (question) => {
    setSelectedQuestion(question);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      if (selectedQuestion) {
        // Update existing question
        await axios.put(`/api/questions/${selectedQuestion._id}`, {
          text: formData.text,
          options: formData.options
        });
        
        setQuestions(prev => 
          prev.map(q => 
            q._id === selectedQuestion._id 
              ? { ...q, text: formData.text, options: formData.options } 
              : q
          )
        );
        
        setSnackbar({
          open: true,
          message: 'Question updated successfully',
          severity: 'success'
        });
      } else {
        // Create new question
        const { data } = await axios.post('/api/questions', {
          courseId,
          text: formData.text,
          options: formData.options
        });
        
        setQuestions(prev => [...prev, data.question]);
        
        setSnackbar({
          open: true,
          message: 'Question created successfully',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving question:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to save question. Please try again.',
        severity: 'error'
      });
    }
  };
  
  const handleDelete = async () => {
    try {
      await axios.delete(`/api/questions/${selectedQuestion._id}`);
      
      setQuestions(prev => prev.filter(q => q._id !== selectedQuestion._id));
      
      setSnackbar({
        open: true,
        message: 'Question deleted successfully',
        severity: 'success'
      });
      
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error deleting question:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete question. Please try again.',
        severity: 'error'
      });
    }
  };
  
  const handleOpenBulkUpload = () => {
    setBulkJson('');
    setBulkJsonError('');
    setBulkUploadOpen(true);
  };
  
  const handleCloseBulkUpload = () => {
    setBulkUploadOpen(false);
  };
  
  const handleBulkJsonChange = (e) => {
    setBulkJson(e.target.value);
    setBulkJsonError('');
  };
  
  const handleBulkUpload = async () => {
    try {
      let questions;
      
      try {
        questions = JSON.parse(bulkJson);
      } catch (err) {
        setBulkJsonError('Invalid JSON format');
        return;
      }
      
      if (!Array.isArray(questions)) {
        setBulkJsonError('JSON must be an array of questions');
        return;
      }
      
      // Validate questions format
      const isValid = questions.every(q => 
        q.text && 
        Array.isArray(q.options) && 
        q.options.length >= 2 &&
        q.options.every(o => o.text && o.explanation !== undefined) &&
        q.options.some(o => o.isCorrect)
      );
      
      if (!isValid) {
        setBulkJsonError('Invalid question format. Each question must have text and at least 2 options with text, explanation, and at least one correct option.');
        return;
      }
      
      const { data } = await axios.post('/api/questions/bulk', {
        courseId,
        questions
      });
      
      // Refresh questions
      fetchData();
      
      setSnackbar({
        open: true,
        message: `${data.count} questions uploaded successfully`,
        severity: 'success'
      });
      
      handleCloseBulkUpload();
    } catch (err) {
      console.error('Error uploading questions:', err);
      setBulkJsonError(err.response?.data?.message || 'Failed to upload questions. Please try again.');
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error" align="center">{error}</Typography>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/courses')}
          >
            Back to Courses
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/courses')}
          sx={{ mb: 2 }}
        >
          Back to Courses
        </Button>
        
        <Typography variant="h4" component="h1">
          Questions for: {course?.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {course?.collection}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5">
          {questions.length} Questions
        </Typography>
        
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleOpenBulkUpload}
            sx={{ mr: 2 }}
          >
            Bulk Upload
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New Question
          </Button>
        </Box>
      </Box>
      
      {questions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" paragraph>
            No questions yet for this course.
          </Typography>
          <Typography variant="body1" paragraph>
            Add questions manually or use bulk upload to add multiple questions at once.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add First Question
          </Button>
        </Paper>
      ) : (
        <Box>
          {questions.map((question, index) => (
            <Accordion key={question._id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  <strong>Q{index + 1}:</strong> {question.text}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  {question.options.map((option, i) => (
                    <Card 
                      key={i} 
                      variant="outlined" 
                      sx={{ 
                        mb: 1,
                        borderColor: option.isCorrect ? 'success.main' : 'divider',
                        bgcolor: option.isCorrect ? 'success.light' : 'background.paper'
                      }}
                    >
                      <CardContent>
                        <Typography variant="body1">
                          <strong>{String.fromCharCode(65 + i)}.</strong> {option.text}
                          {option.isCorrect && (
                            <Typography 
                              component="span" 
                              color="success.main" 
                              sx={{ ml: 1, fontWeight: 'bold' }}
                            >
                              (Correct)
                            </Typography>
                          )}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          <strong>Explanation:</strong> {option.explanation}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(question)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={() => handleOpenDeleteDialog(question)}
                  >
                    Delete
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
      
      {/* Question Form Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedQuestion ? 'Edit Question' : 'Add New Question'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            {formErrors.general && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formErrors.general}
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Question Text"
              name="text"
              value={formData.text}
              onChange={handleInputChange}
              error={!!formErrors.text}
              helperText={formErrors.text}
              required
              sx={{ mb: 3 }}
            />
            
            <Typography variant="h6" gutterBottom>
              Options
            </Typography>
            
            {formData.options.map((option, index) => (
              <Box key={index} sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Option {String.fromCharCode(65 + index)}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Option Text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                      error={!!(formErrors.options && formErrors.options[index]?.text)}
                      helperText={formErrors.options && formErrors.options[index]?.text}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Explanation"
                      multiline
                      rows={2}
                      value={option.explanation}
                      onChange={(e) => handleOptionChange(index, 'explanation', e.target.value)}
                      error={!!(formErrors.options && formErrors.options[index]?.explanation)}
                      helperText={formErrors.options && formErrors.options[index]?.explanation}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={option.isCorrect}
                          onChange={() => handleCorrectChange(index)}
                          color="success"
                        />
                      }
                      label="This is the correct answer"
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedQuestion ? 'Update Question' : 'Create Question'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this question? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Bulk Upload Dialog */}
      <Dialog open={bulkUploadOpen} onClose={handleCloseBulkUpload} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Upload Questions</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Upload multiple questions at once by pasting a JSON array of questions.
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom>
            JSON Format Example:
          </Typography>
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.100' }}>
            <pre style={{ overflow: 'auto', margin: 0 }}>
{`[
  {
    "text": "What is the capital of France?",
    "options": [
      {
        "text": "London",
        "explanation": "London is the capital of the UK, not France.",
        "isCorrect": false
      },
      {
        "text": "Paris",
        "explanation": "Paris is indeed the capital of France.",
        "isCorrect": true
      },
      {
        "text": "Berlin",
        "explanation": "Berlin is the capital of Germany, not France.",
        "isCorrect": false
      },
      {
        "text": "Madrid",
        "explanation": "Madrid is the capital of Spain, not France.",
        "isCorrect": false
      }
    ]
  },
  {
    "text": "Another question...",
    "options": [...]
  }
]`}
            </pre>
          </Paper>
          
          <TextField
            fullWidth
            label="Paste JSON here"
            multiline
            rows={10}
            value={bulkJson}
            onChange={handleBulkJsonChange}
            error={!!bulkJsonError}
            helperText={bulkJsonError}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBulkUpload}>Cancel</Button>
          <Button onClick={handleBulkUpload} variant="contained" color="primary">
            Upload Questions
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}