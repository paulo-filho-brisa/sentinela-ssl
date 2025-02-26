# 🔍 Sentinela Certificados

Esse projeto consite em um script para verificar a validade, integridade e a segurança dos certificados SSL dos domínios da Brisanet Telecomunicações.

## 🚀 Tecnologias Utilizadas

- JavaScript
- testssl.sh
- Banco Postgres

## Estrutura do Projeto

Basicamente o projeto se utiliza da ferramenta OpenSource `testssl.sh` para realizar alguns testes nos certificados. Esses testes nos fornecem várias informações, porém filtramos o resultado e extraímos somente algumas informações

Essas informações são salvas em uma tabela no banco de dados para que o Grafana consuma.

## 🛠 Futuras Melhorias

- Implementação de execução dos testes com o `testssl.sh` em paralelo para acelerar a execução e o envio das informações ao banco de dados