var express = require('express');
var router = express.Router();
const axios = require('axios');

/* GET users listing. */
router.get('/', function(req, res, next) {
  axios.get('https://api.flickr.com/services/rest/?method=flickr.interestingness.getList&api_key=c8eff296a7a5a81f1463416b4b16ad71&extras=url_l%2C+owner_name%2C+views&per_page=20&page=1&format=json&nojsoncallback=1')
  .then(resp => {
    res.json(
      resp.data
    )
  })
  .catch(error => {
    console.log(error);
  });
});

module.exports = router;
