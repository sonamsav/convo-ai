import express from 'express';
import {
  getSettings,
  updateGeneralSettings,
  updateProfileSettings,
  updateNotificationSettings,
  updateAiSettings,
  updateAppearanceSettings,
  updateSecurityPassword,
  revokeSession
} from '../controllers/settingsController.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/general', updateGeneralSettings);
router.put('/profile', updateProfileSettings);
router.put('/notifications', updateNotificationSettings);
router.put('/ai', updateAiSettings);
router.put('/appearance', updateAppearanceSettings);
router.put('/security/password', updateSecurityPassword);
router.delete('/security/sessions/:id', revokeSession);

export default router;
