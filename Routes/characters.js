const express = require("express");
const formidableMiddleware = require("express-formidable");
const axios = require("axios");
const router = express.Router();

const apiKey = process.env.API_KEY;

/*Route pour afficher les characters*/
router.get("/characters", async (req, res) => {
  try {
    const limit = 100;

    const page = req.query.page;

    const skip = (page - 1) * limit;

    const searchTerm = req.query.name;

    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${apiKey}&limit=${limit}&skip=${skip}&name=${searchTerm}`
    );

    //Création d'un objet pour paramétrer les filtres

    //Paramétrage du filtre "title"

    //Paramétrage de la pagination

    // const count = await Character.countDocuments(filtersObject);

    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json(response.error);
  }
});

router.get("/character/:characterId", async (req, res) => {
  try {
    const characterId = req.params.characterId;

    console.log(characterId);

    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/character/${characterId}?apiKey=${apiKey}`
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json(response.error);
  }
});

module.exports = router;
