// client/src/pages/Home.jsx
import { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  Paper,
  Divider,
  CircularProgress,
  useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ColorModeContext } from '../App';

export default function Home() {
  const { user } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  useEffect(() => {
    fetchFeaturedCourses();
  }, []);
  
  const fetchFeaturedCourses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/courses');
      // Get up to 3 courses to feature
      setFeaturedCourses(data.courses.slice(0, 3));
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      {/* Hero Section */}
{/* Hero Section */}
<Box 
  sx={{ 
    bgcolor: isDarkMode ? '#1a2027' : 'primary.main', 
    color: isDarkMode ? '#ffffff' : 'primary.contrastText',
    py: 8,
    mb: 6
  }}
>
  <Container maxWidth="md">
    <Typography 
      variant="h2" 
      component="h1" 
      gutterBottom 
      align="center"
      sx={{ color: isDarkMode ? '#ffffff' : 'inherit' }}
    >
      Expert Tutoring for Academic Success
    </Typography>
    <Typography 
      variant="h5" 
      paragraph 
      align="center"
      sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'inherit' }}
    >
      Personalized learning experiences for A Levels, IB, and US college preparation
    </Typography>
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
      <Button 
        component={Link} 
        to="/courses" 
        variant="contained" 
        size="large"
        sx={{
          bgcolor: isDarkMode ? '#3a86ff' : theme.palette.secondary.main,
          color: '#ffffff',
          '&:hover': {
            bgcolor: isDarkMode ? '#2563eb' : undefined,
          }
        }}
      >
        Explore Courses
      </Button>
      {!user && (
        <Button 
          component={Link} 
          to="/register" 
          variant="outlined" 
          color="inherit" 
          size="large"
          sx={{
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : undefined,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : undefined,
          }}
        >
          Register as Student
        </Button>
      )}
    </Box>
  </Container>
</Box>
      
      {/* Featured Courses Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          Featured Courses
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {featuredCourses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease',
                    bgcolor: isDarkMode ? '#242a32' : undefined,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={course.image || 'https://via.placeholder.com/300x200?text=Course+Image'}
                    alt={course.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color={isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'} sx={{ mb: 2 }}>
                      {course.collection}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {course.description.substring(0, 120)}...
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      component={Link} 
                      to={`/courses/${course._id}`}
                      size="small" 
                      sx={{
                        color: isDarkMode ? '#3a86ff' : theme.palette.primary.main
                      }}
                    >
                      Learn More
                    </Button>
                    <Button 
                      component={Link} 
                      to={`/courses/${course._id}/test`}
                      size="small" 
                      sx={{
                        color: isDarkMode ? '#3a86ff' : theme.palette.primary.main
                      }}
                    >
                      Take Mini Test
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            component={Link} 
            to="/courses" 
            variant="contained"
            sx={{
              bgcolor: isDarkMode ? '#3a86ff' : theme.palette.primary.main,
              '&:hover': {
                bgcolor: isDarkMode ? '#2563eb' : undefined,
              }
            }}
          >
            View All Courses
          </Button>
        </Box>
      </Container>
      
      {/* Join as Tutor Section */}
      <Box sx={{ 
        bgcolor: isDarkMode ? '#242a32' : 'grey.100', 
        py: 6, 
        mb: 8, 
        textAlign: 'center' 
      }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 3 }}>
            Join Our Team of Expert Tutors
          </Typography>
          
          <Typography 
            variant="body1" 
            paragraph 
            align="center" 
            sx={{ 
              mb: 4, 
              maxWidth: '800px', 
              mx: 'auto',
              color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : undefined
            }}
          >
            Are you passionate about teaching and helping students achieve their academic goals? 
            Join our team of expert tutors and make a difference in students' lives.
          </Typography>
          
          <Grid container spacing={4} alignItems="center" justifyContent="center" direction="column">
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Button 
                component={Link} 
                to="/tutor-application" 
                variant="contained"
                size="large"
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  bgcolor: isDarkMode ? '#3a86ff' : theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: isDarkMode ? '#2563eb' : undefined,
                  }
                }}
              >
                Apply as a Tutor
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  textAlign: 'left', 
                  maxWidth: '500px', 
                  mx: { xs: 'auto', md: 0 },
                  bgcolor: isDarkMode ? '#1a2027' : undefined,
                }}
              >
                <Typography variant="h6" gutterBottom align="center" color={isDarkMode ? 'rgba(255, 255, 255, 0.9)' : undefined}>
                  Benefits of Being a Tutor:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <Typography component="li" variant="body1" paragraph color={isDarkMode ? 'rgba(255, 255, 255, 0.8)' : undefined}>
                    Flexible teaching schedule
                  </Typography>
                  <Typography component="li" variant="body1" paragraph color={isDarkMode ? 'rgba(255, 255, 255, 0.8)' : undefined}>
                    Competitive compensation
                  </Typography>
                  <Typography component="li" variant="body1" paragraph color={isDarkMode ? 'rgba(255, 255, 255, 0.8)' : undefined}>
                    Professional development opportunities
                  </Typography>
                  <Typography component="li" variant="body1" paragraph color={isDarkMode ? 'rgba(255, 255, 255, 0.8)' : undefined}>
                    Make a positive impact on students' futures
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}