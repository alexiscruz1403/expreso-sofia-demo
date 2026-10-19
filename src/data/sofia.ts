// @ts-nocheck -- logic ported verbatim from the design prototype (dynamic JS objects)
/* In-memory demo data layer, ported from design/sofia-data.js. Changes never persist across reloads. */
const NOW=new Date(2026,9,16,20,30);
const DOW=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const DOWS=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MON=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MONS=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return iso(d)};
const hm=m=>pad(Math.floor(m/60)%24)+':'+pad(m%60);
const money=n=>(n<0?'-':'')+'$'+Math.abs(Math.round(n)).toLocaleString('es-AR');
const dni=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const dshort=s=>{const d=parse(s);return DOWS[d.getDay()]+' '+d.getDate()+' '+MONS[d.getMonth()]};
const dlong=s=>{const d=parse(s);return DOW[d.getDay()]+' '+d.getDate()+' de '+MON[d.getMonth()]};
const dtf=d=>pad(d.getDate())+'/'+pad(d.getMonth()+1)+' '+pad(d.getHours())+':'+pad(d.getMinutes());
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){let a=seed||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const B32='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const mkCode=seed=>{const r=rng(hash(seed));let s='';for(let i=0;i<5;i++)s+=B32[Math.floor(r()*32)];return 'SOF-'+s};
const pick=(r,a)=>a[Math.floor(r()*a.length)];

const LINES={
 T:{id:'T',name:'Línea Tartagal',short:'Tartagal',stops:[['Tartagal',0],['Mosconi',30],['Coronel Cornejo',50],['Gral. Ballivián',75],['Cruce 81',85],['Embarcación',105],['Pichanal',135]],arr:390,vDep:990,vStops:{'Pichanal':1245,'Embarcación':1275,'Cruce 81':1295,'Gral. Ballivián':1305,'Coronel Cornejo':1330,'Mosconi':1350,'Tartagal':1380},cars:[22,16]},
 O:{id:'O',name:'Línea Orán',short:'Orán',stops:[['Orán',90],['Hipólito Yrigoyen',115],['Pichanal',135],['Colonia Santa Rosa',155],['Urundel',175]],arr:390,vDep:1080,vStops:{'Urundel':1290,'Colonia Santa Rosa':1305,'Pichanal':1330,'Hipólito Yrigoyen':1355,'Orán':1380},cars:[11,23]}
};
const FARES={T:{semi:{ida:20000,iv:35000},cama:{ida:25000,iv:46000}},O:{semi:{ida:20000,iv:32000},cama:{ida:25000,iv:40000}}};
const BRANCHES=[
 {name:'Salta Capital',addr:'Terminal de Ómnibus, boleterías 07 y 13',tel:'3878-804506',hours:'Todos los días 07:00 a 22:00'},
 {name:'Orán',addr:'20 de Febrero 51',tel:'3878-242321',hours:'Lun a Sáb 08:00 a 13:00 y 17:00 a 01:30'},
 {name:'Hipólito Yrigoyen',addr:'Av. Güemes esq. Belgrano',tel:'3878-805381',hours:'Lun a Sáb 08:00 a 13:00 y 17:00 a 02:00'},
 {name:'Pichanal',addr:'Belgrano esq. F. Ameghino',tel:'3878-308535',hours:'Lun a Sáb 08:00 a 13:00 y 17:00 a 02:15'},
 {name:'Tartagal',addr:'Dirección a confirmar',tel:'3873-309893',hours:'Lun a Sáb 08:00 a 13:00 y 17:00 a 00:00'},
 {name:'Embarcación',addr:'Dirección a confirmar',tel:'3878-671918',hours:'Lun a Sáb 17:00 a 01:45'},
 {name:'Mosconi',addr:'Dirección a confirmar',tel:'3873-717031',hours:'Lun a Sáb 17:00 a 00:30'},
 {name:'Ballivián',addr:'Dirección a confirmar',tel:'3873-659990',hours:'Lun a Sáb 17:00 a 01:15'},
 {name:'Colonia Santa Rosa y Urundel',addr:'Dirección a confirmar',tel:'3878-804506',hours:'Lun a Sáb 17:00 a 02:55'}
];
const STOP_BRANCH={'Tartagal':'Tartagal','Mosconi':'Mosconi','Coronel Cornejo':'Mosconi','Gral. Ballivián':'Ballivián','Cruce 81':'Ballivián','Embarcación':'Embarcación','Pichanal':'Pichanal','Orán':'Orán','Hipólito Yrigoyen':'Hipólito Yrigoyen','Colonia Santa Rosa':'Colonia Santa Rosa y Urundel','Urundel':'Colonia Santa Rosa y Urundel','Salta':'Salta Capital'};
const SERVICES=['Wi-Fi satelital Starlink','Desayuno y merienda','Aire acondicionado y calefacción','Cargador USB en cada butaca','Atención personalizada por azafata'];
const FN=['Lucía','Martina','Sofía','Valentina','Camila','Florencia','Agustina','Micaela','Rocío','Daiana','Yanina','Carla','Natalia','Gabriela','Celeste','Romina','Juan','Matías','Lucas','Nicolás','Facundo','Gonzalo','Ezequiel','Diego','Marcelo','Ramón','Hugo','Sergio','Cristian','Brian','Franco','Leandro','José','Luis','Milagros','Abril','Elena','Rosa','Mario','Walter'];
const LN=['Fernández','Gutiérrez','Choque','Mamani','Cruz','Vargas','Flores','Romero','Sosa','Guzmán','Aramayo','Tolaba','Quispe','Ríos','Medina','Castillo','Díaz','Gómez','Rodríguez','López','Herrera','Cardozo','Zerpa','Arias','Burgos','Saravia','Figueroa','Ibarra','Villagra','Chauque','Alancay','Tejerina'];
const USERS=[
 {id:'u1',nombre:'Ramón Saravia',email:'admin@expresosofia.com.ar',rol:'Administrador',sucursal:'Salta Capital',activo:true},
 {id:'u2',nombre:'Graciela Saravia',email:'graciela@expresosofia.com.ar',rol:'Administrador',sucursal:'Salta Capital',activo:true},
 {id:'u3',nombre:'Daiana Tolaba',email:'ventas@expresosofia.com.ar',rol:'Vendedor',sucursal:'Salta Capital',activo:true},
 {id:'u4',nombre:'Marcos Aramayo',email:'marcos@expresosofia.com.ar',rol:'Vendedor',sucursal:'Salta Capital',activo:true},
 {id:'u5',nombre:'Yanina Cruz',email:'yanina@expresosofia.com.ar',rol:'Vendedor',sucursal:'Orán',activo:true},
 {id:'u6',nombre:'Ezequiel Ríos',email:'ezequiel@expresosofia.com.ar',rol:'Vendedor',sucursal:'Tartagal',activo:true},
 {id:'u7',nombre:'Rocío Mamani',email:'rocio@expresosofia.com.ar',rol:'Vendedor',sucursal:'Pichanal',activo:true},
 {id:'u8',nombre:'Carla Vargas',email:'carla@expresosofia.com.ar',rol:'Vendedor',sucursal:'Hipólito Yrigoyen',activo:true},
 {id:'u9',nombre:'Hugo Guzmán',email:'hugo@expresosofia.com.ar',rol:'Vendedor',sucursal:'Embarcación',activo:false},
 {id:'u10',nombre:'Micaela Flores',email:'staff@expresosofia.com.ar',rol:'Staff de viaje',puesto:'Azafata',sucursal:'Tartagal',activo:true},
 {id:'u11',nombre:'Celeste Herrera',email:'celeste@expresosofia.com.ar',rol:'Staff de viaje',puesto:'Azafata',sucursal:'Orán',activo:true},
 {id:'u12',nombre:'Sergio Ibarra',email:'sergio@expresosofia.com.ar',rol:'Staff de viaje',puesto:'Chofer',sucursal:'Tartagal',activo:true},
 {id:'u13',nombre:'José Cardozo',email:'jose@expresosofia.com.ar',rol:'Staff de viaje',puesto:'Chofer',sucursal:'Tartagal',activo:true},
 {id:'u14',nombre:'Luis Burgos',email:'luis@expresosofia.com.ar',rol:'Staff de viaje',puesto:'Chofer',sucursal:'Orán',activo:true},
 {id:'u15',nombre:'Cristian Zerpa',email:'cristian@expresosofia.com.ar',rol:'Staff de viaje',puesto:'Chofer',sucursal:'Orán',activo:true}
];
const SELLERS={'Salta Capital':['Daiana Tolaba','Marcos Aramayo'],'Orán':['Yanina Cruz'],'Tartagal':['Ezequiel Ríos'],'Pichanal':['Rocío Mamani'],'Hipólito Yrigoyen':['Carla Vargas']};
const CUD=[49,50];
const DAY0=parse('2026-10-01');
const dayIdx=s=>Math.round((parse(s)-DAY0)/864e5);
const TONIGHT_T='TI-2026-10-17', TONIGHT_O='OI-2026-10-17', SCEN_CANCEL='TI-2026-10-19';

function crewFor(L,di){const even=((di%2)+2)%2===0;return L==='T'?{chofer:even?'Sergio Ibarra y José Cardozo':'José Cardozo y Sergio Ibarra',azafata:'Micaela Flores'}:{chofer:'Luis Burgos y Cristian Zerpa',azafata:'Celeste Herrera'}}

const SEED_PURCHASES=[
 {id:'SOF-4KD72-1',code:'SOF-4KD72',tripId:'TI-2026-10-19',seat:23,cls:'semi',floor:'alta',nombre:'Lucía',apellido:'Fernández',dni:'32456789',nac:'1987-03-14',cud:false,stop:'Mosconi',price:20000,channel:'Online',branch:'Web',seller:'—',method:'MercadoPago · Tarjeta de débito',payStatus:'aprobado',status:'activo',createdAt:new Date(2026,9,14,22,11).getTime(),email:'lucia.fernandez@gmail.com',wa:'3873-512233'},
 {id:'SOF-9XR31-1',code:'SOF-9XR31',tripId:'OI-2026-10-17',seat:51,cls:'cama',floor:'baja',nombre:'Matías',apellido:'Choque',dni:'38112450',nac:'1994-08-02',cud:false,stop:'Pichanal',price:25000,channel:'Online',branch:'Web',seller:'—',method:'MercadoPago · Dinero en cuenta',payStatus:'aprobado',status:'activo',createdAt:new Date(2026,9,15,9,40).getTime(),email:'mati.choque@hotmail.com',wa:'3878-401122'}
];
const SEED_CHANGES=[
 {date:new Date(2026,9,16,11,5).getTime(),code:'SOF-8M2QA',pax:'Rosa Alancay',type:'Reprogramación',from:'Orán · Jue 15 oct',to:'Orán · Sáb 17 oct',reason:'Cambio de fecha a pedido',fee:3000,refund:0,channel:'Mostrador',branch:'Orán',user:'Yanina Cruz'},
 {date:new Date(2026,9,16,9,30).getTime(),code:'SOF-T7KX2',pax:'Franco Villagra',type:'Cancelación',from:'Tartagal · Lun 19 oct',to:'—',reason:'Motivos personales',fee:0,refund:18000,channel:'Online',branch:'Web',user:'Pasajero'},
 {date:new Date(2026,9,15,19,48).getTime(),code:'SOF-PL3HD',pax:'Elena Tejerina',type:'Reprogramación',from:'Tartagal · Vie 16 oct',to:'Tartagal · Mar 20 oct',reason:'Turno médico reprogramado',fee:3000,refund:0,channel:'WhatsApp',branch:'Salta Capital',user:'Daiana Tolaba'},
 {date:new Date(2026,9,15,12,2).getTime(),code:'SOF-ZQ9RB',pax:'Walter Chauque',type:'Cancelación',from:'Salta → Orán · Vie 16 oct',to:'—',reason:'Viaja en auto particular',fee:0,refund:17500,channel:'Mostrador',branch:'Salta Capital',user:'Marcos Aramayo'},
 {date:new Date(2026,9,14,18,20).getTime(),code:'SOF-C4N8E',pax:'Milagros Quispe',type:'Reprogramación',from:'Orán · Mié 14 oct',to:'Orán · Jue 15 oct',reason:'Perdió el colectivo',fee:3000,refund:0,channel:'Mostrador',branch:'Pichanal',user:'Rocío Mamani'},
 {date:new Date(2026,9,13,10,15).getTime(),code:'SOF-H6JW3',pax:'Mario Figueroa',type:'Cancelación',from:'Tartagal · Mié 14 oct',to:'—',reason:'Enfermedad',fee:0,refund:22500,channel:'Online',branch:'Web',user:'Pasajero'}
];
const UNITS=[{id:'c11',n:11,line:'O',plate:'AE 214 KD',status:'En servicio',pos:'100% 100%'},{id:'c16',n:16,line:'T',plate:'AF 087 PL',status:'En servicio',pos:'0% 100%'},{id:'c22',n:22,line:'T',plate:'LKG 825',status:'En servicio',pos:'100% 0%'},{id:'c23',n:23,line:'O',plate:'AG 330 RT',status:'En servicio',pos:'0% 0%'}];
const PROMOS=[{id:'p1',name:'Primer aniversario',desc:'10% off en Semicama ida comprando online',lines:'Ambas',from:'2026-10-12',to:'2026-10-31',pct:10,active:false},{id:'p2',name:'Ida y vuelta',desc:'Tarifa combinada ida y vuelta',lines:'Ambas',from:'2026-01-01',to:'2026-12-31',pct:0,active:true}];

function defaults(){return {role:'pasajero',device:'mobile',scenario:{pay:'aprobado',soldOut:false,tripCancelled:false,expire:false},purchases:SEED_PURCHASES.slice(),changes:SEED_CHANGES.slice(),cancelledTrips:[],blockedTrips:[],specialTrips:[],overrides:{},checkins:{},users:USERS.slice(),fares:JSON.parse(JSON.stringify(FARES)),promos:PROMOS.slice(),cajaClosed:false,units:UNITS.map(u=>Object.assign({},u)),stopsEdit:null,ver:0}}
// In-memory only: every page load starts from the seed data.
let st:any=defaults();
const subs=new Set();
const S=()=>st;
function set(p){const v=typeof p==='function'?p(st):p;st=Object.assign({},st,v,{ver:(st.ver||0)+1});subs.forEach(f=>{try{f()}catch(e){}})}
function subscribe(f){subs.add(f);return()=>subs.delete(f)}
function reset(){st=defaults();set({})}

function mkTrip(L,dir,date,special){const l=LINES[L];const di=dayIdx(date);const car=l.cars[((di%2)+2)%2];
 const id=L+(dir==='ida'?'I':'V')+'-'+date;const depMin=dir==='ida'?l.stops[0][1]:l.vDep;
 const dep=new Date(parse(date).getTime()+depMin*6e4);
 const cancelled=st.cancelledTrips.includes(id)||(st.scenario.tripCancelled&&id===SCEN_CANCEL);
 return {id,line:L,lineName:l.name,lineShort:l.short,dir,date,car,special:!!special,crew:crewFor(L,di),depMin,dep,cancelled,blocked:st.blockedTrips.includes(id),past:dep<NOW,
  route:dir==='ida'?l.short+' → Salta':'Salta → '+l.short}}
function getTrip(id){const L=id[0],dir=id[1]==='I'?'ida':'vuelta',date=id.slice(3);return mkTrip(L,dir,date,parse(date).getDay()===0)}
function tripsOn(date){const dow=parse(date).getDay();let out=[];
 if(dow!==0) out=[mkTrip('T','ida',date),mkTrip('O','ida',date),mkTrip('T','vuelta',date),mkTrip('O','vuelta',date)];
 else out=[mkTrip('T','vuelta',date,true),mkTrip('O','vuelta',date,true)];
 st.specialTrips.filter(x=>x.date===date).forEach(x=>{const id=x.line+(x.dir==='ida'?'I':'V')+'-'+date;if(!out.find(t=>t.id===id))out.push(mkTrip(x.line,x.dir,date,true))});
 return out}
function stopsOf(L,dir){const l=LINES[L];return dir==='ida'?l.stops.map(s=>s[0]):Object.keys(l.vStops)}
function stopMin(trip,stop){const l=LINES[trip.line];if(trip.dir==='ida'){const s=l.stops.find(x=>x[0]===stop)||l.stops[0];return s[1]}return trip.depMin}
function arrMin(trip,stop){const l=LINES[trip.line];return trip.dir==='ida'?l.arr:(l.vStops[stop]||1380)}
function when(trip,stop){const m=stopMin(trip,stop);const d=parse(trip.date);let note='';
 if(m<360){const p=parse(addDays(trip.date,-1));note='Salís el '+DOW[p.getDay()].toLowerCase()+' '+p.getDate()+' a la noche'}
 const a=arrMin(trip,stop);const arrDate=trip.dir==='ida'?trip.date:trip.date;
 return {date:dshort(trip.date),dateLong:dlong(trip.date),time:hm(m),note,arr:hm(a),arrLabel:(trip.dir==='ida'?'Llegada a Salta aprox. ':'Llegada a '+stop+' aprox. ')+hm(a)+' hs',full:dlong(trip.date)+', '+hm(m)+' hs'+(note?' ('+note.toLowerCase()+')':'')}}
function hoursUntil(trip,stop){const m=stopMin(trip,stop||null);return (parse(trip.date).getTime()+m*6e4-NOW)/36e5}

const genCache={};
const FREE_T=[7,18,31,44,53,58],FREE_O=[3,6,11,15,20,24,27,33,36,40,45,47,52,55,60];
function genSeats(trip){if(genCache[trip.id])return genCache[trip.id];
 const r=rng(hash(trip.id));const days=(trip.dep-NOW)/864e5;let rate;
 if(days<0)rate=.72+r()*.22;else if(days<1)rate=.75+r()*.15;else if(days<3)rate=.45+r()*.25;else if(days<8)rate=.2+r()*.3;else rate=.05+r()*.15;
 if(trip.id==='OI-2026-10-20')rate=.14;
 const stops=stopsOf(trip.line,trip.dir);const seats=[];
 for(let n=1;n<=60;n++){const cls=n<=48?'semi':'cama';let occ=CUD.includes(n)?r()<.3:r()<rate;
  if(trip.id===TONIGHT_T)occ=!FREE_T.includes(n);if(trip.id===TONIGHT_O)occ=!FREE_O.includes(n);
  let t=null;if(occ){const nombre=pick(r,FN),apellido=pick(r,LN),dn=String(Math.floor(20e6+r()*26e6));const stop=pick(r,stops);
   const ch=r();const channel=ch<.5?'Mostrador':ch<.8?'WhatsApp':'Online';
   const branch=channel==='Online'?'Web':channel==='WhatsApp'?'Salta Capital':(trip.dir==='ida'?STOP_BRANCH[stop]:'Salta Capital');
   const sl=SELLERS[branch];const seller=channel==='Online'?'—':(sl?pick(r,sl):'Encargado/a '+branch);
   const m=r();const method=channel==='Online'?(m<.35?'MercadoPago · Tarjeta de crédito':m<.6?'MercadoPago · Tarjeta de débito':m<.85?'MercadoPago · Dinero en cuenta':'MercadoPago · Efectivo'):channel==='WhatsApp'?'Transferencia':(m<.6?'Efectivo':m<.85?'Transferencia':'Mercado Pago');
   const cudT=CUD.includes(n)&&r()<.8;const fare=st.fares[trip.line][cls].ida;
   let created=trip.dep.getTime()-(1+r()*6*24)*36e5;if(created>NOW.getTime())created=NOW.getTime()-r()*6*864e5;
   const code=mkCode(trip.id+'#'+n);
   t={id:code+'-1',code,tripId:trip.id,seat:n,cls,floor:n<=48?'alta':'baja',nombre,apellido,dni:dn,nac:'',cud:cudT,stop,price:cudT?0:fare,channel,branch,seller,method:cudT?'Cortesía CUD':method,payStatus:channel==='Online'&&method.includes('Efectivo')&&!trip.past&&r()<.5?'pendiente':'aprobado',status:'activo',createdAt:Math.round(created),gen:true}}
  seats.push({n,cls,floor:n<=48?'alta':'baja',cud:CUD.includes(n),t})}
 genCache[trip.id]=seats;return seats}
function applyOv(t){const o=st.overrides[t.id];return o?Object.assign({},t,{status:o}):t}
function seatsFor(trip){const g=genSeats(trip);const pur=st.purchases.filter(p=>p.tripId===trip.id&&p.status==='activo');
 const sold=st.scenario.soldOut&&trip.id===TONIGHT_T;
 return g.map(s=>{let t=s.t?applyOv(s.t):null;if(t&&t.status!=='activo')t=null;const p=pur.find(x=>x.seat===s.n);if(p)t=p;
  return Object.assign({},s,{t,status:t?'ocupado':sold?'ocupado':'libre'})})}
function avail(trip){const s=seatsFor(trip);const f=x=>x.status==='libre';
 const semi=s.filter(x=>x.cls==='semi'&&f(x)).length,cama=s.filter(x=>x.cls==='cama'&&f(x)&&!x.cud).length,cud=s.filter(x=>x.cud&&f(x)).length;
 return {semi,cama,cud,total:semi+cama+cud,occ:60-(semi+cama+cud),pct:Math.round((60-(semi+cama+cud))/60*100)}}
function ticketsOf(trip){return seatsFor(trip).filter(s=>s.t).map(s=>s.t)}
function fare(L,cls,kind){return st.fares[L][cls][kind]}

function monthTrips(){const out=[];for(let i=0;i<31;i++)out.push(...tripsOn(addDays('2026-10-01',i)));return out}
let payCache=null,payVer=-1;
function allTickets(){const out=[];monthTrips().forEach(tr=>genSeats(tr).forEach(s=>{if(s.t)out.push(applyOv(s.t))}));st.purchases.forEach(p=>out.push(p));return out}
function payments(){if(payCache&&payVer===st.ver)return payCache;
 const g={};allTickets().forEach(t=>{if(t.gen&&t.createdAt>NOW.getTime())return;const k=t.code;if(!g[k]){const tr=getTrip(t.tripId);g[k]={code:k,date:t.createdAt,amount:0,channel:t.channel,method:t.method,status:t.payStatus||'aprobado',line:tr.lineName,lineId:tr.line,route:tr.route,tripDate:dshort(tr.date),branch:t.branch,seller:t.seller,payer:t.nombre+' '+t.apellido,dni:t.dni,pax:0,tickets:[]}}
  g[k].amount+=t.price;g[k].pax++;g[k].tickets.push(t)});
 const r=rng(77);for(let i=0;i<6;i++){const d=NOW.getTime()-r()*9*864e5;g['RX'+i]={code:mkCode('rx'+i),date:Math.round(d),amount:20000+(i%2)*5000,channel:'Online',method:'MercadoPago · Tarjeta de crédito',status:'rechazado',line:i%2?'Línea Orán':'Línea Tartagal',lineId:i%2?'O':'T',route:'—',tripDate:'—',branch:'Web',seller:'—',payer:pick(r,FN)+' '+pick(r,LN),dni:String(Math.floor(25e6+r()*2e7)),pax:1,tickets:[]}}
 payCache=Object.values(g).sort((a,b)=>b.date-a.date);payVer=st.ver;return payCache}
function findTickets(q){q=String(q||'').trim().toUpperCase().replace(/\./g,'');if(!q)return[];return allTickets().filter(t=>t.code===q||t.dni===q||t.id===q).map(applyOv)}
function lookup(code,id){code=String(code||'').trim().toUpperCase();id=String(id||'').trim().toLowerCase().replace(/\./g,'');
 return allTickets().filter(t=>t.code===code&&(t.dni===id||(t.email||'').toLowerCase()===id))}

function newCode(){return mkCode('n'+Date.now()+Math.random())}
function purchase(o){const code=newCode();const now=NOW.getTime()+ (st.purchases.length)*6e4;const tickets=[];let i=1;
 o.legs.forEach(leg=>{const tr=getTrip(leg.tripId);leg.seats.forEach((s,k)=>{const p=o.pax[k]||{};tickets.push({id:code+'-'+(i++),code,tripId:leg.tripId,seat:s.n,cls:s.cls,floor:s.n<=48?'alta':'baja',nombre:p.nombre||'Pasajero',apellido:p.apellido||String(k+1),dni:String(p.dni||'').replace(/\D/g,''),nac:p.nac||'',cud:!!p.cud,stop:leg.stop||p.stop,price:o.cortesia?0:leg.prices[k],channel:o.channel,branch:o.branch,seller:o.seller,method:o.method,payStatus:o.payStatus,status:'activo',createdAt:now,email:o.email,wa:o.wa,rt:!!o.rt})})});
 set(s=>({purchases:s.purchases.concat(tickets)}));return {code,tickets}}
function reprogram(t,newTripId,seat,by){const old=getTrip(t.tripId),nt=getTrip(newTripId);const pol=reprogQuote(t,nt,seat.cls);
 const nid=t.code+'-R'+Math.floor(Math.random()*900+100);const nt2=Object.assign({},t,{id:nid,tripId:newTripId,seat:seat.n,cls:seat.cls,floor:seat.n<=48?'alta':'baja',price:t.price+pol.diff,status:'activo',createdAt:NOW.getTime(),gen:false,reprogFrom:t.id});
 set(s=>{const ov=Object.assign({},s.overrides);let purchases=s.purchases;if(t.gen)ov[t.id]='reprogramado';else purchases=purchases.map(p=>p.id===t.id?Object.assign({},p,{status:'reprogramado'}):p);
  return {overrides:ov,purchases:purchases.concat([nt2]),changes:[{date:NOW.getTime()+6e4*s.changes.length,code:t.code,pax:t.nombre+' '+t.apellido,type:'Reprogramación',from:old.lineShort+' · '+dshort(old.date),to:nt.lineShort+' · '+dshort(nt.date),reason:by.reason||'A pedido del pasajero',fee:pol.fee+pol.diff,refund:0,channel:by.channel,branch:by.branch,user:by.user}].concat(s.changes)}});return nt2}
// Política comercial: retención según anticipación (sobre el precio del pasaje).
const RT_VALID_DAYS=14, REPROG_MIN_HOURS=3;
function retentionPct(h){return h>=48?10:h>=24?20:30}
const isCredit=t=>/crédito/i.test(t.method||'');
function reprogQuote(t,nt,cls){const tr=getTrip(t.tripId);const h=hoursUntil(tr,t.stop);const free=tr.cancelled;const np=fare(nt.line,cls,'ida');const diff=t.cud?0:Math.max(0,np-(t.price||0));
 if(free) return {allowed:true,reason:'',hours:h,ret:0,fee:0,diff,total:diff,free:true};
 const reason=t.rt?'rt':h<REPROG_MIN_HOURS?'late':'';const ret=retentionPct(h);const fee=Math.round((t.price||0)*ret/100);
 return {allowed:!reason,reason,hours:h,ret,fee,diff,total:fee+diff,free:false}}
function cancelQuote(t){const tr=getTrip(t.tripId);const h=hoursUntil(tr,t.stop);const price=t.price||0;
 if(tr.cancelled) return {allowed:true,reason:'',pct:100,ret:0,hours:h,refund:price,fee:0,company:true};
 const reason=h<=0?'past':t.rt?'rt':isCredit(t)?'credito':'';const ret=retentionPct(h);
 return {allowed:!reason,reason,pct:100-ret,ret,hours:h,refund:reason?0:Math.round(price*(100-ret)/100),fee:Math.round(price*ret/100),company:false}}
function cancelTicket(t,by){const q=cancelQuote(t);const tr=getTrip(t.tripId);
 set(s=>{const ov=Object.assign({},s.overrides);let purchases=s.purchases;if(t.gen)ov[t.id]='cancelado';else purchases=purchases.map(p=>p.id===t.id?Object.assign({},p,{status:'cancelado'}):p);
  return {overrides:ov,purchases,changes:[{date:NOW.getTime()+6e4*s.changes.length,code:t.code,pax:t.nombre+' '+t.apellido,type:'Cancelación',from:tr.lineShort+' · '+dshort(tr.date),to:'—',reason:by.reason||'A pedido del pasajero',fee:q.fee,refund:q.refund,channel:by.channel,branch:by.branch,user:by.user}].concat(s.changes)}});return q}
function cancelTrip(tripId,reason,by){const tr=getTrip(tripId);const n=ticketsOf(tr).length;
 set(s=>({cancelledTrips:s.cancelledTrips.concat([tripId]),changes:[{date:NOW.getTime()+6e4*s.changes.length,code:'—',pax:n+' pasajeros',type:'Viaje cancelado',from:tr.route+' · '+dshort(tr.date),to:'—',reason,fee:0,refund:ticketsOf(tr).reduce((a,t)=>a+t.price,0),channel:'Empresa',branch:'Todas',user:by||'Ramón Saravia'}].concat(s.changes)}));return n}
function validate(qr,tripId){const t=allTickets().find(x=>x.code===qr||x.id===qr);if(!t)return {res:'invalido'};const tk=applyOv(t);
 if(tk.status!=='activo')return {res:'invalido',t:tk};if(tk.tripId!==tripId)return {res:'otro',t:tk,trip:getTrip(tk.tripId)};
 if(st.checkins[tk.id]==='abordo')return {res:'usado',t:tk};return {res:'valido',t:tk}}
function qr(str){const r=rng(hash(str));const N=25,cells=[];
 const fp=(x,y,ox,oy)=>{const dx=x-ox,dy=y-oy;if(dx<0||dy<0||dx>6||dy>6)return null;return dx===0||dy===0||dx===6||dy===6||(dx>=2&&dx<=4&&dy>=2&&dy<=4)};
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){let v=fp(x,y,0,0);if(v===null)v=fp(x,y,18,0);if(v===null)v=fp(x,y,0,18);
  if(v===null){if((x<8&&y<8)||(x>16&&y<8)||(x<8&&y>16))v=false;else v=r()<.48}cells.push(v?'#1D1A1C':'transparent')}return cells}
function view(t){const tr=getTrip(t.tripId);const w=when(tr,t.stop);const isIda=tr.dir==='ida';
 return {id:t.id,code:t.code,name:t.nombre+' '+t.apellido,dni:dni(t.dni),line:tr.lineName,route:isIda?t.stop+' → Salta':'Salta → '+t.stop,
  date:w.dateLong,time:w.time,note:w.note,boardStop:isIda?t.stop:'Salta (Terminal)',dest:isIda?'Salta (Terminal)':t.stop,arr:w.arr,
  floor:t.floor==='alta'?'Planta alta':'Planta baja',cls:t.cls==='semi'?'Semicama':'Cama',seat:t.seat,car:'N° '+tr.car,price:t.price===0?'Cortesía CUD':money(t.price),
  status:t.status,rt:!!t.rt,cancelled:tr.cancelled,qr:qr(t.id),services:SERVICES.join(' · '),tripId:tr.id,email:t.email||'',wa:t.wa||''}}
const fmtDate=ts=>dtf(new Date(ts));
const sameDay=(ts,d)=>{const a=new Date(ts);return a.getFullYear()===d.getFullYear()&&a.getMonth()===d.getMonth()&&a.getDate()===d.getDate()};
const SD={NOW,TODAY:iso(NOW),DOW,DOWS,MON,MONS,LINES,BRANCHES,SERVICES,USERS,CUD,TONIGHT_T,TONIGHT_O,SCEN_CANCEL,STOP_BRANCH,
 get:S,set,subscribe,reset,iso,parse,addDays,hm,money,dni,dshort,dlong,fmtDate,sameDay,hash,rng,
 mkTrip,getTrip,tripsOn,stopsOf,stopMin,arrMin,when,hoursUntil,seatsFor,avail,ticketsOf,fare,monthTrips,allTickets,payments,findTickets,lookup,
 purchase,reprogram,reprogQuote,cancelQuote,retentionPct,isCredit,RT_VALID_DAYS,REPROG_MIN_HOURS,cancelTicket,cancelTrip,validate,qr,view,applyOv};
export default SD;
