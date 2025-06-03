// Configuração do webhook para N8N
export const WEBHOOK_CONFIG = {
  // URL do webhook do N8N - altere conforme sua instalação
  N8N_WEBHOOK_URL: 'https://webhook.reptar.tech/webhook/helpem/assistente',
  
  // Timeout para as chamadas de webhook (em milliseconds)
  TIMEOUT: 120000, // 2 minutos - aumentado para dar tempo para o processamento da IA
  
  // Retry configuration
  MAX_RETRIES: 2,
  RETRY_DELAY: 2000 // 2 segundos
};
