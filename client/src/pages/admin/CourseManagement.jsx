// client/src/pages/admin/CourseManagement.jsx
import { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    collection: '',
    topics: '',
    image: '',
    tutorIds: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, tutorsRes] = await Promise.all([
        axios.get('/api/courses'),
        axios.get('/api/users?role=tutor')
      ]);
      
      setCourses(coursesRes.data.courses);
      setTutors(tutorsRes.data.users);
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
  
  const handleTopicsChange = (e) => {
    setFormData(prev => ({ ...prev, topics: e.target.value }));
  };
  
  const handleTutorChange = (e) => {
    setFormData(prev => ({ ...prev, tutorIds: e.target.value }));
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.collection) errors.collection = 'Collection is required';
    if (!formData.topics.trim()) errors.topics = 'At least one topic is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleOpenDialog = (course = null) => {
    if (course) {
      setSelectedCourse(course);
      setFormData({
        title: course.title,
        description: course.description,
        collection: course.collection,
        topics: course.topics.join('\n'),
        image: course.image || '',
        tutorIds: course.tutors.map(tutor => tutor._id)
      });
    } else {
      setSelectedCourse(null);
      setFormData({
        title: '',
        description: '',
        collection: '',
        topics: '',
        image: '',
        tutorIds: []
      });
    }
    
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormErrors({});
  };
  
  const handleOpenDeleteDialog = (course) => {
    setSelectedCourse(course);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    const topicsArray = formData.topics
      .split('\n')
      .map(topic => topic.trim())
      .filter(topic => topic);
    
    const courseData = {
      title: formData.title,
      description: formData.description,
      collection: formData.collection,
      topics: topicsArray,
      image: formData.image,
      tutorIds: formData.tutorIds
    };
    
    try {
      if (selectedCourse) {
        // Update existing course
        await axios.put(`/api/courses/${selectedCourse._id}`, courseData);
        
        setCourses(prev => 
          prev.map(c => 
            c._id === selectedCourse._id 
              ? { 
                  ...c, 
                  ...courseData, 
                  tutors: tutors.filter(t => courseData.tutorIds.includes(t._id))
                } 
              : c
          )
        );
        
        setSnackbar({
          open: true,
          message: 'Course updated successfully',
          severity: 'success'
        });
      } else {
        // Create new course
        const { data } = await axios.post('/api/courses', courseData);
        
        setCourses(prev => [
          ...prev, 
          { 
            ...data.course, 
            tutors: tutors.filter(t => courseData.tutorIds.includes(t._id))
          }
        ]);
        
        setSnackbar({
          open: true,
          message: 'Course created successfully',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving course:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to save course. Please try again.',
        severity: 'error'
      });
    }
  };
  
  const handleDelete = async () => {
    try {
      await axios.delete(`/api/courses/${selectedCourse._id}`);
      
      setCourses(prev => prev.filter(c => c._id !== selectedCourse._id));
      
      setSnackbar({
        open: true,
        message: 'Course deleted successfully',
        severity: 'success'
      });
      
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error deleting course:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete course. Please try again.',
        severity: 'error'
      });
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
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Course Management
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Course
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Collection</TableCell>
              <TableCell>Topics</TableCell>
              <TableCell>Tutors</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course._id}>
                <TableCell>{course.title}</TableCell>
                <TableCell>{course.collection}</TableCell>
                <TableCell>
                  {course.topics.slice(0, 3).map((topic, i) => (
                    <Chip key={i} label={topic} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                  {course.topics.length > 3 && (
                    <Chip label={`+${course.topics.length - 3} more`} size="small" variant="outlined" />
                  )}
                </TableCell>
                <TableCell>
                  {course.tutors.length > 0 ? (
                    course.tutors.map((tutor, i) => (
                      <Chip 
                        key={i} 
                        label={tutor.email.split('@')[0]} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }} 
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No tutors assigned
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <IconButton 
                    color="primary" 
                    onClick={() => handleOpenDialog(course)}
                    title="Edit Course"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleOpenDeleteDialog(course)}
                    title="Delete Course"
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton 
                    color="secondary" 
                    component={Link}
                    to={`/admin/courses/${course._id}/questions`}
                    title="Manage Questions"
                  >
                    <QuizIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            
            {courses.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No courses found. Create your first course!
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Course Form Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCourse ? 'Edit Course' : 'Add New Course'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Course Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required error={!!formErrors.collection}>
                  <InputLabel>Collection</InputLabel>
                  <Select
                    name="collection"
                    value={formData.collection}
                    onChange={handleInputChange}
                    label="Collection"
                  >
                    <MenuItem value="A Levels">A Levels</MenuItem>
                    <MenuItem value="IB">IB</MenuItem>
                    <MenuItem value="US BSc Preparation">US BSc Preparation</MenuItem>
                  </Select>
                  {formErrors.collection && (
                    <FormHelperText>{formErrors.collection}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Course Description"
                  name="description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Topics (one per line)"
                  name="topics"
                  multiline
                  rows={4}
                  value={formData.topics}
                  onChange={handleTopicsChange}
                  error={!!formErrors.topics}
                  helperText={formErrors.topics || 'Enter each topic on a new line'}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  helperText="Enter a URL for the course image"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Assign Tutors</InputLabel>
                  <Select
                    multiple
                    value={formData.tutorIds}
                    onChange={handleTutorChange}
                    input={<OutlinedInput label="Assign Tutors" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const tutor = tutors.find(t => t._id === value);
                          return (
                            <Chip 
                              key={value} 
                              label={tutor ? tutor.email.split('@')[0] : value} 
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {tutors.map((tutor) => (
                      <MenuItem key={tutor._id} value={tutor._id}>
                        {tutor.email}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {tutors.length === 0 
                      ? 'No verified tutors available. Verify tutors first.' 
                      : 'Select tutors to assign to this course'}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedCourse ? 'Update Course' : 'Create Course'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the course "{selectedCourse?.title}"? 
            This action cannot be undone and will also delete all associated questions.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
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