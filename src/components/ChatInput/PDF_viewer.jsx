import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";



const PdfViewer = ({pdfurl}) => {

    const [loading, set_loading] = useState(true);
    const Pdf_Container = useRef(null);

    useEffect(() => {
      

        async function pdfloader(){

            set_loading(true);

            const pdf = await pdfjsLib.getDocument(pdfurl).promise;

            Pdf_Container.current.innerHTML = "";

            for (let i = 1; i <= pdf.numPages; i++){

                const pdf_page = await pdf.getPage(i);

                const viewport = pdf_page.getViewport({scale: 1.5});

                const canvas = document.createElement("canvas");

                const context = canvas.getContext("2d");

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await pdf_page.render(
                    {
                        canvasContext: context,
                        viewport
                    }
                ).promise;

                canvas.style.display = "block";
                canvas.style.margin = "2px auto";

                Pdf_Container.current.appendChild(canvas);

            }
            
            set_loading(false);


        }
        
        pdfloader();

        
    },[pdfurl])


    return (

        <>
        
        {loading && <p>... در انتظار</p>}

        <div ref={Pdf_Container}>
        </div>

        </>

    )


}


export default PdfViewer;