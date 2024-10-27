# Teste Grupo Primo

Descrição completa do teste:
[Sistema de Transações Bancárias com Concorrência de Saldo - Grupo Primo](https://gist.github.com/gp-breno/71e3f5e0b85b97c79911037d8643e81e)

# Requisitos

 1. [Visual Studio Code](https://code.visualstudio.com/)
 2. [Node](https://nodejs.org/pt) versão 20.18.0
 3. Extensão [Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client)
 4. Database [PostgreSQL](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
 5. Clonar o projeto [Teste Grupo Primo](https://github.com/alanjso/teste-grupo-primo/)

### Setup Ambiente

 1. Após clonar, abra com o visual studio code a pasta do projeto.
 2. Abra a extensão do Thunder Client.
 3. Na aba de "Collections" clique no menu e escolha a opção "import".
 4. navegue até a pasta raiz do projeto e escolha o arquivo "thunder-collection_Grupo Primo.json" para ter acesso a coleção de request para executar o projeto.
 5. Caso ainda não tenha a versão 20.18.0 do Node, instale diretamente na máquina ou usando o [NVM](https://learn.microsoft.com/pt-br/windows/dev-environment/javascript/nodejs-on-windows)

### Setup Database

 1. Baixe e instale o PostgreSQL
 2. Durante o o wizard de instalação anote **porta** e **senha** utilizada na configuração da instancia.
 3. Abra o PgAdmin e conecte-se na instancia instalada do Postgres (será necessário a senha do user postgres).
 4. Crie um database e anote seu nome para ser usado no arquivo .env do projeto (recomenda-se o database **grupo-primo**).

### Setup Projeto

 1. Abra o terminal na raiz do projeto e execute o comando "npm i" para instalar as dependências do projeto.
 2. Configure o arquivo .env conforme exemplificado no arquivo env.exemple.
 3. Execute no terminal o comando "npm run dev".
 4. O projeto era sincronizar as tabelas no Postgres, se conectar a instancia e subir o serviço (na porta configurada no .env), que deixará disponível as rotas de CRUD de contas e Transações financeiras.
 5. Com as requests importadas no Thunder Client é possível testar manualmente cada rota do sistema.

##### Teste Automatizados

 1. Após inicializar pelo menos uma vez o projeto com o "npm run dev", encerre a instancia do projeto e siga para o próximo passo.
 2. Abra o terminal na raiz do projeto e execute o comando "npm test" para executar os testes da tabela verdade disponibilizadas no desafio.
 3. Os rultudados dos testes aparecerão no terminal.
 4. Se desejável, os logs de todas as operações de alteração estão sendo salvas na tabela "Logs".
 5. As contas criadas para os testes são automaticamente apagadas ao final da execução dos testes, mas os logs se mantem.