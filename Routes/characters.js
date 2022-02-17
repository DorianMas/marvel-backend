const express = require("express");
const formidableMiddleware = require("express-formidable");
const axios = require("axios");
const router = express.Router();

const apiKey = process.env.API_KEY;

/*Route pour afficher les characters*/
router.get("/characters", async (req, res) => {
  try {
    let limit = 100;
    if (req.query.limit) {
      limit = req.query.limit;
    }
    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }

    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${apiKey}&limit=${limit}&page=${page}`
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

/*Route pour accéder à la fiche d'un personnage*/
router.get("/character/:characterId", async (req, res) => {
  const characterId = req.query._id;

  console.log(characterId);

  try {
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/character/:characterId=${characterId}&apiKey=${apiKey}`
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json(response.error);
  }
});

module.exports = router;
