/**
 * CosmosHelper.js
 * 
 * Lógica para conectar el navegador DIRECTAMENTE a Azure Cosmos DB.
 * Usa Web Crypto API para generar firmas HMAC-SHA256 sin librerías externas.
 */

// ==========================================
// CONFIGURACIÓN (¡Cuidado! Llaves expuestas)
// ==========================================
const COSMOS_URL = "https://speedmagazinebikers.documents.azure.com:443/"; 
const MASTER_KEY = "44c1Aof8B4beurN5Vp1P8qzlCXrCMKZGydf4OqFjRlcmoi0DzyvRLkjICvY5zcDjj9EtkkntZkBtACDb9AxCOw==";
const DB_ID      = "mi_db";

/**
 * Helper para convertir Base64 a ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Helper para convertir ArrayBuffer a Base64
 */
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

/**
 * Genera el encabezado 'Authorization' usando Web Crypto API
 */
async function generateAuthHeader(verb, resourceType, resourceId) {
    const date = new Date().toUTCString();
    
    // El payload debe seguir el formato exacto de Cosmos DB REST API
    const text = (verb || "").toLowerCase() + "\n" +
                 (resourceType || "").toLowerCase() + "\n" +
                 (resourceId || "").toLowerCase() + "\n" +
                 date.toLowerCase() + "\n" +
                 "" + "\n";

    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const keyData = base64ToArrayBuffer(MASTER_KEY);

    // Importar la llave para HMAC
    const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    // Firmar
    const signature = await window.crypto.subtle.sign("HMAC", cryptoKey, data);
    const signatureBase64 = arrayBufferToBase64(signature);

    return {
        auth: encodeURIComponent(`type=master&ver=1.0&sig=${signatureBase64}`),
        date: date
    };
}

export const CosmosHelper = {
    /**
     * Realiza una petición REST nativa a Cosmos DB
     */
    async request(method, collection, body = null, id = null) {
        const resourceType = "docs";
        const resourceId   = `dbs/${DB_ID}/colls/${collection}`;
        const endpoint     = `${COSMOS_URL}${resourceId}/docs${id ? '/' + id : ''}`;

        const { auth, date } = await generateAuthHeader(method, resourceType, resourceId);

        const headers = {
            "Accept": "application/json",
            "x-ms-date": date,
            "x-ms-version": "2020-07-15",
            "Authorization": auth,
            "x-ms-documentdb-isquery": body ? "False" : "True", 
            "x-ms-query-enable-crosspartition": "True"
        };

        // Si estamos enviando un cuerpo (POST/PUT), necesitamos la Partition Key
        if (body && body.datos) {
            const pkValue = JSON.stringify([body.datos]);
            headers["x-ms-documentdb-partitionkey"] = pkValue;
            headers["x-ms-partitionkey"] = pkValue; // Enviamos los dos nombres posibles
        }
        
        if (method === "DELETE" && id) {
            const pkValue = JSON.stringify([id]); // Asumiendo id como PK en delete
            headers["x-ms-documentdb-partitionkey"] = pkValue;
            headers["x-ms-partitionkey"] = pkValue;
        }

        console.log("Headers enviando a Azure:", headers);
        // Si estamos borrando, tambien la necesitamos
        if (method === "DELETE" && id) {
            headers["x-ms-partitionkey"] = JSON.stringify([id]);
        }

        const options = {
            method: method,
            headers: headers
        };

        if (body) {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(body);
            // Si es un POST para guardar, no usamos el header de Query
            delete options.headers["x-ms-documentdb-isquery"];
        }

        const response = await fetch(endpoint, options);
        if (!response.ok) {
            const errorText = await response.text();
            let errorMsg = errorText;
            try { 
                const errorJson = JSON.parse(errorText);
                errorMsg = errorJson.message || errorText;
            } catch(e) {}
            
            console.error("❌ ERROR DETECTADO EN AZURE:", errorMsg);
            throw new Error(errorMsg);
        }

        return await response.json();
    }
};
