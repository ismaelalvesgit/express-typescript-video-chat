#!/bin/bash

versao=0.0.1

if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker não está instalado.' >&2
  exit 1
fi

echo "<============ Iniciando o build da versão $versao ==============>"
docker build -t backend:${versao} .
echo "<============ Iniciando o build da última versão ==============>"
docker build -t backend .
echo "<============ Build Finalizado ==============>"