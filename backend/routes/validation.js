const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const linkValidator = require('../jobs/linkValidator');

const router = express.Router();

// @route   POST /api/validation/validate-links
// @desc    Trigger background validation job
// @access  Private (Admin only)
router.post('/validate-links', adminAuth, async (req, res) => {
  try {
    console.log('Manual link validation triggered by admin');
    
    // Run validation in background
    linkValidator.validateLinks()
      .then(results => {
        console.log('Manual validation completed:', results);
      })
      .catch(error => {
        console.error('Manual validation failed:', error);
      });

    res.json({ 
      message: 'Link validation job started',
      status: 'running'
    });
  } catch (error) {
    console.error('Trigger validation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/validation/cleanup
// @desc    Trigger cleanup job
// @access  Private (Admin only)
router.post('/cleanup', adminAuth, async (req, res) => {
  try {
    console.log('Manual cleanup triggered by admin');
    
    // Run cleanup in background
    linkValidator.cleanupBrokenLinks()
      .then(() => {
        console.log('Manual cleanup completed');
      })
      .catch(error => {
        console.error('Manual cleanup failed:', error);
      });

    res.json({ 
      message: 'Cleanup job started',
      status: 'running'
    });
  } catch (error) {
    console.error('Trigger cleanup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/validation/recategorize
// @desc    Trigger recategorization job
// @access  Private (Admin only)
router.post('/recategorize', adminAuth, async (req, res) => {
  try {
    console.log('Manual recategorization triggered by admin');
    
    // Run recategorization in background
    linkValidator.recategorizeLinks()
      .then(() => {
        console.log('Manual recategorization completed');
      })
      .catch(error => {
        console.error('Manual recategorization failed:', error);
      });

    res.json({ 
      message: 'Recategorization job started',
      status: 'running'
    });
  } catch (error) {
    console.error('Trigger recategorization error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/validation/full-cycle
// @desc    Trigger full validation cycle
// @access  Private (Admin only)
router.post('/full-cycle', adminAuth, async (req, res) => {
  try {
    console.log('Full validation cycle triggered by admin');
    
    // Run full cycle in background
    linkValidator.runFullValidation()
      .then(() => {
        console.log('Full validation cycle completed');
      })
      .catch(error => {
        console.error('Full validation cycle failed:', error);
      });

    res.json({ 
      message: 'Full validation cycle started',
      status: 'running'
    });
  } catch (error) {
    console.error('Trigger full cycle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
