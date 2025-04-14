// client/src/pages/admin/QuestionManagement.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import axios from 'axios';

const QuestionManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    const fetchCourseAndQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch course details
        const courseRes = await axios.get(`/api/admin/courses/${courseId}`);
        setCourse(courseRes.data.course);
        
        // Fetch questions for this course
        const questionsRes = await axios.get(`/api/admin/courses/${courseId}/questions`);
        setQuestions(questionsRes.data.questions);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load course and questions');
        setLoading(false);
      }
    };
    
    fetchCourseAndQuestions();
  }, [courseId]);

  const handleOpenDialog = (question = null) => {
    if (question) {
      setCurrentQuestion({
        ...question,
        options: [...question.options]
      });
      setSelectedQuestionId(question._id);
    } else {
      setCurrentQuestion({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      });
      setSelectedQuestionId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentQuestion({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
    setSelectedQuestionId(null);
  };

  const handleOpenDeleteDialog = (questionId) => {
    setSelectedQuestionId(questionId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedQuestionId(null);
  };

  const handleOpenUploadDialog = () => {
    setOpenUploadDialog(true);
    setCsvFile(null);
    setUploadError(null);
  };

  const handleCloseUploadDialog = () => {
    setOpenUploadDialog(false);
    setCsvFile(null);
    setUploadError(null);
  };

  const handleQuestionChange = (e) => {
    setCurrentQuestion({
      ...currentQuestion,
      text: e.target.value
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  const handleCorrectAnswerChange = (e) => {
    setCurrentQuestion({
      ...currentQuestion,
      correctAnswer: parseInt(e.target.value)
    });
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
    setUploadError(null);
  };

  const handleSubmit = async () => {
    try {
      if (!currentQuestion.text || currentQuestion.options.some(opt => !opt)) {
        setError('Please fill in all fields');
        return;
      }
      
      setLoading(true);
      
      if (selectedQuestionId) {
        // Update existing question
        await axios.put(`/api/admin/questions/${selectedQuestionId}`, {
          text: currentQuestion.text,
          options: currentQuestion.options,
          correctAnswer: currentQuestion.correctAnswer
        });
      } else {
        // Create new question
        await axios.post('/api/admin/questions', {
          course: courseId,
          text: currentQuestion.text,
          options: currentQuestion.options,
          correctAnswer: currentQuestion.correctAnswer
        });
      }
      
      // Refresh questions
      const res = await axios.get(`/api/admin/courses/${courseId}/questions`);
      setQuestions(res.data.questions);
      
      handleCloseDialog();
      setLoading(false);
    } catch (err) {
      console.error('Error saving question:', err);
      setError(err.response?.data?.message || 'Failed to save question');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      
      await axios.delete(`/api/admin/questions/${selectedQuestionId}`);
      
      // Refresh questions
      const res = await axios.get(`/api/admin/courses/${courseId}/questions`);
      setQuestions(res.data.questions);
      
      handleCloseDeleteDialog();
      setLoading(false);
    } catch (err) {
      console.error('Error deleting question:', err);
      setError(err.response?.data?.message || 'Failed to delete question');
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      if (!csvFile) {
        setUploadError('Please select a CSV file');
        return;
      }
      
      setLoading(true);
      setUploadError(null);
      
      const formData = new FormData();
      formData.append('questionsFile', csvFile);
      
      await axios.post(`/api/admin/courses/${courseId}/questions/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Refresh questions
      const res = await axios.get(`/api/admin/courses/${courseId}/questions`);
      setQuestions(res.data.questions);
      
      handleCloseUploadDialog();
      setLoading(false);
    } catch (err) {
      console.error('Error uploading questions:', err);
      setUploadError(err.response?.data?.message || 'Failed to upload questions');
      setLoading(false);
    }
  };

  if (loading && !course) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !course) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/admin/courses')}
          sx={{ mt: 2 }}
        >
          Back to Courses
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/admin/courses')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">
            Questions for {course?.title}
          </Typography>
        </Box>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<UploadIcon />} 
            onClick={handleOpenUploadDialog}
            sx={{ mr: 1 }}
          >
            Upload CSV
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpenDialog()}
          >
            Add Question
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {questions.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            No questions found for this course.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpenDialog()}
          >
            Add First Question
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="5%">#</TableCell>
                <TableCell width="45%">Question</TableCell>
                <TableCell width="40%">Options</TableCell>
                <TableCell width="10%" align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {questions.map((question, index) => (
                <TableRow key={question._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{question.text}</TableCell>
                  <TableCell>
                    {question.options.map((option, i) => (
                      <Typography 
                        key={i} 
                        variant="body2" 
                        sx={{ 
                          color: i === question.correctAnswer ? 'success.main' : 'inherit',
                          fontWeight: i === question.correctAnswer ? 'bold' : 'normal'
                        }}
                      >
                        {i + 1}. {option}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpenDialog(question)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleOpenDeleteDialog(question._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Question Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedQuestionId ? 'Edit Question' : 'Add New Question'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Question Text"
            fullWidth
            value={currentQuestion.text}
            onChange={handleQuestionChange}
            sx={{ mb: 3 }}
          />
          
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Options:
          </Typography>
          
          <Grid container spacing={2}>
            {currentQuestion.options.map((option, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <TextField
                  label={`Option ${index + 1}`}
                  fullWidth
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
              </Grid>
            ))}
          </Grid>
          
          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel>Correct Answer</InputLabel>
            <Select
              value={currentQuestion.correctAnswer}
              label="Correct Answer"
              onChange={handleCorrectAnswerChange}
            >
              {currentQuestion.options.map((_, index) => (
                <MenuItem key={index} value={index}>
                  Option {index + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this question? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload CSV Dialog */}
      <Dialog open={openUploadDialog} onClose={handleCloseUploadDialog}>
        <DialogTitle>Upload Questions CSV</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Upload a CSV file with questions. The file should have the following columns:
            question, option1, option2, option3, option4, correctAnswer (0-3)
          </DialogContentText>
          
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadError}
            </Alert>
          )}
          
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            sx={{ mt: 1 }}
          >
            Select CSV File
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          
          {csvFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected file: {csvFile.name}
            </Typography>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" color="text.secondary">
            Example CSV format:
          </Typography>
          <Box component="pre" sx={{ 
            bgcolor: 'background.paper', 
            p: 1, 
            borderRadius: 1,
            fontSize: '0.75rem',
            overflowX: 'auto'
          }}>
            question,option1,option2,option3,option4,correctAnswer
            "What is Newton's first law?","Objects at rest stay at rest","F=ma","Action equals reaction","None of these",0
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>Cancel</Button>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            disabled={loading || !csvFile}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionManagement;