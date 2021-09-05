const chromium = require('chrome-aws-lambda');

exports.handler = async (event, context) => {

    const pageToScreenshot = decodeURIComponent(event.queryStringParameters.url);

    if (!pageToScreenshot) return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Page URL not defined' })
    }

    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: {
            width: 1024,
            height: 512,
            deviceScaleFactor: 1,
        },
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
    });

    const page = await browser.newPage();

    await page.goto(pageToScreenshot, { waitUntil: 'networkidle2' });

    const screenshot = await page.screenshot({
        type: "jpeg",
        encoding: "base64",
        quality: 80
    });

    await browser.close();

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Complete screenshot of ${pageToScreenshot}`,
            headers: {
                "content-type": `image/jpeg`
            },
            body: screenshot,
            isBase64Encoded: true
        })
    }

}

/*
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
        return {
            statusCode: 200,
            headers: {
                "content-type": "text/html",
                "x-error-message": error.message
            },
            body: JSON.stringify(error),
            isBase64Encoded: false,
        };
    }
}
*/
