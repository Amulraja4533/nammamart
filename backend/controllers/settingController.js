const Setting = require('../models/Setting');

/**
 * @desc    Get a setting by key
 * @route   GET /api/settings/:key
 * @access  Public
 */
const getSetting = async (req, res) => {
  const { key } = req.params;
  
  // Default values for known settings to prevent 404s
  const defaults = {
    'DELIVERY_CHARGE': '0',
    'RAIN_CHARGE_AMOUNT': '0',
    'RAIN_CHARGE_ENABLED': 'false',
    'PAYMENT_QR': ''
  };

  try {
    const setting = await Setting.findOne({ key });
    
    if (setting) {
      res.json(setting);
    } else {
      // Return default value if not found in database instead of 404
      res.json({ 
        key, 
        value: defaults[key] || '0' 
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching setting', error: error.message });
  }
};

/**
 * @desc    Update or create a setting
 * @route   POST /api/settings
 * @route   PUT /api/settings/:key
 * @access  Private/Admin
 */
const updateSetting = async (req, res) => {
  const key = req.params.key || req.body.key;
  const { value } = req.body;

  if (!key) {
    return res.status(400).json({ message: 'Setting key is required' });
  }

  try {
    const setting = await Setting.findOneAndUpdate(
      { key },
      { value },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Error updating setting', error: error.message });
  }
};

module.exports = { getSetting, updateSetting };