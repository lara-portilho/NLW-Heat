<div align="center">
  <h1>Node</h1>
</div>

## Sumário

-   [Informações Gerais](#informações-gerais)
-   [Tecnologias](#tecnologias)
-   [Instalação](#instalação)

## Informações Gerais

Aqui está hospedado os arquivos para o funcionamento do backend da aplicação desenvolvida no NLW Heat. Nessa parte há o login de usuários por meio do OAuth do GitHub, salvamento dos usuários no banco de dados, perfil do usuário, envio de mensagens e recuperação das últimas 3 mensagens.

## Tecnologias

-   NodeJs
-   Prisma
-   Express
-   Typescript

## Instalação

### Pré-requisitos

-   Possuir Node e Yarn instalado
-   Possuir software para realizar requests http (ex.: Postman, Insomnia)

1. Clone o repositório
2. `$ yarn`
3. Troque o nome do arquivo `example.env` para `.env` e insira as informações do Github e um JWT Secret
3. `$ yarn dev`

## Como Usar

1. O usuário realiza o login com sua conta no Github.
2. O usuário posta uma mensagem no banco de dados.

## Endpoints

```
baseURL: http://localhost:3000
```
```
POST
/authenticate - faz o login

body: {
  code: string;
}
```
```
POST
/messages - cria nova mensagem *precisa estar logado*

body: {
  text: string;
  user_id: string;
}
```
```
GET
/messages/last - listar as últimas 3 mensagens cadastradas
```
```
GET
/users/compliments/receive - listar os elogios recebidos *deve estar logado*
```
```
GET
/profile - listar o perfil *deve estar logado*
```
