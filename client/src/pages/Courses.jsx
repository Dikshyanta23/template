// client/src/pages/Courses.jsx
import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Box,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    fetchCourses();
  }, []);
  
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/courses');
      setCourses(data.courses);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const filteredCourses = activeTab === 'all' 
    ? courses 
    : courses.filter(course => course.collection === activeTab);
  
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
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Our Courses
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          centered
          variant="fullWidth"
        >
          <Tab label="All Courses" value="all" />
          <Tab label="A Levels" value="A Levels" />
          <Tab label="IB" value="IB" />
          <Tab label="US BSc Preparation" value="US BSc Preparation" />
        </Tabs>
      </Box>
      
      <Grid container spacing={4}>
        {filteredCourses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course._id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s ease',
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
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {course.collection}
                </Typography>
                <Typography variant="body2" paragraph>
                  {course.description.substring(0, 120)}...
                </Typography>
                <Button 
                  component={Link} 
                  to={`/courses/${course._id}`}
                  variant="contained" 
                  color="primary"
                  fullWidth
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
        
        {filteredCourses.length === 0 && (
          <Box sx={{ width: '100%', mt: 4, textAlign: 'center' }}>
            <Typography variant="h6">
              No courses found in this category.
            </Typography>
          </Box>
        )}
      </Grid>
    </Container>
  );
}