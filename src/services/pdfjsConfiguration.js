import * as pdfjslib from 'pdfjs-dist';
import PDFWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjslib.GlobalWorkerOptions.workerSrc = PDFWorker;