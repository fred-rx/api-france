#!/bin/bash

echo "Saisir les variables d'environnement de l'application"

# Demande les valeurs pour chaque variable d'environnement de l'application
read -p "APP_HOST : " appHost
read -p "APP_PORT : " appPort
read -p "JWT_SECRET : " jwtSecret

echo "Saisir les variables d'environnement de MySQL"

# Demande les valeurs pour chaque variable d'environnement de MySQL
read -p "DB_HOST : " dbHost
read -p "DB_PORT : " dbPort
read -p "DB_USER : " dbUser
read -p "DB_PASSWORD : " dbPassword

echo "Ecriture du fichier .env"

# Ecrit les variables d'environnement dans le fichier .env
cat <<EOL > .env
# Application configuration
APP_HOST = $appHost
APP_PORT = $appPort
JWT_SECRET = $jwtSecret

# Database configuration
DB_HOST = $dbHost
DB_PORT = $dbPort
DB_USER = $dbUser
DB_PASSWORD = $dbPassword
EOL

echo "Le fichier .env a été créé avec succès"
