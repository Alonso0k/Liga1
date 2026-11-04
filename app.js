'use strict';
/* ================= utilidades ================= */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
const fmt=n=>Math.round(n).toLocaleString('es-CL');
const fmt1=n=>(Math.round(n*10)/10).toLocaleString('es-CL');
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const lc=s=>s?s.charAt(0).toLowerCase()+s.slice(1):s;
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function parseD(s){const [y,m,d]=s.split('-').map(Number);return Date.UTC(y,m-1,d)}
function fmtD(ms){const d=new Date(ms);return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')+'-'+String(d.getUTCDate()).padStart(2,'0')}
function addDays(s,n){return fmtD(parseD(s)+n*864e5)}
function diffDays(a,b){return Math.round((parseD(b)-parseD(a))/864e5)}
function dow(s){return new Date(parseD(s)).getUTCDay()}
const MESES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MESES_L=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DIAS=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
function niceDate(s){const d=new Date(parseD(s));return d.getUTCDate()+' '+MESES[d.getUTCMonth()]}
function longDate(s){const d=new Date(parseD(s));return DIAS[d.getUTCDay()]+' '+d.getUTCDate()+' de '+MESES_L[d.getUTCMonth()]}
function mondayOf(s){const w=dow(s);return addDays(s,-((w+6)%7))}
function hashSeed(s){let h=1779033703^s.length;for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353);h=h<<13|h>>>19}h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return (h^h>>>16)>>>0}
function rngFor(seed){let a=hashSeed(seed);return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function wpick(r,items,wf){const ws=items.map(wf);const tot=ws.reduce((a,b)=>a+b,0);if(tot<=0)return null;let x=r()*tot;for(let i=0;i<items.length;i++){x-=ws[i];if(x<=0)return items[i]}return items[items.length-1]}
function shuffle(r,a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

/* ================= datos ================= */
const PALETTE=['#3987e5','#d95926','#199e70','#c98500','#d55181','#9085e9'];
const OTHER_COLOR='#7d86a3';
const RARITIES=['común','poco común','raro','épico','legendario','mítico'];
const RK={'común':'c','poco común':'u','raro':'r','épico':'e','legendario':'l','mítico':'m'};
const RAR_BONUS={'común':0,'poco común':20,'raro':50,'épico':100,'legendario':200,'mítico':400};
const TYPE_NAME={cupon:'Cupón',vale:'Vale',item:'Ítem',insignia:'Insignia',titulo:'Título',cronica:'Crónica',tema:'Tema',pp:'Puntos'};

const MUSCLES={pecho_sup:'Pecho superior',pecho_medio:'Pecho medio',pecho_inf:'Pecho inferior',deltoide_ant:'Hombro frontal',deltoide_lat:'Hombro lateral',deltoide_post:'Hombro posterior',triceps:'Tríceps',biceps:'Bíceps',antebrazo:'Antebrazo',serrato:'Serrato',abdomen:'Abdomen',oblicuos:'Oblicuos',trapecio:'Trapecio',dorsal:'Dorsal ancho',romboides:'Romboides',lumbar:'Zona lumbar',gluteos:'Glúteos',cuadriceps:'Cuádriceps',isquios:'Isquiotibiales',gemelos:'Gemelos'};
const MGROUP={empuje:['pecho_sup','pecho_medio','pecho_inf','deltoide_ant','deltoide_lat','triceps'],tiron:['dorsal','romboides','trapecio','deltoide_post','biceps','antebrazo'],core:['abdomen','oblicuos','lumbar','serrato'],piernas:['cuadriceps','isquios','gluteos','gemelos']};
const MGROUP_NAME={empuje:'Empuje',tiron:'Tirón',core:'Core',piernas:'Piernas'};
const MGROUP_COLOR={empuje:'#3987e5',tiron:'#d95926',core:'#199e70',piernas:'#c98500'};

const EQUIP=[['mochila','Mochila con peso'],['mancuernas','Mancuernas'],['barra','Barra de dominadas'],['maquinas','Máquinas de gimnasio'],['trotadora','Trotadora']];
const EX={
 normal:{name:'Flexiones normales',short:'Normales',metric:'reps',ppu:1,muscles:{pecho_medio:1,pecho_sup:.4,pecho_inf:.4,deltoide_ant:.7,triceps:.7,serrato:.4,abdomen:.35,oblicuos:.2},tip:'Manos bajo los hombros y cuerpo en tabla.'},
 incline:{name:'Flexiones inclinadas',short:'Inclinadas',metric:'reps',ppu:.7,muscles:{pecho_inf:1,pecho_medio:.6,deltoide_ant:.4,triceps:.6,serrato:.3,abdomen:.25},tip:'Manos elevadas: más fáciles, cargan el pecho bajo.'},
 decline:{name:'Flexiones declinadas',short:'Declinadas',metric:'reps',ppu:1.3,muscles:{pecho_sup:1,deltoide_ant:.9,pecho_medio:.5,triceps:.6,serrato:.5,abdomen:.4,trapecio:.2},tip:'Pies elevados: más duras, cargan pecho alto y hombro.'},
 diamond:{name:'Flexiones diamante',short:'Diamante',metric:'reps',ppu:1.2,muscles:{triceps:1,pecho_medio:.6,deltoide_ant:.5,abdomen:.3}},
 squat:{name:'Sentadillas',short:'Sentadillas',metric:'reps',ppu:.6,muscles:{cuadriceps:1,gluteos:.9,isquios:.4,lumbar:.2,abdomen:.2,gemelos:.2},tip:'Rodillas en línea con los pies, espalda neutra.'},
 dip:{name:'Fondos en silla o banco',short:'Fondos',metric:'reps',ppu:.8,muscles:{triceps:1,pecho_inf:.5,deltoide_ant:.5}},
 pullup:{name:'Dominadas',short:'Dominadas',metric:'reps',ppu:2.5,eq:['barra'],muscles:{dorsal:1,biceps:.8,romboides:.6,trapecio:.4,antebrazo:.5,deltoide_post:.4,abdomen:.2}},
 row_bp:{name:'Remo unilateral con peso',short:'Remo con peso',metric:'reps',unit:'reps por brazo',ppu:.8,eq:['mochila','mancuernas'],muscles:{dorsal:1,romboides:1,trapecio:.5,deltoide_post:.7,biceps:.7,antebrazo:.4,lumbar:.3}},
 curl:{name:'Curl de bíceps con peso',short:'Curl',metric:'reps',ppu:.4,eq:['mochila','mancuernas'],muscles:{biceps:1,antebrazo:.5}},
 lat_raise:{name:'Elevaciones laterales con peso',short:'Elev. laterales',metric:'reps',ppu:.5,eq:['mochila','mancuernas'],muscles:{deltoide_lat:1,deltoide_ant:.3,trapecio:.5}},
 climber:{name:'Escaladores',short:'Escaladores',metric:'reps',ppu:.25,muscles:{abdomen:.9,oblicuos:.5,cuadriceps:.5,deltoide_ant:.3,gemelos:.2}},
 plank:{name:'Plancha',short:'Plancha',metric:'secs',ppu:.3,muscles:{abdomen:1,oblicuos:.6,lumbar:.4,deltoide_ant:.3,gluteos:.3}},
 crunch:{name:'Abdominales',short:'Abdominales',metric:'reps',ppu:.4,muscles:{abdomen:1,oblicuos:.4}},
 lunge:{name:'Estocadas adelante y atrás',short:'Estocadas',metric:'reps',ppu:.5,muscles:{cuadriceps:1,gluteos:1,isquios:.5,gemelos:.3,abdomen:.2}},
 glute_bridge:{name:'Puente de glúteos',short:'Puente',metric:'reps',ppu:.4,muscles:{gluteos:1,isquios:.5,lumbar:.3}},
 burpee:{name:'Burpees',short:'Burpees',metric:'reps',ppu:1.5,muscles:{pecho_medio:.5,cuadriceps:.7,gluteos:.5,deltoide_ant:.4,triceps:.4,abdomen:.5,gemelos:.4}},
 m_chest:{name:'Press de banca en máquina',short:'Press máquina',metric:'load',ppu:1/40,eq:['maquinas'],muscles:{pecho_medio:1,pecho_sup:.4,deltoide_ant:.6,triceps:.7}},
 m_row:{name:'Remo en máquina',short:'Remo máquina',metric:'load',ppu:1/40,eq:['maquinas'],muscles:{dorsal:.8,romboides:1,trapecio:.6,deltoide_post:.7,biceps:.6,antebrazo:.3}},
 m_pulldown:{name:'Jalón al pecho',short:'Jalón',metric:'load',ppu:1/40,eq:['maquinas'],muscles:{dorsal:1,biceps:.7,romboides:.5,deltoide_post:.4,antebrazo:.4}},
 treadmill:{name:'Trotadora',short:'Trotadora',metric:'cardio',ppu:1,eq:['trotadora'],muscles:{cuadriceps:.7,isquios:.6,gemelos:.9,gluteos:.6}},
 run:{name:'Correr al aire libre',short:'Correr',metric:'cardio',ppu:1,muscles:{cuadriceps:.7,isquios:.6,gemelos:.9,gluteos:.6}}
};
const METRIC_LABEL={reps:'repeticiones',secs:'segundos',load:'series × reps × kg',cardio:'minutos y km'};

const BANKS=[['bancochile','Banco de Chile / Edwards'],['santander','Santander'],['bci','BCI'],['bancoestado','BancoEstado'],['scotiabank','Scotiabank'],['itau','Itaú'],['security','Security'],['bice','BICE'],['falabella','Banco Falabella / CMR'],['ripley','Banco Ripley'],['cencosud','Cencosud Scotiabank'],['consorcio','Banco Consorcio'],['internacional','Banco Internacional'],['coopeuch','Coopeuch'],['liderbci','Lider BCI'],['tenpo','Tenpo'],['mach','MACH'],['mercadopago','Mercado Pago'],['copecpay','Copec Pay']];
const BANK_NAME=Object.fromEntries(BANKS);
const PREFS=[['restaurantes','Restaurantes'],['comida_rapida','Comida rápida'],['delivery','Delivery'],['cafe','Café y pastelería'],['combustible','Combustible'],['deporte','Ropa y equipo deportivo'],['moda','Ropa y moda'],['tecnologia','Tecnología'],['entretencion','Cine y entretención'],['panoramas','Eventos y panoramas gratis'],['super','Supermercado'],['bienestar','Salud y bienestar'],['viajes','Viajes'],['mascotas','Mascotas']];
const BODY=[['ecto','Ectomorfo','Delgado, de huesos finos; le cuesta ganar masa.'],['meso','Mesomorfo','Atlético; gana músculo con relativa facilidad.'],['endo','Endomorfo','Estructura ancha; gana peso con facilidad.'],['nose','No sé','Usaré un modelo neutro.']];
const AGES=[['<25','Menos de 25'],['25-34','25 a 34'],['35-44','35 a 44'],['45+','45 o más']];
const EXPS=[['cero','Estoy partiendo','Entreno poco o nada hace tiempo.'],['aveces','Entreno a veces','Algunas semanas sí, otras no.'],['regular','Entreno regularmente','Varias veces por semana hace meses.']];
const MODES=[['relajado','Relajado','Castigos suaves: solo multas chicas y efectos leves.'],['normal','Normal','Castigos variados, como en la liga original.'],['hardcore','Hardcore','Castigos más duros y más frecuentes. Para valientes.']];

const TIERS=[
 {name:'Novato',metal:'Bronce',ring:['#f3bf98','#b8693a','#5c2c14'],core:['#8f6cff','#2c1a74'],lore:'El suelo todavía manda. Por ahora.'},
 {name:'Iniciado',metal:'Plata',ring:['#f6f8fc','#a2adc3','#4a556f'],core:['#6c8fd0','#18264a'],lore:'Ya negocias con la gravedad.'},
 {name:'Contendiente',metal:'Oro',ring:['#ffe9a8','#dda12a','#7a4a08'],core:['#4d8dff','#0f2f86'],lore:'Tus articulaciones firmaron contrato.'},
 {name:'Élite',metal:'Platino glaciar',ring:['#eefcff','#8fd3f5','#2a6a8f'],core:['#38a0ff','#0b3ea8'],lore:'El ejercicio dejó de ser rutina y pasó a ser idioma.'},
 {name:'Titán',metal:'Amatista',ring:['#f1e6ff','#b18cff','#552cae'],core:['#7a55ff','#250d86'],lore:'El suelo te pide permiso.'},
 {name:'Campeón',metal:'Esmeralda',ring:['#dcfff1','#3fd39b','#0b6446'],core:['#ffb347','#a44200'],lore:'Tu esfuerzo tiene su propia gravedad.'},
 {name:'Mítico',metal:'Rubí',ring:['#ffdbe4','#ff5a82','#86102e'],core:['#ff4040','#5e000f'],lore:'Se cuentan historias sobre tus entrenamientos.'},
 {name:'Leyenda',metal:'Prisma',ring:['#ffffff','#c9a7ff','#ff6fb0'],core:['#ff5a8a','#3b2bd1'],lore:'El suelo empuja de vuelta. Y pierde.'}
];
const THRESH=[0,240,740,1500,2450,3750,5300,7150,9250,11750,14500,17750,21250,25000,29250,33750,38750,44000,49500,55500,61750,68250];
const MAXL=21;
const D_I=Array.from({length:22},(_,i)=>205*Math.pow(i/21,1.6));
const tierOf=i=>i>=MAXL?7:Math.floor(i/3);
function levelName(i){return i>=MAXL?'Leyenda':TIERS[Math.floor(i/3)].name+' '+['I','II','III'][i%3]}
function levelFromPts(p){let L=0;for(let i=0;i<THRESH.length;i++)if(p>=THRESH[i])L=i;return L}
const DIV_RAR=['común','poco común','raro','raro','épico','épico','legendario','legendario'];
const TIER_REWARDS={1:['tit_aprendiz','itm_escudo'],2:['ins_martillo','cup:raro'],3:['tem_forja','cro_3'],4:['tit_ultimo','itm_elixir'],5:['tem_aurora','ins_fenix'],6:['tit_domador','vale_gran'],7:['tit_leyenda','ins_corona','tem_prisma']};

const CATALOG=[
 {id:'ins_primer',type:'insignia',name:'Primer Empuje',icon:'🌱',rarity:'común',desc:'Entraste a la liga. Todo rango empezó en el suelo.'},
 {id:'ins_codo',type:'insignia',name:'Codo de Hierro',icon:'🔩',rarity:'común',desc:'Las bisagras aguantan. Para eso están.'},
 {id:'ins_obra',type:'insignia',name:'Cuerpo en Obra',icon:'🏗️',rarity:'común',desc:'Andamios montados, faena en curso.'},
 {id:'ins_gravedad',type:'insignia',name:'Gravedad Negociada',icon:'🪐',rarity:'poco común',desc:'Le pediste rebaja a la gravedad. Te hizo un 2 %.'},
 {id:'ins_metronomo',type:'insignia',name:'Metrónomo',icon:'⏱️',rarity:'poco común',desc:'Ritmo parejo y bajada controlada, como reloj suizo.'},
 {id:'ins_triceps',type:'insignia',name:'Músculo de Contrabando',icon:'🦾',rarity:'raro',desc:'Nadie sabe de dónde salió. Nadie pregunta.'},
 {id:'ins_ola',type:'insignia',name:'Ola Expansiva',icon:'🌊',rarity:'raro',desc:'Cada repetición empuja un poco más lejos.'},
 {id:'ins_martillo',type:'insignia',name:'Martillo del Suelo',icon:'🔨',rarity:'raro',desc:'El piso ya se sabe tu nombre.',only:true},
 {id:'ins_forja',type:'insignia',name:'Corazón de Forja',icon:'🔥',rarity:'épico',desc:'Constancia templada a fuego lento.'},
 {id:'ins_fenix',type:'insignia',name:'Ala de Fénix',icon:'🪶',rarity:'épico',desc:'Fallaste, volviste y volviste mejor.'},
 {id:'ins_ojo',type:'insignia',name:'Ojo del Titán',icon:'👁️',rarity:'legendario',desc:'Ves la próxima repetición antes de hacerla.'},
 {id:'ins_corona',type:'insignia',name:'Corona Prisma',icon:'💠',rarity:'mítico',desc:'Solo existe en la cima: 68.250 PP de puro esfuerzo.',only:true},
 {id:'tit_norinde',type:'titulo',name:'El que no se rinde',icon:'🏷️',rarity:'común',desc:'Título equipable. Para quien vuelve aunque el día pese.'},
 {id:'tit_aprendiz',type:'titulo',name:'Aprendiz de Gravedad',icon:'🏷️',rarity:'común',desc:'Título equipable. Se entrega al llegar a Iniciado.',only:true},
 {id:'tit_constante',type:'titulo',name:'Señor de la Constancia',icon:'🏷️',rarity:'poco común',desc:'Título equipable. Un día a la vez.'},
 {id:'tit_arquitecto',type:'titulo',name:'Arquitecto del Cuerpo',icon:'🏷️',rarity:'poco común',desc:'Título equipable. Planos aprobados, obra avanzando.'},
 {id:'tit_rebelde',type:'titulo',name:'Genética Rebelde',icon:'🏷️',rarity:'raro',desc:'Título equipable. La genética opinó; tú decidiste.'},
 {id:'tit_duque',type:'titulo',name:'Duque del Suelo',icon:'🏷️',rarity:'raro',desc:'Título equipable. Honor intacto, rodillas también.'},
 {id:'tit_ultimo',type:'titulo',name:'El Último en Bajar',icon:'🏷️',rarity:'épico',desc:'Título equipable. Se entrega al llegar a Titán.',only:true},
 {id:'tit_martillo',type:'titulo',name:'Martillo de la Constancia',icon:'🏷️',rarity:'épico',desc:'Título equipable. Golpe a golpe, día a día.'},
 {id:'tit_domador',type:'titulo',name:'Domador del Suelo',icon:'🏷️',rarity:'legendario',desc:'Título equipable. Se entrega al llegar a Mítico.',only:true},
 {id:'tit_imparable',type:'titulo',name:'El Imparable',icon:'🏷️',rarity:'legendario',desc:'Título equipable. Ni la flojera te alcanza.'},
 {id:'tit_leyenda',type:'titulo',name:'Leyenda Viva',icon:'🏷️',rarity:'mítico',desc:'Título equipable. Solo para quien llega a Leyenda.',only:true},
 {id:'cro_1',type:'cronica',name:'Crónica I · El Primer Suelo',icon:'📖',rarity:'común',desc:'Al principio solo había un piso frío y alguien mirándolo con desconfianza. El piso no se movió. Esa persona sí.'},
 {id:'cro_2',type:'cronica',name:'Crónica II · El Pacto de las Articulaciones',icon:'📖',rarity:'poco común',desc:'Codos y rodillas firmaron un acuerdo: no se quejarían si la técnica era limpia. Nadie leyó la letra chica: «todos los días».'},
 {id:'cro_3',type:'cronica',name:'Crónica III · La Rebelión del Cuerpo',icon:'📖',rarity:'raro',desc:'Le dijeron que su cuerpo no estaba hecho para ganar. Comió, durmió, volvió al suelo. La genética sigue esperando su revancha.'},
 {id:'cro_4',type:'cronica',name:'Crónica IV · El Valle del Esfuerzo',icon:'📖',rarity:'raro',desc:'Más allá de la comodidad empieza el valle donde el orgullo queda abajo. Pocos cruzan. Menos vuelven contándolo.'},
 {id:'cro_5',type:'cronica',name:'Crónica V · La Forja',icon:'📖',rarity:'épico',desc:'Cada sesión fue un martillazo. Ninguno parecía importar. Juntos armaron una coraza.'},
 {id:'cro_6',type:'cronica',name:'Crónica VI · El Trono de Gravedad',icon:'📖',rarity:'legendario',desc:'Dicen que en la cima hay un trono hecho de repeticiones. Para sentarse hay que hacer una más.'},
 {id:'itm_escudo',type:'item',name:'Escudo de Rango',icon:'🛡️',rarity:'raro',desc:'Bloquea automáticamente la próxima penalización de una misión fallida.'},
 {id:'itm_elixir',type:'item',name:'Elixir de Poder',icon:'⚗️',rarity:'raro',desc:'Actívalo y tus puntos por entrenamiento de hoy valen ×1,5.'},
 {id:'itm_comodin',type:'item',name:'Comodín de Racha',icon:'🃏',rarity:'poco común',desc:'Cuenta un día sin entrenar (ayer u hoy) como día de racha.'},
 {id:'itm_pergamino',type:'item',name:'Pergamino de Cambio',icon:'📜',rarity:'poco común',desc:'Un cambio de objetivo extra para hoy.'},
 {id:'itm_dado',type:'item',name:'Dado del Destino',icon:'🎲',rarity:'poco común',desc:'Vuelve a tirar las misiones de hoy que todavía no aceptas.'},
 {id:'itm_llave',type:'item',name:'Llave de Cofre',icon:'🗝️',rarity:'raro',desc:'Abre un cofre con una recompensa al azar, poco común o mejor.'},
 {id:'itm_indulto',type:'item',name:'Indulto',icon:'⚖️',rarity:'épico',desc:'Abandona una misión aceptada de hoy sin penalización.'},
 {id:'vale_antojo',type:'vale',name:'Vale: antojo sin culpa',icon:'🍫',rarity:'común',days:14,desc:'Un dulce o lo que se te antoje. Sin culpa.'},
 {id:'vale_episodio',type:'vale',name:'Vale: un episodio extra',icon:'📺',rarity:'común',days:7,desc:'Uno más. Solo uno. Te lo ganaste.'},
 {id:'vale_sueno',type:'vale',name:'Vale: 30 minutos más de sueño',icon:'😴',rarity:'común',days:7,desc:'Dormir también construye músculo.'},
 {id:'vale_delivery',type:'vale',name:'Vale: pedir delivery',icon:'🛵',rarity:'poco común',days:21,desc:'Una noche sin cocinar. Combínalo con un cupón de tu inventario.'},
 {id:'vale_cine',type:'vale',name:'Vale: salida al cine',icon:'🎬',rarity:'raro',days:30,desc:'Película a elección, cabritas incluidas.'},
 {id:'vale_descanso',type:'vale',name:'Vale: día libre sin culpa',icon:'🛋️',rarity:'raro',days:14,desc:'Un día sin entrenar y sin remordimiento. No protege la racha: para eso está el Comodín.'},
 {id:'vale_accesorio',type:'vale',name:'Vale: accesorio de entrenamiento',icon:'🎒',rarity:'épico',days:45,desc:'Botella, bandas elásticas, guantes… elige uno y cómpratelo.'},
 {id:'vale_comida',type:'vale',name:'Vale: comida en tu lugar favorito',icon:'🍣',rarity:'épico',days:30,desc:'Mesa en tu lugar favorito. Revisa si algún cupón del inventario aplica.'},
 {id:'vale_gran',type:'vale',name:'Vale: el gran premio',icon:'🎁',rarity:'legendario',days:60,desc:'Eso que vienes queriendo hace tiempo. Te lo ganaste a pulso.'},
 {id:'tem_forja',type:'tema',name:'Tema Forja',icon:'🟠',rarity:'raro',accent:['#ff8a4c','#b3431a'],desc:'Cambia el acento de la app a naranja de fragua.'},
 {id:'tem_aurora',type:'tema',name:'Tema Aurora',icon:'🟢',rarity:'épico',accent:['#45e3b5','#0f7a5c'],desc:'Acento verde aurora austral.'},
 {id:'tem_abisal',type:'tema',name:'Tema Abisal',icon:'🔵',rarity:'épico',accent:['#4cc3ff','#165b9e'],desc:'Acento azul de fosa marina.'},
 {id:'tem_oro',type:'tema',name:'Tema Oro Viejo',icon:'🟡',rarity:'legendario',accent:['#ecc15a','#8a6113'],desc:'Acento oro de trofeo antiguo.'},
 {id:'tem_prisma',type:'tema',name:'Tema Prisma',icon:'🌈',rarity:'mítico',accent:['#d58cff','#ff5a9a'],desc:'Acento prisma. Solo para Leyendas.',only:true}
];
const TYPE_W={cupon:30,vale:24,item:20,insignia:10,titulo:9,cronica:6,tema:5};
const MINE_RAR=['poco común','raro','épico'];
function catalogAll(){const mine=((S&&S.profile&&S.profile.selfRewards)||[]).map((t,i)=>t&&t.trim()?{id:'mine_'+i,type:'vale',name:'Vale: '+t.trim(),icon:['🎯','💎','👑'][i],rarity:MINE_RAR[i],days:[21,30,45][i],desc:'Tu autopremio personal. Canjéalo cuando quieras.',mine:true}:null).filter(Boolean);return CATALOG.concat(mine)}
function catById(id){return catalogAll().find(c=>c.id===id)||null}

/* ================= estado global ================= */
let S=null,LOGS={},CAT=[],STORE='cargando',BOOTED=false,READY=false;
let D=null;
const UI={view:'inicio',regDate:null,extraRows:[],analysis:null,evoEx:null,musPeriod:7,musMode:'heat',musSel:null,pokeF:'todos',featF:'todas',reveals:[],confirm:null,lastLevel:null,customDraft:null,ob:null,rank:[]};

/* ================= ejercicios del usuario ================= */
function exDef(id){return EX[id]||(S&&S.customEx&&S.customEx[id])||null}
function tracked(){return(S&&S.tracked)||[]}
function exAvailable(id){const X=exDef(id);if(!X)return false;if(!X.eq)return true;const eq=(S&&S.profile&&S.profile.equip)||[];return X.eq.some(e=>eq.includes(e))}
function exColor(id){const i=tracked().indexOf(id);if(i>=0&&i<6)return PALETTE[i];const o=((S&&S.exOrder)||[]).filter(x=>!tracked().includes(x));const j=o.indexOf(id);const slot=tracked().length+j;return j>=0&&slot<6?PALETTE[slot]:OTHER_COLOR}
function noteExUse(id){S.exOrder=S.exOrder||[];if(!S.exOrder.includes(id))S.exOrder.push(id)}
function scale(){return(S&&S.profile&&S.profile.ppScale)||1}
function rawPts(id,e){const X=exDef(id);if(!X||!e)return 0;switch(X.metric){case'reps':return(+e.reps||0)*X.ppu;case'secs':return(+e.secs||0)*X.ppu;case'load':return(+e.sets||0)*(+e.reps||0)*Math.max(+e.kg||0,10)*X.ppu;case'cardio':return(+e.km||0)*10+(+e.min||0)*.4}return 0}
function entryPts(id,e){return rawPts(id,e)*scale()}
function valOf(L,ex){const X=exDef(ex);if(!X||!L||!L.ex||!L.ex[ex])return 0;return valEntry(ex,L.ex[ex])}
function valEntry(ex,e){const X=exDef(ex);if(!X||!e)return 0;switch(X.metric){case'reps':return+e.reps||0;case'secs':return+e.secs||0;case'load':return(+e.sets||0)*(+e.reps||0)*Math.max(+e.kg||0,1);case'cardio':return+e.min||0}return 0}
function valPtsRaw(ex,v){const X=exDef(ex);if(!X)return 0;if(X.metric==='cardio')return v*.8;if(X.metric==='load')return v*X.ppu;return v*X.ppu}
function hasSession(L){return!!L&&Object.entries(L.ex||{}).some(([k,e])=>entryPts(k,e)>0)}
function unitOf(ex){const X=exDef(ex);if(!X)return'';return{reps:X.unit||'reps',secs:'s',load:'vol.',cardio:'min'}[X.metric]}
function entryText(id,e){const X=exDef(id);if(!X||!e)return'';switch(X.metric){case'reps':return(+e.reps||0)+(X.unit?' '+X.unit:' reps');case'secs':return(+e.secs||0)+' s';case'load':return(+e.sets||0)+'×'+(+e.reps||0)+(e.kg?' · '+e.kg+' kg':'');case'cardio':return(+e.min||0)+' min'+(e.km?' · '+fmt1(+e.km)+' km':'')}return''}
function goalText(ex,t){const X=exDef(ex);const n=lc(X.name);switch(X.metric){case'reps':return X.unit?`Haz ${t} ${X.unit} de ${n} hoy`:`Haz ${t} ${n} hoy`;case'secs':return`Acumula ${t} s de ${n} hoy`;case'load':return`Mueve ${fmt(t)} de volumen (series × reps × kg) en ${n} hoy`;case'cardio':return`Suma ${t} minutos de ${n} hoy`}return''}
function roundNice(v,metric){if(metric==='secs')return Math.round(v/5)*5;if(metric==='load')return Math.round(v/10)*10;return Math.round(v)}
function effectOn(type,d){return(S.effects||[]).some(e=>e.type===type&&!e.consumed&&d>=e.from&&(!e.to||d<=e.to))}
function activeEffects(d){return(S.effects||[]).filter(e=>!e.consumed&&d>=e.from&&(!e.to||d<=e.to))}

/* ================= modelo personalizado =================
   V(u) = C − (C − b)·e^(−k·u), b = base declarada al entrar a la liga.
   C (techo de volumen diario) y k (velocidad) dependen de tipo de ejercicio, experiencia,
   tipo de cuerpo, IMC y edad. Cada sesión suma eficiencia según descanso previo:
   diario 0,85 · cada 2–3 días 1,0 · cada 4 días 0,95 · >4 días resta 0,6 u/día. */
const K0=.0104;
function effGap(g){if(g<=1)return .85;if(g<=3)return 1;if(g<=4)return .95;return .9}
const PARAM_CACHE={};
function baseVal(ex){const b=S.profile&&S.profile.base&&S.profile.base[ex];return b?valEntry(ex,b):0}
function exParams(ex){
  const key=ex+'|'+JSON.stringify(S.profile.base[ex]||{})+'|'+S.profile.exp+S.profile.body+S.profile.age+S.profile.weight+S.profile.height;
  if(PARAM_CACHE[key])return PARAM_CACHE[key];
  const X=exDef(ex);const P=S.profile;let b=baseVal(ex);if(b<=0)b={reps:5,secs:20,load:100,cardio:10}[X.metric];
  const Mm={reps:7.4,secs:5,load:2.5,cardio:3}[X.metric];
  const expF={cero:1,aveces:.8,regular:.6}[P.exp]||1;
  const bodyF={ecto:.95,meso:1.05,endo:.95,nose:1}[P.body]||1;
  const bmi=P.weight&&P.height?P.weight/Math.pow(P.height/100,2):23;
  const bmiF=X.metric==='reps'&&bmi>27?.9:1;
  const minGain={reps:20,secs:60,load:b*.3,cardio:20}[X.metric];
  const C=Math.max(b*Mm*expF*bodyF*bmiF,b+minGain);
  const ageF={'<25':1.05,'25-34':1,'35-44':.95,'45+':.9}[P.age]||1;
  const k=K0*ageF*({cero:1.1,aveces:1,regular:.85}[P.exp]||1);
  const ref=[0];for(let i=1;i<22;i++){const v=roundNice(C-(C-b)*Math.exp(-k*D_I[i]*.85),X.metric);const step=X.metric==='secs'?5:X.metric==='load'?10:1;ref.push(Math.max(ref[i-1]+step,i===1?Math.max(b+step,v):v))}
  return PARAM_CACHE[key]={b,C,k,ref};
}
function refRange(i,ex){const X=exDef(ex);if(!X||!S.profile.base[ex])return'—';const r=exParams(ex).ref;const step=X.metric==='secs'?5:X.metric==='load'?10:1;if(i>=MAXL)return fmt(r[i])+'+';const hi=r[i+1]-step;return hi<=r[i]?fmt(r[i]):fmt(r[i])+'–'+fmt(hi)}

/* ================= cálculo principal ================= */
function compute(){
  const T=tracked();const dates=Object.keys(LOGS).filter(d=>hasSession(LOGS[d])).sort();
  const freeze=new Set(S.freezeDays||[]);const perDay={};let prev=null,streak=0,prevW=null,life=0,units=0;
  const best={};for(const e of T)best[e]=0;
  for(const d of dates){
    const L=LOGS[d];const c={};for(const e of T)c[e]=valOf(L,e);
    if(prev){const g=diffDays(prev,d);let ok=true;for(let k=1;k<g;k++)if(!freeze.has(addDays(prev,k))){ok=false;break}streak=ok?streak+1:1;units+=effGap(g);if(g>4)units=Math.max(0,units-.6*(g-4))}else{streak=1;const g=S.profile&&S.profile.created?Math.max(1,diffDays(addDays(S.profile.created,-1),d)):1;units=effGap(g)}
    let base=0;for(const[k,e]of Object.entries(L.ex||{}))base+=entryPts(k,e);
    let sMult=1+Math.min(.30,.02*(streak-1));if(effectOn('nostreak',d))sMult=1;
    let mult=1;if(effectOn('boost',d))mult*=1.5;if(effectOn('fatigue',d))mult*=.75;
    const prs=T.filter(e=>{const b=Math.max(best[e],baseVal(e));return b>0&&c[e]>b});
    const w=T.reduce((a,e)=>a+rawPts(e,L.ex&&L.ex[e]),0);
    const overload=prevW!=null&&w>0&&w>=prevW;
    let expW=0;for(const e of T){if(!S.profile.base[e])continue;const p=exParams(e);expW+=valPtsRaw(e,p.C-(p.C-p.b)*Math.exp(-p.k*units))}
    const curve=w>0&&expW>0&&w>=expW;
    const pts=Math.round(base*sMult*mult)+prs.length*15+(overload?10:0)+(curve?10:0);
    for(const e of T)if(c[e]>best[e])best[e]=c[e];
    if(w>0)prevW=w;for(const e of T)if(exDef(e).metric==='reps')life+=c[e];
    perDay[d]={pts,base:Math.round(base),sMult,mult,prs,overload,curve,streak,core:c,w,expW};
    prev=d;
  }
  const t=today();let streakNow=0;
  if(prev){const g=diffDays(prev,t);let ok=g>=0;for(let k=1;k<g;k++)if(!freeze.has(addDays(prev,k))){ok=false;break}if(ok)streakNow=perDay[prev].streak}
  const ledgerPts=(S.ledger||[]).reduce((a,e)=>a+e.pts,0);
  const logPts=Object.values(perDay).reduce((a,e)=>a+e.pts,0);
  const total=Math.max(0,logPts+ledgerPts);const level=levelFromPts(total);
  let s7=0,pp7=0;for(let k=0;k<7;k++){const d=addDays(t,-k);if(hasSession(LOGS[d]))s7++;if(perDay[d])pp7+=perDay[d].pts}
  const recentDs=dates.filter(d=>d<=t).slice(-3);const rec={};for(const e of T){const v=recentDs.map(d=>perDay[d].core[e]).filter(x=>x>0);rec[e]=v.length?avg(v):baseVal(e)}
  for(const e of T)best[e]=Math.max(best[e],0);
  D={dates,perDay,total,logPts,ledgerPts,level,streakNow,best,life,s7,pp7,rec,lastDate:prev};
  return D;
}
function bestBefore(ex,date){let b=baseVal(ex);for(const d of Object.keys(LOGS))if(d<date){const v=valOf(LOGS[d],ex);if(v>b)b=v}return b}
function exMaxField(ex,field){let b=0;for(const L of Object.values(LOGS)){const e=L.ex&&L.ex[ex];if(e&&+e[field]>b)b=+e[field]}return b}
function recentCtx(date){
  const T=tracked();const ds=Object.keys(LOGS).filter(d=>d<date&&hasSession(LOGS[d])).sort().slice(-3);
  const avgOf={};for(const e of T){const v=ds.map(d=>valOf(LOGS[d],e)).filter(x=>x>0);avgOf[e]=v.length?avg(v):(baseVal(e)||{reps:10,secs:30,load:300,cardio:15}[exDef(e).metric])}
  const ppDay=ds.length?avg(ds.map(d=>T.reduce((a,e)=>a+entryPts(e,LOGS[d].ex&&LOGS[d].ex[e]),0))):40;
  return{avg:avgOf,ppDay,T:tierOf(D?D.level:0),pull:pullShare(14)};
}
function pullShare(days){const{loads}=muscleLoads(days);const g={empuje:0,tiron:0,core:0,piernas:0};for(const[k,ms]of Object.entries(MGROUP))for(const m of ms)g[k]+=loads[m]||0;const tot=g.empuje+g.tiron+g.core+g.piernas;return tot?g.tiron/tot:0}
function muscleLoads(days){
  const t=today(),loads={},byEx={};
  for(const[d,L]of Object.entries(LOGS)){if(days){const g=diffDays(d,t);if(g<0||g>=days)continue}
    for(const[k,e]of Object.entries(L.ex||{})){const p=entryPts(k,e);if(p<=0)continue;const X=exDef(k);if(!X)continue;
      for(const[m,w]of Object.entries(X.muscles||{})){loads[m]=(loads[m]||0)+p*w;(byEx[m]=byEx[m]||{})[k]=(byEx[m][k]||0)+p*w}}}
  const vals=Object.values(loads);return{loads,byEx,max:vals.length?Math.max(...vals):0};
}

/* ================= misiones ================= */
const PEN_BASE={
 1:[()=>({type:'points',amount:10}),()=>({type:'nostreak'}),()=>({type:'sealed'})],
 2:[r=>({type:'points',amount:20+Math.round(r()*8)}),()=>({type:'fatigue'}),()=>({type:'dishonor'}),()=>({type:'curse'})],
 3:[()=>({type:'confiscate',amount:40}),()=>({type:'debt',amount:15}),r=>({type:'points',amount:40+Math.round(r()*10)}),()=>({type:'loot',amount:35})],
 4:[()=>({type:'points',amount:70}),()=>({type:'debt',amount:25}),()=>({type:'tax',amount:60}),()=>({type:'confiscate',amount:70})]
};
const PEN_SOFT={1:[()=>({type:'points',amount:5}),()=>({type:'nostreak'})],2:[()=>({type:'points',amount:12}),()=>({type:'sealed'}),()=>({type:'curse'})],3:[()=>({type:'points',amount:20}),()=>({type:'fatigue'})],4:[()=>({type:'points',amount:35}),()=>({type:'fatigue'})]};
function penFor(diff,r){
  const mode=(S.profile&&S.profile.mode)||'normal';
  if(mode==='relajado'){const t=PEN_SOFT[diff];return t[Math.floor(r()*t.length)](r)}
  let t=PEN_BASE[diff];if(mode==='hardcore'&&diff===2)t=t.concat([()=>({type:'confiscate',amount:30}),()=>({type:'debt',amount:10})]);
  const p=t[Math.floor(r()*t.length)](r);if(mode==='hardcore'&&p.amount)p.amount=Math.round(p.amount*1.5);return p;
}
function penInfo(p){switch(p.type){
 case'points':return{name:'Multa',text:`Pierdes ${p.amount} PP.`};
 case'nostreak':return{name:'Racha apagada',text:'Tu bono de racha queda en 0 % por 2 días.'};
 case'sealed':return{name:'Sello',text:'Al día siguiente no puedes cambiar objetivos.'};
 case'fatigue':return{name:'Fatiga',text:'Al día siguiente tu entrenamiento vale ×0,75.'};
 case'dishonor':return{name:'Deshonra',text:'Tu título equipado queda oculto 2 días.'};
 case'curse':return{name:'Maldición del cofre',text:'Tu próxima recompensa baja un nivel de rareza.'};
 case'confiscate':return{name:'Confiscación',text:`Pierdes un cupón o vale del inventario al azar. Si no tienes, −${p.amount} PP.`};
 case'debt':return{name:'Deuda de sangre',text:`Al día siguiente debes ${p.amount} % más PP de entrenamiento que tu promedio. Si no pagas: −${p.amount*2} PP.`};
 case'loot':return{name:'Saqueo',text:`Pierdes un ítem al azar. Si no tienes, −${p.amount} PP.`};
 case'tax':return{name:'Impuesto de rango',text:`Pierdes el 5 % de tu avance en la división (mín. ${p.amount}, máx. 150 PP).`};
}return{name:'?',text:''}}
const R=x=>Math.max(1,Math.round(x));
function rUp(ex,v){const X=exDef(ex);return Math.max(1,roundNice(v,X.metric))}
function pickTracked(r,filter){const c=tracked().filter(e=>!filter||filter(exDef(e)));return c.length?c[Math.floor(r()*c.length)]:null}
/* plantillas: `ok` dice si aplica a este usuario; make(ctx,diff,r) arma el texto y la meta */
const MT=[
 {key:'present',pool:'main',diffs:[1],kind:'auto',ok:()=>tracked().length>=2,make:()=>({title:'Pase de lista',desc:`Registra hoy tus ${tracked().length} ejercicios principales, en cualquier cantidad.`})},
 {key:'ex_up',pool:'main',diffs:[1,2],kind:'auto',ok:()=>tracked().length>=1,make:(c,d,r)=>{const ex=pickTracked(r);const t=rUp(ex,c.avg[ex]*(d===1?1.05:1.15))+(d===1?1:2)*(exDef(ex).metric==='reps'?1:0);return{title:d===1?'Paso firme':'Empuje sostenido',desc:goalText(ex,t)+' (sumando series).',t:{ex,v:t}}}},
 {key:'ex_up3',pool:'main',diffs:[3],kind:'auto',ok:()=>tracked().length>=1,make:(c,d,r)=>{const ex=pickTracked(r);const t=rUp(ex,c.avg[ex]*1.3)+(exDef(ex).metric==='reps'?2:0);return{title:'Más allá del promedio',desc:goalText(ex,t)+'.',t:{ex,v:t}}}},
 {key:'pp_day',pool:'main',diffs:[2,3],kind:'auto',ok:()=>true,make:(c,d)=>{const t=R(c.ppDay*(d===2?1.1:1.25));return{title:d===2?'Ola de esfuerzo':'Marejada',desc:`Gana ${t} PP de entrenamiento hoy con tus ejercicios principales (sin contar bonos).`,t:{pp:t}}}},
 {key:'trinity',pool:'main',diffs:[2],kind:'auto',ok:()=>tracked().length>=2,make:c=>{const t={};for(const e of tracked())t[e]=rUp(e,c.avg[e]);return{title:'Todos al día',desc:'Iguala tu promedio en todos tus ejercicios principales: '+tracked().map(e=>`${fmt(t[e])} ${unitOf(e)} de ${lc(exDef(e).short)}`).join(', ')+'.',t:{each:t}}}},
 {key:'pr_any',pool:'main',diffs:[3],kind:'auto',ok:()=>true,make:()=>({title:'Romper el techo',desc:'Supera tu récord diario en al menos uno de tus ejercicios principales.'})},
 {key:'ladder',pool:'main',diffs:[3],kind:'auto',ok:()=>tracked().length>=2,make:(c,d,r)=>{const sh=shuffle(r,tracked()).slice(0,2);const t={};for(const e of sh)t[e]=rUp(e,c.avg[e]*1.15)+(exDef(e).metric==='reps'?1:0);return{title:'Escalera',desc:'El mismo día: '+sh.map(e=>`${fmt(t[e])} ${unitOf(e)} de ${lc(exDef(e).short)}`).join(' y ')+'.',t:{each:t}}}},
 {key:'crown',pool:'main',diffs:[4],kind:'auto',ok:()=>tracked().length>=2,make:c=>{const t={};for(const e of tracked())t[e]=rUp(e,c.avg[e]*1.2)+(exDef(e).metric==='reps'?1:0);return{title:'Triple corona',desc:'Supera tu promedio por 20 % en todos tus ejercicios principales: '+tracked().map(e=>`${fmt(t[e])} ${unitOf(e)} de ${lc(exDef(e).short)}`).join(', ')+'.',t:{each:t}}}},
 {key:'best_set',pool:'main',diffs:[3],kind:'manual',ok:()=>tracked().some(e=>exDef(e).metric==='reps'),field:'set',make:(c,d,r)=>{const ex=pickTracked(r,X=>X.metric==='reps');const t=Math.max(5,R(c.avg[ex]*.55)+2);return{title:'Sin soltar',desc:`Haz una sola serie continua de al menos ${t} ${lc(exDef(ex).name)}, sin pausas.`,t:{set:t},ex}}},
 {key:'tempo',pool:'main',diffs:[2],kind:'check',ok:()=>tracked().some(e=>exDef(e).metric==='reps'),make:(c,d,r)=>{const ex=pickTracked(r,X=>X.metric==='reps');return{title:'Bajada en tres tiempos',desc:`Haz todas tus ${lc(exDef(ex).name)} de hoy con la fase de bajada en 3 segundos. Regístralas y confirma.`,ex}}},
 {key:'grease',pool:'main',diffs:[2],kind:'check',ok:()=>true,make:(c,d,r)=>{const ex=pickTracked(r);return{title:'Engrasar el surco',desc:`Reparte ${lc(exDef(ex).name)} en al menos 4 bloques separados por una hora o más. Regístralo y confirma.`,ex}}},
 {key:'plank',pool:'other',ex:'plank',diffs:[2],kind:'manual',field:'secs',make:c=>{const s=30+5*c.T;return{title:'Tabla de acero',desc:`3 series de ${s} s de plancha (${3*s} s en total).`,t:{secs:3*s}}}},
 {key:'burpee',pool:'other',ex:'burpee',diffs:[2,3],kind:'manual',field:'reps',make:(c,d)=>{const t=d===2?12+3*c.T:25+5*c.T;return{title:d===2?'Caer y levantarse':'Tormenta de burpees',desc:`Completa ${t} burpees hoy.`,t:{reps:t}}}},
 {key:'climber',pool:'other',ex:'climber',diffs:[1],kind:'manual',field:'reps',make:c=>{const t=40+10*c.T;return{title:'Escalada sin montaña',desc:`Haz ${t} escaladores (cuenta cada rodilla).`,t:{reps:t}}}},
 {key:'lunge',pool:'other',ex:'lunge',diffs:[2],kind:'manual',field:'reps',make:c=>{const t=24+6*c.T;return{title:'Paso de guerrero',desc:`Haz ${t} estocadas adelante y atrás en total.`,t:{reps:t}}}},
 {key:'squat',pool:'other',ex:'squat',diffs:[1,2],kind:'manual',field:'reps',make:(c,d)=>{const t=(d===1?30:50)+8*c.T;return{title:'Piernas de concreto',desc:`Haz ${t} sentadillas hoy.`,t:{reps:t}}}},
 {key:'crunch',pool:'other',ex:'crunch',diffs:[1],kind:'manual',field:'reps',make:c=>{const t=30+6*c.T;return{title:'Núcleo encendido',desc:`Haz ${t} abdominales.`,t:{reps:t}}}},
 {key:'bridge',pool:'other',ex:'glute_bridge',diffs:[1],kind:'manual',field:'reps',make:c=>{const t=30+6*c.T;return{title:'Puente levadizo',desc:`Haz ${t} puentes de glúteos.`,t:{reps:t}}}},
 {key:'dip',pool:'other',ex:'dip',diffs:[2],kind:'manual',field:'reps',make:c=>{const t=15+4*c.T;return{title:'Fondo de silla',desc:`Haz ${t} fondos en silla o banco.`,t:{reps:t}}}},
 {key:'pullup',pool:'other',pull:true,ex:'pullup',diffs:[3],kind:'manual',field:'reps',make:c=>{const t=6+2*c.T;return{title:'Colgado del cielo',desc:`Haz ${t} dominadas en total (las series que necesites).`,t:{reps:t}}}},
 {key:'row_bp',pool:'other',pull:true,ex:'row_bp',diffs:[2,3],kind:'manual',field:'reps',make:(c,d)=>{const r=(d===2?10:13)+c.T;return{title:'Remo de mochilero',desc:`3 series de ${r} remos por brazo con peso (${3*r} por brazo).`,t:{reps:3*r}}}},
 {key:'curl',pool:'other',pull:true,ex:'curl',diffs:[1,2],kind:'manual',field:'reps',make:(c,d)=>{const r=(d===1?10:14)+c.T;return{title:'Bíceps de bolsillo',desc:`3 series de ${r} curls con peso (${3*r} en total).`,t:{reps:3*r}}}},
 {key:'lat_raise',pool:'other',ex:'lat_raise',diffs:[2],kind:'manual',field:'reps',make:c=>{const r=12+c.T;return{title:'Hombros de antena',desc:`3 series de ${r} elevaciones laterales con peso (${3*r} en total).`,t:{reps:3*r}}}},
 {key:'treadmill',pool:'other',ex:'treadmill',diffs:[2,3],kind:'manual',field:'min',make:(c,d)=>{const m=d===2?15+3*c.T:25+4*c.T;return{title:d===2?'Kilómetros prestados':'Fondo de trotadora',desc:`${m} minutos en la trotadora. Registra la distancia.`,t:{min:m}}}},
 {key:'run',pool:'other',ex:'run',diffs:[2,3],kind:'manual',field:'min',make:(c,d)=>{const m=d===2?20+3*c.T:30+4*c.T;return{title:d===2?'Vuelta a la manzana':'Fondista',desc:`Sal a correr ${m} minutos. Registra la distancia.`,t:{min:m}}}},
 {key:'m_chest',pool:'other',ex:'m_chest',diffs:[3],kind:'manual',field:'load',make:()=>({title:'Prensa de la torre',desc:'Press de banca en máquina: 3 series de 10. Registra el peso.',t:{sets:3,reps:10}})},
 {key:'m_row',pool:'other',pull:true,ex:'m_row',diffs:[3],kind:'manual',field:'load',make:()=>({title:'Remo de galera',desc:'Remo en máquina: 3 series de 12. Registra el peso.',t:{sets:3,reps:12}})},
 {key:'m_pulldown',pool:'other',pull:true,ex:'m_pulldown',diffs:[3],kind:'manual',field:'load',make:()=>({title:'Jalón del ancla',desc:'Jalón al pecho en máquina: 3 series de 10. Registra el peso.',t:{sets:3,reps:10}})},
 {key:'diamond',pool:'other',ex:'diamond',diffs:[3],kind:'manual',field:'reps',make:c=>{const t=2*(5+2*c.T);return{title:'Punta de diamante',desc:`Haz ${t} flexiones diamante en 2 series.`,t:{reps:t}}}},
 {key:'combo',pool:'other',diffs:[4],kind:'multi',make:c=>{const parts=[{ex:'burpee',field:'reps',v:20+4*c.T},{ex:'climber',field:'reps',v:60+10*c.T},{ex:'plank',field:'secs',v:90+10*c.T}];return{title:'Combo metabólico',desc:`En la misma sesión: ${parts[0].v} burpees, ${parts[1].v} escaladores y ${parts[2].v} s de plancha.`,parts}}}
];
const MT_BY=Object.fromEntries(MT.map(m=>[m.key,m]));
const PTS_BY_DIFF=[0,14,30,52,85];
function tplOk(m){if(m.pool==='main')return m.ok();if(m.ex&&(tracked().includes(m.ex)||!exAvailable(m.ex)))return false;return true}
function rollRarity(r,d){const x=r();if(d===1)return x<.5?'común':null;if(d===2)return x<.7?'común':'poco común';if(d===3)return x<.35?'poco común':x<.85?'raro':'épico';return x<.4?'raro':x<.85?'épico':'legendario'}
function buildMission(tpl,diff,ctx,r,date,idx,salt){
  const body=tpl.make(ctx,diff,r);const pen=penFor(diff,r);
  return Object.assign({id:`${date}-${salt}-${idx}-${tpl.key}`,key:tpl.key,diff,kind:tpl.kind,ex:tpl.ex||null,field:tpl.field||null,pts:PTS_BY_DIFF[diff]+Math.round((r()-.5)*6),rarity:rollRarity(r,diff),penalty:pen},body);
}
function genOffers(date,salt,excludeKeys=[]){
  const r=rngFor('mis:'+(S.uid||'')+':'+date+':'+salt);const c=recentCtx(date);
  const main=shuffle(r,MT.filter(m=>m.pool==='main'&&!excludeKeys.includes(m.key)&&tplOk(m)));
  const others=MT.filter(m=>m.pool==='other'&&!excludeKeys.includes(m.key)&&tplOk(m));
  const pullBoost=c.pull<.15;const chosen=main.slice(0,3);const pickedO=[];
  for(let k=0;k<5-chosen.length&&k<4;k++){if(pickedO.length>=2&&chosen.length+pickedO.length>=5)break;const cand=others.filter(o=>!pickedO.includes(o));const o=wpick(r,cand,m=>(m.pull&&pullBoost?3:1)*(m.diffs.includes(4)?.6:1));if(o)pickedO.push(o)}
  const tpls=chosen.concat(pickedO).slice(0,5);
  let ms=tpls.map((tpl,i)=>buildMission(tpl,tpl.diffs[Math.floor(r()*tpl.diffs.length)],c,r,date,i,salt));
  if(!ms.some(m=>m.diff>=3)){const i=ms.findIndex(m=>MT_BY[m.key].diffs.some(d=>d>=3));if(i>=0){const tpl=MT_BY[ms[i].key];ms[i]=buildMission(tpl,Math.max(...tpl.diffs),c,r,date,i,salt)}}
  return ms.sort((a,b)=>a.diff-b.diff);
}
function ensureDay(t){
  if(!S.days[t])S.days[t]={offers:genOffers(t,0),accepted:[],done:{},failed:[],pardoned:[],rerolls:0,objClaimed:null,objChanged:0,extraChanges:0};
  const keys=Object.keys(S.days).sort();while(keys.length>45)delete S.days[keys.shift()];
  return S.days[t];
}
function dayOpen(date){const day=S.days[date];return!!day&&!day.closed}
function dayTrainPP(L){return tracked().reduce((a,e)=>a+entryPts(e,L&&L.ex&&L.ex[e]),0)}
function autoPass(m,L,date){
  if(!L)return false;const t=m.t||{};
  switch(m.key){
   case'present':return tracked().every(e=>valOf(L,e)>0);
   case'ex_up':case'ex_up3':return valOf(L,t.ex)>=t.v;
   case'pp_day':case'debt':return dayTrainPP(L)>=t.pp;
   case'trinity':case'crown':case'ladder':return Object.entries(t.each||{}).every(([e,v])=>valOf(L,e)>=v);
   case'pr_any':return tracked().some(e=>{const b=bestBefore(e,date);return b>0&&valOf(L,e)>b});
  }return false;
}
function checkAuto(date){
  const day=S.days[date];if(!day||day.closed)return[];const L=LOGS[date];const out=[];
  for(const m of day.offers){if(!day.accepted.includes(m.id)||day.done[m.id]||m.kind!=='auto')continue;if(autoPass(m,L,date))out.push(completeMission(day,m,date))}
  return out;
}
function completeMission(day,m,date){
  day.done[m.id]=Date.now();S.stats.missions=(S.stats.missions||0)+1;
  if(m.pts)addLedger(date,m.pts,m.key==='debt'?'deuda':'mision',m.title);
  let reward=null;
  if(m.rarity)reward=grantReward(m.rarity,'Misión «'+m.title+'»');
  else if(m.key!=='debt')addLedger(date,5,'bonus','Extra de misión fácil');
  const pts=(m.pts||0)+((reward||m.key==='debt')?0:5);
  addFeat({date,kind:m.key==='debt'?'deuda':'mision',title:m.key==='debt'?'Deuda saldada':m.title,desc:m.desc,pts,rarity:reward?reward.rarity:'común',diff:m.diff,reward});
  return{kind:'mision',title:m.key==='debt'?'Deuda saldada':m.title,pts,reward};
}

/* ================= recompensas ================= */
function addLedger(d,pts,kind,label){S.ledger.push({d,pts:Math.round(pts),kind,label});if(S.ledger.length>500){const old=S.ledger.splice(0,S.ledger.length-400);S.ledger.unshift({d:old[old.length-1].d,pts:old.reduce((a,e)=>a+e.pts,0),kind:'archivo',label:'Movimientos antiguos agrupados'})}}
function addFeat(f){f.id=f.id||uid();S.feats.push(f);if(S.feats.length>700){S.feats.sort((a,b)=>featValue(b)-featValue(a));S.feats=S.feats.slice(0,600)}}
function featValue(f){return(f.pts||0)+(RAR_BONUS[f.rarity]||0)+(f.kind==='ascenso'?60*(tierOf(f.level||0)+1)+((f.level||0)%3===0?100:0):0)+(f.kind==='objetivo'?40:0)}
function addScar(s){S.scars.push(s);if(S.scars.length>200)S.scars=S.scars.slice(-200)}
function couponEligible(cp){
  const P=S.profile||{};const pk=cp.providerKey||'todos';
  if(pk!=='todos'){const b=(P.banks||{})[pk];if(!b)return false;if(cp.card==='credito'&&!b.credito)return false;if(cp.card==='debito'&&!b.debito)return false}
  const prefs=P.prefs||[];if(prefs.length&&cp.catKey&&!prefs.includes(cp.catKey))return false;
  return true;
}
function couponAvailable(cp){const t=today();if(!couponEligible(cp))return false;if(cp.validUntil&&diffDays(t,cp.validUntil)<2)return false;if(cp.validFrom&&cp.validFrom>addDays(t,10))return false;return!S.inventory.some(i=>i.rid==='cup:'+cp.id&&i.status==='active')}
function couponRef(cp){return{id:'cup:'+cp.id,type:'cupon',name:cp.title,icon:cp.emoji||'🎟️',rarity:cp.rarity,snap:{provider:cp.provider,title:cp.title,detail:cp.detail,days:cp.days||'',channel:cp.channel||'',validUntil:cp.validUntil||null,validFrom:cp.validFrom||null,validNote:cp.validNote||'',noExpiry:!!cp.noExpiry,source:cp.source||'',category:cp.category||'',card:cp.card||''}}}
function grantReward(rarity,source,forceType){
  let ri=Math.max(0,RARITIES.indexOf(rarity));let cursed=false;
  const curse=(S.effects||[]).find(e=>e.type==='curse'&&!e.consumed);if(curse){curse.consumed=true;ri=Math.max(0,ri-1);cursed=true}
  const rar=RARITIES[ri];const pool=[];const comuna=((S.profile&&S.profile.comuna)||'').toLowerCase();
  for(const c of catalogAll()){if(c.rarity!==rar||c.only)continue;if(forceType&&c.type!==forceType)continue;if(['insignia','titulo','cronica','tema'].includes(c.type)&&S.pokedex[c.id])continue;pool.push({ref:c,w:TYPE_W[c.type]*(c.mine?2:1)})}
  if(!forceType||forceType==='cupon')for(const cp of CAT){if(cp.rarity!==rar||!couponAvailable(cp))continue;const near=comuna&&((cp.zone||'')+' '+(cp.channel||'')).toLowerCase().includes(comuna);pool.push({ref:couponRef(cp),w:TYPE_W.cupon*(near?2:1)})}
  if(!pool.length){if(forceType)return grantReward(rarity,source,null);const pts=[10,20,40,80,150,300][ri];addLedger(today(),pts,'bonus','Recompensa convertida en PP');return{rid:'pp',name:`+${pts} PP`,icon:'✨',rarity:rar,type:'pp',source,cursed}}
  const ch=wpick(Math.random,pool,p=>p.w);return Object.assign(giveItem(ch.ref,source),{cursed});
}
function giveItem(ref,source){
  const t=today();const rid=ref.id;const pd=S.pokedex[rid]||(S.pokedex[rid]={first:t,count:0});pd.count++;
  let inv=null;
  if(['cupon','vale','item','titulo','tema'].includes(ref.type)){
    let expires=null;if(ref.type==='vale')expires=addDays(t,ref.days||14);if(ref.type==='cupon')expires=ref.snap.validUntil||null;
    inv={iid:uid(),rid,type:ref.type,got:t,expires,status:'active',source};if(ref.snap)inv.snap=ref.snap;if(ref.mine)inv.snapName=ref.name;
    if((ref.type==='titulo'||ref.type==='tema')&&S.inventory.find(i=>i.rid===rid&&i.status==='active'))inv=null;
    if(inv)S.inventory.push(inv);
  }
  return{rid,name:ref.name,icon:ref.icon,rarity:ref.rarity,type:ref.type,source,iid:inv?inv.iid:null};
}
function giveFixed(code,source){
  if(code.startsWith('cup:'))return grantReward(code.slice(4),source,'cupon');
  const c=catById(code);if(!c)return grantReward('raro',source);
  if(['insignia','titulo','cronica','tema'].includes(c.type)&&S.pokedex[c.id])return grantReward(c.rarity,source);
  return giveItem(c,source);
}
function refOf(rid){if(rid&&rid.startsWith('cup:')){const cp=CAT.find(c=>'cup:'+c.id===rid);if(cp)return couponRef(cp);const inv=S.inventory.find(i=>i.rid===rid&&i.snap);if(inv)return{id:rid,type:'cupon',name:inv.snap.title,icon:'🎟️',rarity:'raro',snap:inv.snap};return null}
  const c=catById(rid);if(c)return c;const inv=S.inventory.find(i=>i.rid===rid&&i.snapName);return inv?{id:rid,type:'vale',name:inv.snapName,icon:'🎯',rarity:'raro',desc:'Autopremio personal.'}:null}
function invName(i){const r=refOf(i.rid);return r?r.name:(i.snap?i.snap.title:i.rid)}

/* ================= penalizaciones y cierre ================= */
function applyPenalty(m,d){
  const t=today();const shield=S.inventory.find(i=>i.rid==='itm_escudo'&&i.status==='active');
  if(shield){shield.status='used';shield.used=t;addScar({date:d,title:m.title,penalty:'Bloqueada por tu Escudo de Rango',blocked:true});return'Escudo de Rango consumido: penalización bloqueada.'}
  const p=m.penalty;const info=penInfo(p);let txt='';
  const ptsPen=a=>{addLedger(d,-a,'penalizacion','Multa: '+m.title);return`−${a} PP`};
  switch(p.type){
   case'points':txt=ptsPen(p.amount);break;
   case'confiscate':{const pool=S.inventory.filter(i=>i.status==='active'&&(i.type==='cupon'||i.type==='vale'));if(pool.length){const it=pool[Math.floor(Math.random()*pool.length)];it.status='lost';it.used=t;txt='Confiscado: '+invName(it)}else txt='Sin cupones que confiscar: '+ptsPen(p.amount);break}
   case'loot':{const pool=S.inventory.filter(i=>i.status==='active'&&i.type==='item');if(pool.length){const it=pool[Math.floor(Math.random()*pool.length)];it.status='lost';it.used=t;txt='Saqueado: '+invName(it)}else txt='Sin ítems que saquear: '+ptsPen(p.amount);break}
   case'debt':addDebt(p.amount);txt=`Deuda de ${p.amount} % extra para hoy`;break;
   case'fatigue':S.effects.push({type:'fatigue',from:t,to:t});txt='Fatiga ×0,75 hoy';break;
   case'nostreak':S.effects.push({type:'nostreak',from:t,to:addDays(t,1)});txt='Sin bono de racha por 2 días';break;
   case'dishonor':S.effects.push({type:'dishonor',from:t,to:addDays(t,1)});txt='Título oculto por 2 días';break;
   case'sealed':S.effects.push({type:'sealed',from:t,to:t});txt='Sin cambios de objetivo hoy';break;
   case'curse':S.effects.push({type:'curse',from:t,to:null});txt='Tu próxima recompensa baja de rareza';break;
   case'tax':{const C=compute();const adv=C.total-THRESH[C.level];const a=Math.min(150,Math.max(p.amount,Math.round(adv*.05)));txt=ptsPen(a);break}
  }
  addScar({date:d,title:m.title,penalty:info.name+': '+txt});return info.name+': '+txt;
}
function addDebt(pct){
  const t=today();const day=ensureDay(t);const c=recentCtx(t);const tot=R(c.ppDay*(1+pct/100));
  const m={id:'debt-'+t+'-'+uid(),key:'debt',kind:'auto',diff:2,title:'Deuda de sangre',desc:`Paga tu deuda: gana hoy al menos ${tot} PP de entrenamiento (tu promedio + ${pct} %).`,t:{pp:tot},pts:0,rarity:null,penalty:{type:'points',amount:pct*2},forced:true};
  day.offers.unshift(m);day.accepted.push(m.id);
}
function weeklyChest(sun){
  const mon=addDays(sun,-6);let n=0;for(let k=0;k<7;k++)if(hasSession(LOGS[addDays(mon,k)]))n++;
  const goal=Math.min(7,Math.max(2,(S.profile&&S.profile.freq)||4));if(n<goal)return null;
  const rar=n>=7?'épico':n>goal?'raro':'poco común';
  addLedger(sun,40,'cofre','Cofre de constancia');const rw=grantReward(rar,'Cofre semanal');
  addFeat({date:sun,kind:'cofre',title:`Cofre de constancia · ${n}/7 días`,desc:`Semana del ${niceDate(mon)} al ${niceDate(sun)}.`,pts:40,rarity:rw.rarity,reward:rw});
  return{kind:'cofre',title:`Cofre de constancia (${n}/7 días)`,pts:40,reward:rw};
}
function processRollover(){
  const t=today(),hour=new Date().getHours();const notes=[],reveals=[];let d=addDays(S.lastProcessed,1);let guard=0;
  while(guard++<120&&(diffDays(d,t)>1||(diffDays(d,t)===1&&hour>=12))){
    const day=S.days[d];
    if(day&&!day.closed){for(const m of day.offers){if(!day.accepted.includes(m.id)||day.done[m.id]||day.failed.includes(m.id)||(day.pardoned||[]).includes(m.id))continue;if(m.kind==='auto'&&autoPass(m,LOGS[d],d)){reveals.push(completeMission(day,m,d));continue}day.failed.push(m.id);notes.push(`«${m.title}» fallida → `+applyPenalty(m,d))}day.closed=true}
    if(dow(d)===0){const c=weeklyChest(d);if(c)reveals.push(c)}
    S.lastProcessed=d;d=addDays(d,1);
  }
  return{notes,reveals};
}

/* ================= objetivos ================= */
function msFrom(ex){const b=Math.max(1,baseVal(ex));const X=exDef(ex);const out=[];for(const m of[1.25,1.5,1.75,2,2.5,3,3.5,4,5,6,7]){let v=roundNice(b*m,X.metric);if(X.metric==='reps'&&v>20)v=Math.round(v/5)*5;if(v>b&&!out.includes(v))out.push(v)}return out}
function lifeScale(){const s=tracked().filter(e=>exDef(e).metric==='reps').reduce((a,e)=>a+baseVal(e),0);return Math.max(1,s/40)}
function objTpl(key){
  if(key.startsWith('max:')){const ex=key.slice(4);const X=exDef(ex);if(!X||!tracked().includes(ex))return null;
    return{cat:'Fuerza',ms:msFrom(ex),cur:()=>Math.max(D.best[ex]||0,0),title:t=>X.metric==='reps'?`${fmt(t)} ${X.unit||lc(X.name)} en un día`:X.metric==='secs'?`${fmt(t)} s de ${lc(X.name)} en un día`:X.metric==='load'?`Volumen de ${fmt(t)} en ${lc(X.name)}`:`${fmt(t)} min de ${lc(X.name)} en un día`,desc:`Tu mejor día de ${lc(X.name)}.`,unit:unitOf(ex)}}
  const L=lifeScale();
  const T={
   lifetime:{cat:'Volumen',ok:()=>tracked().some(e=>exDef(e).metric==='reps'),ms:[250,500,1000,2000,3500,5000,7500,10000,15000,25000].map(v=>Math.round(v*L/50)*50),cur:()=>D.life,title:t=>`${fmt(t)} repeticiones acumuladas`,desc:'Suma histórica de tus ejercicios principales por repeticiones.'},
   week_pp:{cat:'Volumen',ms:[250,350,450,600,800,1000,1300],cur:()=>D.pp7,title:t=>`${fmt(t)} PP en 7 días`,desc:'PP ganados por entrenar en los últimos 7 días (incluye hoy).'},
   streak:{cat:'Constancia',ms:[3,5,7,10,14,21,30,45,60,90],cur:()=>D.streakNow,title:t=>`Racha de ${t} días`,desc:'Días seguidos con entrenamiento registrado.'},
   week_sessions:{cat:'Constancia',ms:[3,4,5,6,7],cur:()=>D.s7,title:t=>`Entrena ${t} de los últimos 7 días`,desc:'Días con entrenamiento en la última semana móvil.'},
   missions_done:{cat:'Constancia',ms:[3,8,15,25,40,60,100],cur:()=>S.stats.missions||0,title:t=>`Completa ${t} misiones`,desc:'Misiones completadas en total.'},
   plank_hold:{cat:'Complementario',manual:true,ex:'plank',field:'secs',unit:'s',ms:[45,60,75,90,120,150,180],title:t=>`Plancha de ${t} s seguidos`,desc:'Una sola plancha, sin apoyar las rodillas.'},
   burpee_day:{cat:'Complementario',manual:true,ex:'burpee',field:'reps',unit:'burpees',derive:true,ms:[20,30,40,50,75,100],title:t=>`${t} burpees en un día`,desc:'Suma de burpees de un mismo día.'},
   squat_day:{cat:'Complementario',manual:true,ex:'squat',field:'reps',unit:'reps',derive:true,ms:[40,60,80,100,150,200],title:t=>`${t} sentadillas en un día`,desc:'Suma de sentadillas de un mismo día.'},
   pullup_day:{cat:'Complementario',manual:true,ex:'pullup',field:'reps',unit:'reps',derive:true,ms:[5,10,15,20,30,40,50],title:t=>`${t} dominadas en un día`,desc:'Suma de dominadas de un mismo día.'},
   treadmill_km:{cat:'Complementario',manual:true,ex:'treadmill',field:'km',unit:'km',derive:true,ms:[2,3,4,5,6,8,10],title:t=>`${t} km en la trotadora`,desc:'Distancia en una sola sesión.'},
   run_km:{cat:'Complementario',manual:true,ex:'run',field:'km',unit:'km',derive:true,ms:[2,3,5,7,10,15,21],title:t=>`Correr ${t} km`,desc:'Distancia en una sola salida.'},
   row_bp:{cat:'Complementario',manual:true,ex:'row_bp',field:'reps',unit:'por brazo',derive:true,ms:[30,36,45,60,75],title:t=>`Remo con peso: ${t} por brazo`,desc:'Total por brazo en 3 series, el mismo día.'},
   diamond_day:{cat:'Complementario',manual:true,ex:'diamond',field:'reps',unit:'reps',derive:true,ms:[10,15,20,30,40,50],title:t=>`${t} flexiones diamante en un día`,desc:'Manos juntas formando un rombo.'},
   lunge_day:{cat:'Complementario',manual:true,ex:'lunge',field:'reps',unit:'reps',derive:true,ms:[30,40,60,80,100],title:t=>`${t} estocadas en un día`,desc:'Adelante y atrás, ambas piernas.'},
   m_chest_kg:{cat:'Complementario',manual:true,ex:'m_chest',field:'kg',unit:'kg',ms:[20,25,30,35,40,45,50,55,60,70,80],title:t=>`Press en máquina 3×10 con ${t} kg`,desc:'Tres series completas de 10 con ese peso.'}
  };
  const o=T[key];if(!o)return null;if(o.ok&&!o.ok())return null;if(o.manual&&(!exAvailable(o.ex)||tracked().includes(o.ex)))return null;return o;
}
function allObjKeys(){return tracked().map(e=>'max:'+e).concat(['lifetime','week_pp','streak','week_sessions','missions_done','plank_hold','burpee_day','squat_day','pullup_day','treadmill_km','run_km','row_bp','diamond_day','lunge_day','m_chest_kg']).filter(k=>objTpl(k))}
function objCur(o){const T=objTpl(o.key);if(!T)return 0;if(T.manual){let v=o.best||0;if(T.derive)v=Math.max(v,exMaxField(T.ex,T.field));return v}return T.cur()}
function objReady(o){return objTpl(o.key)?objCur(o)>=o.target:false}
function makeObjective(key){
  const T=objTpl(key);if(!T)return null;const cur=T.manual?(T.derive?exMaxField(T.ex,T.field):0):T.cur();const i=T.ms.findIndex(v=>v>cur);if(i<0)return null;
  return{id:'obj-'+uid(),key,target:T.ms[i],pts:Math.min(320,80+25*i),rarity:i<=1?'raro':i<=4?'épico':'legendario',created:today(),best:0};
}
function objCandidates(excl,seed,n){const r=rngFor(seed);const act=new Set(S.objectives.map(o=>o.key).concat(excl||[]));const keys=shuffle(r,allObjKeys().filter(k=>!act.has(k)));const out=[];for(const k of keys){const o=makeObjective(k);if(o)out.push(o);if(out.length>=n)break}return out}
function initialObjectives(){
  S.objectives=[];const main=tracked()[0];
  for(const k of[main?'max:'+main:null,'streak',tracked().some(e=>exDef(e).metric==='reps')?'lifetime':'week_pp']){if(!k)continue;const o=makeObjective(k);if(o)S.objectives.push(o)}
  S.objectives.push(...objCandidates([],'init-obj-'+(S.uid||''),4-S.objectives.length));
}
function cleanObjectives(){S.objectives=S.objectives.filter(o=>objTpl(o.key));while(S.objectives.length<4){const c=objCandidates([],'fill-'+today()+S.objectives.length,1)[0];if(!c)break;S.objectives.push(c)}}

/* ================= rangos ================= */
function checkRank(){
  const C=compute();const L=C.level;let celebrate=null;
  if(L>S.maxLevel){const reveals=[];
    for(let i=S.maxLevel+1;i<=L;i++){const tier=tierOf(i);const tierUp=i%3===0||i===MAXL;
      if(tierUp&&TIER_REWARDS[tier])for(const c of TIER_REWARDS[tier])reveals.push(giveFixed(c,'Ascenso a '+levelName(i)));else reveals.push(grantReward(DIV_RAR[tier],'Ascenso a '+levelName(i)));
      addFeat({date:today(),kind:'ascenso',title:'Ascenso a '+levelName(i),desc:(i>=MAXL?TIERS[7]:TIERS[tier]).lore,pts:0,rarity:tierUp?'épico':'raro',level:i})}
    S.maxLevel=L;celebrate={level:L,reveals}}
  if(UI.lastLevel!=null&&L<UI.lastLevel)toast(`Bajaste a ${levelName(L)}. Recupera los PP para volver a subir.`,'bad');
  UI.lastLevel=L;return celebrate;
}

/* ================= proyección ================= */
function exSessions(ex){
  const ds=Object.keys(LOGS).filter(d=>valOf(LOGS[d],ex)>0).sort();const out=[];let u=0,prev=null;
  const b=baseVal(ex);if(b>0&&S.profile.created){prev=addDays(S.profile.created,-1);out.push({d:prev,u:0,v:b,base:true})}
  for(const d of ds){if(prev){const g=Math.max(1,diffDays(prev,d));u+=effGap(g);if(g>4)u=Math.max(0,u-.6*(g-4))}prev=d;out.push({d,u,v:valOf(LOGS[d],ex)})}
  return out;
}
function projection(ex){
  const sess=exSessions(ex);if(!sess.length)return null;if(!tracked().includes(ex)||!S.profile.base[ex])return{sess};
  const p=exParams(ex);const C=p.C,V0=p.b;const real=sess.filter(s=>!s.base);const k0=p.k;
  const ks=[];for(const s of real){if(s.u<=0)continue;let kv;if(s.v<=V0)kv=0;else if(s.v>=C)kv=3*k0;else kv=-Math.log((C-s.v)/(C-V0))/s.u;ks.push(Math.min(3*k0,kv))}
  let k=k0,w=0;if(ks.length){ks.sort((a,b)=>a-b);const kp=ks[Math.floor(ks.length/2)];w=Math.min(.75,ks.length/14);k=Math.max(.3*k0,(1-w)*k0+w*kp)}
  const t=today();const first=sess[0].d;const win=Math.max(2,Math.min(14,diffDays(first,t)+1));
  const cnt=real.filter(s=>{const g=diffDays(s.d,t);return g>=0&&g<win}).length;let f=cnt/win;if(f<=0)f=((S.profile.freq||4)/7);
  const upd=f*effGap(Math.max(1,Math.round(1/f)));const last=sess[sess.length-1];const gapNow=diffDays(last.d,t);
  const Vm=u=>C-(C-V0)*Math.exp(-k*u);const recent=avg(real.slice(-3).map(s=>s.v));
  let anchor=real.length>=3?.5*recent+.5*Vm(last.u):last.v;if(gapNow>4)anchor=Math.max(V0,anchor*(1-.01*(gapNow-4)));
  const P=(a,u)=>a>=C?a:C-(C-a)*Math.exp(-k*u);
  const proj=[];for(let i=0;i<=30;i++)proj.push({d:addDays(t,i),v:P(anchor,upd*i)});
  const expected=sess.map(s=>({d:s.d,v:Vm(s.u)}));
  const scen=[['Todos los días',1],['Cada 2 días',.5],['3 veces por semana',3/7],['2 veces por semana',2/7]].map(([label,ff])=>{const u=ff*effGap(Math.round(1/ff));return{label,f:ff,v30:P(anchor,u*30),v60:P(anchor,u*60),v90:P(anchor,u*90)}});
  return{sess,C,V0,k,k0,w,f,upd,anchor,expected,proj,scen,recent,expNow:Vm(last.u),last};
}

/* ================= estado inicial ================= */
function freshState(uidStr){const t=today();S={v:2,uid:uidStr||'',created:t,profile:null,tracked:[],customEx:{},exOrder:[],ledger:[],days:{},objectives:[],inventory:[],pokedex:{},feats:[],scars:[],effects:[],freezeDays:[],title:null,theme:null,lastProcessed:addDays(t,-1),maxLevel:0,stats:{missions:0,objectives:0}};return S}
function starterPack(){
  const out=[giveItem(catById('ins_primer'),'Inicio de la liga'),giveItem(catById('itm_escudo'),'Inicio de la liga'),giveItem(catById('itm_dado'),'Inicio de la liga')];
  addFeat({date:today(),kind:'ascenso',title:'Ingreso a la liga',desc:'Novato I. Base: '+tracked().map(e=>`${entryText(e,S.profile.base[e])} de ${lc(exDef(e).short)}`).join(', ')+'.',pts:0,rarity:'común',level:0});
  return out;
}
/* ================= emblemas ================= */
let EMB_N=0;
const TIER_ACCENT=[['#e3986a','#8f4a24'],['#c6cedd','#5b6680'],['#f0bb45','#8a5a0e'],['#82d2f7','#22648a'],['#bb98ff','#5531b0'],['#46d7a2','#0e6a4b'],['#ff6f90','#8a1534'],['#d99bff','#7a3fd0']];
function emblem(i,cls='emb'){
  const t=tierOf(i),T=TIERS[t],n='g'+(++EMB_N);const div=i>=MAXL?-1:i%3;
  const ring=`url(#${n}r)`,dark=T.ring[2];
  const blade=(cx,top,bot,w,rot=0)=>`<polygon points="${cx},${top} ${cx+w},${top+7} ${cx+w},${bot-9} ${cx},${bot} ${cx-w},${bot-9} ${cx-w},${top+7}" fill="${ring}" stroke="${dark}" stroke-width="1" ${rot?`transform="rotate(${rot} 50 56)"`:''}/><line x1="${cx}" y1="${top+4}" x2="${cx}" y2="${bot-4}" stroke="#fff" stroke-opacity=".55" stroke-width="1" ${rot?`transform="rotate(${rot} 50 56)"`:''}/>`;
  let parts='';
  if(t===0)parts=`<polygon points="50,36 59,50 59,64 50,78 41,64 41,50" fill="${ring}" stroke="${dark}" stroke-width="1"/><polygon points="50,36 59,50 50,56 41,50" fill="#fff" fill-opacity=".35"/>`;
  if(t===1)parts=blade(50,20,94,6.5);
  if(t===2)parts=blade(41,24,90,5.5,-6)+blade(59,24,90,5.5,6);
  if(t>=3)parts=blade(36,30,86,5)+blade(64,30,86,5)+blade(50,16,96,6.5);
  if(t>=4)parts=`<polygon points="31,44 10,16 22,22 36,52" fill="${ring}" stroke="${dark}" stroke-width="1"/><polygon points="69,44 90,16 78,22 64,52" fill="${ring}" stroke="${dark}" stroke-width="1"/>`+parts;
  if(t>=5)parts=`<polygon points="22,58 2,34 8,30 26,46 24,72" fill="${ring}" stroke="${dark}" stroke-width="1" opacity=".95"/><polygon points="78,58 98,34 92,30 74,46 76,72" fill="${ring}" stroke="${dark}" stroke-width="1" opacity=".95"/>`+parts;
  if(t>=6)parts+=`<polygon points="50,0 55,10 45,10" fill="${ring}" stroke="${dark}" stroke-width=".8"/><polygon points="34,6 40,14 31,15" fill="${ring}" stroke="${dark}" stroke-width=".8"/><polygon points="66,6 69,15 60,14" fill="${ring}" stroke="${dark}" stroke-width=".8"/>`;
  if(t>=7)parts=`<circle cx="50" cy="56" r="45" fill="none" stroke="url(#${n}h)" stroke-width="2.5" opacity=".9"/>`+parts+`<circle cx="18" cy="20" r="1.6" fill="#fff"/><circle cx="84" cy="26" r="1.2" fill="#fff"/><circle cx="90" cy="70" r="1.4" fill="#fff"/>`;
  let pips='';
  if(div>=0){const cnt=div+1;for(let k=0;k<cnt;k++){const x=50+(k-(cnt-1)/2)*10;pips+=`<polygon points="${x-4},100 ${x},104 ${x+4},100 ${x+4},103 ${x},107 ${x-4},103" fill="${ring}" stroke="${dark}" stroke-width=".6"/>`}}
  else pips=`<polygon points="50,98 52,103 57,103 53,106 55,110 50,107.5 45,110 47,106 43,103 48,103" fill="url(#${n}h)"/>`;
  return `<svg class="${cls}" viewBox="0 0 100 112" role="img" aria-label="Emblema ${esc(levelName(i))}"><defs>
<linearGradient id="${n}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${T.ring[0]}"/><stop offset=".55" stop-color="${T.ring[1]}"/><stop offset="1" stop-color="${T.ring[2]}"/></linearGradient>
<radialGradient id="${n}c" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="${T.core[0]}"/><stop offset="1" stop-color="${T.core[1]}"/></radialGradient>
<linearGradient id="${n}h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7cf3ff"/><stop offset=".5" stop-color="#c9a7ff"/><stop offset="1" stop-color="#ff6fb0"/></linearGradient>
<clipPath id="${n}k"><circle cx="50" cy="56" r="27"/></clipPath></defs>
<circle cx="50" cy="56" r="35" fill="${ring}" stroke="${dark}" stroke-width="1.2"/>
<circle cx="50" cy="56" r="27.5" fill="url(#${n}c)" stroke="${dark}" stroke-width="1"/>
<g clip-path="url(#${n}k)" stroke="#fff" stroke-opacity=".12" fill="none"><path d="M20 46h60M20 58h60M20 70h60M30 30l30 52M50 30l30 52M20 40l30 52"/></g>
${parts}${pips}</svg>`;
}

/* ================= helpers de UI ================= */
function rarChip(r){if(!r)return'<span class="chip">+5 PP extra</span>';return`<span class="chip rar rar-${RK[r]}"><i></i>${esc(r)}</span>`}
function stars(d){return`<span class="stars" aria-label="Dificultad ${d} de 4">${'★'.repeat(d)}<span class="off">${'★'.repeat(4-d)}</span></span>`}
function icon(ref,rar){return`<span class="icon bd-${RK[rar||(ref&&ref.rarity)]||'c'}">${esc((ref&&ref.icon)||'❔')}</span>`}
function toast(msg,cls=''){const box=$('#toasts');while(box.children.length>=2)box.firstElementChild.remove();const el=document.createElement('div');el.className='toast '+cls;el.textContent=msg;$('#toasts').appendChild(el);setTimeout(()=>el.remove(),4200)}
function setSync(cls,txt){const el=$('#sync');if(!el)return;el.className='sync '+cls;el.lastElementChild.textContent=txt}
function applyTheme(){
  const L=D?D.level:0;let a=TIER_ACCENT[tierOf(L)];
  if(S&&S.theme&&catById(S.theme)&&catById(S.theme).accent)a=catById(S.theme).accent;
  document.documentElement.style.setProperty('--accent',a[0]);document.documentElement.style.setProperty('--accent-2',a[1]);
}
function expStatus(inv){
  const t=today();
  if(inv.type==='cupon'&&inv.snap&&inv.snap.noExpiry)return{cls:'st-info',txt:'No vence'};
  if(inv.type==='cupon'&&inv.snap&&inv.snap.validFrom&&inv.snap.validFrom>t)return{cls:'st-info',txt:'Desde el '+niceDate(inv.snap.validFrom)};
  if(!inv.expires)return inv.type==='cupon'?{cls:'st-muted',txt:'Fecha sin confirmar'}:{cls:'st-info',txt:'No vence'};
  const g=diffDays(t,inv.expires);
  if(g<0)return{cls:'st-bad',txt:'Vencido el '+niceDate(inv.expires),expired:true};
  if(g===0)return{cls:'st-bad',txt:'Vence hoy'};
  if(g<=3)return{cls:'st-serious',txt:`Vence en ${g} día${g>1?'s':''}`};
  if(g<=7)return{cls:'st-warn',txt:'Vence pronto · '+niceDate(inv.expires)};
  return{cls:'st-good',txt:'Vigente hasta el '+niceDate(inv.expires)};
}
function curTitle(){if(!S.title)return null;const c=catById(S.title);return c?c.name:null}
function changesLeft(){const day=S.days[today()];if(!day)return 0;return Math.max(0,1+(day.extraChanges||0)-(day.objChanged||0))}

/* ================= gráficos SVG ================= */
const CHARTS={};
function niceMax(v){if(v<=0)return 10;const p=Math.pow(10,Math.floor(Math.log10(v)));const n=v/p;const m=n<=1?1:n<=2?2:n<=2.5?2.5:n<=5?5:10;return m*p}
function chartW(){const v=document.getElementById('view');return Math.round(Math.min(680,Math.max(320,((v&&v.clientWidth)||400)-30)))}
function lineChart(id,cfg){
  const W=chartW(),H=Math.max(230,Math.round(W*.52)),pl=44,pr=16,pt=16,pb=30;
  const all=cfg.series.flatMap(s=>s.pts.map(p=>p[1])).concat((cfg.refs||[]).map(r=>r.y));
  const ymax=niceMax(Math.max(1,...all)*1.08);
  const xMin=cfg.xMin,xMax=Math.max(cfg.xMax,cfg.xMin+864e5);
  const sx=x=>pl+(x-xMin)/(xMax-xMin)*(W-pl-pr),sy=y=>H-pb-(y/ymax)*(H-pt-pb);
  let g='';const ticks=4;
  for(let i=0;i<=ticks;i++){const v=ymax*i/ticks;const y=sy(v);g+=`<line x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}" style="stroke:var(--line)" stroke-width="1"/><text x="${pl-8}" y="${y+4}" text-anchor="end" font-size="11" style="fill:var(--fg-3)">${fmt(v)}</text>`}
  const span=(xMax-xMin)/864e5;const nx=Math.min(5,Math.max(2,Math.round(span)));
  for(let i=0;i<=nx;i++){const x=xMin+(xMax-xMin)*i/nx;const ds=fmtD(Math.round(x/864e5)*864e5);g+=`<text x="${sx(x)}" y="${H-8}" text-anchor="${i===0?'start':i===nx?'end':'middle'}" font-size="11" style="fill:var(--fg-3)">${niceDate(ds)}</text>`}
  const tms=parseD(today());if(tms>xMin&&tms<xMax)g+=`<line x1="${sx(tms)}" x2="${sx(tms)}" y1="${pt}" y2="${H-pb}" style="stroke:var(--fg-3)" stroke-dasharray="2 4" stroke-width="1"/><text x="${sx(tms)+4}" y="${pt+10}" font-size="10.5" style="fill:var(--fg-3)">hoy</text>`;
  for(const r of cfg.refs||[]){const y=sy(r.y);g+=`<line x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}" style="stroke:var(--accent)" stroke-opacity=".7" stroke-dasharray="6 5" stroke-width="1.2"/><text x="${W-pr}" y="${y-5}" text-anchor="end" font-size="11" style="fill:var(--fg-2)">${esc(r.label)}</text>`}
  for(const s of cfg.series){
    if(!s.pts.length)continue;const pts=s.pts.slice().sort((a,b)=>a[0]-b[0]);
    const d=pts.map((p,i)=>(i?'L':'M')+sx(p[0]).toFixed(1)+','+sy(p[1]).toFixed(1)).join('');
    if(s.area&&pts.length>1)g+=`<path d="${d}L${sx(pts[pts.length-1][0]).toFixed(1)},${sy(0)}L${sx(pts[0][0]).toFixed(1)},${sy(0)}Z" fill="${s.color}" fill-opacity=".12"/>`;
    const dash=s.style==='dash'?'stroke-dasharray="7 5"':s.style==='dot'?'stroke-dasharray="1.5 5" stroke-linecap="round"':'';
    g+=`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.style==='dot'?3:2}" stroke-linejoin="round" ${dash} ${s.style?'opacity=".9"':''}/>`;
    if(s.dots)for(const p of pts)g+=`<circle cx="${sx(p[0]).toFixed(1)}" cy="${sy(p[1]).toFixed(1)}" r="4" fill="${s.color}" style="stroke:var(--surface)" stroke-width="2"/>`;
    if(s.endLabel){const p=pts[pts.length-1];g+=`<text x="${Math.min(sx(p[0]),W-pr)-2}" y="${sy(p[1])-9}" text-anchor="end" font-size="11.5" font-weight="600" style="fill:var(--fg)">${esc(s.endLabel)}</text>`}
  }
  g+=`<line class="guide" x1="0" x2="0" y1="${pt}" y2="${H-pb}" style="stroke:var(--fg-2)" stroke-width="1" visibility="hidden"/><rect class="hit" x="${pl}" y="${pt}" width="${W-pl-pr}" height="${H-pt-pb}" fill="transparent"/>`;
  CHARTS[id]={cfg,sx,W,xMin,xMax,pl,pr};
  return`<div class="chart" id="${id}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(cfg.label||'Gráfico')}">${g}</svg><div class="tip" hidden></div></div>`;
}
function attachCharts(){
  for(const id of Object.keys(CHARTS)){
    const el=document.getElementById(id);if(!el||el.dataset.on)continue;el.dataset.on='1';const C=CHARTS[id];const svg=el.querySelector('svg'),tip=el.querySelector('.tip'),guide=el.querySelector('.guide');
    const move=ev=>{
      const rc=svg.getBoundingClientRect();const vx=(ev.clientX-rc.left)/rc.width*C.W;const x=C.xMin+(vx-C.pl)/(C.W-C.pl-C.pr)*(C.xMax-C.xMin);
      let bestX=null,bd=1e18;for(const s of C.cfg.series)for(const p of s.pts){const dd=Math.abs(p[0]-x);if(dd<bd){bd=dd;bestX=p[0]}}
      if(bestX==null)return;
      const rows=C.cfg.series.map(s=>{const p=s.pts.find(q=>Math.abs(q[0]-bestX)<432e5);return p?`<div><span style="display:inline-flex;align-items:center;gap:6px"><i class="sw" style="background:${s.color}"></i>${esc(s.name)}</span><b class="num" style="margin:0;color:var(--fg)">${C.cfg.fmt?C.cfg.fmt(p[1]):fmt(p[1])}</b></div>`:''}).join('');
      if(!rows){tip.hidden=true;return}
      tip.innerHTML=`<b>${longDate(fmtD(bestX))}</b>${rows}`;tip.hidden=false;
      const px=C.sx(bestX);guide.setAttribute('x1',px);guide.setAttribute('x2',px);guide.setAttribute('visibility','visible');
      const left=px/C.W*rc.width;const tw=tip.offsetWidth;tip.style.left=Math.max(0,Math.min(rc.width-tw,left-tw/2))+'px';tip.style.top='-8px';tip.style.transform='translateY(-100%)';
    };
    svg.addEventListener('pointermove',move);svg.addEventListener('pointerdown',move);
    svg.addEventListener('pointerleave',()=>{tip.hidden=true;guide.setAttribute('visibility','hidden')});
  }
}
/* ================= cuerpo (músculos) ================= */
const SIL_HALF=`<path d="M100,64 L100,198 L74,198 Q64,160 60,124 L58,84 Q62,70 78,66 Z"/><path d="M58,76 Q44,80 42,100 L38,150 Q46,156 56,150 L60,104 Z"/><path d="M38,150 Q34,182 32,212 L46,214 Q52,182 56,150 Z"/><ellipse cx="39" cy="224" rx="8" ry="11"/><path d="M74,196 L100,196 L100,232 L70,230 Z"/><path d="M70,226 L99,230 L96,302 Q85,308 74,302 Q68,262 70,226 Z"/><path d="M74,304 Q85,310 96,304 L93,382 L79,382 Q72,340 74,304 Z"/><ellipse cx="86" cy="390" rx="12" ry="6"/>`;
const FRONT_M=[['trapecio','M91,60 Q80,66 70,72 L90,70 Z'],['deltoide_ant','M70,72 Q54,72 47,92 Q55,98 62,92 Q66,82 72,78 Z'],['deltoide_lat','M51,78 Q42,86 41,100 L45,100 Q46,88 55,80 Z'],['pecho_sup','M72,76 Q86,72 99,74 L99,86 Q86,86 71,90 Z'],['pecho_medio','M71,90 Q86,86 99,86 L99,99 Q86,101 72,104 Z'],['pecho_inf','M72,104 Q86,101 99,99 L99,110 Q88,116 77,114 Z'],['serrato','M66,110 L75,116 L73,134 L64,124 Z'],['biceps','M49,100 Q59,104 58,120 L55,146 Q46,146 43,132 Q43,112 49,100 Z'],['antebrazo','M41,156 L54,156 L47,210 L36,208 Z'],['abdomen','M87,118 L99,116 L99,192 L89,192 Q85,154 87,118 Z'],['oblicuos','M75,120 L86,118 Q84,154 88,192 L77,190 Q71,152 75,120 Z'],['cuadriceps','M72,234 L97,236 L95,296 Q85,302 75,296 Q70,264 72,234 Z']];
const BACK_M=[['trapecio','M99,58 Q84,64 70,72 L86,90 L99,114 Z'],['deltoide_post','M70,72 Q54,72 47,92 Q55,98 62,92 Q66,82 72,78 Z'],['deltoide_lat','M51,78 Q42,86 41,100 L45,100 Q46,88 55,80 Z'],['romboides','M86,84 L99,80 L99,110 L89,102 Z'],['dorsal','M66,92 L86,102 L97,124 L94,152 Q80,144 70,124 Q64,108 66,92 Z'],['triceps','M49,98 Q60,102 58,120 L55,146 Q45,144 43,128 Q43,110 49,98 Z'],['antebrazo','M41,156 L54,156 L47,210 L36,208 Z'],['lumbar','M86,152 L99,154 L99,192 L84,192 Q84,170 86,152 Z'],['gluteos','M72,198 L99,198 L99,238 Q82,242 71,228 Z'],['isquios','M72,242 L97,244 L95,300 Q85,306 75,300 Q70,270 72,242 Z'],['gemelos','M75,306 L95,306 Q97,330 92,352 L81,352 Q73,330 75,306 Z']];
function bodySVG(list,fillOf,label){
  const half=list.map(([m,d])=>`<path class="mz${UI.musSel===m?' sel':''}" data-act="mus" data-m="${m}" d="${d}" style="fill:${fillOf(m)}"><title>${esc(MUSCLES[m])}</title></path>`).join('');
  const abs=label==='Frente'?'<g style="stroke:var(--bg)" stroke-width="1.2"><line x1="88" y1="136" x2="112" y2="136"/><line x1="88" y1="154" x2="112" y2="154"/><line x1="89" y1="172" x2="111" y2="172"/><line x1="100" y1="116" x2="100" y2="192"/></g>':'<line x1="100" y1="60" x2="100" y2="192" style="stroke:var(--bg)" stroke-width="1.2"/>';
  return`<figure><svg viewBox="0 0 200 404" role="img" aria-label="Músculos, vista ${label}"><g class="sil"><ellipse cx="100" cy="34" rx="18" ry="21"/><rect x="91" y="50" width="18" height="16" rx="5"/>${SIL_HALF}<g transform="translate(200 0) scale(-1 1)">${SIL_HALF}</g></g>${half}<g transform="translate(200 0) scale(-1 1)">${half}</g>${abs}</svg><figcaption>${label}</figcaption></figure>`;
}

/* ================= vistas (versión web) ================= */
function weeklyBars(){
  const t=today();const mon=mondayOf(t);const weeks=[];const T=tracked();
  for(let w=7;w>=0;w--){const start=addDays(mon,-7*w);const v={};for(const e of T)v[e]=0;let other=0;for(let k=0;k<7;k++){const L=LOGS[addDays(start,k)];if(!L)continue;for(const[x,e]of Object.entries(L.ex||{})){const p=entryPts(x,e);if(T.includes(x))v[x]+=p;else other+=p}}weeks.push({start,v,other,tot:T.reduce((a,e)=>a+v[e],0)+other})}
  const W=chartW(),H=Math.max(200,Math.round(W*.42)),pl=44,pr=10,pt=20,pb=30;const ymax=niceMax(Math.max(10,...weeks.map(w=>w.tot))*1.1);
  const bw=(W-pl-pr)/weeks.length;const sy=y=>H-pb-(y/ymax)*(H-pt-pb);let g='';
  for(let i=0;i<=4;i++){const v=ymax*i/4;g+=`<line x1="${pl}" x2="${W-pr}" y1="${sy(v)}" y2="${sy(v)}" style="stroke:var(--line)"/><text x="${pl-8}" y="${sy(v)+4}" text-anchor="end" font-size="11" style="fill:var(--fg-3)">${fmt(v)}</text>`}
  const keys=T.concat(['__o']);
  weeks.forEach((w,i)=>{const x=pl+i*bw+bw*.2,wd=bw*.6;let base=0;
    keys.forEach((e,j)=>{const v=e==='__o'?w.other:w.v[e];if(v<=0)return;const y0=sy(base),y1=sy(base+v);const top=keys.slice(j+1).every(q=>(q==='__o'?w.other:w.v[q])<=0);
      g+=`<rect x="${x}" y="${y1}" width="${wd}" height="${Math.max(0,y0-y1-(base>0?2:0))}" rx="${top?3:0}" fill="${e==='__o'?OTHER_COLOR:exColor(e)}"><title>${e==='__o'?'Otros':esc(exDef(e).short)}: ${fmt(v)} PP (semana del ${niceDate(w.start)})</title></rect>`;base+=v});
    if(w.tot>0)g+=`<text x="${x+wd/2}" y="${sy(w.tot)-6}" text-anchor="middle" font-size="11" style="fill:var(--fg-2)">${fmt(w.tot)}</text>`;
    g+=`<text x="${x+wd/2}" y="${H-10}" text-anchor="middle" font-size="10.5" style="fill:var(--fg-3)">${niceDate(w.start)}</text>`});
  return`<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="PP de entrenamiento por semana">${g}</svg></div>`;
}
const TABS=[['inicio','Inicio'],['registro','Registro'],['misiones','Misiones'],['evolucion','Evolución'],['musculos','Músculos'],['inventario','Inventario'],['hazanas','Hazañas'],['pokedex','Pokédex'],['liga','Liga'],['perfil','Perfil']];
function renderTabs(){
  const day=S&&S.days[today()];let mis=0;if(day)mis=day.offers.filter(m=>day.accepted.includes(m.id)&&!day.done[m.id]).length;
  const objReadyN=S?S.objectives.filter(objReady).length:0;
  const inv=S?S.inventory.filter(i=>i.status==='active'&&i.expires&&diffDays(today(),i.expires)<=3&&diffDays(today(),i.expires)>=0).length:0;
  const badge={misiones:mis+(day&&!day.objClaimed?objReadyN:0),inventario:inv};
  $('#tabs').innerHTML=TABS.map(([k,l])=>`<button class="tab" data-act="tab" data-v="${k}" ${UI.view===k?'aria-current="page"':''}>${l}${badge[k]?`<span class="dot">${badge[k]}</span>`:''}</button>`).join('');
}
function renderHeader(){
  $('#hdr-emb').innerHTML=emblem(D.level,'');
  const tit=effectOn('dishonor',today())?' · deshonrado':curTitle()?' · «'+curTitle()+'»':'';
  $('#hdr-sub').textContent=`${S.profile.nick||'Jugador'} · ${levelName(D.level)} · ${fmt(D.total)} PP · racha ${D.streakNow}${tit}`;
}
function refLine(i){return tracked().slice(0,3).map(e=>`${esc(exDef(e).short)} ${refRange(i,e)}`).join(' · ')}

function vInicio(){
  const L=D.level,t=tierOf(L),T=TIERS[t];const lo=THRESH[L],hi=L<MAXL?THRESH[L+1]:THRESH[L];
  const pct=L<MAXL?clamp((D.total-lo)/(hi-lo)*100,0,100):100;const dis=effectOn('dishonor',today());const tit=curTitle();
  const day=S.days[today()]||{offers:[],accepted:[],done:{}};const acc=day.accepted.length,dn=day.accepted.filter(id=>day.done[id]).length;
  const td=D.perDay[today()];const sb=Math.round(Math.min(.3,.02*Math.max(0,D.streakNow-1))*100);
  const caps=tracked().map(e=>{const r=exParams(e).ref;const step=exDef(e).metric==='secs'?5:exDef(e).metric==='load'?10:1;const a=r[L],b=L<MAXL?r[L+1]-step:r[L]*1.1,v=D.rec[e]||0;const capMax=Math.max(r[Math.min(MAXL,L+3)],v)*1.08||10;
    return`<div class="cap"><div class="cap-name"><i class="sw" style="background:${exColor(e)}"></i>${esc(exDef(e).short)}</div><div class="cap-track"><div class="cap-band" style="left:${a/capMax*100}%;width:${Math.max(1,(b-a+step)/capMax*100)}%"></div><div class="cap-mark" style="left:${clamp(v/capMax*100,0,100)}%"></div></div><div class="cap-val num">${fmt1(v)} <span class="faint">/ ${refRange(L,e)}</span></div></div>`}).join('');
  const effs=activeEffects(today()).map(e=>({boost:['st-good','Elixir ×1,5 activo hoy'],fatigue:['st-bad','Fatiga: ×0,75 hoy'],nostreak:['st-warn','Racha sin bono'],dishonor:['st-bad','Deshonra: título oculto'],sealed:['st-warn','Sello: sin cambios de objetivo'],curse:['st-serious','Maldición: próxima recompensa rebajada']}[e.type])).filter(Boolean);
  const shields=S.inventory.filter(i=>i.rid==='itm_escudo'&&i.status==='active').length;if(shields)effs.push(['st-info',`Escudo de Rango listo${shields>1?' ×'+shields:''}`]);
  if((S.freezeDays||[]).includes(today()))effs.push(['st-info','Comodín: hoy cuenta para la racha']);
  const recent=S.inventory.slice().reverse().slice(0,6);
  const ladder=THRESH.map((p,i)=>`<div class="lad ${i===L?'cur':''} ${i>L?'locked':''}">${emblem(i)}<div><div class="lad-name">${levelName(i)}</div><div class="lad-ref num">${refLine(i)}</div></div><div class="lad-pp num">${fmt(p)} PP</div></div>`).reverse().join('');
  return`
  <section class="hero">${emblem(L)}<div style="min-width:0"><div class="eyebrow">Tu rango · ${T.metal}</div><h1 class="display rank-name">${levelName(L)}</h1>
   ${tit?`<div class="title-chip ${dis?'dis':''}">${dis?'Título oculto por deshonra':'«'+esc(tit)+'»'}</div>`:''}
   <p class="lore" style="margin-top:6px">${esc(L>=MAXL?TIERS[7].lore:T.lore)}</p><div class="pp num">${fmt(D.total)} <small>puntos de progreso (PP)</small></div></div>
   <div class="prog"><div class="bar"><span style="width:${pct}%"></span></div><div class="bar-meta num"><span>${L<MAXL?`Faltan <b>${fmt(hi-D.total)} PP</b> para ${levelName(L+1)}`:'Llegaste a la cima.'}</span><span>${fmt(lo)} → ${L<MAXL?fmt(hi):'∞'}</span></div></div></section>
  <div class="kpis"><div class="kpi"><span>Racha</span><b class="num">${D.streakNow} ${D.streakNow===1?'día':'días'}</b><span>${sb?`Bono +${sb} %`:'Sin bono aún'}</span></div><div class="kpi"><span>Hoy</span><b class="num">${td?'+'+fmt(td.pts):'—'}</b><span>${td?'PP ganados':'Sin registro'}</span></div><div class="kpi"><span>Misiones</span><b class="num">${dn}/${acc||0}</b><span>${acc?'completadas':'ninguna aceptada'}</span></div></div>
  ${!td?`<div class="row" style="margin-top:12px"><button class="btn block" data-act="tab" data-v="registro">Registrar el entrenamiento de hoy</button></div>`:''}
  ${effs.length?`<section class="sec"><div class="sec-head"><h2 class="sec-title">Efectos activos</h2></div><div class="effects">${effs.map(([c,x])=>`<span class="st ${c}">${x}</span>`).join('')}</div></section>`:''}
  <section class="sec"><div class="sec-head"><h2 class="sec-title">Tu capacidad vs tu rango</h2><span class="sec-note">Promedio de tus últimas 3 sesiones</span></div>
   <div class="card">${caps||'<div class="empty">Agrega ejercicios principales en tu perfil.</div>'}</div>
   <p class="sec-note">La franja marca el volumen diario de referencia de ${levelName(L)}, calculado desde tu propia base. Tu rango es personal: no se compara con nadie.</p></section>
  <section class="sec"><div class="sec-head"><h2 class="sec-title">Últimas recompensas</h2><button class="btn ghost sm" data-act="tab" data-v="inventario">Inventario</button></div>
   ${recent.length?`<div class="inv">${recent.map(invCard).join('')}</div>`:'<div class="empty">Completa misiones y objetivos para llenar tu inventario.</div>'}</section>
  <section class="sec"><div class="sec-head"><h2 class="sec-title">Escalera de rangos</h2><span class="sec-note">Volumen diario de referencia</span></div><div class="card"><div class="ladder">${ladder}</div></div>
   <p class="sec-note">Subes con PP: tu entrenamiento del día (escalado para que tu base valga unos 40 PP), bono de racha, récords, misiones, objetivos y cofres semanales. Las penalizaciones restan PP y pueden bajarte de división.</p></section>`;
}

function exInputs(id,e){
  const X=exDef(id);e=e||{};const v=k=>e[k]!=null&&e[k]!==0?e[k]:'';
  if(X.metric==='reps'||X.metric==='secs'){const f=X.metric==='reps'?'reps':'secs';return`<div class="stepper"><button type="button" data-act="step" data-ex="${id}" data-f="${f}" data-d="-1" aria-label="Restar">−</button><input type="number" inputmode="numeric" min="0" id="in-${id}-${f}" value="${v(f)}" placeholder="0" aria-label="${esc(X.name)}"><button type="button" data-act="step" data-ex="${id}" data-f="${f}" data-d="1" aria-label="Sumar">+</button></div>`}
  if(X.metric==='load')return`<div class="multi"><label class="fl">Series<input type="number" inputmode="numeric" min="0" id="in-${id}-sets" value="${v('sets')}"></label><label class="fl">Reps<input type="number" inputmode="numeric" min="0" id="in-${id}-reps" value="${v('reps')}"></label><label class="fl">Kg<input type="number" inputmode="decimal" min="0" step="0.5" id="in-${id}-kg" value="${v('kg')}"></label></div>`;
  return`<div class="multi"><label class="fl">Min<input type="number" inputmode="numeric" min="0" id="in-${id}-min" value="${v('min')}"></label><label class="fl">Km<input type="number" inputmode="decimal" min="0" step="0.1" id="in-${id}-km" value="${v('km')}"></label></div>`;
}
function allExIds(){return Object.keys(EX).concat(Object.keys(S.customEx||{})).filter(id=>exAvailable(id))}
function vRegistro(){
  const date=UI.regDate||today();const L=LOGS[date];const t=today();const lv=D.level;
  const rows=[...new Set([...tracked(),...Object.keys((L&&L.ex)||{}),...UI.extraRows])].filter(id=>exDef(id));
  const notIn=allExIds().filter(id=>!rows.includes(id));
  const hist=D.dates.slice().reverse().slice(0,14).map(d=>{const pd=D.perDay[d];const others=Object.keys(LOGS[d].ex||{}).filter(k=>!tracked().includes(k)&&entryPts(k,LOGS[d].ex[k])>0);return`<button class="hist-row" data-act="regdate" data-d="${d}"><span class="num">${niceDate(d)}</span><span class="hist-vals num">${tracked().map(e=>`<span><i class="sw" style="background:${exColor(e)}"></i> ${fmt(pd.core[e]||0)}</span>`).join('')}${others.length?`<span>+${others.length} otro${others.length>1?'s':''}</span>`:''}</span><span class="num">+${fmt(pd.pts)} PP</span></button>`}).join('');
  return`
  <section class="sec" style="margin-top:0"><div class="sec-head"><h2 class="sec-title">Registro diario</h2><span class="sec-note">Total del día por ejercicio, sumando series</span></div>
   <label class="fl" style="max-width:240px">Fecha<input type="date" id="reg-date" max="${t}" value="${date}"></label>
   ${date!==t?`<div class="banner">Estás editando el ${longDate(date)}. ${dayOpen(date)?'Sus misiones aún pueden completarse.':'Ese día ya cerró: cuenta para PP, racha y gráficos, pero no para misiones.'}</div>`:''}
   <div class="ex-list">${rows.map(id=>{const X=exDef(id);const ref=tracked().includes(id)?`Ref. ${levelName(lv)}: ${refRange(lv,id)} ${unitOf(id)}`:METRIC_LABEL[X.metric];return`<div class="ex-row"><div class="ex-name"><b><i class="sw" style="background:${exColor(id)}"></i>${esc(X.name)}</b><small>${esc(ref)}</small></div>${exInputs(id,L&&L.ex&&L.ex[id])}</div>`}).join('')}</div>
   ${notIn.length?`<select id="add-ex-day" aria-label="Agregar ejercicio a este día"><option value="">Agregar otro ejercicio a este día…</option>${notIn.map(id=>`<option value="${id}">${esc(exDef(id).name)}</option>`).join('')}</select>`:''}
   <div class="row"><button class="btn grow" data-act="save-log">Guardar ${date===t?'hoy':niceDate(date)}</button>${L?`<button class="btn danger" data-act="del-log">Borrar día</button>`:''}</div></section>
  ${UI.analysis&&UI.analysis.date===date?vAnalysis(UI.analysis):''}
  <section class="sec"><div class="sec-head"><h2 class="sec-title">Ejercicios principales</h2><span class="sec-note">Definen tu rango, tus misiones y tus objetivos</span></div>
   <div class="tracked">${tracked().map(id=>`<span class="tchip"><i class="sw" style="background:${exColor(id)}"></i>${esc(exDef(id).short||exDef(id).name)} <span class="faint">base ${esc(entryText(id,S.profile.base[id]))}</span>${tracked().length>1?`<button data-act="untrack" data-ex="${id}" aria-label="Quitar ${esc(exDef(id).name)}">×</button>`:''}</span>`).join('')}</div>
   ${tracked().length<6?`<div class="row"><select id="track-sel" class="grow" aria-label="Agregar ejercicio principal"><option value="">Agregar ejercicio principal…</option>${allExIds().filter(id=>!tracked().includes(id)).map(id=>`<option value="${id}">${esc(exDef(id).name)}</option>`).join('')}</select><button class="btn ghost" data-act="custom-ex">Crear ejercicio</button></div>`:'<p class="sec-note">Máximo 6 ejercicios principales.</p>'}</section>
  <section class="sec"><div class="sec-head"><h2 class="sec-title">Historial</h2><span class="sec-note">Toca un día para editarlo</span></div><div class="card">${hist?`<div class="hist">${hist}</div>`:'<div class="empty">Todavía no hay días registrados.</div>'}</div></section>`;
}
function vAnalysis(a){
  return`<section class="sec"><div class="sec-head"><h2 class="sec-title">Análisis del ${a.date===today()?'día':niceDate(a.date)}</h2></div><div class="card analysis">
   <div class="an-total"><b class="num">+${fmt(a.pts)} PP</b><span class="muted">Total ${fmt(a.total)} PP</span></div>
   <div class="an-parts">${a.parts.map(p=>`<span class="chip">${esc(p)}</span>`).join('')}</div>
   ${a.rows.length?`<div class="cmp num"><span class="faint">Ejercicio</span><span class="faint">Hoy vs tu promedio previo</span><span class="faint">vs curva</span>${a.rows.map(r=>`<span><i class="sw" style="background:${exColor(r.ex)}"></i> ${esc(exDef(r.ex).short)}</span><span>${fmt(r.v)} <span class="faint">(prom. ${r.prev==null?'—':fmt1(r.prev)})</span> ${r.prev==null?'':r.v>r.prev?'<span class="st st-good">▲</span>':r.v<r.prev?'<span class="st st-warn">▼</span>':''}</span><span>${r.exp==null?'—':(r.v>=r.exp?`<span class="st st-good">+${Math.round((r.v/r.exp-1)*100)} %</span>`:`<span class="st st-warn">${Math.round((r.v/r.exp-1)*100)} %</span>`)}</span>`).join('')}</div>`:''}
   ${a.missions.length?`<p><b>Misiones completadas:</b> ${a.missions.map(esc).join(', ')}</p>`:''}${a.records.length?`<p><b>Récords:</b> ${a.records.map(esc).join(', ')}</p>`:''}
   <p class="muted">${esc(a.tip)}</p></div></section>`;
}
function buildAnalysis(date,prevTotal,missions,records){
  compute();const pd=D.perDay[date];if(!pd)return{date,pts:0,parts:['Día sin entrenamiento'],rows:[],missions,records,tip:'Día vacío guardado.',total:D.total};
  const parts=[`Entrenamiento ${pd.base}`];if(pd.sMult>1)parts.push(`Racha ×${pd.sMult.toFixed(2).replace('.',',')}`);if(pd.mult>1)parts.push('Elixir ×1,5');if(pd.mult<1)parts.push('Fatiga ×0,75');
  for(const e of pd.prs)parts.push(`Récord ${lc(exDef(e).short)} +15`);if(pd.overload)parts.push('Sobrecarga progresiva +10');if(pd.curve)parts.push('Sobre la curva +10');
  const prevDs=D.dates.filter(d=>d<date).slice(-3);
  const rows=tracked().filter(e=>pd.core[e]>0).map(e=>{const pv=prevDs.map(d=>D.perDay[d].core[e]).filter(x=>x>0);const P=projection(e);let exp=null;if(P&&P.expected){const x=P.expected.find(q=>q.d===date);if(x)exp=Math.round(x.v)}return{ex:e,v:pd.core[e],prev:pv.length?avg(pv):null,exp}});
  const P=S.profile;let tip;const jump=rows.find(r=>r.prev&&r.v>r.prev*1.3);const drop=rows.filter(r=>r.prev&&r.v<r.prev*.85).length>=Math.max(1,Math.ceil(rows.length/2));
  const prot=P.weight?Math.round(P.weight*1.6):null;
  if(jump)tip=`Subida grande en ${lc(exDef(jump.ex).short)}. Cuida la técnica: el progreso sostenible es gradual, semana a semana.`;
  else if(drop&&rows.length)tip='Día más bajo que tus anteriores. Pasa: duerme bien y mañana vuelve al promedio; la tendencia importa más que un día.';
  else if(D.streakNow>=6)tip='Llevas varios días seguidos. Si sientes articulaciones cargadas, haz un día liviano: también suma racha.';
  else tip=[P.body==='ecto'?`Como ectomorfo, recuperarte depende mucho de comer suficiente: proteína en cada comida (≈1,6 g por kg${prot?`, unos ${prot} g al día`:''}) y algo más de calorías.`:`La recuperación también entrena: proteína en cada comida (≈1,6 g por kg${prot?`, unos ${prot} g al día`:''}) y buen sueño.`,'Técnica antes que número: una repetición limpia vale más para el músculo que dos a medias.','Repartir el volumen en varias series durante el día suele dar más total que una sola sesión agotadora.','Si algo duele (no confundir con cansancio), baja la intensidad antes que el número de días.'][hashSeed(date)%4];
  return{date,pts:pd.pts,parts,rows,missions,records,tip,total:D.total};
}

function missionProgress(m){
  const L=LOGS[today()];const t=m.t||{};
  switch(m.key){case'ex_up':case'ex_up3':return`Hoy: ${fmt(valOf(L,t.ex))}/${fmt(t.v)} ${unitOf(t.ex)}`;case'pp_day':case'debt':return`Hoy: ${fmt(dayTrainPP(L))}/${fmt(t.pp)} PP`;
   case'trinity':case'crown':case'ladder':return'Hoy: '+Object.entries(t.each||{}).map(([e,v])=>`${exDef(e).short} ${fmt(valOf(L,e))}/${fmt(v)}`).join(' · ');
   case'present':return`Hoy: ${tracked().filter(e=>valOf(L,e)>0).length}/${tracked().length} ejercicios`;case'pr_any':return'Récords: '+tracked().map(e=>`${exDef(e).short} ${fmt(Math.max(D.best[e]||0,baseVal(e)))}`).join(' · ')}return'';
}
function missionCard(m,day){
  const accepted=day.accepted.includes(m.id),done=!!day.done[m.id],failed=day.failed.includes(m.id),pard=(day.pardoned||[]).includes(m.id);
  const full=day.accepted.filter(id=>!(day.pardoned||[]).includes(id)).length>=3;const pi=penInfo(m.penalty);let act='';
  if(done)act='<span class="st st-good">Completada</span>';else if(failed)act='<span class="st st-bad">Fallida</span>';else if(pard)act='<span class="st st-muted">Indultada</span>';
  else if(accepted){
    if(m.kind==='auto')act=`<span class="faint num" style="font-size:13px">${esc(missionProgress(m))}</span><span class="st st-info">Se completa sola al registrar</span>`;
    else if(m.kind==='check'){const ok=m.ex?valOf(LOGS[today()],m.ex)>0:hasSession(LOGS[today()]);act=`<button class="btn sm" data-act="m-check" data-id="${m.id}" ${ok?'':'disabled'}>Lo hice</button>${ok?'':`<span class="faint" style="font-size:12.5px">Primero registra ${m.ex?lc(exDef(m.ex).name):'tu entrenamiento'} de hoy</span>`}`}
    else act=`<button class="btn sm" data-act="m-manual" data-id="${m.id}">Registrar y completar</button>`;
  } else if(UI.confirm===m.id)act=`<button class="btn sm" data-act="m-accept" data-id="${m.id}">Confirmar: acepto el riesgo</button><button class="btn ghost sm" data-act="m-cancel">Cancelar</button>`;
  else act=`<button class="btn sm ${full?'ghost':''}" data-act="m-pre" data-id="${m.id}" ${full?'disabled':''}>${full?'Ya tienes 3 misiones':'Aceptar misión'}</button>`;
  const cls=m.forced?'debt':done?'done':failed?'fail':accepted?'acc':'';
  return`<article class="mcard ${cls}"><div class="m-top"><div><div class="eyebrow">${m.forced?'Obligatoria':MT_BY[m.key]&&MT_BY[m.key].pool==='other'?'Complementaria':'Principal'}</div><div class="m-title">${esc(m.title)}</div></div>${stars(m.diff)}</div>
   <p class="m-desc">${esc(m.desc)}</p>
   <div class="m-io"><div class="m-box"><span class="eyebrow">Recompensa</span><span><b class="num">${m.pts?'+'+m.pts+' PP':'Saldar la deuda'}</b> ${m.forced?'':rarChip(m.rarity)}</span></div><div class="m-box pen"><span class="eyebrow">Si fallas · ${esc(pi.name)}</span><span>${esc(pi.text)}</span></div></div>
   <div class="row">${act}</div></article>`;
}
function objCard(o,day){
  const T=objTpl(o.key);if(!T)return'';const cur=objCur(o);const pct=clamp(cur/o.target*100,0,100);const ready=cur>=o.target;const claimed=!!day.objClaimed;const left=changesLeft();const sealed=effectOn('sealed',today());
  let act='';if(ready)act=claimed?'<span class="st st-muted">Listo · reclámalo mañana (1 por día)</span>':`<button class="btn sm" data-act="o-claim" data-id="${o.id}">Reclamar recompensa</button>`;else if(T.manual)act=`<button class="btn sm ghost" data-act="o-record" data-id="${o.id}">Registrar marca</button>`;
  act+=`<button class="btn sm ghost" data-act="o-change" data-id="${o.id}" ${left&&!sealed?'':'disabled'}>Cambiar</button>`;
  return`<article class="card obj"><div class="obj-top"><div><div class="eyebrow">${T.cat}</div><div class="obj-title">${esc(T.title(o.target))}</div><small class="faint">${esc(T.desc)}</small></div>${rarChip(o.rarity)}</div>
   <div class="bar thin"><span style="width:${pct}%"></span></div><div class="bar-meta num"><span>${ready?'<span class="ready">Cumplido</span>':`${fmt1(cur)} / ${fmt(o.target)}${T.unit?' '+T.unit:''}`}</span><span>+${o.pts} PP + recompensa</span></div><div class="row">${act}</div></article>`;
}
function vMisiones(){
  const t=today();const day=S.days[t];if(!day)return'<div class="loading">Preparando misiones…</div>';
  const accN=day.accepted.filter(id=>!(day.pardoned||[]).includes(id)).length;
  const dice=S.inventory.find(i=>i.rid==='itm_dado'&&i.status==='active');const ind=S.inventory.find(i=>i.rid==='itm_indulto'&&i.status==='active');const left=changesLeft();const sealed=effectOn('sealed',t);
  return`
  <section class="sec" style="margin-top:0"><div class="sec-head"><h2 class="sec-title">Misiones de hoy</h2><div class="counter" aria-label="${accN} de 3 aceptadas">${[0,1,2].map(i=>`<i class="${i<accN?'on':''}"></i>`).join('')}</div></div>
   <p class="sec-note">${longDate(t)} · modo ${esc((MODES.find(m=>m[0]===S.profile.mode)||MODES[1])[1].toLowerCase())}. Acepta hasta 3. Si una aceptada no se cumple antes de mañana a las 12:00, se aplica su castigo.</p>
   ${(dice||ind)?`<div class="row">${dice?`<button class="btn ghost sm" data-act="use-item" data-iid="${dice.iid}">🎲 Tirar de nuevo las no aceptadas</button>`:''}${ind&&accN?`<button class="btn ghost sm" data-act="use-item" data-iid="${ind.iid}">⚖️ Usar Indulto</button>`:''}</div>`:''}
   <div class="mlist">${day.offers.map(m=>missionCard(m,day)).join('')}</div></section>
  <section class="sec"><div class="sec-head"><h2 class="sec-title">Objetivos</h2><span class="sec-note">${day.objClaimed?'Ya reclamaste 1 hoy':'Puedes reclamar 1 hoy'} · ${sealed?'Sello activo: sin cambios':`${left} cambio${left===1?'':'s'} disponible${left===1?'':'s'}`}</span></div>
   <div class="mlist">${S.objectives.map(o=>objCard(o,day)).join('')}</div></section>
  ${S.scars.length?`<section class="sec"><div class="sec-head"><h2 class="sec-title">Castigos recientes</h2></div><div class="card">${S.scars.slice(-4).reverse().map(s=>`<div class="scar"><span><b>${esc(s.title)}</b><br><span class="faint">${esc(s.penalty)}</span></span><span class="faint num">${niceDate(s.date)}</span></div>`).join('')}</div></section>`:''}`;
}

function vEvolucion(){
  const logged=new Set();for(const L of Object.values(LOGS))for(const k of Object.keys(L.ex||{}))if(!tracked().includes(k)&&exDef(k))logged.add(k);
  const all=tracked().concat([...logged]);if(!all.includes(UI.evoEx))UI.evoEx=all[0];
  const ex=UI.evoEx;let body='';
  if(!ex)body='<div class="empty">Aún no hay datos.</div>';
  else{const X=exDef(ex);const color=exColor(ex);const P=projection(ex);
    if(!P||!P.sess.length)body='<div class="empty">Aún no hay registros de este ejercicio.</div>';
    else{const t=today();const xMin=parseD(P.sess[0].d)-864e5;const hasModel=!!P.proj;const xMax=hasModel?parseD(addDays(t,30)):Math.max(parseD(t),parseD(P.sess[P.sess.length-1].d))+864e5;
      const series=[{name:'Real',color,pts:P.sess.filter(s=>!s.base).map(s=>[parseD(s.d),s.v]),dots:true,area:true}];
      const bs=P.sess.find(s=>s.base);if(bs)series.push({name:'Base',color:'#c9cfe0',pts:[[parseD(bs.d),bs.v]],dots:true});
      const refs=[];
      if(hasModel){series.push({name:'Curva esperada',color:'#c9cfe0',pts:P.expected.map(s=>[parseD(s.d),Math.round(s.v)]),style:'dash'});series.push({name:'Proyección',color,pts:P.proj.filter((_,i)=>i%2===0||i===30).map(s=>[parseD(s.d),Math.round(s.v)]),style:'dot',endLabel:'~'+fmt(P.proj[30].v)});
        if(D.level<MAXL)refs.push({y:exParams(ex).ref[D.level+1],label:`${levelName(D.level+1)}: ${fmt(exParams(ex).ref[D.level+1])}`})}
      body=`<div class="legend"><span style="color:${color}"><i class="lg-line"></i><span class="muted">Real (${esc(unitOf(ex))})</span></span>${hasModel?`<span style="color:#c9cfe0"><i class="lg-line dash"></i><span class="muted">Curva esperada (tu frecuencia)</span></span><span style="color:${color}"><i class="lg-line dot"></i><span class="muted">Proyección 30 días</span></span>`:''}</div>${lineChart('ch-evo',{series,xMin,xMax,refs,label:'Evolución de '+X.name})}`;
      if(hasModel){const rate=P.k/P.k0;
        body+=`<div class="model"><div><span>Frecuencia observada</span><b class="num">${fmt1(P.f*7)}</b><span>sesiones por semana</span></div><div><span>Ritmo personal</span><b class="num">×${fmt1(rate)}</b><span>${P.w>0?`vs tu modelo (${Math.round(P.w*100)} % calibrado con tus datos)`:'aún sin datos para calibrar'}</span></div><div><span>Esperado hoy</span><b class="num">${fmt(P.expNow)}</b><span>última sesión: ${fmt(P.last.v)}</span></div><div><span>En 30 días</span><b class="num">~${fmt(P.proj[30].v)}</b><span>si sigues a este ritmo</span></div></div>
        <div class="scroll-x"><table class="tbl"><thead><tr><th>Si entrenas…</th><th>+30 días</th><th>+60 días</th><th>+90 días</th></tr></thead><tbody>${P.scen.map(s=>`<tr class="${Math.abs(s.f-P.f)<.12?'hl':''}"><td>${s.label}</td><td>${fmt(s.v30)}</td><td>${fmt(s.v60)}</td><td>${fmt(s.v90)}</td></tr>`).join('')}</tbody></table></div>
        <p class="sec-note">Modelo de adaptación con techo, ajustado a tu cuerpo, edad y experiencia: cada sesión acerca tu volumen diario a un máximo realista (${fmt(P.C)} ${esc(unitOf(ex))}) con rendimientos decrecientes. Entrenar a diario suma más que cada 2 días, pero no el doble. Tras 4 días sin entrenar empiezas a perder adaptación. Con más registros, el ritmo se ajusta a lo que logras.</p>`}}}
  const t=today();const start=D.dates[0]||S.profile.created||t;let acc=0;const byD={};for(const e of S.ledger)byD[e.d]=(byD[e.d]||0)+e.pts;
  const firstLedger=S.ledger.length?S.ledger.map(e=>e.d).sort()[0]:start;const s0=start<firstLedger?start:firstLedger;const cum=[];
  for(let d=s0;d<=t;d=addDays(d,1)){acc+=(D.perDay[d]?D.perDay[d].pts:0)+(byD[d]||0);cum.push([parseD(d),Math.max(0,acc)])}
  const L=D.level;const prefs=[];for(let i=L+1;i<=Math.min(MAXL,L+2);i++)prefs.push({y:THRESH[i],label:`${levelName(i)} · ${fmt(THRESH[i])}`});
  const accHex=(getComputedStyle(document.documentElement).getPropertyValue('--accent')||'').trim()||'#e3986a';
  const ptsChart=lineChart('ch-pts',{series:[{name:'PP acumulados',color:accHex,pts:cum,area:true}],xMin:parseD(s0)-864e5,xMax:parseD(t)+864e5*2,refs:prefs,label:'Puntos de progreso acumulados'});
  return`
  <section class="sec" style="margin-top:0"><div class="sec-head"><h2 class="sec-title">Evolución</h2></div>
   <div class="seg" role="group" aria-label="Ejercicio">${all.map(k=>`<button data-act="evo" data-ex="${k}" aria-pressed="${k===ex}"><i class="sw" style="background:${exColor(k)}"></i>${esc(exDef(k).short||exDef(k).name)}</button>`).join('')}</div>
   <div class="card" style="display:flex;flex-direction:column;gap:12px">${body}</div></section>
  <section class="sec"><div class="sec-head"><h2 class="sec-title">Puntos de progreso</h2><span class="sec-note">Líneas: próximas divisiones</span></div><div class="card">${ptsChart}</div></section>
  <section class="sec"><div class="sec-head"><h2 class="sec-title">Esfuerzo semanal</h2><span class="sec-note">PP de entrenamiento por semana</span></div><div class="card"><div class="legend" style="margin-bottom:8px">${tracked().map(e=>`<span><i class="sw" style="background:${exColor(e)}"></i>${esc(exDef(e).short)}</span>`).join('')}<span><i class="sw" style="background:${OTHER_COLOR}"></i>Otros</span></div>${weeklyBars()}</div></section>`;
}

function vMusculos(){
  const per=UI.musPeriod;const{loads,byEx,max}=muscleLoads(per);
  const dom=m=>{const b=byEx[m];if(!b)return null;return Object.entries(b).sort((a,c)=>c[1]-a[1])[0][0]};
  const fillOf=m=>{const v=loads[m]||0;if(!v||!max)return'var(--m-empty)';const tt=v/max;if(UI.musMode==='heat')return`color-mix(in oklab, #ff7a45 ${Math.round(18+82*tt)}%, var(--m-empty))`;return`color-mix(in oklab, ${exColor(dom(m))} ${Math.round(30+70*tt)}%, var(--m-empty))`};
  const groups={};for(const[k,ms]of Object.entries(MGROUP))groups[k]=ms.reduce((a,m)=>a+(loads[m]||0),0);const gt=Object.values(groups).reduce((a,b)=>a+b,0);
  const usedEx=new Set();for(const[d,L]of Object.entries(LOGS)){if(per&&(diffDays(d,today())>=per||diffDays(d,today())<0))continue;for(const k of Object.keys(L.ex||{}))if(entryPts(k,L.ex[k])>0)usedEx.add(k)}
  const legend=UI.musMode==='heat'?`<div class="row" style="gap:8px;font-size:12.5px;color:var(--fg-2)"><span>Menos</span><span style="flex:1;max-width:200px;height:10px;border-radius:5px;background:linear-gradient(90deg,var(--m-empty),#ff7a45)"></span><span>Más carga</span></div>`:`<div class="legend">${[...usedEx].map(k=>`<span><i class="sw" style="background:${exColor(k)}"></i>${esc(exDef(k).short||exDef(k).name)}</span>`).join('')||'<span>Sin datos en este período</span>'}</div>`;
  let sel='';if(UI.musSel){const m=UI.musSel;const v=loads[m]||0;const tot=Object.values(loads).reduce((a,b)=>a+b,0);const share=tot?Math.round(v/tot*100):0;const contrib=byEx[m]?Object.entries(byEx[m]).sort((a,b)=>b[1]-a[1]):[];
    sel=`<div class="card" style="display:flex;flex-direction:column;gap:8px"><div class="row" style="justify-content:space-between"><b>${MUSCLES[m]}</b><span class="faint num">${v?share+' % de tu carga':'Sin carga en este período'}</span></div>${contrib.map(([k,x])=>`<div class="mbar"><span><i class="sw" style="background:${exColor(k)}"></i> ${esc(exDef(k).short||exDef(k).name)}</span><div class="bar"><span style="width:${x/contrib[0][1]*100}%;background:${exColor(k)}"></span></div><span class="num faint">${Math.round(x/v*100)} %</span></div>`).join('')}</div>`}
  const ranked=Object.keys(MUSCLES).map(m=>[m,loads[m]||0]).sort((a,b)=>b[1]-a[1]);const top=ranked.filter(r=>r[1]>0);const missing=ranked.filter(r=>r[1]===0).map(r=>MUSCLES[r[0]]);
  let bal='';if(gt>0){const pull=groups.tiron/gt,push=groups.empuje/gt;bal=push>.6&&pull<.15?`<p class="muted">Empuje ${Math.round(push*100)} % y tirón ${Math.round(pull*100)} %. Sin trabajo de tirón, los hombros tienden a irse hacia adelante. Las misiones te ofrecerán más ejercicios de tirón para equilibrar.</p>`:pull>=.15?'<p class="muted">Buen equilibrio entre empuje y tirón.</p>':''}
  const exList=[...new Set([...tracked(),...usedEx])].filter(exDef);
  return`
  <section class="sec" style="margin-top:0"><div class="sec-head"><h2 class="sec-title">Mapa muscular</h2></div>
   <div class="row" style="justify-content:space-between"><div class="seg" role="group" aria-label="Período">${[[7,'7 días'],[30,'30 días'],[0,'Todo']].map(([v,l])=>`<button data-act="mper" data-v="${v}" aria-pressed="${per===v}">${l}</button>`).join('')}</div><div class="seg" role="group" aria-label="Color">${[['heat','Intensidad'],['ex','Por ejercicio']].map(([v,l])=>`<button data-act="mmode" data-v="${v}" aria-pressed="${UI.musMode===v}">${l}</button>`).join('')}</div></div>
   <div class="card"><div class="bodies">${bodySVG(FRONT_M,fillOf,'Frente')}${bodySVG(BACK_M,fillOf,'Espalda')}</div>${legend}</div>
   <p class="sec-note">Toca un músculo para ver qué ejercicio lo está trabajando.</p>${sel}</section>
  <section class="sec"><div class="sec-head"><h2 class="sec-title">Equilibrio</h2></div><div class="card" style="display:flex;flex-direction:column;gap:10px">
   ${gt?`<div class="balance">${Object.keys(MGROUP).map(k=>groups[k]>0?`<span style="width:${groups[k]/gt*100}%;background:${MGROUP_COLOR[k]}" title="${MGROUP_NAME[k]}"></span>`:'').join('')}</div><div class="legend">${Object.keys(MGROUP).map(k=>`<span><i class="sw" style="background:${MGROUP_COLOR[k]}"></i>${MGROUP_NAME[k]} ${Math.round(groups[k]/gt*100)} %</span>`).join('')}</div>${bal}`:'<div class="empty">Sin entrenamientos en este período.</div>'}</div></section>
  ${top.length?`<section class="sec"><div class="sec-head"><h2 class="sec-title">Ranking de carga</h2></div><div class="card mbars">${top.map(([m,v])=>`<div class="mbar"><span>${MUSCLES[m]}</span><div class="bar"><span style="width:${v/max*100}%"></span></div><span class="num faint">${Math.round(v/max*100)}</span></div>`).join('')}${missing.length?`<p class="sec-note" style="margin-top:6px">Sin trabajar en este período: ${missing.join(', ')}.</p>`:''}</div></section>`:''}
  <section class="sec"><div class="sec-head"><h2 class="sec-title">Qué trabaja cada ejercicio</h2></div><div class="card exmus">${exList.map(k=>{const X=exDef(k);const ms=Object.entries(X.muscles||{}).sort((a,b)=>b[1]-a[1]);return`<div class="exmus-row"><b style="display:flex;gap:8px;align-items:center"><i class="sw" style="background:${exColor(k)}"></i>${esc(X.name)}</b>${X.tip?`<small class="faint">${esc(X.tip)}</small>`:''}<div class="mtags">${ms.map(([m,w])=>`<span class="mtag ${w>=.7?'p':''}">${MUSCLES[m]}${w>=.7?' · principal':''}</span>`).join('')}</div></div>`}).join('')}</div></section>`;
}

function invCard(i){
  const ref=refOf(i.rid)||{name:i.rid,icon:'❔',rarity:'común'};const st=i.type==='cupon'||i.type==='vale'?expStatus(i):null;
  const sub=i.type==='cupon'&&i.snap?i.snap.provider+(i.snap.days?' · '+i.snap.days:''):TYPE_NAME[i.type];const eq=(i.type==='titulo'&&S.title===i.rid)||(i.type==='tema'&&S.theme===i.rid);
  return`<button class="icard bd-${RK[ref.rarity]||'c'}" data-act="inv" data-iid="${i.iid}">${icon(ref)}<span style="min-width:0"><b>${esc(ref.name)}</b><small>${esc(sub)}</small>${st?`<span class="st ${st.cls}">${st.txt}</span>`:''}${eq?'<span class="st st-good">Equipado</span>':''}${i.status!=='active'?`<span class="st st-muted">${i.status==='lost'?'Perdido':'Usado'}</span>`:''}</span></button>`;
}
function vInventario(){
  const act=S.inventory.filter(i=>i.status==='active');const g=k=>act.filter(i=>i.type===k);const items={};for(const i of g('item'))(items[i.rid]=items[i.rid]||[]).push(i);
  const cup=g('cupon').sort((a,b)=>(a.expires||'9999').localeCompare(b.expires||'9999'));const vales=g('vale').sort((a,b)=>(a.expires||'9999').localeCompare(b.expires||'9999'));
  const sec=(title,note,list,empty)=>`<section class="sec"><div class="sec-head"><h2 class="sec-title">${title}</h2><span class="sec-note">${note}</span></div>${list.length?`<div class="inv">${list.join('')}</div>`:`<div class="empty">${empty}</div>`}</section>`;
  return`<div class="row" style="gap:8px"><span class="chip">${cup.length} cupones</span><span class="chip">${vales.length} vales</span><span class="chip">${g('item').length} ítems</span><span class="chip">${g('titulo').length+g('tema').length} equipables</span></div>
  ${sec('Cupones','Beneficios reales de tus bancos y panoramas: toca para ver condiciones',cup.map(invCard),'Sin cupones. Salen de misiones ★★★, objetivos, cofres y ascensos, según tus bancos y preferencias.')}
  ${sec('Vales','Autopremios: canjéalos antes de que venzan',vales.map(invCard),'Sin vales por ahora.')}
  ${sec('Ítems','Consumibles del juego',Object.values(items).map(arr=>{const i=arr[0];const ref=refOf(i.rid);return`<button class="icard bd-${RK[ref.rarity]}" data-act="inv" data-iid="${i.iid}">${icon(ref)}<span style="min-width:0"><b>${esc(ref.name)}${arr.length>1?` ×${arr.length}`:''}</b><small>${esc(ref.desc)}</small></span></button>`}),'Sin ítems.')}
  ${sec('Equipables','Títulos y temas de color',g('titulo').concat(g('tema')).map(invCard),'Gana títulos y temas en misiones, objetivos y ascensos.')}
  <p class="sec-note" style="margin-top:16px">Los cupones son beneficios publicados por bancos, comercios y organizadores para el público o para clientes de sus tarjetas. El juego te los entrega como premio para que los uses; las condiciones las pone cada comercio y pueden cambiar.</p>`;
}
const FEAT_ICON={mision:'⚔️',objetivo:'🎯',record:'📈',cofre:'🧰',deuda:'🩸',vale:'🎁'};
function featIcon(f){if(f.kind==='ascenso')return`<span style="width:44px;height:48px;display:block">${emblem(f.level||0)}</span>`;const r=f.reward&&f.reward.rarity||f.rarity;return`<span class="icon bd-${RK[r]||'c'}">${FEAT_ICON[f.kind]||'⭐'}</span>`}
function vHazanas(){
  const F=S.feats.slice();const top=F.slice().sort((a,b)=>featValue(b)-featValue(a)).slice(0,3);
  const kinds={todas:null,misiones:['mision','deuda'],objetivos:['objetivo'],ascensos:['ascenso'],records:['record'],cofres:['cofre'],premios:['vale']};
  const fl=UI.featF;const list=F.filter(f=>!kinds[fl]||kinds[fl].includes(f.kind)).sort((a,b)=>b.date.localeCompare(a.date)||featValue(b)-featValue(a));const cnt=k=>F.filter(f=>k.includes(f.kind)).length;
  let tl='',month='';for(const f of list){const m=f.date.slice(0,7);if(m!==month){month=m;const[y,mm]=m.split('-');tl+=`<div class="tl-month">${MESES_L[+mm-1]} ${y}</div>`}
    tl+=`<div class="feat">${featIcon(f)}<div style="min-width:0"><b>${esc(f.title)}</b><small>${niceDate(f.date)} · ${{mision:'Misión',deuda:'Deuda',objetivo:'Objetivo',ascenso:'Ascenso',record:'Récord',cofre:'Cofre',vale:'Premio canjeado'}[f.kind]||''}${f.reward&&f.reward.name?' · '+esc(f.reward.name):''}</small></div><div class="v">${f.pts?`<span class="num">+${f.pts} PP</span><br>`:''}${f.rarity?`<span class="rar rar-${RK[f.rarity]}" style="font-size:12px">${f.rarity}</span>`:''}</div></div>`}
  return`<section class="sec" style="margin-top:0"><div class="sec-head"><h2 class="sec-title">Salón de la fama</h2><span class="sec-note">Tus 3 hazañas de mayor valor</span></div>
   ${top.length?`<div class="podium">${[top[1],top[0],top[2]].map((f,ix)=>f?`<div class="pod ${ix===1?'p1':''}"><span class="place rar-${ix===1?'l':'c'}">${ix===1?'1°':ix===0?'2°':'3°'}</span>${featIcon(f)}<div style="min-width:0"><b>${esc(f.title)}</b><br><small>${niceDate(f.date)} · ${fmt(featValue(f))} pts de hazaña</small></div></div>`:'<div></div>').join('')}</div>`:'<div class="empty">Tus primeras hazañas aparecerán aquí.</div>'}</section>
  <div class="kpis"><div class="kpi"><span>Misiones</span><b class="num">${cnt(['mision','deuda'])}</b></div><div class="kpi"><span>Objetivos</span><b class="num">${cnt(['objetivo'])}</b></div><div class="kpi"><span>Récords</span><b class="num">${cnt(['record'])}</b></div></div>
  <section class="sec"><div class="sec-head"><h2 class="sec-title">Crónica de hazañas</h2></div><div class="seg" role="group" aria-label="Filtrar hazañas">${Object.keys(kinds).map(k=>`<button data-act="featf" data-v="${k}" aria-pressed="${fl===k}">${{todas:'Todas',misiones:'Misiones',objetivos:'Objetivos',ascensos:'Ascensos',records:'Récords',cofres:'Cofres',premios:'Premios canjeados'}[k]}</button>`).join('')}</div><div class="card"><div class="tl">${tl||'<div class="empty">Nada por aquí todavía.</div>'}</div></div></section>
  ${S.scars.length?`<section class="sec"><div class="sec-head"><h2 class="sec-title">Cicatrices</h2><span class="sec-note">Misiones fallidas y su castigo</span></div><div class="card">${S.scars.slice().reverse().slice(0,12).map(s=>`<div class="scar"><span><b>${esc(s.title)}</b><br><span class="faint">${esc(s.penalty)}</span></span><span class="faint num">${niceDate(s.date)}</span></div>`).join('')}</div></section>`:''}`;
}
function dexEntries(){
  const out=catalogAll().map((c,i)=>({no:'#'+String(i+1).padStart(3,'0'),ref:c,rid:c.id}));
  const cps=CAT.filter(couponEligible);for(const i of S.inventory)if(i.rid.startsWith('cup:')&&!cps.some(c=>'cup:'+c.id===i.rid)&&i.snap)cps.push({id:i.rid.slice(4),title:i.snap.title,emoji:'🎟️',rarity:'raro',provider:i.snap.provider,detail:i.snap.detail});
  cps.forEach((cp,i)=>out.push({no:'#C'+String(i+1).padStart(2,'0'),ref:{id:'cup:'+cp.id,type:'cupon',name:cp.title,icon:cp.emoji||'🎟️',rarity:cp.rarity,desc:(cp.provider?cp.provider+' · ':'')+(cp.detail||'')},rid:'cup:'+cp.id}));
  return out;
}
function vPokedex(){
  const E=dexEntries();const got=E.filter(e=>S.pokedex[e.rid]).length;const pct=E.length?Math.round(got/E.length*100):0;
  const types={todos:null,insignia:'Insignias',titulo:'Títulos',cronica:'Crónicas',item:'Ítems',vale:'Vales',tema:'Temas',cupon:'Cupones'};
  const list=E.filter(e=>!types[UI.pokeF]||e.ref.type===UI.pokeF);const byType=k=>{const all=E.filter(e=>e.ref.type===k);return`${all.filter(e=>S.pokedex[e.rid]).length}/${all.length}`};
  return`<section class="sec" style="margin-top:0"><div class="dex-top"><div class="ring" style="--p:${pct}"><b class="num">${pct}%</b></div><div><div class="sec-title">Pokédex del esfuerzo</div><p class="muted num">${got} de ${E.length} recompensas descubiertas</p><div class="row" style="gap:6px;margin-top:6px">${Object.keys(types).filter(k=>k!=='todos').map(k=>`<span class="chip">${types[k]} ${byType(k)}</span>`).join('')}</div></div></div></section>
  <section class="sec"><div class="seg" role="group" aria-label="Filtrar por tipo">${Object.keys(types).map(k=>`<button data-act="pokef" data-v="${k}" aria-pressed="${UI.pokeF===k}">${k==='todos'?'Todos':types[k]}</button>`).join('')}</div>
  <p class="sec-note">Los cupones que ves son los de tus bancos y preferencias. El catálogo se actualiza cada semana.</p>
  <div class="dex-grid">${list.map(e=>{const k=!!S.pokedex[e.rid];const r=e.ref;return`<button class="dex ${k?'':'unk'} bd-${RK[r.rarity]||'c'}" data-act="dex" data-rid="${esc(e.rid)}" ${k?'':`aria-label="${esc(e.no)} sin descubrir, rareza ${esc(r.rarity)}"`}><span class="no">${e.no}</span>${k&&S.pokedex[e.rid].count>1?`<span class="cnt">×${S.pokedex[e.rid].count}</span>`:''}${icon(k?r:{icon:r.icon,rarity:r.rarity})}<b>${k?esc(r.name):'???'}</b><small class="rar rar-${RK[r.rarity]||'c'}">${esc(r.rarity||'')}</small></button>`}).join('')}</div></section>`;
}

/* ===== Liga general: métrica estándar, igual para todos ===== */
function weekStats(){
  const t=today();const mon=mondayOf(t);let effort=0,days=0;
  for(let d=mon;d<=t;d=addDays(d,1)){const L=LOGS[d];if(!hasSession(L))continue;days++;for(const[k,e]of Object.entries(L.ex||{}))effort+=rawPts(k,e)}
  const imps=tracked().map(e=>{const b=baseVal(e);if(!b)return null;let best=0;for(let k=0;k<7;k++)best=Math.max(best,valOf(LOGS[addDays(t,-k)],e));return best?(best/b-1)*100:null}).filter(x=>x!=null);
  return{week:mon,effort:Math.round(effort),days,improve:imps.length?Math.round(avg(imps)):0};
}
function vLiga(){
  const on=!!S.profile.ranking;const me=weekStats();const mon=mondayOf(today());
  const rows=(UI.rank||[]).map(r=>Object.assign({},r,r.week===mon?{}:{effort:0,days:0,improve:0}));
  const sortKey=UI.rankSort||'effort';rows.sort((a,b)=>(b[sortKey]||0)-(a[sortKey]||0)||(b.effort||0)-(a.effort||0));
  const label={effort:'Esfuerzo estándar',improve:'Mejora vs su base',days:'Días entrenados'};
  const val=r=>sortKey==='improve'?`${r.improve>0?'+':''}${r.improve} %`:sortKey==='days'?`${r.days}/7`:fmt(r.effort);
  return`<section class="sec" style="margin-top:0"><div class="sec-head"><h2 class="sec-title">Liga general</h2><span class="sec-note">Semana del ${niceDate(mon)} · se reinicia cada lunes</span></div>
   <div class="card" style="display:flex;flex-direction:column;gap:8px"><p class="muted">Aquí se compite con la misma regla para todos. Tu rango personal no entra: depende de tu propia base.</p>
   <dl class="kv"><dt>Esfuerzo</dt><dd>Cada repetición vale lo mismo para todos según una tabla fija: flexión 1, inclinada 0,7, declinada 1,3, sentadilla 0,6, dominada 2,5, plancha 0,3 por segundo, trotar 10 por km. Sin ajustes por base.</dd><dt>Mejora</dt><dd>Cuánto subió tu mejor día de la semana sobre tu propia base, en promedio de tus ejercicios principales.</dd><dt>Constancia</dt><dd>Días con entrenamiento en la semana.</dd></dl></div>
   <div class="card"><div class="row" style="justify-content:space-between"><div><b>Tu semana</b><p class="faint num" style="font-size:13px">Esfuerzo ${fmt(me.effort)} · mejora ${me.improve>0?'+':''}${me.improve} % · ${me.days}/7 días</p></div>${on?'<span class="st st-good">Participando</span>':`<button class="btn sm" data-act="rank-on">Unirme a la liga</button>`}</div></div>
  </section>
  <section class="sec"><div class="seg" role="group" aria-label="Ordenar por">${Object.keys(label).map(k=>`<button data-act="rsort" data-v="${k}" aria-pressed="${sortKey===k}">${label[k]}</button>`).join('')}</div>
   <div class="card">${!rows.length?`<div class="empty">${on?'Todavía no hay datos esta semana.':'Únete para ver la tabla y aparecer en ella.'}</div>`:`<table class="tbl"><thead><tr><th>#</th><th style="text-align:left">Jugador</th><th>${label[sortKey]}</th></tr></thead><tbody>${rows.map((r,i)=>`<tr class="${r.id===S.uid?'hl':''}"><td>${i+1}</td><td style="text-align:left">${esc(r.nick||'Jugador')}${r.id===S.uid?' <span class="faint">(tú)</span>':''}</td><td>${val(r)}</td></tr>`).join('')}</tbody></table>`}</div>
   ${on?'<p class="sec-note">Solo se comparte tu apodo y estas tres cifras. Puedes salir desde Perfil.</p>':''}</section>`;
}

/* ===== Perfil ===== */
function chipSel(name,opts,sel,multi){return`<div class="msel" data-group="${name}">${opts.map(([k,l])=>`<button type="button" data-act="${multi?'pf-tog':'pf-one'}" data-g="${name}" data-k="${k}" data-w="${(multi?(sel||[]).includes(k):sel===k)?1:0}">${esc(l)}</button>`).join('')}</div>`}
function banksEditor(banks){
  banks=banks||{};return`<div class="msel">${BANKS.map(([k,l])=>`<button type="button" data-act="bank-tog" data-k="${k}" data-w="${banks[k]?1:0}">${esc(l)}</button>`).join('')}</div>
  ${Object.keys(banks).length?`<div class="bank-cards">${Object.keys(banks).map(k=>`<div class="row" style="justify-content:space-between;gap:8px"><span>${esc(BANK_NAME[k]||k)}</span><span class="row" style="gap:6px"><button type="button" class="pill" data-act="bank-card" data-k="${k}" data-c="debito" data-w="${banks[k].debito?1:0}">Débito</button><button type="button" class="pill" data-act="bank-card" data-k="${k}" data-c="credito" data-w="${banks[k].credito?1:0}">Crédito</button></span></div>`).join('')}</div>`:''}`;
}
function vPerfil(){
  const P=UI.pf||(UI.pf=JSON.parse(JSON.stringify(S.profile)));
  return`<section class="sec" style="margin-top:0"><div class="sec-head"><h2 class="sec-title">Tu perfil</h2><span class="sec-note">${esc(STORE==='demo'?'Modo demo (solo este navegador)':(AUTH_USER&&AUTH_USER.email)||'')}</span></div>
   <div class="card form">
    <label class="fl">Apodo<input type="text" id="pf-nick" maxlength="24" value="${esc(P.nick||'')}"></label>
    <div class="grid2"><label class="fl">Altura (cm)<input type="number" id="pf-height" inputmode="numeric" value="${esc(P.height||'')}"></label><label class="fl">Peso (kg)<input type="number" id="pf-weight" inputmode="decimal" step="0.5" value="${esc(P.weight||'')}"></label></div>
    <div class="fl">Tipo de cuerpo${chipSel('body',BODY.map(b=>[b[0],b[1]]),P.body,false)}</div>
    <div class="fl">Edad${chipSel('age',AGES,P.age,false)}</div>
    <div class="fl">Experiencia${chipSel('exp',EXPS.map(e=>[e[0],e[1]]),P.exp,false)}</div>
    <div class="fl">Días de entrenamiento por semana${chipSel('freq',[2,3,4,5,6,7].map(n=>[String(n),String(n)]),String(P.freq||4),false)}</div>
    <div class="fl">Equipamiento disponible${chipSel('equip',EQUIP,P.equip,true)}</div>
   </div></section>
  <section class="sec"><div class="sec-head"><h2 class="sec-title">Premios</h2></div><div class="card form">
    <div class="fl">Bancos y billeteras${banksEditor(P.banks)}</div>
    <div class="fl">Qué premios te motivan${chipSel('prefs',PREFS,P.prefs,true)}</div>
    <label class="fl">Comuna<input type="text" id="pf-comuna" list="comunas" value="${esc(P.comuna||'')}"></label>
    <div class="fl">Tus autopremios${[0,1,2].map(i=>`<input type="text" id="pf-sr-${i}" maxlength="50" value="${esc((P.selfRewards||[])[i]||'')}" placeholder="${['Ej.: un helado de mi heladería favorita','Ej.: comprarme ese videojuego','Ej.: una escapada de fin de semana'][i]}">`).join('')}</div>
  </div></section>
  <section class="sec"><div class="sec-head"><h2 class="sec-title">Juego</h2></div><div class="card form">
    <div class="fl">Modo${chipSel('mode',MODES.map(m=>[m[0],m[1]]),P.mode,false)}<small class="faint">${esc((MODES.find(m=>m[0]===P.mode)||MODES[1])[2])}</small></div>
    <div class="fl">Liga general${chipSel('ranking',[['si','Participar'],['no','No participar']],P.ranking?'si':'no',false)}</div>
  </div>
  <div class="row"><button class="btn grow" data-act="pf-save">Guardar perfil</button><button class="btn ghost" data-act="pf-reset">Descartar cambios</button></div>
  <p class="sec-note">Cambiar cuerpo, edad o experiencia recalcula tus curvas y referencias, pero no cambia los PP que ya ganaste.</p>
  <div class="row" style="margin-top:12px"><button class="btn danger" data-act="logout">${STORE==='demo'?'Salir del modo demo':'Cerrar sesión'}</button></div></section>`;
}
const VIEWS={inicio:vInicio,registro:vRegistro,misiones:vMisiones,evolucion:vEvolucion,musculos:vMusculos,inventario:vInventario,hazanas:vHazanas,pokedex:vPokedex,liga:vLiga,perfil:vPerfil};
function render(){
  if(!BOOTED)return;
  if(!S||!S.profile){renderOnboarding();return}
  document.body.classList.remove('bare');
  compute();applyTheme();renderHeader();renderTabs();
  for(const k of Object.keys(CHARTS))delete CHARTS[k];
  const banner=STORE==='demo'?'<div class="banner">Modo demo: tus datos se guardan solo en este navegador.</div>':(!READY?'<div class="banner">Sincronizando tus datos…</div>':'');
  const sy=window.scrollY;$('#view').innerHTML=banner+VIEWS[UI.view]();attachCharts();
  const cur=document.querySelector('.ladder .lad.cur');if(cur){const p=cur.parentElement;p.scrollTop=Math.max(0,cur.offsetTop-p.clientHeight/2)}
  window.scrollTo(0,sy);
}
/* ================= hoja modal y revelaciones ================= */
function openSheet(html){const w=$('#sheet');w.innerHTML=`<div class="sheet" role="dialog" aria-modal="true"><button class="sheet-x" data-act="close" aria-label="Cerrar">✕</button>${html}</div>`;w.hidden=false}
function closeSheet(){closeSheetSilent();setTimeout(nextReveal,120)}
function closeSheetSilent(){$('#sheet').hidden=true;$('#sheet').innerHTML='';UI.sheetMode=null}
function queueReveals(list){for(const x of list)if(x)UI.reveals.push(x);if($('#sheet').hidden)nextReveal()}
function nextReveal(){
  if(!$('#sheet').hidden||!UI.reveals.length)return;const x=UI.reveals.shift();
  if(x.kind==='celebrate'){openSheet(`<div class="reveal celebrate">${emblem(x.level)}<div class="eyebrow">Ascenso</div><h3>${levelName(x.level)}</h3><p class="muted">${esc((x.level>=MAXL?TIERS[7]:TIERS[tierOf(x.level)]).lore)}</p><p class="faint" style="font-size:13px">Referencia diaria: ${esc(refLine(x.level))}</p></div><button class="btn block" data-act="close">Ver mis premios</button>`);return}
  if(x.kind==='notes'){openSheet(`<h3>Mientras no estabas</h3><div class="card" style="display:flex;flex-direction:column;gap:8px">${x.notes.map(n=>`<p>${esc(n)}</p>`).join('')}</div><button class="btn block" data-act="close">Entendido</button>`);return}
  const r=x.reward;
  if(!r){openSheet(`<div class="reveal"><div class="eyebrow">${esc(x.kind==='objetivo'?'Objetivo cumplido':'Misión completada')}</div><h3>${esc(x.title||'')}</h3>${x.pts?`<p class="num" style="font-size:20px"><b>+${x.pts} PP</b></p>`:''}</div><button class="btn block" data-act="close">Seguir</button>`);return}
  openSheet(`<div class="reveal bd-${RK[r.rarity]||'c'}"><div class="eyebrow">${esc(x.title||r.source||'Recompensa')}</div><div class="big">${esc(r.icon||'✨')}</div><h3>${esc(r.name)}</h3><div class="row" style="justify-content:center">${rarChip(r.rarity)}<span class="chip">${TYPE_NAME[r.type]||''}</span>${x.pts?`<span class="chip num">+${x.pts} PP</span>`:''}</div>${r.cursed?'<p class="st st-serious">La maldición rebajó esta recompensa un nivel.</p>':''}<p class="muted">${esc((refOf(r.rid)||{}).desc||(r.type==='cupon'?'Cupón agregado a tu inventario.':''))}</p></div><div class="row">${r.iid?`<button class="btn ghost grow" data-act="inv" data-iid="${r.iid}">Ver en inventario</button>`:''}<button class="btn grow" data-act="close">Genial</button></div>`);
}

/* ================= persistencia (Firebase o demo) ================= */
let FB=null,AUTH_USER=null,UNSUBS=[],NEW_GAME=false,lastRankJSON='';
let saveTimer=null,saving=false,saveAgain=false,dirty=false,lastSavedJSON='';
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
const clone=o=>JSON.parse(JSON.stringify(o));
function userDoc(){return FB.db.collection('users').doc(AUTH_USER.uid)}
function persist(){dirty=true;clearTimeout(saveTimer);saveTimer=setTimeout(flush,400)}
async function flush(){
  if(saving){saveAgain=true;return}saving=true;const json=JSON.stringify(S);
  try{if(STORE==='fb')await userDoc().set(JSON.parse(json));else lsSet('liga-web-state',json);lastSavedJSON=json;setSync('ok',STORE==='demo'?'Modo demo':'Guardado');pushRanking()}
  catch(e){setSync('bad','Error al guardar');toast('No se pudo guardar el progreso. Revisa tu conexión.','bad')}
  saving=false;if(saveAgain){saveAgain=false;flush()}else dirty=false;
}
async function saveLogDoc(date){
  const L=LOGS[date];
  try{if(STORE==='fb'){const ref=userDoc().collection('logs').doc(date);if(L)await ref.set(clone(L));else await ref.delete()}else lsSet('liga-web-logs',JSON.stringify(LOGS))}
  catch(e){toast('No se pudo guardar el registro del día.','bad')}
}
async function pushRanking(){
  if(!S||!S.profile)return;
  if(STORE!=='fb'){UI.rank=S.profile.ranking?[Object.assign({id:S.uid,nick:S.profile.nick},weekStats())]:[];return}
  try{const ref=FB.db.collection('ranking').doc(AUTH_USER.uid);
    if(!S.profile.ranking){if(lastRankJSON!=='off'){await ref.delete();lastRankJSON='off'}return}
    const d=Object.assign({nick:S.profile.nick||'Jugador'},weekStats());const j=JSON.stringify(d);if(j===lastRankJSON)return;
    await ref.set(Object.assign({updated:Date.now()},d));lastRankJSON=j;
  }catch(e){}
}
async function loadCatalog(){try{const r=await fetch('coupons.json?v='+Date.now(),{cache:'no-store'});if(r.ok){const j=await r.json();CAT=j.items||[];if(BOOTED&&S&&S.profile)render()}}catch(e){CAT=[]}}

/* ================= acciones del juego ================= */
function afterChange(reveals=[]){
  const cel=checkRank();
  if(cel){UI.reveals.unshift({kind:'celebrate',level:cel.level});reveals=reveals.concat(cel.reveals.map(r=>({reward:r,title:'Premio de ascenso'})))}
  persist();render();queueReveals(reveals.filter(Boolean).map(x=>x.rid?{kind:'reward',title:x.source,reward:x}:x));
}
function needReady(){if(!READY){toast('Sincronizando tus datos, prueba en unos segundos.');return false}return true}
function readRow(id){
  const X=exDef(id);const g=f=>{const el=$(`#in-${id}-${f}`);return el?parseFloat(el.value):NaN};const e={};
  if(X.metric==='reps'){const v=g('reps');if(v>0)e.reps=Math.round(v)}else if(X.metric==='secs'){const v=g('secs');if(v>0)e.secs=Math.round(v)}
  else if(X.metric==='load'){const s=g('sets'),r=g('reps'),k=g('kg');if(s>0&&r>0){e.sets=Math.round(s);e.reps=Math.round(r);if(k>0)e.kg=k}}
  else{const m=g('min'),k=g('km');if(m>0)e.min=Math.round(m);if(k>0)e.km=k}
  return Object.keys(e).length?e:null;
}
async function saveLog(){
  if(!needReady())return;const date=$('#reg-date').value||today();if(date>today()){toast('No puedes registrar días futuros.','bad');return}
  const ids=[...new Set([...tracked(),...Object.keys((LOGS[date]&&LOGS[date].ex)||{}),...UI.extraRows])].filter(exDef);
  const ex={};for(const id of ids){const e=readRow(id);if(e){ex[id]=e;noteExUse(id)}}
  const prev=LOGS[date];const prevTotal=compute().total;const bests={};for(const e of tracked())bests[e]=bestBefore(e,date);
  LOGS[date]=Object.assign({},prev||{},{date,ex});if(!Object.keys(ex).length&&!(prev&&prev.meta))delete LOGS[date];
  await saveLogDoc(date);
  const records=[];
  for(const e of tracked()){const v=valOf(LOGS[date],e);if(bests[e]>0&&v>bests[e]){const id='pr-'+date+'-'+e;const ttl=`Récord: ${fmt(v)} ${unitOf(e)} de ${lc(exDef(e).short)}`;const fi=S.feats.find(f=>f.id===id);if(fi){fi.title=ttl}else addFeat({id,date,kind:'record',title:ttl,desc:`Antes: ${fmt(bests[e])}.`,pts:15,rarity:'poco común'});records.push(`${exDef(e).short} ${fmt(v)}`)}}
  compute();const done=checkAuto(date);UI.extraRows=[];UI.analysis=buildAnalysis(date,prevTotal,done.map(d=>d.title),records);
  toast(`Día guardado: +${fmt(UI.analysis.pts)} PP`,'good');afterChange(done);
}
async function delLog(){
  if(!needReady())return;const date=UI.regDate;if(UI.confirm!=='del-'+date){UI.confirm='del-'+date;toast('Toca «Borrar día» otra vez para confirmar.');return}
  UI.confirm=null;delete LOGS[date];await saveLogDoc(date);UI.analysis=null;S.feats=S.feats.filter(f=>!(f.kind==='record'&&f.date===date));toast('Día borrado.');afterChange();
}
function acceptMission(id){
  if(!needReady())return;const day=ensureDay(today());const n=day.accepted.filter(x=>!(day.pardoned||[]).includes(x)).length;
  if(n>=3){toast('Ya tienes 3 misiones aceptadas hoy.','bad');return}
  if(!day.accepted.includes(id))day.accepted.push(id);UI.confirm=null;const done=checkAuto(today());toast('Misión aceptada. ¡A cumplirla!');afterChange(done);
}
function numIn(id,label,val,step='1'){return`<label class="fl">${label}<input type="number" inputmode="decimal" min="0" step="${step}" id="${id}" value="${val??''}"></label>`}
function manualSheet(m){
  let fields='';
  if(m.kind==='multi')fields=m.parts.map((p,i)=>numIn('mm-'+i,`${exDef(p.ex).name} (${p.field==='secs'?'segundos':'reps'})`,p.v)).join('');
  else if(m.field==='load')fields=`<div class="multi">${numIn('mm-sets','Series',m.t.sets)}${numIn('mm-reps','Reps',m.t.reps)}${numIn('mm-kg','Kg',null,'0.5')}</div>`;
  else if(m.field==='min')fields=`<div class="multi">${numIn('mm-min','Minutos',m.t.min)}${numIn('mm-km','Km',null,'0.1')}</div>`;
  else if(m.field==='set')fields=numIn('mm-v','Tu mejor serie continua (reps)',m.t.set);
  else fields=numIn('mm-v',m.field==='secs'?'Segundos totales':`Total (${exDef(m.ex).unit||'reps'})`,m.t[m.field]);
  openSheet(`<h3>${esc(m.title)}</h3><p class="muted">${esc(m.desc)}</p>${fields}<p class="sec-note">Se suma al registro de hoy y actualiza tu mapa muscular.</p><button class="btn block" data-act="m-manual-ok" data-id="${m.id}">Guardar y completar</button>`);
}
function addToLog(date,ex,patch,mode='add'){
  const L=LOGS[date]=LOGS[date]||{date,ex:{}};L.ex=L.ex||{};const cur=L.ex[ex]||{};
  if(mode==='add'){for(const[k,v]of Object.entries(patch))cur[k]=(+cur[k]||0)+v}
  else if(mode==='load'){const vol=e=>(+e.sets||0)*(+e.reps||0)*Math.max(+e.kg||0,1);if(!L.ex[ex]||vol(patch)>=vol(cur))Object.assign(cur,patch)}
  else Object.assign(cur,patch);
  for(const k of Object.keys(cur))if(cur[k]==null)delete cur[k];L.ex[ex]=cur;noteExUse(ex);
}
async function manualOk(id){
  const t=today();const day=S.days[t];const m=day&&day.offers.find(x=>x.id===id);if(!m)return closeSheet();
  const num=s=>{const el=$('#'+s);return el?parseFloat(el.value)||0:0};let ok=false;
  if(m.kind==='multi'){const vs=m.parts.map((p,i)=>num('mm-'+i));m.parts.forEach((p,i)=>{if(vs[i]>0)addToLog(t,p.ex,{[p.field]:vs[i]})});ok=m.parts.every((p,i)=>vs[i]>=p.v)}
  else if(m.field==='load'){const s=num('mm-sets'),r=num('mm-reps'),k=num('mm-kg');if(s>0&&r>0)addToLog(t,m.ex,k>0?{sets:s,reps:r,kg:k}:{sets:s,reps:r},'load');ok=s>=m.t.sets&&r>=m.t.reps&&k>0;if(s>=m.t.sets&&r>=m.t.reps&&!(k>0))toast('Registra el peso que usaste para completarla.','bad')}
  else if(m.field==='min'){const mi=num('mm-min'),km=num('mm-km');if(mi>0)addToLog(t,m.ex,km>0?{min:mi,km}:{min:mi});ok=mi>=m.t.min}
  else if(m.field==='set'){const v=num('mm-v');const L=LOGS[t]=LOGS[t]||{date:t,ex:{}};L.meta=Object.assign({},L.meta,{bestSet:Math.max(v,(L.meta&&L.meta.bestSet)||0)});if(valOf(L,m.ex)<v)addToLog(t,m.ex,{reps:v},'set');ok=v>=m.t.set}
  else{const v=num('mm-v');if(v>0)addToLog(t,m.ex,{[m.field]:v});ok=v>=m.t[m.field]}
  await saveLogDoc(t);closeSheetSilent();const out=[];if(ok)out.push(completeMission(day,m,t));else toast('Quedó registrado, pero aún no alcanza la meta de la misión.','bad');
  compute();out.push(...checkAuto(t));afterChange(out);
}
function checkMission(id){const t=today();const day=S.days[t];const m=day.offers.find(x=>x.id===id);if(!m||day.done[id])return;const ok=m.ex?valOf(LOGS[t],m.ex)>0:hasSession(LOGS[t]);if(!ok){toast('Primero registra ese ejercicio hoy.','bad');return}afterChange([completeMission(day,m,t)])}
function claimObjective(id){
  if(!needReady())return;const t=today();const day=ensureDay(t);if(day.objClaimed){toast('Ya reclamaste un objetivo hoy. Vuelve mañana.','bad');return}
  const o=S.objectives.find(x=>x.id===id);if(!o||!objReady(o))return;const T=objTpl(o.key);
  day.objClaimed=o.id;S.stats.objectives=(S.stats.objectives||0)+1;addLedger(t,o.pts,'objetivo',T.title(o.target));
  const rw=grantReward(o.rarity,'Objetivo «'+T.title(o.target)+'»');addFeat({date:t,kind:'objetivo',title:T.title(o.target),desc:T.desc,pts:o.pts,rarity:rw.rarity,reward:rw});
  compute();const nx=makeObjective(o.key)||objCandidates([o.key],'repl:'+t+':'+o.id,1)[0];const i=S.objectives.indexOf(o);if(nx)S.objectives[i]=nx;else S.objectives.splice(i,1);
  afterChange([{kind:'objetivo',title:'Objetivo cumplido',pts:o.pts,reward:rw}]);
}
function recordSheet(id){
  const o=S.objectives.find(x=>x.id===id);const T=objTpl(o.key);const extra=T.field==='km'?numIn('or-min','Minutos',null):'';
  openSheet(`<h3>${esc(T.title(o.target))}</h3><p class="muted">${esc(T.desc)} Tu mejor marca: ${fmt1(objCur(o))} ${T.unit||''}.</p><div class="multi" style="flex-wrap:wrap">${numIn('or-v',`Tu marca de hoy (${T.unit||''})`,null,T.field==='km'||T.field==='kg'?'0.5':'1')}${extra}</div><p class="sec-note">Se guarda como marca personal y en el registro de hoy.</p><button class="btn block" data-act="o-record-ok" data-id="${id}">Guardar marca</button>`);
}
async function recordOk(id){
  const o=S.objectives.find(x=>x.id===id);if(!o)return closeSheetSilent();const T=objTpl(o.key);const v=parseFloat($('#or-v').value)||0;if(v<=0){toast('Ingresa un valor.','bad');return}
  const t=today();o.best=Math.max(o.best||0,v);
  if(T.field==='secs')addToLog(t,T.ex,{secs:v});else if(T.field==='kg')addToLog(t,T.ex,{sets:3,reps:10,kg:v},'load');
  else if(T.field==='km'){const mi=parseFloat(($('#or-min')||{}).value)||0;addToLog(t,T.ex,mi?{km:v,min:mi}:{km:v},'set')}else addToLog(t,T.ex,{[T.field]:v});
  await saveLogDoc(t);closeSheetSilent();compute();const done=checkAuto(t);toast(v>=o.target?'¡Marca lograda! Ya puedes reclamar el objetivo.':'Marca guardada.','good');afterChange(done);
}
function changeSheet(id){
  if(!needReady())return;if(effectOn('sealed',today())){toast('El Sello te impide cambiar objetivos hoy.','bad');return}if(!changesLeft()){toast('Ya usaste tu cambio de objetivo de hoy.','bad');return}
  const day=S.days[today()];const c=objCandidates([],'chg:'+today()+':'+day.objChanged+':'+id,3);UI.sheetMode={type:'change',id,cands:c};
  openSheet(`<h3>Cambiar objetivo</h3><p class="muted">Elige el reemplazo. Te quedan ${changesLeft()} cambio(s) hoy.</p><div class="pick">${c.map((o,i)=>{const T=objTpl(o.key);return`<button data-act="o-pick" data-i="${i}"><span class="eyebrow">${T.cat}</span><b>${esc(T.title(o.target))}</b><span class="row" style="gap:6px">${rarChip(o.rarity)}<span class="chip num">+${o.pts} PP</span><span class="faint" style="font-size:12.5px">Progreso actual: ${fmt1(objCur(o))}</span></span></button>`}).join('')}</div>`);
}
function pickObjective(i){const sm=UI.sheetMode;if(!sm||sm.type!=='change')return;const day=S.days[today()];const idx=S.objectives.findIndex(o=>o.id===sm.id);if(idx<0)return closeSheetSilent();S.objectives[idx]=sm.cands[i];day.objChanged=(day.objChanged||0)+1;closeSheetSilent();toast('Objetivo cambiado.');afterChange()}
function invSheet(iid){
  const i=S.inventory.find(x=>x.iid===iid);if(!i)return;const ref=refOf(i.rid)||{name:i.rid,icon:'❔',rarity:'común',desc:''};const st=(i.type==='cupon'||i.type==='vale')?expStatus(i):null;
  let body=`<div class="reveal bd-${RK[ref.rarity]||'c'}" style="padding:0"><div class="big" style="width:76px;height:76px;font-size:40px;animation:none">${esc(ref.icon)}</div><h3>${esc(ref.name)}</h3><div class="row" style="justify-content:center">${rarChip(ref.rarity)}<span class="chip">${TYPE_NAME[i.type]}</span>${st?`<span class="st ${st.cls}">${st.txt}</span>`:''}</div></div>`;
  let acts='';const active=i.status==='active';
  if(i.type==='cupon'&&i.snap){const s=i.snap;
    body+=`<dl class="kv"><dt>Quién</dt><dd>${esc(s.provider)}</dd><dt>Beneficio</dt><dd>${esc(s.detail)}</dd>${s.days?`<dt>Cuándo</dt><dd>${esc(s.days)}</dd>`:''}${s.channel?`<dt>Dónde</dt><dd>${esc(s.channel)}</dd>`:''}${s.card&&s.card!=='ambas'?`<dt>Tarjeta</dt><dd>Solo ${s.card==='credito'?'crédito':'débito'}</dd>`:''}<dt>Vigencia</dt><dd>${s.noExpiry?'Permanente':s.validUntil?'Hasta el '+longDate(s.validUntil):'Sin fecha confirmada'}${s.validNote?`<br><span class="faint">${esc(s.validNote)}</span>`:''}</dd><dt>Obtenido</dt><dd>${niceDate(i.got)} · ${esc(i.source||'')}</dd></dl>${s.source?`<a class="btn ghost" href="${esc(s.source)}" target="_blank" rel="noopener">Ver la fuente del beneficio ↗</a>`:''}<p class="sec-note">Revisa las condiciones en la fuente antes de usarlo: el comercio puede cambiarlas.</p>`;
    if(active)acts=st&&st.expired?`<button class="btn danger block" data-act="inv-use" data-iid="${iid}">Quitar del inventario (vencido)</button>`:`<button class="btn block" data-act="inv-use" data-iid="${iid}">Marcar como usado</button>`;
  } else {
    body+=`<p class="muted" style="text-align:center">${esc(ref.desc||'')}</p><p class="faint" style="text-align:center;font-size:13px">Obtenido el ${niceDate(i.got)} · ${esc(i.source||'')}</p>`;
    if(active){
      if(i.type==='vale')acts=st&&st.expired?`<button class="btn danger block" data-act="inv-use" data-iid="${iid}">Quitar (vencido)</button>`:`<button class="btn block" data-act="inv-use" data-iid="${iid}">Canjear: me di este premio</button>`;
      if(i.type==='titulo'){const dis=effectOn('dishonor',today());acts=S.title===i.rid?`<button class="btn ghost block" data-act="equip" data-iid="${iid}">Quitar título</button>`:`<button class="btn block" data-act="equip" data-iid="${iid}" ${dis?'disabled':''}>${dis?'Deshonrado: no puedes equipar':'Equipar título'}</button>`}
      if(i.type==='tema')acts=S.theme===i.rid?`<button class="btn ghost block" data-act="equip" data-iid="${iid}">Volver al color de mi rango</button>`:`<button class="btn block" data-act="equip" data-iid="${iid}">Aplicar tema</button>`;
      if(i.type==='item'){
        if(i.rid==='itm_escudo')acts='<p class="lock-note">Se activa solo cuando falles una misión aceptada.</p>';
        else if(i.rid==='itm_comodin')acts=`<div class="row"><button class="btn grow" data-act="use-item" data-iid="${iid}" data-arg="ayer">Proteger ayer</button><button class="btn ghost grow" data-act="use-item" data-iid="${iid}" data-arg="hoy">Proteger hoy</button></div>`;
        else if(i.rid==='itm_indulto'){const day=S.days[today()];const list=day?day.offers.filter(m=>day.accepted.includes(m.id)&&!day.done[m.id]&&!(day.pardoned||[]).includes(m.id)):[];acts=list.length?`<div class="pick">${list.map(m=>`<button data-act="use-item" data-iid="${iid}" data-arg="${m.id}"><b>Abandonar «${esc(m.title)}»</b><span class="faint">Sin castigo</span></button>`).join('')}</div>`:'<p class="lock-note">No tienes misiones aceptadas pendientes hoy.</p>'}
        else acts=`<button class="btn block" data-act="use-item" data-iid="${iid}">Usar ahora</button>`;
      }
    }
  }
  openSheet(body+acts);
}
function invUse(iid){const i=S.inventory.find(x=>x.iid===iid);if(!i)return;const st=expStatus(i);i.status='used';i.used=today();if(i.type==='vale'&&!st.expired)addFeat({date:today(),kind:'vale',title:'Te premiaste: '+invName(i),desc:'',pts:0,rarity:(refOf(i.rid)||{}).rarity||'común'});closeSheetSilent();toast(st.expired?'Quitado del inventario.':i.type==='vale'?'¡Disfrútalo! Te lo ganaste.':'Cupón marcado como usado.','good');afterChange()}
function equip(iid){const i=S.inventory.find(x=>x.iid===iid);if(!i)return;if(i.type==='titulo')S.title=S.title===i.rid?null:i.rid;if(i.type==='tema')S.theme=S.theme===i.rid?null:i.rid;closeSheetSilent();afterChange()}
function useItem(iid,arg){
  if(!needReady())return;const i=S.inventory.find(x=>x.iid===iid&&x.status==='active');if(!i)return;const t=today();const day=ensureDay(t);const consume=()=>{i.status='used';i.used=t};let reveals=[];
  switch(i.rid){
   case'itm_elixir':if(effectOn('boost',t)){toast('Ya tienes un Elixir activo hoy.');return}S.effects.push({type:'boost',from:t,to:t});consume();toast('Elixir activo: tu entrenamiento de hoy vale ×1,5.','good');break;
   case'itm_comodin':{const d=arg==='hoy'?t:addDays(t,-1);if(hasSession(LOGS[d])){toast('Ese día ya tiene entrenamiento: no necesita comodín.');return}if(S.freezeDays.includes(d)){toast('Ese día ya está protegido.');return}S.freezeDays.push(d);consume();toast(`Racha protegida para ${arg==='hoy'?'hoy':'ayer'}.`,'good');break}
   case'itm_pergamino':day.extraChanges=(day.extraChanges||0)+1;consume();toast('Tienes un cambio de objetivo extra hoy.','good');break;
   case'itm_dado':{const keep=day.offers.filter(m=>day.accepted.includes(m.id));if(keep.length>=5){toast('Ya aceptaste todas.');return}day.rerolls=(day.rerolls||0)+1;const fresh=genOffers(t,day.rerolls,keep.map(m=>m.key)).slice(0,5-keep.length);day.offers=keep.concat(fresh).sort((a,b)=>(b.forced?1:0)-(a.forced?1:0)||a.diff-b.diff);consume();toast('Nuevas misiones sobre la mesa.','good');break}
   case'itm_llave':{const r=Math.random();const rar=r<.45?'poco común':r<.8?'raro':r<.95?'épico':'legendario';consume();reveals=[{kind:'cofre',title:'Cofre abierto',reward:grantReward(rar,'Llave de Cofre')}];break}
   case'itm_indulto':{if(!arg||!day.accepted.includes(arg)){invSheet(iid);return}day.pardoned=day.pardoned||[];day.pardoned.push(arg);consume();toast('Misión abandonada sin castigo.','good');break}
   default:toast('Este ítem se activa solo.');return;
  }
  closeSheetSilent();afterChange(reveals);
}
function dexSheet(rid){
  const e=dexEntries().find(x=>x.rid===rid);if(!e)return;const k=S.pokedex[rid];const r=e.ref;
  if(!k){openSheet(`<div class="reveal bd-${RK[r.rarity]||'c'}"><div class="big" style="filter:brightness(0) opacity(.5);animation:none">${esc(r.icon)}</div><h3>${e.no} · ???</h3>${rarChip(r.rarity)}<p class="muted">${TYPE_NAME[r.type]} sin descubrir. ${{común:'Sale de misiones fáciles y cofres.','poco común':'Sale de misiones ★★, cofres y ascensos tempranos.',raro:'Sale de misiones ★★★, objetivos y cofres.',épico:'Sale de objetivos difíciles, misiones ★★★★ y ascensos.',legendario:'Sale de objetivos avanzados y ascensos altos.',mítico:'Solo se obtiene en la cima.'}[r.rarity]||''}</p></div>`);return}
  openSheet(`<div class="reveal bd-${RK[r.rarity]||'c'}"><div class="big" style="animation:none">${esc(r.icon)}</div><div class="eyebrow">${e.no} · ${TYPE_NAME[r.type]}</div><h3>${esc(r.name)}</h3>${rarChip(r.rarity)}<p class="muted">${esc(r.desc||'')}</p><p class="faint num" style="font-size:13px">Primera vez: ${longDate(k.first)} · obtenido ${k.count} ${k.count===1?'vez':'veces'}</p></div>`);
}
function customExSheet(){
  const d=UI.customDraft=UI.customDraft||{name:'',metric:'reps',muscles:{}};
  openSheet(`<h3>Crear ejercicio</h3><label class="fl">Nombre<input type="text" id="cx-name" value="${esc(d.name)}" placeholder="Ej.: Flexiones arqueras"></label>
  <label class="fl">Cómo se mide<select id="cx-metric">${Object.entries(METRIC_LABEL).map(([k,l])=>`<option value="${k}" ${d.metric===k?'selected':''}>${l}</option>`).join('')}</select></label>
  <div class="fl">Músculos (una vez = secundario, dos = principal)<div class="msel">${Object.entries(MUSCLES).map(([m,l])=>`<button type="button" data-act="cx-m" data-m="${m}" data-w="${d.muscles[m]||0}">${l}</button>`).join('')}</div></div>
  <button class="btn block" data-act="cx-save">Crear ejercicio</button>`);
}
function baseInputs(id,prefix,val){
  const X=exDef(id);val=val||{};const v=k=>val[k]!=null?val[k]:'';
  if(X.metric==='reps')return numIn(prefix+'reps',X.unit?`¿Cuántas ${X.unit} haces hoy en un día?`:'¿Cuántas haces hoy en un día, sumando series?',v('reps'));
  if(X.metric==='secs')return numIn(prefix+'secs','Segundos en total en un día',v('secs'));
  if(X.metric==='load')return`<div class="multi">${numIn(prefix+'sets','Series',v('sets'))}${numIn(prefix+'reps','Reps',v('reps'))}${numIn(prefix+'kg','Kg',v('kg'),'0.5')}</div>`;
  return`<div class="multi">${numIn(prefix+'min','Minutos',v('min'))}${numIn(prefix+'km','Km',v('km'),'0.1')}</div>`;
}
function readBase(id,prefix){
  const X=exDef(id);const g=f=>{const el=$('#'+prefix+f);return el?parseFloat(el.value)||0:0};
  if(X.metric==='reps'){const r=g('reps');return r>0?{reps:Math.round(r)}:null}if(X.metric==='secs'){const s=g('secs');return s>0?{secs:Math.round(s)}:null}
  if(X.metric==='load'){const s=g('sets'),r=g('reps'),k=g('kg');return s>0&&r>0&&k>0?{sets:Math.round(s),reps:Math.round(r),kg:k}:null}
  const m=g('min'),k=g('km');return m>0?(k>0?{min:Math.round(m),km:k}:{min:Math.round(m)}):null;
}
function trackSheet(id){openSheet(`<h3>${esc(exDef(id).name)}</h3><p class="muted">Para sumarlo a tus ejercicios principales necesito tu base: lo que haces hoy en un día. Ese valor será el techo de Novato I para este ejercicio.</p>${baseInputs(id,'tb-',S.profile.base[id])}<button class="btn block" data-act="track-ok" data-ex="${id}">Agregar ejercicio principal</button>`)}

/* ================= onboarding ================= */
const OB_STEPS=['Bienvenida','Tu cuerpo','Equipamiento','Ejercicios','Tu base','Frecuencia','Bancos','Premios','Últimos detalles'];
function obInit(){UI.ob=UI.ob||{step:0,nick:((AUTH_USER&&AUTH_USER.displayName)||'').split(' ')[0]||'',height:'',weight:'',body:null,age:null,exp:null,equip:[],exercises:[],base:{},freq:'4',banks:{},prefs:[],comuna:'',selfRewards:['','',''],mode:'normal',ranking:false};return UI.ob}
function renderOnboarding(){
  document.body.classList.add('bare');$('#tabs').innerHTML='';$('#hdr-emb').innerHTML=emblem(0,'');$('#hdr-sub').textContent='Configura tu liga';setSync('ok',STORE==='demo'?'Modo demo':'Conectado');
  const o=obInit();const s=o.step;let body='';
  const avail=Object.keys(EX).concat(Object.keys(S.customEx||{})).filter(id=>{const X=exDef(id);return!X.eq||X.eq.some(e=>o.equip.includes(e))});
  if(s===0)body=`<p class="lead">Vamos a armar una liga a tu medida: tus rangos, misiones y premios se calculan desde tu cuerpo, tus ejercicios y tus bancos. Toma unos 3 minutos.</p><label class="fl">¿Cómo quieres que te llamen?<input type="text" id="ob-nick" maxlength="24" value="${esc(o.nick)}" placeholder="Tu apodo"></label>`;
  if(s===1)body=`<div class="grid2">${numIn('ob-height','Altura (cm)',o.height)}${numIn('ob-weight','Peso (kg)',o.weight,'0.5')}</div><div class="fl">Tipo de cuerpo<div class="pick">${BODY.map(b=>`<button type="button" data-act="pf-one" data-g="body" data-k="${b[0]}" data-w="${o.body===b[0]?1:0}" class="opt"><b>${b[1]}</b><span class="faint">${b[2]}</span></button>`).join('')}</div></div><div class="fl">Edad${chipSel('age',AGES,o.age,false)}</div><div class="fl">Experiencia<div class="pick">${EXPS.map(b=>`<button type="button" data-act="pf-one" data-g="exp" data-k="${b[0]}" data-w="${o.exp===b[0]?1:0}" class="opt"><b>${b[1]}</b><span class="faint">${b[2]}</span></button>`).join('')}</div></div>`;
  if(s===2)body=`<p class="muted">¿Con qué cuentas? Solo tu cuerpo siempre está incluido. Esto decide qué ejercicios aparecen en tus misiones.</p>${chipSel('equip',EQUIP,o.equip,true)}`;
  if(s===3)body=`<p class="muted">Elige entre 1 y 6 ejercicios principales: los que harás seguido. Definen tu rango, tus misiones y tus objetivos.</p><div class="msel">${avail.map(id=>`<button type="button" data-act="ob-ex" data-k="${id}" data-w="${o.exercises.includes(id)?1:0}">${esc(exDef(id).name)}</button>`).join('')}</div><button class="btn ghost" data-act="custom-ex">Crear un ejercicio propio</button>`;
  if(s===4)body=`<p class="muted">¿Cuánto haces hoy en un día de cada uno? Sé honesto: este número es el techo de <b>Novato I</b> y desde ahí se calculan todos tus rangos.</p>${o.exercises.map(id=>`<div class="card" style="display:flex;flex-direction:column;gap:8px"><b style="display:flex;gap:8px;align-items:center"><i class="sw" style="background:${PALETTE[o.exercises.indexOf(id)]||OTHER_COLOR}"></i>${esc(exDef(id).name)}</b>${baseInputs(id,'ob-b-'+id+'-',o.base[id])}</div>`).join('')}`;
  if(s===5)body=`<p class="muted">¿Cuántos días por semana piensas entrenar? Ajusta tu curva esperada y la meta del cofre semanal.</p>${chipSel('freq',[2,3,4,5,6,7].map(n=>[String(n),n+' días']),o.freq,false)}`;
  if(s===6)body=`<p class="muted">¿Qué bancos y billeteras tienes? Así los cupones que ganes serán de tus tarjetas. Marca si tienes débito, crédito o ambas: muchos descuentos son solo con crédito.</p>${banksEditor(o.banks)}`;
  if(s===7)body=`<p class="muted">¿Qué tipo de premios te motivan? Si no marcas ninguno, te llegan de todo tipo.</p>${chipSel('prefs',PREFS,o.prefs,true)}<label class="fl">Tu comuna (para priorizar descuentos y eventos cerca)<input type="text" id="ob-comuna" list="comunas" value="${esc(o.comuna)}" placeholder="Ej.: Ñuñoa"></label>`;
  if(s===8)body=`<div class="fl">Tres cosas con las que te gusta premiarte (aparecerán como vales en el juego)${[0,1,2].map(i=>`<input type="text" id="ob-sr-${i}" maxlength="50" value="${esc(o.selfRewards[i]||'')}" placeholder="${['Ej.: un helado de mi heladería favorita','Ej.: comprarme ese videojuego','Ej.: una escapada de fin de semana'][i]}">`).join('')}</div>
   <div class="fl">Modo de juego<div class="pick">${MODES.map(b=>`<button type="button" data-act="pf-one" data-g="mode" data-k="${b[0]}" data-w="${o.mode===b[0]?1:0}" class="opt"><b>${b[1]}</b><span class="faint">${b[2]}</span></button>`).join('')}</div></div>
   <div class="fl">Liga general con tus amigos<small class="faint">Una tabla semanal con la misma regla para todos. Solo se comparte tu apodo y tres cifras.</small>${chipSel('ranking',[['si','Participar'],['no','Ahora no']],o.ranking?'si':'no',false)}</div>`;
  $('#view').innerHTML=`<section class="ob"><div class="ob-prog">${OB_STEPS.map((n,i)=>`<i class="${i<=s?'on':''}"></i>`).join('')}</div><div class="eyebrow">Paso ${s+1} de ${OB_STEPS.length}</div><h1 class="display ob-title">${OB_STEPS[s]}</h1><div class="ob-body">${body}</div>
   <div class="row ob-nav">${s>0?'<button class="btn ghost" data-act="ob-back">Atrás</button>':''}<button class="btn grow" data-act="ob-next">${s===OB_STEPS.length-1?'Crear mi liga':'Siguiente'}</button></div></section>`;
  window.scrollTo(0,0);
}
function obCollect(){
  const o=UI.ob;const s=o.step;const val=id=>{const el=$('#'+id);return el?el.value.trim():''};
  if(s===0)o.nick=val('ob-nick');
  if(s===1){o.height=val('ob-height');o.weight=val('ob-weight')}
  if(s===4)for(const id of o.exercises){const b=readBase(id,'ob-b-'+id+'-');if(b)o.base[id]=b;else delete o.base[id]}
  if(s===7)o.comuna=val('ob-comuna');
  if(s===8)o.selfRewards=[0,1,2].map(i=>val('ob-sr-'+i));
}
function obValid(){
  const o=UI.ob;const s=o.step;
  if(s===0&&!o.nick)return'Escribe un apodo.';
  if(s===1){const h=+o.height,w=+o.weight;if(!(h>=120&&h<=230))return'Ingresa tu altura en centímetros (por ejemplo 175).';if(!(w>=35&&w<=250))return'Ingresa tu peso en kilos.';if(!o.body)return'Elige tu tipo de cuerpo (o «No sé»).';if(!o.age)return'Elige tu rango de edad.';if(!o.exp)return'Elige tu experiencia.'}
  if(s===3&&!o.exercises.length)return'Elige al menos un ejercicio.';
  if(s===4){const miss=o.exercises.filter(id=>!o.base[id]);if(miss.length)return'Completa la base de: '+miss.map(id=>exDef(id).name).join(', ')+'.'}
  return null;
}
function finishOnboarding(){
  const o=UI.ob;const t=today();
  S.uid=(AUTH_USER&&AUTH_USER.uid)||'demo';
  S.profile={nick:o.nick,height:+o.height,weight:+o.weight,body:o.body,age:o.age,exp:o.exp,equip:o.equip.slice(),freq:+o.freq||4,banks:clone(o.banks),prefs:o.prefs.slice(),comuna:o.comuna,selfRewards:o.selfRewards.slice(),mode:o.mode,ranking:!!o.ranking,base:clone(o.base),created:t};
  S.tracked=o.exercises.slice();S.created=t;S.lastProcessed=addDays(t,-1);for(const e of S.tracked)noteExUse(e);
  const bp=S.tracked.reduce((a,e)=>a+rawPts(e,S.profile.base[e]),0);S.profile.ppScale=bp>0?clamp(40/bp,.25,4):1;
  UI.ob=null;NEW_GAME=true;UI.view='inicio';location.hash='inicio';startGame();
}

/* ================= eventos ================= */
function prefTarget(){return S&&S.profile?UI.pf:UI.ob}
document.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-act]');if(!b){if(ev.target.id==='sheet')closeSheet();return}
  const a=b.dataset.act;
  switch(a){
   case'tab':go(b.dataset.v);break;
   case'close':closeSheet();break;
   case'signin':signIn();break;
   case'demo':startDemo();break;
   case'logout':logout();break;
   case'step':{const el=$(`#in-${b.dataset.ex}-${b.dataset.f}`);el.value=Math.max(0,(parseInt(el.value)||0)+(+b.dataset.d));break}
   case'save-log':saveLog();break;
   case'del-log':delLog();render();break;
   case'regdate':UI.regDate=b.dataset.d;UI.extraRows=[];window.scrollTo(0,0);render();break;
   case'untrack':S.tracked=S.tracked.filter(x=>x!==b.dataset.ex);cleanObjectives();persist();render();break;
   case'track-ok':{const id=b.dataset.ex;const base=readBase(id,'tb-');if(!base){toast('Completa tu base para este ejercicio.','bad');return}S.profile.base[id]=base;if(!S.tracked.includes(id))S.tracked.push(id);noteExUse(id);cleanObjectives();closeSheetSilent();toast('Ejercicio principal agregado.','good');persist();render();break}
   case'custom-ex':customExSheet();break;
   case'cx-m':{const m=b.dataset.m;const d=UI.customDraft;const w=d.muscles[m]||0;const nw=w===0?.5:w===.5?1:0;if(nw)d.muscles[m]=nw;else delete d.muscles[m];b.dataset.w=nw;break}
   case'cx-save':{const d=UI.customDraft;d.name=$('#cx-name').value.trim();d.metric=$('#cx-metric').value;if(!d.name){toast('Ponle un nombre.','bad');return}if(!Object.keys(d.muscles).length){toast('Elige al menos un músculo.','bad');return}
     const id='c_'+uid();const ppu={reps:.6,secs:.3,load:1/40,cardio:1}[d.metric];S.customEx[id]={name:d.name,short:d.name.slice(0,16),metric:d.metric,ppu,muscles:Object.assign({},d.muscles),custom:true};UI.customDraft=null;closeSheetSilent();
     if(!S.profile){UI.ob.exercises.length<6&&UI.ob.exercises.push(id);renderOnboarding()}else{persist();trackSheet(id)}break}
   case'm-pre':UI.confirm=b.dataset.id;render();break;
   case'm-cancel':UI.confirm=null;render();break;
   case'm-accept':acceptMission(b.dataset.id);break;
   case'm-manual':{const day=S.days[today()];const m=day.offers.find(x=>x.id===b.dataset.id);if(m)manualSheet(m);break}
   case'm-manual-ok':manualOk(b.dataset.id);break;
   case'm-check':checkMission(b.dataset.id);break;
   case'o-claim':claimObjective(b.dataset.id);break;
   case'o-record':recordSheet(b.dataset.id);break;
   case'o-record-ok':recordOk(b.dataset.id);break;
   case'o-change':changeSheet(b.dataset.id);break;
   case'o-pick':pickObjective(+b.dataset.i);break;
   case'evo':UI.evoEx=b.dataset.ex;render();break;
   case'mper':UI.musPeriod=+b.dataset.v;render();break;
   case'mmode':UI.musMode=b.dataset.v;render();break;
   case'mus':UI.musSel=UI.musSel===b.dataset.m?null:b.dataset.m;render();break;
   case'inv':closeSheetSilent();invSheet(b.dataset.iid);break;
   case'inv-use':invUse(b.dataset.iid);break;
   case'equip':equip(b.dataset.iid);break;
   case'use-item':useItem(b.dataset.iid,b.dataset.arg);break;
   case'dex':dexSheet(b.dataset.rid);break;
   case'pokef':UI.pokeF=b.dataset.v;render();break;
   case'featf':UI.featF=b.dataset.v;render();break;
   case'rsort':UI.rankSort=b.dataset.v;render();break;
   case'rank-on':S.profile.ranking=true;UI.pf=null;toast('Te uniste a la liga general.','good');persist();render();break;
   case'pf-one':case'pf-tog':{const T=prefTarget();const g=b.dataset.g,k=b.dataset.k;if(g==='ranking')T.ranking=k==='si';else if(a==='pf-one')T[g]=k;else{T[g]=T[g]||[];T[g]=T[g].includes(k)?T[g].filter(x=>x!==k):T[g].concat(k)}const grp=b.parentElement;if(a==='pf-one')grp.querySelectorAll('[data-act="pf-one"]').forEach(x=>x.dataset.w=0);b.dataset.w=a==='pf-one'?1:(T[g].includes(k)?1:0);break}
   case'bank-tog':{const T=prefTarget();collectPartial();T.banks=T.banks||{};const k=b.dataset.k;if(T.banks[k])delete T.banks[k];else T.banks[k]={debito:true,credito:false};S.profile?render():renderOnboarding();break}
   case'bank-card':{const T=prefTarget();const k=b.dataset.k,c=b.dataset.c;T.banks[k][c]=!T.banks[k][c];if(!T.banks[k].debito&&!T.banks[k].credito)T.banks[k][c==='debito'?'credito':'debito']=true;b.dataset.w=T.banks[k][c]?1:0;b.parentElement.querySelectorAll('[data-act="bank-card"]').forEach(x=>x.dataset.w=T.banks[k][x.dataset.c]?1:0);break}
   case'ob-ex':{const o=UI.ob;const k=b.dataset.k;if(o.exercises.includes(k))o.exercises=o.exercises.filter(x=>x!==k);else if(o.exercises.length<6)o.exercises.push(k);else toast('Máximo 6 ejercicios principales.');b.dataset.w=o.exercises.includes(k)?1:0;break}
   case'ob-next':{obCollect();const err=obValid();if(err){toast(err,'bad');return}if(UI.ob.step>=OB_STEPS.length-1)finishOnboarding();else{UI.ob.step++;if(UI.ob.step===3){const avail=id=>{const X=exDef(id);return!X.eq||X.eq.some(e=>UI.ob.equip.includes(e))};UI.ob.exercises=UI.ob.exercises.filter(avail)}renderOnboarding()}break}
   case'ob-back':obCollect();UI.ob.step=Math.max(0,UI.ob.step-1);renderOnboarding();break;
   case'pf-save':savePerfil();break;
   case'pf-reset':UI.pf=null;render();break;
  }
});
function collectPartial(){if(!S.profile&&UI.ob)obCollect();else if(UI.pf)collectPerfil()}
function collectPerfil(){const P=UI.pf;if(!P)return;const v=id=>{const el=$('#'+id);return el?el.value.trim():null};const n=v('pf-nick');if(n!=null)P.nick=n;const h=v('pf-height');if(h!=null)P.height=+h;const w=v('pf-weight');if(w!=null)P.weight=+w;const c=v('pf-comuna');if(c!=null)P.comuna=c;const sr=[0,1,2].map(i=>v('pf-sr-'+i));if(sr[0]!=null)P.selfRewards=sr}
function savePerfil(){
  collectPerfil();const P=UI.pf;if(!P.nick){toast('Escribe un apodo.','bad');return}if(!(P.height>=120&&P.height<=230)){toast('Revisa tu altura (cm).','bad');return}if(!(P.weight>=35&&P.weight<=250)){toast('Revisa tu peso (kg).','bad');return}
  const keep={base:S.profile.base,created:S.profile.created,ppScale:S.profile.ppScale};P.freq=+P.freq||4;S.profile=Object.assign({},P,keep);UI.pf=null;
  for(const k of Object.keys(PARAM_CACHE))delete PARAM_CACHE[k];cleanObjectives();toast('Perfil guardado.','good');persist();render();
}
document.addEventListener('change',ev=>{
  const t=ev.target;if(!S||!S.profile)return;
  if(t.id==='reg-date'){UI.regDate=t.value&&t.value<=today()?t.value:today();UI.extraRows=[];render()}
  if(t.id==='add-ex-day'&&t.value){UI.extraRows.push(t.value);render()}
  if(t.id==='track-sel'&&t.value){trackSheet(t.value);t.value=''}
});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!$('#sheet').hidden)closeSheet()});
const VALID=new Set(TABS.map(t=>t[0]));
function go(v){if(!VALID.has(v))v='inicio';UI.view=v;UI.confirm=null;if(v!=='perfil')UI.pf=null;if(location.hash!=='#'+v)location.hash=v;else render();window.scrollTo(0,0)}
window.addEventListener('hashchange',()=>{if(!S||!S.profile)return;const v=location.hash.slice(1);UI.view=VALID.has(v)?v:'inicio';render();window.scrollTo(0,0)});

/* ================= arranque y sesión ================= */
function startGame(){
  READY=true;const reveals=[];
  S.stats=S.stats||{missions:0,objectives:0};S.freezeDays=S.freezeDays||[];S.effects=S.effects||[];S.exOrder=S.exOrder||[];S.customEx=S.customEx||{};S.inventory=S.inventory||[];S.pokedex=S.pokedex||{};S.feats=S.feats||[];S.scars=S.scars||[];S.ledger=S.ledger||[];S.days=S.days||{};S.objectives=S.objectives||[];
  if(NEW_GAME){compute();reveals.push(...starterPack().map(r=>({kind:'cofre',title:'Kit de bienvenida',reward:r})));compute();initialObjectives();S.maxLevel=compute().level;NEW_GAME=false}
  compute();cleanObjectives();const r=processRollover();ensureDay(today());compute();reveals.push(...r.reveals,...checkAuto(today()));
  if(r.notes.length)UI.reveals.push({kind:'notes',notes:r.notes});UI.lastLevel=S.maxLevel;afterChange(reveals);
  clearInterval(window.__tick);window.__tick=setInterval(tick,60000);
}
function tick(){if(!READY||!S||!S.profile)return;const before=S.lastProcessed+'|'+Object.keys(S.days).length;const r=processRollover();ensureDay(today());if(before!==S.lastProcessed+'|'+Object.keys(S.days).length||r.reveals.length){if(r.notes.length)UI.reveals.push({kind:'notes',notes:r.notes});afterChange(r.reveals)}}
function cfgOk(){const c=window.FIREBASE_CONFIG;return!!(c&&c.apiKey&&c.projectId&&!/PEGA|TU_|XXX/i.test(c.apiKey))}
function renderLanding(){
  document.body.classList.add('bare');$('#tabs').innerHTML='';$('#hdr-emb').innerHTML=emblem(0,'');$('#hdr-sub').textContent='Tu entrenamiento, convertido en liga';setSync('',cfgOk()?'Sin sesión':'Sin conectar');
  const ok=cfgOk();
  $('#view').innerHTML=`<section class="landing"><div class="land-embs">${[0,6,12,18,21].map(i=>emblem(i)).join('')}</div>
   <h1 class="display land-title">Liga del Empuje</h1>
   <p class="lead">Registra tu entrenamiento diario y sube de Novato a Leyenda. Rangos calculados desde tu propia base, misiones con premio y castigo, mapa muscular y cupones reales de tus bancos.</p>
   <div class="land-actions">${ok?'<button class="btn" data-act="signin">Entrar con Google</button>':''}<button class="btn ghost" data-act="demo">Probar en modo demo</button></div>
   ${ok?'':'<p class="sec-note">La página todavía no está conectada a su base de datos. Mientras tanto puedes probarla en modo demo: los datos quedan solo en este navegador.</p>'}
   <ul class="land-list"><li><b>Rango personal.</b> Novato I parte desde lo que tú haces hoy; nadie compite con tu rango.</li><li><b>Liga general opcional.</b> Una tabla semanal con la misma regla para todos.</li><li><b>Premios reales.</b> Cupones de tus tarjetas y panoramas gratis, actualizados cada semana.</li></ul></section>`;
}
async function signIn(){
  if(!FB)return;const p=new firebase.auth.GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});
  try{await FB.auth.signInWithPopup(p)}catch(e){if(e&&(e.code==='auth/popup-blocked'||e.code==='auth/operation-not-supported-in-this-environment'))FB.auth.signInWithRedirect(p);else if(e&&e.code!=='auth/popup-closed-by-user'&&e.code!=='auth/cancelled-popup-request')toast('No se pudo iniciar sesión: '+(e.message||e.code),'bad')}
}
function resetSession(){for(const u of UNSUBS)try{u()}catch(e){}UNSUBS=[];S=null;LOGS={};D=null;BOOTED=false;READY=false;UI.ob=null;UI.pf=null;UI.analysis=null;UI.reveals=[];lastSavedJSON='';lastRankJSON='';clearInterval(window.__tick)}
async function logout(){if(STORE==='demo'){resetSession();STORE='cargando';BOOTED=true;renderLanding();return}try{await FB.auth.signOut()}catch(e){}}
function startDemo(){
  resetSession();STORE='demo';AUTH_USER={uid:'demo',displayName:'',email:''};
  try{const s=lsGet('liga-web-state');S=s?JSON.parse(s):null}catch(e){S=null}try{const l=lsGet('liga-web-logs');LOGS=l?JSON.parse(l):{}}catch(e){LOGS={}}
  if(!S)freshState('demo');BOOTED=true;if(S.profile){UI.view=VALID.has(location.hash.slice(1))?location.hash.slice(1):'inicio';startGame()}else render();
}
function startUser(u){
  resetSession();STORE='fb';AUTH_USER=u;setSync('warn','Conectando');$('#view').innerHTML='<div class="loading">Cargando tu liga…</div>';
  let gotS=false,defS=false,gotL=false,defL=false;
  let obShown=false;
  const maybe=()=>{if(!BOOTED&&gotS&&gotL&&S&&S.profile){BOOTED=true;render()}if(!READY&&defS&&defL&&S){BOOTED=true;setSync('ok','Guardado');if(S.profile){UI.view=VALID.has(location.hash.slice(1))?location.hash.slice(1):'inicio';startGame()}else if(!obShown){obShown=true;render()}}};
  UNSUBS.push(userDoc().onSnapshot(snap=>{
    if(snap.metadata.hasPendingWrites)return;const data=snap.exists?snap.data():null;if(!snap.metadata.fromCache)defS=true;
    if(!READY){if(data){S=clone(data);lastSavedJSON=JSON.stringify(S);gotS=true}else if(defS&&!gotS){freshState(u.uid);gotS=true}}
    else if(data&&!dirty&&!saving){const j=JSON.stringify(data);if(j!==lastSavedJSON){S=clone(data);lastSavedJSON=j;render()}}
    maybe();
  },e=>{setSync('bad','Sin conexión');toast('No se pudo leer tu liga. Revisa tu conexión y recarga.','bad')}));
  UNSUBS.push(userDoc().collection('logs').onSnapshot(qs=>{const L={};qs.docs.forEach(d=>{L[d.id]=clone(d.data())});LOGS=L;gotL=true;if(!qs.metadata.fromCache)defL=true;if(READY&&S&&S.profile)render();maybe()},e=>setSync('bad','Sin conexión')));
  UNSUBS.push(FB.db.collection('ranking').onSnapshot(qs=>{UI.rank=qs.docs.map(d=>Object.assign({id:d.id},d.data()));if(READY&&S&&S.profile&&UI.view==='liga')render()},()=>{}));
  setTimeout(()=>{if(!READY)setSync('warn','Sin respuesta')},10000);
}
function boot(){
  UI.regDate=today();loadCatalog();BOOTED=true;
  if(!cfgOk()||typeof firebase==='undefined'){FB=null;renderLanding();return}
  try{firebase.initializeApp(window.FIREBASE_CONFIG);FB={auth:firebase.auth(),db:firebase.firestore()}}catch(e){FB=null;renderLanding();toast('No se pudo iniciar Firebase.','bad');return}
  FB.auth.getRedirectResult().catch(e=>{if(e&&e.code)toast('No se pudo iniciar sesión: '+e.code,'bad')});
  FB.auth.onAuthStateChanged(u=>{if(u)startUser(u);else{if(STORE==='demo')return;resetSession();STORE='cargando';BOOTED=true;renderLanding()}});
}
boot();
