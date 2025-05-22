# Kubernetes Local Testing Guide

Este documento descreve os passos para validar o funcionamento do sistema no cluster local Kubernetes (K8s).

## Passo 1: Suba o cluster local

Se você ainda não possui um cluster Kubernetes, é necessário baixar o Minikube

Após baixar, rode o comando no seu terminal
`minikube start`
Com Minikube

## Passo 2: Aplique os manifests do projeto

Acesse a raiz do projeto e rode o comando no terminal:

`kubectl apply -f k8s/`

depois verifique se os pods estão em execução :

`kubectl get pods`

Espere até ver:
`logistics-api-xxxxxxx   1/1   Running`
`mongo-xxxxxxx           1/1   Running`

(se ainda estiver ContainerCreating, aguarde).

## Passo 3: Exponha a API localmente

`kubectl port-forward service/logistics-api-service 3000:80`
 
 o endpoint http://localhost:3000 vai estar acessível e pode ser testado utilizando o curl.
 para interromper o port-forward, utilize Ctrl+C quando terminar os testes.
 
