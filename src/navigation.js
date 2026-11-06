async function menuNavigation(){
    console.group("[NAVIGATION]");
    const pages = getAllPages(await waitForNavigation());
    console.log("Page Count:",pages.length);
    await openPage(pages[0].title);
    console.groupEnd();
}

function getAllPages(navigation){
    console.group("[NAVIGATION]");
    const pages = [];
    navigation
        .querySelectorAll("button")
        .forEach(button => {
            const container =button.closest('div[style*="flex-direction: column"]');
            if (!container){
                return;
            }
            const partElement =container.querySelector("strong");
            if (!partElement){
                return;
            }
            pages.push({
                part:partElement.textContent.trim(),
                title:button.textContent.trim(),
                button
            });
        });
    console.log("Pages:",pages.map(page =>`${page.part} ${page.title}`));
    console.groupEnd();
    return pages;
}

async function waitForNavigation(){
    return new Promise(resolve => {
        const interval = setInterval(() => {
            const navigation = document.querySelector('nav[aria-label="Form navigation"]');
            if (!navigation){
                return;
            }
            clearInterval(interval);
            console.log("[NAVIGATION]","Found");
            resolve(navigation);
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