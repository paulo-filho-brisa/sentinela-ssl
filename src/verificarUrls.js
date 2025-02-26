import axios, { AxiosError } from "axios";
import { inserirResultados } from "./database.js";

/*
    Função que verifica quais são as urls válidas para proseguirmos com os testes
*/
export async function testeValidadeUrl(listaComDominios = []) {
    
    console.log("[INFO] Testando os domínios...")
    var listaUrlValidas = []
    var listaUrlInvalidas = []

    // Função para ajustar o fuso horário
    function adjustTimezone(date) {  
        const offset = -3;
        const adjustedDate = new Date(date); 
        adjustedDate.setHours(adjustedDate.getHours() + offset);  
        return adjustedDate; 
    }

    for (const url of listaComDominios) {

        // console.log(`[INFO] Verificando a URL: ${url}`)
        var erro = "";
        const data_teste = adjustTimezone(new Date().toISOString("yyyy-MM-dd HH:mm:ss"));
        // console.log(data_teste)

        try {

            const response = await axios.get(url, { timeout: 60000 });
    
            if (response.status === 200) {
                listaUrlValidas.push(url);
                // console.log(`URL válida: ${url}`);
            } else {
                // console.log(`URL válida: ${url} e status: ${response.status}`);
            }
        } 
        catch (error) {

            // console.log("Erro ao verificar URL:", error);
    
            if (error instanceof AxiosError) {
                if (error.code) {
                    // Tratando erros comuns do Axios com base no código
                    if (error.code === 'ECONNABORTED') {
                        erro = "Erro Axios: Timeout na conexão";
                    } else if (error.code === 'ENOTFOUND') {
                        erro = "Erro Axios: Domínio não encontrado";
                    } else if (error.code === 'ECONNREFUSED') {
                        erro = "Erro Axios: Conexão recusada pelo servidor";
                    } else if (error.code === 'EAI_AGAIN') {
                        erro = "Erro Axios: Erro temporário de DNS";
                    } else {
                        erro = `Erro Axios: ${error.code}`;
                    }
                } 
                else if (error.message) {
                    // Tratando erros que não possuem código, mas possuem mensagem
                    if (error.message.includes("certificate has expired")) {
                        erro = "Certificado SSL expirado";
                    } else if (error.message.includes("unable to verify the first certificate") || 
                               error.message.includes("UNABLE_TO_VERIFY_LEAF_SIGNATURE") ||
                               error.message.includes("certificate")) {
                        erro = "Erro no certificado SSL";
                    } else if (error.message.includes("getaddrinfo ENOTFOUND")) {
                        erro = "Erro de DNS (getaddrinfo ENOTFOUND)";
                    } else {
                        erro = `Erro desconhecido: ${error.message}`;
                    }
                } 
                else {

                    erro = "Erro desconhecido ao verificar a URL";
                }
            } else {
                erro = "Erro não identificado (possível erro no Axios)";
            }
    
            listaUrlInvalidas.push(url);
    
            await inserirResultados(
                url,            // dominio
                null,           // common_name
                data_teste,     // data_teste
                false,          // verificacao_status
                null,           // data_inicio_certificado
                null,           // data_fim_certificado
                null,           // certificado_valido
                null,           // algoritmo_assinatura
                null,           // vulnerabilidades_encontradas
                null,           // detalhes_vulnerabilidades
                null,           // nota_final
                erro            // erro_na_verificacao
            );
        }
    }
    

    console.log(`[INFO] Há ${listaUrlValidas.length} URLs válida(s)`)
    console.log(`[INFO] Há ${listaUrlInvalidas.length} URLs inválida(s)`)

    /*
        Aqui retornamos a lista com as URL válidas para usarmos na função que testa o certificado com o executável do testssl.sh
    */
    return listaUrlValidas;

}