#!/bin/bash

echo "Ecriture du fichier .gitignore"

# Ecrit les dossiers à ignorer par Git dans le fichier .gitignore
cat <<EOL > .gitignore
node_modules/
.env
EOL

echo "Le fichier .gitignore a été créé avec succès"