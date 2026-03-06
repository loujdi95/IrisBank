-- -----------------------------------------------------------------------------
-- PROJET IRISBANK - SCRIPT DE CREATION DES TABLES (MySQL)
-- -----------------------------------------------------------------------------

-- On utilise la base de données configurée dans la connexion (ex: defaultdb)


-- --------------------------------------------------------
-- 1. Table `utilisateurs`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `prenom` VARCHAR(100) DEFAULT NULL,
  `nom` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `telephone` VARCHAR(15) DEFAULT NULL,
  `adresse_postale` VARCHAR(255) DEFAULT NULL,
  `date_naissance` DATE DEFAULT NULL,
  `mot_de_passe` VARCHAR(255) NOT NULL, -- Stockera le hash du mot de passe
  `est_admin` BOOLEAN DEFAULT FALSE,
  `date_creation` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- 2. Table `comptes_bancaires`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `comptes_bancaires` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `utilisateur_id` INT NOT NULL,
  `numero_compte` VARCHAR(34) NOT NULL UNIQUE, -- Format IBAN : FR76-...
  `type_compte` ENUM('courant', 'livret A', 'PEL') DEFAULT 'courant',
  `solde` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `devise` VARCHAR(3) DEFAULT 'EUR',
  `statut_compte` ENUM('actif', 'bloque') DEFAULT 'actif',
  `date_creation` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- 3. Table `transactions`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `compte_source_id` INT DEFAULT NULL,
  `compte_destinataire_id` INT DEFAULT NULL,
  `type_transaction` ENUM('depot', 'retrait', 'virement emis', 'virement recu') NOT NULL,
  `montant` DECIMAL(15, 2) NOT NULL,
  `libelle` VARCHAR(255) DEFAULT NULL,
  `date_transaction` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`compte_source_id`) REFERENCES `comptes_bancaires`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`compte_destinataire_id`) REFERENCES `comptes_bancaires`(`id`) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- INSERTIONS DE DONNEES DE TEST
-- -----------------------------------------------------------------------------

-- Insertion de l'administrateur
INSERT INTO `utilisateurs` (`email`, `telephone`, `adresse_postale`, `date_naissance`, `mot_de_passe`, `est_admin`)
VALUES
('admin@irisbank.fr', '0102030405', '1 Rue de la Banque, Paris', '1980-01-01', '$2b$10$UnHashBcryptGeneriquePourAdminMdp123!', TRUE);

-- Insertion de quelques clients
INSERT INTO `utilisateurs` (`email`, `telephone`, `adresse_postale`, `date_naissance`, `mot_de_passe`, `est_admin`)
VALUES
('client1@test.com', '0601020304', '10 Avenue des Champs', '1990-05-15', '$2b$10$UnHashBcryptGeneriquePourMdp123!', FALSE),
('client2@test.com', '0609080706', '25 Rue du Commerce', '1985-11-20', '$2b$10$UnHashBcryptGeneriquePourMdp123!', FALSE);

-- Insertion de comptes bancaires
-- Rappel : Format demandé FR76-YBNK-XXXX-XXXX-XXXX-XXX
INSERT INTO `comptes_bancaires` (`utilisateur_id`, `numero_compte`, `type_compte`, `solde`, `statut_compte`)
VALUES
(2, 'FR76-YBNK-1234-5678-9012-345', 'courant', 1500.00, 'actif'),
(2, 'FR76-YBNK-9876-5432-1098-765', 'livret A', 5000.00, 'actif'),
(3, 'FR76-YBNK-5555-4444-3333-222', 'courant', 250.50, 'actif'),
(3, 'FR76-YBNK-1111-2222-3333-444', 'courant', 0.00, 'bloque');

-- Insertion de quelques transactions de test
INSERT INTO `transactions` (`compte_source_id`, `compte_destinataire_id`, `type_transaction`, `montant`, `libelle`)
VALUES
(NULL, 1, 'depot', 1000.00, 'Dépôt initial en agence'),
(1, NULL, 'retrait', 50.00, 'Retrait DAB'),
(1, 2, 'virement emis', 150.00, 'Virement vers Livret A (Épargne mois)'),
(2, 1, 'virement recu', 150.00, 'Virement vers Livret A (Épargne mois)'),
(3, 1, 'virement emis', 25.50, 'Remboursement resto'),
(1, 3, 'virement recu', 25.50, 'Remboursement resto');
