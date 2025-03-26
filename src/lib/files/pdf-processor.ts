import * as crypto from 'crypto';
import fs from 'fs';
import util from 'util';
import path from 'path';
import { promisify } from 'util';
// @ts-ignore
import PDFParser from 'pdf-parse';

const readFile = promisify(fs.readFile);

/**
 * Interface for processed PDF metadata
 */
export interface ProcessedPDFMetadata {
  pageCount: number;
  title?: string;
  author?: string;
  keywords?: string[];
  creationDate?: Date;
  modificationDate?: Date;
  textContent: string;
  fingerprint: string;
}

/**
 * Process a PDF file to extract metadata and generate a digital fingerprint
 * @param filePath Path to the PDF file
 * @returns Metadata extracted from the PDF
 */
export async function processPDF(filePath: string): Promise<ProcessedPDFMetadata> {
  try {
    // Read the PDF file
    const dataBuffer = await readFile(filePath);
    
    // Parse the PDF
    const data = await PDFParser(dataBuffer);
    
    // Generate a fingerprint (hash) of the file contents
    const hash = crypto.createHash('sha256');
    hash.update(dataBuffer);
    const fingerprint = hash.digest('hex');
    
    // Extract metadata
    const metadata: ProcessedPDFMetadata = {
      pageCount: data.numpages || 0,
      textContent: data.text || '',
      fingerprint,
    };
    
    // Process additional metadata if available
    if (data.info) {
      metadata.title = data.info.Title || undefined;
      metadata.author = data.info.Author || undefined;
      metadata.keywords = data.info.Keywords?.split(',').map((k: string) => k.trim()) || undefined;
      
      if (data.info.CreationDate) {
        try {
          // PDF dates are often in format 'D:YYYYMMDDHHmmSS'
          const dateStr = data.info.CreationDate.replace('D:', '');
          const year = parseInt(dateStr.substring(0, 4));
          const month = parseInt(dateStr.substring(4, 6)) - 1;
          const day = parseInt(dateStr.substring(6, 8));
          metadata.creationDate = new Date(year, month, day);
        } catch (e) {
          console.error('Failed to parse PDF creation date', e);
        }
      }
      
      if (data.info.ModDate) {
        try {
          const dateStr = data.info.ModDate.replace('D:', '');
          const year = parseInt(dateStr.substring(0, 4));
          const month = parseInt(dateStr.substring(4, 6)) - 1;
          const day = parseInt(dateStr.substring(6, 8));
          metadata.modificationDate = new Date(year, month, day);
        } catch (e) {
          console.error('Failed to parse PDF modification date', e);
        }
      }
    }
    
    return metadata;
  } catch (error: any) {
    console.error('Error processing PDF:', error);
    throw new Error(`Failed to process PDF: ${error.message}`);
  }
}

/**
 * Extract text content from a PDF file
 * @param filePath Path to the PDF file
 * @returns Text content as a string
 */
export async function extractPDFText(filePath: string): Promise<string> {
  try {
    const metadata = await processPDF(filePath);
    return metadata.textContent;
  } catch (error: any) {
    console.error('Error extracting PDF text:', error);
    return '';
  }
}

/**
 * Generate a digital fingerprint for a PDF file
 * @param filePath Path to the PDF file
 * @returns SHA-256 hash of the file
 */
export async function generatePDFFingerprint(filePath: string): Promise<string> {
  try {
    const dataBuffer = await readFile(filePath);
    const hash = crypto.createHash('sha256');
    hash.update(dataBuffer);
    return hash.digest('hex');
  } catch (error: any) {
    console.error('Error generating PDF fingerprint:', error);
    throw new Error(`Failed to generate fingerprint: ${error.message}`);
  }
} 