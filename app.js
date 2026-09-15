const titles={dashboard:'Dashboard',master:'Menu Master',add:'Add New Dish',carousel:'Carousel Manager',screens:'Screen Manager',features:'Features & Rules'};
function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.page===id));document.getElementById('pageTitle').textContent=titles[id]||'Menu CMS';window.scrollTo({top:0,behavior:'smooth'});}
document.querySelectorAll('.nav').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
document.querySelectorAll('.go-add').forEach(b=>b.addEventListener('click',()=>showPage('add')));
document.querySelectorAll('[data-target]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.target)));
document.querySelectorAll('.toggle').forEach(t=>t.addEventListener('click',()=>t.classList.toggle('on')));
document.getElementById('analyze')?.addEventListener('click',()=>{const n=document.getElementById('notice');n.textContent='Prototype validation complete: the UI is working. Spreadsheet writes are intentionally locked until the TEST read adapter is connected and verified.';n.style.borderColor='#b9cdbd';n.style.background='#eef5ef';n.style.color='#496b55';});
