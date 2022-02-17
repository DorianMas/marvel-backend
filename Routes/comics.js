const express = require("express");
const formidableMiddleware = require("express-formidable");
const cors = require("cors");
const axios = require("axios");
const router = express.Router();

const apiKey = process.env.API_KEY;

const Comic = require("../models/Comic");

/*Route pour afficher les comics*/
router.get("/comics", async (req, res) => {
  try {
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${apiKey}`
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json(response.error);
  }
});

router.get("/comics/:characterId", async (req, res) => {
  try {
    // const response = await axios.get(
    //   `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${apiKey}`,
    // const response = await Character.findById(req.params.characterId).populate({
    //   path: "results",
    //   select: "thumbnail",
    // });
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json(response.error);
  }
});

module.exports = router;
