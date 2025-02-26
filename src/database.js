import dotenv from 'dotenv';
dotenv.config();
import pkg from 'pg';
const { Client } = pkg;

// Variáveis de ambiente para conexão com o banco de dados Postgres
const DB_USER = process.env.DB_USER;
const DB_HOST = process.env.DB_HOST;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_PORT = process.env.DB_PORT;

export const dbConfig = new Client ({
    user: DB_USER,
    host: DB_HOST,
    database: DB_DATABASE,
    password: DB_PASSWORD,
    port: DB_PORT,
});

export async function abrirConexaoNoBanco() {
    await dbConfig.connect();
    console.log("[INFO] Conexão com o banco de dados aberta.")
}

export async function fecharConexaoNoBanco() {
    await dbConfig.end();
    console.log("[INFO] Conexão com o banco de dados fechada.")
}

export async function inserirResultados(

    dominio,
    common_name,
    data_teste,
    verificacao_status,
    data_inicio_validade,
    data_fim_validade,
    certificado_valido,
    algoritmo_assinatura,
    vulnerabilidades_encontradas,
    detalhes_vulnerabilidades,
    nota_final,
    erro_na_verificacao

    ) {

    const query = `
        INSERT INTO monitoramento_ssl (
        dominio, 
        common_name,
        data_teste, 
        verificacao_status,
        data_inicio_validade,
        data_fim_validade,
        certificado_valido, 
        algoritmo_assinatura, 
        vulnerabilidades_encontradas, 
        detalhes_vulnerabilidades, 
        nota_final, 
        erro_na_verificacao
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
    `;

    await dbConfig.query(query, [
        dominio,
        common_name,
        data_teste,
        verificacao_status,
        data_inicio_validade,
        data_fim_validade,
        certificado_valido,
        algoritmo_assinatura,
        vulnerabilidades_encontradas,
        detalhes_vulnerabilidades,
        nota_final,
        erro_na_verificacao
    ]);

}