import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Go straight to a known job URL
  await page.goto('https://www.linkedin.com/jobs/view/4165565192/?alternateChannel=search&refId=k%2B2bFwO6yI1cEvuHwBOKbA%3D%3D&trackingId=9T2R1oY5Q8QdZ9LhG1Lrzg%3D%3D', { waitUntil: 'networkidle2' });
  
  const fs = await import('fs');
  fs.writeFileSync('job-dump.html', await page.content());
  console.log('Saved job-dump.html - search for apply button manually');
  
  await browser.close();
}
run();
