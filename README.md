# Yoga App - Application Full-Stack

Application de gestion de sessions de yoga avec authentification JWT, développée avec Angular (frontend) et Spring Boot (backend).

## Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
  - [Backend](#installation-backend)
  - [Frontend](#installation-frontend)
- [Configuration](#configuration)
  - [Base de données](#base-de-données)
  - [Variables d'environnement](#variables-denvironnement)
- [Exécution](#exécution)
- [Tests](#tests)
  - [Tests Backend](#tests-backend)
  - [Tests Frontend](#tests-frontend)
- [Couverture de code](#couverture-de-code)

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants sur votre machine :

### Backend
- **Java** : version 17 ou supérieure
  ```bash
  java -version
  ```
- **Maven** : version 3.6 ou supérieure
  ```bash
  mvn -version
  ```
- **MySQL** : version 8.0 ou supérieure
  ```bash
  mysql --version
  ```

### Frontend
- **Node.js** : version 16 ou supérieure
  ```bash
  node -version
  ```
- **npm** : version 8 ou supérieure
  ```bash
  npm -version
  ```
- **Angular CLI** : version 14 ou supérieure
  ```bash
  ng version
  ```

## Installation

### Installation Backend

1. Naviguez vers le dossier backend :
   ```bash
   cd back
   ```

2. Installez les dépendances Maven :
   ```bash
   mvn clean install
   ```

### Installation Frontend

1. Naviguez vers le dossier frontend :
   ```bash
   cd front
   ```

2. Installez les dépendances npm :
   ```bash
   npm install
   ```

## Configuration

### Base de données

#### 1. Création de la base de données MySQL

Connectez-vous à MySQL et créez la base de données :

```sql
CREATE DATABASE yoga_app;
```

#### 2. Importation de la base de données

Le schéma SQL se trouve dans `ressources\sql`. Importez-le dans votre base de données :

Exécutez le script `script.sql` dans votre la base de données `yoga_app`

#### 3. Configuration de la connexion

Modifiez le fichier `back/src/main/resources/application.properties` avec vos informations de connexion :

```properties
# Configuration MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/yoga_app?allowPublicKeyRetrieval=true
spring.datasource.username=VOTRE_USERNAME
spring.datasource.password=VOTRE_PASSWORD

oc.app.jwtSecret=VotreSecretJWT
```

**⚠️ Important** : Remplacez les valeurs suivantes :
- `VOTRE_USERNAME` : votre nom d'utilisateur MySQL (par défaut : `root`)
- `VOTRE_PASSWORD` : votre mot de passe MySQL
- `VotreSecretJWT` : une clé secrète pour signer les tokens JWT

## Exécution

### Démarrage du Backend



L'API sera accessible sur **http://localhost:8080**

### Démarrage du Frontend

1. Naviguez vers le dossier frontend :
   ```bash
   cd front
   ```

2. Lancez le serveur de développement Angular :
   ```bash
   npm start
   ```

L'url de l'application s'affichera dans l'invite de commande
## Tests

### Tests Backend

Le backend dispose de **61 tests** (dont **31%** de tests d'intégration).

```bash
cd back
mvn test
```

### Tests Frontend

Le frontend dispose de tests unitaires (Jest/Karma) et de tests E2E (Cypress).

#### Tests unitaires

```bash
cd front
npm run test
```

#### Tests E2E avec Cypress

```bash
cd front
npm run e2e
```


## Couverture de code

### Couverture Backend (JaCoCo)

#### Générer le rapport de couverture

```bash
cd back
mvn clean test
```

#### Consulter le rapport

Le rapport HTML est généré dans :
```
back/target/site/jacoco/index.html
```

### Couverture Frontend (NYC)

#### Générer le rapport de couverture des tests unitaires

```bash
cd front
npm run test:coverage
```

Le rapport sera généré dans `front/coverage/jest/lcov-report`.

#### Générer le rapport de couverture E2E

```bash
cd front
npm run e2e:coverage
```

Le rapport sera disponible dans `front/coverage/e2e`.

#### Consulter le rapport

Ouvrez le fichier `index.html` dans votre navigateur.

