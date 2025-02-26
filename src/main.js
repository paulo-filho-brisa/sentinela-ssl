import { testeValidadeUrl } from "./verificarUrls.js";
import { listaComDominios } from "./listaComDominios.js";
import { testeSsl } from "./testeSsl.js";
import { abrirConexaoNoBanco, fecharConexaoNoBanco } from "./database.js";

async function executarScript() {
    
    console.log(`[INFO] Iniciando execução do script em ${new Date().toLocaleString()}`);

    try {
        /*
            Abrindo a conexão com o banco de dados.
        */
        console.log("[INFO] Abrindo conexão com o banco de dados...");
        await abrirConexaoNoBanco();

        /*
            Validando URLs. A função recebe a lista com os domínios e retorna somente as URLs válidas.
            Para verificar quais URLs são válidas, a função faz um GET no domínio.
        */
        const validas = await testeValidadeUrl(listaComDominios);
        
        /*
            Executando teste de SSL nas URLs válidas.
        */
        await testeSsl(validas);

    } 
    catch (error) {
        console.error("[ERRO] Ocorreu um erro durante a execução do script.", error);
    } 
    finally {
        /*
            Fechando a conexão com o banco de dados.
        */
        try {
            console.log("[INFO] Fechando conexão com o banco de dados...");
            await fecharConexaoNoBanco();
        } 
        catch (error) {
            console.error("[ERRO] Erro ao fechar conexão com o banco de dados.", error);
        }
    }
}

// Executa imediatamente ao iniciar
executarScript();

// Configura a execução a cada 24 horas (24 * 60 * 60 * 1000 milissegundos)
setInterval(executarScript, 24 * 60 * 60 * 1000);
