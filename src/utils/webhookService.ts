
export const sendToWebhook = async (data: any) => {
  console.log('Webhook service called with data:', {
    nomePaciente: data.nomePaciente,
    consultationType: data.consultationType,
    hasAudio: !!data.audioBlob,
    recordingDuration: data.recordingDuration,
    timestamp: data.timestamp
  });

  // For now, we'll just log the data since we're storing it in Supabase
  // Later this can be extended to send to external webhooks for processing
  
  try {
    // Simulate webhook call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Webhook processing complete for patient:', data.nomePaciente);
    return { success: true };
  } catch (error) {
    console.error('Webhook error:', error);
    throw new Error('Webhook processing failed');
  }
};
