├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── configs/     
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── queue/
│   ├── utils/
│   ├── types/
├── tests/
│   ├── unit/
│   └── integration/
├── Dockerfile
├── docker-compose.yml
├── tsconfig.json
├── package.json
├── .env.example
└── README.md

____________________________________________________

"Optei por uma arquitetura funcional com separação de responsabilidades, pois ela permite um código limpo, testável e com baixo acoplamento, sem necessidade de um framework de injeção de dependência."


____________________________________________________
Vantagens dessa abordagem ( fila com mongoDB )
Não perde tarefas se o servidor cair ( persistencia ).

Simples: sem serviços e dependências extras ( Bee-Queue / bullMQ depende do redis ).

Resiliente: pode reprocessar tarefas com falha (retries).

Escalável: fácil de adaptar para múltiplos workers/processos.

Sem perda de dados: Mongodb consegue armazenar até 16mb no raw.( arquivos de exemplo tem 222kb)