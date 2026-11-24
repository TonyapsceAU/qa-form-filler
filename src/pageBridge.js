(function(){
console.log("[Init Bridge] Loaded");
window.addEventListener("message",
    async event => {
        if (event.source !== window ||event.data?.type !== "QA_UPLOAD_FILE"){
            return;
        }

        try{
            console.log("[Init Bridge] Upload Request",event.data);
            const file = new File(
                [new Uint8Array(event.data.fileBytes)],
                event.data.fileName,
                {type:event.data.fileType}
            );
            const inputs = [...document.querySelectorAll('input[type="file"]')];
            const input =inputs[event.data.inputIndex];
            console.log("[Init Bridge] Input Index:",event.data.inputIndex);
            console.log("[Init Bridge] Input:",input);
            if (!input){
                throw new Error("File input not found.");
            }

            const reactKey =Object.keys(input).find(key =>key.includes("__reactProps"));

            console.log("[Init Bridge] React Key:",reactKey);

            if (!reactKey){
                throw new Error("React props not found.");
            }

            const dt =new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;
            await input[reactKey].onChange({
                target: input,
                currentTarget: input
            });

            console.log("[Init Bridge] Upload Triggered");
            window.postMessage({
                type:"QA_UPLOAD_COMPLETE",
                inputIndex:event.data.inputIndex,
                success:true
            },"*");
        }catch(error){
            window.postMessage({
                type:"QA_UPLOAD_COMPLETE",
                inputIndex:event.data.inputIndex,
                success:false,
                error:error.message
            },"*");
        }
    });

})();

