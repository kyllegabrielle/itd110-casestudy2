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
  downloadBackup
} = require('../controllers/incidentController');

// Standard CRUD
router.route('/')
  .get(getAllIncidents)
  .post(createIncident);

router.route('/:id')
  .get(getIncident)
  .put(updateIncident)
  .delete(deleteIncident);

// Special endpoints
router.get('/search/:keyword', searchIncidents);
router.get('/dashboard/stats', getStats);
router.get('/types/list', getCrimeTypes);
router.get('/backup/download', downloadBackup);

module.exports = router;
