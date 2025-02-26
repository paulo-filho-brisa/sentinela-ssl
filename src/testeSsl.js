import { execSync } from "child_process";
import * as fs from 'fs';
import { inserirResultados } from "./database.js";

/*
    Essa função recebe a lista com as URLs válidas e faz o teste com o testssl.sh.
*/
export async function testeSsl(listaUrlValidas = []) {

    /*
        Arquivo onde a saída do execSync será inserida. Por que um .txt? 
        Quando utilizamos a opção "--json" o arquivo .json gerado não é tão estruturado para fazer a coleta das informações
    */
    const arquivoTxt = "resultado.txt";

    function adjustTimezone(date) {  
        const offset = -3;
        const adjustedDate = new Date(date); 
        adjustedDate.setHours(adjustedDate.getHours() + offset);  
        return adjustedDate; 
    }

    for (const url of listaUrlValidas) {
        
        // Inicializando a variável de erro
        const erro = "";

        const data_teste = adjustTimezone(new Date().toISOString());
        // console.log(data_teste)

        try {

            console.log("[INFO] Executanto o testssl.sh nos domínios válidos...");
            // console.log(`[INFO] Testando SSL para: ${url}`);

            // Executando testssl.sh de forma síncrona
            execSync(`./src/testssl.sh/testssl.sh --color=0 > ${arquivoTxt} ${url}`, { stdio: "inherit" });

            // Lendo o conteúdo do arquivo txt gerado pelo testssl.sh
            const conteudo = fs.readFileSync(arquivoTxt, "utf8");
            
            const validadeMatch = conteudo.match(/Certificate Validity \(UTC\).*?\((\d{4}-\d{2}-\d{2} \d{2}:\d{2}) --> (\d{4}-\d{2}-\d{2} \d{2}:\d{2})\)/);

            const algoritmo_assinatura = conteudo.match(/Signature Algorithm\s+(.+)/);
            const notaCertificado = conteudo.match(/Overall Grade \s+([A-Z]\+?)/);
            const common_name = conteudo.match(/Common Name \(CN\)\s+(.+)/);

            // Capturar vulnerabilidades
            const linhasVulneraveis = conteudo
                .split("\n")
                .filter(linha => linha.includes("VULNERABLE") && !linha.includes("not vulnerable"));

            // Extraindo os dados relevantes
            const common_name_db = common_name ? common_name[1] : null;
            // Data de início do certificado
            const dataInicio = validadeMatch[1];  
            // Data de validade do certificado
            const dataValidade = validadeMatch[2]; 
            const algoritmo = algoritmo_assinatura ? algoritmo_assinatura[1] : null;
            const vulnerabilidades = (linhasVulneraveis.length > 0 ? true : false);
            const detalhes_vulnerabilidades = vulnerabilidades ? linhasVulneraveis.join("\n") : null;
            const nota_final_db = notaCertificado ? notaCertificado[1] : null;

            // Inserindo no banco de dados
            await inserirResultados(
                url,
                common_name_db,
                data_teste,
                true,
                dataInicio,
                dataValidade,
                true,
                algoritmo,
                vulnerabilidades,
                detalhes_vulnerabilidades,
                nota_final_db,
                null
            );

            // console.log(`[INFO] Teste SSL para ${url} inserido no banco.`);

        } 
        catch (error) {

            // console.error(`[ERRO] Erro ao processar ${url}:`);

            /*
                certificado_valido será igual a null, pois não conseguimos obter essa informação. Porém, quando montar a consulta no grafana
                podemos pegar a validade do último teste.
            */

            await inserirResultados(
                url,            
                null,
                data_teste,
                false,
                dataInicio,
                dataValidade,
                null,
                null,
                null,
                null,
                null, 
                error
            );
        
        }
    }

    console.log("[INFO] Todos os testes finalizados com sucesso!");
}
