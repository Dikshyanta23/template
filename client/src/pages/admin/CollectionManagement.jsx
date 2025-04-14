// client/src/pages/admin/CollectionManagement.jsx
import { useState, useEffect } from 'react';
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
  DialogTitle,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import axios from 'axios';

const CollectionManagement = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentCollection, setCurrentCollection] = useState({
    name: '',
    description: ''
  });
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [coursesByCollection, setCoursesByCollection] = useState({});

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get('/api/admin/collections');
      setCollections(res.data.collections);
      
      // Fetch course counts for each collection
      const courseCounts = {};
      for (const collection of res.data.collections) {
        const coursesRes = await axios.get(`/api/admin/collections/${collection._id}/courses`);
        courseCounts[collection._id] = coursesRes.data.courses;
      }
      setCoursesByCollection(courseCounts);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError(err.response?.data?.message || 'Failed to load collections');
      setLoading(false);
    }
  };

  const handleOpenDialog = (collection = null) => {
    if (collection) {
      setCurrentCollection({
        name: collection.name,
        description: collection.description
      });
      setSelectedCollectionId(collection._id);
    } else {
      setCurrentCollection({
        name: '',
        description: ''
      });
      setSelectedCollectionId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCollection({
      name: '',
      description: ''
    });
    setSelectedCollectionId(null);
  };

  const handleOpenDeleteDialog = (collectionId) => {
    setSelectedCollectionId(collectionId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCollectionId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCollection({
      ...currentCollection,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    try {
      if (!currentCollection.name || !currentCollection.description) {
        setError('Please fill in all fields');
        return;
      }
      
      setLoading(true);
      
      if (selectedCollectionId) {
        // Update existing collection
        await axios.put(`/api/admin/collections/${selectedCollectionId}`, currentCollection);
      } else {
        // Create new collection
        await axios.post('/api/admin/collections', currentCollection);
      }
      
      // Refresh collections
      await fetchCollections();
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving collection:', err);
      setError(err.response?.data?.message || 'Failed to save collection');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      // Check if collection has courses
      if (coursesByCollection[selectedCollectionId]?.length > 0) {
        setError('Cannot delete collection with associated courses. Please remove or reassign courses first.');
        handleCloseDeleteDialog();
        return;
      }
      
      setLoading(true);
      
      await axios.delete(`/api/admin/collections/${selectedCollectionId}`);
      
      // Refresh collections
      await fetchCollections();
      
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error deleting collection:', err);
      setError(err.response?.data?.message || 'Failed to delete collection');
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Course Collections
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
        >
          Add Collection
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && collections.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : collections.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            No collections found. Create your first collection to organize courses.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpenDialog()}
          >
            Add First Collection
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="25%">Name</TableCell>
                <TableCell width="45%">Description</TableCell>
                <TableCell width="15%">Courses</TableCell>
                <TableCell width="15%" align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {collections.map((collection) => (
                <TableRow key={collection._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                      {collection.name}
                    </Box>
                  </TableCell>
                  <TableCell>{collection.description}</TableCell>
                  <TableCell>
                    {coursesByCollection[collection._id] ? (
                      <Chip 
                        label={`${coursesByCollection[collection._id].length} courses`} 
                        color="primary" 
                        variant="outlined" 
                        size="small"
                      />
                    ) : (
                      <CircularProgress size={20} />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpenDialog(collection)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        onClick={() => handleOpenDeleteDialog(collection._id)}
                        disabled={coursesByCollection[collection._id]?.length > 0}
                      >
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

      {/* Add/Edit Collection Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCollectionId ? 'Edit Collection' : 'Add New Collection'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Collection Name"
            fullWidth
            value={currentCollection.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={currentCollection.description}
            onChange={handleInputChange}
          />
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
          <Typography>
            Are you sure you want to delete this collection? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollectionManagement;