import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1600,height:1100}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const credentials=await fs.readFile('.admin-access.txt','utf8');
try{
 await page.goto('http://localhost:3000');await page.getByLabel('Sou professor').check();await page.getByLabel('Usuário',{exact:true}).fill('professor');await page.getByLabel('Senha do professor').fill(credentials.match(/Senha: (.+)/)[1].trim());await page.getByRole('button',{name:'Entrar na minha trilha'}).click();
 await expect(page.getByRole('heading',{name:/Olá,/})).toBeVisible();
 const cases=[['Dados que têm nome',['Guardar Luna em nome','Guardar 3 em idade','Dizer nome e idade']],['Calcule com Python',['Guardar 25 em preco','Guardar 4 em quantidade','Calcular preço × quantidade','Dizer o total']],['Seu programa escuta',['Perguntar o nome','Perguntar a idade','Converter idade para inteiro','Dizer nome e idade + 1']],['Mensagens com dados',['Guardar Luna em nome','Juntar Olá, nome e !','Dizer a mensagem']]];
 for(const [title,blocks] of cases){
  const chapter=page.locator('article.chapter-card').filter({has:page.getByRole('heading',{name:'Variáveis e entradas',exact:true})});await chapter.locator('summary').click();await chapter.getByRole('button',{name:title,exact:true}).click();
  const studio=page.getByRole('region',{name:'Oficina de blocos'});
  await expect(studio.getByRole('button',{name:'Executar blocos',exact:true})).toBeDisabled();
  await studio.getByRole('button',{name:'Adicionar: '+blocks[0],exact:true}).dragTo(studio.locator('[data-drop-index="0"]'));
  await expect(studio.locator('.assembled')).toHaveCount(1);
  for(const label of blocks.slice(1)){const button=studio.getByRole('button',{name:'Adicionar: '+label,exact:true});await button.focus();await page.keyboard.press('Enter')}
  if(title==='Dados que têm nome'){
   await studio.getByRole('button',{name:'Subir bloco 3',exact:true}).click();await studio.getByRole('button',{name:'Subir bloco 2',exact:true}).click();
   await studio.getByRole('button',{name:'Executar blocos',exact:true}).click();await expect(studio.locator('.block-feedback')).toContainText('Ainda não encaixou',{timeout:110000});
   await studio.locator('.assembled').first().dragTo(studio.locator('[data-drop-index="3"]'));
  }
  await studio.getByRole('button',{name:'Executar blocos',exact:true}).click();await expect(studio.locator('.block-feedback')).toContainText('Você conseguiu!',{timeout:110000});
  if(title==='Seu programa escuta'){
   await expect(studio.locator('.block-output')).toContainText('Luna 4');
   await studio.screenshot({path:'.qa/modulo01-blocos-desktop.png',style:'.topbar{visibility:hidden}'});
   const oldCode=await page.getByLabel('Seu código Python').inputValue();
   await studio.getByRole('button',{name:'Levar código ao laboratório ↓'}).click();await studio.getByRole('button',{name:'Cancelar',exact:true}).click();await expect(page.getByLabel('Seu código Python')).toHaveValue(oldCode);
   await studio.getByRole('button',{name:'Levar código ao laboratório ↓'}).click();await studio.getByRole('button',{name:'Substituir código do laboratório'}).click();await expect(page.getByLabel('Seu código Python')).toHaveValue(/nome = input/);await expect(page.getByText('Salvo na conta',{exact:true})).toBeVisible();
   await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);await studio.screenshot({path:'.qa/modulo01-blocos-mobile.png',style:'.topbar{visibility:hidden}'});await page.setViewportSize({width:1600,height:1100});
  }
  await studio.getByRole('button',{name:'Remover bloco 1',exact:true}).click();await expect(studio.getByRole('button',{name:'Executar blocos',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Voltar à trilha',exact:true}).click();
 }
 expect(errors).toEqual([]);console.log('PASS: 4 oficinas; drag-and-drop, reordenação, teclado, erro e recuperação, execução Python real, transferência confirmada, salvamento, remoção e tela móvel.');
}finally{await browser.close()}


