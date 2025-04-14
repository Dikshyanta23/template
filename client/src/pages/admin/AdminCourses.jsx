// client/src/pages/admin/AdminCourses.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch courses and collections
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch collections
        const collectionsResponse = await axios.get('/api/collections');
        setCollections([{ _id: 'all', name: 'All Courses' }, ...collectionsResponse.data.collections]);

        // Fetch courses
        const coursesResponse = await axios.get('/api/courses');
        setCourses(coursesResponse.data.courses);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter courses based on selected collection
  const filteredCourses = selectedCollection === 'all'
    ? courses
    : courses.filter(course => course.collection._id === selectedCollection);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Courses Management
      </Typography>

      {/* Dropdown to filter courses by collection */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Select
          value={selectedCollection}
          onChange={(e) => setSelectedCollection(e.target.value)}
          variant="outlined"
          size="small"
        >
          {collections.map((collection) => (
            <MenuItem key={collection._id} value={collection._id}>
              {collection.name}
            </MenuItem>
          ))}
        </Select>

        {/* Button to add a new course */}
        <Button
          variant="contained"
          color="primary"
          href="/admin/courses/create"
          sx={{ textTransform: 'none' }}
        >
          Add a Course
        </Button>
      </Box>

      {/* Display courses in a table */}
      <Paper sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Collection</TableCell>
                <TableCell>Topics</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.description}</TableCell>
                    <TableCell>{course.collection?.name || 'Uncategorized'}</TableCell>
                    <TableCell>{course.topics.join(', ')}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No courses found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}