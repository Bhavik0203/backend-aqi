const express = require('express');
const router = express.Router();
const sensorBatchController = require('../controllers/sensorBatchController');

router.get('/', sensorBatchController.getAllBatches);
router.get('/:id', sensorBatchController.getBatchById);
router.post('/', sensorBatchController.createBatch);
router.put('/:id', sensorBatchController.updateBatch);
router.delete('/:id', sensorBatchController.deleteBatch);
router.post('/:id/items', sensorBatchController.addItemsToBatch);

module.exports = router;

