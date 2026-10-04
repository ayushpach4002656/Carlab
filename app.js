const cars=window.CARLAB_CARS;
const mods={
power:[["Stock",0,0],["Stage 1",4,1800],["Stage 2",7,4200],["Big Turbo",12,10500]],
exhaust:[["Stock",0,0],["Sport",2,1800],["Valved",3,3200],["Titanium",4,6500]],
wheels:[["OEM",0,0],["Flow Formed",2,2200],["Forged",4,4800],["Track Set",5,6500]],
suspension:[["Stock",0,0],["Springs",2,1200],["Coilovers",5,3300],["Track",8,6500]],
aero:[["Clean",0,0],["Lip Kit",2,1800],["Street Aero",4,4500],["Full Aero",7,9500]]
};
const paints=[["Obsidian","#15171b"],["Arctic","#d8dadd"],["Crimson","#6e1018"],["Acid","#a6bd17"],["Midnight","#17233c"],["Silver","#777c84"]];
const $=id=>document.getElementById(id); let build={arch:"Street",power:1,exhaust:1,wheels:1,suspension:1,aero:0,paint:0};let battleCat="score";

function populateSelect(sel,list){let old=sel.value;sel.innerHTML="";list.forEach(c=>sel.add(new Option(`${c.brand} ${c.model}  ·  ${c.category}`,c.name)));if(list.some(c=>c.name===old))sel.value=old}
function filterCars(){let q=$("carSearch").value.toLowerCase().trim(),br=$("brandFilter").value,ty=$("typeFilter").value;let list=cars.filter(c=>(!q||(c.name+" "+c.category).toLowerCase().includes(q))&&(!br||c.brand===br)&&(!ty||c.category===ty));populateSelect($("base"),list);$("rosterCount").textContent=list.length+" / "+cars.length;if(list.length)calc()}

function init(){
 populateSelect($("base"),cars); populateSelect($("carA"),cars); populateSelect($("carB"),cars); $("carB").value=cars[1].name;
 $("rosterCount").textContent=cars.length+" CARS";
 [...new Set(cars.map(c=>c.brand))].sort().forEach(v=>$("brandFilter").add(new Option(v.toUpperCase(),v)));
 [...new Set(cars.map(c=>c.category))].sort().forEach(v=>$("typeFilter").add(new Option(v.toUpperCase(),v)));
 ["carSearch","brandFilter","typeFilter"].forEach(id=>$(id).addEventListener(id==="carSearch"?"input":"change",filterCars));
 Object.keys(mods).forEach(k=>{mods[k].forEach((m,i)=>{let b=document.createElement("button");b.textContent=m[0];b.className=i===build[k]?"on":"";b.onclick=()=>{build[k]=i;renderChoices();calc()};$(k).appendChild(b)})});
 paints.forEach((p,i)=>{let b=document.createElement("button");b.title=p[0];b.style.background=p[1];b.className=i===0?"on":"";b.onclick=()=>{build.paint=i;renderPaint();calc()};$("paint").appendChild(b)});
 $("archetypes").querySelectorAll("button").forEach(b=>b.onclick=()=>{build.arch=b.dataset.v;$("archetypes").querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));calc()});
 ["base","carA","carB"].forEach(id=>$(id).addEventListener("change",()=>id==="base"?calc():updateFighters()));
 $("battleCats").querySelectorAll("button").forEach(b=>b.onclick=()=>{battleCat=b.dataset.cat;$("battleCats").querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));$("battleCategory").textContent=b.textContent;updateFighters()});
 document.addEventListener("mousemove",e=>{$("glow").style.left=e.clientX+"px";$("glow").style.top=e.clientY+"px"});
 calc();updateFighters();renderQ();renderRank();renderGarage();daily();setInterval(timer,1000);timer();
}
function renderChoices(){Object.keys(mods).forEach(k=>[...$(k).children].forEach((b,i)=>b.classList.toggle("on",i===build[k])))}
function renderPaint(){[...$("paint").children].forEach((b,i)=>b.classList.toggle("on",i===build.paint))}
function current(){
 let c=cars.find(x=>x.name===$("base").value), power=c.power,handling=c.handling,style=c.style,daily=c.daily,cost=c.price;
 Object.keys(mods).forEach(k=>cost+=mods[k][build[k]][2]);
 power+=mods.power[build.power][1]+Math.round(mods.exhaust[build.exhaust][1]/2);
 handling+=mods.wheels[build.wheels][1]+mods.suspension[build.suspension][1]+Math.round(mods.aero[build.aero][1]/2);
 style+=mods.exhaust[build.exhaust][1]+mods.wheels[build.wheels][1]+mods.aero[build.aero][1];
 daily-=build.power*2+build.suspension*2+build.aero;
 if(build.arch==="Track"){handling+=5;power+=2;daily-=5}if(build.arch==="Luxury"){daily+=5;style+=3}if(build.arch==="Sleeper"){power+=4;style-=1}if(build.arch==="Street"){style+=2;daily+=1}
 power=Math.min(99,power);handling=Math.min(99,handling);style=Math.min(99,style);daily=Math.max(50,Math.min(99,daily));
 let score=Math.round(power*.28+handling*.28+style*.25+daily*.19);return{car:c.name,cost,power,handling,style,daily,score,arch:build.arch,paint:paints[build.paint][0],mods:{...build}}
}
function calc(){let x=current();$("buildName").textContent=x.car.toUpperCase();$("buildCost").textContent="$"+x.cost.toLocaleString()+" BUILD";$("score").textContent=x.score;["Power","Handling","Style","Daily"].forEach(k=>{$("m"+k).style.width=x[k.toLowerCase()]+"%";$("n"+k).textContent=x[k.toLowerCase()]});document.documentElement.style.setProperty("--paint",paints[build.paint][1]);$("paintName").textContent=paints[build.paint][0].toUpperCase();$("wing").style.opacity=build.aero>=2?1:0;let v=x.score>=95?["Unfair.","This is the kind of build people screenshot."]:x.score>=91?["Certified weapon.","Fast, clean, and dangerous enough to make the group chat argue."]:x.score>=87?["Serious build.","You understood the assignment."]:x.score>=82?["Respectable.","Good taste. A few choices away from elite."]:["Questionable decisions.","But questionable builds are sometimes the most fun."];$("verdict").textContent=v[0];$("verdictText").textContent=v[1]}
function saveBuild(){let x=current(),g=JSON.parse(localStorage.getItem("clGarage")||"[]");g.unshift({...x,id:Date.now()});g=g.slice(0,12);localStorage.setItem("clGarage",JSON.stringify(g));renderGarage();toast("Saved to your dream garage ✓")}
function renderGarage(){let g=JSON.parse(localStorage.getItem("clGarage")||"[]");$("garageCount").textContent=g.length;$("garageGrid").innerHTML=g.length?g.map(x=>`<div class="garage-car"><span>${x.arch.toUpperCase()} // ${x.paint.toUpperCase()}</span><h3>${x.car}</h3><div class="garage-score">${x.score}<small>/100</small></div><small>$${x.cost.toLocaleString()} BUILD</small><button onclick="removeCar(${x.id})">REMOVE</button></div>`).join(""):`<div class="garage-empty">NO CARS YET.<br><br><button class="primary" onclick="go('build')">BUILD YOUR FIRST →</button></div>`}
function removeCar(id){let g=JSON.parse(localStorage.getItem("clGarage")||"[]").filter(x=>x.id!==id);localStorage.setItem("clGarage",JSON.stringify(g));renderGarage()}
function randomBuild(){let keys=Object.keys(mods);keys.forEach(k=>build[k]=Math.floor(Math.random()*mods[k].length));build.paint=Math.floor(Math.random()*paints.length);build.arch=["Street","Track","Luxury","Sleeper"][Math.floor(Math.random()*4)];$("base").selectedIndex=Math.floor(Math.random()*$("base").options.length);renderChoices();renderPaint();[...$("archetypes").children].forEach(b=>b.classList.toggle("on",b.dataset.v===build.arch));calc();toast("Chaos build generated ⚄")}
function shareBuild(){let x=current(),t=`My ${x.car} build scored ${x.score}/100 on CarLab — ${x.arch} spec, $${x.cost.toLocaleString()}. Beat that.`;if(navigator.share)navigator.share({title:"My CarLab Build",text:t,url:location.href}).catch(()=>{});else navigator.clipboard.writeText(t+" "+location.href).then(()=>toast("Build challenge copied ✓"))}
function stat(c,k){return k==="score"?Math.round(c.power*.28+c.handling*.28+c.style*.25+c.daily*.19):c[k]}
function updateFighters(){let a=cars.find(x=>x.name===$("carA").value),b=cars.find(x=>x.name===$("carB").value);$("aScore").textContent=stat(a,battleCat);$("bScore").textContent=stat(b,battleCat);$("aBars").innerHTML=bars(a);$("bBars").innerHTML=bars(b);$("battleResult").textContent=""}
function bars(c){return [["PWR",c.power],["HDL",c.handling],["STY",c.style],["DAY",c.daily]].map(x=>`<div><span>${x[0]}</span><b style="width:${x[1]}%"></b></div>`).join("")}
function battle(){let a=cars.find(x=>x.name===$("carA").value),b=cars.find(x=>x.name===$("carB").value),av=stat(a,battleCat),bv=stat(b,battleCat);$("battleResult").innerHTML=av===bv?`🤝 <b>DEAD EVEN.</b> The comments section has to settle this one.`:`🏆 <b>${av>bv?a.name:b.name}</b> wins ${$("battleCategory").textContent.toLowerCase()} by ${Math.abs(av-bv)} point${Math.abs(av-bv)==1?"":"s"}.`}
const qs=[["Rear-engine layout. Flat-six heritage. One of the world's most recognizable sports cars.","Porsche 911 Carrera",["Porsche 911 Carrera","BMW M2","Lotus Emira","Toyota GR Supra"]],["Honda badge. Front-wheel drive. Giant reputation among hot-hatch fans.","Honda Civic Type R",["Volkswagen Golf R","Honda Civic Type R","Subaru WRX","Hyundai Elantra N"]],["Japanese coupe revived with help from BMW engineering.","Toyota GR Supra",["Nissan GT-R","Toyota GR Supra","Toyota GR86","Lexus LC 500"]],["American V8 icon. Pony car. GT badge.","Ford Mustang GT",["Chevrolet Corvette","Ford Mustang GT","Dodge Challenger R/T","Cadillac CT5-V Blackwing"]],["Tiny, light, rear-wheel drive roadster famous for 'Miata is always the answer.'","Mazda MX-5 Miata",["Toyota GR86","Mazda MX-5 Miata","Lotus Emira","BMW M2"]]];let qi=0,streakN=+localStorage.getItem("clStreak")||0;
function renderQ(){let q=qs[qi%qs.length];$("clue").textContent=q[0];$("streak").textContent=streakN;$("headerStreak").textContent=streakN;$("feedback").textContent="";$("answers").innerHTML=q[2].map(a=>`<button onclick="answerQ(this,'${a.replaceAll("'","\\'")}')">${a}</button>`).join("")}
function answerQ(btn,a){let q=qs[qi%qs.length];document.querySelectorAll("#answers button").forEach(b=>{b.disabled=true;if(b.textContent===q[1])b.classList.add("correct")});if(a===q[1]){streakN++;$("feedback").textContent="✓ CORRECT — STREAK CONTINUES";$("feedback").style.color="var(--lime)"}else{streakN=0;btn.classList.add("wrong");$("feedback").textContent="✕ MISSED — IT WAS "+q[1].toUpperCase();$("feedback").style.color="var(--red)"}localStorage.setItem("clStreak",streakN);$("streak").textContent=streakN;$("headerStreak").textContent=streakN}
function nextQ(){qi++;renderQ()}
let rankPair=0;const pairs=[["Porsche 911 Carrera","Nissan GT-R"],["BMW M3 Competition","Mercedes-AMG E 53"],["Toyota GR Supra","BMW M2"],["Lotus Emira","Chevrolet Corvette"],["Honda Civic Type R","Volkswagen Golf R"]];
function renderRank(){let p=pairs[rankPair%pairs.length];$("rank0").textContent=p[0];$("rank1").textContent=p[1]}
function rankPick(i){let p=pairs[rankPair%pairs.length];$("taste").textContent=`You picked ${p[i]}. Respect. Next one.`;rankPair++;setTimeout(renderRank,500)}
function daily(){let d=new Date(),day=Math.floor(d.getTime()/86400000),ch=[["THE $80K STREET KING","Build the highest-scoring street car without breaking the budget.","$80K MAX","STREET BUILD","90+ TARGET"],["SLEEPER SUNDAY","Build something subtle with ridiculous performance.","SLEEPER ONLY","POWER MATTERS","92+ TARGET"],["TRACK RAT","Handling is everything today. Build a corner monster.","TRACK BUILD","HANDLING FIRST","93+ TARGET"],["DAILY HERO","Performance without ruining daily usability.","DAILY ≥ 88","BALANCED","90+ TARGET"]][day%4];$("challengeTitle").textContent=ch[0];$("challengeDesc").textContent=ch[1];$("challengeRules").innerHTML=ch.slice(2).map(x=>`<span>${x}</span>`).join("");$("challengeDay").textContent=d.toLocaleDateString(undefined,{weekday:"long"}).toUpperCase()}
function timer(){let n=new Date(),end=new Date(n);end.setHours(24,0,0,0);let s=Math.floor((end-n)/1000),h=String(Math.floor(s/3600)).padStart(2,"0"),m=String(Math.floor((s%3600)/60)).padStart(2,"0"),ss=String(s%60).padStart(2,"0");$("countdown").textContent=`${h}:${m}:${ss}`}
function acceptChallenge(){go("build");toast("Challenge accepted. Build something nasty.")}
function go(id){$(id).scrollIntoView({behavior:"smooth"})}
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2200)}
init();