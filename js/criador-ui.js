
(() => {
 if(!window.PMME_AUTH || !['criador','administrador'].includes(PMME_AUTH.role()))return;
 const pagina=document.body.dataset.pagina;
 const links={projetos:['Novo projeto','projetos'],acoes:['Cadastrar ação','acoes'],eventos:['Cadastrar evento','eventos']};
 function botao(texto,tipo,classe=''){const a=document.createElement('a');a.className='acao-criador '+classe;a.href=tipo?'editar.html?tipo='+tipo:'criador.html';const ic=document.createElement('span');ic.className='material-symbols-rounded';ic.textContent=tipo?'add_circle':'dashboard_customize';a.append(ic,document.createTextNode(texto));return a;}
 const faixa=document.createElement('section');faixa.className='faixa-criador';faixa.setAttribute('aria-label','Ferramentas do criador');const c=document.createElement('div');c.className='container';const info=document.createElement('div');const titulo=document.createElement('strong');titulo.textContent='Modo criador';const desc=document.createElement('p');desc.textContent='Gerencie o conteúdo do PMME';info.append(titulo,desc);const acoes=document.createElement('div');acoes.className='acoes-criador';acoes.append(botao('Painel do criador',null,'secundario'));if(links[pagina])acoes.append(botao(...links[pagina]));c.append(info,acoes);faixa.append(c);const header=document.getElementById('header-container');header.insertAdjacentElement('afterend',faixa);
 if(pagina==='inicio'){const home=document.querySelector('main .container');if(home){const barra=document.createElement('div');barra.className='acoes-criador';barra.style.margin='15px 0 18px';[['Novo projeto','projetos'],['Cadastrar ação','acoes'],['Cadastrar evento','eventos']].forEach(x=>barra.append(botao(...x)));home.prepend(barra);}}
})();
