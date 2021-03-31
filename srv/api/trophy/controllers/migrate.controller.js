const log = require('../../../utils/logger.util')({ name: 'migrate trophies' });
const trophyModel = require('../trophy.model');
const trophyConst = require('../trophies');

module.exports = function migrate(req, res) {
  log.debug('migrate trophies');
  return trophyModel.find({}).exec((err, trophies) => {
    if (err) {
      log.fatal({ err }, 'error fetching trophies');
      return res.status(500).send();
    }

    trophyConst.trophies.forEach((trophy) => {
      const existingTrophy = trophies.find(t => t.name === trophy.name);
      if (existingTrophy) {
        return Object
          .assign(existingTrophy, trophy)
          .save((err) => {
            if (err) {
              log.fatal({ err }, 'error creating trophy');
              return res.status(500).send();
            }

            log.debug('saved existing trophy');
          });
      }

      return trophyModel.create(trophy, (err) => {
        if (err) {
          log.fatal({ err }, 'error creating trophy');
          return res.status(500).send();
        }

        log.debug('created new trophy document');
      });
    });

    res.status(200).send();
  });
};
