import { Injectable } from '@angular/core'
import { PDFDocument } from 'pdf-lib'

@Injectable({
    providedIn: 'root',
})
export class PdfMergeService {
    /**
     * Merge multiple base64 PDF strings into a single PDF
     * @param base64Pdfs Array of base64 PDF strings (with or without data URI prefix)
     * @returns Promise<string> Merged PDF as base64 string (without data URI prefix)
     */
    async mergePdfs(base64Pdfs: string[]): Promise<string> {
        if (!base64Pdfs || base64Pdfs.length === 0) {
            throw new Error('No PDFs provided to merge')
        }

        // If only one PDF, return it directly (cleaned)
        if (base64Pdfs.length === 1) {
            return this.cleanBase64(base64Pdfs[0])
        }

        try {
            // Create a new PDF document
            const mergedPdf = await PDFDocument.create()

            // Process each PDF
            for (const base64Pdf of base64Pdfs) {
                // Clean the base64 string (remove data URI prefix if present)
                const cleanedBase64 = this.cleanBase64(base64Pdf)

                // Convert base64 to Uint8Array
                const pdfBytes = this.base64ToUint8Array(cleanedBase64)

                // Load the PDF
                const pdf = await PDFDocument.load(pdfBytes)

                // Copy all pages from this PDF to the merged PDF
                const copiedPages = await mergedPdf.copyPages(
                    pdf,
                    pdf.getPageIndices(),
                )
                copiedPages.forEach((page) => {
                    mergedPdf.addPage(page)
                })
            }

            // Save the merged PDF
            const mergedPdfBytes = await mergedPdf.save()

            // Convert to base64
            return this.uint8ArrayToBase64(mergedPdfBytes)
        } catch (error) {
            console.error('Error merging PDFs:', error)
            throw new Error('Failed to merge PDFs')
        }
    }

    /**
     * Remove data URI prefix from base64 string if present
     * @param base64String Base64 string with or without data URI prefix
     * @returns Clean base64 string
     */
    private cleanBase64(base64String: string): string {
        if (!base64String) {
            throw new Error('Invalid base64 string')
        }

        // Remove data URI prefix if present (e.g., "data:application/pdf;base64,")
        const base64Pattern = /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+)?;base64,/
        return base64String.replace(base64Pattern, '')
    }

    /**
     * Convert base64 string to Uint8Array
     * @param base64 Clean base64 string
     * @returns Uint8Array
     */
    private base64ToUint8Array(base64: string): Uint8Array {
        const binaryString = atob(base64)
        const len = binaryString.length
        const bytes = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i)
        }
        return bytes
    }

    /**
     * Convert Uint8Array to base64 string
     * @param uint8Array Uint8Array
     * @returns Base64 string (without data URI prefix)
     */
    private uint8ArrayToBase64(uint8Array: Uint8Array): string {
        let binary = ''
        const len = uint8Array.byteLength
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8Array[i])
        }
        return btoa(binary)
    }

    /**
     * Get a base64 string with data URI prefix
     * @param base64 Clean base64 string
     * @returns Base64 string with data URI prefix for PDF
     */
    getDataUri(base64: string): string {
        return `data:application/pdf;base64,${base64}`
    }
}
