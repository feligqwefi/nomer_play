(()=> {
    'use strict';setTimeout(()=>document.getElementById('loadingScreen')?.classList.add('is-hidden'),100);const REGION='75',START=150000,letters=['А','В','Е','К','М','Н','О','Р','С','Т','У','Х'];const cases=[ {
        id:'1',name:'Стартовый',price:15000,weights:[82,14,3.5,0.5,0],icon:'📦',level:1
    }
    , {
        id:'2',name:'Уверенный',price:40000,weights:[70, 22, 6.5, 1.4, 0.1],icon:'🧰',level:3
    }
    , {
        id:'3',name:'Редкий',price:100000,weights:[55, 30, 11, 3.5, 0.5],icon:'🗃️',level:6
    }
    , {
        id:'4',name:'Эпический',price:250000,weights:[40, 35, 17, 6, 2],icon:'⚡',level:10
    }
    , {
        id:'5',name:'Мифический',price:600000,weights:[25, 35, 22, 13, 5],icon:'💎',level:15
    }
    , {
        id:'6',name:'Легендарный',price:1500000,weights:[10, 25, 30, 22, 13],icon:'👑',level:20
    }
    , {
        id:'7',name:'VOID · Конструктор',price:5000000,weights:[100],icon:'⬛',level:25
    }
    ];const rarityColors= {
        'Обычный':'#9ca3af','Хороший':'#35c978','Элитный':'#438cff','Мифический':'#ff4058','Королевский':'#ffd34d','VOID':'#b36cff'
    }
    ;const incomeBy= {
        'Обычный':500,'Хороший':2500,'Элитный':7500,'Мифический':25000,'Королевский':75000,'VOID':350000
    }
    ;const $=id=>document.getElementById(id),money=n=>Math.round(n).toLocaleString('ru-RU')+' ₽',safeLoad=()=> {
        try {
            return JSON.parse(localStorage.getItem('numberClubSave'))|| {
            }
        }
        catch {
            return {
            }
        }
    }
    ;let saved=safeLoad(),balance=Number.isFinite(saved.balance)?saved.balance:START,inventory=Array.isArray(saved.inventory)?saved.inventory:[],lastBonusTime=saved.lastBonusTime||0,selectedCase='1',busy=false,level=saved.level||1,xp=saved.xp||0,totalOpened=saved.totalOpened||inventory.length,totalSold=saved.totalSold||0,totalEarned=saved.totalEarned||0,lastIncomeAt=saved.lastIncomeAt||Date.now(),achievements=saved.achievements||[],lastWonItem=null;inventory=inventory.map(i=> {
        let key=i.key||(['Королевский','Мифический','Элитный','Хороший'].find(k=>(i.status||'').includes(k))||'Обычный');return {
            ...i,key,income:i.income||incomeBy[key]||incomeBy['Обычный'],digits:i.digits||((i.number||'').match(/\d{3}/)||['000'])[0],letters:i.letters||((i.number||'').match(/[А-Я]{3}/)||[''])[0]
        }
    }
    );const save=()=>localStorage.setItem('numberClubSave',JSON.stringify( {
        balance,inventory,lastBonusTime,level,xp,totalOpened,totalSold,totalEarned,lastIncomeAt,achievements
    }
    ));function toast(m) {
        let t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),3000)
    }
    function pick(a) {
        return a[Math.floor(Math.random()*a.length)]
    }
    function weightedPick(w) {
        let r=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<w.length;i++) {
            r-=w[i];if(r<0)return i+1
        }
        return w.length
    }
    function numberStr(n) {
        return `${n.l1}${n.digits}${n.l2}${n.l3} ${n.region||REGION}`
    }
    function gen(caseId) {
        let a,b,c;if(caseId==='6') {
            a=c=pick([0,1,2,3,4,5,6,7,8,9]);b=Math.random()<.5?a:pick([0,1,2,3,4,5,6,7,8,9].filter(x=>x!==a))
        }
        else if(caseId==='5') {
            a=pick([0,1,2,3,4,5,6,7,8,9]);b=a;c=pick([0,1,2,3,4,5,6,7,8,9])
        }
        else a=pick([0,1,2,3,4,5,6,7,8,9]),b=pick([0,1,2,3,4,5,6,7,8,9]),c=pick([0,1,2,3,4,5,6,7,8,9]);let w=weightedPick(cases.find(x=>x.id===caseId).weights),l1,l2,l3;if(w===5)l1=pick(['А','В','М','Ф','К']),l2=pick(['У','О','В','С','Г']),l3=pick(['Е','Р','Б','Д']);else if(w===4)l1=pick(['Х','Ч','Б','М','С']),l2=pick(['О','Е','А','Х','Т']),l3=pick(['Д','С','М','Х','Р']);else if(w===3)l1=l2=pick(letters),l3=pick(letters);else if(w===2)l1=l2=l3=pick(['А','В','Е','К','М','Н']);else l1=pick(letters),l2=pick(letters),l3=pick(letters);return {
            l1,l2,l3,digits:`${a}${b}${c}`,region:REGION
        }
    }
    function rarity(n) {
        let d=n.digits,ls=n.l1+n.l2+n.l3,status,key,price;if(['АУЕ','ВОР','БЕС','МВД','ФСБ'].includes(ls)&&new Set(d).size===1)status='👑 Королевский · Блат + трио',key='Королевский',price=3000000;else if(['777','000','001'].includes(d))status='👑 Королевский · Золотое трио',key='Королевский',price=450000;else if(new Set(ls).size===1)status='💎 Мифический · Три буквы',key='Мифический',price=200000;else if(new Set(d).size===1)status='⭐ Элитный · Трио цифр',key='Элитный',price=150000;else if(['002','004','005','007','009','100','200','500','700'].includes(d))status='⭐ Элитный · Красивые цифры',key='Элитный',price=100000;else if(d[0]===d[2]&&d[0]!==d[1])status='✨ Хороший · Зеркальный',key='Хороший',price=70000;else if(new Set(d).size===2)status='✨ Хороший · Две одинаковые',key='Хороший',price=40000;else status='🚗 Обычный',key='Обычный',price=10000;return {
            status,key,price,color:rarityColors[key],income:incomeBy[key]
        }
    }
    function plateText(n) {
        $('l1').textContent=n.l1;$('digits').textContent=n.digits;$('l2').textContent=n.l2;$('l3').textContent=n.l3;$('region').textContent=n.region||REGION
    }
    function unlocked(c) {
        return true
    }
    function renderCases() {
        $('caseGrid').innerHTML=cases.map(c=>`<button class="case-card ${c.id===selectedCase?'selected':''} ${!unlocked(c)?'locked':''}" data-case="${c.id}" ${!unlocked(c)?'disabled':''}><div class="case-art" data-case-art="${c.id}"><span>${c.icon}</span><small>ЗАГЛУШКА · ${c.id}</small></div><span class="case-name">${c.name}</span><span class="case-price">${money(c.price)}</span><span class="case-chance">${unlocked(c)?'Шансы: '+c.weights.join(' / ')+'%':'Открывается на '+c.level+' уровне'}</span></button>`).join('');document.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=> {
            if(busy)return;selectedCase=b.dataset.case;renderCases();renderSelected();updateOpen();closeModal()
        }
        ));renderSelected()
    }
    function renderSelected() {
        let c=cases.find(x=>x.id===selectedCase);$('selectedCasePreview').innerHTML=`<div class="selected-case-art" data-case-art="${c.id}"><span>${c.icon}</span><small>ЗАГЛУШКА</small></div><div><div class="selected-case-name">${c.name}</div><div class="selected-case-price">${money(c.price)}</div><div class="selected-case-chance">${unlocked(c)?'Шансы: '+c.weights.join(' / ')+'%':'Требуется уровень '+c.level}</div></div>`
    }
    function openModal() {
        $('caseModal').classList.add('open');$('caseModal').setAttribute('aria-hidden','false')
    }
    function closeModal() {
        $('caseModal').classList.remove('open');$('caseModal').setAttribute('aria-hidden','true')
    }
    function updateOpen() {
        $('openBtn').textContent=`Открыть кейс · ${money(cases.find(c=>c.id===selectedCase).price)}`;$('openBtn').disabled=busy||balance<cases.find(c=>c.id===selectedCase).price||!unlocked(cases.find(c=>c.id===selectedCase))
    }
    function updateBalance() {
        $('balance').textContent=balance.toLocaleString('ru-RU');updateOpen()
    }
    function incomeRate() {
        return inventory.reduce((s,i)=>s+(i.income||incomeBy[i.key]||0),0)
    }
    function claimIncome() {
        let elapsed=Math.max(0,Date.now()-lastIncomeAt),hours=elapsed/3600000,earned=Math.floor(incomeRate()*hours);if(earned>0) {
            balance+=earned;totalEarned+=earned
        }
        lastIncomeAt=Date.now();return earned
    }
    function sell(i) {
        claimIncome();let item=inventory[i];if(!item)return;inventory.splice(i,1);balance+=item.price;totalSold++;save();updateBalance();renderInventory();toast(`Продано: ${money(item.price)}`)
    }
    function renderInventory() {
        let sort=$('inventorySort')?.value||'new',filter=$('inventoryFilter')?.value||'all',list=inventory.map((x,i)=>( {
            ...x,index:i
        }
        )).filter(x=>filter==='all'||x.key===filter);if(sort==='price')list.sort((a,b)=>b.price-a.price);if(sort==='income')list.sort((a,b)=>(b.income||0)-(a.income||0));if(sort==='rarity')list.sort((a,b)=>(['Обычный','Хороший','Элитный','Мифический','Королевский','VOID'].indexOf(b.key))-(['Обычный','Хороший','Элитный','Мифический','Королевский','VOID'].indexOf(a.key)));$('itemCount').textContent=inventory.length+' шт.';$('inventoryList').innerHTML=list.length?list.map(x=>`<article class="inventory-item" style="--item-rarity:${x.color||'#fff'}"><div class="item-info"><div class="item-number">${x.number}</div><div class="item-meta">${x.status} · ${money(x.price)}</div><div class="item-income">+${money(x.income||0)} / час</div></div><button class="sell" data-sell="${x.index}">Продать</button></article>`).join(''):'<div class="empty">Здесь пока пусто. Коллекция сама себя не соберёт.</div>';document.querySelectorAll('[data-sell]').forEach(b=>b.addEventListener('click',()=>sell(+b.dataset.sell)))
    }
    function renderAchievements() {
        let defs=[['Первая покупка','Открой первый кейс',totalOpened>=1],['Коллекционер','Собери 10 номеров',inventory.length>=10],['Сотня','Открой 100 кейсов',totalOpened>=100],['Продажа','Продай первый номер',totalSold>=1],['Богатство','Баланс 1 000 000 ₽',balance>=1000000],['Активный игрок','Открой 25 кейсов',totalOpened>=25],['VOID','Открой VOID-кейс',inventory.some(i=>i.key==='VOID')],['Пассивный доход','Доход 100 000 ₽ в час',incomeRate()>=100000]];$('achievementList').innerHTML=defs.map((a,i)=> {
            let done=a[2];if(done&&!achievements.includes(i)) {
                achievements.push(i);balance+=5000;toast('Достижение: '+a[0]+' · +5 000 ₽')
            }
            return`<div class="achievement ${done?'complete':''}"><b>${done?'✓':'◇'} ${a[0]}</b><small>${a[1]}</small><span>${done?'Выполнено · награда 5 000 ₽':'Награда: 5 000 ₽'}</span></div>`
        }
        ).join('')
    }
    function renderStats() {
        let rows=[['Кейсов открыто',totalOpened],['Номеров в коллекции',inventory.length],['Продано номеров',totalSold],['Общий доход от продаж',money(totalEarned)],['Самый дорогой номер',money(Math.max(0,...inventory.map(i=>i.price)))],['Доход коллекции / час',money(incomeRate())],['Баланс',money(balance)]];$('statsGrid').innerHTML=rows.map(x=>`<div class="stat-card"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('')
    }
    function renderAll() {
        renderInventory();renderAchievements();renderStats();updateBalance()
    }
    function trigger(r) {
        let b=document.body;b.classList.remove('rarity-flash','rarity-flash-elite','rarity-flash-mythic','rarity-flash-royal','rarity-flash-void');void b.offsetWidth;b.classList.add('rarity-flash');if(['Элитный','Мифический','Королевский','VOID'].includes(r.key))b.classList.add('rarity-flash-'+r.key.toLowerCase());setTimeout(()=>b.classList.remove('rarity-flash','rarity-flash-elite','rarity-flash-mythic','rarity-flash-royal','rarity-flash-void'),r.key==='VOID'?6500:5000)
    }
    function showResult(n,r) {
        plateText(n);$('plate').style.setProperty('--glow',r.color);$('plate').style.setProperty('--rarity-color',r.color);$('plate').classList.remove('plate-reveal');void $('plate').offsetWidth;$('plate').classList.add('plate-reveal');trigger(r);$('rarityLabel').textContent=r.status;$('rarityLabel').style.color=r.color;$('rarityDesc').textContent='Выбери: продать номер или забрать его в гараж';$('value').textContent=money(r.price);$('resultIncome').textContent=money(r.income)+' / час';$('resultHint').textContent='Выпало!';$('resultActions').hidden=false;$('resultSellBtn').textContent='Продать · '+money(r.key==='VOID'?3000000:r.price)
    }
    function openCase() {
        if(busy)return;let c=cases.find(x=>x.id===selectedCase);if(balance<c.price) {
            toast('Не хватает средств');return
        }
        claimIncome();balance-=c.price;busy=true;updateBalance();$('plateStage').classList.add('rolling');$('resultHint').textContent='Крутим…';$('rarityLabel').textContent='Номер генерируется';$('rarityDesc').textContent='Удача уже рядом';$('value').textContent='…';$('resultIncome').textContent='…';updateOpen();let final,r;if(c.id==='7') {
            let combo=prompt('Введите комбинацию цифр (000–999):','777');if(combo===null||!/^[0-9]{3}$/.test(combo)) {
                busy=false;balance+=c.price;updateBalance();$('plateStage').classList.remove('rolling');toast('VOID-открытие отменено');save();return
            }
            let letterCombo=prompt('Введите 3 буквы из списка: А В Е К М Н О Р С Т У Х','АВЕ');letterCombo=(letterCombo||'').toUpperCase().replace(/\s/g,'');if(letterCombo.length!==3||![...letterCombo].every(ch=>letters.includes(ch))) {
                busy=false;balance+=c.price;updateBalance();$('plateStage').classList.remove('rolling');toast('Некорректные буквы. VOID отменён');save();return
            }
            final= {
                l1:letterCombo[0],l2:letterCombo[1],l3:letterCombo[2],digits:combo,region:REGION
            };r= {
                key:'VOID',status:'⬛ VOID · Выбранная комбинация',price:3000000,color:rarityColors.VOID,income:incomeBy.VOID
            }
        }
        else {
            final=gen(c.id);r=rarity(final)
        }
        let dur=c.id==='7'?1900:3200,start=Date.now(),timer=setInterval(()=> {
            let fake= {
                l1:pick(letters),l2:pick(letters),l3:pick(letters),digits:String(Math.floor(Math.random()*1000)).padStart(3,'0'),region:REGION
            }
            ;plateText(fake);let p=Math.min(1,(Date.now()-start)/dur);$('plate').style.transform=`scale(${1+Math.sin(p*Math.PI)*.035})`;if(p>=1) {
                clearInterval(timer);plateText(final);setTimeout(()=> {
                    let item= {
                        number:numberStr(final),digits:final.digits,letters:final.l1+final.l2+final.l3,status:r.status,key:r.key,price:r.price,color:r.color,income:r.income,l1:final.l1,l2:final.l2,l3:final.l3
                    }
                    ;lastWonItem=item;totalOpened++;showResult(final,r);busy=false;$('plateStage').classList.remove('rolling');save();renderAll();toast('Номер выпал! Выбери действие.');
                }
                ,500)
            }
        }
        ,65)
    }
    const garageBtn=$('resultGarageBtn');
    if(garageBtn)garageBtn.addEventListener('click',()=>{if(!lastWonItem)return;inventory.unshift(lastWonItem);lastWonItem=null;if($('resultActions'))$('resultActions').hidden=true;save();renderAll();toast('Номер помещён в гараж');});
    const sellBtn=$('resultSellBtn');
    if(sellBtn)sellBtn.addEventListener('click',()=>{if(!lastWonItem)return;claimIncome();balance+=lastWonItem.key==='VOID'?3000000:lastWonItem.price;totalSold++;totalEarned+=lastWonItem.key==='VOID'?3000000:lastWonItem.price;lastWonItem=null;if($('resultActions'))$('resultActions').hidden=true;save();updateBalance();renderAll();toast('Номер продан!');});
    function bonusUpdate() {
        let left=86400000-(Date.now()-lastBonusTime),ready=left<=0;$('bonusBtn').disabled=!ready;$('bonusStatus').textContent=ready?'Бонус готов! Забирай.':`Следующий бонус через ${Math.ceil(left/3600000)} ч.`;$('bonusBtn').textContent=ready?'Получить +10 000 ₽':'Уже получен'
    }
    function tab(name) {
        document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));['inventory','achievements','stats','bonus'].forEach(x=>$(x+'View').hidden=x!==name);if(name==='bonus')bonusUpdate();if(name==='stats')renderStats()
    }
    $('chooseCaseBtn').addEventListener('click',openModal);$('closeCaseModal').addEventListener('click',closeModal);$('caseModal').addEventListener('click',e=> {
        if(e.target===$('caseModal'))closeModal()
    }
    );document.addEventListener('keydown',e=> {
        if(e.key==='Escape')closeModal()
    }
    );$('openBtn').addEventListener('click',openCase);$('bonusBtn').addEventListener('click',()=> {
        claimIncome();if(Date.now()-lastBonusTime<86400000) {
            bonusUpdate();return
        }
        balance+=10000;lastBonusTime=Date.now();save();updateBalance();bonusUpdate();toast('Ежедневный бонус +10 000 ₽')
    }
    );document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>tab(b.dataset.tab)));$('inventorySort').addEventListener('change',renderInventory);$('inventoryFilter').addEventListener('change',renderInventory);let offline=claimIncome();if(offline>0)toast(`Пассивный доход: +${money(offline)}`);renderCases();renderAll();bonusUpdate();save();setInterval(()=> {
        let gained=claimIncome();if(gained) {
            updateBalance();renderStats();save()
        }
    }
    ,60000)
}
)();
