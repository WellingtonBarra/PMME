/* Renderização da área pública. Somente registros publicados são exibidos. */
(() => {
    const modoDemo = new URLSearchParams(location.search).has("demonstracao");
    const base = modoDemo ? window.PMME_EXEMPLO : (window.PMME_DADOS || {});
    // Prévia local para a futura área do criador. Não é sincronizada entre visitantes.
    let local = {};
    try { local = JSON.parse(localStorage.getItem('pmme_previa') || '{}') || {}; } catch (_) {}
    const dados = { ...base, ...local, configuracoes: { ...(base.configuracoes || {}), ...(local.configuracoes || {}) } };
    const registros = (tipo) => Array.isArray(dados[tipo]) ? dados[tipo].filter(x => x && x.publicado !== false && x.status !== 'rascunho') : [];
    const $ = (s, el = document) => el.querySelector(s);
    const criar = (tag, classe, texto) => { const e = document.createElement(tag); if (classe) e.className = classe; if (texto !== undefined && texto !== null) e.textContent = String(texto); return e; };
    const vazio = (texto) => { const e = criar('p', 'estado-vazio', texto); e.setAttribute('role', 'status'); return e; };
    const foto = (classe, url, simbolo = 'image') => {
        const e = criar('div', classe);
        if (typeof url === 'string' && url.trim() && !/^javascript:/i.test(url.trim())) {
            const img = criar('img', 'midia-publica'); img.src = url; img.alt = ''; img.loading = 'lazy';
            img.onerror = () => { img.remove(); e.append(criar('span', 'material-symbols-rounded', simbolo)); };
            e.append(img);
        } else e.append(criar('span', 'material-symbols-rounded', simbolo));
        return e;
    };
    const data = (valor) => {
        if (!valor) return 'Data não informada';
        const d = /^\d{4}-\d{2}-\d{2}$/.test(valor) ? new Date(valor + 'T12:00:00') : new Date(valor);
        return isNaN(d.getTime()) ? String(valor) : new Intl.DateTimeFormat('pt-BR', {day:'2-digit',month:'long',year:'numeric'}).format(d);
    };
    const textoLinha = (icone, texto) => { const p = criar('p'); p.append(criar('span','material-symbols-rounded',icone),document.createTextNode(' ' + texto)); return p; };
    const linkProjeto = p => 'detalhes-projeto.html?id=' + encodeURIComponent(p.id) + (modoDemo ? '&demonstracao=1' : '');
    const ids = (tipo) => registros(tipo).map((x,i) => ({ ...x, id: x.id || `${tipo}-${i+1}` }));
    function renderLista(selector, items, render, mensagem) {
        const el = $(selector); if (!el) return;
        el.replaceChildren(...(items.length ? items.map(render) : [vazio(mensagem)]));
    }
    if (modoDemo) document.querySelectorAll('a[href$=".html"]').forEach(a => { a.href += '?demonstracao=1'; });
    const projetos = ids('projetos'), acoes = ids('acoes'), eventos = ids('eventos'), membros = ids('membros'), parceiros = ids('parceiros');
    renderLista('[data-lista="projetos"]', projetos, p => {
        const a = criar('a','projeto-card'); a.href = linkProjeto(p);
        a.append(foto('projeto-capa',p.capa),criar('h2','',p.nome || 'Projeto sem título')); return a;
    },'Ainda não há projetos cadastrados.');
    renderLista('[data-lista="acoes"]', acoes, a => {
        const card = criar('article','acao-card'); card.append(foto('acao-capa',a.capa));
        const info = criar('div','acao-informacoes'); info.append(criar('h2','',a.nome || 'Ação sem título'),textoLinha('calendar_today',data(a.data)),textoLinha('location_on',a.local || 'Local não informado')); card.append(info); return card;
    },'Ainda não há ações cadastradas.');
    renderLista('.membros-grade[data-lista="membros"]', membros, m => {
        const card = criar('article','membro-card'); card.append(foto('membro-foto',m.foto,'person'),criar('h2','',m.nome || 'Membro'),criar('p','',m.funcao || ''));return card;
    },'Ainda não há membros cadastrados.');
    renderLista('[data-lista="parceiros"]', parceiros, p => {
        const el = criar('div','parceiro');el.append(foto('parceiro-imagem',p.logo),criar('span','',p.nome || 'Parceiro'));return el;
    },'Ainda não há parceiros cadastrados.');
    renderLista('[data-lista="historia"]',ids('historia').sort((a,b)=>String(a.data||'').localeCompare(String(b.data||''))), (h,i) => {
        const item = criar('article','historia-item '+(i%2?'historia-esquerda':'historia-direita'));
        item.append(criar('div','historia-marcador'));
        const content = criar('div','historia-conteudo'); content.append(criar('h3','',h.titulo || 'Registro histórico'));
        if(h.descricao)content.append(criar('p','',h.descricao));if(h.imagem)content.append(foto('historia-imagem',h.imagem));item.append(content);return item;
    },'Ainda não há registros na linha do tempo.');
    renderLista('.sobre-membros-grade[data-lista="membros"]',membros,m => {
        const card=criar('article','sobre-membro-card');card.append(foto('sobre-membro-foto',m.foto,'person'),criar('h3','',m.nome || 'Membro'),criar('p','',m.funcao || ''));return card;
    },'Ainda não há membros cadastrados.');
    const depoimentos = ids('depoimentos'); const depo = $('[data-lista="depoimentos"]');
    if(depo){depo.replaceChildren();if(!depoimentos.length)depo.append(vazio('Ainda não há depoimentos cadastrados.'));else{
        const d=depoimentos[0];depo.append(criar('span','material-symbols-rounded depoimento-aspas','format_quote'),criar('blockquote','',d.texto || ''));
        const autor=criar('div','depoimento-autor');autor.append(criar('strong','',d.autor || 'Participante'),criar('span','',d.vinculo || ''));depo.append(autor);
    }}
    // Carrossel: zero registros = mensagem; um = cartaz estático; dois ou mais = carrossel.
    const trilho=$('[data-lista="destaques"]');
    if(trilho){
        const destaques=projetos.filter(p=>p.destaque);
        const lista=destaques.length?destaques:projetos;
        trilho.replaceChildren(...(lista.length?lista.map(p=>{const a=criar('a','cartaz');a.href=linkProjeto(p);a.setAttribute('aria-label',p.nome||'Ver projeto');const im=foto('cartaz-conteudo',p.capa);a.append(...im.childNodes);return a;}):[vazio('Ainda não há projetos cadastrados.')]));
        const moldura=$('.carrossel-moldura');
        if(moldura){moldura.querySelectorAll('.seta').forEach(b=>b.hidden=lista.length<2);}
        const pontos=$('.pontos');if(pontos){pontos.hidden=lista.length<2;pontos.replaceChildren(...lista.map((_,i)=>criar('i',i===0?'selecionado':'')));}
        if(lista.length<2){trilho.style.width='100%';trilho.style.left='0';trilho.style.justifyContent='center';}
    }
    // Eventos: pesquisa, filtros e ordenação funcionam mesmo com zero registros.
    function renderEventos(){
        const termo=($('#pesquisa-eventos')?.value||'').toLocaleLowerCase('pt-BR').trim();
        const categoria=$('#filtro-categoria')?.value||'', periodo=$('#filtro-data')?.value||'',tipo=$('#filtro-tipo')?.value||'',status=$('#filtro-status')?.value||'',ordem=$('#filtro-ordem')?.value||'recentes';
        const hoje=new Date();hoje.setHours(0,0,0,0);
        let filtrados=eventos.filter(e=>{
            const dia=e.data?new Date(e.data+'T12:00:00'):null;
            return (!termo||[e.nome,e.local,e.descricao].join(' ').toLocaleLowerCase('pt-BR').includes(termo))&&(!categoria||e.categoria===categoria)&&(!tipo||e.tipo===tipo)&&(!status||e.status===status)&&(!periodo||(dia&&((periodo==='proximos'&&dia>=hoje)||(periodo==='passados'&&dia<hoje))));
        });
        filtrados.sort((a,b)=>ordem==='nome'?String(a.nome).localeCompare(String(b.nome),'pt-BR'):ordem==='antigos'?String(a.data||'').localeCompare(String(b.data||'')):String(b.data||'').localeCompare(String(a.data||'')));
        renderLista('[data-lista="eventos"]',filtrados,e=>{
            const card=criar('article','evento-card');card.append(foto('evento-cartaz',e.capa));const info=criar('div','evento-informacoes');info.append(criar('h3','',e.nome||'Evento'),textoLinha('calendar_today',data(e.data)),textoLinha('location_on',e.local||'Local não informado'));card.append(info);return card;
        },eventos.length?'Nenhum evento corresponde aos filtros.':'Ainda não há eventos cadastrados.');
    }
    renderEventos();
    ['pesquisa-eventos','filtro-categoria','filtro-data','filtro-tipo','filtro-status','filtro-ordem'].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener(id==='pesquisa-eventos'?'input':'change',renderEventos);});
    // Contadores: coleções existentes são contadas; alcance depende de valor oficial.
    const contagens=[membros.length,projetos.length,acoes.length,eventos.length,dados.configuracoes.pessoasAlcancadas];
    const numeros=$$('.indicador-card strong');
    numeros.forEach((el,i)=>{el.textContent=contagens[i]===null||contagens[i]===undefined?'—':new Intl.NumberFormat('pt-BR').format(contagens[i]);});
    const resumo=$$('.indicadores-inner strong');[membros.length,projetos.length,eventos.length,dados.configuracoes.pessoasAlcancadas].forEach((v,i)=>{if(resumo[i])resumo[i].textContent=v==null?'—':new Intl.NumberFormat('pt-BR').format(v);});
    const outros=$$('.participacao-card > strong');['instituicoesParticipantes','locaisAtendidos'].forEach((k,i)=>{if(outros[i])outros[i].textContent=dados.configuracoes[k]??'—';});if(outros[2])outros[2].textContent=parceiros.length;
    // Evolução anual, derivada de datas dos registros (sem dados simulados).
    const grafico=$('.grafico-vazio');
    if(grafico){const grupos={};[['projetos',projetos],['acoes',acoes],['eventos',eventos]].forEach(([tipo,lista])=>lista.forEach(x=>{const ano=String(x.data||'').match(/^\d{4}/)?.[0];if(!ano)return;grupos[ano]??={projetos:0,acoes:0,eventos:0};grupos[ano][tipo]++;}));
        const anos=Object.keys(grupos).sort();if(anos.length){grafico.replaceChildren();grafico.classList.add('grafico-dados');const max=Math.max(1,...anos.flatMap(a=>Object.values(grupos[a])));anos.forEach(ano=>{const grupo=criar('div','grafico-ano');const barras=criar('div','grafico-barras');['projetos','acoes','eventos'].forEach(tipo=>{const n=grupos[ano][tipo];const barra=criar('div','grafico-barra barra-'+tipo);barra.style.height=(n?Math.max(8,n/max*160):2)+'px';barra.title=tipo+': '+n;barras.append(barra);});grupo.append(barras,criar('span','',ano));grafico.append(grupo);});}}
    // Página de detalhes: mostra apenas o projeto selecionado.
    const detalhe=$('[data-detalhe="projeto"]');
    if(detalhe){const id=new URLSearchParams(location.search).get('id');const projeto=projetos.find(p=>String(p.id)===id);if(projeto){
        detalhe.replaceChildren();const banner=criar('section','projeto-banner');banner.append(foto('projeto-banner-imagem',projeto.banner||projeto.capa),criar('div','projeto-banner-sombra'));const bc=criar('div','container projeto-banner-conteudo');bc.append(criar('h1','',projeto.nome));banner.append(bc);detalhe.append(banner);
        const corpo=criar('div','container projeto-detalhes');
        const secao=(titulo)=>{const sec=criar('section','projeto-secao');const faixa=criar('div','projeto-titulo-faixa');faixa.append(criar('h2','',titulo));sec.append(faixa);corpo.append(sec);return sec;};
        if(projeto.descricao){const sec=secao('Sobre o Projeto');const duplo=criar('div','projeto-conteudo-duplo');const t=criar('div','projeto-texto');projeto.descricao.split(/\n\s*\n/).filter(Boolean).forEach(p=>t.append(criar('p','',p)));duplo.append(t);if(projeto.foto)duplo.append(foto('projeto-foto',projeto.foto));sec.append(duplo);}
        if(projeto.objetivos?.length){const sec=secao('Objetivos'),ul=criar('ul','projeto-objetivos');projeto.objetivos.forEach(x=>ul.append(criar('li','',x)));sec.append(ul);}
        const relacionadas=acoes.filter(a=>String(a.projetoId||'')===String(projeto.id));if(relacionadas.length){const sec=secao('Ações Realizadas'),lista=criar('div','projeto-acoes');relacionadas.forEach(a=>{const card=criar('article','projeto-acao');card.append(foto('projeto-acao-imagem',a.capa));const content=criar('div','projeto-acao-conteudo');content.append(criar('h3','',a.nome));if(a.descricao)content.append(criar('p','',a.descricao));card.append(content);lista.append(card);});sec.append(lista);}
        if(projeto.resultados?.length){const sec=secao('Resultados'),ul=criar('ul','projeto-resultados-lista');projeto.resultados.forEach(x=>ul.append(criar('li','',x)));sec.append(ul);}
        detalhe.append(corpo);
    }}
    // Imagens institucionais só são substituídas quando publicadas.
    const config=dados.configuracoes||{};
    function inserirFoto(selector,url){const el=$(selector);if(!el||!url)return;el.replaceChildren(...foto('',url).childNodes);}
    (config.fotosInicio||[]).slice(0,2).forEach((url,i)=>inserirFoto('.sobre-fotos .foto-'+['um','dois'][i],url));
    (config.fotosSobre||[]).slice(0,3).forEach((url,i)=>inserirFoto('.apresentacao-galeria .galeria-foto-'+['um','dois','tres'][i],url));
    inserirFoto('.proposito-imagem',config.fotoProposito);inserirFoto('.banner-imagem',config.fotoBannerSobre);
    function $$(s){return Array.from(document.querySelectorAll(s));}
})();
