const chromium = require("chrome-aws-lambda");

async function screenshot(url) {
    const browser = await chromium.puppeteer.launch({
        executablePath: await chromium.executablePath,
        args: chromium.args,
        defaultViewport: {
            width: '1024',
            height: '512',
            deviceScaleFactor: 1,
        },
        headless: chromium.headless,
    });
    const page = await browser.newPage();
    let response = await page.goto(url, {
        waitUntil: ["load", "networkidle0"],
        timeout: 8500
    });
    let options = {
        type: "jpeg",
        encoding: "base64",
        quality: 80
    };
    let output = await page.screenshot(options);
    await browser.close();
    return output;
}

exports.handler = async event => {
    const queryStringUrl = event.queryStringParameters.url
    if (!queryStringUrl) return {
        statusCode: 200,
        body: JSON.stringify({message: 'pas d\'url'})
    }
    const url = decodeURIComponent(event.queryStringParameters.url);
    try {
        let output = await screenshot(url);
        return {
            statusCode: 200,
            headers: {
                "content-type": `image/jpeg`
            },
            body: output,
            isBase64Encoded: true
        };
    } catch (error) {
        console.log("Error", error);
        return {
            statusCode: 200,
            headers: {
                "content-type": "text/html",
                "x-error-message": error.message
            },
            body: `erreur`,
            isBase64Encoded: false,
        };
    }
}
