const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

//import du modèle User
const User = require("../Models/User");

//import du MiddleWare
const isAuthenticated = require("../middleware/isAuthenticated");

router.post("/user/signup", async (req, res) => {
  try {
    //On vérifie qu'on envoie bien un username

    //On véirifie que l'emaikl en base de données soit bien disponible
    const isUserExist = await User.findOne({ email: req.fields.email });
    if (isUserExist !== null) {
      res.status(400).json({ message: "This email already has an account" });
    } else {
      console.log(req.fields);

      //Etape 1 : hasher le mot de passe
      const salt = uid2(64);
      const hash = SHA256(req.fields.password + salt).toString(encBase64);
      const token = uid2(64);
      //   console.log("salt==>", salt);
      //   console.log("hash==>", hash);

      //Etape 2 : créer le nouvel utilisateur
      const newUser = new User({
        email: req.fields.email,
        token: token,
        hash: hash,
        salt: salt,
      });

      // Etape 3 : sauvegarder ce nouvel utilisateur dans la bdd
      await newUser.save();
      res.json({
        _id: newUser._id,
        email: newUser.email,
        token: newUser.token,
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });
    if (user === null) {
      res.status(401).json({ message: "Unauthorized ! 1" });
    } else {
      console.log(user.hash, "hash à comparer");
      const newHash = SHA256(req.fields.password + user.salt).toString(
        encBase64
      );
      console.log(newHash, "Mon nouveau hash");
      if (user.hash === newHash) {
        res.json({
          _id: user._id,
          token: user.token,
        });
      } else {
        res.status(401).json({ message: "Unauthorized ! 2" });
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Ajouter des favoris à un compte
router.post("/user/add-favorites", async (req, res) => {
  try {
    const user = await User.findOne(req.fields.user);
    console.log("Infos du user connecté ==>", user);

    const characterToAdd = req.fields.character;
    console.log(
      "character à ajouter dans le tableau =========>",
      characterToAdd
    );

    const characterFavorites = user.characterFavorites;
    console.log(
      "Tableau des characters en favoris avant ==>",
      characterFavorites
    );

    const exist = characterFavorites.find(
      (elem) => elem._id === characterToAdd._id
    );

    console.log("exist =====>", exist);

    if (exist) {
      alert("Le character figure déjà parmi vos favoris");
    } else {
      characterFavorites.push(characterToAdd);
      console.log(
        "Tableau des characters en favoris après ==>",
        characterFavorites
      );
      await characterFavorites.save();
    }

    const comicFavorites = user.comicFavorites;

    console.log("Tableau des comics en favoris ==>", comicFavorites);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

/* En Front, tu cliques sur le bouton ajouter en favoris qui va créer une requête à la route Add Favorites à laquelle on envoie le token de l'user et l'objet (Character ou Comic). On push dans le tableau vide l'objet envoyé depuis le front */
