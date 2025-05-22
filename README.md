![CI](https://github.com/MathSilms/vertical_logistica/actions/workflows/ci.yml/badge.svg)

 Vertical Logística — Desafio LuizaLabs.

Este projeto é uma API simples e funcional para leitura, enfileiramento e processamento de arquivos contendo dados de pedidos. 
O objetivo é demonstrar lógica, organização e qualidade de código utilizando boas práticas de engenharia de software.

tecnologias utilizadas:
Typescript
Docker
mongoDB
Jest e supertest ( testes unitários/integração )
mongodb-memory-server ( banco de dados em memória para testes )
multer ( permite upload de arquivos no endpoint ).

O projeto pode ser testado em produção.

url base : https://logistics-api-1-0-0.onrender.com/api

O deploy foi feito de forma gratuita utilizando [render.com](https://render.com/), por esse motivo, a api pode se encontrar offline em algums momentos ou apresendar uma leve demora na resposta.

caso esteja offline, baste enviar requisições e voltará a ficar online novamente.

## Arquitetura e Decisões

Como o objetivo do projeto é demonstrar o conhecimento de forma simples, eficaz e seguindo boas práticas, optei por utilizar uma arquitetura funcional.  
Entendo que, por se tratar de um sistema leve, rápido e bem específico, outras abordagens tomariam mais tempo e adicionariam complexidade desnecessária.

O sistema foi estruturado em camadas, com níveis e responsabilidades bem definidos, código limpo, testável e de baixo acoplamento, sem necessidade de frameworks de injeção de dependência.

O código possui cobertura de 100% em testes unitários (statements, branches e functions) e inclui um teste de integração que simula o processamento do arquivo até o salvamento no banco de dados.

## Persistência e Output

Para possibilitar o **output** da API, optei por utilizar o **MongoDB** como banco de dados.  
É leve, rápido e possui ótima sintonia com objetos **JSON** e **TypeScript**.

Não temos relacionamentos nem **queries** complexas, o que embasa novamente a escolha dessa tecnologia.
Além disso, também podemos criar index nas collections e otimizar o desempenho dos filtros.


A fim de prezar pela simplicidade, mas também demonstrar preocupação com a **persistência dos dados** e **tolerância a falhas**, criei um sistema de filas utilizando o próprio MongoDB.

### Como funciona

1. A API recebe o arquivo no **endpoint** de upload.  
2. O sistema salva o arquivo bruto no MongoDB em formato `raw` e marca-o como pendente.  
3. Um worker executa em background, processando os arquivos pendentes e armazenando-os em outra coleção.  
4. Ao final do processamento:  
   - Em caso de sucesso, o `raw` é marcado como `done` e não será mais alterado.  
   - Em caso de falha, o `raw` é marcado como `error`, permitindo que o arquivo seja reprocessado (evita perda de dados).  
5. Após o processamento, os dados são estruturados dentro do banco no formato de **output** da API. Isso facilita o consumo e evita formatação adicional.

### Vantagens dessa abordagem

- **Simples**: sem serviços e dependências extras (por exemplo, Bee-Queue ou BullMQ dependem do Redis).  
- **Resiliente**: suporta reprocessamento de tarefas com falha (retries).  
- **Escalável**: fácil de adaptar para múltiplos workers/processos.  
- **Sem perda de dados**: MongoDB consegue armazenar até 16 MB no campo `raw`, permitindo arquivos muito maiores que os do desafio.  
- **Sem sobrecarga**: o processamento em background torna a API mais rápida, segura e tolerante a falhas.  
- **Persistente**: não perde tarefas se o servidor cair — tudo o que for enviado fica salvo no banco até ser processado.

## Princípios Adotados (SOLID + Simplicidade)

**Single Responsibility**: Cada módulo tem função específica (ex: parsing, fila, controller).

**Open/Closed**: É fácil extender novos filtros ou alterar a fonte de persistência.

**Liskov**: Funções não quebram substituibilidade (ex: mocks em testes).

**Interface Segregation**: Tipos bem definidos (QueryFilters, QueueTask, etc).

**Dependency Inversion**: Baixo acoplamento com injeção manual (mockable).


## Padrões e Lógica

Parser robusto: Valida e transforma a linha do arquivo em objeto estruturado.

Worker desacoplado: Pode ser rodado como crontask ou processo separado.

API clara e minimalista: /upload e /orders.

## Chamadas da API
O sistema possui apenas duas rotas bem simples. Uma para upload de arquivos, outra para consultar os dados.

### Envio de arquivo

mesmo utilizando o curl, é necessário selecionar um arquivo válido localmente ao testar a api.

local:

curl -X POST http://localhost:3000/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@caminho/do/arquivo.txt"

Produção:

  curl --location 'https://logistics-api-1-0-0.onrender.com/api/orders/upload' \
--form 'file=@"/C:/Users/Usuario/Desktop/desafio tecnico/data_2.txt"'

### Consulta de pedidos

os parametros **orderId**, **startDate** e **andDate** são opcionais. Você também pode criar combinações com eles para filtrar o resultado. 

A consulta também pode ser feita com o endpoint raiz e retornará todos os pedidos cadastrados no sistema.

local:

curl -X GET "http://localhost:3000/api/orders?startDate=2021-07-14&orderId=461&endDate=2021-09-02"
curl -X GET "http://localhost:3000/orders"

prod:

curl --location --request GET 'https://logistics-api-1-0-0.onrender.com/api/orders?orderId=2&startDate=2021-07-14&endDate%20=2021-09-02' \
--form 'file=@"caminho/para/data_1.txt"'

curl --location --request GET 'https://logistics-api-1-0-0.onrender.com/api/orders' \
--form 'file=@"caminho/para/data_1.txt"'

## Automatização:

CI via **GitHub Actions**: cada push ou PR executa build + testes + coverage.

Comando **test:coverage** para gerar relatórios de cobertura locais.

Construção do sistema com **docker**: permite rodar o ambiente local praticamente identico ao que rodaria em produção. 
Evitando erros e facilitando o build.

Orquestração de containers com **kubernates**: Permite gerenciamento dos containers nos pods, tornando o sistema mais confiável. Caso um pod caia, automaticamente outro é colocado em seu lugar para manter o sistema 100% online.
Além disso, permite mais flexibilidade no gerenciamento dos containers e também utilizar uma interface mais amigável como o **Argos** por exemplo.

## Testes

Unitários: Validação de dados, parsing, serviços, controladores e repositórios.

Integrados: Simula ciclo completo: enfileiramento, leitura da fila e persistência.

Usa **mongodb-memory-server** para banco em memória durante os testes.

Cobertura total: cobertura de branches, paths e execução real do worker.

## Como Rodar:

### Localmente sem docker

para rodar o sistema dessa forma, é necessário ter instalado na máquina **Nodejs** ( recomendo v20.15.0 que foi utilizada no desenvolvimento ) e ter um banco de dados **mongoDB** rodando.

Acesse a raiz do projeto e crie um arquivo chamado `.env` com o as variaveis de ambiente : 

PORT=3000
MONGO_URI=mongodb://localhost:27017/logistics

instale as dependencias com `npm install`.
Após finalizar, será criada a pasta node modules com as dependencias.

Rode o comando `npm run dev` para iniciar o servidor.
Acompanhe o terminal e espere pelo log : **Server running at port:3000**.

Após o log aparecer, a api já está funcionando e pronta para receber requisições.

### Rodar com docker

Para rodar o sistema dessa forma, é necessário ter o **docker** instalado e rodando na máquina.

Acesse a raiz do projeto e rode o comando `docker-compose up`.
Isso vai criar a imagem do sistema no docker e fazer o build dos serviços da api e do banco de dados.

Após a finalização do build, os logs vão começar a aparecer no terminal e o sistema vai estar pronto para receber requisições.

### Rodar com Kubernetes

Para rodar o sistema dessa forma, é necessário ter o **docker** instalado e rodando na máquina.
Cluster Kubernetes local **Minikube** 
**kubectl** configurado para o seu cluster ( ao dar start no minikube, deveria funcionar já automaticamente ).

Para rodar corretamente o passo a passo, acesse o README_K8S.md que está dentro da pasta k8s/ na raiz do repositório.

## Rodar testes unitários + integrados
`npm test`

## Rodar testes com cobertura
`npm run test:coverage`

Gera um pasta chamada coverage. Dentro dessa pasta, temos um arquivo chamado index.html.
Caso queira consultar visualmente a cobertura de testes pelo código do sistema, pode optar por abrir esse arquivo no seu navegador.

## Build de produção (TypeScript > JavaScript)
`npm run build`

## Start da aplicação (modo produção)
`npm start`

só pode ser utilizado apos rodar o comando de build.

### Futuras melhorias

Retry automático de tasks com erro ( o sistema já marca arquivos com erro, mas não foi desenvolvido nesse desafio o sistema de reprocessamento ).

Monitoramento das tarefas em painel web.

Cache dos resultados para performance.

CLI para importação em lote.

Update dos dados no banco ( atualmente, após o processamento do raw o anterior é deletado do banco. uma melhoria seria fazer o update caso o id bata com um já existente )


### Considerações Finais

Esse projeto foca na qualidade de código, testabilidade e resiliência sem abrir mão da simplicidade. Não utilizei frameworks pesados ou dependências externas desnecessárias.

A leitura e tratamento dos dados do arquivo é o ponto chave do desafio. O sistema foi construído pensando em performance, robustez e facilidade de manutenção.


_Foi divertido._  
Feito com 💙 por [MathSilms](https://github.com/MathSilms) para luizaLabs!

