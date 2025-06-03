import { supabase } from "@/integrations/supabase/client";

interface DocumentData {
  id_consulta: string;
  id_analysis: string;
  dados_selecionados: {
    hda: string;
    comorbidades: string;
    medicacoes: string;
    alergias: string;
    hipotese_diagnostica: string;
    conduta: string;
  };
}

export const generateAndSaveDocument = async (documentData: DocumentData) => {
  try {
    console.log('Enviando dados para webhook de geração de documento:', documentData);

    const response = await fetch('https://webhook.reptar.tech/webhook/helpem/assistente/doc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf, application/octet-stream',
      },
      body: JSON.stringify(documentData),
    });

    console.log('Resposta do webhook de documento - Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));

    if (!response.ok) {
      throw new Error(`Webhook retornou status ${response.status}: ${response.statusText}`);
    }

    // Receber o arquivo binário
    const blob = await response.blob();
    console.log('Arquivo recebido - Tamanho:', blob.size, 'bytes');
    console.log('Tipo do arquivo:', blob.type);

    // Gerar nome único para o arquivo
    const fileName = `documento_${documentData.id_consulta}_${Date.now()}.pdf`;
    
    // Fazer upload para o Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('consultation-documents')
      .upload(`documents/${fileName}`, blob, {
        contentType: blob.type || 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Erro ao fazer upload do documento:', uploadError);
      throw new Error('Falha ao salvar documento no storage');
    }

    console.log('Documento salvo no storage:', uploadData);

    // Salvar metadados do documento no banco
    const { data: docData, error: docError } = await supabase
      .from('consultation_documents')
      .insert({
        consultation_id: documentData.id_consulta,
        file_name: fileName,
        file_path: uploadData.path,
        file_size: blob.size,
        mime_type: blob.type || 'application/pdf',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (docError) {
      console.error('Erro ao salvar metadados do documento:', docError);
      // Se o erro for por causa da tabela não existir, retornar sucesso parcial
      if (docError.code === '42P01') {
        console.warn('Tabela consultation_documents não existe. Documento salvo apenas no storage.');
        return {
          success: true,
          document_id: 'storage-only',
          file_path: uploadData.path,
          file_name: fileName,
          consultation_id: documentData.id_consulta
        };
      }
      throw new Error('Falha ao salvar informações do documento');
    }

    // Abrir o documento para impressão
    const { data: { publicUrl } } = supabase.storage
      .from('consultation-documents')
      .getPublicUrl(uploadData.path);

    if (publicUrl) {
      // Abrir em nova janela para impressão
      const printWindow = window.open(publicUrl, '_blank');
      
      // Aguardar a janela carregar e tentar iniciar a impressão
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      }
    }

    // Retornar informações do documento salvo
    return {
      success: true,
      document_id: docData.id,
      file_path: uploadData.path,
      file_name: fileName,
      consultation_id: documentData.id_consulta
    };

  } catch (error) {
    console.error('Erro ao gerar documento:', error);
    throw error;
  }
};

// Função para obter URL pública do documento
export const getDocumentPublicUrl = async (consultationId: string): Promise<string | null> => {
  try {
    // Buscar o documento mais recente da consulta
    const { data, error } = await supabase
      .from('consultation_documents')
      .select('file_path')
      .eq('consultation_id', consultationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Se a tabela não existir, tentar buscar diretamente do storage
      if (error.code === '42P01') {
        console.warn('Tabela consultation_documents não existe. Tentando buscar diretamente do storage...');
        // Tentar construir o path manualmente
        const { data: files } = await supabase.storage
          .from('consultation-documents')
          .list(`documents`, {
            search: `documento_${consultationId}`
          });
        
        if (files && files.length > 0) {
          const filePath = `documents/${files[0].name}`;
          const { data: { publicUrl } } = supabase.storage
            .from('consultation-documents')
            .getPublicUrl(filePath);
          return publicUrl;
        }
      }
      console.error('Erro ao buscar documento:', error);
      return null;
    }

    if (!data) {
      console.error('Documento não encontrado para a consulta:', consultationId);
      return null;
    }

    // Obter URL pública do documento
    const { data: { publicUrl } } = supabase.storage
      .from('consultation-documents')
      .getPublicUrl(data.file_path);

    return publicUrl;
  } catch (error) {
    console.error('Erro ao obter URL do documento:', error);
    
    // Se o erro for relacionado ao bucket não existir
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as any).message || '';
      if (errorMessage.includes('Bucket not found')) {
        console.error('ERRO: O bucket "consultation-documents" não existe no Supabase Storage.');
        console.error('Por favor, crie o bucket seguindo as instruções em CRIAR_BUCKET_STORAGE.md');
      }
    }
    
    return null;
  }
}; 