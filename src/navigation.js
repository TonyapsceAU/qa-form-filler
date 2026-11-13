function getAllPages(navigationInfo){
    console.group("[NAVIGATION]","getAllPages");
    const pages = [];
    if(navigationInfo.type==="structured"){
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
    }else if (navigationInfo.type === "section"){
        const container = document.querySelectorAll('div[style*="justify-content: space-between"]');
        container.forEach(item => {
            const partElement = [...item.querySelectorAll("*")].find(element =>/^Part\s+/i.test(element.textContent.trim()));
            const button = item.querySelector("button");
            if (!partElement ||!button){
                return;
            }
            pages.push({
                part: partElement.textContent.trim(),
                title: button.textContent.trim(),
                button
            });
        });
    }
    console.log("Pages:",pages.map(page =>`${page.part} ${page.title}`));
    console.groupEnd();
    return pages;
}

function getNavigationInfo(){
    const navigation = document.querySelector('nav[aria-label="Form navigation"]');
    if (navigation){
        console.log("[NAVIGATION]","Found structured navigation");
        return ({type:"structured",navigation});
    }

    const buttons = [...document.querySelectorAll("button")].filter(button =>button.textContent.trim());
    if (buttons.length === 0){
        return;
    }
    console.log("[NAVIGATION]","Found section navigation");
    return ({type:"section",buttons:buttons});
}

async function waitForMenuRender(){
    return new Promise(resolve => {
        const interval = setInterval(() => {
            console.log("[NAVIGATION]","Waiting...");
            clearInterval(interval);
            const navigationInfo = getNavigationInfo();
            let found = false;
            if (navigationInfo?.type ==="structured"){
                found = true;
            }
            if (navigationInfo?.type ==="section" && navigationInfo.buttons.length){
                found = true;
            }
            if (!found){
                return;
            }
            clearInterval(interval);
            console.log("[NAVIGATION]","Ready");
            resolve();
        },500);
    });
}

async function openPage(title){
    await waitForMenuRender()
    const pages = getAllPages(getNavigationInfo());
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

function findNextButton(){
    const nextButton =
        [...document.querySelectorAll("button")]
            .find(button =>button.textContent.trim() ==="Next");
    if (!nextButton){
        console.warn("[NAVIGATION]","Next Button Not Found");
        return null;
    }
    return nextButton;
}

async function clickNextPage(){
    const nextButton = findNextButton();
    if (!nextButton){
        return false;
    }
    console.log("[NAVIGATION]","Click Next");
    nextButton.click();
    await waitForPageRender();
    return true;
}

async function waitForPageRender(){
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("[NAVIGATION]","Render Complete");
            resolve();
        },1000);
    });
}

function findMenuButton(){
    const menuButton = 
        [...document.querySelectorAll("button")]
            .find(button =>button.textContent.trim() ==="Menu");
    if (!menuButton){
        console.warn("[NAVIGATION]","Menu Button Not Found");
        return null;
    }
    console.log("[NAVIGATION]","Menu Button Found");
    return menuButton;
}

async function clickMenuButton(){
    const menuButton = findMenuButton();
    if (!menuButton){
        return false;
    }
    console.log("[NAVIGATION]","Opening Menu");
    menuButton.click();
    await waitForMenuRender();
    return true;
}

async function confirmPageChange(){
    const saveButton = [...document.querySelectorAll("button")]
        .find(button => button.textContent.trim() === "Save and continue");
    if (!saveButton){
        return;
    }
    saveButton.click();
    const startTime = Date.now();
    while(Date.now() - startTime < 10000){
        const okButton = [...document.querySelectorAll("button")]
            .find(button => button.textContent.trim() === "OK");
        if (okButton){
            okButton.click();
            return;
        }
        await new Promise(resolve => setTimeout(resolve,500));
    }
}