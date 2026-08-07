const { createClient }=supabase;
const db=createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
let members=[],settings=null,prizes=[];
const $=id=>document.getElementById(id);
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function msg(t,ok=true){$("adminMsg").textContent=t;$("adminMsg").className="msg "+(ok?"ok":"bad");}
async function load(){
 const {data:{session}}=await db.auth.getSession();
 if(!session){$("loginBox").classList.remove("hidden");$("panel").classList.add("hidden");$("logout").classList.add("hidden");return;}
 $("loginBox").classList.add("hidden");$("panel").classList.remove("hidden");$("logout").classList.remove("hidden");
 const [s,m,p]=await Promise.all([db.from("clan_settings").select("*").eq("id",1).single(),db.from("members").select("*").order("name"),db.from("prizes").select("*").order("created_at",{ascending:false})]);
 if(s.error||m.error||p.error){msg("Error de base de datos. Revisa supabase.sql.",false);return}
 settings=s.data;members=m.data||[];prizes=p.data||[];fill(); 
}
function fill(){
 [["clan_level",settings.level],["clan_league",settings.league],["clan_streak",settings.streak],["clan_members",settings.member_count],["war_wins",settings.war_wins],["war_losses",settings.war_losses],["war_draws",settings.war_draws],["war_best_streak",settings.war_best_streak],["war_total",settings.war_total]].forEach(([id,v])=>$(id).value=v??"");
 const opts=members.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join("");
 $("month_player").innerHTML='<option value="">Automático</option>'+opts;
 $("highest_player").innerHTML='<option value="">Sin asignar</option>'+opts;
 $("month_player").value=settings.player_of_month||"";
 $("highest_player").value=settings.highest_rank_player||"";
 $("adminMembers").innerHTML=members.map(m=>`<tr data-id="${m.id}"><td><input class="name" value="${esc(m.name)}"></td><td><input class="th" type="number" value="${m.town_hall}"></td><td><input class="role" value="${esc(m.clan_role)}"></td><td><input class="stars" type="number" value="${m.stars}"></td><td><input class="donations" type="number" value="${m.donations}"></td><td><input class="medals" type="number" value="${m.medals}"></td><td><input class="active" type="checkbox" ${m.active?"checked":""}></td><td><button class="small save-member">Guardar</button> <button class="small danger delete-member">Borrar</button></td></tr>`).join("");
 $("prizesAdmin").innerHTML=prizes.map(p=>`<div class="prize-row" data-id="${p.id}"><input class="ptitle" value="${esc(p.title)}"><input class="pwinner" value="${esc(p.winner||"")}"><input class="preward" value="${esc(p.reward||"")}"><input class="pmonth" value="${esc(p.month||"")}"><button class="small save-prize">Guardar</button><button class="small danger delete-prize">Borrar</button></div>`).join("");
 bindRows();
}
$("login").onclick=async()=>{const {error}=await db.auth.signInWithPassword({email:$("email").value,password:$("password").value});if(error){$("loginMsg").textContent="Credenciales incorrectas o cuenta no configurada."}else load()};
$("logout").onclick=async()=>{await db.auth.signOut();load()};
$("loginBox").addEventListener("keydown",e=>{if(e.key==="Enter")$("login").click()});
document.querySelector(".save-clan").onclick=async()=>{const patch={level:+$("clan_level").value,league:$("clan_league").value,streak:+$("clan_streak").value,member_count:+$("clan_members").value};const {error}=await db.from("clan_settings").update(patch).eq("id",1);msg(error?error.message:"Datos del clan actualizados.",!error)};
document.querySelector(".save-war").onclick=async()=>{const patch={war_wins:+$("war_wins").value,war_losses:+$("war_losses").value,war_draws:+$("war_draws").value,war_best_streak:+$("war_best_streak").value,war_total:+$("war_total").value};const {error}=await db.from("clan_settings").update(patch).eq("id",1);msg(error?error.message:"Estadísticas de guerra actualizadas.",!error)};
document.querySelector(".save-awards").onclick=async()=>{const patch={player_of_month:$("month_player").value||null,highest_rank_player:$("highest_player").value||null};const {error}=await db.from("clan_settings").update(patch).eq("id",1);msg(error?error.message:"Reconocimientos actualizados.",!error)};
$("addMember").onclick=async()=>{const {error}=await db.from("members").insert({name:"Nuevo jugador",town_hall:17,clan_role:"Miembro",stars:0,donations:0,medals:0,active:true});msg(error?error.message:"Miembro creado.",!error);if(!error)load()};
$("addPrize").onclick=async()=>{const {error}=await db.from("prizes").insert({title:"Nuevo premio",winner:"Pendiente",reward:"",month:""});msg(error?error.message:"Premio creado.",!error);if(!error)load()};
function bindRows(){
 document.querySelectorAll(".save-member").forEach(b=>b.onclick=async()=>{const tr=b.closest("tr");const patch={name:tr.querySelector(".name").value,town_hall:+tr.querySelector(".th").value,clan_role:tr.querySelector(".role").value,stars:+tr.querySelector(".stars").value,donations:+tr.querySelector(".donations").value,medals:+tr.querySelector(".medals").value,active:tr.querySelector(".active").checked};const {error}=await db.from("members").update(patch).eq("id",tr.dataset.id);msg(error?error.message:"Miembro actualizado.",!error)});
 document.querySelectorAll(".delete-member").forEach(b=>b.onclick=async()=>{if(!confirm("¿Borrar este miembro?"))return;const tr=b.closest("tr");const {error}=await db.from("members").delete().eq("id",tr.dataset.id);msg(error?error.message:"Miembro eliminado.",!error);if(!error)load()});
 document.querySelectorAll(".save-prize").forEach(b=>b.onclick=async()=>{const r=b.closest(".prize-row");const {error}=await db.from("prizes").update({title:r.querySelector(".ptitle").value,winner:r.querySelector(".pwinner").value,reward:r.querySelector(".preward").value,month:r.querySelector(".pmonth").value}).eq("id",r.dataset.id);msg(error?error.message:"Premio actualizado.",!error)});
 document.querySelectorAll(".delete-prize").forEach(b=>b.onclick=async()=>{if(!confirm("¿Borrar este premio?"))return;const r=b.closest(".prize-row");const {error}=await db.from("prizes").delete().eq("id",r.dataset.id);msg(error?error.message:"Premio eliminado.",!error);if(!error)load()});
}
db.auth.onAuthStateChange(()=>load());
db.channel("admin-live").on("postgres_changes",{event:"*",schema:"public",table:"members"},load).on("postgres_changes",{event:"*",schema:"public",table:"clan_settings"},load).on("postgres_changes",{event:"*",schema:"public",table:"prizes"},load).subscribe();
load();