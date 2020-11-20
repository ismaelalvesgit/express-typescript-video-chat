set versao=0.0.1

echo "<============ Iniciando o build da versao %versao% ==============>"
docker build -t backend:%versao% .
echo "<============ Iniciando o build da ultima versao ==============>"
docker build -t backend .
echo "<============ Build Finalizado ==============>"