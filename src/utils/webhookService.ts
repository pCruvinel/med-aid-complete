
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
    if (data.audioBlob) {
      audioBase64 = await blobToBase64(data.audioBlob);
      console.log('Audio converted to base64, size:', audioBase64.length);
    }

    // Structure the payload
    const payload = {
      consultation: {
        type: data.consultationType,
        timestamp: data.timestamp,
        recordingDuration: data.recordingDuration
      },
      protocols: data.protocols,
      clinicalData: {
        hda: data.hda,
        comorbidades: data.comorbidades,
        medicacoes: data.medicacoes,
        alergias: data.alergias,
        sinaisVitais: data.sinaisVitais,
        exameFisico: data.exameFisico,
        hipoteseDiagnostica: data.hipoteseDiagnostica,
        conduta: data.conduta,
        examesComplementares: data.examesComplementares,
        reavaliacaoMedica: data.reavaliacaoMedica,
        complementoEvolucao: data.complementoEvolucao
      },
      audio: audioBase64 ? {
        data: audioBase64,
        mimeType: 'audio/webm',
        duration: data.recordingDuration
      } : null
    };

    console.log('Sending payload to webhook:', webhookUrl);
    
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
    
  } catch (error) {
    console.error('Error sending to webhook:', error);
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
