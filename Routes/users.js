const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

//import du modèle User
const User = require("../Models/User");

//Déclaration du middleware d'authentification de connexion
const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    //je continue les vérifications
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });
    console.log("user identifié dans le Middleware =>", user);

    if (user) {
      //Mon token est valide et je peux continuer
      //J'envoie les infos sur mon user à la suite de ma route
      req.user = user;
      console.log("user identifié dans le Middleware =>", user);

      //sans le next, la requête va rester "bloquée" dans ma fonction isAuthenticated
      next();
    } else {
      res.status(401).json({ error: "Unautorized 2" });
    }
  } else {
    res.status(401).json({ error: "Unauthorized 1" });
  }
};

// Route de création de compte
router.post("/user/signup", async (req, res) => {
  try {
    //On vérifie que l'email en base de données soit bien disponible
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

// Route pour se connecter
router.post("/user/login", async (req, res) => {
  try {
    // On vérifie si l'email entré est dans la BDD
    const user = await User.findOne({ email: req.fields.email });
    if (user === null) {
      res.status(401).json({ message: "Unauthorized ! 1" });
    } else {
      // Si l'email est présent dans la BDD, on vérifie si le mot de passe associé est identique
      console.log(user.hash, "hash à comparer");
      const newHash = SHA256(req.fields.password + user.salt).toString(
        encBase64
      );
      console.log(newHash, "Mon nouveau hash");
      // Si le mot de passe entré est identique, on renvoie le token de connexion/navigation
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

//Afficher les favoris à un compte
router.post("/user/favorites", async (req, res) => {
  // console.log("token du user =>", req.fields.token);
  try {
    const user = await User.findOne({ token: req.fields.token });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Ajouter des favoris à un compte
router.post("/user/add-favorites", isAuthenticated, async (req, res) => {
  try {
    // On cherche le compte connecté à actualiser
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });
    // console.log("Infos du user connecté ==>", user);

    // Si l'élément sélectionné est un personnage
    if (req.fields.character) {
      const characterToAdd = req.fields.character;
      //Déclaration du tableau des personnages en favoris du compte connecté
      const characterFavorites = user.characterFavorites;

      // Vérification que l'élément sélectionné n'est pas déjà présent dans le tableau du compte connecté
      const characterExist = characterFavorites.find(
        (elem) => elem._id === characterToAdd._id
      );

      // Si le personnage sélectionné est déjà présent dans le tableau, on envoie une alerte
      // Si non, on ajoute le personnage dans le tableau des personnages favoris
      if (characterExist) {
        alert("Le character figure déjà parmi vos favoris");
      } else {
        characterFavorites.push(characterToAdd);
      }
    }

    // Si l'élément sélectionné est un comic
    if (req.fields.comic) {
      const comicToAdd = req.fields.comic;

      //Déclaration du tableau des comics en favoris du compte connecté
      const comicFavorites = user.comicFavorites;

      // Vérification que l'élément sélectionné n'est pas déjà présent dans le tableau du compte connecté
      const comicExist = comicFavorites.find(
        (elem) => elem._id === comicToAdd._id
      );

      // Si le comic sélectionné est déjà présent dans le tableau, on envoie une alerte
      // Si non, on ajoute le comic dans le tableau des comics favoris
      if (comicExist) {
        console.log("Le comic figure déjà parmi vos favoris");
      } else {
        comicFavorites.push(comicToAdd);
        console.log("Tableau des comics en favoris après ==>", comicFavorites);
      }
    }

    // Actualisation des données du compte connecté
    await user.save();

    // Envoi au client des données actualisées
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Route pour supprimer les favoris
router.post("/user/remove-favorites", async (req, res) => {
  // On cherche le user connecté
  try {
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });
    console.log("Infos du user connecté dans la route Remove ==>", user);

    // Déclaration du tableau des comics favoris du compte connecté
    const comicFavorites = user.comicFavorites;
    // Déclaration du tableau des personnages favoris du compte connecté
    const characterFavorites = user.characterFavorites;

    console.log("les personnages favoris =>", user.characterFavorites);

    // Si l'élément à supprimer par le client est un personnage
    if (req.fields.character) {
      // Boucle pour chercher l'élément du tableau à supprimer
      for (let i = 0; i < characterFavorites.length; i++) {
        if (characterFavorites[i]._id === req.fields.character._id) {
          characterFavorites.splice(i, 1);
        }
      }
    }
    // Si l'élément à supprimer par le client est un comic
    if (req.fields.comic) {
      // Boucle pour chercher l'élément du tableau à supprimer
      for (let i = 0; i < comicFavorites.length; i++) {
        if (comicFavorites[i]._id === req.fields.comic._id) {
          comicFavorites.splice(i, 1);
        }
      }
    }

    // Actualisation des données du compte connecté
    await user.save();
    // Envoi au client des données actualisées
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
