const express = require('express');
const router = express.Router();
const kitController = require('../controllers/kitController');

router.get('/simple', kitController.getKitsSimple);
router.get('/list', kitController.getKitList);
router.get('/', kitController.getAllKits);
router.get('/:id', kitController.getKitById);
router.post('/', kitController.createKit);
router.put('/:id', kitController.updateKit);
router.delete('/:id', kitController.deleteKit);

module.exports = router;

