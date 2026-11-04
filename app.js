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
    let mult=1;if(effectOn('boost',d))mult*=1.5;if(effectOn('boost2',d))mult*=2;if(effectOn('chalk',d))mult*=1.1;if(effectOn('banner',d))mult*=1.5;mult=Math.min(mult,3);if(effectOn('fatigue',d))mult*=.75;
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
  for(const c of catalogAll()){if(c.rarity!==rar||c.only)continue;if(forceType&&c.type!==forceType)continue;if(['insignia','titulo','cronica','tema','companero','marco','fondo','aura','efecto','lema','icono'].includes(c.type)&&S.pokedex[c.id])continue;pool.push({ref:c,w:TYPE_W[c.type]*(c.mine?2:1)})}
  if(!forceType||forceType==='cupon')for(const cp of CAT){if(cp.rarity!==rar||!couponAvailable(cp))continue;const near=comuna&&((cp.zone||'')+' '+(cp.channel||'')).toLowerCase().includes(comuna);pool.push({ref:couponRef(cp),w:TYPE_W.cupon*(near?2:1)})}
  if(!pool.length){if(forceType)return grantReward(rarity,source,null);const pts=[10,20,40,80,150,300][ri];addLedger(today(),pts,'bonus','Recompensa convertida en PP');return{rid:'pp',name:`+${pts} PP`,icon:'✨',rarity:rar,type:'pp',source,cursed}}
  const ch=wpick(Math.random,pool,p=>p.w);return Object.assign(giveItem(ch.ref,source),{cursed});
}
function giveItem(ref,source){
  const t=today();const rid=ref.id;const pd=S.pokedex[rid]||(S.pokedex[rid]={first:t,count:0});pd.count++;
  let inv=null;
  if(['cupon','vale','item','titulo','tema','cofre','companero','marco','fondo','aura','efecto','lema','icono'].includes(ref.type)){
    let expires=null;if(ref.type==='vale')expires=addDays(t,ref.days||14);if(ref.type==='cupon')expires=ref.snap.validUntil||null;
    inv={iid:uid(),rid,type:ref.type,got:t,expires,status:'active',source};if(ref.snap)inv.snap=ref.snap;if(ref.mine)inv.snapName=ref.name;
    if((UNIQ_INV.includes(ref.type))&&S.inventory.find(i=>i.rid===rid&&i.status==='active'))inv=null;
    if(inv)S.inventory.push(inv);
  }
  return{rid,name:ref.name,icon:ref.icon,rarity:ref.rarity,type:ref.type,source,iid:inv?inv.iid:null};
}
function giveFixed(code,source){
  if(code.startsWith('cup:'))return grantReward(code.slice(4),source,'cupon');
  const c=catById(code);if(!c)return grantReward('raro',source);
  if(['insignia','titulo','cronica','tema','companero','marco','fondo','aura','efecto','lema','icono'].includes(c.type)&&S.pokedex[c.id])return grantReward(c.rarity,source);
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
  const effs=activeEffects(today()).map(e=>({boost:['st-good','Elixir ×1,5 activo hoy'],fatigue:['st-bad','Fatiga: ×0,75 hoy'],nostreak:['st-warn','Racha sin bono'],dishonor:['st-bad','Deshonra: título oculto'],sealed:['st-warn','Sello: sin cambios de objetivo'],curse:['st-serious','Maldición: próxima recompensa rebajada'],boost2:['st-good','Poder ×2 activo'],chalk:['st-good','Tiza: ×1,1 hoy'],banner:['st-good','Estandarte: ×1,5 activo'],horn:['st-good','Cuerno de guerra: misiones ×2 PP'],fortune:['st-info','Fortuna: tu próximo cofre sube de nivel'],aegis:['st-info','Corazón de Fénix: inmune a castigos']}[e.type])).filter(Boolean);
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
  const types={todos:null,insignia:'Insignias',titulo:'Títulos',cronica:'Crónicas',item:'Ítems',vale:'Vales',tema:'Temas',cofre:'Cofres',companero:'Compañeros',marco:'Marcos',fondo:'Fondos',aura:'Auras',efecto:'Efectos',lema:'Lemas',icono:'Íconos',cupon:'Cupones'};
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
   ${on?'<p class="sec-note">Solo se comparte tu apodo y estas tres cifras. Puedes salir desde Ajustes.</p>':''}</section>`;
}

/* ===== Perfil ===== */
function chipSel(name,opts,sel,multi){return`<div class="msel" data-group="${name}">${opts.map(([k,l])=>`<button type="button" data-act="${multi?'pf-tog':'pf-one'}" data-g="${name}" data-k="${k}" data-w="${(multi?(sel||[]).includes(k):sel===k)?1:0}">${esc(l)}</button>`).join('')}</div>`}
function banksEditor(banks){
  banks=banks||{};return`<div class="msel">${BANKS.map(([k,l])=>`<button type="button" data-act="bank-tog" data-k="${k}" data-w="${banks[k]?1:0}">${esc(l)}</button>`).join('')}</div>
  ${Object.keys(banks).length?`<div class="bank-cards">${Object.keys(banks).map(k=>`<div class="row" style="justify-content:space-between;gap:8px"><span>${esc(BANK_NAME[k]||k)}</span><span class="row" style="gap:6px"><button type="button" class="pill" data-act="bank-card" data-k="${k}" data-c="debito" data-w="${banks[k].debito?1:0}">Débito</button><button type="button" class="pill" data-act="bank-card" data-k="${k}" data-c="credito" data-w="${banks[k].credito?1:0}">Crédito</button></span></div>`).join('')}</div>`:''}`;
}
function vPerfil(){
  const P=UI.pf||(UI.pf=JSON.parse(JSON.stringify(S.profile)));
  return`<section class="sec" style="margin-top:0"><div class="sec-head"><h2 class="sec-title">Tus datos</h2><span class="sec-note">${esc(STORE==='demo'?'Modo demo (solo este navegador)':(AUTH_USER&&AUTH_USER.email)||'')}</span></div>
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

/* ================= COFRES, COMPAÑEROS Y PERFIL (módulo compartido artefacto + web) ================= */
const IS_WEB=typeof catalogAll==='function';
function cref(id){return IS_WEB?catById(id):(CAT_BY_ID[id]||null)}
const UNIQ_INV=['titulo','tema','companero','marco','fondo','aura','efecto','lema','icono'];
const UNIQ_DEX=['insignia','titulo','companero','marco','fondo','aura','efecto','lema','icono'];
const COSMETIC=['companero','marco','fondo','aura','efecto','lema','icono'];
const CH_TIERS=['raro','epico','legendario','mitico'];
const CH_NAME={raro:'raro',epico:'épico',legendario:'legendario',mitico:'mítico'};
const CH_RAR={raro:'raro',epico:'épico',legendario:'legendario',mitico:'mítico'};
const RAR_TIER={'común':'raro','poco común':'raro','raro':'raro','épico':'epico','legendario':'legendario','mítico':'mitico'};
const RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
Object.assign(TYPE_NAME,{cofre:'Cofre',companero:'Compañero',marco:'Marco',fondo:'Fondo',aura:'Aura',efecto:'Efecto',lema:'Lema',icono:'Ícono'});
TYPE_W.companero=4;

/* ---------- contenido de cada cofre (PP + 4 objetos = máximo 5) ---------- */
const CH_SPEC={
 raro:{pp:[80,130],slots:['común','raro',[['raro',.6],['común',.4]],[['épico',.22],['raro',.48],['común',.3]]],txt:'+80–130 PP, 1 objeto común, 1 raro garantizado y 2 más con chance de épico.'},
 epico:{pp:[180,280],slots:['raro','épico',[['épico',.55],['raro',.45]],[['legendario',.14],['épico',.46],['raro',.4]]],txt:'+180–280 PP, 1 objeto raro, 1 épico garantizado y 2 más con chance de legendario.'},
 legendario:{pp:[420,650],slots:['épico','legendario',[['legendario',.5],['épico',.5]],[['mítico',.08],['legendario',.47],['épico',.45]]],txt:'+420–650 PP, 1 objeto épico, 1 legendario garantizado y 2 más con chance de mítico.'},
 mitico:{pp:[1000,1500],slots:['legendario','mítico',[['mítico',.35],['legendario',.65]],[['mítico',.2],['legendario',.8]]],txt:'+1.000–1.500 PP, 1 objeto legendario y al menos 1 mítico garantizado. Con suerte, 2 o 3 míticos.'}
};

/* ---------- catálogo exclusivo de cofres ---------- */
const CH_CATALOG=[];
const chAdd=(o)=>{o.only=o.only!==false;o.chest=true;CH_CATALOG.push(o);return o};
// cofres
chAdd({id:'chest_raro',type:'cofre',tier:'raro',name:'Cofre raro',icon:'🧰',rarity:'raro',desc:CH_SPEC.raro.txt,noDrop:true});
chAdd({id:'chest_epico',type:'cofre',tier:'epico',name:'Cofre épico',icon:'🧰',rarity:'épico',desc:CH_SPEC.epico.txt,noDrop:true});
chAdd({id:'chest_legendario',type:'cofre',tier:'legendario',name:'Cofre legendario',icon:'🧰',rarity:'legendario',desc:CH_SPEC.legendario.txt,noDrop:true});
chAdd({id:'chest_mitico',type:'cofre',tier:'mitico',name:'Cofre mítico',icon:'🧰',rarity:'mítico',desc:CH_SPEC.mitico.txt,noDrop:true});
// consumibles
[['cx_barra','Barra de Proteína','🍫','común','+30 PP al instante. Masticable y motivacional.'],
 ['cx_batido','Batido de la Fragua','🥤','común','+45 PP al instante. Sabe a hierro y a victoria.'],
 ['cx_tiza','Tiza de Gimnasta','🧂','común','Hoy tus repeticiones valen ×1,1.'],
 ['cx_cinta','Cinta de Racha','🎗️','común','Protege ayer u hoy como día de racha, igual que un Comodín.'],
 ['cx_vendas','Vendas del Gladiador','🩹','raro','Te entrega un Escudo de Rango, que bloquea la próxima penalización.'],
 ['cx_pergamino2','Pergamino del Estratega','📜','raro','Dos cambios de objetivo extra para hoy.'],
 ['cx_cantimplora','Cantimplora del Legionario','🫗','raro','+90 PP al instante.'],
 ['cx_dado2','Dado de Fortuna','🎲','raro','Vuelve a tirar las misiones de hoy que todavía no aceptas.'],
 ['cx_elixir2','Elixir de Titán','⚗️','épico','Hoy tus repeticiones valen ×2.'],
 ['cx_egida','Égida','🛡️','épico','Dos Escudos de Rango de una vez.'],
 ['cx_reloj','Reloj de Arena de Cronos','⏳','épico','Borra tus castigos activos. Si no tienes, te devuelve la última multa de la semana.'],
 ['cx_cuerno','Cuerno de Guerra','📯','épico','Hoy cada misión completada te da el doble de PP.'],
 ['cx_llave_oro','Llave de Oro','🔑','épico','Abre al instante un cofre épico.'],
 ['cx_tonico','Tónico de Hércules','🧪','legendario','+300 PP al instante.'],
 ['cx_fortuna','Pócima de Fortuna','🍀','legendario','Tu próximo cofre sube un nivel. Si ya es mítico, trae un objeto mítico extra.'],
 ['cx_estandarte','Estandarte de la Legión','🚩','legendario','Durante 3 días tus repeticiones valen ×1,5.'],
 ['cx_llave_cel','Llave Celestial','🗝️','legendario','Abre al instante un cofre legendario.'],
 ['cx_ambrosia','Ambrosía del Olimpo','🍯','mítico','Durante 3 días tus repeticiones valen ×2.'],
 ['cx_corazon','Corazón de Fénix','❤️‍🔥','mítico','Durante 7 días ninguna misión fallida te castiga.'],
 ['cx_llave_vacio','Llave del Vacío','🌌','mítico','Abre al instante un cofre mítico.']
].forEach(([id,name,icon,rarity,desc])=>chAdd({id,type:'item',name,icon,rarity,desc}));
// marcos
[['mk_laurel','Marco de Laurel','raro','Una corona de laurel alrededor de tu ícono, como un general en su triunfo.'],
 ['mk_hierro','Marco de Hierro Forjado','raro','Remaches y metal martillado. Sobrio, pesado, eterno.'],
 ['mk_bambu','Marco de Bambú','raro','Flexible pero irrompible, como tu disciplina.'],
 ['mk_llamas','Marco de Llamas','épico','Un anillo de fuego vivo que nunca se apaga.'],
 ['mk_escarcha','Marco de Escarcha','épico','Cristales de hielo del fin del mundo.'],
 ['mk_egeo','Marco del Egeo','épico','Olas que giran como el mar de los héroes griegos.'],
 ['mk_runico','Marco Rúnico','legendario','Runas nórdicas que giran lentamente alrededor de tu ícono.'],
 ['mk_coliseo','Marco del Coliseo','legendario','Los arcos del anfiteatro más famoso de Roma.'],
 ['mk_faraon','Marco del Faraón','legendario','Oro y lapislázuli bajo el disco solar alado.'],
 ['mk_prisma','Marco Prisma','mítico','Todos los colores girando a la vez.'],
 ['mk_eclipse','Marco del Eclipse','mítico','Una corona de luz alrededor de la oscuridad.']
].forEach(([id,name,rarity,desc])=>chAdd({id,type:'marco',name,icon:'🖼️',rarity,desc}));
// fondos
[['fd_arena','Arena del Coliseo','raro','Atardecer de arena caliente para toda la página.'],
 ['fd_bosque','Bosque de Araucarias','raro','Araucarias recortadas contra la cordillera.'],
 ['fd_dojo','Dojo de Madera','épico','Tablones oscuros y la luz cálida de los faroles.'],
 ['fd_fiordo','Fiordo del Norte','épico','Montañas nevadas que caen a un mar helado.'],
 ['fd_dunas','Dunas del Nilo','épico','Arena dorada, pirámides y un sol enorme.'],
 ['fd_templo','Templo al Atardecer','legendario','Columnas griegas contra un cielo encendido.'],
 ['fd_volcan','Volcán del Sur','legendario','Un volcán humeante y el brillo de la lava.'],
 ['fd_nebulosa','Nebulosa Prisma','mítico','Galaxias de colores y estrellas que titilan.'],
 ['fd_aurora','Aurora Austral','mítico','Cortinas de luz verde y violeta sobre la noche.']
].forEach(([id,name,rarity,desc])=>chAdd({id,type:'fondo',name,icon:'🏞️',rarity,desc}));
// auras (alrededor de tu emblema e ícono)
[['au_viento','Aura de Viento','raro','Corrientes de aire giran alrededor de tu emblema.','🌀'],
 ['au_ignea','Aura Ígnea','épico','Tu emblema arde con un brillo naranja.','🔥'],
 ['au_glacial','Aura Glacial','épico','Escarcha y luz azul alrededor de tu emblema.','❄️'],
 ['au_trueno','Aura de Trueno','legendario','Relámpagos que destellan de vez en cuando.','⚡'],
 ['au_sombra','Aura Sombría','legendario','Humo violeta que se arremolina, misterioso.','🌑'],
 ['au_prisma','Aura Prisma','mítico','Un halo arcoíris que gira sin parar.','🌈'],
 ['au_olimpo','Aura del Olimpo','mítico','Rayos dorados de luz divina detrás de tu emblema.','🌟']
].forEach(([id,name,rarity,desc,icon])=>chAdd({id,type:'aura',name,icon,rarity,desc}));
// efectos de pantalla
[['ef_chispas','Chispas','raro','Cada toque en la pantalla suelta chispas.','✨'],
 ['ef_petalos','Lluvia de Pétalos','épico','Pétalos de cerezo en cada toque y en cada premio.','🌸'],
 ['ef_confeti','Confeti de Campeón','legendario','Confeti en cada toque y una explosión en cada premio.','🎊'],
 ['ef_estrellas','Polvo de Estrellas','mítico','Estrellas doradas brotan de cada toque.','💫']
].forEach(([id,name,rarity,desc,icon])=>chAdd({id,type:'efecto',name,icon,rarity,desc}));
// lemas (descripción del perfil)
[['común','Una más. Siempre una más.'],['común','Hoy no se negocia.'],['común','El suelo ya me conoce.'],['común','Sudor hoy, orgullo mañana.'],
 ['raro','Veni, vidi, empujé.'],['raro','La disciplina le gana a la motivación.'],['raro','Lento, pero no me detengo.'],['raro','Mis excusas no levantan peso.'],
 ['épico','Forjado en repeticiones.'],['épico','Mis codos firmaron con sangre.'],['épico','Alea iacta est: hoy entreno.'],
 ['legendario','Que tiemble la gravedad.'],['legendario','Nacido en el suelo, criado en la barra.'],['legendario','Ad astra, una flexión a la vez.'],
 ['mítico','Soy la razón por la que el suelo madruga.'],['mítico','Memento mori, pero después de la última serie.']
].forEach(([rarity,name],i)=>chAdd({id:'lm_'+String(i+1).padStart(2,'0'),type:'lema',name,icon:'❝',rarity,desc:'Lema de perfil. Aparece bajo tu nombre y en tu inicio.'}));
// títulos exclusivos
[['tc_aprendiz','Aprendiz de Cofres','común'],['tc_recluta','Recluta Sudoroso','común'],
 ['tc_cazador','Cazador de Cofres','raro'],['tc_forja','Hijo de la Forja','raro'],['tc_gladiador','Gladiador de Living','raro'],
 ['tc_dragones','Domador de Dragones','épico'],['tc_centurion','Centurión del Suelo','épico'],['tc_cartago','Estratega de Cartago','épico'],
 ['tc_cesar','César de las Flexiones','legendario'],['tc_barra','Señor de la Barra','legendario'],['tc_conquistador','Conquistador del Suelo','legendario'],
 ['tc_emperador','Emperador de los Cofres','mítico'],['tc_semidios','Semidiós del Empuje','mítico']
].forEach(([id,name,rarity])=>chAdd({id,type:'titulo',name,icon:'🏷️',rarity,desc:'Título equipable, exclusivo de cofres.'}));
// íconos de perfil
[['ic_lobo','Lobo Gris','🐺','común'],['ic_zorro','Zorro Culpeo','🦊','común'],['ic_jabali','Jabalí','🐗','común'],
 ['ic_condor','Cóndor de los Andes','🦅','raro'],['ic_toro','Toro de Creta','🐂','raro'],['ic_buho','Búho de Atenea','🦉','raro'],
 ['ic_leon','León de Nemea','🦁','épico'],['ic_oso','Oso Pardo','🐻','épico'],['ic_escorpion','Escorpión del Desierto','🦂','épico'],
 ['ic_dragon','Dragón Dorado','🐉','legendario'],['ic_elefante','Elefante de Guerra','🐘','legendario'],
 ['ic_sol','Sol Invicto','☀️','mítico'],['ic_cometa','Cometa','☄️','mítico']
].forEach(([id,name,icon,rarity])=>chAdd({id,type:'icono',name,icon,rarity,desc:'Ícono de perfil. Úsalo como tu imagen en la ventana Perfil.'}));
// insignias exclusivas
[['bg_polvo','Polvo de Cofre','✨','común','Lo primero que sale de cualquier cofre.'],
 ['bg_llave','Guardián de Llaves','🗝️','raro','Para quien colecciona llaves como trofeos.'],
 ['bg_espada','Espada Rota','🗡️','raro','Recuerdo de un combate que no te venció.'],
 ['bg_gema','Gema Pulida','💎','épico','Presión, tiempo y constancia: así se hacen las gemas.'],
 ['bg_corona','Corona del Saqueador','👑','legendario','Vaciaste cofres como un rey vacía tesoros.'],
 ['bg_ojo','Ojo del Vacío','🌀','mítico','Miraste dentro de un cofre mítico y el cofre te miró a ti.']
].forEach(([id,name,icon,rarity,desc])=>chAdd({id,type:'insignia',name,icon,rarity,desc}));

/* ---------- 50 compañeros animados ---------- */
const ORIGINS=[['roma','Roma antigua'],['grecia','Grecia y Macedonia'],['mitogriega','Mitología griega'],['egipto','Egipto'],['cartago','Cartago'],['europa','Pueblos de Europa'],['estepa','Estepas de Asia'],['japon','Japón feudal'],['china','China'],['america','América originaria'],['medieval','Europa medieval y moderna'],['bestiario','Bestiario mítico'],['liga','Originales de la Liga']];
const ORIGIN_NAME=Object.fromEntries(ORIGINS);
const SK={l:'#f1c9a5',lw:'#f4d8bc',m:'#e0ac7e',mt:'#d9a477',t:'#c48a5a',b:'#a86b42',e:'#b07a4a'};
const PETS=[
 // ---- raros (salen en cualquier parte)
 {id:'pet_recluta',name:'Recluta de la Liga',rarity:'raro',origin:'liga',act:'pushup',icon:'💪',look:{sk:SK.m,hair:['short','#2b1d14'],hd:['headband','#ff5a5f'],tu:'#3a7bd5',ar:['tank'],pa:'#2a2f45',bo:'#e8e8e8'},desc:'El primer compañero de todo jugador. Hace flexiones en cualquier rincón de tu pantalla.',feats:['Nunca se salta el calentamiento','Cuenta las repeticiones en voz alta','Se sabe tu racha de memoria']},
 {id:'pet_pesista',name:'Pesista de Barrio',rarity:'raro',origin:'liga',act:'lift',icon:'🏋️',look:{sk:SK.t,hair:['short','#111111'],beard:['stache','#111111'],tu:'#d95926',ar:['tank'],pa:'#333a55',bo:'#222222',it:'dumbbell',it2:'dumbbell'},desc:'Entrena en la plaza con mancuernas oxidadas y una fe inquebrantable.',feats:['Récord del barrio en press militar','Presta las pesas a quien las necesite']},
 {id:'pet_kaito',name:'Kaito, Puño del Alba',rarity:'raro',origin:'liga',act:'punch',icon:'👊',look:{sk:SK.l,hair:['short','#1b1b2a'],hd:['headband','#f4f4f4'],tu:'#2f6b4f',ar:['gi','#f4f4f4'],belt:'#f4f4f4',pa:'#2f6b4f',bo:'#1a1a1a',it:'wraps',it2:'wraps'},desc:'Personaje original de la liga. Entrena desde que sale el sol y jura que su puño se calienta con cada serie.',feats:['Mil golpes antes del desayuno','Le ganó a su propia flojera en un duelo a tres asaltos']},
 {id:'pet_rin',name:'Rin, Filo del Viento',rarity:'raro',origin:'liga',act:'swing',icon:'🍃',look:{sk:SK.l,hair:['bob','#3fb7a8'],tu:'#1f2f57',ar:['haori','#f2f2f2'],pa:'#1f2f57',bo:'#222222',it:'katana'},desc:'Personaje original de la liga. Espadachina errante que corta las hojas que caen sin tocar el árbol.',feats:['Corta el viento en tres direcciones','Nunca desenvaina dos veces para lo mismo']},
 {id:'pet_sora',name:'Sora, Arquero Celeste',rarity:'raro',origin:'liga',act:'bow',icon:'🏹',look:{sk:SK.l,hair:['pony','#d7dbe6'],tu:'#6aa7e8',cape:'#2b4f8a',ar:['leather','#8a5a2b'],pa:'#2b3550',bo:'#5a3a22',it:'bow'},desc:'Personaje original de la liga. Dicen que apunta a las nubes y le acierta a las estrellas.',feats:['La flecha más lejana del torneo celeste','Le acierta a una moneda a cien pasos']},
 {id:'pet_shaolin',name:'Monje Shaolin',rarity:'raro',origin:'china',act:'spin',icon:'🥋',look:{sk:SK.m,hair:['bald'],tu:'#e8892b',ar:['robe','#c0392b'],pa:'#e8892b',bo:'#3a2a1a',it:'staff'},desc:'Guardián de un templo de montaña donde el kung-fu se entrena desde hace siglos.',feats:['El templo Shaolin fue fundado hacia el año 495','Su entrenamiento une meditación y artes marciales','El bastón es una de sus armas clásicas']},
 {id:'pet_chasqui',name:'Chasqui del Tahuantinsuyo',rarity:'raro',origin:'america',act:'run',icon:'🏃',look:{sk:SK.b,hair:['short','#111111'],hd:['plume','#f4f4f4','#c0392b'],tu:'#c0392b',ar:['unku','#c0392b','#f0c24a'],pa:SK.b,bo:'#7a4e2e'},desc:'Mensajero del Imperio inca que corría en relevos por el Qhapaq Ñan, la red de caminos andinos.',feats:['Con relevos, un mensaje podía avanzar más de 200 km en un día','Llevaba quipus, cuerdas con nudos que guardaban información','Anunciaba su llegada con una trompeta de caracola, el pututu']},
 {id:'pet_sumo',name:'Luchador de Sumo',rarity:'raro',origin:'japon',act:'stomp',icon:'🤼',look:{sk:'#e8b48a',hair:['topknot','#111111'],tu:'#e8b48a',ar:['bare'],bulk:1,skirt:['mawashi','#2c3e7a'],pa:'#e8b48a',bo:'#e8b48a'},desc:'Lucha ritual japonesa sobre un círculo de arcilla llamado dohyō.',feats:['Tiene raíces en antiguos rituales sintoístas','Gana quien saca al rival del círculo o le hace tocar el suelo','El rango máximo es yokozuna']},
 // ---- épicos (salen en cualquier parte)
 {id:'pet_centurion',name:'Centurión',rarity:'épico',origin:'roma',act:'salute',icon:'🦅',look:{sk:SK.mt,hair:['short','#2b1d14'],hd:['galea_t','#c9ced6','#c0392b'],tu:'#b0302a',ar:['chain','#aab2bd'],skirt:['pteruges','#7a3b1f'],pa:SK.mt,bo:'#6b4423',cape:'#a52a2a',it:'vitis',acc:['phalerae']},desc:'Oficial romano que mandaba una centuria, unos 80 legionarios.',feats:['Llevaba una vara de vid, la vitis, como símbolo de mando','El más veterano, el primus pilus, dirigía la primera cohorte','Era la columna vertebral de la disciplina romana']},
 {id:'pet_hoplita',name:'Hoplita Espartano',rarity:'épico',origin:'grecia',act:'thrust',icon:'🛡️',look:{sk:SK.mt,hd:['corinthian','#c58b3a','#1a1a1a'],tu:'#a52a2a',ar:['musc','#c58b3a'],skirt:['pteruges','#e9dcc0'],pa:SK.mt,bo:'#6b4423',it:'spear',sh:['aspis','#c58b3a','#7a4a14']},desc:'Soldado de infantería pesada que combatía en falange.',feats:['Los espartanos entrenaban desde los 7 años en la agogé','Su escudo protegía también al compañero de al lado','«Vuelve con tu escudo o sobre él»']},
 {id:'pet_murmillo',name:'Gladiador Murmillo',rarity:'épico',origin:'roma',act:'swing',icon:'🐟',look:{sk:SK.t,hd:['fish','#b9c0c8','#c0392b'],tu:SK.t,ar:['bare'],skirt:['kilt','#e9dcc0'],belt:'#c9a24a',pa:SK.t,bo:'#6b4423',it:'gladius',sh:['scutum','#c0392b','#e8c45a'],acc:['manica']},desc:'Gladiador de armamento pesado con un casco de cresta en forma de pez.',feats:['Solía enfrentarse al tracio o al hoplomachus','Usaba escudo grande y espada corta, como un legionario','Los gladiadores famosos tenían fans y grafitis en Pompeya']},
 {id:'pet_samurai',name:'Samurái',rarity:'épico',origin:'japon',act:'swing',icon:'⛩️',look:{sk:SK.l,hd:['kabuto','#2a2f45','#e8c45a'],tu:'#2a3f8f',ar:['lamellar','#2a3f8f'],skirt:['kilt','#1f2a5c'],pa:'#1f2a5c',bo:'#2a2a2a',it:'katana'},desc:'Guerrero de la clase militar del Japón feudal.',feats:['Seguía un código de honor llamado bushidō','La katana era considerada el alma del samurái','Dominaba también el arco a caballo']},
 {id:'pet_vikingo',name:'Vikingo',rarity:'épico',origin:'europa',act:'swing',icon:'🪓',look:{sk:SK.l,hair:['long','#d9a441'],beard:['full','#d9a441'],hd:['nasal','#9aa3ad'],tu:'#4a6b3a',ar:['leather','#6b4b2a'],pa:'#5a4a3a',bo:'#4a3020',it:'axe',sh:['round','#c0392b','#e8e2d0']},desc:'Navegante y guerrero escandinavo de los siglos VIII al XI.',feats:['Llegaron a Norteamérica cerca del año 1000','Sus barcos navegaban en mar abierto y por ríos','Fundaron asentamientos desde Islandia hasta Kiev']},
 {id:'pet_ninja',name:'Ninja',rarity:'épico',origin:'japon',act:'throw',icon:'🥷',look:{sk:SK.l,hd:['ninja','#1c1f2b'],tu:'#1c1f2b',ar:['robe','#2b3040'],pa:'#1c1f2b',bo:'#111111',it:'shuriken'},desc:'Espía y agente del Japón feudal, experto en sigilo.',feats:['Las escuelas más famosas eran las de Iga y Kōga','Trabajaba en espionaje, sabotaje e infiltración','Usaba shuriken, garfios y mucha paciencia']},
 {id:'pet_caballero',name:'Caballero Medieval',rarity:'épico',origin:'medieval',act:'swing',icon:'⚔️',look:{sk:SK.l,hd:['helm_full','#b9c0c8','#c0392b'],tu:'#b9c0c8',ar:['plate','#b9c0c8'],pa:'#9aa3ad',bo:'#7a828c',it:'longsword',sh:['kite','#1f4fa8','#e8c45a']},desc:'Guerrero montado de la Europa medieval, cubierto de acero.',feats:['Una armadura completa pesaba entre 20 y 25 kg','Se formaba desde niño como paje y luego escudero','Las justas eran su deporte de competencia']},
 {id:'pet_weichafe',name:'Weichafe Mapuche',rarity:'épico',origin:'america',act:'thrust',icon:'🌿',look:{sk:SK.b,hair:['long','#111111'],hd:['trarilonco','#c0392b'],tu:'#2c2c2c',ar:['poncho','#2c2c2c','#c0392b'],pa:SK.b,bo:SK.b,it:'lance'},desc:'Guerrero mapuche. Weichafe significa «el que lucha» en mapudungun.',feats:['El pueblo mapuche resistió primero a los incas y luego a los españoles','Combatía con largas lanzas de colihue','La frontera del Biobío se reconoció en parlamentos con la Corona']},
 {id:'pet_jaguar',name:'Guerrero Jaguar',rarity:'épico',origin:'america',act:'swing',icon:'🐆',look:{sk:SK.b,hd:['jaguar','#e3a63a','#3a2a10'],tu:'#e3a63a',ar:['jaguarsuit','#e3a63a','#3a2a10'],pa:'#e3a63a',bo:SK.b,it:'macuahuitl',sh:['chimalli','#2a7bd5','#e8c45a']},desc:'Guerrero de élite del ejército mexica.',feats:['Ascendía capturando prisioneros en batalla','Usaba el macuahuitl, un mazo con filos de obsidiana','Era una de las dos grandes órdenes de élite, junto a los guerreros águila']},
 {id:'pet_marea',name:'Capitana Marea',rarity:'épico',origin:'liga',act:'swing',icon:'🏴‍☠️',look:{sk:SK.l,hair:['long','#1f6f78'],hd:['tricorn','#2a1f1a','#e2b54a'],tu:'#9b2335',ar:['coat','#9b2335','#efe2bf'],pa:'#2a2f45',bo:'#1a1a1a',it:'cutlass',acc:['sash']},desc:'Personaje original de la liga. Capitana que navega buscando la isla donde no existe la gravedad, y mientras tanto entrena en cubierta.',feats:['Le ganó un duelo a una tormenta de tres días','Su tripulación hace flexiones al amanecer, sin excepción']},
 {id:'pet_kraken',name:'Kraken de Bolsillo',rarity:'épico',origin:'bestiario',act:'wave',cr:'kraken',icon:'🐙',look:{c1:'#8e5bd6',c2:'#f2b4ff'},desc:'El monstruo marino de las leyendas escandinavas, en versión miniatura y amistosa.',feats:['Las leyendas lo describían tan grande como una isla','Inspiró historias de marinos durante siglos','Esta versión solo hunde la flojera']},
 {id:'pet_minotauro',name:'Minotauro Gimnasta',rarity:'épico',origin:'bestiario',act:'lift',icon:'🐂',look:{head:'bull',hcol:'#6b4423',sk:'#b07a4a',ar:['bare'],tu:'#b07a4a',bulk:1,skirt:['kilt','#c0392b'],pa:'#b07a4a',bo:'#4a3020',it:'dumbbell',it2:'dumbbell'},desc:'La criatura con cabeza de toro del laberinto de Creta, ahora dedicada al press de hombros.',feats:['Según el mito, vivía en el laberinto de Dédalo','Teseo lo venció con ayuda del hilo de Ariadna','Hoy solo persigue récords personales']},
 // ---- legendarios (solo cofres)
 {id:'pet_legionario',name:'Legionario Romano',rarity:'legendario',origin:'roma',act:'swing',icon:'🏛️',look:{sk:SK.mt,hair:['short','#2b1d14'],hd:['galea','#c9ced6','#c0392b'],tu:'#b0302a',ar:['seg','#c9ced6'],skirt:['pteruges','#7a3b1f'],pa:SK.mt,bo:'#6b4423',it:'gladius',sh:['scutum','#b0302a','#e8c45a']},desc:'Soldado de infantería pesada de Roma. Entrena con su espada sin descanso.',feats:['Marchaba unos 30 km al día con todo su equipo','Levantaba un campamento fortificado cada noche','Su formación testudo lo cubría como una tortuga']},
 {id:'pet_marcoaurelio',name:'Marco Aurelio',rarity:'legendario',origin:'roma',act:'read',icon:'📜',look:{sk:'#e0b48a',hair:['curly','#5a3a22'],beard:['full','#5a3a22'],hd:['laurel','#5f9a3a'],tu:'#ece3cf',ar:['toga','#ece3cf','#6a2c8a'],pa:'#e0b48a',bo:'#6b4423',it:'scroll'},desc:'Emperador romano (121–180) y filósofo estoico.',feats:['Escribió las «Meditaciones», que se siguen leyendo hoy','Fue el último de los llamados Cinco Buenos Emperadores','Defendió la frontera del Danubio en las guerras marcomanas']},
 {id:'pet_agripa',name:'Marco Vipsanio Agripa',rarity:'legendario',origin:'roma',act:'swing',icon:'⚓',look:{sk:SK.mt,hair:['short','#3a2a1a'],hd:['rostrata','#e8c45a'],tu:'#2a4f8a',ar:['musc','#c9a24a'],skirt:['pteruges','#2a4f8a'],pa:SK.mt,bo:'#6b4423',cape:'#1f3a6b',it:'gladius'},desc:'General, almirante y mano derecha de Augusto (c. 63–12 a. C.).',feats:['Ganó la batalla naval de Actium (31 a. C.)','Construyó el primer Panteón de Roma','Amplió los acueductos y abrió grandes termas públicas']},
 {id:'pet_espartaco',name:'Espartaco',rarity:'legendario',origin:'roma',act:'swing',icon:'⛓️',look:{sk:SK.t,hd:['thraex','#9aa3ad','#c0392b'],tu:SK.t,ar:['bare'],skirt:['kilt','#e9dcc0'],belt:'#6b4423',pa:SK.t,bo:'#6b4423',it:'sica',sh:['parmula','#8a5a2b','#c9a24a'],acc:['chains']},desc:'Gladiador tracio que desafió a Roma (c. 103–71 a. C.).',feats:['Encabezó la mayor rebelión de esclavos contra Roma (73–71 a. C.)','Su ejército llegó a reunir a decenas de miles de personas','Derrotó a varias legiones antes de caer ante Craso']},
 {id:'pet_escipion',name:'Escipión el Africano',rarity:'legendario',origin:'roma',act:'salute',icon:'🐘',look:{sk:SK.mt,hair:['short','#3a2a1a'],hd:['galea','#e0c27a','#f4f4f4'],tu:'#7a1f2a',ar:['musc','#d4b06a'],skirt:['pteruges','#7a1f2a'],pa:SK.mt,bo:'#6b4423',cape:'#7a1f2a',it:'gladius',sh:['scutum','#7a1f2a','#e8c45a']},desc:'General romano (236–183 a. C.), el hombre que venció a Aníbal.',feats:['Derrotó a Aníbal en Zama (202 a. C.)','Puso fin a la Segunda Guerra Púnica','Tomó Cartago Nova, en Hispania, con un ataque audaz']},
 {id:'pet_vercingetorix',name:'Vercingétorix',rarity:'legendario',origin:'europa',act:'swing',icon:'🗡️',look:{sk:SK.l,hair:['long','#d9a441'],beard:['stache','#d9a441'],hd:['winged','#c58b3a','#f4f4f4'],tu:'#2f6b3a',ar:['chain','#9aa3ad'],pa:'#8a3a2a',bo:'#4a3020',cape:'#2f6b3a',it:'longsword',sh:['oval','#2f6b3a','#c9a24a'],acc:['torc']},desc:'Caudillo de los arvernos que unió a la Galia contra César (c. 82–46 a. C.).',feats:['Unió por primera vez a decenas de tribus galas','Venció a César en Gergovia (52 a. C.)','Resistió el asedio de Alesia hasta el final']},
 {id:'pet_boudica',name:'Boudica',rarity:'legendario',origin:'europa',act:'thrust',icon:'🔥',look:{sk:'#f4d0b0',hair:['long','#c8471f'],tu:'#2f6b3a',ar:['dress','#2f6b3a','#c9a24a'],skirt:['long','#2f6b3a'],cape:'#8a3a2a',pa:'#f4d0b0',bo:'#4a3020',it:'spear',sh:['oval','#8a3a2a','#c9a24a'],acc:['torc']},desc:'Reina de los icenos de Britania (m. c. 61 d. C.).',feats:['Lideró una gran revuelta contra Roma','Arrasó Camulodunum, Londinium y Verulamium','Tiene una estatua junto al puente de Westminster']},
 {id:'pet_ramses',name:'Ramsés II',rarity:'legendario',origin:'egipto',act:'swing',icon:'𓂀',look:{sk:SK.e,hd:['khepresh','#2346a8','#e8c45a'],tu:'#f4ecd8',ar:['linen','#f4ecd8','#e8c45a'],skirt:['kilt','#f4ecd8'],belt:'#e8c45a',pa:SK.e,bo:'#c9a24a',it:'khopesh',acc:['collar']},desc:'Faraón de Egipto (c. 1303–1213 a. C.), llamado Ramsés el Grande.',feats:['Reinó cerca de 66 años','Mandó construir los templos de Abu Simbel','Firmó con los hititas uno de los primeros tratados de paz conocidos']},
 {id:'pet_atila',name:'Atila',rarity:'legendario',origin:'estepa',act:'bow',icon:'🐎',look:{sk:SK.mt,hd:['furhat','#6b4423','#c9a27a'],beard:['fu','#1a1a1a'],tu:'#7a2f1f',ar:['lamellar','#8a6a3a'],pa:'#5a3a2a',bo:'#3a2a1a',it:'recurve'},desc:'Rey de los hunos (c. 406–453), llamado «el azote de Dios».',feats:['Gobernó un imperio desde el Rin hasta el mar Negro','Puso en jaque a Roma de Oriente y de Occidente','Sus arqueros a caballo eran temidos en toda Europa']},
 {id:'pet_musashi',name:'Miyamoto Musashi',rarity:'legendario',origin:'japon',act:'swing',icon:'⚔️',look:{sk:SK.l,hair:['topknot','#1a1a1a'],beard:['short','#1a1a1a'],tu:'#5a5f6a',ar:['kimono','#2a2a2a'],skirt:['hakama','#3a3f4a'],pa:'#3a3f4a',bo:'#2a2a2a',it:'katana',it2:'wakizashi'},desc:'Espadachín japonés (c. 1584–1645), maestro de las dos espadas.',feats:['Dijo no haber perdido ninguno de sus más de 60 duelos','Fundó el estilo de dos espadas Niten Ichi-ryū','Escribió «El libro de los cinco anillos»']},
 {id:'pet_nobunaga',name:'Oda Nobunaga',rarity:'legendario',origin:'japon',act:'aim',icon:'🏯',look:{sk:SK.l,hd:['kabuto','#1a1a1a','#e8c45a'],tu:'#7a1f1f',ar:['lamellar','#1a1a1a','#c0392b'],cape:'#7a1f1f',skirt:['kilt','#2a2a2a'],pa:'#2a2a2a',bo:'#1a1a1a',it:'musket'},desc:'Daimio japonés (1534–1582) que inició la unificación de Japón.',feats:['Venció a un ejército mucho mayor en Okehazama (1560)','Usó arcabuces de forma masiva en Nagashino (1575)','Abrió el camino a la unificación del país']},
 {id:'pet_tomoe',name:'Tomoe Gozen',rarity:'legendario',origin:'japon',act:'thrust',icon:'🌸',look:{sk:SK.lw,hair:['long','#111111'],hd:['headband','#f4f4f4'],tu:'#a52a2a',ar:['lamellar','#a52a2a','#f4f4f4'],skirt:['hakama','#2a2f45'],pa:'#2a2f45',bo:'#2a2a2a',it:'naginata'},desc:'Guerrera onna-musha del siglo XII, en las guerras Genpei.',feats:['El «Cantar de Heike» la describe como arquera y jinete formidable','Según el relato, valía por mil guerreros','Es símbolo de las mujeres samurái']},
 {id:'pet_ragnar',name:'Ragnar Lodbrok',rarity:'legendario',origin:'europa',act:'swing',icon:'⛵',look:{sk:SK.l,hair:['braid','#c9a061'],beard:['long','#c9a061'],tu:'#3a3f4a',ar:['leather','#5a4030'],cape:'#6b5a46',pa:'#4a3a2a',bo:'#3a2a1a',it:'axe',sh:['round','#2a4f8a','#e8e2d0']},desc:'Héroe vikingo de las sagas nórdicas del siglo IX.',feats:['Las sagas le atribuyen incursiones en Francia e Inglaterra','Es el padre legendario de grandes caudillos vikingos','Su historia mezcla hechos y leyenda']},
 {id:'pet_juana',name:'Juana de Arco',rarity:'legendario',origin:'medieval',act:'banner',icon:'⚜️',look:{sk:SK.lw,hair:['bob','#5a3a22'],tu:'#c9ced6',ar:['plate','#c9ced6'],pa:'#9aa3ad',bo:'#7a828c',it:'banner'},desc:'Heroína francesa (c. 1412–1431) de la Guerra de los Cien Años.',feats:['Con 17 años ayudó a levantar el asedio de Orleans (1429)','Llevó a Carlos VII a coronarse en Reims','Es patrona de Francia']},
 {id:'pet_pachacutec',name:'Pachacútec',rarity:'legendario',origin:'america',act:'swing',icon:'☀️',look:{sk:SK.b,hair:['short','#111111'],hd:['mascapaycha','#c0392b','#e8c45a'],tu:'#c0392b',ar:['unku','#c0392b','#e8c45a'],pa:SK.b,bo:SK.b,cape:'#2346a8',it:'macestar',acc:['earspool']},desc:'Sapa Inca del siglo XV que transformó el reino del Cusco en un imperio.',feats:['Convirtió el reino del Cusco en el Tahuantinsuyo','Se le atribuye la construcción de Machu Picchu','Reorganizó el imperio y su red de caminos']},
 {id:'pet_aquiles',name:'Aquiles',rarity:'legendario',origin:'mitogriega',act:'thrust',icon:'🏺',look:{sk:'#e0b48a',hair:['curly','#c9a061'],hd:['corinthian','#e8c45a','#1a1a1a'],tu:'#f4ecd8',ar:['musc','#e8c45a'],skirt:['pteruges','#f4ecd8'],pa:'#e0b48a',bo:'#6b4423',it:'spear',sh:['aspis','#e8c45a','#9a6a1a']},desc:'El mayor guerrero aqueo de la guerra de Troya.',feats:['Es el protagonista de la «Ilíada» de Homero','Venció a Héctor frente a las murallas de Troya','Era casi invulnerable, salvo por el talón']},
 {id:'pet_heracles',name:'Heracles',rarity:'legendario',origin:'mitogriega',act:'flex',icon:'🦁',look:{sk:SK.mt,beard:['full','#3a2a1a'],hd:['lion','#d9a441','#8a5a1a'],tu:SK.mt,ar:['bare'],bulk:1,skirt:['kilt','#d9a441'],pa:SK.mt,bo:'#6b4423',it:'club'},desc:'Semidiós hijo de Zeus, el más fuerte de los héroes griegos.',feats:['Completó los doce trabajos','Venció al león de Nemea y a la Hidra de Lerna','Sostuvo el cielo en lugar de Atlas']},
 {id:'pet_dragon',name:'Dragón de Bolsillo',rarity:'legendario',origin:'bestiario',act:'fire',cr:'dragon',icon:'🐉',look:{c1:'#2f9e6a',c2:'#f2d36b'},desc:'Un dragón en miniatura que vigila tu inventario como si fuera su tesoro.',feats:['Los dragones aparecen en mitos desde China hasta Europa','En China simbolizan fuerza y buena fortuna','Este escupe fuego cada vez que rompes un récord']},
 {id:'pet_kitsune',name:'Kitsune de Nueve Colas',rarity:'legendario',origin:'bestiario',act:'orbs',cr:'kitsune',icon:'🦊',look:{c1:'#f6f3ee',c2:'#e8592a'},desc:'El zorro espíritu del folclor japonés.',feats:['Según la leyenda, gana una cola cada cien años','Con nueve colas alcanza su máximo poder','Domina las ilusiones y el fuego zorro, el kitsunebi']},
 {id:'pet_akane',name:'Akane, Llama Carmesí',rarity:'legendario',origin:'liga',act:'punch',icon:'🔥',look:{sk:SK.l,hair:['pony','#a8262a'],tu:'#1c1f2b',ar:['gi','#a8262a'],belt:'#c0392b',pa:'#1c1f2b',bo:'#111111',it:'firefist',it2:'firefist'},desc:'Personaje original de la liga. Peleadora que convierte cada serie en fuego: sus puños arden cuando supera un récord.',feats:['Invicta en el torneo de la Fragua','Su racha más larga duró un año entero']},
 // ---- míticos (solo cofres)
 {id:'pet_cesar',name:'Julio César',rarity:'mítico',origin:'roma',act:'salute',icon:'👑',look:{sk:'#e0b48a',hair:['short','#3a2a1a'],hd:['laurel','#e8c45a'],tu:'#b0302a',ar:['musc','#d4b06a'],skirt:['pteruges','#b0302a'],pa:'#e0b48a',bo:'#6b4423',cape:'#8a1a2a',it:'gladius'},desc:'General y dictador romano (100–44 a. C.).',feats:['Conquistó la Galia y venció en Alesia (52 a. C.)','Cruzó el Rubicón en el 49 a. C.: «Alea iacta est»','Su calendario juliano es la base del que usamos hoy','Dijo «Veni, vidi, vici» tras su victoria en Zela']},
 {id:'pet_alejandro',name:'Alejandro Magno',rarity:'mítico',origin:'grecia',act:'thrust',icon:'🐴',look:{sk:SK.l,hair:['curly','#e8b84e'],hd:['boeotian','#9c6a22','#f4f4f4'],tu:'#f4ecd8',ar:['linen','#f4ecd8','#e8c45a'],skirt:['pteruges','#f4ecd8'],pa:SK.l,bo:'#6b4423',cape:'#6a2c8a',it:'spear'},desc:'Rey de Macedonia (356–323 a. C.).',feats:['No perdió ninguna de sus grandes batallas','Derrotó al Imperio persa en Gránico, Isos y Gaugamela','Fundó más de 20 ciudades, entre ellas Alejandría','Llegó hasta la India antes de cumplir 30 años']},
 {id:'pet_napoleon',name:'Napoleón Bonaparte',rarity:'mítico',origin:'medieval',act:'point',icon:'🎖️',look:{sk:SK.lw,hair:['short','#3a2a1a'],hd:['bicorne','#1a1a1a','#e8c45a'],tu:'#1f3a8a',ar:['coat','#1f3a8a','#f4f4f4'],pa:'#f4f4f4',bo:'#111111',it:'spyglass',acc:['epaul']},desc:'Emperador de los franceses (1769–1821).',feats:['Su gran victoria fue Austerlitz (1805)','Su Código Civil inspiró leyes en muchos países, también el Código Civil chileno','Llegó a dominar gran parte de Europa']},
 {id:'pet_augusto',name:'Octavio Augusto',rarity:'mítico',origin:'roma',act:'salute',icon:'🏺',look:{sk:SK.l,hair:['short','#5a3a22'],hd:['laurel','#5f9a3a'],tu:'#ece3cf',ar:['toga','#ece3cf','#6a2c8a'],pa:SK.l,bo:'#6b4423'},desc:'Primer emperador de Roma (63 a. C.–14 d. C.).',feats:['Venció a Marco Antonio y Cleopatra en Actium (31 a. C.)','Inició la Pax Romana, cerca de dos siglos de relativa paz','Gobernó como emperador más de 40 años','«Encontré una Roma de ladrillo y la dejé de mármol»']},
 {id:'pet_anibal',name:'Aníbal Barca',rarity:'mítico',origin:'cartago',act:'thrust',icon:'🐘',look:{sk:SK.t,beard:['full','#1a1a1a'],hd:['pilos','#c58b3a','#c0392b'],tu:'#6a2c8a',ar:['linen','#e9dcc0','#c9a24a'],skirt:['pteruges','#6a2c8a'],pa:SK.t,bo:'#6b4423',cape:'#6a2c8a',it:'spear',extra:'elephant'},desc:'General cartaginés (247–c. 183 a. C.), la pesadilla de Roma.',feats:['Cruzó los Alpes con elefantes de guerra (218 a. C.)','Aniquiló a un ejército romano mucho mayor en Cannas (216 a. C.)','Su táctica de Cannas se estudia hasta hoy']},
 {id:'pet_leonidas',name:'Leónidas I',rarity:'mítico',origin:'grecia',act:'thrust',icon:'🛡️',look:{sk:SK.mt,beard:['full','#2b1d14'],hd:['corinthian','#c58b3a','#b0302a'],tu:'#a52a2a',ar:['musc','#c58b3a'],skirt:['pteruges','#a52a2a'],pa:SK.mt,bo:'#6b4423',cape:'#a52a2a',it:'spear',sh:['aspis','#c58b3a','#7a1f14'],lambda:1},desc:'Rey de Esparta, caído en las Termópilas (480 a. C.).',feats:['Con 300 espartanos y aliados griegos frenó al ejército persa','Resistió tres días en el paso de las Termópilas','Su sacrificio inspiró a toda Grecia']},
 {id:'pet_cleopatra',name:'Cleopatra VII',rarity:'mítico',origin:'egipto',act:'salute',icon:'🐍',look:{sk:'#c99067',hair:['bob','#111111'],hd:['diadem','#e8c45a'],tu:'#f4ecd8',ar:['dress','#f4ecd8','#e8c45a'],skirt:['long','#f4ecd8'],pa:'#c99067',bo:'#c9a24a',it:'ankh',acc:['collar']},desc:'Última reina del Egipto ptolemaico (69–30 a. C.).',feats:['Gobernó Egipto cerca de 21 años','Fue la primera de su dinastía en aprender egipcio y hablaba varios idiomas','Se alió con Julio César y con Marco Antonio']},
 {id:'pet_gengis',name:'Gengis Kan',rarity:'mítico',origin:'estepa',act:'bow',icon:'🏹',look:{sk:SK.mt,beard:['fu','#1a1a1a'],hd:['furcone','#2346a8','#8a6a3a'],tu:'#2346a8',ar:['deel','#2346a8','#e8a33a'],pa:'#3a2a1a',bo:'#5a3a22',it:'recurve'},desc:'Fundador del Imperio mongol (c. 1162–1227).',feats:['Unificó a las tribus mongolas en 1206','Su imperio llegó a ser el mayor imperio terrestre continuo de la historia','Creó el yam, un sistema de postas a caballo']},
 {id:'pet_lautaro',name:'Lautaro',rarity:'mítico',origin:'america',act:'thrust',icon:'🌄',look:{sk:SK.b,hair:['long','#111111'],hd:['trarilonco','#c0392b'],tu:'#1c1c1c',ar:['poncho','#1c1c1c','#c0392b'],pa:SK.b,bo:SK.b,cape:'#3a2a1a',it:'lance'},desc:'Toqui mapuche (c. 1534–1557), héroe de la Guerra de Arauco.',feats:['Venció a Pedro de Valdivia en la batalla de Tucapel (1553)','Aprendió las tácticas españolas y las usó en su contra','Es símbolo de la resistencia mapuche']},
 {id:'pet_fenix',name:'Fénix',rarity:'mítico',origin:'bestiario',act:'flare',cr:'phoenix',icon:'🐦‍🔥',look:{c1:'#ff6a2a',c2:'#ffd35a'},desc:'El ave mítica que renace de sus propias cenizas.',feats:['Heródoto ya la describía en el siglo V a. C.','Según la tradición, renace cada 500 años','Es símbolo de renacimiento desde Egipto hasta Roma']}
];
for(const p of PETS){p.type='companero';if(p.rarity==='legendario'||p.rarity==='mítico'){p.only=true;p.chest=true}}
const PET_BY=Object.fromEntries(PETS.map(p=>[p.id,p]));
CATALOG.push(...CH_CATALOG,...PETS);
if(!IS_WEB)for(const c of CH_CATALOG.concat(PETS))CAT_BY_ID[c.id]=c;
const CH_DROPS=CH_CATALOG.filter(c=>!c.noDrop).concat(PETS);

/* ================= motor de sprites (estilo anime chibi) ================= */
function shd(hex,f){if(!hex||hex[0]!=='#'||hex.length!==7)return hex;const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;const t=f<0?0:255,p=Math.abs(f);r=Math.round((t-r)*p+r);g=Math.round((t-g)*p+g);b=Math.round((t-b)*p+b);return'#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)}
const STEEL='#dde2e8',GOLD='#e2b54a',WOOD='#8a5a2b';
const REST_ROT={spear:25,lance:25,naginata:25,banner:30,musket:25,longsword:16,katana:16,macestar:12,macuahuitl:12};
function itemArt(k){switch(k){
 case'gladius':return`<path d="M-.95-1.3V-9.6L0-11.4l.95 1.8V-1.3Z" fill="${STEEL}"/><path d="M0-10.4V-1.6" stroke="#aab2bd" stroke-width=".35"/><rect x="-2.3" y="-1.7" width="4.6" height="1.15" rx=".5" fill="${GOLD}"/><rect x="-.6" y="-.6" width="1.2" height="2.2" fill="#6b4423"/><circle cy="1.9" r=".85" fill="${GOLD}"/>`;
 case'longsword':return`<path d="M-.85-1.4V-13.4L0-15.4l.85 2V-1.4Z" fill="${STEEL}"/><path d="M0-14V-1.6" stroke="#aab2bd" stroke-width=".3"/><rect x="-2.8" y="-1.8" width="5.6" height="1.1" rx=".5" fill="#8a8f96"/><rect x="-.6" y="-.7" width="1.2" height="3.2" fill="#3a2a1a"/><circle cy="2.9" r=".9" fill="#8a8f96"/>`;
 case'katana':return`<path d="M-.6-1.2C-1.2-6-.6-10.6 1.6-14.6l.7.3C.4-10.4-.1-6 .5-1.2Z" fill="#eef2f6"/><ellipse cy="-.9" rx="1.6" ry=".55" fill="#2a2a2a"/><rect x="-.55" y="-.5" width="1.1" height="3.4" fill="#2b2b3a"/>`;
 case'wakizashi':return`<path d="M-.55-1.1C-1-4.4-.6-7.4 1.1-9.8l.6.25C.3-7.2-.1-4.4.45-1.1Z" fill="#eef2f6"/><ellipse cy="-.9" rx="1.3" ry=".5" fill="#2a2a2a"/><rect x="-.5" y="-.5" width="1" height="2.4" fill="#2b2b3a"/>`;
 case'spear':return`<rect x="-.45" y="-17" width=".9" height="25" rx=".4" fill="${WOOD}"/><path d="M0-21.6l1.6 4.6-1.6.9-1.6-.9Z" fill="${STEEL}"/>`;
 case'lance':return`<rect x="-.38" y="-20" width=".76" height="28" rx=".38" fill="#c9b27a"/><path d="M0-23.4l1 3.4H-1Z" fill="#cfd5db"/><path d="M-.6-19.4h1.2" stroke="#c0392b" stroke-width=".8"/>`;
 case'naginata':return`<rect x="-.45" y="-14" width=".9" height="22" rx=".4" fill="#3a2a1a"/><path d="M-.5-14V-15.4C-.6-18.6.6-20.8 2.6-22.2c-.4 2.4-.8 4.8-2 8.2Z" fill="${STEEL}"/><rect x="-.8" y="-14.4" width="1.6" height=".8" fill="${GOLD}"/>`;
 case'axe':return`<rect x="-.5" y="-11" width="1" height="14.5" rx=".5" fill="${WOOD}"/><path d="M.4-11.2C3.6-12.4 5.6-10.6 5.4-7.2 5.2-5.4 3.4-5.2.4-6.6Z" fill="${STEEL}"/>`;
 case'cutlass':return`<path d="M-.8-1.2Q-1.4-6 1.4-10.8l.9.4Q.4-6 .9-1.2Z" fill="${STEEL}"/><path d="M-1.6-1.2Q-2.4 1.2-.6 2.6M-1.6-1.2H1.4" stroke="${GOLD}" stroke-width=".6" fill="none"/><rect x="-.5" y="-.8" width="1" height="2.8" fill="#3a2a1a"/>`;
 case'rapier':return`<path d="M-.3-1.2V-14.6L0-15.6l.3 1V-1.2Z" fill="${STEEL}"/><path d="M-2.2-.9Q0-3 2.2-.9" stroke="${GOLD}" stroke-width=".6" fill="none"/><rect x="-.5" y="-.8" width="1" height="2.8" fill="#3a2a1a"/><circle cy="2.4" r=".8" fill="${GOLD}"/>`;
 case'sica':return`<path d="M-.6-1.1C-.7-4.4.6-6.8 3.1-7.8l.3.6C1.2-5.8.4-3.8.6-1.1Z" fill="${STEEL}"/><rect x="-1.6" y="-1.4" width="3.2" height=".9" fill="#6b4423"/><rect x="-.5" y="-.6" width="1" height="2.3" fill="#6b4423"/>`;
 case'khopesh':return`<path d="M-.6-1.1V-6.2C-.4-9.4 1.6-10.8 4.2-10.4 5.4-10 5.2-8.6 4.2-8.8 2.4-9 1-7.8.7-5.8V-1.1Z" fill="#d6a84a"/><rect x="-.6" y="-1.2" width="1.2" height="3" fill="#2a2a2a"/>`;
 case'bow':return`<path d="M.5-9.6Q5.8 0 .5 9.6" stroke="#7a4a22" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M.5-9.6V9.6" stroke="#e8e2d0" stroke-width=".35"/>`;
 case'recurve':return`<path d="M1.6-8.6Q-.6-9.4.8-6.6Q4.6 0 .8 6.6Q-.6 9.4 1.6 8.6" stroke="#5a3a1a" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M1.4-8.4V8.4" stroke="#e8e2d0" stroke-width=".3"/>`;
 case'staff':return`<rect x="-.55" y="-12.5" width="1.1" height="25" rx=".5" fill="${WOOD}"/><rect x="-.75" y="-12.5" width="1.5" height="1.6" fill="${GOLD}"/><rect x="-.75" y="10.9" width="1.5" height="1.6" fill="${GOLD}"/>`;
 case'vitis':return`<path d="M0 2.6V-8.4" stroke="#6b4b2a" stroke-width=".95" stroke-linecap="round"/><circle cy="-8.6" r=".9" fill="#6b4b2a"/>`;
 case'club':return`<path d="M-.8 2.4L-1.9-9.4Q0-12.8 1.9-9.4L.8 2.4Z" fill="#7a5230"/><circle cx="-.9" cy="-7" r=".55" fill="#5a3a20"/><circle cx=".8" cy="-4.4" r=".5" fill="#5a3a20"/>`;
 case'dumbbell':return`<rect x="-4.6" y="-.45" width="9.2" height=".9" fill="#9aa3ad"/><rect x="-5.4" y="-2" width="1.8" height="4" rx=".4" fill="#2b2f3a"/><rect x="3.6" y="-2" width="1.8" height="4" rx=".4" fill="#2b2f3a"/>`;
 case'wraps':return`<circle r="2" fill="#f4f4f4"/><path d="M-1.6-.6h3.2M-1.6.6h3.2" stroke="#cfd5db" stroke-width=".35"/>`;
 case'firefist':return`<circle r="2.1" fill="#ff7a2a"/><path class="flm" d="M-1.6-1Q-.8-5.4 0-3.2Q.8-6 1.6-1Z" fill="#ffd35a"/>`;
 case'shuriken':return`<path d="M0-2.4L.6-.6 2.4 0 .6.6 0 2.4-.6.6-2.4 0-.6-.6Z" fill="#9aa3ad"/>`;
 case'scroll':return`<rect x="-3" y="-1.3" width="6" height="2.6" rx=".4" fill="#efe2bf"/><rect x="-3.6" y="-1.6" width="1" height="3.2" rx=".5" fill="#c9a24a"/><rect x="2.6" y="-1.6" width="1" height="3.2" rx=".5" fill="#c9a24a"/><path d="M-1.8-.4h3.4M-1.8.5h2.6" stroke="#9a8a6a" stroke-width=".3"/>`;
 case'ankh':return`<path d="M0 3V-4.4M-2-3.2H2" stroke="${GOLD}" stroke-width="1" fill="none"/><ellipse cy="-6" rx="1.3" ry="1.7" stroke="${GOLD}" stroke-width=".9" fill="none"/>`;
 case'banner':return`<rect x="-.4" y="-21" width=".8" height="25" fill="#7a5230"/><path d="M.4-20.6H9.4L8.2-17.8 9.4-15H.4Z" fill="#f4f4f4"/><path d="M4.4-19.2 5.3-17.8 4.4-16.4 3.5-17.8Z" fill="${GOLD}"/>`;
 case'musket':return`<rect x="-.55" y="-15.5" width="1.1" height="15" fill="#3a3f4a"/><path d="M-1-1H1L1.6 4.6H-1.6Z" fill="#6b4423"/>`;
 case'spyglass':return`<rect x="-.6" y="-6.4" width="1.2" height="7" rx=".4" fill="#c9a24a"/><rect x="-.8" y="-6.8" width="1.6" height="1.4" rx=".4" fill="#6b4423"/>`;
 case'macuahuitl':{let s=`<rect x="-1.4" y="-11.6" width="2.8" height="12.2" rx="1" fill="#7a5230"/>`;for(let y=-10.8;y<-1;y+=2.2)s+=`<path d="M-1.4 ${y.toFixed(1)}l-1 .6 1 .6ZM1.4 ${y.toFixed(1)}l1 .6-1 .6Z" fill="#1a1a1a"/>`;return s+`<rect x="-.6" y=".4" width="1.2" height="2.4" fill="#5a3a20"/>`}
 case'macestar':return`<rect x="-.5" y="-9" width="1" height="12" fill="${WOOD}"/><path d="M0-12.6l1 1.6 1.8-.2-.8 1.6.8 1.6-1.8-.2-1 1.6-1-1.6-1.8.2.8-1.6-.8-1.6 1.8.2Z" fill="${GOLD}"/>`;
}return''}
function shieldArt(t,c1,c2,L){switch(t){
 case'scutum':return`<rect x="11" y="19.4" width="7.6" height="13.6" rx="1.8" fill="${c1}" stroke="${c2}" stroke-width=".7"/><path d="M12.6 21.6h4.4M12.6 30.8h4.4" stroke="${c2}" stroke-width=".6"/><circle cx="14.8" cy="26.2" r="1.7" fill="${c2}"/>`;
 case'aspis':return`<circle cx="14.6" cy="25.8" r="6.5" fill="${c1}" stroke="${c2}" stroke-width="1"/>${L.lambda?`<path d="M12.2 28.8 14.6 22.4 17 28.8" stroke="${c2}" stroke-width="1.2" fill="none"/>`:`<circle cx="14.6" cy="25.8" r="2" fill="${shd(c1,-.2)}"/>`}`;
 case'round':return`<circle cx="14.6" cy="26" r="6.2" fill="${c1}" stroke="#6b4423" stroke-width=".8"/><path d="M8.6 26h12M14.6 20v12" stroke="${c2}" stroke-width=".9"/><circle cx="14.6" cy="26" r="1.5" fill="#9aa3ad"/>`;
 case'kite':return`<path d="M11 19.8h7.6v7.4Q18.6 31 14.8 34.6 11 31 11 27.2Z" fill="${c1}" stroke="${c2}" stroke-width=".7"/><path d="M14.8 20.4v13M11.6 24.4h6.4" stroke="${c2}" stroke-width="1"/>`;
 case'oval':return`<ellipse cx="14.6" cy="26.2" rx="4.4" ry="7.4" fill="${c1}" stroke="${c2}" stroke-width=".7"/><ellipse cx="14.6" cy="26.2" rx="1.3" ry="2" fill="${c2}"/>`;
 case'parmula':return`<rect x="11.6" y="22" width="6.4" height="7.4" rx="1" fill="${c1}" stroke="${c2}" stroke-width=".7"/><circle cx="14.8" cy="25.7" r="1.1" fill="${c2}"/>`;
 case'chimalli':return`<circle cx="14.6" cy="25.4" r="5.6" fill="${c1}" stroke="${c2}" stroke-width=".9"/><circle cx="14.6" cy="25.4" r="2.6" fill="none" stroke="${c2}" stroke-width=".7"/><path d="M11 30.4l-.6 3.6M13 31.2l-.2 3.8M15 31.4v3.8M17 31l.4 3.6" stroke="#4cc38a" stroke-width=".9"/>`;
}return''}
function armorArt(L,x,w,sk){const a=L.ar||[];const t=a[0],c=a[1]||L.tu,c2=a[2]||GOLD;const dk=shd(c,-.32);switch(t){
 case'musc':return`<rect x="${x+.5}" y="18.8" width="${w-1}" height="10.4" rx="3" fill="${c}"/><path d="M${x+1.6} 22.2q${w/4-.4} 1.8 ${w/2-1.6} 0q${w/4-.4} 1.8 ${w/2-1.6} 0M${x+w/2} 23.4v4" stroke="${dk}" stroke-width=".5" fill="none"/>`;
 case'seg':return`<rect x="${x+.4}" y="18.8" width="${w-.8}" height="10.8" rx="2.6" fill="${c}"/>${[21.2,23.6,26,28.2].map(y=>`<path d="M${x+.6} ${y}h${w-1.2}" stroke="${dk}" stroke-width=".55"/>`).join('')}<path d="M${x+w/2} 18.8v2.4" stroke="${dk}" stroke-width=".5"/>`;
 case'chain':{let s=`<rect x="${x+.3}" y="18.7" width="${w-.6}" height="11.4" rx="2.8" fill="${c}"/>`;for(let yy=20;yy<29.5;yy+=1.6)for(let xx=x+1.2;xx<x+w-.6;xx+=1.6)s+=`<circle cx="${xx.toFixed(1)}" cy="${yy.toFixed(1)}" r=".33" fill="${dk}"/>`;return s}
 case'plate':return`<rect x="${x+.3}" y="18.7" width="${w-.6}" height="11.6" rx="3" fill="${c}"/><rect x="${x+1.2}" y="19.6" width="1.6" height="8" rx=".8" fill="${shd(c,.35)}"/><path d="M${x+.4} 25h${w-.8}" stroke="${dk}" stroke-width=".5"/>`;
 case'leather':return`<rect x="${x+.6}" y="19.2" width="${w-1.2}" height="9.8" rx="2.6" fill="${c}"/><path d="M${x+1} 19.6L${x+w-1} 28.6" stroke="${shd(c,-.35)}" stroke-width="1"/>`;
 case'lamellar':{let s=`<rect x="${x+.3}" y="18.7" width="${w-.6}" height="11.2" rx="2.6" fill="${c}"/>`;for(let yy=20.4;yy<29.5;yy+=1.8)s+=`<path d="M${x+.5} ${yy.toFixed(1)}h${w-1}" stroke="${shd(c,.3)}" stroke-width=".45" stroke-dasharray="1.2 .5"/>`;return s+`<path d="M${x+.5} 20.2h${w-1}" stroke="${c2}" stroke-width=".7"/>`}
 case'linen':case'dress':return`<rect x="${x+.4}" y="18.8" width="${w-.8}" height="10.8" rx="2.8" fill="${c}"/><rect x="${x+.4}" y="24.2" width="${w-.8}" height="1.3" fill="${c2}"/><path d="M${x+1.4} 19.4v3.4M${x+w-1.4} 19.4v3.4" stroke="${shd(c,-.18)}" stroke-width=".5"/>`;
 case'robe':return`<path d="M${x+w/2-2.4} 18.6l2.4 4.2 2.4-4.2" stroke="${c}" stroke-width="1.2" fill="none"/>`;
 case'kimono':case'gi':return`<path d="M${x+w-2.4} 18.6L${x+2} 28.6" stroke="${c}" stroke-width="1.4"/><path d="M${x+2.2} 18.6L${x+w/2+.6} 23.4" stroke="${shd(L.tu,-.2)}" stroke-width="1"/>`;
 case'haori':return`<rect x="${x-.4}" y="18.6" width="3" height="12.6" rx="1.2" fill="${c}"/><rect x="${x+w-2.6}" y="18.6" width="3" height="12.6" rx="1.2" fill="${c}"/>`;
 case'toga':return`<path d="M${x+w-1} 18.6L${x+.4} 29.2L${x+.4} 32H${x+3}L${x+w} 21Z" fill="${c}"/><path d="M${x+w-1} 18.6L${x+.4} 29.2" stroke="${c2}" stroke-width=".9"/>`;
 case'coat':return`<rect x="${x+w/2-1.8}" y="18.6" width="3.6" height="10.8" fill="${c2}"/><path d="M${x+w/2-1.8} 18.6l-1.2 4 1.2 1.2M${x+w/2+1.8} 18.6l1.2 4-1.2 1.2" stroke="${shd(c,-.2)}" stroke-width=".7" fill="none"/>${[21,23.4,25.8].map(y=>`<circle cx="${x+w/2+2.6}" cy="${y}" r=".4" fill="${GOLD}"/>`).join('')}<path d="M${x} 29.6h${w}l-.4 6.4h-${w-.8}Z" fill="${c}"/>`;
 case'tabard':return`<rect x="${x+1}" y="18.8" width="${w-2}" height="13" rx="1" fill="${c}"/><path d="M${x+w/2} 20.4v7M${x+w/2-2.6} 23h5.2" stroke="${c2}" stroke-width="1"/>`;
 case'bare':return`<path d="M${x+1.6} 22.4q${w/4-.4} 1.6 ${w/2-1.6} 0q${w/4-.4} 1.6 ${w/2-1.6} 0" stroke="${shd(sk,-.25)}" stroke-width=".5" fill="none"/>`;
 case'tank':return`<rect x="${x+.6}" y="18.6" width="${w-1.2}" height="11" rx="2.6" fill="${L.tu}"/>`;
 case'poncho':return`<path d="M${x-1.4} 18.8H${x+w+1.4}L${x+w+2.4} 29.6H${x-2.4}Z" fill="${c}"/><path d="M${x-1.8} 25.4H${x+w+1.8}" stroke="${c2}" stroke-width="1.2" stroke-dasharray="1.2 .8"/><path d="M${x-2.1} 27.6H${x+w+2.1}" stroke="${c2}" stroke-width=".6"/>`;
 case'unku':{let s=`<rect x="${x+.2}" y="18.6" width="${w-.4}" height="13" rx="2.6" fill="${c}"/>`;for(let i=0;i<4;i++)for(let j=0;j<2;j++)s+=`<rect x="${(x+1+i*2.1).toFixed(1)}" y="${22+j*1.6}" width="1.5" height="1.3" fill="${(i+j)%2?c2:'#1a1a1a'}"/>`;return s}
 case'deel':return`<path d="M${x+w/2+.4} 18.6Q${x+w-1} 22 ${x+w-.6} 27.2" stroke="${c2}" stroke-width="1.3" fill="none"/><rect x="${x}" y="27.6" width="${w}" height="1.8" fill="${c2}"/>`;
 case'jaguarsuit':return[[2,21],[5,20.2],[7.6,22],[3.4,24.6],[6.4,25.6],[2,27.6],[7.4,28]].map(([a,b])=>`<circle cx="${(x+a).toFixed(1)}" cy="${b}" r=".75" fill="${c2}"/>`).join('');
}return''}
function skirtArt(L,x,w){if(!L.skirt)return'';const[t,c]=L.skirt;switch(t){
 case'pteruges':{let s='';const n=Math.floor(w/2);for(let i=0;i<n;i++)s+=`<rect x="${(x+.3+i*2).toFixed(1)}" y="30.2" width="1.7" height="4.8" rx=".5" fill="${c}"/>`;return s}
 case'kilt':return`<path d="M${x} 29.8H${x+w}l.9 5.2H${x-.9}Z" fill="${c}"/>`;
 case'long':return`<path d="M${x} 28.4H${x+w}l2.6 15.2H${x-2.6}Z" fill="${c}"/><path d="M${x+w/2} 30v13" stroke="${shd(c,-.15)}" stroke-width=".4"/>`;
 case'hakama':return`<path d="M${x-.2} 29.4H${x+w+.2}l1.4 13H${x-1.6}Z" fill="${c}"/><path d="M${x+w/2} 31v11" stroke="${shd(c,-.25)}" stroke-width=".4"/>`;
 case'mawashi':return`<rect x="${x-.2}" y="28" width="${w+.4}" height="3.8" rx="1" fill="${c}"/><path d="M${x+w-2} 31.6v3.4" stroke="${c}" stroke-width="1.6"/>`;
}return''}
/* cabeza anime: ojos grandes con brillo, mechones, rubor. Se dibuja a escala normal y se agranda 1,25× desde el cuello */
function eyeArt(L){const ir=L.eye||'#2b1a12';return`<ellipse cx="22.8" cy="11.55" rx="1.12" ry="1.55" fill="${ir}"/><ellipse cx="22.8" cy="12.2" rx=".8" ry=".7" fill="${shd(ir,.25)}"/><circle cx="23.2" cy="10.9" r=".46" fill="#fff"/><circle cx="22.5" cy="12.3" r=".22" fill="#fff" opacity=".85"/><path d="M21.45 10.05Q22.8 9.3 24.3 9.9" stroke="#1a1010" stroke-width=".65" fill="none" stroke-linecap="round"/>`}
function hairBack(h){if(!h)return'';const[s,c]=h;switch(s){
 case'long':return`<path d="M14.6 9.4Q12.6 15.6 13.8 21.4L15.6 20 16.4 21.8 18.4 20.6Q17.2 15.4 18.4 10Z" fill="${c}"/>`;
 case'pony':return`<path d="M15.2 8.8Q10.6 9.4 10.4 15.4L11.8 14.4 11.6 17.6 13 16.2 13.6 19.4Q14.2 13.8 16 11.6Z" fill="${c}"/><circle cx="15.2" cy="9.6" r=".8" fill="#c0392b"/>`;
 case'braid':return[12,14.6,17.2,19.8].map(y=>`<ellipse cx="15.2" cy="${y}" rx="1.4" ry="1.5" fill="${c}"/>`).join('');
 case'bob':return`<path d="M14 15.6Q13.4 8 16 7Q15.6 12 17.6 16.2Z" fill="${c}"/>`;
 case'curly':return`<circle cx="15.6" cy="13.8" r="1.8" fill="${c}"/>`;
}return''}
function hairTop(h){if(!h)return'';const[s,c]=h;if(s==='bald')return'';
 const bangs=`<path d="M21.2 7.2L22.6 10.4 22.4 7.4ZM23 7.6L25 10 24.2 7.6ZM19.4 7.4L20.4 10 20.8 7.4Z" fill="${c}"/>`;
 const base=`<path d="M14.6 12.6Q13.8 5.8 20 5.6Q25 5.6 25.6 9.4Q22.8 7.6 19.8 8.6Q18.4 10.2 17.8 13.6Q15.4 14.8 14.6 12.6Z" fill="${c}"/><path d="M14.8 11.6L13.6 14.6 15.6 13.2ZM15.4 8L13.4 8.6 15 9.8Z" fill="${c}"/>${bangs}<path d="M18.2 10.4Q18.4 13.2 19.2 14.4L18.2 14.2Z" fill="${c}"/>`;
 switch(s){
  case'curly':return base+[[15.4,8.8],[17.2,6.6],[19.8,5.6],[22.6,5.8],[24.6,7.4],[14.8,11.4]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.7" fill="${c}"/>`).join('');
  case'topknot':return base+`<ellipse cx="18.4" cy="5.2" rx="1.7" ry="1.2" fill="${c}"/><rect x="17.6" y="5.6" width="1.6" height="1" fill="${c}"/>`;
  case'bob':return`<path d="M14.2 13Q13.6 5.4 20 5.2Q25.6 5.4 26 9.8L25 9.4 24.6 10.6 23.6 9 22.8 10.4 22.2 8.8Q19.6 9.6 18.8 13.4Z" fill="${c}"/>`;
  default:return base;
 }}
function beardArt(b){if(!b)return'';const[s,c]=b;switch(s){
 case'full':return`<path d="M18.8 13.2Q19 17.8 22.6 17.8Q25.6 17.4 25.6 14.2Q23.6 15.4 21.4 14.8Q20 14.2 18.8 13.2Z" fill="${c}"/>`;
 case'long':return`<path d="M18.8 13.2Q18.6 20.6 22.2 21.4Q25.6 19.6 25.6 14.2Q23.6 15.4 21.4 14.8Q20 14.2 18.8 13.2Z" fill="${c}"/>`;
 case'stache':return`<path d="M22 14Q23.8 13 25.8 14Q24.6 15 22 14.6Z" fill="${c}"/>`;
 case'fu':return`<path d="M22 14Q23.8 13 25.8 14Q24.6 15 22 14.6Z" fill="${c}"/><path d="M22.4 14.4Q21.8 16.4 22.4 18M25.2 14.6Q25.6 16.6 25 18" stroke="${c}" stroke-width=".6" fill="none"/>`;
 case'goatee':return`<path d="M22.6 14Q24 13.2 25.6 14Q24.6 14.8 22.6 14.4ZM23.6 15.4Q24.2 17.6 25 15.6Z" fill="${c}"/>`;
 case'short':return`<path d="M19 13.4Q19.6 17 22.6 17.2Q25.4 16.8 25.6 14.4Q23 15.6 19 13.4Z" fill="${c}" opacity=".5"/>`;
}return''}
function gearArt(g,c1,c2,sk,L){const E=eyeArt(L||{});switch(g){
 case'headband':return`<path d="M14.7 9.4Q20 7.4 25.4 8.8l-.1 1.5Q20 9 14.8 11Z" fill="${c1}"/><path d="M15 10.2q-3 .4-4.6 2.6 2.6-.6 4.6-1.2M15 10.6q-2.4 1.6-3 4 2-1.8 3.2-3" fill="${c1}"/>`;
 case'trarilonco':return`<path d="M14.6 9.6Q20 8 25.4 9.2l-.1 1.3Q20 9.4 14.7 11Z" fill="${c1}"/><circle cx="21.6" cy="9.4" r=".55" fill="#e8e2d0"/><circle cx="18.4" cy="9.8" r=".55" fill="#e8e2d0"/>`;
 case'plume':return gearArt('headband',c2,c2,sk,L)+`<path d="M16.6 9.6Q14.8 4.6 16.2 1.6Q17.8 5.2 17.8 9.4Z" fill="${c1}"/><path d="M18.6 9.2Q18.4 4.4 20.4 2.2Q20.8 5.8 19.8 9.2Z" fill="${c1}"/>`;
 case'galea':return`<path d="M14.3 12.4Q14.1 5.2 20 5Q25.8 5.2 25.7 9.6H24.7V9.4Q20 8.6 15.7 10.4V15.4H14.3Z" fill="${c1}"/><path d="M14.4 9.9Q20 8.6 25.6 9.6" stroke="${shd(c1,-.3)}" stroke-width=".6" fill="none"/><path d="M20.6 9.8H21.8L21.6 16H20.6Z" fill="${shd(c1,-.12)}"/><path d="M15 6.6Q19.8.2 25.2 5.8L23.8 6.9Q19.8 2.8 16.3 7.6Z" fill="${c2}"/>`;
 case'galea_t':return`<path d="M14.3 12.4Q14.1 5.2 20 5Q25.8 5.2 25.7 9.6H24.7V9.4Q20 8.6 15.7 10.4V15.4H14.3Z" fill="${c1}"/><path d="M14.4 9.9Q20 8.6 25.6 9.6" stroke="${shd(c1,-.3)}" stroke-width=".6" fill="none"/><path d="M20.6 9.8H21.8L21.6 16H20.6Z" fill="${shd(c1,-.12)}"/><path d="M16.2 6.2Q19.8-3.4 23.8 6Z" fill="${c2}"/><path d="M17.4 5.8Q19.8-1 22.6 5.6" stroke="${shd(c2,-.25)}" stroke-width=".4" fill="none"/>`;
 case'corinthian':return`<path d="M14.2 13.4Q13.8 5 20.2 4.8Q26.2 5 26.2 11.6V15L24.4 17.2 19.2 17.2 14.8 16.6Z" fill="${c1}"/><path d="M21.3 9.9H26V12.9H24.7V15.6H23.3V12.9H21.3Z" fill="${sk}"/>${E}<path d="M14.2 8.8Q15.6 1.2 21.6 1.8Q26.6 2.6 25.8 6.8Q21.4 3.8 17 7.2Q15.6 8.4 15.6 10.6Z" fill="${c2}"/><path d="M14.6 13.6Q16.6 12.6 18.4 13.8" stroke="${shd(c1,-.3)}" stroke-width=".5" fill="none"/>`;
 case'fish':case'thraex':{const gr=[21.6,22.6,23.6,24.6].map(x=>`<path d="M${x} 9.4V13.8" stroke="${shd(c1,.3)}" stroke-width=".35"/>`).join('');const crest=g==='fish'?`<path d="M15.2 6.4Q18.6-1 25 4.6Q21 3.2 18.6 6.2Z" fill="${c2}"/>`:`<path d="M16 6.2Q16.4.4 21.6.6Q25.8 1 25.8 4.8Q23.4 2.6 20.8 3.6Q18.8 4.4 18.4 6.6Z" fill="${c2}"/>`;return`<path d="M14.2 14.8Q13.8 5.6 20 5.4Q26.4 5.6 26.4 12.2V15.4H14.2Z" fill="${c1}"/><path d="M12.8 14.6H27.2" stroke="${shd(c1,-.25)}" stroke-width="1.2"/><circle cx="23" cy="11.5" r="2.4" fill="#2a2f3a"/>${gr}${crest}`}
 case'kabuto':return`<path d="M14.6 10.4Q14.8 4.4 20 4.2Q25.2 4.4 25.4 9.4L24.4 9.4Z" fill="${c1}"/><path d="M14.4 9.6H24.6L24.2 10.6 16.6 11.8 12.6 15.8 11.8 13.4Z" fill="${shd(c1,-.18)}"/><path d="M13.6 12.2 16.8 10.8M12.6 14 16.4 11.6" stroke="${c2}" stroke-width=".4"/><path d="M23.6 5.6Q25.2 1.2 28 .4Q26 2.8 24.8 6.4ZM22.4 5Q22.2.2 24.4-1.2Q23.6 2.4 23.6 5.6Z" fill="${c2}"/>`;
 case'nasal':return`<path d="M14.6 10.6Q14.8 4.4 20 3.8Q25.2 4.4 25.4 9.6Z" fill="${c1}"/><path d="M14.6 9.6Q20 8.6 25.4 9.6V10.6Q20 9.6 14.6 11.2Z" fill="${shd(c1,-.22)}"/><rect x="24.4" y="9.6" width="1.1" height="3.8" rx=".4" fill="${c1}"/>`;
 case'winged':return gearArt('nasal',c1,c2,sk,L)+`<path d="M16.4 7.6Q11.2 4.4 10.6-.6Q14.4 1.8 17.8 6.2Z" fill="${c2}"/><path d="M15.6 6.4Q12.6 3.8 12.4.8" stroke="${shd(c2,-.2)}" stroke-width=".4" fill="none"/>`;
 case'pilos':return`<path d="M14.6 10Q15.6 2.4 20 1.2Q24.4 2.4 25.4 9.4Z" fill="${c1}"/><path d="M14.4 9.8Q20 8.6 25.6 9.4" stroke="${shd(c1,-.3)}" stroke-width=".9" fill="none"/><path d="M20 1.4Q17.6-1.6 14.6-.4Q17.6.6 19.6 2Z" fill="${c2}"/>`;
 case'ninja':return`<circle cx="20" cy="11.6" r="5.6" fill="${c1}"/><rect x="20.8" y="9.8" width="5.4" height="3.2" rx="1.4" fill="${sk}"/>${E}<path d="M14.6 9.8 10.8 8.2 11.4 10.8 14.4 11.4ZM14.6 10.8 11.6 13.8 14.8 12.4Z" fill="${c1}"/>`;
 case'helm_full':return`<rect x="14.1" y="5.2" width="12" height="12" rx="2.8" fill="${c1}"/><path d="M14.1 9.4H26.1" stroke="${shd(c1,-.22)}" stroke-width=".5"/><rect x="20.8" y="10.6" width="5.3" height="1.2" rx=".5" fill="#141414"/>${[22,23.4,24.8].map(x=>`<circle cx="${x}" cy="14" r=".35" fill="#141414"/>`).join('')}${c2?`<path d="M17 5.4Q15.6 1.4 19.4.6Q18 2.6 18.8 5.2Z" fill="${c2}"/>`:''}`;
 case'jaguar':return`<path d="M13.6 15.4Q13 4.4 20 3.8Q26.8 4.2 26.8 9L28 9.6 25.8 10.2Q22.6 7.8 19.6 9.4L18 16.8Z" fill="${c1}"/>${[[16,7],[18.6,5.6],[21.6,5.4],[15,11],[16.4,14],[24.2,7]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".75" fill="${c2}"/>`).join('')}<path d="M25.6 10l.4 1.1.5-1.2M24 9.8l.4 1.1.5-1.2" fill="#fff"/><path d="M16.8 4.6l-.6-2.6 2.2 1.8Z" fill="${c1}"/>`;
 case'tricorn':return`<path d="M12.8 9.2Q14 4 20 3.8Q26.2 4 27.6 8.6Q24 7.2 20.6 8Q16 7 12.8 9.2Z" fill="${c1}"/><path d="M13.2 9Q16.2 7.2 20.6 8.2Q24 7.4 27.4 8.6" stroke="${c2}" stroke-width=".6" fill="none"/>`;
 case'musketeer':return`<ellipse cx="20" cy="8.2" rx="8.6" ry="1.7" fill="${c1}"/><path d="M15.6 8.2Q16 3.4 20.4 3.4Q24.2 3.4 24.4 8.2Z" fill="${c1}"/><path d="M16.2 5.6Q9.6 1.2 8.2 6.4Q12 4.4 16.6 7.4Z" fill="${c2}"/>`;
 case'laurel':return`<path d="M15 10.8Q19.6 5.2 24.8 8.2" stroke="${shd(c1,-.3)}" stroke-width=".4" fill="none"/>${[[15.2,10.6,-60],[15.8,8.6,-35],[17.2,7,-15],[19,6.2,0],[21,6.1,10],[22.8,6.6,25],[24.4,7.8,45]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="1.4" ry=".65" transform="rotate(${r} ${x} ${y})" fill="${c1}"/>`).join('')}`;
 case'rostrata':return`<path d="M14.8 9.6Q20 6.6 25.2 8.4V9.6Q20 8.4 14.8 11Z" fill="${c1}"/>${[16.2,18.6,21,23.4].map((x,i)=>`<path d="M${x} ${(9.4-i*.5).toFixed(1)}l.9-2.2.9 2Z" fill="${c1}"/>`).join('')}`;
 case'khepresh':return`<path d="M14.6 10.8Q13.6 3.6 17.4 2.2Q22.8 1 25.4 5.4Q26 7.8 25.4 9.4L24.6 9.6Z" fill="${c1}"/>${[[17,4.4],[19,3.6],[21.4,3.4],[23.4,4.4],[16.4,6.8],[18.6,6],[21,5.8],[23.4,6.8],[17.6,8.8],[20.2,8.2]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".38" fill="${c2}"/>`).join('')}<path d="M25 6.6q1.6-.4 1.4 1.6-.4-.8-1.2-.6Z" fill="${c2}"/>`;
 case'furhat':return`<path d="M14.6 10Q14.6 3.4 20 3.2Q25.4 3.4 25.4 9.4Z" fill="${c1}"/><rect x="13.8" y="7.8" width="12.4" height="2.6" rx="1.3" fill="${c2}"/>`;
 case'furcone':return`<path d="M14.8 10Q15.6 4.2 20 1.6Q24.4 4.2 25.2 9.4Z" fill="${c1}"/><rect x="13.8" y="7.8" width="12.4" height="2.6" rx="1.3" fill="${c2}"/><circle cx="20" cy="1.6" r=".8" fill="#c0392b"/>`;
 case'boeotian':return`<path d="M14.4 11.6Q14.2 4.6 19.6 4.4Q24.2 4.2 25.4 7.4Q23.6 7 22.6 8Q25.2 8.4 25.8 9.8L24.2 9.8Q20 9.2 15.6 11.6Z" fill="${c1}"/><path d="M16.8 5.2Q12.6-1.2 11-.8Q13.6 2.6 15.8 6.4Z" fill="${c2}"/><path d="M20.4 4.6Q21.2-2 24.2-.8Q22 1.8 21.8 4.8Z" fill="${c2}"/>`;
 case'lion':return`<path d="M12.6 18.6Q11.6 8 15 5.6L16.8 12 16.4 19.4Z" fill="${c2}"/><path d="M13.6 14Q13 4 20 3.6Q26.6 3.8 26.6 8.6L24.4 9Q20.4 7.2 16.8 10.2L16.4 16.6 13.2 17Z" fill="${c1}"/><ellipse cx="24" cy="7" rx="2.8" ry="1.6" fill="${shd(c1,-.12)}"/><circle cx="25.8" cy="6.6" r=".5" fill="#2a1a10"/><path d="M16.2 4.2l-.4-2.2 1.9 1.4Z" fill="${c1}"/><path d="M24.2 8.6l.4.9.5-.9M22.8 8.6l.4.9.5-.9" fill="#fff"/>`;
 case'mascapaycha':return`<path d="M14.7 9.2Q20 7.4 25.3 8.6v1.4Q20 9 14.8 10.8Z" fill="${c2}"/><rect x="23.8" y="8.4" width="2.4" height="1.6" fill="${c1}"/>${[24,24.7,25.4,26.1].map(x=>`<path d="M${x} 10v.7" stroke="${c1}" stroke-width=".5"/>`).join('')}<path d="M19.4 8.4 18.8 2.4 20.6 8.2Z" fill="#f4f4f4"/><path d="M20.4 8.4l1.4-5.4.4 5.4Z" fill="#1a1a1a"/>`;
 case'bicorne':return`<path d="M11.4 9.2Q20-2.4 28.8 9.2Q20 6.8 11.4 9.2Z" fill="${c1}"/><path d="M11.8 9Q20 7 28.4 9" stroke="${c2}" stroke-width=".5" fill="none"/><circle cx="21.6" cy="5" r="1.1" fill="#2a4bd0"/><circle cx="21.6" cy="5" r=".65" fill="#f4f4f4"/><circle cx="21.6" cy="5" r=".3" fill="#d0312d"/>`;
 case'diadem':return`<path d="M14.6 9.2Q20 7.6 25.4 8.6v1.1Q20 8.8 14.6 10.4Z" fill="${c1}"/><path d="M25 8q1.4-1.4 1.6.2-.6 1.2-1.4.8Z" fill="${c1}"/><circle cx="20" cy="8.5" r=".5" fill="#2a7bd5"/>`;
}return''}
function bullHead(L){const h=L.hcol||'#6b4423';return`<rect x="18.6" y="15" width="2.8" height="4" fill="${h}"/><ellipse cx="20.4" cy="11.4" rx="5.4" ry="5" fill="${h}"/><ellipse cx="24.8" cy="13.6" rx="3.1" ry="2.5" fill="${shd(h,.3)}"/><circle cx="26.2" cy="13.2" r=".45" fill="#2a1a10"/><circle cx="24.6" cy="13.4" r=".45" fill="#2a1a10"/><path d="M25.6 15.2a1.3 1.3 0 1 1-1.9.2" stroke="${GOLD}" stroke-width=".55" fill="none"/><path d="M17.8 7.6Q14.8 3 17.6.8Q16.8 3.8 19.6 6.6ZM21.6 6.8Q22.8 1.8 26.6 1.6Q23.6 3.6 23.4 7.4Z" fill="#efe6d2"/><ellipse cx="17" cy="10.4" rx="1.8" ry="1" fill="${shd(h,-.2)}" transform="rotate(-20 17 10.4)"/><ellipse cx="22.4" cy="10.4" rx=".85" ry="1.1" fill="#111"/><circle cx="22.7" cy="10" r=".3" fill="#fff"/><path d="M21.4 9l2.2-.5" stroke="#111" stroke-width=".55"/>`}
function headArt(L){
 if(L.head==='bull')return bullHead(L);
 const sk=L.sk||'#e0ac7e';const hd=L.hd||[];
 const full=['corinthian','ninja','helm_full','fish','thraex'].includes(hd[0]);
 let s=hairBack(L.hair)+`<rect x="18.7" y="14.6" width="2.8" height="4.4" fill="${sk}"/><circle cx="20" cy="11.6" r="5.3" fill="${sk}"/><ellipse cx="18.4" cy="12.2" rx=".95" ry="1.25" fill="${shd(sk,-.15)}"/>`;
 if((L.acc||[]).includes('earspool'))s+=`<circle cx="18.4" cy="12.6" r=".9" fill="${GOLD}"/>`;
 if(!full)s+=`<path d="M25.1 11.8q.9.8.1 1.4" fill="${sk}" stroke="${shd(sk,-.25)}" stroke-width=".3"/>${eyeArt(L)}<ellipse cx="23.6" cy="13.7" rx="1" ry=".45" fill="#ff7a7a" opacity=".35"/><path d="M23.3 14.8q.6.3 1.2 0" stroke="${shd(sk,-.45)}" stroke-width=".4" fill="none" stroke-linecap="round"/>`;
 s+=beardArt(L.beard);
 if(L.hair&&!full)s+=hairTop(L.hair);
 if((L.acc||[]).includes('paint'))s+=`<path d="M21.6 12.8l2.6-.4" stroke="#2a5bd6" stroke-width=".5"/>`;
 if(hd[0])s+=gearArt(hd[0],hd[1],hd[2],sk,L);
 return`<g transform="translate(20 18) scale(1.25) translate(-20 -18)">${s}</g>`;
}
function accArt(L){let s='';for(const a of L.acc||[]){
 if(a==='torc')s+=`<path d="M17.6 18.6Q20.4 20.4 23.2 18.4" stroke="${GOLD}" stroke-width=".9" fill="none"/>`;
 if(a==='collar')s+=`<path d="M15.8 18.6Q20.2 24.2 24.6 18.6Z" fill="${GOLD}"/><path d="M17 19.4Q20.2 22.6 23.4 19.4" stroke="#2a7bd5" stroke-width=".7" fill="none"/>`;
 if(a==='sash')s+=`<path d="M15.6 28.4h8.8l1.8 4.4-1.4.4-1.2-3.2h-8Z" fill="#e2b54a"/>`;
 if(a==='phalerae')s+=[[18,22],[20.6,22],[19.3,24.6]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".75" fill="${GOLD}"/>`).join('');
}return s}
function projArt(act){switch(act){
 case'bow':return`<g class="pj"><path d="M33 20.2h7" stroke="#7a4a22" stroke-width=".7"/><path d="M40.6 20.2l-1.6-.9v1.8Z" fill="${STEEL}"/><path d="M33 20.2l-.8-.8M33 20.2l-.8.8" stroke="#c0392b" stroke-width=".5"/></g>`;
 case'throw':return`<g class="pj"><g class="pjr" style="transform-origin:31px 20px"><path d="M31 17.6l.7 1.7 1.7.7-1.7.7-.7 1.7-.7-1.7-1.7-.7 1.7-.7Z" fill="#c9d0d8"/></g></g>`;
 case'aim':return`<g class="pj"><path d="M48.4 20.2l2.6-1.2v2.4Z" fill="#ffb02e"/><circle cx="51.6" cy="19.6" r="1.8" fill="#d8dde4"/><circle cx="54" cy="18.6" r="1.3" fill="#c4cad2"/></g>`;
}return''}
function elephantArt(){const g='#9aa0a8',d='#7d838c';
 const leg=(x,c,cls)=>`<g class="${cls}" style="transform-origin:${x+1.7}px 37px"><rect x="${x}" y="36" width="3.4" height="9.6" rx="1.4" fill="${c}"/><rect x="${x-.2}" y="44.4" width="3.8" height="1.4" rx=".6" fill="#e8e2d0"/></g>`;
 return`<g class="el">${leg(-17.6,d,'e2')}${leg(-7.6,d,'e1')}<path d="M-20.2 31.4Q-23 33 -22.4 37" stroke="${d}" stroke-width=".9" fill="none"/><ellipse cx="-11.6" cy="33.4" rx="9.4" ry="6.8" fill="${g}"/><path d="M-17.6 26.8h9.4l.6 6.2h-10.6Z" fill="#6a2c8a"/><path d="M-17.6 33h10.6" stroke="${GOLD}" stroke-width=".8"/>${leg(-15.6,g,'e1')}${leg(-5.8,g,'e2')}<circle cx="-1.6" cy="29" r="5.2" fill="${g}"/><ellipse cx="-4" cy="29.8" rx="3" ry="4.2" fill="${d}"/><g class="tr" style="transform-origin:1.6px 31.4px"><path d="M1.2 30.2Q4.2 33 3.8 38.6Q3.6 41.6 5.4 41.4L5 42.8Q2 43.4 2.2 38.8Q2.4 34.6 .2 32.6Z" fill="${g}"/></g><path d="M1.6 32.8q2.4 1.4 3.2-.4" stroke="#f4efe2" stroke-width="1" fill="none" stroke-linecap="round"/><ellipse cx=".4" cy="27.8" rx=".7" ry=".9" fill="#111"/><circle cx=".6" cy="27.5" r=".25" fill="#fff"/></g>`;
}
function humanSVG(L){
 const sk=L.sk||'#e0ac7e',tu=L.tu||'#8a2b2b',pa=L.pa||sk,bo=L.bo||'#5a3a22';
 const at=(L.ar&&L.ar[0])||'none';const bulk=L.bulk?1.7:0,tx=15.2-bulk,tw=9.6+2*bulk;
 const bareA=['bare','tank'].includes(at);
 const fullArm=['plate','chain','lamellar'].includes(at);
 const armC=fullArm?L.ar[1]:tu;const handC=at==='plate'?L.ar[1]:sk;
 const cover=['wraps','firefist'];const acc=L.acc||[];
 const arm=(sx,back,item,cls)=>{const f=back?(c=>shd(c,-.14)):(c=>c);
  let s=`<rect x="${sx-1.55}" y="19.2" width="3.1" height="11" rx="1.55" fill="${f(sk)}"/>`;
  if(!bareA)s+=`<rect x="${sx-1.65}" y="19" width="3.3" height="${fullArm?11.2:6.6}" rx="1.6" fill="${f(armC)}"/>`;
  if(acc.includes('manica')&&!back)s+=`<rect x="${sx-1.7}" y="19.4" width="3.4" height="9" rx="1.5" fill="#c9ced6"/>${[21,23,25,27].map(y=>`<path d="M${sx-1.6} ${y}h3.2" stroke="#8a929c" stroke-width=".4"/>`).join('')}`;
  if(acc.includes('epaul')&&!back)s+=`<rect x="${sx-2}" y="18.4" width="4" height="1.6" rx=".7" fill="${GOLD}"/>`;
  const it=item?`<g class="${cls}"><g transform="translate(${sx} 30.4)${REST_ROT[item]?' rotate('+REST_ROT[item]+')':''}">${itemArt(item)}</g></g>`:'';
  const hand=`<circle cx="${sx}" cy="30.4" r="1.75" fill="${f(handC)}"/>`;
  const ch=acc.includes('chains')?`<rect x="${sx-1.9}" y="27.9" width="3.8" height="1.1" rx=".4" fill="#8a929c"/><path d="M${sx+1} 29.1l.5 1.4M${sx+1.5} 30.5l-.4 1.2" stroke="#8a929c" stroke-width=".5"/>`:'';
  return cover.includes(item)?s+hand+ch+it:s+it+hand+ch;
 };
 const leg=(x,c,b,cls)=>`<g class="${cls}"><rect x="${x}" y="30.4" width="3.7" height="12.8" rx="1.6" fill="${c}"/><rect x="${x-.3}" y="42.4" width="5.6" height="3.3" rx="1.3" fill="${b}"/></g>`;
 const o=[`<ellipse class="shadow" cx="20" cy="46.5" rx="${8+bulk}" ry="1.5"/>`];
 if(L.extra==='elephant')o.push(elephantArt());
 o.push('<g class="wh">');
 if(L.cape)o.push(`<g class="cp"><path d="M16 19h8.4l2.8 17q-6.9 2.4-13.8 0Z" fill="${L.cape}"/></g>`);
 o.push(`<g class="ab">${arm(17.4,true,L.it2,'it2')}</g>`);
 o.push(leg(17.6,shd(pa,-.15),shd(bo,-.15),'lb'),leg(19.4,pa,bo,'lf'));
 o.push(`<g class="bd"><rect x="${tx}" y="18.4" width="${tw}" height="13.6" rx="3.4" fill="${at==='bare'?sk:tu}"/>${armorArt(L,tx,tw,sk)}${L.belt?`<rect x="${tx}" y="28.6" width="${tw}" height="1.8" fill="${L.belt}"/>`:''}${skirtArt(L,tx,tw)}${accArt(L)}</g>`);
 if(L.sh)o.push(`<g class="sh">${shieldArt(L.sh[0],L.sh[1],L.sh[2],L)}</g>`);
 o.push(`<g class="hd">${headArt(L)}</g>`);
 o.push(`<g class="af">${arm(22.6,false,L.it,'it')}</g>`);
 o.push(projArt(L.act));
 o.push('</g>');
 return o.join('');
}
function dragonSVG(c1,c2){const d=shd(c1,-.25),l=shd(c1,.18);
 return`<ellipse class="shadow" cx="20" cy="46.4" rx="11" ry="1.6"/><g class="wh">
 <g class="tl" style="transform-origin:12px 35px"><path d="M12.6 34.4Q5 36.6 3.4 31.6 2.6 28.4 5.4 27.8 4.8 30.8 7.4 32.2 9.6 33 12.4 31.4Z" fill="${c1}"/><path d="M3.4 27.8l-1.8-2.6 3.4.6Z" fill="${c2}"/></g>
 <g class="wg" style="transform-origin:19px 29px"><path d="M17.6 29Q11.4 19 15.6 11.4Q17.6 17 21.6 18.6Q22 24 20.6 29Z" fill="${d}"/></g>
 <g class="q2" style="transform-origin:14px 37px"><rect x="12.6" y="36" width="3.2" height="9" rx="1.5" fill="${d}"/></g>
 <g class="q4" style="transform-origin:24px 37px"><rect x="22.6" y="36" width="3.2" height="9" rx="1.5" fill="${d}"/></g>
 <ellipse cx="19" cy="35" rx="8.6" ry="6.2" fill="${c1}"/><ellipse cx="20" cy="37.6" rx="6.4" ry="3.2" fill="${c2}"/>
 <path d="M12 30.4l1.4-2.4 1 2.4ZM15.4 29.2l1.4-2.6 1 2.6ZM19 28.8l1.4-2.6 1 2.6Z" fill="${c2}"/>
 <g class="q1" style="transform-origin:15px 38px"><rect x="13.4" y="37" width="3.4" height="8.6" rx="1.6" fill="${c1}"/></g>
 <g class="q3" style="transform-origin:25px 38px"><rect x="23.4" y="37" width="3.4" height="8.6" rx="1.6" fill="${c1}"/></g>
 <g class="hc" style="transform-origin:25px 31px"><path d="M23.4 32Q25.6 25 28.6 21.6l3 2.2Q28.8 27.6 27.6 33.4Z" fill="${c1}"/><ellipse cx="31" cy="21" rx="4.8" ry="3.8" fill="${c1}"/><ellipse cx="34.8" cy="22.6" rx="2.6" ry="1.9" fill="${l}"/><path d="M28.4 18.4l-2.6-3.8 3.8 2.6ZM30.6 17.8l-1-4.2 2.6 3.4Z" fill="${c2}"/><ellipse cx="31.6" cy="20.4" rx="1.05" ry="1.35" fill="#111"/><circle cx="31.9" cy="19.9" r=".4" fill="#fff"/><circle cx="36.4" cy="22" r=".35" fill="#111"/>
  <g class="pj" style="transform-origin:37px 22.6px"><path d="M36.8 22.6Q41 19.6 46.4 21.8Q42.6 22.6 46.6 24.8Q41.4 25.8 36.8 23.4Z" fill="#ffb02e"/><path d="M37 22.8Q40 21.6 43 22.6Q40.4 23.4 37 23.2Z" fill="#fff1a8"/></g></g>
 <g class="wg" style="transform-origin:20px 29px"><path d="M18.6 29.4Q12.6 17 19.6 9Q20.4 15.6 26.6 17.6Q24.8 23.6 23 29.4Z" fill="${l}"/><path d="M19.6 9.6Q21.4 18 22.4 29" stroke="${d}" stroke-width=".5" fill="none"/></g></g>`;
}
function phoenixSVG(c1,c2){
 return`<ellipse class="shadow" cx="20" cy="46.4" rx="6" ry="1.2"/><g class="wh"><g class="fly">
 <g class="tl" style="transform-origin:14px 28px"><path d="M14.4 27.6Q6 30 1.4 38.4Q6.4 33.8 10.6 33Q5.6 37.4 4.6 43Q9.6 36 15.6 30.4Z" fill="${c2}"/><path d="M14.4 28.2Q8.6 31.4 6 36.6Q10 33 15 30Z" fill="${c1}"/></g>
 <g class="wg" style="transform-origin:19px 25px"><path d="M18 25.4Q12 14.6 6.4 13.4Q10.4 18.4 9.4 20.4Q13 21 17.6 27Z" fill="${shd(c1,-.2)}"/></g>
 <ellipse cx="20.4" cy="27" rx="6.4" ry="4.2" fill="${c1}"/><ellipse cx="21.6" cy="28.6" rx="4.2" ry="2.2" fill="${c2}"/>
 <circle cx="27" cy="22.6" r="3.4" fill="${c1}"/><path d="M30 22.2l2.8.9-2.6 1.2Z" fill="#ffd35a"/><ellipse cx="28" cy="22" rx=".8" ry="1.05" fill="#111"/><circle cx="28.25" cy="21.6" r=".3" fill="#fff"/>
 <path d="M25.6 19.6Q24.6 15.4 27 14.2Q26.6 17 28.6 15Q28.2 17.8 29.6 17.4Q28.4 19.4 27.2 19.8Z" fill="${c2}"/>
 <path d="M19.6 31l-.6 3.4M22 31l.4 3.4" stroke="#c9822a" stroke-width=".8"/>
 <g class="wg" style="transform-origin:21px 25px"><path d="M20 25.6Q15.6 11.6 8.8 8.4Q14 14.8 12.8 17.2Q17 18.2 21.6 26.8Z" fill="${c1}"/><path d="M20.2 25Q16.6 15.4 11.6 11.4" stroke="${c2}" stroke-width=".6" fill="none"/></g>
 <g class="pj" style="transform-origin:21px 26px"><circle cx="21" cy="26" r="11" fill="none" stroke="${c2}" stroke-width="1.2"/></g></g></g>`;
}
function kitsuneSVG(c1,c2){
 const tails=[...Array(9)].map((_,i)=>{const a=-80+i*14;return`<g transform="rotate(${a})"><path d="M0 0Q-2.8-6 0-12.6Q2.8-6 0 0Z" fill="${c1}" stroke="${shd(c1,-.18)}" stroke-width=".3"/><path d="M0-9.8Q-1.1-11.2 0-12.6Q1.1-11.2 0-9.8Z" fill="${c2}"/></g>`}).join('');
 return`<ellipse class="shadow" cx="20" cy="46.4" rx="10" ry="1.5"/><g class="wh">
 <g class="tl" style="transform-origin:13px 35px"><g transform="translate(13 35)">${tails}</g></g>
 <g class="q2" style="transform-origin:15px 38px"><rect x="14" y="37.4" width="2.2" height="8" rx="1" fill="${shd(c1,-.12)}"/></g>
 <g class="q4" style="transform-origin:24px 38px"><rect x="23" y="37.4" width="2.2" height="8" rx="1" fill="${shd(c1,-.12)}"/></g>
 <ellipse cx="19.6" cy="37" rx="7.4" ry="4.2" fill="${c1}"/>
 <g class="q1" style="transform-origin:16px 39px"><rect x="15" y="38.4" width="2.3" height="7.6" rx="1" fill="${c1}"/><rect x="14.8" y="44.2" width="2.8" height="1.6" rx=".6" fill="${c2}"/></g>
 <g class="q3" style="transform-origin:25px 39px"><rect x="24" y="38.4" width="2.3" height="7.6" rx="1" fill="${c1}"/><rect x="23.8" y="44.2" width="2.8" height="1.6" rx=".6" fill="${c2}"/></g>
 <g class="hc" style="transform-origin:25px 34px"><path d="M23.4 35Q25.4 30 28 28.4L30 31Q28 33 27.4 37Z" fill="${c1}"/><ellipse cx="29.6" cy="29" rx="4" ry="3.3" fill="${c1}"/><path d="M31.6 29.2l4.4 1.2-4 1.4Z" fill="${c1}"/><circle cx="35.9" cy="30.4" r=".5" fill="#111"/><path d="M27 27l-.6-4.6 2.8 3.2ZM29.6 26.4l.8-4.6 1.4 4Z" fill="${c1}"/><path d="M27.3 26.4l-.3-2.4 1.4 1.6Z" fill="${c2}"/><ellipse cx="30.4" cy="28.6" rx=".8" ry="1" fill="#2a1a10"/><circle cx="30.6" cy="28.2" r=".3" fill="#fff"/><path d="M28.4 31.4q1.6 1 3.4.4" stroke="${c2}" stroke-width=".6" fill="none"/></g>
 <g class="pj"><circle class="o1" cx="10" cy="24" r="1.8" fill="#6fd0ff"/><circle class="o2" cx="20" cy="20" r="1.6" fill="#9be3ff"/><circle class="o3" cx="30" cy="20" r="1.8" fill="#6fd0ff"/></g></g>`;
}
function krakenSVG(c1,c2){
 const tent=[13,16,19,22,25,28].map((x,i)=>`<g class="tn" style="transform-origin:${x}px 31px;animation-delay:${(-i*.18).toFixed(2)}s"><path d="M${x-1.4} 30Q${x-2.4} 37 ${x+(i%2?1.6:-1.6)} 42.6Q${x+(i%2?3.4:.2)} 45.4 ${x+(i%2?4:-.4)} 43Q${x+(i%2?2.4:-.6)} 42.6 ${x+(i%2?2.6:.4)} 40Q${x+1.4} 35 ${x+1.4} 30Z" fill="${i%2?shd(c1,-.12):c1}"/></g>`).join('');
 return`<ellipse class="shadow" cx="20" cy="46.4" rx="10" ry="1.6"/><g class="wh">${tent}
 <path d="M11 30Q10 14.4 20.4 14Q30.6 14.4 29.6 30Q20 33.4 11 30Z" fill="${c1}"/><circle cx="14.6" cy="20.6" r="1.4" fill="${c2}" opacity=".7"/><circle cx="25.6" cy="18.4" r="1.1" fill="${c2}" opacity=".7"/><circle cx="17.6" cy="16.6" r=".9" fill="${c2}" opacity=".7"/>
 <ellipse cx="17" cy="25" rx="2.4" ry="2.8" fill="#fff"/><ellipse cx="24" cy="25" rx="2.4" ry="2.8" fill="#fff"/><circle cx="17.8" cy="25.6" r="1.3" fill="#1a1030"/><circle cx="24.8" cy="25.6" r="1.3" fill="#1a1030"/><circle cx="18.2" cy="25.1" r=".45" fill="#fff"/><circle cx="25.2" cy="25.1" r=".45" fill="#fff"/><ellipse cx="14.6" cy="28" rx="1.2" ry=".5" fill="#ff8ab6" opacity=".5"/><ellipse cx="26.4" cy="28" rx="1.2" ry=".5" fill="#ff8ab6" opacity=".5"/>
 <path d="M19.4 28.6q1.4 1 2.8 0" stroke="#1a1030" stroke-width=".6" fill="none"/></g>`;
}
function petClass(p){const L=p.look||{};return'pt'+(p.cr?' cr cr-'+p.cr:'')+(L.it2&&p.act==='swing'?' dual':'')+(L.extra?' ex-'+L.extra:'')}
function petSVG(p,state){const L=p.look||{};let inner,vb='0 0 40 48';
 if(p.cr==='dragon')inner=dragonSVG(L.c1,L.c2);else if(p.cr==='phoenix')inner=phoenixSVG(L.c1,L.c2);else if(p.cr==='kitsune')inner=kitsuneSVG(L.c1,L.c2);else if(p.cr==='kraken')inner=krakenSVG(L.c1,L.c2);
 else{inner=humanSVG(Object.assign({act:p.act},L));if(L.extra==='elephant')vb='-23 0 63 48'}
 return`<svg class="${petClass(p)} ${state||''}" viewBox="${vb}" aria-hidden="true">${inner}</svg>`;
}

/* ================= marcos ================= */
function frameSVG(id){const P=(a,r)=>{const t=a*Math.PI/180;return[(60+r*Math.sin(t)).toFixed(2),(60-r*Math.cos(t)).toFixed(2)]};
 const ring=(r,c,w,x='')=>`<circle cx="60" cy="60" r="${r}" fill="none" stroke="${c}" stroke-width="${w}" ${x}/>`;let s='';
 switch(id){
  case'mk_laurel':for(const sd of[-1,1])for(let k=0;k<10;k++){const a=180+sd*(22+k*14);const r=50+(k%2?2.6:-2.6);const[x,y]=P(a,r);s+=`<ellipse cx="${x}" cy="${y}" rx="6.4" ry="2.6" transform="rotate(${(a+(sd<0?-90:90)+(k%2?24:-24)).toFixed(1)} ${x} ${y})" fill="${k%2?'#5f9a3a':'#86c45a'}"/>`}s+=`<path d="M52 106l8 6 8-6-3 9-5-3-5 3Z" fill="#c0392b"/>`;break;
  case'mk_hierro':s=ring(50,'#5d6570',9)+ring(54.6,'#3b4048',1.6)+ring(45.4,'#8a929c',1.2);for(let k=0;k<12;k++){const[x,y]=P(k*30,50);s+=`<circle cx="${x}" cy="${y}" r="2.3" fill="#c3c9d0" stroke="#3b4048" stroke-width=".6"/>`}break;
  case'mk_bambu':s=ring(50,'#7fae4a',7)+ring(50,'#a6d36c',1.4);for(let k=0;k<16;k++){const[a,b]=P(k*22.5,45.6),[c,d]=P(k*22.5,54.4);s+=`<path d="M${a} ${b}L${c} ${d}" stroke="#3f6a22" stroke-width="2"/>`}for(const a of[40,140,220,320]){const[x,y]=P(a,57);s+=`<ellipse cx="${x}" cy="${y}" rx="6" ry="2" transform="rotate(${a-60} ${x} ${y})" fill="#5f9a3a"/>`}break;
  case'mk_llamas':s=ring(49,'#ff7a1a',4);for(let k=0;k<16;k++)s+=`<g transform="rotate(${k*22.5} 60 60)"><path class="fl" style="animation-delay:${(-k*.13).toFixed(2)}s" d="M55.6 12.4Q54.4 4 60-2.4Q61.2 5 64.4 12.4Z" fill="#ff7a1a"/><path class="fl" style="animation-delay:${(-k*.17).toFixed(2)}s" d="M58 12.4Q57.8 7 60 3.4Q61 8 62 12.4Z" fill="#ffd35a"/></g>`;break;
  case'mk_escarcha':s=ring(50,'#9fdcff',4)+ring(54,'#dff4ff',1);for(let k=0;k<8;k++)s+=`<g transform="rotate(${k*45+22.5} 60 60)"><path d="M60-2l3.2 9.6-3.2 4.4-3.2-4.4Z" fill="#dff4ff"/><path d="M60 12V-1" stroke="#9fdcff" stroke-width=".7"/></g>`;for(let k=0;k<8;k++){const[x,y]=P(k*45,50);s+=`<path class="tw" style="animation-delay:${(-k*.4).toFixed(1)}s" d="M${x} ${(+y-3).toFixed(1)}l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z" fill="#fff"/>`}break;
  case'mk_egeo':s=ring(50,'#1f5fbf',9)+`<g class="rot">${ring(50,'#e9f6ff',2.4,'stroke-dasharray="7 6"')}</g>`+ring(55,'#7fb6ff',1.2)+ring(45,'#7fb6ff',1.2);break;
  case'mk_runico':{const R=['M-2-3v6M-2-3l4 2M-2 0l4 2','M-2 3V-3l4 3-4 3','M0-3v6M-3-1l3 2 3-2','M-2-3l4 6M2-3l-4 6','M-2-3v6M2-3v6M-2 0h4','M0-3v6M0-3l3 2'];s=`<g class="rot">${ring(48,'#2a2140',8)}${ring(52.6,'#e7c46a',1.6)}${ring(43.4,'#e7c46a',1.6)}`;for(let k=0;k<12;k++){const[x,y]=P(k*30,48);s+=`<path transform="translate(${x} ${y}) rotate(${k*30})" d="${R[k%R.length]}" stroke="#e7c46a" stroke-width="1" fill="none" stroke-linecap="round"/>`}s+='</g>';break}
  case'mk_coliseo':s=ring(49,'#d9c7a0',13)+ring(55.6,'#b8a37a',1.2)+ring(42.4,'#b8a37a',1.2);for(let k=0;k<18;k++)s+=`<g transform="rotate(${k*20} 60 60)"><path d="M57.6 15.6V12.2a2.4 2.4 0 0 1 4.8 0V15.6Z" fill="#5a4a32"/></g>`;break;
  case'mk_faraon':s=ring(50,'#e2b54a',10)+ring(50,'#2346a8',10,'stroke-dasharray="5.24 5.24"')+ring(55.6,'#e2b54a',1.4)+ring(44.4,'#e2b54a',1.4)+`<circle cx="60" cy="8" r="4.2" fill="#e2463a"/><path d="M42 9q9-6 13.4-.6M78 9q-9-6-13.4-.6" stroke="#e2b54a" stroke-width="2.6" fill="none"/>`;break;
  case'mk_prisma':s='<g class="rot">';for(let k=0;k<12;k++){const[a,b]=P(k*30,50),[c,d]=P(k*30+30.5,50);s+=`<path d="M${a} ${b}A50 50 0 0 1 ${c} ${d}" stroke="hsl(${k*30} 90% 64%)" stroke-width="7" fill="none"/>`}s+='</g>'+ring(55,'#ffffff',.8,'opacity=".6"');for(let k=0;k<6;k++){const[x,y]=P(k*60+15,57);s+=`<path class="tw" style="animation-delay:${(-k*.3).toFixed(1)}s" d="M${x} ${(+y-3.4).toFixed(1)}l.9 2.5 2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9Z" fill="#fff"/>`}break;
  case'mk_eclipse':s=`<g class="pulse">`;for(let k=0;k<24;k++){const[a,b]=P(k*15,55),[c,d]=P(k*15,k%2?60:64);s+=`<path d="M${a} ${b}L${c} ${d}" stroke="#ffd36b" stroke-width="1.6" stroke-linecap="round"/>`}s+='</g>'+ring(50,'#140c24',9)+ring(55,'#ffd36b',1.8)+ring(45.6,'#ffd36b',.8,'opacity=".7"');break;
 }
 return`<svg class="frm" viewBox="-4 -4 128 128" aria-hidden="true">${s}</svg>`;
}

/* ================= cofres ================= */
const CH_COL={raro:['#5a3b22','#4f8ef7','#a9cbff'],epico:['#36254f','#b583ff','#e2ccff'],legendario:['#4a2a14','#f5b83d','#ffe7a6'],mitico:['#1a1030','#ff5a8a','#ffd1e0']};
function chestSVG(t,cls){const[w,m,l]=CH_COL[t];const gem=t==='legendario'||t==='mitico';
 const rays=[...Array(12)].map((_,i)=>{const a=i*Math.PI/6;return`<path d="M50 42L${(50+64*Math.sin(a-.11)).toFixed(1)} ${(42-64*Math.cos(a-.11)).toFixed(1)}L${(50+64*Math.sin(a+.11)).toFixed(1)} ${(42-64*Math.cos(a+.11)).toFixed(1)}Z" fill="${l}" opacity=".32"/>`}).join('');
 return`<svg class="chest ch-${t} ${cls||''}" viewBox="0 0 100 92" aria-hidden="true"><g class="rays" style="transform-origin:50px 42px">${rays}</g>
 <ellipse cx="50" cy="86" rx="38" ry="4" fill="rgba(0,0,0,.35)"/><rect x="12" y="44" width="76" height="40" rx="5" fill="${w}"/><path d="M12 57h76M12 71h76" stroke="${shd(w,-.3)}" stroke-width="1.2"/>
 <rect x="20" y="44" width="8" height="40" fill="${m}"/><rect x="72" y="44" width="8" height="40" fill="${m}"/><rect x="12" y="44" width="76" height="4" fill="${shd(m,-.2)}"/>
 <g class="glow" opacity="0"><ellipse cx="50" cy="44" rx="34" ry="5" fill="${l}"/></g>
 <g class="lid" style="transform-origin:12px 44px"><path d="M12 46V32Q50 8 88 32V46Z" fill="${shd(w,.12)}"/><path d="M20 46V27.6Q24 25.6 28 23.8V46ZM72 46V23.8Q76 25.6 80 27.6V46Z" fill="${m}"/><path d="M12 32Q50 8 88 32" stroke="${m}" stroke-width="2.4" fill="none"/>${gem?`<path d="M50 16l4.4 4.4-4.4 4.4-4.4-4.4Z" fill="${l}"/>`:''}</g>
 <rect x="43" y="38" width="14" height="16" rx="2.4" fill="${m}"/><circle cx="50" cy="44.6" r="2" fill="${shd(w,-.45)}"/><path d="M48.9 45.6h2.2l.7 4.2h-3.6Z" fill="${shd(w,-.45)}"/>
 ${t==='mitico'?'<path class="tw" d="M16 18l1 2.8 2.8 1-2.8 1-1 2.8-1-2.8-2.8-1 2.8-1Z" fill="#fff"/><path class="tw" style="animation-delay:-.6s" d="M86 10l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z" fill="#fff"/><path class="tw" style="animation-delay:-1.1s" d="M92 40l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z" fill="#fff"/>':''}</svg>`;
}

/* ================= fondos de página ================= */
const svgUri=s=>`url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const ARAUCARIA=svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 170" preserveAspectRatio="xMidYMax slice"><path d="M0 120L40 80 70 100 110 60 150 95 190 55 240 100 280 70 330 105 370 75 400 95V170H0Z" fill="#1a3340"/><path d="M110 60l-10 10h20ZM190 55l-12 12h24ZM280 70l-10 10h20Z" fill="#cfe3ea"/>${[[40,40],[120,25],[205,45],[300,30],[372,50]].map(([x,t])=>`<g transform="translate(${x} ${t})"><rect x="-1.6" y="10" width="3.2" height="140" fill="#06100b"/><path d="M-34 18q34-16 68 0q-34-6-68 0ZM-26 6q26-12 52 0q-26-5-52 0ZM-16-4q16-8 32 0q-16-3-32 0ZM-30 30q30-12 60 0q-30-5-60 0Z" fill="#06100b"/></g>`).join('')}<path d="M0 150Q100 138 200 148T400 146V170H0Z" fill="#06100b"/></svg>`);
const FIORDO=svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 170" preserveAspectRatio="xMidYMax slice"><path d="M0 110L60 40 110 90 170 30 230 95 300 35 360 85 400 60V170H0Z" fill="#2b4a66"/><path d="M60 40l-14 16h28ZM170 30l-16 18h32ZM300 35l-15 17h30Z" fill="#e8f2fa"/><path d="M0 130L50 95 120 135 200 90 270 140 340 100 400 130V170H0Z" fill="#132a40"/><rect y="148" width="400" height="22" fill="#0b1c2c"/><path d="M0 154h400M40 160h300" stroke="#3b6a8f" stroke-width="1" opacity=".5"/></svg>`);
const TEMPLO=svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 170" preserveAspectRatio="xMidYMax slice"><circle cx="300" cy="90" r="40" fill="#ffb35a" opacity=".55"/><g fill="#1a0d12"><path d="M90 70L200 40 310 70Z"/><rect x="92" y="70" width="216" height="10"/>${[100,130,160,190,220,250,280].map(x=>`<rect x="${x+2}" y="82" width="12" height="62"/>`).join('')}<rect x="84" y="144" width="232" height="8"/><rect x="74" y="152" width="252" height="18"/><rect y="160" width="400" height="10"/></g></svg>`);
const VOLCAN=svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 170" preserveAspectRatio="xMidYMax slice"><g fill="#6b6f78" opacity=".35"><circle cx="196" cy="30" r="14"/><circle cx="214" cy="18" r="12"/><circle cx="232" cy="8" r="10"/></g><path d="M60 170L180 52H220L340 170Z" fill="#1a0f12"/><path d="M180 52H220L212 62Q200 56 188 62Z" fill="#ff6a2a"/><path d="M196 60Q190 90 182 120M206 62Q214 96 226 130" stroke="#ff7a2a" stroke-width="2" fill="none" opacity=".8"/><path d="M0 150Q120 135 220 150T400 140V170H0Z" fill="#0d0708"/></svg>`);
const DUNAS=svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 170" preserveAspectRatio="xMidYMax slice"><circle cx="110" cy="80" r="46" fill="#ffcf6b" opacity=".7"/><path d="M220 140L270 70 320 140ZM290 140L330 86 370 140Z" fill="#7a4a1c"/><path d="M270 70L320 140H290Z" fill="#5a3412"/><path d="M0 140Q90 115 180 138T400 128V170H0Z" fill="#a8702a"/><path d="M0 155Q120 140 240 156T400 150V170H0Z" fill="#7a5020"/></svg>`);
const FONDO_BG={
 arena:`radial-gradient(120% 60% at 50% 0%,rgba(255,170,80,.32),transparent 60%),radial-gradient(90% 40% at 50% 105%,rgba(190,120,60,.4),transparent 70%),linear-gradient(180deg,#22160c,#120c07)`,
 bosque:`${ARAUCARIA} bottom center/100% auto no-repeat,radial-gradient(80% 50% at 70% 10%,rgba(120,200,255,.18),transparent 70%),linear-gradient(180deg,#0b1a26,#0e2230 55%,#0a1712)`,
 dojo:`radial-gradient(40% 30% at 20% 20%,rgba(255,180,90,.25),transparent 70%),radial-gradient(40% 30% at 80% 22%,rgba(255,180,90,.22),transparent 70%),repeating-linear-gradient(90deg,#24160c 0 26px,#1a0f07 26px 28px),#1a0f07`,
 fiordo:`${FIORDO} bottom center/100% auto no-repeat,linear-gradient(180deg,#0a1626,#132c48 60%,#0b1c2c)`,
 dunas:`${DUNAS} bottom center/100% auto no-repeat,linear-gradient(180deg,#2a1608,#5a3412 60%,#7a5020)`,
 templo:`${TEMPLO} bottom center/100% auto no-repeat,linear-gradient(180deg,#1a0a1e,#5a1e2a 50%,#b5532a 85%,#1a0d12)`,
 volcan:`${VOLCAN} bottom center/100% auto no-repeat,radial-gradient(70% 40% at 50% 80%,rgba(255,90,30,.35),transparent 70%),linear-gradient(180deg,#120608,#2a0d0c 60%,#0d0708)`,
 nebulosa:`radial-gradient(1.2px 1.2px at 20% 30%,#fff,transparent),radial-gradient(1px 1px at 70% 20%,#fff,transparent),radial-gradient(1.4px 1.4px at 40% 70%,#fff,transparent),radial-gradient(1px 1px at 85% 60%,#fff,transparent),radial-gradient(1.2px 1.2px at 10% 85%,#fff,transparent),radial-gradient(60% 40% at 25% 30%,rgba(255,90,170,.35),transparent 70%),radial-gradient(60% 45% at 75% 65%,rgba(90,140,255,.35),transparent 70%),radial-gradient(40% 30% at 60% 20%,rgba(150,90,255,.3),transparent 70%),#07051a`,
 aurora:`linear-gradient(115deg,transparent 20%,rgba(62,207,142,.38) 35%,transparent 48%,rgba(150,90,255,.32) 62%,transparent 76%),radial-gradient(1px 1px at 15% 20%,#fff,transparent),radial-gradient(1px 1px at 60% 12%,#fff,transparent),radial-gradient(1px 1px at 85% 30%,#fff,transparent),linear-gradient(180deg,#040b16,#0a1a2a 70%,#06101a)`
};

/* ================= estilos del módulo ================= */
(function(){const css=`
.pt{overflow:visible;display:block}.pt g{transform-box:view-box}.pt .shadow{fill:rgba(0,0,0,.3)}
.pt .lb{transform-origin:19.4px 31px}.pt .lf{transform-origin:21.2px 31px}.pt .ab{transform-origin:17.4px 20.2px}.pt .af{transform-origin:22.6px 20.2px}
.pt .it{transform-origin:22.6px 30.4px}.pt .it2{transform-origin:17.4px 30.4px}.pt .wh{transform-origin:20px 46px}.pt .hd{transform-origin:20px 18px}.pt .cp{transform-origin:20px 19px}.pt .sh{transform-origin:15px 26px}
.pt .pj{opacity:0}.pt.cr-phoenix .fly{transform-origin:20px 26px}
@keyframes pk-leg{0%,100%{transform:rotate(24deg)}50%{transform:rotate(-24deg)}}
@keyframes pk-arm{0%,100%{transform:rotate(-16deg)}50%{transform:rotate(16deg)}}
@keyframes pk-bob{0%,50%,100%{transform:translateY(0)}25%,75%{transform:translateY(-.9px)}}
@keyframes pk-br{0%,100%{transform:translateY(0)}50%{transform:translateY(-.6px)}}
@keyframes pk-cape{0%,100%{transform:rotate(2deg)}50%{transform:rotate(9deg)}}
@keyframes pk-hdb{0%,100%{transform:rotate(0)}50%{transform:rotate(-3deg)}}
.pt.walk .lf{animation:pk-leg .64s ease-in-out infinite}.pt.walk .lb{animation:pk-leg .64s ease-in-out -.32s infinite}
.pt.walk .af{animation:pk-arm .64s ease-in-out -.32s infinite}.pt.walk .ab{animation:pk-arm .64s ease-in-out infinite}
.pt.walk .wh{animation:pk-bob .64s linear infinite}.pt.walk .cp{animation:pk-cape .64s ease-in-out infinite}
.pt.idle .wh{animation:pk-br 2.6s ease-in-out infinite}.pt.idle .cp{animation:pk-cape 3s ease-in-out infinite}.pt.idle .hd{animation:pk-hdb 3.4s ease-in-out infinite}
@keyframes pk-leg2{0%,100%{transform:rotate(40deg)}50%{transform:rotate(-40deg)}}
@keyframes pk-arm2{0%,100%{transform:rotate(-46deg)}50%{transform:rotate(36deg)}}
@keyframes pk-runb{0%,50%,100%{transform:translateY(0) rotate(7deg)}25%,75%{transform:translateY(-1.6px) rotate(7deg)}}
.pt.act-run .lf{animation:pk-leg2 .38s linear infinite}.pt.act-run .lb{animation:pk-leg2 .38s linear -.19s infinite}
.pt.act-run .af{animation:pk-arm2 .38s linear -.19s infinite}.pt.act-run .ab{animation:pk-arm2 .38s linear infinite}
.pt.act-run .wh{animation:pk-runb .38s linear infinite}.pt.act-run .cp{animation:pk-cape .38s linear infinite}
@keyframes pk-swA{0%,100%{transform:rotate(-10deg)}30%{transform:rotate(-200deg)}48%,62%{transform:rotate(-60deg)}}
@keyframes pk-swI{0%,100%{transform:rotate(0)}30%{transform:rotate(20deg)}48%,62%{transform:rotate(150deg)}}
@keyframes pk-guard{0%,100%{transform:rotate(-25deg)}50%{transform:rotate(-45deg)}}
@keyframes pk-lunge{0%,100%{transform:none}48%,62%{transform:translateX(1.5px) rotate(4deg)}}
.pt.act-swing .af{animation:pk-swA 1.1s cubic-bezier(.5,0,.3,1) infinite}.pt.act-swing .it{animation:pk-swI 1.1s cubic-bezier(.5,0,.3,1) infinite}
.pt.act-swing .ab{animation:pk-guard 1.1s ease-in-out infinite}.pt.act-swing .wh{animation:pk-lunge 1.1s ease-in-out infinite}
.pt.dual.act-swing .ab{animation:pk-swA 1.1s cubic-bezier(.5,0,.3,1) -.55s infinite}.pt.dual.act-swing .it2{animation:pk-swI 1.1s cubic-bezier(.5,0,.3,1) -.55s infinite}
@keyframes pk-thA{0%,100%{transform:rotate(-25deg)}35%{transform:translateX(-1.5px) rotate(-70deg)}50%,64%{transform:translateX(3px) rotate(-92deg)}}
@keyframes pk-thI{0%,100%{transform:rotate(0)}35%{transform:rotate(125deg)}50%,64%{transform:rotate(157deg)}}
.pt.act-thrust .af{animation:pk-thA 1.2s ease-in-out infinite}.pt.act-thrust .it{animation:pk-thI 1.2s ease-in-out infinite}.pt.act-thrust .ab{animation:pk-guard 1.2s ease-in-out infinite}
@keyframes pk-lift{0%,100%{transform:rotate(0)}40%,60%{transform:rotate(-172deg)}}
.pt.act-lift .af,.pt.act-lift .ab{animation:pk-lift 1.5s ease-in-out infinite}
@keyframes pk-push{0%,100%{transform:translate(-11px,0) rotate(64deg)}50%{transform:translate(-11px,0) rotate(72deg)}}
@keyframes pk-pushA{0%,100%{transform:rotate(-64deg)}50%{transform:rotate(-58deg)}}
.pt.act-pushup .wh{animation:pk-push 1.1s ease-in-out infinite}.pt.act-pushup .af,.pt.act-pushup .ab{animation:pk-pushA 1.1s ease-in-out infinite}
@keyframes pk-spinI{to{transform:rotate(360deg)}}
.pt.act-spin .af{transform:rotate(-70deg)}.pt.act-spin .it{animation:pk-spinI .5s linear infinite}.pt.act-spin .ab{transform:rotate(-30deg)}
@keyframes pk-bowA{0%,100%{transform:rotate(-5deg)}25%,80%{transform:rotate(-90deg)}}
@keyframes pk-bowI{0%,100%{transform:rotate(0)}25%,80%{transform:rotate(90deg)}}
@keyframes pk-bowB{0%,100%{transform:rotate(5deg)}25%{transform:rotate(-88deg)}50%,58%{transform:translateX(-2.4px) rotate(-82deg)}62%,80%{transform:rotate(-88deg)}}
@keyframes pk-arrow{0%,58%{opacity:0;transform:translateX(0)}60%{opacity:1;transform:translateX(0)}88%{opacity:1;transform:translateX(26px)}90%,100%{opacity:0;transform:translateX(26px)}}
.pt.act-bow .af{animation:pk-bowA 1.8s ease-in-out infinite}.pt.act-bow .it{animation:pk-bowI 1.8s ease-in-out infinite}.pt.act-bow .ab{animation:pk-bowB 1.8s ease-in-out infinite}.pt.act-bow .pj{animation:pk-arrow 1.8s linear infinite}
@keyframes pk-punA{0%,40%,100%{transform:rotate(-30deg)}15%{transform:rotate(-94deg)}}
@keyframes pk-punB{0%,50%,100%{transform:rotate(-30deg)}65%{transform:rotate(-94deg)}}
.pt.act-punch .af{animation:pk-punA .8s ease-out infinite}.pt.act-punch .ab{animation:pk-punB .8s ease-out infinite}.pt.act-punch .wh{animation:pk-bob .4s linear infinite}
@keyframes pk-thrA{0%,100%{transform:rotate(-10deg)}35%{transform:rotate(-210deg)}50%{transform:rotate(-70deg)}}
@keyframes pk-star{0%,48%{opacity:0;transform:translate(0,0)}50%{opacity:1;transform:translate(0,0)}85%{opacity:1;transform:translate(24px,2px)}86%,100%{opacity:0;transform:translate(24px,2px)}}
.pt.act-throw .af{animation:pk-thrA 1.2s ease-in infinite}.pt.act-throw .pj{animation:pk-star 1.2s linear infinite}.pt.act-throw .pjr{animation:pk-spinI .25s linear infinite}
@keyframes pk-jump{0%,100%{transform:translateY(0)}20%{transform:translateY(.8px)}45%{transform:translateY(-8px)}70%{transform:translateY(0)}}
@keyframes pk-stompL{0%,100%{transform:rotate(0)}30%,42%{transform:rotate(-62deg)}52%{transform:rotate(0)}}
@keyframes pk-stompW{0%,48%,100%{transform:translateY(0)}30%{transform:rotate(-6deg)}54%{transform:translateY(1px)}}
.pt.act-stomp .lf{animation:pk-stompL 1.3s ease-in infinite}.pt.act-stomp .wh{animation:pk-stompW 1.3s ease-in infinite}.pt.act-stomp .af,.pt.act-stomp .ab{transform:rotate(-40deg)}
@keyframes pk-flex{0%,100%{transform:rotate(-10deg)}30%,70%{transform:rotate(-140deg)}50%{transform:rotate(-128deg)}}
.pt.act-flex .af,.pt.act-flex .ab{animation:pk-flex 1.6s ease-in-out infinite}.pt.act-flex .wh{animation:pk-br .8s ease-in-out infinite}
@keyframes pk-sal{0%,100%{transform:rotate(-10deg)}20%,80%{transform:rotate(-158deg)}}
@keyframes pk-salI{0%,100%{transform:rotate(0)}20%,80%{transform:rotate(158deg)}}
.pt.act-salute .af{animation:pk-sal 2.4s ease-in-out infinite}.pt.act-salute .it{animation:pk-salI 2.4s ease-in-out infinite}.pt.act-salute .cp{animation:pk-cape 1.2s ease-in-out infinite}
@keyframes pk-pt{0%,100%{transform:rotate(-10deg)}25%,75%{transform:rotate(-95deg)}}
@keyframes pk-ptI{0%,100%{transform:rotate(0)}25%,75%{transform:rotate(185deg)}}
.pt.act-point .af{animation:pk-pt 2.2s ease-in-out infinite}.pt.act-point .it{animation:pk-ptI 2.2s ease-in-out infinite}.pt.act-point .hd{animation:pk-hdb 1.1s ease-in-out infinite}
@keyframes pk-rd{0%,100%{transform:rotate(-10deg)}25%,75%{transform:rotate(-55deg)}}
@keyframes pk-rdH{0%,100%{transform:rotate(0)}40%,60%{transform:rotate(7deg)}}
.pt.act-read .af{animation:pk-rd 2.6s ease-in-out infinite}.pt.act-read .hd{animation:pk-rdH 2.6s ease-in-out infinite}
@keyframes pk-ban{0%,100%{transform:rotate(-10deg)}20%,80%{transform:rotate(-160deg)}}
@keyframes pk-banI{0%,100%{transform:rotate(0)}20%,80%{transform:rotate(130deg)}40%{transform:rotate(118deg)}60%{transform:rotate(142deg)}}
.pt.act-banner .af{animation:pk-ban 2.4s ease-in-out infinite}.pt.act-banner .it{animation:pk-banI 2.4s ease-in-out infinite}
@keyframes pk-aim{0%,100%{transform:rotate(-10deg)}25%,80%{transform:rotate(-90deg)}}
@keyframes pk-aimI{0%,100%{transform:rotate(0)}25%,80%{transform:rotate(155deg)}}
@keyframes pk-smoke{0%,52%{opacity:0;transform:translateX(0)}55%{opacity:1}80%{opacity:0;transform:translateX(5px)}100%{opacity:0}}
.pt.act-aim .af{animation:pk-aim 2.2s ease-in-out infinite}.pt.act-aim .it{animation:pk-aimI 2.2s ease-in-out infinite}.pt.act-aim .ab{animation:pk-aim 2.2s ease-in-out infinite}.pt.act-aim .pj{animation:pk-smoke 2.2s linear infinite}
@keyframes pk-q{0%,100%{transform:rotate(18deg)}50%{transform:rotate(-18deg)}}
.pt.cr.walk .q1,.pt.cr.walk .q4,.pt.walk .e1{animation:pk-q .6s ease-in-out infinite}.pt.cr.walk .q2,.pt.cr.walk .q3,.pt.walk .e2{animation:pk-q .6s ease-in-out -.3s infinite}
@keyframes pk-flap{0%,100%{transform:rotate(0)}50%{transform:rotate(-22deg)}}
.pt.cr .wg{animation:pk-flap 1.6s ease-in-out infinite}.pt.cr-phoenix .wg{animation:pk-flap .55s ease-in-out infinite}
@keyframes pk-tail{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(6deg)}}
.pt.cr .tl,.pt .tr{animation:pk-tail 1.4s ease-in-out infinite}
@keyframes pk-hover{0%,100%{transform:translateY(0)}50%{transform:translateY(-2.4px)}}
.pt.cr-phoenix .fly{animation:pk-hover 1.4s ease-in-out infinite}
@keyframes pk-tn{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(9deg)}}
.pt.cr-kraken .tn{animation:pk-tn 1.1s ease-in-out infinite}.pt.cr.walk .wh{animation:pk-bob .6s linear infinite}
@keyframes pk-fireH{0%,100%{transform:rotate(0)}25%,75%{transform:rotate(-10deg)}}
@keyframes pk-fire{0%,22%{opacity:0;transform:scaleX(.2)}30%,70%{opacity:1;transform:scaleX(1)}78%,100%{opacity:0;transform:scaleX(1.2)}}
.pt.act-fire .hc{animation:pk-fireH 1.8s ease-in-out infinite}.pt.act-fire .pj{animation:pk-fire 1.8s ease-in-out infinite}
@keyframes pk-flare{0%{opacity:0;transform:scale(.3)}40%{opacity:.9}100%{opacity:0;transform:scale(1.5)}}
.pt.act-flare .pj{animation:pk-flare 1.2s ease-out infinite}.pt.act-flare .wg{animation:pk-flap .3s ease-in-out infinite}
@keyframes pk-orb{0%{opacity:0;transform:translateY(4px)}30%,70%{opacity:1}100%{opacity:0;transform:translateY(-8px)}}
.pt.act-orbs .pj{opacity:1}.pt.act-orbs .pj circle{opacity:0}.pt.act-orbs .o1{animation:pk-orb 1.6s ease-in-out infinite}.pt.act-orbs .o2{animation:pk-orb 1.6s ease-in-out -.5s infinite}.pt.act-orbs .o3{animation:pk-orb 1.6s ease-in-out -1s infinite}.pt.act-orbs .tl{animation:pk-tail .5s ease-in-out infinite}
.pt.act-wave .tn{animation:pk-tn .35s ease-in-out infinite}.pt.act-wave .wh{animation:pk-jump 1.2s ease-in-out infinite}
@keyframes pk-trunk{0%,100%{transform:rotate(0)}40%,60%{transform:rotate(-80deg)}}
.pt[class*="act-"] .tr{animation:pk-trunk 2s ease-in-out infinite}
@keyframes pk-flm{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.35)}}
.pt .flm{transform-box:fill-box;transform-origin:50% 100%;animation:pk-flm .4s ease-in-out infinite}
#pets{position:fixed;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 2px);height:56px;pointer-events:none;z-index:40;overflow:hidden}
.pet{position:absolute;bottom:0;left:0;height:46px;will-change:transform}.pet svg{height:100%;width:auto}.pet.flip svg{transform:scaleX(-1)}
.pet.r-l svg{filter:drop-shadow(0 0 2px rgba(245,184,61,.6))}.pet.r-m svg{filter:drop-shadow(0 0 3px rgba(255,90,138,.8))}
body.has-pets{padding-bottom:120px!important}
.pet-ic svg.pt{height:40px;width:auto}.icon .chest{width:38px;height:auto}.icon .frm{width:40px;height:40px}
.frm{display:block;overflow:visible}.frm g{transform-box:view-box}.frm .rot{transform-origin:60px 60px;animation:auRot 30s linear infinite}.frm .pulse{transform-origin:60px 60px;animation:auPulse 2s ease-in-out infinite alternate}
.frm .fl{transform-box:fill-box;transform-origin:50% 100%;animation:frFl .7s ease-in-out infinite alternate}@keyframes frFl{from{transform:scaleY(.75)}to{transform:scaleY(1.15)}}
.tw{animation:tw 1.6s ease-in-out infinite}@keyframes tw{0%,100%{opacity:.15}50%{opacity:1}}
.embwrap{position:relative;isolation:isolate;background:none;border:0;padding:0;color:inherit;display:block;cursor:pointer}
.embwrap>.frm{position:absolute;left:50%;top:50%;width:150%;height:auto;aspect-ratio:1;transform:translate(-50%,-50%);z-index:-1;pointer-events:none}
.ava{position:relative;isolation:isolate;width:var(--sz);height:var(--sz);flex:none;display:grid;place-items:center}
.ava>.frm{position:absolute;left:50%;top:50%;width:142%;height:142%;transform:translate(-50%,-50%);z-index:1;pointer-events:none}
.ava-in{width:100%;height:100%;border-radius:50%;display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle at 30% 25%,color-mix(in oklab,var(--rc,#8a93ad) 40%,var(--surface-3)),var(--surface-2));border:2px solid color-mix(in oklab,var(--rc,#8a93ad) 60%,transparent)}
.ava-in>.emb{width:66%;height:auto;animation:none}.ava-in>.pt{height:84%;width:auto;margin-top:12%}.ava-emo{font-size:calc(var(--sz)*.5);line-height:1}
.embwrap::before,.ava::before{content:"";position:absolute;inset:-14%;border-radius:50%;z-index:-2;pointer-events:none;opacity:0}
@keyframes auRot{to{transform:rotate(360deg)}}@keyframes auPulse{from{transform:scale(.92);opacity:.65}to{transform:scale(1.06);opacity:1}}
.au-viento::before{opacity:1;background:conic-gradient(from 0deg,transparent 0 10%,rgba(220,240,255,.45) 18%,transparent 30% 50%,rgba(220,240,255,.4) 62%,transparent 75%);-webkit-mask:radial-gradient(closest-side,transparent 58%,#000 70%,transparent 100%);mask:radial-gradient(closest-side,transparent 58%,#000 70%,transparent 100%);animation:auRot 3s linear infinite}
.au-ignea::before{opacity:1;background:radial-gradient(closest-side,rgba(255,140,40,.6),rgba(255,80,20,.22) 60%,transparent 76%);animation:auPulse .9s ease-in-out infinite alternate}
.au-ignea>.emb,.au-ignea .ava-in{filter:drop-shadow(0 0 8px rgba(255,120,30,.85))}
.au-glacial::before{opacity:1;background:radial-gradient(closest-side,rgba(140,220,255,.55),rgba(80,160,255,.2) 60%,transparent 76%);animation:auPulse 2s ease-in-out infinite alternate}
.au-glacial>.emb,.au-glacial .ava-in{filter:drop-shadow(0 0 8px rgba(120,210,255,.9))}
.au-trueno::before{opacity:1;background:radial-gradient(closest-side,rgba(170,190,255,.55),transparent 72%);animation:auFlash 3s infinite}
.au-trueno>.emb,.au-trueno .ava-in{animation:auFlashF 3s infinite}
@keyframes auFlash{0%,7%,15%,62%,67%,100%{opacity:.12}8%,12%,64%{opacity:1}10%{opacity:.25}}
@keyframes auFlashF{0%,7%,15%,62%,67%,100%{filter:drop-shadow(0 0 4px rgba(150,170,255,.4))}8%,12%,64%{filter:drop-shadow(0 0 14px #c8d4ff) brightness(1.3)}}
.au-sombra::before{opacity:1;background:radial-gradient(closest-side,rgba(110,40,200,.6),rgba(40,10,80,.32) 60%,transparent 76%);animation:auPulse 2.2s ease-in-out infinite alternate}
.au-sombra>.emb,.au-sombra .ava-in{filter:drop-shadow(0 0 10px rgba(130,60,255,.75))}
.au-prisma::before{opacity:1;inset:-8%;background:conic-gradient(#ff5a8a,#f5b83d,#3ecf8e,#55a6ff,#b583ff,#ff5a8a);filter:blur(10px);animation:auRot 4s linear infinite}
.au-olimpo::before{opacity:1;inset:-24%;background:repeating-conic-gradient(rgba(255,215,110,.6) 0 4deg,transparent 4deg 15deg);-webkit-mask:radial-gradient(closest-side,#000 38%,transparent 100%);mask:radial-gradient(closest-side,#000 38%,transparent 100%);animation:auRot 14s linear infinite}
.au-olimpo>.emb,.au-olimpo .ava-in{filter:drop-shadow(0 0 10px rgba(255,210,100,.85))}
.sheet-x{position:relative;z-index:3}
.hero-lema{font-style:italic;color:var(--fg-2);font-size:13.5px;margin-top:4px}
body.has-bg{background:transparent!important}
body.has-bg::after{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none}
body.has-bg :is(.card,.kpi,.icard,.dex,.stat,.chcard){background:color-mix(in oklab,var(--surface) 86%,transparent);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
@keyframes bgDrift{0%,100%{transform:scale(1.08) translate(0,0)}50%{transform:scale(1.12) translate(-1.5%,1%)}}
@keyframes bgShimmer{0%,100%{transform:translateX(-4%) skewX(-4deg);opacity:.9}50%{transform:translateX(4%) skewX(4deg);opacity:1}}
body.bg-nebulosa::after{animation:bgDrift 40s ease-in-out infinite}body.bg-aurora::after{inset:-10%;animation:bgShimmer 14s ease-in-out infinite}
#fxl{position:fixed;inset:0;pointer-events:none;z-index:70;overflow:hidden}
.fxp{position:absolute;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;animation:fxp .85s cubic-bezier(.2,.7,.4,1) forwards}
@keyframes fxp{from{transform:translate(0,0) rotate(0) scale(1);opacity:1}to{transform:translate(var(--dx),var(--dy)) rotate(var(--r)) scale(.4);opacity:0}}
.fx-chispas{background:#ffd35a;box-shadow:0 0 6px #ff9a2a;width:4px;height:4px}.fx-petalos{background:#ffb7d0;border-radius:80% 0 80% 0;width:8px;height:6px}.fx-confeti{border-radius:1px;width:5px;height:8px}.fx-estrellas{background:none;color:#ffe28a;font-size:13px;width:auto;height:auto;text-shadow:0 0 6px #ffcf4a}
.chest{display:block;overflow:visible}.chest g{transform-box:view-box}.chest .rays{opacity:0}
.chest.shake{animation:chShake .5s ease-in-out infinite}@keyframes chShake{0%,100%{transform:rotate(0)}25%{transform:rotate(-4deg)}75%{transform:rotate(4deg)}}
.chest.idle{animation:chIdle 2.8s ease-in-out infinite}@keyframes chIdle{0%,84%,100%{transform:rotate(0)}88%{transform:rotate(-5deg)}92%{transform:rotate(5deg)}96%{transform:rotate(-2deg)}}
.chest.open .lid{transform:translate(-2px,-8px) rotate(-26deg)}.chest.open .glow{opacity:1}.chest.open .rays{opacity:1;animation:auRot 8s linear infinite}
.chest.ch-mitico{filter:drop-shadow(0 0 12px rgba(255,90,138,.65))}.chest.ch-legendario{filter:drop-shadow(0 0 8px rgba(245,184,61,.5))}
.chest.chbig{width:190px;height:auto}.chest.small{width:86px;height:auto}
.chgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}@media (max-width:540px){.chgrid{grid-template-columns:repeat(2,1fr)}}
.chcard{background:var(--surface);border:1px solid color-mix(in oklab,var(--rc) 45%,var(--line));border-radius:14px;padding:10px 8px;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center}
.chcard .chest{width:74px;height:auto}.chcard.empty .chest{filter:grayscale(1) brightness(.45)}.chcard b{font-size:13px}.chcard small{color:var(--fg-3)}
.pity{display:flex;gap:10px;flex-wrap:wrap}.pity .pbar{flex:1;min-width:150px}.pity .pbar span{font-size:12px;color:var(--fg-3)}.pity .track{height:7px;border-radius:4px;background:var(--surface-3);overflow:hidden;margin-top:4px}.pity .track i{display:block;height:100%;border-radius:4px}
.chest-stage{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}
.ch-tap{background:none;border:0;padding:0}
.ch-item{width:124px;height:124px;border-radius:26px;display:grid;place-items:center;font-size:62px;line-height:1;background:radial-gradient(circle at 30% 25%,color-mix(in oklab,var(--rc) 45%,var(--surface-3)),var(--surface-2));border:2px solid var(--rc);box-shadow:0 0 50px color-mix(in oklab,var(--rc) 55%,transparent);animation:pop .55s cubic-bezier(.2,1.4,.4,1)}
.ch-item .pt{height:100px;width:auto}.ch-item .ava{--sz:74px}.ch-item .chest{width:96px}
.ch-dots{display:flex;gap:5px}.ch-dots i{width:7px;height:7px;border-radius:50%;background:var(--line-2)}.ch-dots i.on{background:var(--accent)}
.ch-sum{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;width:100%}
.ch-sum .t{background:var(--surface-2);border:1px solid color-mix(in oklab,var(--rc) 50%,var(--line));border-radius:12px;padding:8px 6px;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11.5px;line-height:1.2;text-align:center}
.lema-q{font-style:italic;font-size:15px;color:var(--fg);max-width:30ch;line-height:1.35}
.fd-sw{width:100%;height:100%;border-radius:12px;background-size:cover!important}
.pet-stage{width:100%;display:grid;place-items:center;padding:10px 0 4px;border-radius:16px;background:radial-gradient(60% 70% at 50% 60%,color-mix(in oklab,var(--rc) 28%,transparent),transparent)}
.pet-big{height:150px!important;width:auto}
.feats-list{text-align:left;margin:0;padding-left:20px;display:flex;flex-direction:column;gap:5px;color:var(--fg-2);font-size:14px;align-self:stretch}
.dex-group{display:flex;flex-direction:column;gap:8px;margin-top:16px}.dex-gt{margin:0;font-family:var(--f-display);font-size:18px;font-weight:800;text-transform:uppercase;letter-spacing:.04em}
.dex .pet-ic{width:52px;height:52px}.dex .pet-ic svg.pt{height:46px}
.pf-card{position:relative;border:1px solid var(--line-2);border-radius:20px;padding:18px;overflow:hidden;isolation:isolate;background:linear-gradient(160deg,var(--surface-2),var(--surface))}
.pf-card::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,9,18,.15) 20%,rgba(6,9,18,.6));z-index:-1}
.pf-head{display:flex;gap:22px;align-items:center;flex-wrap:wrap;padding:10px 4px 0 10px}
.pf-name{font-size:clamp(30px,8vw,44px);margin:2px 0 4px;overflow-wrap:anywhere}
.pf-lema{font-style:italic;color:var(--fg);opacity:.85;margin-top:8px;max-width:42ch}
.pf-rank{display:flex;align-items:center;gap:12px;margin-top:18px;padding:12px;border-radius:14px;background:color-mix(in oklab,var(--bg) 62%,transparent);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.pf-rank>.emb{width:54px;height:60px;flex:none;animation:none}
.pf-bar{height:8px;border-radius:5px;background:var(--surface-3);overflow:hidden;margin:6px 0 4px}.pf-bar span{display:block;height:100%;background:linear-gradient(90deg,var(--accent-2),var(--accent))}
.pf-pets{display:flex;gap:16px;justify-content:center;margin-top:12px}.pf-pet{background:none;border:0;padding:0;height:72px}.pf-pet .pt{height:72px;width:auto}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}
.stat{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 12px;min-width:0}
.stat span{display:block;font-size:12px;color:var(--fg-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.stat b{font-family:var(--f-display);font-size:24px;font-weight:700}
.wk-bars{display:grid;grid-template-columns:repeat(8,1fr);gap:6px;align-items:end;height:130px}
.wk-bar{display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end;min-width:0}
.wk-bar i{display:block;width:100%;border-radius:6px 6px 2px 2px;background:var(--accent);min-height:3px}.wk-bar small{font-size:10px;color:var(--fg-3);white-space:nowrap}.wk-bar em{font-style:normal;font-size:10.5px;color:var(--fg-2)}
.badges{display:flex;flex-wrap:wrap;gap:8px}.badge-i{background:none;border:0;padding:0}
.pp-seg{flex-wrap:wrap}
.pp-opts{display:grid;grid-template-columns:repeat(auto-fill,minmax(98px,1fr));gap:8px}
.pp-opt{background:var(--surface-2);border:1px solid var(--line);border-radius:12px;padding:8px 6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;min-height:108px}
.pp-opt.on{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent) inset;background:color-mix(in oklab,var(--accent) 12%,var(--surface-2))}
.pp-opt small{font-size:11.5px;line-height:1.2}.pp-prev{width:58px;height:58px;display:grid;place-items:center;font-size:30px}
.pp-prev .pt{height:56px;width:auto}.pp-prev .ava{--sz:44px}.pp-prev .chest{width:54px}
@media (prefers-reduced-motion:reduce){.pt,.pt *,.frm *,.chest,.chest *,body.has-bg::after,.embwrap::before,.ava::before,.embwrap>.emb,.ava-in{animation:none!important}}
`;const st=document.createElement('style');st.textContent=css+Object.entries(FONDO_BG).map(([k,v])=>`body.bg-${k}::after,.pfbg-${k}{background:${v}}`).join('\n');document.head.appendChild(st)})();

/* ================= estado ================= */
const CHEST_Q=[];
function ensureChestState(){if(!S)return;S.equip=S.equip||{};const E=S.equip;E.pets=E.pets||[];for(const k of['avatar','marco','fondo','aura','fx','lema'])if(E[k]===undefined)E[k]=null;S.chestCycle=S.chestCycle||0;S.streakChests=S.streakChests||{};S.stats=S.stats||{missions:0,objectives:0};S.stats.chests=S.stats.chests||0;S.stats.chestTier=S.stats.chestTier||{}}
function owned(rid){return!!(S&&S.inventory.some(i=>i.rid===rid&&i.status==='active'))}
function nickOf(){return IS_WEB?((S.profile&&S.profile.nick)||''):(S.nick||'')}
const byRar=(a,b)=>RARITIES.indexOf((cref(b.rid)||b).rarity)-RARITIES.indexOf((cref(a.rid)||a).rarity);
function rollW(list){let x=Math.random();for(const[r,w]of list){if(x<w)return r;x-=w}return list[list.length-1][0]}

/* ================= otorgar y abrir cofres ================= */
function awardChest(tier,source,direct){
 ensureChestState();S.chestCycle++;const n=S.chestCycle;let t=tier,pity=false;
 if(n%30===0&&t!=='mitico'){t='mitico';pity=true}else if(n%10===0&&CH_TIERS.indexOf(t)<2){t='legendario';pity=true}
 const r=giveItem(cref('chest_'+t),source);if(pity)r.pity=true;
 if(!direct)CHEST_Q.push(r);return r;
}
function pickChestItem(rar,taken){
 const pool=[];for(const c of CH_DROPS){if(c.rarity!==rar)continue;if(UNIQ_DEX.includes(c.type)&&(S.pokedex[c.id]||taken.has(c.id)))continue;pool.push({c,w:c.type==='companero'?1.4:c.type==='item'?1.5:1})}
 return wpick(Math.random,pool,p=>p.w).c;
}
function openChest(iid){
 if(typeof needReady==='function'&&!needReady())return;ensureChestState();
 const inv=S.inventory.find(i=>i.iid===iid&&i.status==='active'&&i.type==='cofre');if(!inv)return;
 let tier=inv.rid.slice(6);const fort=(S.effects||[]).find(e=>e.type==='fortune'&&!e.consumed);let extraMyth=false;
 if(fort){fort.consumed=true;const k=CH_TIERS.indexOf(tier);if(k<3)tier=CH_TIERS[k+1];else extraMyth=true}
 const spec=CH_SPEC[tier];const t=today();const label='Cofre '+CH_NAME[tier];
 const pp=Math.round((spec.pp[0]+Math.random()*(spec.pp[1]-spec.pp[0]))/5)*5;addLedger(t,pp,'cofre',label);
 const taken=new Set();const items=[];
 spec.slots.forEach((sl,i)=>{let rar=typeof sl==='string'?sl:rollW(sl);if(extraMyth&&i===0)rar='mítico';const c=pickChestItem(rar,taken);taken.add(c.id);items.push(giveItem(c,label))});
 items.sort((a,b)=>RARITIES.indexOf(a.rarity)-RARITIES.indexOf(b.rarity));
 inv.status='used';inv.used=t;S.stats.chests++;S.stats.chestTier[tier]=(S.stats.chestTier[tier]||0)+1;
 const best=items[items.length-1];
 if(tier!=='raro'||RARITIES.indexOf(best.rarity)>=4)addFeat({date:t,kind:'cofre',title:`Cofre ${CH_NAME[tier]} abierto`,desc:items.map(x=>x.name).join(' · '),pts:pp,rarity:best.rarity,reward:{rid:best.rid,name:best.name,icon:best.icon,rarity:best.rarity,type:best.type}});
 UI.chest={tier,pp,items,stage:-1,fortune:!!fort};
 openSheet(chestStageHTML());afterChange([]);
}
function setSheet(html){const s=$('#sheet .sheet');if($('#sheet').hidden||!s)return openSheet(html);s.innerHTML=`<button class="sheet-x" data-act="close" aria-label="Cerrar">✕</button>${html}`;s.scrollTop=0}
function bigArt(ref){if(!ref)return'✨';switch(ref.type){
 case'companero':return petSVG(ref,'act-'+ref.act);
 case'cofre':return chestSVG(ref.tier,'idle');
 case'marco':return`<div class="ava" style="--sz:74px">${frameSVG(ref.id)}<div class="ava-in">${D?emblem(D.level):''}</div></div>`;
 case'fondo':return`<div class="fd-sw pfbg-${ref.id.slice(3)}"></div>`;
 case'aura':return`<div class="ava au-${ref.id.slice(3)}" style="--sz:74px"><div class="ava-in">${D?emblem(D.level):''}</div></div>`;
 case'lema':return'<span style="font-size:52px">❝</span>';
}return esc(ref.icon||'✨')}
function chestStageHTML(){const C=UI.chest;const n=C.items.length;
 if(C.stage<0)return`<div class="chest-stage"><div class="eyebrow">Cofre ${CH_NAME[C.tier]}${C.fortune?' · mejorado por la Fortuna':''}</div><button class="ch-tap" data-act="ch-next" aria-label="Abrir el cofre">${chestSVG(C.tier,'chbig shake')}</button><p class="muted">Toca el cofre para abrirlo</p></div><button class="btn block" data-act="ch-next">Abrir</button>`;
 if(C.stage<=n){const it=C.stage===0?{name:`+${fmt(C.pp)} PP`,icon:'✨',rarity:'común',type:'pp'}:C.items[C.stage-1];const ref=it.type==='pp'?null:cref(it.rid);
  const dots=[...Array(n+1)].map((_,i)=>`<i class="${i===C.stage?'on':''}"></i>`).join('');
  const extra=ref&&ref.type==='companero'?`<span class="chip">${esc(ORIGIN_NAME[ref.origin]||'')}</span>`:'';
  return`<div class="chest-stage">${chestSVG(C.tier,'small open')}<div class="ch-item bd-${RK[it.rarity]||'c'}">${it.type==='pp'?'✨':bigArt(ref)}</div><h3 style="transform:none">${esc(it.name)}</h3><div class="row" style="justify-content:center">${it.type==='pp'?'<span class="chip">Puntos de progreso</span>':rarChip(it.rarity)+`<span class="chip">${esc(TYPE_NAME[it.type]||'')}</span>`+extra}</div>${ref?`<p class="muted">${esc(ref.type==='lema'?'«'+ref.name+'» · '+ref.desc:ref.desc||'')}</p>`:''}<div class="ch-dots">${dots}</div></div><button class="btn block" data-act="ch-next">${C.stage<n?`Siguiente (${C.stage+1}/${n+1})`:'Ver todo'}</button>`}
 const tiles=[`<div class="t bd-c"><span class="icon bd-c">✨</span><b class="num">+${fmt(C.pp)} PP</b></div>`].concat(C.items.map(it=>{const ref=cref(it.rid)||it;return`<div class="t bd-${RK[it.rarity]||'c'}">${icon(ref)}<b>${esc(it.name)}</b><small class="rar rar-${RK[it.rarity]}">${esc(it.rarity)}</small></div>`})).join('');
 return`<div class="chest-stage">${chestSVG(C.tier,'small open')}<h3 style="transform:none">Cofre ${CH_NAME[C.tier]}</h3><div class="ch-sum">${tiles}</div></div><div class="row"><button class="btn ghost grow" data-act="ch-inv">Ir al inventario</button><button class="btn grow" data-act="ch-done">Listo</button></div>`;
}
function chestRevealHTML(r,x){const tier=r.rid.slice(6);const src=x.title||r.source||'';
 return`<div class="reveal bd-${RK[r.rarity]}"><div class="eyebrow">${esc(src)}</div>${chestSVG(tier,'chbig shake')}<h3>¡Cofre ${CH_NAME[tier]}!</h3>${r.pity?'<p class="st st-good">Garantizado por tu contador de cofres</p>':''}<p class="muted">${esc(CH_SPEC[tier].txt)}</p></div><div class="row"><button class="btn ghost grow" data-act="close">Guardar</button><button class="btn grow" data-act="ch-open" data-iid="${r.iid}">Abrir ahora</button></div>`;
}
function petRevealHTML(r,x){const p=PET_BY[r.rid];
 return`<div class="reveal bd-${RK[p.rarity]}"><div class="eyebrow">${esc(x.title||r.source||'Nuevo compañero')}</div><div class="pet-stage">${petSVG(p,'act-'+p.act+' pet-big')}</div><h3>${esc(p.name)}</h3><div class="row" style="justify-content:center">${rarChip(p.rarity)}<span class="chip">${esc(ORIGIN_NAME[p.origin])}</span></div><p class="muted">${esc(p.desc)}</p></div><div class="row"><button class="btn ghost grow" data-act="close">Seguir</button>${r.iid?`<button class="btn grow" data-act="ch-eq" data-iid="${r.iid}" data-ctx="rev">Llevar en pantalla</button>`:''}</div>`;
}

/* ================= equipar ================= */
const SLOT_OF={marco:'marco',fondo:'fondo',aura:'aura',efecto:'fx',lema:'lema',icono:'avatar'};
function isEquipped(i){const E=(S&&S.equip)||{};if(i.type==='companero')return(E.pets||[]).includes(i.rid);const s=SLOT_OF[i.type];return!!s&&E[s]===i.rid}
function toggleEquip(iid){ensureChestState();const i=S.inventory.find(x=>x.iid===iid&&x.status==='active');if(!i)return;const E=S.equip;let msg='';
 if(i.type==='companero'){if(E.pets.includes(i.rid)){E.pets=E.pets.filter(x=>x!==i.rid);msg='Compañero guardado.'}else{E.pets.push(i.rid);if(E.pets.length>2)E.pets.shift();msg='¡Compañero en pantalla!'}}
 else{const s=SLOT_OF[i.type];if(!s)return;E[s]=E[s]===i.rid?null:i.rid;msg=E[s]?'Equipado.':'Quitado.'}
 toast(msg,'good');persist();render();
}

/* ================= hojas de inventario y Pokédex ================= */
function cosmeticSheet(i){const ref=cref(i.rid)||{name:i.rid,rarity:'común'};const on=isEquipped(i);const t=i.type;
 let body=`<div class="reveal bd-${RK[ref.rarity]||'c'}" style="padding:0">${t==='companero'?`<div class="pet-stage">${petSVG(ref,'act-'+ref.act+' pet-big')}</div>`:`<div class="ch-item" style="animation:none">${bigArt(ref)}</div>`}<h3>${esc(t==='lema'?'Lema de perfil':ref.name)}</h3><div class="row" style="justify-content:center">${rarChip(ref.rarity)}<span class="chip">${esc(TYPE_NAME[t])}</span>${t==='companero'?`<span class="chip">${esc(ORIGIN_NAME[ref.origin])}</span>`:''}${on?'<span class="st st-good">Equipado</span>':''}</div></div>`;
 if(t==='lema')body+=`<p class="lema-q" style="align-self:center;text-align:center">«${esc(ref.name)}»</p>`;
 body+=`<p class="muted" style="text-align:center">${esc(ref.desc||'')}</p>`;
 if(t==='companero')body+=`<div class="eyebrow">Mayores logros</div><ul class="feats-list">${(ref.feats||[]).map(f=>`<li>${esc(f)}</li>`).join('')}</ul>`;
 body+=`<p class="faint" style="text-align:center;font-size:13px">Obtenido el ${niceDate(i.got)} · ${esc(i.source||'')}</p>`;
 const lbl={companero:on?'Guardar (sacar de la pantalla)':'Llevar en pantalla',marco:on?'Quitar marco':'Equipar marco',fondo:on?'Quitar fondo':'Usar este fondo',aura:on?'Quitar aura':'Equipar aura',efecto:on?'Quitar efecto':'Equipar efecto',lema:on?'Quitar lema':'Usar como lema',icono:on?'Volver al emblema':'Usar como ícono'}[t];
 let acts=`<button class="btn ${on?'ghost':''} block" data-act="ch-eq" data-iid="${i.iid}" data-ctx="inv">${lbl}</button>`;
 if(t==='companero')acts+=`<button class="btn ghost block" data-act="ch-avatar" data-rid="${i.rid}">${S.equip&&S.equip.avatar===i.rid?'Dejar de usar como ícono':'Usar como ícono de perfil'}</button>`;
 if(t==='efecto')acts+=`<button class="btn ghost block" data-act="ch-fxtest" data-k="${i.rid.slice(3)}">Probar efecto</button>`;
 openSheet(body+acts);
}
function chestInvSheet(i){const tier=i.rid.slice(6);const active=i.status==='active';
 openSheet(`<div class="reveal bd-${RK[CH_RAR[tier]]}">${chestSVG(tier,'chbig idle')}<h3>Cofre ${CH_NAME[tier]}</h3>${rarChip(CH_RAR[tier])}<p class="muted">${esc(CH_SPEC[tier].txt)}</p><p class="faint" style="font-size:13px">Obtenido el ${niceDate(i.got)} · ${esc(i.source||'')}</p></div>${active?`<button class="btn block" data-act="ch-open" data-iid="${i.iid}">Abrir</button>`:'<p class="lock-note">Ya lo abriste.</p>'}`);
}
function cintaSheet(i){const ref=cref(i.rid);openSheet(`<div class="reveal bd-c" style="padding:0"><div class="ch-item" style="animation:none">${esc(ref.icon)}</div><h3>${esc(ref.name)}</h3></div><p class="muted" style="text-align:center">${esc(ref.desc)}</p><div class="row"><button class="btn grow" data-act="use-item" data-iid="${i.iid}" data-arg="ayer">Proteger ayer</button><button class="btn ghost grow" data-act="use-item" data-iid="${i.iid}" data-arg="hoy">Proteger hoy</button></div>`)}
function dexPetCard(p){const k=!!S.pokedex[p.id];const no='#'+String(CATALOG.indexOf(p)+1).padStart(3,'0');
 return`<button class="dex ${k?'':'unk'} bd-${RK[p.rarity]}" data-act="dex" data-rid="${p.id}" ${k?'':`aria-label="${esc(no)} sin descubrir, rareza ${esc(p.rarity)}"`}><span class="no">${no}</span>${p.only?'<span class="cnt" title="Exclusivo de cofres">🧰</span>':''}<span class="icon pet-ic bd-${RK[p.rarity]}">${petSVG(p,'')}</span><b>${k?esc(p.name):'???'}</b><small class="rar rar-${RK[p.rarity]}">${esc(p.rarity)}</small></button>`}
function chestDexSheet(c){const k=S.pokedex[c.id];const where=c.chest?(c.type==='cofre'?'Sale de misiones, objetivos, ascensos, rachas y la semana de constancia.':`Exclusivo de cofres. Búscalo en cofres ${{común:'raros','poco común':'raros',raro:'raros o épicos',épico:'épicos o legendarios',legendario:'legendarios o míticos',mítico:'míticos (y a veces legendarios)'}[c.rarity]}.`):'Sale en recompensas de misiones, objetivos y en cofres.';
 const stage=c.type==='companero'?`<div class="pet-stage" ${k?'':'style="filter:brightness(0) opacity(.55)"'}>${petSVG(c,(k?'act-'+c.act:'')+' pet-big')}</div>`:`<div class="ch-item" style="animation:none;${k?'':'filter:brightness(0) opacity(.5)'}">${bigArt(c)}</div>`;
 const no='#'+String(CATALOG.indexOf(c)+1).padStart(3,'0');
 if(!k){openSheet(`<div class="reveal bd-${RK[c.rarity]||'c'}">${stage}<h3>${no} · ???</h3><div class="row" style="justify-content:center">${rarChip(c.rarity)}<span class="chip">${esc(TYPE_NAME[c.type]||'')}</span>${c.type==='companero'?`<span class="chip">${esc(ORIGIN_NAME[c.origin])}</span>`:''}</div><p class="muted">${esc(where)}</p></div>`);return}
 openSheet(`<div class="reveal bd-${RK[c.rarity]||'c'}">${stage}<div class="eyebrow">${no} · ${esc(TYPE_NAME[c.type]||'')}</div><h3>${esc(c.type==='lema'?'«'+c.name+'»':c.name)}</h3><div class="row" style="justify-content:center">${rarChip(c.rarity)}${c.type==='companero'?`<span class="chip">${esc(ORIGIN_NAME[c.origin])}</span>`:''}${c.only&&c.chest?'<span class="chip">Exclusivo de cofres</span>':''}</div><p class="muted">${esc(c.desc||'')}</p>${c.type==='companero'?`<div class="eyebrow">Mayores logros</div><ul class="feats-list">${c.feats.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>`:''}<p class="faint num" style="font-size:13px">Primera vez: ${longDate(k.first)} · obtenido ${k.count} ${k.count===1?'vez':'veces'}</p></div>`);
}

/* ================= perfil ================= */
function avatarHTML(size){const E=(S&&S.equip)||{};const a=E.avatar&&cref(E.avatar);let inner;
 if(a&&a.type==='companero')inner=petSVG(a,'idle');else if(a)inner=`<span class="ava-emo">${esc(a.icon)}</span>`;else inner=emblem(D.level);
 return`<div class="ava${E.aura?' au-'+E.aura.slice(3):''}" style="--sz:${size}px">${E.marco?frameSVG(E.marco):''}<div class="ava-in bd-${a?RK[a.rarity]:'c'}">${inner}</div></div>`;
}
function vPerfilShow(){
 ensureChestState();compute();const E=S.equip;const L=D.level;const lo=THRESH[L],hi=L<MAXL?THRESH[L+1]:THRESH[L];const pct=L<MAXL?clamp((D.total-lo)/(hi-lo)*100,0,100):100;
 const nick=nickOf();const tit=curTitle();const dis=effectOn('dishonor',today());const lema=E.lema&&cref(E.lema);
 const bestStreak=Math.max(0,...Object.values(D.perDay).map(p=>p.streak||0));
 let reps=0;for(const Lg of Object.values(LOGS))for(const[k,e]of Object.entries(Lg.ex||{})){const X=exDef(k);if(X&&X.metric==='reps')reps+=+e.reps||0}
 const dex=dexEntries();const dexGot=dex.filter(e=>S.pokedex[e.rid]).length;const petsOwned=PETS.filter(p=>S.pokedex[p.id]).length;
 const since=(IS_WEB&&S.profile&&S.profile.created)||S.created||today();
 const exIds=IS_WEB?tracked():CORE;
 const recs=exIds.map(e=>{const X=exDef(e);if(!X)return'';let v,u='';if(X.metric==='reps')v=D.best[e]||0;else if(X.metric==='secs'){v=D.best[e]||0;u=' s'}else if(X.metric==='load'){v=exMaxField(e,'kg');u=' kg'}else{v=exMaxField(e,'km');u=' km'}return`<div class="stat"><span>${esc(X.short||X.name)}</span><b class="num">${v?fmt1(v)+u:'—'}</b></div>`}).join('');
 const mon0=mondayOf(today());const weeks=[];for(let w=7;w>=0;w--){const m=addDays(mon0,-7*w),end=addDays(m,6);let p=0;for(let k=0;k<7;k++){const d=addDays(m,k);if(D.perDay[d])p+=D.perDay[d].pts}for(const e of S.ledger||[])if(e.d>=m&&e.d<=end&&e.kind!=='archivo')p+=e.pts;weeks.push({m,p:Math.max(0,Math.round(p))})}
 const mx=Math.max(1,...weeks.map(w=>w.p));
 const bars=weeks.map((w,i)=>`<div class="wk-bar" title="Semana del ${niceDate(w.m)}: ${fmt(w.p)} PP"><em class="num">${w.p?fmt(w.p):''}</em><i style="height:${Math.max(2,w.p/mx*76).toFixed(1)}%;${i===7?'':'opacity:.55'}"></i><small>${niceDate(w.m)}</small></div>`).join('');
 const top=S.feats.slice().sort((a,b)=>featValue(b)-featValue(a)).slice(0,5);
 const insAll=CATALOG.filter(c=>c.type==='insignia');const ins=insAll.filter(c=>S.pokedex[c.id]).sort((a,b)=>RARITIES.indexOf(b.rarity)-RARITIES.indexOf(a.rarity));
 const pets=E.pets.map(id=>PET_BY[id]).filter(p=>p&&owned(p.id));
 const stat=(l,v)=>`<div class="stat"><span>${l}</span><b class="num">${v}</b></div>`;
 return`<section class="pf-card ${E.fondo?'pfbg-'+E.fondo.slice(3):''}">
  <div class="pf-head">${avatarHTML(104)}<div style="min-width:0;flex:1"><div class="eyebrow">Perfil del jugador</div><h1 class="display pf-name">${nick?esc(nick):'<span class="faint">Sin nombre</span>'}</h1>${tit?`<div class="title-chip ${dis?'dis':''}">${dis?'Título oculto por deshonra':'«'+esc(tit)+'»'}</div>`:''}${lema?`<p class="pf-lema">«${esc(lema.name)}»</p>`:''}<p class="faint" style="font-size:12.5px;margin-top:8px">En la liga desde el ${longDate(since)}</p></div></div>
  <div class="pf-rank">${emblem(L)}<div style="flex:1;min-width:0"><div class="row" style="justify-content:space-between;gap:8px"><b class="display" style="font-size:22px">${levelName(L)}</b><span class="num">${fmt(D.total)} PP</span></div><div class="pf-bar"><span style="width:${pct}%"></span></div><small class="faint num">${L<MAXL?`Faltan ${fmt(hi-D.total)} PP para ${levelName(L+1)}`:'Estás en la cima'}</small></div></div>
  ${pets.length?`<div class="pf-pets">${pets.map(p=>`<button class="pf-pet" data-act="pp-pet" data-rid="${p.id}" aria-label="${esc(p.name)}">${petSVG(p,'idle')}</button>`).join('')}</div>`:''}
  <div class="row" style="margin-top:14px"><button class="btn grow" data-act="pp-edit">Personalizar perfil</button></div>
 </section>
 <div class="kpis"><div class="kpi"><span>Racha actual</span><b class="num">${D.streakNow} ${D.streakNow===1?'día':'días'}</b></div><div class="kpi"><span>Mejor racha</span><b class="num">${bestStreak} ${bestStreak===1?'día':'días'}</b></div><div class="kpi"><span>Días entrenados</span><b class="num">${D.dates.length}</b></div></div>
 <section class="sec"><div class="sec-head"><h2 class="sec-title">Estadísticas</h2></div><div class="stat-grid">${stat('PP totales',fmt(D.total))}${stat('Repeticiones',fmt(reps))}${stat('Misiones',fmt(S.stats.missions||0))}${stat('Objetivos',fmt(S.stats.objectives||0))}${stat('Cofres abiertos',fmt(S.stats.chests||0))}${stat('Compañeros',petsOwned+'/'+PETS.length)}${stat('Pokédex',dexGot+'/'+dex.length)}${stat('Hazañas',fmt(S.feats.length))}</div></section>
 <section class="sec"><div class="sec-head"><h2 class="sec-title">Mejores marcas</h2><span class="sec-note">Tu mejor día en cada ejercicio</span></div><div class="stat-grid">${recs}</div></section>
 <section class="sec"><div class="sec-head"><h2 class="sec-title">Progreso</h2><span class="sec-note">PP ganados por semana</span></div><div class="card"><div class="wk-bars">${bars}</div></div></section>
 <section class="sec"><div class="sec-head"><h2 class="sec-title">Mejores hazañas</h2><button class="btn ghost sm" data-act="tab" data-v="hazanas">Ver todas</button></div>${top.length?`<div class="card"><div class="tl">${top.map(f=>`<div class="feat">${featIcon(f)}<div style="min-width:0"><b>${esc(f.title)}</b><small>${niceDate(f.date)}${f.reward&&f.reward.name?' · '+esc(f.reward.name):''}</small></div><div class="v"><span class="num">${fmt(featValue(f))}</span><br><span class="faint" style="font-size:11px">pts de hazaña</span></div></div>`).join('')}</div></div>`:'<div class="empty">Tus hazañas aparecerán aquí.</div>'}</section>
 <section class="sec"><div class="sec-head"><h2 class="sec-title">Insignias</h2><span class="sec-note num">${ins.length}/${insAll.length}</span></div>${ins.length?`<div class="badges">${ins.map(c=>`<button class="badge-i" data-act="dex" data-rid="${c.id}" title="${esc(c.name)}" aria-label="${esc(c.name)}">${icon(c)}</button>`).join('')}</div>`:'<div class="empty">Todavía no tienes insignias.</div>'}</section>`;
}
const PP_TABS=[['nombre','Nombre'],['icono','Ícono'],['marco','Marco'],['fondo','Fondo'],['aura','Aura'],['efecto','Efecto'],['lema','Lema'],['titulo','Título'],['pets','Compañeros']];
function ppOptions(tab){const act=S.inventory.filter(i=>i.status==='active');const E=S.equip;const opt=(slot,v,on,prev,name,rar)=>`<button class="pp-opt ${on?'on':''} bd-${RK[rar]||'c'}" data-act="pp-set" data-slot="${slot}" data-v="${v}" aria-pressed="${on}"><span class="pp-prev">${prev}</span><small>${esc(name)}</small></button>`;
 const list=type=>act.filter(i=>i.type===type).map(i=>cref(i.rid)).filter(Boolean).sort((a,b)=>RARITIES.indexOf(b.rarity)-RARITIES.indexOf(a.rarity));
 switch(tab){
  case'icono':{const seen=new Set();const items=[];for(const c of list('icono').concat(list('companero'),CATALOG.filter(c=>c.type==='insignia'&&S.pokedex[c.id]))){if(!seen.has(c.id)){seen.add(c.id);items.push(c)}}
   return opt('avatar','',!E.avatar,`<span class="ava" style="--sz:44px"><span class="ava-in">${emblem(D.level)}</span></span>`,'Emblema de rango','común')+items.map(c=>opt('avatar',c.id,E.avatar===c.id,c.type==='companero'?petSVG(c,''):esc(c.icon),c.name,c.rarity)).join('')}
  case'marco':return opt('marco','',!E.marco,'—','Sin marco','común')+list('marco').map(c=>opt('marco',c.id,E.marco===c.id,`<span class="ava" style="--sz:40px">${frameSVG(c.id)}<span class="ava-in"></span></span>`,c.name,c.rarity)).join('');
  case'fondo':return opt('fondo','',!E.fondo,'—','Fondo de la liga','común')+list('fondo').map(c=>opt('fondo',c.id,E.fondo===c.id,`<span class="fd-sw pfbg-${c.id.slice(3)}"></span>`,c.name,c.rarity)).join('');
  case'aura':return opt('aura','',!E.aura,'—','Sin aura','común')+list('aura').map(c=>opt('aura',c.id,E.aura===c.id,`<span class="ava au-${c.id.slice(3)}" style="--sz:36px"><span class="ava-in"></span></span>`,c.name,c.rarity)).join('');
  case'efecto':return opt('fx','',!E.fx,'—','Sin efecto','común')+list('efecto').map(c=>opt('fx',c.id,E.fx===c.id,esc(c.icon),c.name,c.rarity)).join('');
  case'lema':return opt('lema','',!E.lema,'—','Sin lema','común')+list('lema').map(c=>opt('lema',c.id,E.lema===c.id,'❝','«'+c.name+'»',c.rarity)).join('');
  case'titulo':return opt('titulo','',!S.title,'—','Sin título','común')+list('titulo').map(c=>opt('titulo',c.id,S.title===c.id,'🏷️',c.name,c.rarity)).join('');
  case'pets':return list('companero').map(c=>opt('pets',c.id,E.pets.includes(c.id),petSVG(c,''),c.name,c.rarity)).join('');
 }return''}
function customizeSheet(){ensureChestState();const tab=UI.ppTab||'icono';
 let body;if(tab==='nombre')body=`<label class="fl">Nombre de jugador<input type="text" id="pp-nick" maxlength="24" value="${esc(nickOf())}" placeholder="Cómo quieres que te vean"></label><button class="btn block" data-act="pp-nick">Guardar nombre</button>`;
 else{const o=ppOptions(tab);body=o?`${tab==='pets'?'<p class="sec-note">Elige hasta 2 compañeros para que caminen por tu pantalla.</p>':''}<div class="pp-opts">${o}</div>`:'<div class="empty">Todavía no tienes de estos. Salen en cofres.</div>'}
 setSheet(`<h3>Personalizar perfil</h3><div class="seg pp-seg" role="group" aria-label="Categoría">${PP_TABS.map(([k,l])=>`<button data-act="pp-tab" data-v="${k}" aria-pressed="${tab===k}">${l}</button>`).join('')}</div>${body}`);
}
function ppSet(slot,v){ensureChestState();const E=S.equip;v=v||null;
 if(slot==='titulo'){if(v&&effectOn('dishonor',today())){toast('Deshonrado: no puedes equipar títulos por ahora.','bad');return}S.title=v}
 else if(slot==='pets'){if(E.pets.includes(v))E.pets=E.pets.filter(x=>x!==v);else{E.pets.push(v);if(E.pets.length>2)E.pets.shift()}}
 else E[slot]=v;
 persist();render();customizeSheet();
}

/* ================= compañeros en pantalla ================= */
const PETS_RT={list:[],raf:0,last:0,key:''};
function syncPets(){
 const want=((S&&S.equip&&S.equip.pets)||[]).filter(id=>PET_BY[id]&&owned(id)).slice(0,2);let layer=document.getElementById('pets');
 if(!want.length){if(layer)layer.remove();PETS_RT.list=[];PETS_RT.key='';document.body.classList.remove('has-pets');if(PETS_RT.raf){cancelAnimationFrame(PETS_RT.raf);PETS_RT.raf=0}return}
 if(!layer){layer=document.createElement('div');layer.id='pets';layer.setAttribute('aria-hidden','true');document.body.appendChild(layer);PETS_RT.key=''}
 document.body.classList.add('has-pets');const key=want.join(',');if(key===PETS_RT.key)return;PETS_RT.key=key;
 layer.innerHTML='';const W=layer.clientWidth||innerWidth;
 PETS_RT.list=want.map((id,i)=>{const p=PET_BY[id];const el=document.createElement('div');el.className='pet r-'+RK[p.rarity];el.innerHTML=petSVG(p,RM?'idle':'walk');layer.appendChild(el);return{id,p,el,svg:el.firstElementChild,x:W*(.15+.5*i),dir:i%2?-1:1,speed:15+Math.random()*8,state:'walk',until:performance.now()+3000+Math.random()*5000}});
 for(const q of PETS_RT.list)q.el.style.transform=`translateX(${q.x.toFixed(1)}px)`;
 if(!RM&&!PETS_RT.raf){PETS_RT.last=performance.now();PETS_RT.raf=requestAnimationFrame(petLoop)}
}
function petLoop(now){
 const layer=document.getElementById('pets');if(!layer||!PETS_RT.list.length){PETS_RT.raf=0;return}
 const dt=Math.min(.1,(now-PETS_RT.last)/1000);PETS_RT.last=now;const W=layer.clientWidth;
 for(const q of PETS_RT.list){const pw=q.el.offsetWidth||40;const base=petClass(q.p);
  if(now>q.until){if(q.state==='walk'){if(Math.random()<.72){q.state='act';q.svg.setAttribute('class',base+' act-'+q.p.act);q.until=now+2600+Math.random()*1600}else{q.state='idle';q.svg.setAttribute('class',base+' idle');q.until=now+1400+Math.random()*1600}}else{q.state='walk';if(Math.random()<.35)q.dir*=-1;q.svg.setAttribute('class',base+' walk');q.until=now+5000+Math.random()*7000}}
  if(q.state==='walk'||(q.state==='act'&&q.p.act==='run')){q.x+=q.dir*(q.state==='act'?q.speed*3.2:q.speed)*dt;if(q.x<4){q.x=4;q.dir=1}if(q.x>W-pw-4){q.x=Math.max(4,W-pw-4);q.dir=-1}}
  q.el.style.transform=`translateX(${q.x.toFixed(1)}px)`;q.el.classList.toggle('flip',q.dir<0);
 }
 PETS_RT.raf=requestAnimationFrame(petLoop);
}

/* ================= efectos de pantalla ================= */
const FX={kind:null};
function fxAt(x,y,kind,n){if(RM||!kind)return;let l=document.getElementById('fxl');if(!l){l=document.createElement('div');l.id='fxl';l.setAttribute('aria-hidden','true');document.body.appendChild(l)}
 const cols=['#ff5a8a','#f5b83d','#55a6ff','#3ecf8e','#b583ff','#ffffff'];const N=n||{chispas:9,petalos:7,confeti:14,estrellas:8}[kind]||8;
 for(let i=0;i<N;i++){const s=document.createElement('i');s.className='fxp fx-'+kind;const a=Math.random()*Math.PI*2,d=18+Math.random()*(n?120:40);s.style.left=x+'px';s.style.top=y+'px';s.style.setProperty('--dx',(Math.cos(a)*d).toFixed(1)+'px');s.style.setProperty('--dy',(Math.sin(a)*d+(kind==='petalos'?30:0)).toFixed(1)+'px');s.style.setProperty('--r',((Math.random()*540-270)|0)+'deg');if(kind==='confeti')s.style.background=cols[i%cols.length];if(kind==='estrellas')s.textContent='✦';l.appendChild(s);setTimeout(()=>s.remove(),900)}}
function fxBurst(force){const k=FX.kind||(force?'confeti':null);if(k)fxAt(innerWidth/2,innerHeight*.38,k,k==='confeti'?40:26)}
document.addEventListener('pointerdown',e=>{if(FX.kind)fxAt(e.clientX,e.clientY,FX.kind)},{passive:true});
function applyCosmetics(){const b=document.body;const E=(S&&S.equip)||{};
 for(const c of Array.from(b.classList))if(c.startsWith('bg-'))b.classList.remove(c);
 const fd=E.fondo&&owned(E.fondo)?E.fondo.slice(3):null;b.classList.toggle('has-bg',!!fd);if(fd)b.classList.add('bg-'+fd);
 FX.kind=E.fx&&owned(E.fx)?E.fx.slice(3):null;syncPets();
}
function clearCosmetics(){const b=document.body;for(const c of Array.from(b.classList))if(c.startsWith('bg-'))b.classList.remove(c);b.classList.remove('has-bg','has-pets');FX.kind=null;const l=document.getElementById('pets');if(l)l.remove();PETS_RT.list=[];PETS_RT.key=''}

/* ================= envolturas del juego base ================= */
(function(){
 const _completeMission=completeMission;
 completeMission=function(day,m,date){const r=_completeMission(day,m,date);
  if(m.pts&&effectOn('horn',date)){addLedger(date,m.pts,'mision','Cuerno de guerra: '+m.title);if(r)r.pts=(r.pts||0)+m.pts}
  if(m.key!=='debt'){const x=Math.random();let t=null;if(m.diff===1&&x<.04)t='raro';else if(m.diff===2&&x<.12)t='raro';else if(m.diff===3)t=x<.08?'epico':x<.38?'raro':null;else if(m.diff>=4)t=x<.02?'mitico':x<.14?'legendario':x<.6?'epico':null;if(t)awardChest(t,'Misión «'+m.title+'»')}
  return r};
 const _claimObjective=claimObjective;
 claimObjective=function(id){const t=today();const day=S&&S.days[t];const o=S&&S.objectives.find(x=>x.id===id);
  if(READY&&o&&objReady(o)&&!(day&&day.objClaimed)){let tier=RAR_TIER[o.rarity]||'raro';if(tier==='legendario'&&Math.random()<.04)tier='mitico';awardChest(tier,'Objetivo cumplido')}
  return _claimObjective(id)};
 const _weeklyChest=weeklyChest;
 weeklyChest=function(sun){const r=_weeklyChest(sun);if(r){const mon=addDays(sun,-6);let n=0;for(let k=0;k<7;k++)if(hasSession(LOGS[addDays(mon,k)]))n++;awardChest(n>=7?'legendario':n>=6?'epico':'raro',`Constancia semanal (${n}/7)`)}return r};
 const _checkRank=checkRank;
 checkRank=function(){const before=S.maxLevel;const cel=_checkRank();
  if(cel)for(let i=before+1;i<=cel.level;i++){const tu=i%3===0||i===MAXL;const T=tierOf(i);cel.reveals.push(awardChest(tu?'legendario':T<=1?'raro':T<=5?'epico':'legendario','Ascenso a '+levelName(i),true));if(i===12||i===MAXL)cel.reveals.push(awardChest('mitico','Ascenso a '+levelName(i),true))}
  return cel};
 const _applyPenalty=applyPenalty;
 applyPenalty=function(m,d){if(effectOn('aegis',today())){addScar({date:d,title:m.title,penalty:'Bloqueada por el Corazón de Fénix',blocked:true});return'Corazón de Fénix: penalización bloqueada.'}return _applyPenalty(m,d)};
 const STREAK_CH={3:'raro',7:'epico',14:'legendario',30:'mitico',60:'mitico',100:'mitico'};
 const _afterChange=afterChange;
 afterChange=function(reveals=[]){if(S&&READY){ensureChestState();const C=compute();for(const[n,t]of Object.entries(STREAK_CH))if(C.streakNow>=+n&&!S.streakChests[n]){S.streakChests[n]=today();awardChest(t,`Racha de ${n} días`)}}
  return _afterChange((reveals||[]).concat(CHEST_Q.splice(0)))};
 const _startGame=startGame;
 startGame=function(){if(S){ensureChestState();if(!S.chestWelcome){S.chestWelcome=today();awardChest('raro','Cofre de bienvenida')}}return _startGame()};
 const _nextReveal=nextReveal;
 nextReveal=function(){if(!$('#sheet').hidden||!UI.reveals.length)return _nextReveal();const x=UI.reveals[0];const r=x&&x.reward;
  if(r&&r.type==='cofre'&&r.iid&&r.rid){UI.reveals.shift();openSheet(chestRevealHTML(r,x));fxBurst(false);return}
  if(r&&r.type==='companero'&&PET_BY[r.rid]){UI.reveals.shift();openSheet(petRevealHTML(r,x));fxBurst(true);return}
  const out=_nextReveal();if(r)fxBurst(RARITIES.indexOf(r.rarity)>=4);return out};
 const _icon=icon;
 icon=function(ref,rar){if(ref&&ref.type){const k=RK[rar||ref.rarity]||'c';
  if(ref.type==='companero'&&PET_BY[ref.id||ref.rid])return`<span class="icon pet-ic bd-${k}">${petSVG(PET_BY[ref.id||ref.rid],'')}</span>`;
  if(ref.type==='cofre'&&(ref.tier||ref.rid))return`<span class="icon bd-${k}">${chestSVG(ref.tier||(ref.rid||'').slice(6),'')}</span>`;
  if(ref.type==='marco'&&ref.id)return`<span class="icon bd-${k}">${frameSVG(ref.id)}</span>`;
  if(ref.type==='fondo'&&ref.id)return`<span class="icon bd-${k}" style="padding:4px"><span class="fd-sw pfbg-${ref.id.slice(3)}"></span></span>`}
  return _icon(ref,rar)};
 const _invCard=invCard;
 invCard=function(i){let h=_invCard(i);if(COSMETIC.includes(i.type)&&i.status==='active'&&isEquipped(i))h=h.replace(/<\/span><\/button>$/,'<span class="st st-good">Equipado</span></span></button>');if(i.type==='lema'){const r=cref(i.rid);if(r)h=h.replace(`<b>${esc(r.name)}</b>`,`<b>«${esc(r.name)}»</b>`)}return h};
 const _invSheet=invSheet;
 invSheet=function(iid){const i=S.inventory.find(x=>x.iid===iid);if(!i)return;if(i.type==='cofre')return chestInvSheet(i);if(COSMETIC.includes(i.type))return cosmeticSheet(i);if(i.rid==='cx_cinta'&&i.status==='active')return cintaSheet(i);return _invSheet(iid)};
 const _dexSheet=dexSheet;
 dexSheet=function(rid){const c=cref(rid);if(c&&(c.chest||c.type==='companero'))return chestDexSheet(c);return _dexSheet(rid)};
 const _useItem=useItem;
 useItem=function(iid,arg){const i=S.inventory.find(x=>x.iid===iid&&x.status==='active');if(!i||!i.rid.startsWith('cx_'))return _useItem(iid,arg);
  if(typeof needReady==='function'&&!needReady())return;const t=today();const day=ensureDay(t);const ref=cref(i.rid)||{};let msg='';
  const pp=a=>{addLedger(t,a,'item',ref.name);msg=`+${a} PP`};
  switch(i.rid){
   case'cx_barra':pp(30);break;case'cx_batido':pp(45);break;case'cx_cantimplora':pp(90);break;case'cx_tonico':pp(300);break;
   case'cx_tiza':if(effectOn('chalk',t)){toast('Ya tienes tiza activa hoy.');return}S.effects.push({type:'chalk',from:t,to:t});msg='Tiza activa: ×1,1 hoy';break;
   case'cx_cinta':{if(!arg){cintaSheet(i);return}const d=arg==='hoy'?t:addDays(t,-1);if(hasSession(LOGS[d])){toast('Ese día ya tiene entrenamiento.');return}if(S.freezeDays.includes(d)){toast('Ese día ya está protegido.');return}S.freezeDays.push(d);msg=`Racha protegida para ${arg==='hoy'?'hoy':'ayer'}`;break}
   case'cx_vendas':giveItem(cref('itm_escudo'),ref.name);msg='+1 Escudo de Rango';break;
   case'cx_egida':giveItem(cref('itm_escudo'),ref.name);giveItem(cref('itm_escudo'),ref.name);msg='+2 Escudos de Rango';break;
   case'cx_pergamino2':day.extraChanges=(day.extraChanges||0)+2;msg='+2 cambios de objetivo hoy';break;
   case'cx_dado2':{const keep=day.offers.filter(m=>day.accepted.includes(m.id));if(keep.length>=5){toast('Ya aceptaste todas.');return}day.rerolls=(day.rerolls||0)+1;const fresh=genOffers(t,day.rerolls,keep.map(m=>m.key)).slice(0,5-keep.length);day.offers=keep.concat(fresh).sort((a,b)=>(b.forced?1:0)-(a.forced?1:0)||a.diff-b.diff);msg='Nuevas misiones sobre la mesa';break}
   case'cx_elixir2':if(effectOn('boost2',t)){toast('Ya tienes poder ×2 activo hoy.');return}S.effects.push({type:'boost2',from:t,to:t});msg='Poder ×2 activo hoy';break;
   case'cx_ambrosia':S.effects.push({type:'boost2',from:t,to:addDays(t,2)});msg='Poder ×2 durante 3 días';break;
   case'cx_estandarte':S.effects.push({type:'banner',from:t,to:addDays(t,2)});msg='×1,5 durante 3 días';break;
   case'cx_cuerno':if(effectOn('horn',t)){toast('El cuerno ya sonó hoy.');return}S.effects.push({type:'horn',from:t,to:t});msg='Misiones ×2 PP hoy';break;
   case'cx_fortuna':if((S.effects||[]).some(e=>e.type==='fortune'&&!e.consumed)){toast('Ya tienes una Fortuna esperando.');return}S.effects.push({type:'fortune',from:t,to:null});msg='Tu próximo cofre sube de nivel';break;
   case'cx_corazon':S.effects.push({type:'aegis',from:t,to:addDays(t,6)});msg='Inmune a castigos por 7 días';break;
   case'cx_reloj':{const neg=['fatigue','nostreak','dishonor','sealed','curse'];const act=(S.effects||[]).filter(e=>neg.includes(e.type)&&!e.consumed&&(!e.to||e.to>=t));if(act.length){act.forEach(e=>e.consumed=true);msg='Castigos borrados'}else{const fine=(S.ledger||[]).slice().reverse().find(e=>e.kind==='penalizacion'&&e.pts<0&&diffDays(e.d,t)<=7&&!e.refunded);if(!fine){toast('No tienes castigos ni multas recientes.');return}fine.refunded=true;addLedger(t,-fine.pts,'item','Reloj de Cronos: multa devuelta');msg=`Multa devuelta: +${-fine.pts} PP`}break}
   case'cx_llave_oro':case'cx_llave_cel':case'cx_llave_vacio':{const tier={cx_llave_oro:'epico',cx_llave_cel:'legendario',cx_llave_vacio:'mitico'}[i.rid];i.status='used';i.used=t;const r=giveItem(cref('chest_'+tier),ref.name);closeSheetSilent();openChest(r.iid);return}
   default:return _useItem(iid,arg);
  }
  i.status='used';i.used=t;closeSheetSilent();toast(msg,'good');afterChange([]);
 };
 const _vInv=VIEWS.inventario;
 VIEWS.inventario=function(){ensureChestState();const act=S.inventory.filter(i=>i.status==='active');const cyc=S.chestCycle;const toL=10-(cyc%10),toM=30-(cyc%30);
  const cards=CH_TIERS.map(t=>{const l=act.filter(i=>i.rid==='chest_'+t);return`<div class="chcard ${l.length?'':'empty'} bd-${RK[CH_RAR[t]]}">${chestSVG(t,l.length?'idle':'')}<b>Cofre ${CH_NAME[t]}</b><small class="num">${l.length?'×'+l.length:'Ninguno'}</small>${l.length?`<button class="btn sm" data-act="ch-open" data-iid="${l[0].iid}">Abrir</button>`:''}</div>`}).join('');
  const pets=act.filter(i=>i.type==='companero').sort(byRar);const cos=act.filter(i=>COSMETIC.includes(i.type)&&i.type!=='companero').sort(byRar);
  return`<section class="sec" style="margin-top:0"><div class="sec-head"><h2 class="sec-title">Cofres</h2><span class="sec-note">${fmt(S.stats.chests||0)} abiertos</span></div><div class="chgrid">${cards}</div>
   <div class="card pity"><div class="pbar"><span class="num">Legendario garantizado en ${toL} ${toL===1?'cofre':'cofres'}</span><div class="track"><i style="width:${(cyc%10)*10}%;background:var(--r-l)"></i></div></div><div class="pbar"><span class="num">Mítico garantizado en ${toM} ${toM===1?'cofre':'cofres'}</span><div class="track"><i style="width:${((cyc%30)/30*100).toFixed(1)}%;background:var(--r-m)"></i></div></div></div>
   <p class="sec-note">Salen de misiones ★★ o más, objetivos, la semana de constancia, ascensos y rachas de 3, 7, 14, 30, 60 y 100 días.</p></section>
  <section class="sec"><div class="sec-head"><h2 class="sec-title">Compañeros</h2><span class="sec-note">${pets.length}/${PETS.length} · hasta 2 en pantalla</span></div>${pets.length?`<div class="inv">${pets.map(invCard).join('')}</div>`:'<div class="empty">Todavía no tienes compañeros. Los raros y épicos salen en cualquier parte; los legendarios y míticos, solo en cofres.</div>'}</section>
  <section class="sec"><div class="sec-head"><h2 class="sec-title">Personalización</h2><span class="sec-note">Marcos, fondos, auras, efectos, lemas e íconos</span></div>${cos.length?`<div class="inv">${cos.map(invCard).join('')}</div>`:'<div class="empty">Abre cofres para conseguir marcos, fondos y efectos exclusivos.</div>'}</section>`+_vInv()};
 const _vDex=VIEWS.pokedex;
 VIEWS.pokedex=function(){const h=_vDex();if(UI.pokeF!=='companero')return h;
  const grid=ORIGINS.map(([k,label])=>{const list=PETS.filter(p=>p.origin===k);if(!list.length)return'';const got=list.filter(p=>S.pokedex[p.id]).length;return`<div class="dex-group"><div class="sec-head"><h3 class="dex-gt">${label}</h3><span class="sec-note num">${got}/${list.length}</span></div><div class="dex-grid">${list.map(dexPetCard).join('')}</div></div>`}).join('');
  return h.replace(/<div class="dex-grid">[\s\S]*<\/div><\/section>\s*$/,`<p class="sec-note">Organizados por origen. Los legendarios y míticos (🧰) salen solo en cofres.</p>${grid}</section>`)};
 const _vIni=VIEWS.inicio;
 VIEWS.inicio=function(){let h=_vIni();const E=(S&&S.equip)||{};
  h=h.replace(/(<section class="hero">\s*)(<svg class="emb"[\s\S]*?<\/svg>)/,(m,a,b)=>`${a}<button class="embwrap${E.aura&&owned(E.aura)?' au-'+E.aura.slice(3):''}" data-act="tab" data-v="perfil" aria-label="Ver tu perfil">${E.marco&&owned(E.marco)?frameSVG(E.marco):''}${b}</button>`);
  const l=E.lema&&cref(E.lema);if(l)h=h.replace(/(<h1 class="display rank-name">[\s\S]*?<\/h1>)/,m=>`${m}<p class="hero-lema">«${esc(l.name)}»</p>`);
  return h};
 const _render=render;
 render=function(){_render();if(S&&BOOTED&&(!IS_WEB||S.profile))applyCosmetics();else clearCosmetics()};
 if(typeof renderLanding==='function'){const _rl=renderLanding;renderLanding=function(){clearCosmetics();return _rl()}}
 if(typeof renderOnboarding==='function'){const _ro=renderOnboarding;renderOnboarding=function(){clearCosmetics();return _ro()}}
 const _rh=renderHeader;
 renderHeader=function(){_rh();if(!IS_WEB&&S.nick){const el=$('#hdr-sub');el.textContent=S.nick+' · '+el.textContent}};
 // pestañas
 if(IS_WEB){const i=TABS.findIndex(t=>t[0]==='perfil');if(i>=0)TABS[i]=['ajustes','Ajustes'];VIEWS.ajustes=VIEWS.perfil;VALID.add('ajustes')}
 TABS.splice(1,0,['perfil','Perfil']);VIEWS.perfil=vPerfilShow;VALID.add('perfil');
})();

/* ================= eventos del módulo ================= */
document.addEventListener('click',ev=>{const b=ev.target.closest('[data-act]');if(!b)return;
 switch(b.dataset.act){
  case'ch-open':openChest(b.dataset.iid);break;
  case'ch-next':{const C=UI.chest;if(!C)return;C.stage++;setSheet(chestStageHTML());const it=C.stage>0&&C.stage<=C.items.length?C.items[C.stage-1]:null;if(it&&RARITIES.indexOf(it.rarity)>=4)fxBurst(true);else if(C.stage===0)fxBurst(false);break}
  case'ch-done':UI.chest=null;closeSheet();break;
  case'ch-inv':UI.chest=null;closeSheetSilent();go('inventario');break;
  case'ch-eq':{toggleEquip(b.dataset.iid);if(b.dataset.ctx==='rev')closeSheet();else{const i=S.inventory.find(x=>x.iid===b.dataset.iid);if(i)cosmeticSheet(i)}break}
  case'ch-avatar':ensureChestState();S.equip.avatar=S.equip.avatar===b.dataset.rid?null:b.dataset.rid;persist();render();closeSheetSilent();toast(S.equip.avatar?'Ícono de perfil actualizado.':'Volviste al emblema de rango.','good');break;
  case'ch-fxtest':{const r=b.getBoundingClientRect();fxAt(r.left+r.width/2,r.top,b.dataset.k,24);break}
  case'pp-edit':UI.ppTab=UI.ppTab||'icono';customizeSheet();break;
  case'pp-tab':UI.ppTab=b.dataset.v;customizeSheet();break;
  case'pp-set':ppSet(b.dataset.slot,b.dataset.v);break;
  case'pp-nick':{const v=($('#pp-nick').value||'').trim().slice(0,24);if(IS_WEB){if(!v){toast('Escribe un nombre.','bad');return}S.profile.nick=v}else S.nick=v;persist();render();toast('Nombre guardado.','good');customizeSheet();break}
  case'pp-pet':{const p=PET_BY[b.dataset.rid];const svg=b.querySelector('svg');if(!p||!svg)return;svg.setAttribute('class',petClass(p)+' act-'+p.act);clearTimeout(b._t);b._t=setTimeout(()=>svg.setAttribute('class',petClass(p)+' idle'),3200);break}
 }
});

boot();
