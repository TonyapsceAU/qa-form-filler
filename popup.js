document.addEventListener(
    "DOMContentLoaded",
    () => {
        const scanBtn = document.getElementById("scanBtn");
        const result = document.getElementById("result");

        scanBtn.addEventListener(
            "click",
            async () => {
                try {
                    const [tab] =
                        await chrome.tabs.query({
                            active: true,
                            currentWindow: true
                        });

                    const response =
                        await chrome.tabs.sendMessage(
                            tab.id,
                            {
                                action: "scanForm"
                            }
                        );

                    result.textContent =
                        JSON.stringify(
                            response,
                            null,
                            2
                        );

                }
                catch(error) {
                    result.textContent =
                        "Scan Failed:\n" +
                        error.message;

                    console.error(error);
                }

            });
    });