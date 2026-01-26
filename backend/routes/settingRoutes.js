const express = require('express');
const router = express.Router();
const { getSetting, updateSetting } = require('../controllers/settingController');
const { protect, admin } = require('../middleware/authMiddleware');

// Support POST /api/settings (legacy/current frontend)
router.route('/').post(protect, admin, updateSetting);

// Support GET /api/settings/:key (public) and PUT /api/settings/:key (admin)
router.route('/:key')
  .get(getSetting)
  .put(protect, admin, updateSetting);

module.exports = router;