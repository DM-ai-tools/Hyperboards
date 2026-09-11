/* Stewardship: native content and disclosures remain available without JS. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const menu=document.querySelector('[data-menu]'), nav=document.querySelector('[data-navigation]');
  const closeMenu=(focus=false)=>{menu?.setAttribute('aria-expanded','false');nav?.classList.remove('is-open');if(focus)menu?.focus();};
  menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav?.classList.toggle('is-open',open);});
  nav?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true')closeMenu(true);});
  document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();});
  matchMedia('(min-width:901px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
  document.querySelectorAll('[data-year]').forEach(el=>{el.textContent=String(new Date().getFullYear());});
  if(!matchMedia('(prefers-reduced-motion:reduce)').matches&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target);}}),{threshold:.12});document.querySelectorAll('[data-reveal]').forEach(el=>observer.observe(el));}
  const form=document.querySelector('[data-owner-form]');if(!form)return;
  const status=document.querySelector('[data-form-status]'), note=document.querySelector('[data-delivery-note]');
  if(location.protocol==='file:'&&note)note.textContent='You are viewing a local copy. Online delivery needs the website server. Please email hello@hyperboards.com to introduce your business.';
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!form.reportValidity()||form.dataset.sending==='true')return;
    if(location.protocol==='file:'){status.dataset.state='error';status.textContent='This local copy cannot send your introduction. Online delivery needs the website server. Please email hello@hyperboards.com. Your entries have been kept.';return;}
    const button=form.querySelector('button[type="submit"]'),label=button.textContent,controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
    form.dataset.sending='true';button.disabled=true;button.textContent='Sending introduction…';status.dataset.state='loading';status.textContent='Sending your introduction. Please keep this page open.';
    try{const response=await fetch(form.action,{method:'POST',headers:{Accept:'application/json'},body:new URLSearchParams(new FormData(form)),signal:controller.signal});const result=await response.json();
      if(response.ok&&result.ok===true){status.dataset.state='success';status.textContent=result.message||'Your introduction has been received. Thank you for sharing the broad outline of your business.';form.reset();}
      else{status.dataset.state='error';status.textContent=`${result.message||'Your introduction could not be accepted. Please email hello@hyperboards.com.'} Your entries have been kept.`;}
    }catch(error){status.dataset.state='error';status.textContent=error.name==='AbortError'?'We could not confirm delivery before the connection timed out. Please contact hello@hyperboards.com before resending. Your entries have been kept.':'We could not confirm delivery. Please email hello@hyperboards.com. Your entries have been kept.';}
    finally{clearTimeout(timeout);button.disabled=false;button.textContent=label;delete form.dataset.sending;}
  });
})();
