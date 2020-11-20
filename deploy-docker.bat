set versao=0.0.1

echo "<============ Iniciando o build da versao %versao% ==============>"
docker build -t backend:%versao% .
echo "<============ Iniciando o build da ultima versao ==============>"
docker build -t backend .
echo "<============ Enviando imagem na versao %versao% para o repositorio ==============>"
docker push backend:%versao%
echo "<============ Enviando imagem na ultima versao para o repositorio ==============>"
docker push backend
echo "<============ Deploy Finalizado ==============>"