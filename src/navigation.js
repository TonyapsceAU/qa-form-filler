async function menuNavigation(){
    console.group("[NAVIGATION]");
    const pages = getAllPages(await waitForNavigation());
    console.log("Page Count:",pages.length);
    await openPage(pages[0].title);
    console.groupEnd();
}

function getAllPages(navigationInfo){
    console.group("[NAVIGATION]","getAllPages");
    const pages = [];
    if(navigationInfo.type==="legacy"){
        navigationInfo.navigation
            .querySelectorAll("button")
            .forEach(button => {
                const container =button.closest('div[style*="flex-direction: column"]');
                if (!container){
                    return;
                }
                const partElement =
                    [...container.querySelectorAll("*")]
                        .find(element =>/^Part\s+/i.test(element.textContent.trim()));
                if (!partElement){
                    return;
                }
                pages.push({
                    part:partElement.textContent.trim(),
                    title:button.textContent.trim(),
                    button
                });
        });
    }else if (navigationInfo.type === "modern"){
        console.log("Modern Buttons:",navigationInfo.buttons);
        navigationInfo.buttons
            .forEach((button,index) => {
                pages.push({
                    part:`Part ${index + 1}`,
                    title: button.textContent.trim(),
                    button
                });

            });
    }
        
    console.log("Pages:",pages.map(page =>`${page.part} ${page.title}`));
    console.groupEnd();
    return pages;
}

async function waitForNavigation(){
    return new Promise(resolve => {
        const interval = setInterval(() => {
            const navigation = document.querySelector('nav[aria-label="Form navigation"]');
            if (navigation){
                clearInterval(interval);
                console.log("[NAVIGATION]","Found");
                resolve({type:"legacy",navigation});
                return;
            }

            const buttons = [...document.querySelectorAll("button")].filter(button =>button.textContent.trim());
            const pageButtons =
                buttons.filter(button =>
                    button.textContent.includes("RESEARCH") ||
                    button.textContent.includes("NOMINEE") ||
                    button.textContent.includes("ATTACHMENT")
                );
            if (pageButtons.length === 0){
                return;
            }
            clearInterval(interval);
            console.log("[NAVIGATION]","Found modern navigation");
            resolve({type:"modern",buttons:pageButtons});
        },500);
    });
}

async function openPage(title){
    const pages = getAllPages(await waitForNavigation());
    console.log("[PAGES]",pages);
    const page = pages.find(page =>page.title === title);
    if (!page){
        console.warn("[NAVIGATION]","Page Not Found:",title);
        return false;
    }
    console.log("[NAVIGATION]","Opening:",page.part,page.title);
    page.button.click();
    return true;
}