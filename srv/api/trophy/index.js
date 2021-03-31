const express = require('express');
const { verifyAdmin } = require('../../utils/utils');
const trophyModel = require('./trophy.model');
const migrate = require('./controllers/migrate.controller');
const migrateUsers = require('./controllers/migrateUserTrophies.controller');
const getByName = require('./controllers/getById.controller');
const applyTrophy = require('./controllers/applyTrophy.controller');

const router = express.Router();

router.get('/:name', getByName);
router.get('/', (req, res) => {
  trophyModel.find().exec((err, trophies) => {
    if (err) {
      return res.status(500).send('ERR_SRV');
    }

    return res.status(200).send(trophies);
  });
});
router.put('/apply/:userId', verifyAdmin, applyTrophy);
router.post('/migrate', migrate);
router.post('/migrateUsers', migrateUsers);

module.exports = router;
