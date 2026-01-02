const express = require('express');
const router = express.Router();
const kitBatchController = require('../controllers/kitBatchController');

router.get('/', kitBatchController.getAllBatches);
router.get('/:id', kitBatchController.getBatchById);
router.post('/', kitBatchController.createBatch);
router.put('/:id', kitBatchController.updateBatch);
router.delete('/:id', kitBatchController.deleteBatch);

module.exports = router;

