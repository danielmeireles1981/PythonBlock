import { defineConfig } from '@playwright/test';
process.loadEnvFile('.env.local');
if(process.env.APP_ORIGIN!=='http://localhost:3000')throw new Error('Os testes completos só podem usar o banco local de testes.');
export default defineConfig({testDir:'./tests',testMatch:'**/*.spec.ts',workers:1,timeout:120000,reporter:'list',outputDir:'.qa/test-results',use:{baseURL:'http://localhost:3000',headless:true,viewport:{width:1440,height:1050},launchOptions:{executablePath:process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined},screenshot:'only-on-failure'}});
