├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── configs/
│   │   ├── mongo.ts
│   │   └── setup.ts         
│   ├── controllers/
│   │   └── ordersController.ts
│   ├── services/
│   │   ├── transformService.ts
│   │   └── queryService.ts
│   ├── repositories/
│   │   ├── mongoClient.ts
│   │   └── orderRepository.ts
│   ├── queue/
│   │   └── fileQueue.ts
│   ├── utils/
│   │   └── format.ts
│   ├── types/
│   │   └── index.d.ts
├── tests/
│   ├── unit/
│   └── integration/
├── Dockerfile
├── docker-compose.yml
├── tsconfig.json
├── package.json
├── .env.example
└── README.md

"Optei por uma arquitetura funcional com separação de responsabilidades, pois ela permite um código limpo, testável e com baixo acoplamento, sem necessidade de um framework de injeção de dependência."

Vantagens dessa abordagem ( fila com mongoDB )
Não perde tarefas se o servidor cair ( persistencia ).

Simples: sem serviços e dependências extras ( Bee-Queue / bullMQ depende do redis ).

Resiliente: pode reprocessar tarefas com falha (retries).

Escalável: fácil de adaptar para múltiplos workers/processos.