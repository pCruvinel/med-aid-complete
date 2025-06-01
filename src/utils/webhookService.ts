
interface WebhookData {
  consultationType: string;
  protocols: any;
  hda: string;
  comorbidades: any;
  medicacoes: any;
  alergias: any;
  sinaisVitais: any;
  exameFisico: any;
  hipoteseDiagnostica: string;
  conduta: string;
  examesComplementares: string;
  reavaliacaoMedica: string;
  complementoEvolucao: string;
  audioBlob?: Blob | null;
  recordingDuration: number;
  timestamp: string;
}

export const sendToWebhook = async (data: WebhookData): Promise<boolean> => {
  const webhookUrl = 'https://webhook.reptar.tech/webhook/helpem/assistente';
  
  try {
    console.log('Preparing data for webhook...', data);
    
    // Convert audio blob to base64 if it exists
    let audioBase64 = null;
    if (data.audioBlob && data.audioBlob.size > 0) {
      audioBase64 = await blobToBase64(data.audioBlob);
      console.log('Audio converted to base64, size:', audioBase64.length);
    }

    // Create a flat structure with all fields from the form
    const payload = {
      // Basic consultation info
      consultationType: data.consultationType,
      timestamp: data.timestamp,
      recordingDuration: data.recordingDuration,
      
      // Clinical data fields
      hda: data.hda,
      hipoteseDiagnostica: data.hipoteseDiagnostica,
      conduta: data.conduta,
      examesComplementares: data.examesComplementares,
      reavaliacaoMedica: data.reavaliacaoMedica,
      complementoEvolucao: data.complementoEvolucao,
      
      // Structured data
      comorbidades: data.comorbidades,
      medicacoes: data.medicacoes,
      alergias: data.alergias,
      sinaisVitais: data.sinaisVitais,
      exameFisico: data.exameFisico,
      protocols: data.protocols,
      
      // Audio data
      audio: audioBase64
    };

    console.log('Sending payload to webhook:', webhookUrl);
    console.log('Payload size:', JSON.stringify(payload).length, 'bytes');
    console.log('Audio included:', !!audioBase64);
    console.log('Payload preview:', {
      consultationType: payload.consultationType,
      hasHda: !!payload.hda,
      hasHipotese: !!payload.hipoteseDiagnostica,
      hasConduta: !!payload.conduta,
      hasAudio: !!payload.audio,
      audioSize: payload.audio ? payload.audio.length : 0
    });
    
    // First, try the normal request
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Webhook response:', result);
      return true;
      
    } catch (corsError) {
      console.log('CORS error detected, trying no-cors mode...', corsError);
      
      // If CORS fails, try with no-cors mode
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(payload),
      });

      // With no-cors, we can't read the response, but if no error is thrown,
      // the request was sent successfully
      console.log('Request sent with no-cors mode, payload size:', JSON.stringify(payload).length);
      return true;
    }
    
  } catch (error) {
    console.error('Error sending to webhook:', error);
    
    // Provide more specific error messages
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Erro de conectividade: Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
    }
    
    throw error;
  }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:audio/webm;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
