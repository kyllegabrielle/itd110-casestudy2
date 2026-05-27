const express = require('express');
const router = express.Router();
const {
  createIncident,
  getAllIncidents,
  getIncident,
  updateIncident,
  deleteIncident,
  searchIncidents,
  getStats,
  getCrimeTypes,
  downloadBackup,
  getGraphData
} = require('../controllers/incidentController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Standard CRUD
router.route('/')
  .get(protect, getAllIncidents)
  .post(protect, authorizeRoles('Admin', 'Officer'), createIncident);

router.route('/:id')
  .get(protect, getIncident)
  .put(protect, authorizeRoles('Admin', 'Officer'), updateIncident)
  .delete(protect, authorizeRoles('Admin'), deleteIncident);

// Special endpoints
router.get('/search/:keyword', protect, searchIncidents);
router.get('/dashboard/stats', protect, getStats);
router.get('/types/list', protect, getCrimeTypes);
router.get('/graph/data', protect, getGraphData);
router.get('/backup/download', protect, authorizeRoles('Admin'), downloadBackup);

module.exports = router;
