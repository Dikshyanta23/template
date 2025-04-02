// client/src/pages/CourseTest.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

export default function CourseTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [course, setCourse] = useState(null);
  
  useEffect(() => {
    fetchTestData();
  }, [id]);
  
  const fetchTestData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await axios.get(`/api/courses/${id}`);
      setCourse(courseResponse.data.course);
      
      // Fetch test questions
      const questionsResponse = await axios.get(`/api/courses/${id}/test?count=10`);
      setQuestions(questionsResponse.data.questions);
    } catch (err) {
      console.error('Error fetching test data:', err);
      setError(err.response?.data?.message || 'Failed to load test. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOptionSelect = (e) => {
    setSelectedOption(e.target.value);
  };
  
  const handleSubmitAnswer = () => {
    if (!selectedOption) return;
    
    const currentQ = questions[currentQuestion];
    const selectedOptionObj = currentQ.options.find(opt => opt._id === selectedOption);
    
    if (selectedOptionObj.isCorrect) {
      setScore(score + 1);
    }
    
    setAnswered(true);
  };
  
  const handleNextQuestion = () => {
    setSelectedOption('');
    setAnswered(false);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setTestCompleted(true);
    }
  };
  
  const handleRestartTest = () => {
    setCurrentQuestion(0);
    setSelectedOption('');
    setAnswered(false);
    setScore(0);
    setTestCompleted(false);
    
    // Shuffle questions
    setQuestions([...questions].sort(() => Math.random() - 0.5));
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
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error" align="center">{error}</Typography>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button onClick={() => navigate(`/courses/${id}`)} variant="contained">
            Back to Course
          </Button>
        </Box>
      </Container>
    );
  }
  
  if (testCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Test Completed!
          </Typography>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h2" color={percentage >= 70 ? 'success.main' : percentage >= 40 ? 'warning.main' : 'error.main'}>
              {score} / {questions.length}
            </Typography>
            <Typography variant="h5" sx={{ mt: 1 }}>
              {percentage}%
            </Typography>
          </Box>
          
          <Typography variant="body1" paragraph>
            {percentage >= 70 
              ? 'Great job! You have a good understanding of this subject.' 
              : percentage >= 40 
                ? 'Good effort! With a bit more study, you can improve your score.' 
                : 'Keep studying! You might need to review the course material.'}
          </Typography>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleRestartTest}
            >
              Take Test Again
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate(`/courses/${id}`)}
            >
              Back to Course
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }
  
  const currentQ = questions[currentQuestion];
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            {course?.title} - Mini Test
          </Typography>
          <Typography variant="body1">
            Question {currentQuestion + 1} of {questions.length}
          </Typography>
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={(currentQuestion / questions.length) * 100} 
          sx={{ mb: 4, height: 8, borderRadius: 4 }}
        />
        
        <Typography variant="h6" gutterBottom>
          {currentQ.text}
        </Typography>
        
        <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
          <RadioGroup value={selectedOption} onChange={handleOptionSelect}>
            {currentQ.options.map((option) => (
              <Card 
                key={option._id} 
                variant="outlined" 
                sx={{ 
                  mb: 2,
                  borderColor: answered 
                    ? option.isCorrect 
                      ? 'success.main' 
                      : selectedOption === option._id && !option.isCorrect 
                        ? 'error.main' 
                        : 'divider'
                    : selectedOption === option._id 
                      ? 'primary.main' 
                      : 'divider',
                  bgcolor: answered 
                    ? option.isCorrect 
                      ? 'success.light' 
                      : selectedOption === option._id && !option.isCorrect 
                        ? 'error.light' 
                        : 'background.paper'
                    : 'background.paper'
                }}
              >
                <CardContent>
                  <FormControlLabel 
                    value={option._id} 
                    control={<Radio />} 
                    label={option.text}
                    disabled={answered}
                    sx={{ width: '100%' }}
                  />
                  
                  {answered && (
                    <Box sx={{ mt: 1 }}>
                      <Divider sx={{ my: 1 }} />
                      <Typography 
                        variant="body2" 
                        color={option.isCorrect ? 'success.main' : 'text.secondary'}
                      >
                        {option.explanation}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </RadioGroup>
        </FormControl>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          {!answered ? (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSubmitAnswer}
              disabled={!selectedOption}
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleNextQuestion}
            >
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
            </Button>
          )}
          
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => navigate(`/courses/${id}`)}
          >
            Exit Test
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}