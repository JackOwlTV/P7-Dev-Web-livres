// Déclaration et importation des dépendances
const Book = require("../models/Book");
const fs = require("fs")

exports.postOneBook = (req, res, next) => {

    // const bookObject = (req.body); //Test avec Postman
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: req.file ? `${req.protocol}://${req.get("host")}/${req.file.name}` : null,
    });
    book
        .save()
        .then(() => {
            res.status(201).json({ message: "Livre créé !" })
        }
        )
        .catch((error) => res.status(500).json({ error }));
};

exports.postRating = (req, res, next) => {
    const bookId = req.params.id;
    if (!bookId) {
        return res.status(400).json({ message: "L'identifiant du livre est manquant." });
    }

    // Vérifier si l'utilisateur a déjà renseigné une notation pour ce livre
    Book.findOne({ _id: bookId, "ratings.userId": req.auth.userId })
        .then((book) => {
            if (book) {
                return res.status(400).json({ message: "Vous avez déjà noté ce livre." });
            }

            // Mettre à jour le livre avec la nouvelle note
            Book.findByIdAndUpdate(bookId, {
                $push: {
                    ratings: {
                        userId: req.auth.userId,
                        grade: req.body.rating
                    }
                }
            }, { new: true })
                .then((book) => {
                    if (!book) {
                        return res.status(404).json({ message: "Le livre n'existe pas." });
                    }

                    // Calculer la moyenne des notes
                    const totalRatings = book.ratings.length;

                    const sumOfRates = book.ratings.reduce((total, rating) => total + rating.grade, 0);
                    book.averageRating = sumOfRates / totalRatings;

                    // Enregistrer les modifications
                    book.save().then((book) => {
                        res.status(200).json(book);
                    });
                })
                .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(400).json({ error }));
};


exports.putOneBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/${req.file.name}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: "Vous n'êtes pas autorisé à modifier ce livre." });
            } else {
                const oldImageUrl = book.imageUrl; // Sauvegarde de l'ancienne URL de l'image
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => {
                        if (req.file && oldImageUrl) {
                            const filename = oldImageUrl.split('/images/')[1];
                            fs.unlink(`images/${filename}`, (error) => {
                                if (error) {
                                    console.error("Erreur lors de la suppression de l'ancienne image :", error);
                                }
                            });
                        }
                        res.status(200).json({ message: "Le livre a été modifié!" });
                    })
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};


exports.deleteOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) {
                res.status(500).json({ message: "Ce livre n'existe pas." });
            }
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: "Vous n'êtes pas autorisé à supprimer ce livre." });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: "Le livre a été supprimé !" }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.getBestRating = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 })  //Trie par ordre décroissant
        .limit(3) //Garder uniquement les 0 premiers
        .then((books) => {
            res.status(200).json(books);
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};


exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (!book) {
                return res.status(404).json({ message: "Le livre n'existe pas." });
            }
            res.status(200).json(book);
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};


exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then((books) => {
            if (books === null) {
                res.status(204).json({ message: "Pas de livres" })
            } res.status(200).json(books)
        })
        .catch((error) => res.status(400).json({ error }));
};