(function(){
console.log("[QA Bridge] Loaded");
window.addEventListener("message",
    async event => {
        if (event.source !== window ||event.data?.type !== "QA_UPLOAD_FILE"){
            return;
        }

        try{
            console.log("[QA Bridge] Upload Request",event.data);
            const file = new File(
                [new Uint8Array(event.data.fileBytes)],
                event.data.fileName,
                {type:event.data.fileType}
            );
            const inputs = [...document.querySelectorAll('input[type="file"]')];
            const input =inputs[event.data.inputIndex];
            console.log("[QA Bridge] Input Index:",event.data.inputIndex);
            console.log("[QA Bridge] Input:",input);
            if (!input){
                throw new Error("File input not found.");
            }

            const reactKey =Object.keys(input).find(key =>key.includes("__reactProps"));

            console.log("[QA Bridge] React Key:",reactKey);

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

            console.log("[QA Bridge] Upload Triggered");
        }catch(error){
            console.error("[QA Bridge]",error);
        }
    });

})();

