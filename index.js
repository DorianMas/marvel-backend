// Etape 1 - Installation des modules pour la création du serveur
// Etape 2 - Création d'un compte pour récupérer la clé API
// Etape 3 - Vérification du fonctionnement avec l'API
// Etape 4 - Création des routes
// Etape 5 - Frontend

/*Activation des variables d'environnement qui se trouvent dans le fichier .env */
require("dotenv").config();

/*Appel des modules*/
const express = require("express");
const formidableMiddleware = require("express-formidable");
const cors = require("cors");
const mongoose = require("mongoose");

/*Création du serveur*/
const app = express();
app.use(cors());
app.use(formidableMiddleware());

mongoose.connect(process.env.MONGODB_URI);

/*Test du fonctionnement du serveur*/

app.get("/", (req, res) => {
  res.status(200).json("Bienvenue sur l'API de Marvel");
});

//import des routes
const comicsRoute = require("./routes/comics");
app.use(comicsRoute);
const charactersRoute = require("./routes/characters");
app.use(charactersRoute);
const usersRoutes = require("./routes/users");
app.use(usersRoutes);

/*Lancement du serveur*/
app.listen(process.env.PORT, () => {
  console.log("Server has started");
});
