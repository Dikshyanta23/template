const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// @route   GET /api/collections
// @desc    Get all collections
// @access  Admin only
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const collections = await Collection.find().sort({ name: 1 });
    res.json({ collections });
  } catch (err) {
    console.error('Error fetching collections:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/collections
// @desc    Create a new collection
// @access  Admin only
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    // Check if collection already exists
    const existingCollection = await Collection.findOne({ name });
    if (existingCollection) {
      return res.status(400).json({ message: 'Collection with this name already exists' });
    }

    // Create new collection
    const newCollection = new Collection({
      name,
      description,
    });

    await newCollection.save();
    res.status(201).json({ 
      message: 'Collection created successfully', 
      collection: newCollection 
    });
  } catch (err) {
    console.error('Error creating collection:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/collections/:id
// @desc    Update an existing collection
// @access  Admin only
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Find the collection by ID
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Update fields if provided
    if (name) collection.name = name;
    if (description) collection.description = description;

    // Save updated collection
    await collection.save();
    res.json({ 
      message: 'Collection updated successfully', 
      collection 
    });
  } catch (err) {
    console.error('Error updating collection:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/collections/:id
// @desc    Delete a collection
// @access  Admin only
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Delete the collection
    await collection.remove();
    res.json({ message: 'Collection deleted successfully' });
  } catch (err) {
    console.error('Error deleting collection:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;