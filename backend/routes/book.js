// Déclaration et importation des dépendances
const express = require("express");
const auth = require("../middleware/auth");
const bookCtrl = require("../controllers/book");
const multer = require("../middleware/multer-config");
const router = express.Router();

// Mise en place de la configuration des routes

// Route pour créer un nouveau livre
router.post("/", auth, multer, bookCtrl.postOneBook);

// Route pour ajouter une évaluation à un livre
router.post("/:id/rating", auth, bookCtrl.postRating);

// Route pour mettre à jour les informations d'un livre existant
router.put("/:id", auth, multer, bookCtrl.putOneBook);

// Route pour supprimer un livre existant
router.delete("/:id", auth, bookCtrl.deleteOneBook);

// Route pour obtenir les livres avec les meilleures évaluations
router.get("/bestrating", bookCtrl.getBestRating);

// Route pour obtenir les informations d'un livre spécifique
router.get("/:id", bookCtrl.getOneBook);

// Route pour obtenir tous les livres
router.get("/", bookCtrl.getAllBooks);

module.exports = router;