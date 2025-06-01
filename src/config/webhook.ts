
// Configuração do webhook para N8N
export const WEBHOOK_CONFIG = {
  // URL do webhook do N8N - altere conforme sua instalação
  N8N_WEBHOOK_URL: 'https://your-n8n-instance.com/webhook/consultation-analysis',
  
  // Timeout para as chamadas de webhook (em milliseconds)
  TIMEOUT: 30000, // 30 segundos
  
  // Retry configuration
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000 // 1 segundo
};
