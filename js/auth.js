/* PMME: simulação local de autenticação. NÃO usar como segurança de produção. */
window.PMME_AUTH = (() => {
 const U='pmme_contas_demo_v1', S='pmme_sessao_demo_v1', ADM='pmme_admin_v1';
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}};
 const users=()=>read(U,[]);
 const save=arr=>localStorage.setItem(U,JSON.stringify(arr));
 const session=()=>{try{return JSON.parse(sessionStorage.getItem(S)||'null')}catch{return null}};
 const current=()=>{const s=session();return s?users().find(u=>u.id===s.id)||null:null};
 const role=()=>current()?.papel||'visitante';
 const home=()=>role()==='administrador'?'administrador.html':role()==='criador'?'criador.html':'index.html';
 const clean=u=>u?{id:u.id,nome:u.nome,email:u.email,papel:u.papel,foto:u.foto||''}:null;
 function seed(){let all=users();if(!all.length){all=[{id:'demo-admin',nome:'Administração PMME',email:'admin@pmme.local',senha:'PMMEdemo2026!',papel:'administrador',foto:''},{id:'demo-criador',nome:'Criador PMME',email:'criador@pmme.local',senha:'PMMEdemo2026!',papel:'criador',foto:''}];save(all)}}
 function register(nome,email,senha){seed();nome=String(nome||'').trim();email=String(email||'').trim().toLowerCase();if(nome.length<2||!/^\S+@\S+\.\S+$/.test(email)||String(senha).length<8)throw Error('Preencha nome, e-mail válido e senha com pelo menos 8 caracteres.');let all=users();if(all.some(u=>u.email===email))throw Error('Este e-mail já está cadastrado.');const admin=read(ADM,{});const invite=(admin.usuarios||[]).find(x=>x.email?.toLowerCase()===email&&x.situacao==='ativo');const papel=invite?.papel==='administrador'?'administrador':invite?.papel==='criador'?'criador':'visitante';const u={id:'u-'+Date.now(),nome,email,senha,papel,foto:''};all.push(u);save(all);sessionStorage.setItem(S,JSON.stringify({id:u.id}));return clean(u)}
 function login(email,senha){seed();const u=users().find(u=>u.email===String(email).trim().toLowerCase()&&u.senha===senha);if(!u)throw Error('E-mail ou senha incorretos.');sessionStorage.setItem(S,JSON.stringify({id:u.id}));return clean(u)}
 function logout(){sessionStorage.removeItem(S);location.href='index.html'}
 function update(patch){const u=current();if(!u)throw Error('Entre na sua conta.');const all=users();const item=all.find(x=>x.id===u.id);if(typeof patch.nome==='string'&&patch.nome.trim().length>=2)item.nome=patch.nome.trim();if(typeof patch.foto==='string')item.foto=patch.foto;save(all);return clean(item)}
 function syncRoles(){const admin=read(ADM,{});const all=users();let changed=false;for(const u of all){if(u.id.startsWith('demo-'))continue;const entry=(admin.usuarios||[]).find(x=>x.email?.toLowerCase()===u.email);const next=entry?.situacao==='ativo'&&['criador','administrador'].includes(entry.papel)?entry.papel:'visitante';if(u.papel!==next){u.papel=next;changed=true}}if(changed)save(all)}
 function requireRole(allowed){seed();syncRoles();const u=current();if(!u){location.replace('login.html?retorno='+encodeURIComponent(location.pathname.split('/').pop()+location.search));return false}if(!allowed.includes(u.papel)){location.replace('index.html');return false}return true}
 seed();syncRoles();return {users,current,role,home,register,login,logout,update,requireRole,syncRoles};
})();
