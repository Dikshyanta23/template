// client/src/pages/student/TutorRating.jsx
import { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  Rating, 
  TextField, 
  Button, 
  Snackbar, 
  Alert,
  CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';

export default function TutorRating({ sessions }) {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratings, setRatings] = useState({});
  const [feedback, setFeedback] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  useEffect(() => {
    if (sessions.length > 0) {
      // Extract unique tutors from sessions
      const uniqueTutors = [];
      const tutorIds = new Set();
      
      sessions.forEach(session => {
        if (!tutorIds.has(session.tutor._id)) {
          tutorIds.add(session.tutor._id);
          uniqueTutors.push(session.tutor);
        }
      });
      
      setTutors(uniqueTutors);
      fetchExistingRatings(Array.from(tutorIds));
    }
    setLoading(false);
  }, [sessions]);
  
  const fetchExistingRatings = async (tutorIds) => {
    try {
      const { data } = await axios.get('/api/ratings/student');
      
      const ratingMap = {};
      const feedbackMap = {};
      
      data.ratings.forEach(rating => {
        ratingMap[rating.tutor] = rating.rating;
        feedbackMap[rating.tutor] = rating.feedback || '';
      });
      
      setRatings(ratingMap);
      setFeedback(feedbackMap);
    } catch (err) {
      console.error('Error fetching ratings:', err);
      setError('Failed to load your existing ratings.');
    }
  };
  
  const handleRatingChange = (tutorId, newValue) => {
    setRatings(prev => ({
      ...prev,
      [tutorId]: newValue
    }));
  };
  
  const handleFeedbackChange = (tutorId, event) => {
    setFeedback(prev => ({
      ...prev,
      [tutorId]: event.target.value
    }));
  };
  
  const handleSubmitRating = async (tutorId) => {
    try {
      setSubmitting(true);
      
      await axios.post('/api/ratings', {
        tutor: tutorId,
        rating: ratings[tutorId] || 0,
        feedback: feedback[tutorId] || ''
      });
      
      setSnackbar({
        open: true,
        message: 'Rating submitted successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error submitting rating:', err);
      setSnackbar({
        open: true,
        message: 'Failed to submit rating. Please try again.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }
  
  return (
    <>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Rate Your Tutors
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Your feedback helps us improve our teaching quality and helps other students choose the right tutors.
          All feedback is anonymous to tutors, but administrators can see who provided the feedback.
        </Typography>
        
        {tutors.length === 0 ? (
          <Typography variant="body1">
            You don't have any tutors to rate yet.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {tutors.map(tutor => (
              <Grid item xs={12} md={6} key={tutor._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {tutor.profilePhoto ? (
                          <img 
                            src={tutor.profilePhoto} 
                            alt={tutor.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <PersonIcon />
                        )}
                      </Avatar>
                      <Typography variant="h6">
                        {tutor.name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography component="legend" gutterBottom>
                        Your Rating
                      </Typography>
                      <Rating
                        name={`rating-${tutor._id}`}
                        value={ratings[tutor._id] || 0}
                        precision={0.5}
                        onChange={(event, newValue) => {
                          handleRatingChange(tutor._id, newValue);
                        }}
                      />
                    </Box>
                    
                    <TextField
                      label="Your Feedback (Optional)"
                      multiline
                      rows={4}
                      fullWidth
                      variant="outlined"
                      value={feedback[tutor._id] || ''}
                      onChange={(e) => handleFeedbackChange(tutor._id, e)}
                      sx={{ mb: 2 }}
                    />
                    
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleSubmitRating(tutor._id)}
                      disabled={submitting || !ratings[tutor._id]}
                    >
                      {submitting ? <CircularProgress size={24} /> : 'Submit Rating'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}