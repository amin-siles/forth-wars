const { createClient } = supabase;
const db=createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
let members=[], settings=null, prizes=[], currentRank="stars";

function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
async function load(){
 const [s,m,p]=await Promise.all([
  db.from("clan_settings").select("*").eq("id",1).single(),
  db.from("members").select("*").eq("active",true).order("stars",{ascending:false}),
  db.from("prizes").select("*").order("created_at",{ascending:false})
 ]);
 if(s.error||m.error||p.error){document.body.insertAdjacentHTML("afterbegin",`<div class="error">Configura Supabase en config.js y ejecuta supabase.sql.</div>`);return;}
 settings=s.data; members=m.data||[]; prizes=p.data||[]; render();
}
function render(){
 mLevel.textContent=settings.level;mLeague.textContent=settings.league;mStreak.textContent="🔥 "+settings.streak;mMembers.textContent=settings.member_count||members.length;
 const month=members.slice().sort((a,b)=>(b.stars+b.donations/100+b.medals/100)- (a.stars+a.donations/100+a.medals/100))[0];
 playerMonth.innerHTML=month?`<strong>${esc(month.name)}</strong><p>⭐ ${month.stars} · 💰 ${month.donations.toLocaleString()} · 🏅 ${month.medals.toLocaleString()}</p>`:"—";
 const high=members.find(x=>x.id===settings.highest_rank_player); highestRank.innerHTML=high?`<strong>${esc(high.name)}</strong><p>${esc(high.clan_role)}</p>`:"—";
 donationTop.innerHTML=members.slice().sort((a,b)=>b.donations-a.donations).slice(0,5).map((x,i)=>`<p>${i+1}. ${esc(x.name)} <b>${x.donations.toLocaleString()}</b></p>`).join("");
 renderRanking();
 warStats.innerHTML=[["Victorias",settings.war_wins],["Derrotas",settings.war_losses],["Empates",settings.war_draws],["Racha actual",settings.streak],["Mejor racha",settings.war_best_streak],["Guerras disputadas",settings.war_total]].map(x=>`<div class="stat card"><b>${x[1]}</b><span>${x[0]}</span></div>`).join("");
 memberGrid.innerHTML=members.map(x=>`<article class="card member-card"><div class="avatar">${esc(x.name.slice(0,2))}</div><h3>${esc(x.name)}</h3><p>${esc(x.clan_role)} · TH${x.town_hall}</p><p>⭐ ${x.stars} · 💰 ${x.donations.toLocaleString()} · 🏅 ${x.medals.toLocaleString()}</p></article>`).join("");
 prizeGrid.innerHTML=prizes.length?prizes.map(p=>`<article class="card"><h3>🎁 ${esc(p.title)}</h3><p><b>${esc(p.winner||"Pendiente")}</b></p><p>${esc(p.reward||"—")} · ${esc(p.month||"")}</p></article>`).join(""):`<div class="card">No hay premios registrados.</div>`;
}
function renderRanking(){
 let key=currentRank==="stars"?"stars":currentRank==="donations"?"donations":"medals";
 let sorted=members.slice().sort((a,b)=>b[key]-a[key]);
 rankingBody.innerHTML=sorted.map((x,i)=>`<tr><td>${i+1}</td><td><b>${esc(x.name)}</b></td><td>TH${x.town_hall}</td><td>${esc(x.clan_role)}</td><td>${x.stars}</td><td>${x.donations.toLocaleString()}</td><td>${x.medals.toLocaleString()}</td></tr>`).join("");
}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");currentRank=b.dataset.rank;renderRanking();});
db.channel("public-live").on("postgres_changes",{event:"*",schema:"public",table:"members"},load).on("postgres_changes",{event:"*",schema:"public",table:"clan_settings"},load).on("postgres_changes",{event:"*",schema:"public",table:"prizes"},load).subscribe();
load();