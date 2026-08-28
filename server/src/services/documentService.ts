import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export const extractTextFromBuffer = async (
  buffer: Buffer,
  mimeType: string,
  originalName: string
): Promise<string> => {
  try {
    if (mimeType === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf')) {
      const data = await pdfParse(buffer);
      return data.text || '';
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      originalName.toLowerCase().endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    }

    if (
      mimeType.startsWith('text/') ||
      originalName.toLowerCase().endsWith('.txt') ||
      originalName.toLowerCase().endsWith('.md') ||
      originalName.toLowerCase().endsWith('.csv') ||
      originalName.toLowerCase().endsWith('.json')
    ) {
      return buffer.toString('utf-8');
    }

    // Default fallback to utf-8 text
    return buffer.toString('utf-8');
  } catch (err: any) {
    console.error(`[DocumentService] Error extracting text from ${originalName}:`, err);
    throw new Error(`Failed to extract text from document: ${err.message}`);
  }
};
