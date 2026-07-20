import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useRef } from "react";




const Pdf_Thumbnail = ({firstpage}) => {


    const canvas_ref = useRef(null);

    useEffect(() => {

        let mounted = true;

        async function render(){
            const pdf_file = await pdfjsLib.getDocument(firstpage).promise;
            const thumbnail = await pdf_file.getPage(1);

            const viewport = thumbnail.getViewport({scale:0.35});

            const canvas = canvas_ref.current;
            const context = canvas.getContext("2d");

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await thumbnail.render({
                canvasContext: context,
                viewport
            }).promise;

            if(!mounted){
                pdf_file.destroy();
            }

        }

        render()
        return () => {
            mounted = false;
        };

    },[firstpage])

    return(
        <canvas ref={canvas_ref} style={{width: `100%`, aspectRatio:`3/4`,background: `blue`}}/>
    )

}

export default Pdf_Thumbnail;

