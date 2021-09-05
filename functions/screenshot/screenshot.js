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

    await page.goto(pageToScreenshot, {
            waitUntil: ['load', 'networkidle0'],
            timeout: 8500
        }
    );

    const screenshot = await page.screenshot({
        type: "jpeg",
        encoding: "base64",
        quality: 80
    });

    await browser.close();

    return {
        statusCode: 200,
        headers: {
            'content-type': 'image/jpeg'
        },
        body: `<img src='data:image/jpeg;base64, ${screenshot}' width='1024' height='512' />`
    }

}
