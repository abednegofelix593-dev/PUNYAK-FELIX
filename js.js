(function(){
  var DAYS=["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];
  var KEY="jadwal-belajar-v1";
  var today=(new Date().getDay()+6)%7;
  var sel=today;
  var items=load();

  function load(){
    try{var r=localStorage.getItem(KEY);return r?JSON.parse(r):[];}catch(e){return [];}
  }
  function save(){
    try{localStorage.setItem(KEY,JSON.stringify(items));}catch(e){}
  }
  function esc(s){
    return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});
  }
  function pending(d){
    return items.filter(function(i){return i.pr==="ada"&&!i.done&&(d===undefined||i.day===d);});
  }

  function render(){
    // tabs
    var t="";
    DAYS.forEach(function(n,d){
      var p=pending(d).length;
      t+='<button class="tab" role="tab" data-day="'+d+'" aria-selected="'+(d===sel)+'">'+n.slice(0,3)+
         '<small>'+(d===today?"hari ini":"&nbsp;")+'</small>'+
         (p?'<span class="dot" title="PR belum selesai">'+p+'</span>':'')+'</button>';
    });
    document.getElementById("tabs").innerHTML=t;
    document.getElementById("dayTitle").textContent=DAYS[sel]+(sel===today?" (hari ini)":"");
    document.getElementById("addBtn").textContent="Tambah ke "+DAYS[sel];

    // list
    var rows=items.filter(function(i){return i.day===sel;}).sort(function(a,b){return a.start.localeCompare(b.start);});
    var h="";
    if(!rows.length){
      h='<div class="empty">Belum ada jadwal di hari '+DAYS[sel]+'. Isi mata pelajaran di bawah, lalu klik tambah.</div>';
    }
    rows.forEach(function(i){
      h+='<div class="item'+(i.done?' done':'')+'" data-id="'+i.id+'">'+
        '<div class="row"><span class="time">'+esc(i.start)+' – '+esc(i.end)+'</span>'+
        '<span class="subj">'+esc(i.subject)+'</span>'+
        '<button class="del" data-act="del" aria-label="Hapus '+esc(i.subject)+'">Hapus</button></div>'+
        '<div class="seg" role="group" aria-label="Status PR">'+
          '<button data-act="nopr" aria-pressed="'+(i.pr!=="ada")+'">Tidak ada PR</button>'+
          '<button class="pr" data-act="pr" aria-pressed="'+(i.pr==="ada")+'">Ada PR</button>'+
        '</div>';
      if(i.pr==="ada"){
        h+='<div class="prbox"><input type="text" class="note" data-act="note" placeholder="PR-nya apa? Contoh: Latihan soal hal. 42" value="'+esc(i.note||"")+'" maxlength="120">'+
           '<label class="chk"><input type="checkbox" data-act="done"'+(i.done?' checked':'')+'> Sudah dikerjakan</label></div>';
      }
      h+='</div>';
    });
    document.getElementById("list").innerHTML=h;

    // summary
    var all=pending();
    var s='<h2>PR yang belum selesai</h2>';
    if(!all.length){
      s+='<p>Tidak ada PR yang menunggu. Santai dulu.</p>';
    }else{
      s+='<ul>';
      all.sort(function(a,b){return a.day-b.day||a.start.localeCompare(b.start);}).forEach(function(i){
        s+='<li><button data-goto="'+i.day+'"><b>'+DAYS[i.day]+' · '+esc(i.subject)+'</b>'+(i.note?': '+esc(i.note):'')+'</button></li>';
      });
      s+='</ul>';
    }
    document.getElementById("sum").innerHTML=s;
  }

  function find(el){
    var card=el.closest(".item");
    if(!card)return null;
    var id=card.getAttribute("data-id");
    return items.filter(function(i){return String(i.id)===id;})[0]||null;
  }

  document.getElementById("tabs").addEventListener("click",function(e){
    var b=e.target.closest("[data-day]");
    if(b){sel=+b.getAttribute("data-day");render();}
  });
  document.getElementById("sum").addEventListener("click",function(e){
    var b=e.target.closest("[data-goto]");
    if(b){sel=+b.getAttribute("data-goto");render();window.scrollTo({top:0,behavior:"smooth"});}
  });
  document.getElementById("list").addEventListener("click",function(e){
    var b=e.target.closest("[data-act]");
    if(!b)return;
    var it=find(b);if(!it)return;
    var a=b.getAttribute("data-act");
    if(a==="del"){items=items.filter(function(x){return x!==it;});}
    else if(a==="pr"){it.pr="ada";}
    else if(a==="nopr"){it.pr="none";it.done=false;}
    else if(a==="done"){it.done=b.checked;}
    else return;
    save();render();
  });
  document.getElementById("list").addEventListener("change",function(e){
    var b=e.target.closest('[data-act="note"]');
    if(!b)return;
    var it=find(b);if(!it)return;
    it.note=b.value.trim();
    save();render();
  });

  document.getElementById("addBtn").addEventListener("click",function(){
    var sub=document.getElementById("subject");
    var st=document.getElementById("start").value||"00:00";
    var en=document.getElementById("end").value||st;
    var name=sub.value.trim();
    if(!name){sub.focus();return;}
    items.push({id:Date.now()+Math.floor(Math.random()*1000),day:sel,subject:name,start:st,end:en,pr:"none",note:"",done:false});
    sub.value="";
    save();render();
  });
  document.getElementById("subject").addEventListener("keydown",function(e){
    if(e.key==="Enter")document.getElementById("addBtn").click();
  });
  document.getElementById("wipe").addEventListener("click",function(){
    if(confirm("Hapus semua jadwal dan PR? Ini tidak bisa dibatalkan.")){items=[];save();render();}
  });

  render();
})();