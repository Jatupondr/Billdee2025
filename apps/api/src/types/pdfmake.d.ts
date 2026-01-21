declare module "pdfmake/src/printer" {
  import { TFontDictionary, TDocumentDefinitions } from "pdfmake/interfaces";

  interface PDFDocument extends NodeJS.ReadableStream {
    end(): void;
  }

  class PdfPrinter {
    constructor(fontDescriptors: TFontDictionary);
    createPdfKitDocument(
      docDefinition: TDocumentDefinitions,
      options?: Record<string, unknown>,
    ): PDFDocument;
  }

  export = PdfPrinter;
}
