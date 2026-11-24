import express from 'express';
import {
  getReports,
  createSavedReport,
  getReportById,
  deleteSavedReport,
  exportReportCsv
} from '../controllers/reportController.js';

const router = express.Router();

router.get('/', getReports);
router.post('/', createSavedReport);
router.get('/export/:type', exportReportCsv);
router.get('/:id', getReportById);
router.delete('/:id', deleteSavedReport);

export default router;
