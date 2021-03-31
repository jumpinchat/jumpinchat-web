
const express = require('express');
const utils = require('../../utils/utils');
const SearchYoutube = require('./controllers/search.controller');
const setPlay = require('./controllers/setPlay.controller');
const getPlaylist = require('./controllers/getPlaylist.controller');

const search = new SearchYoutube();
const router = express.Router();

router.get('/search/:term', utils.validateAccount, (req, res) => search.sendRequest(req, res));

router.put('/playvideos', utils.validateSession, setPlay);
router.get('/:roomName/playlist', utils.validateSession, getPlaylist);

module.exports = router;
