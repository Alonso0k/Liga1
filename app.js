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
  for(const c of catalogAll()){if(c.rarity!==rar||c.only)continue;if(forceType&&c.type!==forceType)continue;if(['insignia','titulo','cronica','tema','companero','marco','fondo','aura','efecto','lema','icono','avatar'].includes(c.type)&&S.pokedex[c.id])continue;pool.push({ref:c,w:TYPE_W[c.type]*(c.mine?2:1)})}
  if(!forceType||forceType==='cupon')for(const cp of CAT){if(cp.rarity!==rar||!couponAvailable(cp))continue;const near=comuna&&((cp.zone||'')+' '+(cp.channel||'')).toLowerCase().includes(comuna);pool.push({ref:couponRef(cp),w:TYPE_W.cupon*(near?2:1)})}
  if(!pool.length){if(forceType)return grantReward(rarity,source,null);const pts=[10,20,40,80,150,300][ri];addLedger(today(),pts,'bonus','Recompensa convertida en PP');return{rid:'pp',name:`+${pts} PP`,icon:'✨',rarity:rar,type:'pp',source,cursed}}
  const ch=wpick(Math.random,pool,p=>p.w);return Object.assign(giveItem(ch.ref,source),{cursed});
}
function giveItem(ref,source){
  const t=today();const rid=ref.id;const pd=S.pokedex[rid]||(S.pokedex[rid]={first:t,count:0});pd.count++;
  let inv=null;
  if(['cupon','vale','item','titulo','tema','cofre','companero','marco','fondo','aura','efecto','lema','icono','avatar'].includes(ref.type)){
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
  if(['insignia','titulo','cronica','tema','companero','marco','fondo','aura','efecto','lema','icono','avatar'].includes(c.type)&&S.pokedex[c.id])return grantReward(c.rarity,source);
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
  const types={todos:null,insignia:'Insignias',titulo:'Títulos',cronica:'Crónicas',item:'Ítems',vale:'Vales',tema:'Temas',cofre:'Cofres',companero:'Compañeros',marco:'Marcos',fondo:'Fondos',aura:'Auras',efecto:'Efectos',lema:'Lemas',icono:'Íconos',avatar:'Avatar',cupon:'Cupones'};
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
 ['fd_bosque','Bosque de Bambú','raro','Tallos de bambú y neblina de montaña.'],
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
[['ic_lobo','Lobo Gris','🐺','común'],['ic_zorro','Zorro de Fuego','🦊','común'],['ic_jabali','Jabalí','🐗','común'],
 ['ic_condor','Águila Imperial','🦅','raro'],['ic_toro','Toro de Creta','🐂','raro'],['ic_buho','Búho de Atenea','🦉','raro'],
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

/* ---------- 50 compañeros animados: generales, guerreros, héroes y dioses de Europa y Asia ---------- */
const ORIGINS=[['olimpo','Dioses del Olimpo'],['heroes','Héroes griegos'],['nordicos','Dioses nórdicos'],['egipcios','Dioses de Egipto'],['japoneses','Dioses de Japón'],['roma','Roma antigua'],['grecia','Grecia y Macedonia'],['egipto','Egipto faraónico'],['cartago','Cartago'],['japon','Japón feudal'],['china','China imperial'],['estepa','Estepas de Asia'],['barbaros','Galos, britanos y vikingos'],['europa','Europa medieval y moderna']];
const ORIGIN_NAME=Object.fromEntries(ORIGINS);
const SK={l:'#f6d2b0',lw:'#f8dcc4',m:'#f0c49c',mt:'#e8b890',t:'#d49a6a',e:'#b8804e',d:'#a8703f'};
const PETS=[
 // ===== MÍTICOS =====
 {id:'pet_zeus',name:'Zeus',rarity:'mítico',origin:'olimpo',act:'bolt',icon:'⚡',glow:'#ffe27a',look:{sk:SK.m,hair:['wild','#f2f2f6'],beard:['long','#f2f2f6'],hd:['laurel','#e8c45a'],tu:'#f6f0e2',ar:['toga','#f6f0e2','#4a7bd0'],skirt:['long','#f6f0e2'],shoe:['sandal','#b07a3a'],cape:'#4a7bd0',it:'bolt',mood:'grin',eye:'#3a6ad0'},desc:'Rey de los dioses del Olimpo, señor del cielo y del rayo.',feats:['Venció a los titanes junto a sus hermanos','Gobierna el Olimpo desde su trono','Su arma es el rayo que forjaron los cíclopes'],say:['¡Que caiga el rayo sobre tu flojera!','Desde el Olimpo te estoy mirando.','Una serie más y te regalo un trueno.']},
 {id:'pet_poseidon',name:'Poseidón',rarity:'mítico',origin:'olimpo',act:'thrust',icon:'🔱',glow:'#6fe3ff',look:{sk:SK.mt,hair:['long','#3c6e8f'],beard:['long','#3c6e8f'],hd:['spikecrown','#e8c45a','#3ecf8e'],tu:'#2f8fa0',ar:['toga','#e9f6f4','#2f8fa0'],skirt:['long','#2f8fa0'],shoe:['sandal','#b07a3a'],it:'trident',mood:'calm',eye:'#1f8a9a'},desc:'Dios de los mares, de los terremotos y de los caballos.',feats:['Recibió los océanos cuando se repartió el mundo con Zeus y Hades','Con su tridente hacía temblar la tierra','Disputó con Atenea el patronazgo de Atenas'],say:['Las olas no descansan, y tú tampoco.','¡Que tiemble el suelo con tus flexiones!']},
 {id:'pet_hades',name:'Hades',rarity:'mítico',origin:'olimpo',act:'cast',icon:'💀',glow:'#9b7bff',look:{sk:'#e2d2c6',hair:['long','#1f1a2e'],beard:['short','#1f1a2e'],hd:['spikecrown','#4a4460','#9b7bff'],tu:'#2a2238',ar:['robe','#2a2238','#9b7bff'],skirt:['long','#2a2238'],shoe:['sandal','#3a2a1a'],cape:'#4a2a6a',it:'bident',mood:'smirk',eye:'#7a5cff'},desc:'Señor del inframundo, guardián de las almas y de las riquezas de la tierra.',feats:['Gobierna el reino de los muertos junto a Perséfone','Su perro Cerbero, de tres cabezas, vigila la entrada','Tiene un casco que lo vuelve invisible'],say:['Nadie escapa del inframundo… ni de esta serie.','Hasta las sombras entrenan.']},
 {id:'pet_odin',name:'Odín',rarity:'mítico',origin:'nordicos',act:'cast',icon:'🐦‍⬛',glow:'#9fc4ff',look:{sk:SK.m,hair:['long','#b9bec6'],beard:['long','#b9bec6'],hd:['wanderer','#3a3f4a'],acc:['eyepatch'],tu:'#3b4a6b',ar:['robe','#3b4a6b','#c9a24a'],skirt:['long','#3b4a6b'],cape:'#2a2f45',shoe:['boot','#3a2a1a'],it:'spear',extra:'raven',mood:'calm',eye:'#3a5a8a'},desc:'Padre de todos los dioses nórdicos, dios de la sabiduría y de la guerra.',feats:['Entregó un ojo para beber del pozo de la sabiduría','Sus cuervos Hugin y Munin le cuentan todo lo que pasa en el mundo','Su lanza Gungnir nunca falla'],say:['Di un ojo por sabiduría; tú da una serie más.','Hugin me contó que hoy todavía no entrenas…']},
 {id:'pet_thor',name:'Thor',rarity:'mítico',origin:'nordicos',act:'slam',icon:'🔨',glow:'#9fd4ff',look:{sk:SK.l,hair:['long','#c0472a'],beard:['full','#c0472a'],tu:'#4a5a3a',ar:['chain','#9aa3ad'],skirt:['kilt','#5a4030'],leg:'#5a4a3a',shoe:['boot','#3a2a1a'],mantle:'#8a6a4a',belt:'#c9a24a',it:'hammer',acc:['gauntlets'],mood:'grin',eye:'#3a7ad0'},desc:'Dios nórdico del trueno, protector de los humanos.',feats:['Su martillo Mjölnir siempre vuelve a su mano','Defiende a dioses y humanos de los gigantes','El jueves lleva su nombre en inglés: Thursday'],say:['¡Una más, por Asgard!','¡Que retumbe el trueno!']},
 {id:'pet_amaterasu',name:'Amaterasu',rarity:'mítico',origin:'japoneses',act:'cast',icon:'☀️',glow:'#ffd35a',look:{sk:SK.lw,hair:['long','#151520'],hd:['sunhalo','#ffcf4a','#e8592a'],tu:'#f7f2ea',ar:['kimono','#c0392b','#e8c45a'],skirt:['long','#c0392b'],shoe:['zori','#c0392b'],it:'mirror',acc:['magatama'],mood:'smile',eye:'#8a3a1a'},desc:'Diosa del sol en el sintoísmo; según la tradición, de ella desciende la familia imperial japonesa.',feats:['Cuando se escondió en una cueva, el mundo quedó a oscuras','La sacaron de ahí con risas, música y un espejo','El espejo Yata no Kagami es uno de los tres tesoros imperiales'],say:['Que tu esfuerzo brille como el sol.','Sin luz no hay sombra; sin serie no hay progreso.']},
 {id:'pet_ra',name:'Ra',rarity:'mítico',origin:'egipcios',act:'cast',icon:'🌞',glow:'#ffb02e',look:{head:'falcon',sk:SK.e,hb:['nemes','#2346a8','#e8c45a'],hd:['sundisk','#ff6a2a','#e8c45a'],tu:SK.e,ar:['bare'],skirt:['kilt','#f4ecd8'],belt:'#e8c45a',shoe:['sandal','#c9a24a'],it:'was',acc:['collar']},desc:'Dios egipcio del sol, que cruzaba el cielo en su barca cada día.',feats:['Cada noche navegaba por el inframundo y renacía al amanecer','Cada noche vencía a la serpiente Apofis','Fue uno de los dioses más venerados de Egipto'],say:['Cada amanecer es una nueva serie.','El sol no se salta ningún día. ¿Y tú?']},
 {id:'pet_cesar',name:'Julio César',rarity:'mítico',origin:'roma',act:'salute',icon:'👑',look:{sk:SK.mt,hair:['short','#4a3020'],hd:['laurel','#e8c45a'],tu:'#b0302a',ar:['musc','#d9a441'],skirt:['pteruges','#b0302a'],shoe:['sandal','#8a5a2b'],cape:'#a61e2a',it:'gladius',mood:'smile'},desc:'General y dictador romano (100–44 a. C.).',feats:['Conquistó la Galia y venció en Alesia (52 a. C.)','Cruzó el Rubicón en el 49 a. C.: «Alea iacta est»','Su calendario juliano es la base del que usamos hoy','Dijo «Veni, vidi, vici» tras su victoria en Zela'],say:['Veni, vidi, vici.','Alea iacta est: hoy se entrena.']},
 {id:'pet_alejandro',name:'Alejandro Magno',rarity:'mítico',origin:'grecia',act:'thrust',icon:'🐴',look:{sk:SK.l,hair:['curly','#e8b84e'],hd:['boeotian','#c9a24a','#f4f4f4'],tu:'#f4ecd8',ar:['linen','#f4ecd8','#d9a441'],skirt:['pteruges','#f4ecd8'],shoe:['sandal','#8a5a2b'],cape:'#6a2c8a',it:'spear',mood:'grin',eye:'#4a7a3a'},desc:'Rey de Macedonia (356–323 a. C.).',feats:['No perdió ninguna de sus grandes batallas','Derrotó al Imperio persa en Gránico, Isos y Gaugamela','Fundó más de 20 ciudades, entre ellas Alejandría','Llegó hasta la India antes de cumplir 30 años'],say:['Nada es imposible para quien lo intenta.','¡Hasta el fin del mundo, una serie a la vez!']},
 {id:'pet_napoleon',name:'Napoleón Bonaparte',rarity:'mítico',origin:'europa',act:'point',icon:'🎖️',look:{sk:SK.lw,hair:['short','#3a2a1a'],hd:['bicorne','#1a1a22','#e8c45a'],tu:'#1f3a8a',ar:['coat','#1f3a8a','#f4f4f4'],leg:'#f4f4f4',shoe:['boot','#15151c'],it:'spyglass',acc:['epaul'],mood:'calm',eye:'#3a5a8a'},desc:'Emperador de los franceses (1769–1821).',feats:['Su gran victoria fue Austerlitz (1805)','Su Código Civil inspiró leyes en muchos países, también el Código Civil chileno','Llegó a dominar gran parte de Europa'],say:['Imposible no es una palabra francesa.','La victoria es del más perseverante.']},
 // ===== LEGENDARIOS =====
 {id:'pet_ares',name:'Ares',rarity:'legendario',origin:'olimpo',act:'thrust',icon:'🗡️',glow:'#ff5a5a',look:{sk:SK.mt,hair:['short','#2a1a1a'],beard:['short','#2a1a1a'],hd:['corup','#8a5a2a','#1a1a22'],tu:'#7a1f1f',ar:['musc','#9a6a2a'],skirt:['pteruges','#7a1f1f'],shoe:['sandal','#5a3a1a'],cape:'#5a1010',it:'spear',sh:['aspis','#8a5a2a','#c0392b'],mood:'serious',eye:'#a01f1f'},desc:'Dios griego de la guerra, del valor y de la furia del combate.',feats:['Hijo de Zeus y Hera','Lo acompañaban Fobos y Deimos, el miedo y el terror','Los romanos lo veneraron como Marte'],say:['¡A la batalla contra la flojera!','El dolor de hoy es la fuerza de mañana.']},
 {id:'pet_afrodita',name:'Afrodita',rarity:'legendario',origin:'olimpo',act:'cast',icon:'🐚',glow:'#ff9ec4',look:{sk:SK.lw,hair:['wavy','#f2c04a'],hd:['shell','#ffd1dd','#ff9ec4'],tu:'#ffc2d4',ar:['chiton','#ffd1dd','#e8c45a'],skirt:['long','#ffc2d4'],shoe:['sandal','#e8c45a'],it:'apple',acc:['pearls'],mood:'smile',eye:'#3a8aa8'},desc:'Diosa griega del amor y la belleza, nacida de la espuma del mar.',feats:['Ganó la manzana de oro en el juicio de Paris','Su favor desató la guerra de Troya','Los romanos la llamaron Venus'],say:['Quiérete lo suficiente para entrenar hoy.','La constancia también es belleza.']},
 {id:'pet_persefone',name:'Perséfone',rarity:'legendario',origin:'olimpo',act:'cast',icon:'🌺',glow:'#ff9ec4',look:{sk:SK.lw,hair:['swept','#3a1f2a'],hd:['flowers','#ff7aa8','#f4f4f4'],tu:'#2f5a3a',ar:['chiton','#2f5a3a','#e8c45a'],skirt:['long','#2a4a32'],shoe:['sandal','#8a5a2b'],it:'pomegranate',mood:'smile',eye:'#6a2a4a'},desc:'Diosa de la primavera y reina del inframundo.',feats:['Pasa medio año en el inframundo y medio año en la tierra','Su regreso cada año trae la primavera','Comió semillas de granada en el reino de Hades'],say:['Después del invierno siempre vuelve la primavera.','Cada semilla de esfuerzo florece.']},
 {id:'pet_freya',name:'Freya',rarity:'legendario',origin:'nordicos',act:'swing',icon:'🪶',glow:'#ffd88a',look:{sk:SK.lw,hair:['braids','#f2d06a'],hd:['circlet','#e8c45a','#ff9a2a'],tu:'#5a7a8f',ar:['robe','#5a7a8f','#e8c45a'],mantle:'#f0e6d8',skirt:['long','#4a6a7f'],shoe:['boot','#5a3a22'],it:'longsword',acc:['brisingamen'],mood:'smile',eye:'#3a7ab0'},desc:'Diosa nórdica del amor, la magia y la guerra, líder de las valquirias.',feats:['Recibe a la mitad de los guerreros caídos en su salón, Fólkvangr','Tiene un manto de plumas de halcón para volar','Viaja en un carro tirado por gatos'],say:['Hasta las valquirias calientan antes de pelear.','¡Que tu fuerza vuele alto!']},
 {id:'pet_anubis',name:'Anubis',rarity:'legendario',origin:'egipcios',act:'cast',icon:'⚖️',glow:'#e8c45a',look:{head:'jackal',sk:SK.d,hb:['nemes','#1f1d26','#e8c45a'],tu:SK.d,ar:['bare'],skirt:['kilt','#f4ecd8'],belt:'#e8c45a',shoe:['sandal','#c9a24a'],it:'scales',acc:['collar']},desc:'Dios egipcio con cabeza de chacal, guía de las almas y protector de los muertos.',feats:['Pesaba el corazón de los muertos contra la pluma de Maat','Era el patrón de los embalsamadores','Guiaba a las almas por el inframundo'],say:['Tu corazón pesa poco: sigue así.','Vigilo tus récords desde el Duat.']},
 {id:'pet_susanoo',name:'Susanoo',rarity:'legendario',origin:'japoneses',act:'swing',icon:'🌪️',glow:'#6fb8ff',look:{sk:SK.m,hair:['wild','#151520'],beard:['short','#151520'],hd:['headband','#2a7bd5'],tu:'#2a3a5a',ar:['lamellar','#3a4a6a','#c0392b'],skirt:['hakama','#1f2a44'],shoe:['boot','#2a2a2a'],it:'tsurugi',mood:'grin',eye:'#2a5aa8'},desc:'Dios sintoísta de las tormentas y del mar, hermano de Amaterasu.',feats:['Venció a Yamata no Orochi, la serpiente de ocho cabezas','Dentro de la serpiente encontró la espada Kusanagi','Su travesura hizo que Amaterasu se escondiera en una cueva'],say:['¡Que venga la tormenta, que yo sigo!','La serpiente tenía ocho cabezas; tú solo tienes que hacer ocho repeticiones.']},
 {id:'pet_tsukuyomi',name:'Tsukuyomi',rarity:'legendario',origin:'japoneses',act:'cast',icon:'🌙',glow:'#a8c4ff',look:{sk:'#f4e8de',hair:['long','#d8dce8'],hd:['moonhalo','#cfe0ff','#8aa8ff'],tu:'#1f2a5c',ar:['kimono','#3a4a8f','#cfe0ff'],skirt:['long','#1f2a5c'],shoe:['zori','#3a4a8f'],it:'moonorb',mood:'calm',eye:'#5a6aa8'},desc:'Dios sintoísta de la luna, hermano de Amaterasu y Susanoo.',feats:['Nació del ojo derecho de Izanagi','Gobierna la noche mientras su hermana gobierna el día','Por eso, dice el mito, el sol y la luna nunca se encuentran'],say:['Hasta la luna tiene fases: tú no te rindas.','La noche también sirve para entrenar.']},
 {id:'pet_izanagi',name:'Izanagi',rarity:'legendario',origin:'japoneses',act:'thrust',icon:'🗾',glow:'#ffe2a8',look:{sk:SK.l,hair:['mizura','#151520'],tu:'#f4f1ea',ar:['kofun','#f4f1ea','#c0392b'],skirt:['hakama','#f4f1ea'],shoe:['zori','#8a5a2b'],it:'jewelspear',acc:['magatama'],mood:'smile'},desc:'Dios creador del sintoísmo, que formó las islas de Japón junto a Izanami.',feats:['Agitó el océano con la lanza enjoyada y nacieron las primeras islas','De su purificación nacieron Amaterasu, Tsukuyomi y Susanoo','Bajó al inframundo, Yomi, a buscar a Izanami'],say:['Con un poco de esfuerzo se crean islas enteras.','Construye tu propia isla de constancia.']},
 {id:'pet_izanami',name:'Izanami',rarity:'legendario',origin:'japoneses',act:'cast',icon:'🌸',glow:'#ff9ec4',look:{sk:'#f6e6da',hair:['swept','#151520'],hd:['comb','#e8c45a','#ff7aa8'],tu:'#f4f1ea',ar:['kofun','#f4f1ea','#8a2a5a'],skirt:['long','#8a2a5a'],shoe:['zori','#f4f4f4'],it:'magatama',mood:'smile',eye:'#5a2a4a'},desc:'Diosa creadora del sintoísmo, compañera de Izanagi y luego reina de Yomi.',feats:['Dio a luz a las islas y a muchos dioses de Japón','Se convirtió en la señora del inframundo, Yomi','Su historia explica el ciclo de la vida y la muerte'],say:['Todo lo que nace, crece. Tus músculos también.','Desde Yomi aplaudo tu racha.']},
 {id:'pet_aquiles',name:'Aquiles',rarity:'legendario',origin:'heroes',act:'thrust',icon:'🏺',look:{sk:SK.m,hair:['curly','#e8b84e'],hd:['corup','#e8c45a','#1a1a22'],tu:'#f4ecd8',ar:['musc','#e8c45a'],skirt:['pteruges','#f4ecd8'],shoe:['sandal','#8a5a2b'],cape:'#2a4f8a',it:'spear',sh:['aspis','#e8c45a','#9a6a1a','sun'],mood:'grin',eye:'#3a7a3a'},desc:'El mayor guerrero aqueo de la guerra de Troya.',feats:['Es el protagonista de la «Ilíada» de Homero','Venció a Héctor frente a las murallas de Troya','Era casi invulnerable, salvo por el talón'],say:['¡Cuidado con el talón, que lo demás aguanta!','Mi gloria se construye serie a serie.']},
 {id:'pet_hector',name:'Héctor',rarity:'legendario',origin:'heroes',act:'thrust',icon:'🐎',look:{sk:SK.mt,hair:['short','#3a2a1a'],beard:['short','#3a2a1a'],hd:['corup','#d8dde4','#2a5aa8'],tu:'#2a4f8a',ar:['musc','#c9ced6'],skirt:['pteruges','#2a4f8a'],shoe:['sandal','#5a3a1a'],cape:'#1f3a6b',it:'spear',sh:['aspis','#c9ced6','#2a5aa8','horse'],mood:'calm'},desc:'Príncipe de Troya y su mayor defensor en la «Ilíada».',feats:['Lideró la defensa de Troya durante diez años','Llegó a incendiar las naves de los griegos','Homero lo llama «Héctor, el del casco brillante»'],say:['Defiendo mi racha como a Troya.','El deber primero, el sillón después.']},
 {id:'pet_heracles',name:'Heracles',rarity:'legendario',origin:'heroes',act:'flex',icon:'🦁',look:{sk:SK.t,hair:['curly','#3a2a1a'],beard:['full','#3a2a1a'],hd:['lionpelt','#d9a441','#a8702a'],tu:SK.t,ar:['bare'],bulk:1,skirt:['kilt','#d9a441'],shoe:['sandal','#6b4423'],it:'club',mood:'grin'},desc:'Semidiós hijo de Zeus, el más fuerte de los héroes griegos.',feats:['Completó los doce trabajos','Venció al león de Nemea y a la Hidra de Lerna','Sostuvo el cielo en lugar de Atlas'],say:['¿Doce trabajos? Dame doce series.','El león de Nemea entrenaba menos que tú.']},
 {id:'pet_odiseo',name:'Odiseo',rarity:'legendario',origin:'heroes',act:'bow',icon:'⛵',look:{sk:SK.mt,hair:['curly','#4a3020'],beard:['short','#4a3020'],hd:['pilos','#a8794a'],tu:'#3a6a8a',ar:['chiton','#e9dcc0','#3a6a8a'],skirt:['kilt','#e9dcc0'],shoe:['sandal','#6b4423'],cape:'#8a3a2a',it:'bow',mood:'smirk'},desc:'Rey de Ítaca, el más astuto de los héroes griegos.',feats:['Ideó el caballo de Troya','Su viaje de regreso a casa duró diez años, según la «Odisea»','Tensó el arco que nadie más pudo tensar'],say:['Diez años para volver a casa; tú solo vuelve a la barra.','La astucia gana guerras; la constancia, rangos.']},
 {id:'pet_augusto',name:'Octavio Augusto',rarity:'legendario',origin:'roma',act:'salute',icon:'🏛️',look:{sk:SK.l,hair:['short','#6a4a2a'],hd:['laurel','#5f9a3a'],tu:'#f4ecd8',ar:['toga','#f4ecd8','#6a2c8a'],skirt:['long','#f4ecd8'],shoe:['sandal','#8a5a2b'],mood:'calm'},desc:'Primer emperador de Roma (63 a. C.–14 d. C.).',feats:['Venció a Marco Antonio y Cleopatra en Actium (31 a. C.)','Inició la Pax Romana, cerca de dos siglos de relativa paz','Gobernó como emperador más de 40 años','«Encontré una Roma de ladrillo y la dejé de mármol»'],say:['Festina lente: apresúrate despacio.','Encontré una rutina de ladrillo y la dejaré de mármol.']},
 {id:'pet_anibal',name:'Aníbal Barca',rarity:'legendario',origin:'cartago',act:'thrust',icon:'🐘',look:{sk:SK.t,hair:['curly','#1a1a1a'],beard:['full','#1a1a1a'],hd:['carthage','#c58b3a','#c0392b'],tu:'#6a2c8a',ar:['linen','#e9dcc0','#c9a24a'],skirt:['pteruges','#6a2c8a'],shoe:['sandal','#6b4423'],cape:'#6a2c8a',it:'spear',extra:'elephant',mood:'grin'},desc:'General cartaginés (247–c. 183 a. C.), la pesadilla de Roma.',feats:['Cruzó los Alpes con elefantes de guerra (218 a. C.)','Aniquiló a un ejército romano mucho mayor en Cannas (216 a. C.)','Su táctica de Cannas se estudia hasta hoy'],say:['Encontraré un camino, o lo haré.','Crucé los Alpes con elefantes; tú puedes con una serie.']},
 {id:'pet_leonidas',name:'Leónidas I',rarity:'legendario',origin:'grecia',act:'thrust',icon:'🛡️',look:{sk:SK.mt,hair:['short','#2b1d14'],beard:['full','#2b1d14'],hd:['corup','#c58b3a','#b0302a'],tu:'#a52a2a',ar:['musc','#c58b3a'],skirt:['pteruges','#a52a2a'],shoe:['sandal','#6b4423'],cape:'#a52a2a',it:'spear',sh:['aspis','#c58b3a','#7a1f14','lambda'],mood:'serious'},desc:'Rey de Esparta, caído en las Termópilas (480 a. C.).',feats:['Con 300 espartanos y aliados griegos frenó al ejército persa','Resistió tres días en el paso de las Termópilas','Su sacrificio inspiró a toda Grecia'],say:['Molṑn labé: ven a buscarlas.','Una serie más, por Esparta.']},
 {id:'pet_gengis',name:'Gengis Kan',rarity:'legendario',origin:'estepa',act:'bow',icon:'🏹',look:{sk:SK.mt,hair:['short','#1a1a1a'],beard:['fu','#1a1a1a'],hd:['furcone','#2346a8','#8a6a3a'],tu:'#2346a8',ar:['deel','#2346a8','#e8a33a'],skirt:['kilt','#2346a8'],leg:'#3a2a1a',shoe:['boot','#5a3a22'],it:'recurve',mood:'grin'},desc:'Fundador del Imperio mongol (c. 1162–1227).',feats:['Unificó a las tribus mongolas en 1206','Su imperio llegó a ser el mayor imperio terrestre continuo de la historia','Creó el yam, un sistema de postas a caballo'],say:['Un arquero a caballo no descansa.','La estepa es larga; tu racha también puede serlo.']},
 {id:'pet_ramses',name:'Ramsés II',rarity:'legendario',origin:'egipto',act:'swing',icon:'𓂀',look:{sk:SK.e,hd:['khepresh','#2346a8','#e8c45a'],tu:'#f4ecd8',ar:['linen','#f4ecd8','#e8c45a'],skirt:['kilt','#f4ecd8'],belt:'#e8c45a',shoe:['sandal','#c9a24a'],it:'khopesh',acc:['collar'],mood:'smirk'},desc:'Faraón de Egipto (c. 1303–1213 a. C.), llamado Ramsés el Grande.',feats:['Reinó cerca de 66 años','Mandó construir los templos de Abu Simbel','Firmó con los hititas uno de los primeros tratados de paz conocidos'],say:['Reiné 66 años sin saltarme un entrenamiento.','Construye tu Abu Simbel, repetición a repetición.']},
 {id:'pet_cleopatra',name:'Cleopatra VII',rarity:'legendario',origin:'egipto',act:'salute',icon:'🐍',look:{sk:'#d9a07a',hair:['bob','#111118'],hd:['diadem','#e8c45a'],tu:'#f4ecd8',ar:['linen','#f4ecd8','#e8c45a'],skirt:['long','#f4ecd8'],shoe:['sandal','#c9a24a'],it:'ankh',acc:['collar'],mood:'smile',eye:'#2a6a4a'},desc:'Última reina del Egipto ptolemaico (69–30 a. C.).',feats:['Gobernó Egipto cerca de 21 años','Fue la primera de su dinastía en aprender egipcio y hablaba varios idiomas','Se alió con Julio César y con Marco Antonio'],say:['Hablo muchos idiomas, y en todos te digo: entrena.','Una reina no se rinde.']},
 {id:'pet_musashi',name:'Miyamoto Musashi',rarity:'legendario',origin:'japon',act:'swing',icon:'⚔️',look:{sk:SK.l,hair:['bun','#1a1a1a'],beard:['short','#1a1a1a'],tu:'#5a5f6a',ar:['kimono','#2a2a32'],skirt:['hakama','#3a3f4a'],shoe:['zori','#3a2a1a'],it:'katana',it2:'wakizashi',mood:'serious'},desc:'Espadachín japonés (c. 1584–1645), maestro de las dos espadas.',feats:['Dijo no haber perdido ninguno de sus más de 60 duelos','Fundó el estilo de dos espadas Niten Ichi-ryū','Escribió «El libro de los cinco anillos»'],say:['Hoy vence a quien fuiste ayer.','El camino está en el entrenamiento.']},
 // ===== ÉPICOS =====
 {id:'pet_marcoaurelio',name:'Marco Aurelio',rarity:'épico',origin:'roma',act:'read',icon:'📜',look:{sk:SK.m,hair:['curly','#5a3a22'],beard:['full','#5a3a22'],hd:['laurel','#5f9a3a'],tu:'#ece3cf',ar:['toga','#ece3cf','#6a2c8a'],skirt:['long','#ece3cf'],shoe:['sandal','#6b4423'],it:'scroll',mood:'calm'},desc:'Emperador romano (121–180) y filósofo estoico.',feats:['Escribió las «Meditaciones», que se siguen leyendo hoy','Fue el último de los llamados Cinco Buenos Emperadores','Defendió la frontera del Danubio en las guerras marcomanas'],say:['Tienes poder sobre tu mente, no sobre lo que pasa afuera.','Lo que se interpone en el camino se vuelve el camino.']},
 {id:'pet_agripa',name:'Marco Vipsanio Agripa',rarity:'épico',origin:'roma',act:'swing',icon:'⚓',look:{sk:SK.mt,hair:['short','#3a2a1a'],hd:['crown','#e8c45a','#2a7bd5'],tu:'#2a4f8a',ar:['musc','#c9a24a'],skirt:['pteruges','#2a4f8a'],shoe:['sandal','#6b4423'],cape:'#1f3a6b',it:'gladius',mood:'serious'},desc:'General, almirante y mano derecha de Augusto (c. 63–12 a. C.).',feats:['Ganó la batalla naval de Actium (31 a. C.)','Construyó el primer Panteón de Roma','Amplió los acueductos y abrió grandes termas públicas'],say:['Gané Actium; tú gana el día de hoy.','Un buen almirante no abandona el barco.']},
 {id:'pet_escipion',name:'Escipión el Africano',rarity:'épico',origin:'roma',act:'salute',icon:'🦅',look:{sk:SK.mt,hair:['short','#3a2a1a'],hd:['galea','#e0c27a','#f4f4f4'],tu:'#7a1f2a',ar:['musc','#d4b06a'],skirt:['pteruges','#7a1f2a'],shoe:['sandal','#6b4423'],cape:'#7a1f2a',it:'gladius',sh:['scutum','#7a1f2a','#e8c45a'],mood:'smile'},desc:'General romano (236–183 a. C.), el hombre que venció a Aníbal.',feats:['Derrotó a Aníbal en Zama (202 a. C.)','Puso fin a la Segunda Guerra Púnica','Tomó Cartago Nova, en Hispania, con un ataque audaz'],say:['Estudié a mi rival hasta vencerlo.','Zama empezó con un buen entrenamiento.']},
 {id:'pet_espartaco',name:'Espartaco',rarity:'épico',origin:'roma',act:'swing',icon:'⛓️',look:{sk:SK.t,hair:['short','#3a2414'],beard:['short','#3a2414'],hd:['gladhelm','#9aa3ad','#c0392b'],tu:SK.t,ar:['bare'],skirt:['kilt','#e9dcc0'],belt:'#6b4423',shoe:['sandal','#6b4423'],it:'sica',sh:['parmula','#8a5a2b','#c9a24a'],acc:['chains'],mood:'grin'},desc:'Gladiador tracio que desafió a Roma (c. 103–71 a. C.).',feats:['Encabezó la mayor rebelión de esclavos contra Roma (73–71 a. C.)','Su ejército llegó a reunir a decenas de miles de personas','Derrotó a varias legiones antes de caer ante Craso'],say:['Rompe tus cadenas: la primera es la flojera.','¡Libertad o una serie más!']},
 {id:'pet_atila',name:'Atila',rarity:'épico',origin:'estepa',act:'bow',icon:'🐎',look:{sk:SK.mt,hair:['short','#1a1a1a'],beard:['fu','#1a1a1a'],hd:['furhat','#6b4423','#c9a27a'],tu:'#7a2f1f',ar:['lamellar','#8a6a3a'],skirt:['kilt','#5a3a2a'],leg:'#5a3a2a',shoe:['boot','#3a2a1a'],it:'recurve',mood:'grin'},desc:'Rey de los hunos (c. 406–453), llamado «el azote de Dios».',feats:['Gobernó un imperio desde el Rin hasta el mar Negro','Puso en jaque a Roma de Oriente y de Occidente','Sus arqueros a caballo eran temidos en toda Europa'],say:['Por donde paso no crece la flojera.','Mi caballo y yo no conocemos el descanso.']},
 {id:'pet_nobunaga',name:'Oda Nobunaga',rarity:'épico',origin:'japon',act:'aim',icon:'🏯',look:{sk:SK.l,hd:['kabuto','#1a1a22','#e8c45a','horns'],tu:'#7a1f1f',ar:['lamellar','#1a1a22','#c0392b'],cape:'#7a1f1f',skirt:['kilt','#2a2a32'],leg:'#2a2a32',shoe:['boot','#1a1a22'],it:'musket',mood:'smirk'},desc:'Daimio japonés (1534–1582) que inició la unificación de Japón.',feats:['Venció a un ejército mucho mayor en Okehazama (1560)','Usó arcabuces de forma masiva en Nagashino (1575)','Abrió el camino a la unificación del país'],say:['Si el cuco no canta, que haga flexiones.','La unificación empieza por tu rutina.']},
 {id:'pet_tomoe',name:'Tomoe Gozen',rarity:'épico',origin:'japon',act:'thrust',icon:'🌸',look:{sk:SK.lw,hair:['pony','#111118'],hd:['headband','#f4f4f4'],tu:'#a52a2a',ar:['lamellar','#a52a2a','#f4f4f4'],skirt:['hakama','#2a2f45'],shoe:['zori','#2a2a2a'],it:'naginata',mood:'grin'},desc:'Guerrera onna-musha del siglo XII, en las guerras Genpei.',feats:['El «Cantar de Heike» la describe como arquera y jinete formidable','Según el relato, valía por mil guerreros','Es símbolo de las mujeres samurái'],say:['Vale por mil quien no falta a entrenar.','Mi naginata y yo estamos listas.']},
 {id:'pet_guanyu',name:'Guan Yu',rarity:'épico',origin:'china',act:'swing',icon:'🐉',look:{sk:'#c8473a',hair:['bun','#111118'],beard:['guan','#111118'],hd:['futou','#2f6b4a','#c0392b'],tu:'#2f8a5a',ar:['robe','#2f8a5a','#e8c45a'],skirt:['long','#2f6b4a'],shoe:['boot','#1a1a22'],it:'guandao',mood:'calm'},desc:'General chino de la época de los Tres Reinos (m. 220), símbolo de lealtad.',feats:['Fue uno de los generales más leales de Liu Bei','Su larga barba le valió el apodo de «Señor de la hermosa barba»','Con los siglos fue venerado como dios de la guerra y de la lealtad'],say:['La lealtad a tu rutina es lo primero.','Mi guja pesa más que tu excusa.']},
 {id:'pet_juana',name:'Juana de Arco',rarity:'épico',origin:'europa',act:'banner',icon:'⚜️',look:{sk:SK.lw,hair:['bob','#5a3a22'],tu:'#c9ced6',ar:['plate','#c9ced6'],leg:'#9aa3ad',shoe:['boot','#7a828c'],it:'banner',mood:'grin',eye:'#3a6aa8'},desc:'Heroína francesa (c. 1412–1431) de la Guerra de los Cien Años.',feats:['Con 17 años ayudó a levantar el asedio de Orleans (1429)','Llevó a Carlos VII a coronarse en Reims','Es patrona de Francia'],say:['No tengo miedo: nací para esto.','¡Adelante, que el asedio no se levanta solo!']},
 {id:'pet_ricardo',name:'Ricardo Corazón de León',rarity:'épico',origin:'europa',act:'swing',icon:'🦁',look:{sk:SK.l,hair:['short','#c9822a'],beard:['short','#c9822a'],hd:['coifcrown','#c9ced6','#e8c45a'],tu:'#b0302a',ar:['surcoat','#b0302a','#e8c45a'],skirt:['kilt','#b0302a'],leg:'#9aa3ad',shoe:['boot','#7a828c'],it:'longsword',sh:['kite','#b0302a','#e8c45a'],mood:'grin',eye:'#3a6aa8'},desc:'Rey de Inglaterra (1157–1199), famoso guerrero de la Tercera Cruzada.',feats:['Ganó la batalla de Arsuf (1191)','Pasó casi todo su reinado lejos de Inglaterra, combatiendo','Su apodo viene de su valentía en batalla'],say:['Corazón de león, piernas de acero.','¡A la carga!']},
 {id:'pet_perseo',name:'Perseo',rarity:'épico',origin:'heroes',act:'swing',icon:'🪞',look:{sk:SK.l,hair:['curly','#5a3a22'],hd:['wingcap','#c9ced6','#f4f4f4'],tu:'#c0392b',ar:['chiton','#f4ecd8','#c0392b'],skirt:['kilt','#f4ecd8'],shoe:['wingsandal','#c9a24a'],it:'harpe',sh:['mirror','#e8eef4','#c9a24a'],mood:'grin'},desc:'Héroe griego que venció a la gorgona Medusa.',feats:['Venció a Medusa mirándola solo en el reflejo de su escudo','Usó sandalias aladas y un casco de invisibilidad','Rescató a Andrómeda del monstruo marino'],say:['No mires a la flojera a los ojos.','Con sandalias aladas, hasta la trotadora es fácil.']},
 {id:'pet_orion',name:'Orión',rarity:'épico',origin:'heroes',act:'swing',icon:'✨',glow:'#cfe0ff',look:{sk:SK.t,hair:['long','#2a1f1a'],beard:['short','#2a1f1a'],tu:'#6b4b2a',ar:['leather','#8a5a2b'],belt:'#2a2f45',acc:['starbelt'],skirt:['kilt','#8a6a3a'],shoe:['boot','#5a3a22'],it:'club',sh:['pelt','#c9a27a','#8a6a3a'],mood:'grin'},desc:'Gigante cazador de la mitología griega, convertido en constelación.',feats:['Fue el cazador más famoso de los mitos griegos','Zeus lo puso en el cielo como constelación','Su cinturón, las Tres Marías, se ve en el cielo de Chile en verano'],say:['Las Tres Marías te miran: no aflojes.','A la caza del próximo récord.']},
 // ===== RAROS =====
 {id:'pet_teseo',name:'Teseo',rarity:'raro',origin:'heroes',act:'swing',icon:'🧶',look:{sk:SK.l,hair:['curly','#3a2a1a'],hd:['headband','#2a7bd5'],tu:'#2a7bd5',ar:['chiton','#f4ecd8','#2a7bd5'],skirt:['kilt','#f4ecd8'],shoe:['sandal','#8a5a2b'],it:'gladius',it2:'thread',mood:'grin'},desc:'Héroe ateniense que venció al Minotauro.',feats:['Entró al laberinto de Creta y venció al Minotauro','Salió gracias al hilo que le dio Ariadna','Llegó a ser rey de Atenas'],say:['Siempre hay una salida del laberinto.','Sigue el hilo de tu racha.']},
 {id:'pet_vercingetorix',name:'Vercingétorix',rarity:'raro',origin:'barbaros',act:'swing',icon:'🗡️',look:{sk:SK.l,hair:['long','#d9a441'],beard:['stache','#d9a441'],hd:['winged','#c58b3a','#f4f4f4'],tu:'#2f6b3a',ar:['chain','#9aa3ad'],leg:'#8a3a2a',shoe:['boot','#4a3020'],cape:'#2f6b3a',it:'longsword',sh:['oval','#2f6b3a','#c9a24a'],acc:['torc'],mood:'grin'},desc:'Caudillo de los arvernos que unió a la Galia contra César (c. 82–46 a. C.).',feats:['Unió por primera vez a decenas de tribus galas','Venció a César en Gergovia (52 a. C.)','Resistió el asedio de Alesia hasta el final'],say:['¡Por la Galia y por una serie más!','Gergovia se ganó con piernas fuertes.']},
 {id:'pet_boudica',name:'Boudica',rarity:'raro',origin:'barbaros',act:'thrust',icon:'🔥',look:{sk:'#f8dcc8',hair:['wavy','#c8471f'],tu:'#2f6b3a',ar:['chiton','#2f6b3a','#c9a24a'],skirt:['long','#2f6b3a'],cape:'#8a3a2a',shoe:['boot','#4a3020'],it:'spear',sh:['oval','#8a3a2a','#c9a24a'],acc:['torc'],mood:'grin',eye:'#3a7a3a'},desc:'Reina de los icenos de Britania (m. c. 61 d. C.).',feats:['Lideró una gran revuelta contra Roma','Arrasó Camulodunum, Londinium y Verulamium','Tiene una estatua junto al puente de Westminster'],say:['¡Ni Roma me detuvo, menos la flojera!','A la carga, sin miedo.']},
 {id:'pet_ragnar',name:'Ragnar Lodbrok',rarity:'raro',origin:'barbaros',act:'swing',icon:'⛵',look:{sk:SK.l,hair:['braids','#c9a061'],beard:['long','#c9a061'],tu:'#3a3f4a',ar:['leather','#5a4030'],mantle:'#7a6a56',skirt:['kilt','#4a3a2a'],leg:'#4a3a2a',shoe:['boot','#3a2a1a'],it:'axe',sh:['round','#2a4f8a','#e8e2d0'],mood:'grin',eye:'#3a7ab0'},desc:'Héroe vikingo de las sagas nórdicas del siglo IX.',feats:['Las sagas le atribuyen incursiones en Francia e Inglaterra','Es el padre legendario de grandes caudillos vikingos','Su historia mezcla hechos y leyenda'],say:['¡Al barco, que se va la marea!','Un vikingo no se salta el remo.']},
 {id:'pet_carlomagno',name:'Carlomagno',rarity:'raro',origin:'europa',act:'salute',icon:'👑',look:{sk:SK.l,hair:['long','#ececf0'],beard:['long','#ececf0'],hd:['crown','#e8c45a','#c0392b'],tu:'#2346a8',ar:['robe','#2346a8','#e8c45a'],skirt:['long','#2346a8'],cape:'#b0302a',shoe:['boot','#3a2a1a'],it:'longsword',it2:'globe',mood:'calm'},desc:'Rey de los francos y emperador (c. 742–814), llamado «padre de Europa».',feats:['Unió gran parte de Europa occidental bajo su reino','Fue coronado emperador en Roma el año 800','Impulsó escuelas y la copia de libros antiguos'],say:['Un imperio se construye día a día.','La constancia también se corona.']},
 {id:'pet_date',name:'Date Masamune',rarity:'raro',origin:'japon',act:'swing',icon:'🌙',look:{sk:SK.l,hd:['kabuto','#1a1a22','#e8c45a','crescent'],acc:['eyepatchR'],tu:'#1a1a22',ar:['lamellar','#1a1a22','#e8c45a'],skirt:['kilt','#1a1a22'],leg:'#2a2a32',shoe:['boot','#1a1a22'],it:'katana',mood:'smirk'},desc:'Daimio japonés (1567–1636), conocido como el «dragón de un ojo».',feats:['Perdió el ojo derecho de niño por la viruela','Su casco con una gran media luna es de los más famosos de Japón','Fundó la ciudad de Sendai'],say:['Con un ojo me basta para ver tu progreso.','El dragón de un ojo no se salta días.']},
 {id:'pet_suntzu',name:'Sun Tzu',rarity:'raro',origin:'china',act:'read',icon:'🎋',look:{sk:SK.l,hair:['bun','#2a2a32'],beard:['long','#3a3a42'],hd:['guan','#1a1a22','#e8c45a'],tu:'#8a2a2a',ar:['robe','#8a2a2a','#e8c45a'],skirt:['long','#6a1f1f'],shoe:['boot','#1a1a22'],it:'bamboo',mood:'calm'},desc:'General y estratega chino, autor de «El arte de la guerra» (s. VI–V a. C.).',feats:['Escribió «El arte de la guerra», que se lee hasta hoy','Enseñó que la mejor victoria es vencer sin combatir','Sus ideas se usan en deportes, negocios y estrategia'],say:['La victoria se prepara antes del combate.','Conoce a tu rival… y a tu flojera.']},
 {id:'pet_qin',name:'Qin Shi Huang',rarity:'raro',origin:'china',act:'salute',icon:'🏯',look:{sk:SK.l,hair:['bun','#111118'],beard:['stache','#111118'],hd:['mianguan','#1a1a22','#e8c45a'],tu:'#1a1a22',ar:['robe','#1a1a22','#c0392b'],skirt:['long','#1a1a22'],shoe:['boot','#1a1a22'],it:'longsword',mood:'serious'},desc:'Primer emperador de la China unificada (259–210 a. C.).',feats:['Unificó China en el 221 a. C.','Unificó la escritura, las monedas y las medidas','En su tumba lo acompañan miles de guerreros de terracota'],say:['Unifica tu rutina como yo unifiqué China.','Ni la Gran Muralla se hizo en un día.']}
];
for(const p of PETS){p.type='companero';if(p.rarity==='legendario'||p.rarity==='mítico'){p.only=true;p.chest=true}}
const PET_BY=Object.fromEntries(PETS.map(p=>[p.id,p]));
CATALOG.push(...CH_CATALOG,...PETS);
if(!IS_WEB)for(const c of CH_CATALOG.concat(PETS))CAT_BY_ID[c.id]=c;
const CH_DROPS=CH_CATALOG.filter(c=>!c.noDrop).concat(PETS);

/* ================= motor de sprites (estilo anime chibi) ================= */
function shd(hex,f){if(!hex||hex[0]!=='#'||hex.length!==7)return hex;const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;const t=f<0?0:255,p=Math.abs(f);r=Math.round((t-r)*p+r);g=Math.round((t-g)*p+g);b=Math.round((t-b)*p+b);return'#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)}
const STEEL='#dde2e8',GOLD='#e2b54a',WOOD='#8a5a2b';
function itemArt(k){switch(k){
 case'trident':return`<rect x="-.5" y="-18" width="1" height="26" rx=".5" fill="#c9a24a" stroke="#2b1e35" stroke-width=".35"/><path d="M-3.4-18.4H3.4M-3.4-18.4V-23.2M0-18.4V-25.4M3.4-18.4V-23.2" stroke="#e8d28a" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M-3.4-24.6l.9 1.6h-1.8ZM0-26.8l.9 1.6h-1.8ZM3.4-24.6l.9 1.6h-1.8Z" fill="#f4e6a8"/>`;
 case'bident':return`<rect x="-.5" y="-18" width="1" height="26" rx=".5" fill="#3a3550" stroke="#9b7bff" stroke-width=".3"/><path d="M-2.4-18.2H2.4M-2.4-18.2V-24M2.4-18.2V-24" stroke="#b9b4d8" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M-2.4-25.6l.9 1.8h-1.8ZM2.4-25.6l.9 1.8h-1.8Z" fill="#d8d4f4"/><circle cy="-18.2" r=".9" fill="#9b7bff"/>`;
 case'bolt':return`<path d="M1.6-15L-3-5.6H.6L-2.2 3L4-7.6H.4L3-15Z" fill="#ffe24a" stroke="#e89a20" stroke-width=".6" stroke-linejoin="round"/>`;
 case'hammer':return`<rect x="-.75" y="-6" width="1.5" height="9" rx=".5" fill="#6b4423" stroke="#2b1e35" stroke-width=".35"/><path d="M-.75-2.4h1.5M-.75-.4h1.5" stroke="#3a2a1a" stroke-width=".4"/><rect x="-4.8" y="-11.6" width="9.6" height="5.8" rx="1" fill="#9aa3ad" stroke="#2b1e35" stroke-width=".5"/><path d="M-3.4-10.2h6.8M-3.4-7.2h6.8" stroke="#c9d0d8" stroke-width=".5"/><circle cy="3.6" r=".9" fill="none" stroke="#6b4423" stroke-width=".5"/>`;
 case'mirror':return`<rect x="-.55" y="-2.6" width="1.1" height="4" fill="#8a5a2b"/><circle cy="-6.4" r="4" fill="#e8c45a" stroke="#2b1e35" stroke-width=".5"/><circle cy="-6.4" r="3" fill="#fff6d8"/><path d="M-1.4-8.2q1.2-1 2.4-.4" stroke="#fff" stroke-width=".7" fill="none"/>`;
 case'moonorb':return`<circle cy="-4.4" r="3.6" fill="#cfe0ff" stroke="#2b1e35" stroke-width=".45"/><path d="M1-7.2a3 3 0 1 0 0 5.6a2.4 2.4 0 1 1 0-5.6Z" fill="#8aa8ff"/>`;
 case'jewelspear':return`<rect x="-.45" y="-18" width=".9" height="26" rx=".45" fill="#b0302a" stroke="#2b1e35" stroke-width=".3"/><path d="M0-22.6l1.4 4-1.4.8-1.4-.8Z" fill="#e8eef4"/><circle cy="-16.4" r="1" fill="#3ecf8e"/><circle cy="-14.2" r=".8" fill="#55a6ff"/><circle cy="-12.2" r=".8" fill="#e8c45a"/>`;
 case'magatama':return`<path d="M-1-6.6a2.6 2.6 0 1 1 1.2 4.8q-2.4.4-2.2 2.8q-1.4-3.6 1-7.6Z" fill="#3ecf8e" stroke="#2b1e35" stroke-width=".45"/><circle cx=".4" cy="-4.6" r=".55" fill="#eafff4"/>`;
 case'apple':return`<circle cy="-2.6" r="2.7" fill="#f2c94a" stroke="#2b1e35" stroke-width=".45"/><path d="M0-5.2q.6-1.6 2-1.8q-.4 1.4-2 1.8Z" fill="#5f9a3a"/><circle cx="-.9" cy="-3.4" r=".6" fill="#fff6c8"/>`;
 case'pomegranate':return`<circle cy="-2.8" r="2.8" fill="#c0283a" stroke="#2b1e35" stroke-width=".45"/><path d="M-1-5.4l.4-1.2.6.8.6-.8.4 1.2Z" fill="#8a1a28"/><circle cx="-.9" cy="-3.6" r=".55" fill="#ff8a9a"/>`;
 case'scales':return`<rect x="-.4" y="-12" width=".8" height="14" fill="#e2b54a"/><path d="M-5-11.4H5" stroke="#e2b54a" stroke-width=".8"/><path d="M-5-11.4l-1.6 4.2M-5-11.4l1.6 4.2M5-11.4l-1.6 4.2M5-11.4l1.6 4.2" stroke="#e2b54a" stroke-width=".35"/><path d="M-7-7.2q2 1.8 4 0ZM3-7.2q2 1.8 4 0Z" fill="#e2b54a" stroke="#2b1e35" stroke-width=".3"/><path d="M5.6-8.6q.6-1.2 1.4 0q-.6.8-1.4 0Z" fill="#fff"/>`;
 case'was':return`<rect x="-.45" y="-17" width=".9" height="23" fill="#e2b54a" stroke="#2b1e35" stroke-width=".3"/><path d="M-.45-17l3.2-1.8.4 1.4-3.2 1.6Z" fill="#e2b54a" stroke="#2b1e35" stroke-width=".3"/><path d="M-.45 6l-1 1.6M.45 6l1 1.6" stroke="#e2b54a" stroke-width=".6"/>`;
 case'guandao':return`<rect x="-.55" y="-17" width="1.1" height="26" rx=".5" fill="#7a1f1f" stroke="#2b1e35" stroke-width=".3"/><path d="M-.6-16.6Q5.2-18.4 6.2-26.4Q2.4-24.4-.6-22.4Z" fill="#dde2e8" stroke="#2b1e35" stroke-width=".45"/><path d="M-.6-17.2l-1.6-1 1.6-1.4" fill="#e2b54a"/><path d="M-.4-16q-2 1.6-1.8 4.4" stroke="#c0392b" stroke-width=".9" fill="none"/>`;
 case'harpe':return`<path d="M-.7-1.2V-11.4Q-.7-14.4 2.4-14.4Q4.4-14.2 4-12Q2.6-13 1.4-12.2Q.7-11.6.7-10.4V-1.2Z" fill="#dde2e8" stroke="#2b1e35" stroke-width=".35"/><rect x="-1.8" y="-1.6" width="3.6" height="1" fill="#e2b54a"/><rect x="-.5" y="-.6" width="1" height="2.4" fill="#6b4423"/>`;
 case'thread':return`<circle r="2.4" fill="#d43a3a" stroke="#2b1e35" stroke-width=".4"/><path d="M-1.8-.6q1.8-1 3.6.2M-1.6.8q1.6-.8 3.2.2" stroke="#ff8a8a" stroke-width=".35" fill="none"/>`;
 case'globe':return`<circle cy="-2.8" r="2.8" fill="#e2b54a" stroke="#2b1e35" stroke-width=".45"/><path d="M-2.8-2.8h5.6M0-5.6v5.6" stroke="#b0302a" stroke-width=".5"/><circle cy="-6.2" r=".7" fill="#e2b54a"/>`;
 case'bamboo':return`<rect x="-3.4" y="-3" width="6.8" height="5" rx=".6" fill="#d8c48a" stroke="#2b1e35" stroke-width=".4"/><path d="M-2.2-3v5M-1-3v5M.2-3v5M1.4-3v5M2.6-3v5" stroke="#9a8450" stroke-width=".3"/><path d="M-3.4-1h6.8M-3.4 1h6.8" stroke="#7a3a1a" stroke-width=".3"/>`;
 case'tsurugi':return`<path d="M-.9-1.4V-14.4L0-16.4l.9 2V-1.4Z" fill="#e8eef4" stroke="#2b1e35" stroke-width=".3"/><path d="M0-15V-1.6" stroke="#aab2bd" stroke-width=".3"/><rect x="-2.4" y="-1.8" width="4.8" height="1" fill="#e2b54a"/><rect x="-.55" y="-.8" width="1.1" height="3" fill="#2a2a3a"/><circle cy="3.2" r="1" fill="none" stroke="#e2b54a" stroke-width=".6"/>`;
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
const ARAUCARIA=svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 170" preserveAspectRatio="xMidYMax slice"><path d="M0 120L60 70 120 110 190 60 260 105 330 65 400 100V170H0Z" fill="#1d3a33" opacity=".7"/>${[[30,0],[70,10],[120,-6],[175,8],[240,-2],[300,12],[350,0],[385,6]].map(([x,t])=>`<g fill="#0b1a14"><rect x="${x-3}" y="${10+t}" width="6" height="170"/>${[40,75,110,140].map(y=>`<rect x="${x-4}" y="${y+t}" width="8" height="3"/>`).join('')}<path d="M${x} ${50+t}q18-10 30-6q-16 2-30 10ZM${x} ${90+t}q-18-10-30-6q16 2 30 10Z"/></g>`).join('')}<path d="M0 152Q100 140 200 150T400 146V170H0Z" fill="#06100b"/></svg>`);
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

/* ================= motor chibi con volumen =================
   Lienzo 64×84, suelo en y=82, vista 3/4 mirando a la derecha.
   Cada parte se pinta con sombra (tono oscuro), luz recortada (tono base desplazado hacia arriba-derecha),
   brillo opcional y contorno grueso: así se ve con volumen y no plano. */
const OL='#2b1e35';let PN=0;
const ell=(cx,cy,rx,ry)=>`M${cx-rx} ${cy}a${rx} ${ry} 0 1 0 ${2*rx} 0a${rx} ${ry} 0 1 0 ${-2*rx} 0Z`;
const rr=(x,y,w,h,r)=>`M${x+r} ${y}H${x+w-r}Q${x+w} ${y} ${x+w} ${y+r}V${y+h-r}Q${x+w} ${y+h} ${x+w-r} ${y+h}H${x+r}Q${x} ${y+h} ${x} ${y+h-r}V${y+r}Q${x} ${y} ${x+r} ${y}Z`;
function Art(){this.id='q'+(++PN)+'_';this.n=0;this.defs=''}
Art.prototype.p=function(d,c,o){o=o||{};const id=this.id+(this.n++);const ev=o.ev?' fill-rule="evenodd" clip-rule="evenodd"':'';
 this.defs+=`<clipPath id="${id}"><path d="${d}"${ev}/></clipPath>`;const lx=o.lx==null?1.9:o.lx,ly=o.ly==null?-1.7:o.ly;
 let s=`<path d="${d}" fill="${o.sh||shd(c,-.26)}"${ev}/><g clip-path="url(#${id})"><path d="${d}" fill="${c}" transform="translate(${lx} ${ly})"${ev}/>`;
 if(o.hl)s+=`<ellipse cx="${o.hl[0]}" cy="${o.hl[1]}" rx="${o.hl[2]}" ry="${o.hl[3]}" fill="#fff" opacity="${o.ho||.28}"/>`;
 if(o.extra)s+=o.extra;
 return s+`</g><path d="${d}" fill="none" stroke="${OL}" stroke-width="${o.sw||1.3}" stroke-linejoin="round"${ev}/>`};
Art.prototype.f=(d,c,sw,op)=>`<path d="${d}" fill="${c}"${sw?` stroke="${OL}" stroke-width="${sw}" stroke-linejoin="round"`:''}${op?` opacity="${op}"`:''}/>`;
const ln=(d,c,w,op)=>`<path d="${d}" fill="none" stroke="${c||OL}" stroke-width="${w||1}" stroke-linecap="round" stroke-linejoin="round"${op?` opacity="${op}"`:''}/>`;
function qpt(a,b,c,t){const u=1-t;return[u*u*a[0]+2*u*t*b[0]+t*t*c[0],u*u*a[1]+2*u*t*b[1]+t*t*c[1]]}

/* ---------- pelo ---------- */
const H_SHORT='M15.2 33.4Q12.4 25.6 15.4 18.4Q19.6 9.6 30 8.4Q42.6 7.4 48.6 15Q51.8 19.6 50.6 27.2L47.6 24.6L45.6 27.6L43.4 22.4L40.4 25.8L38.4 21.6L35 25.2L33.2 20.8L29.2 24.6L27.4 21.2L23.4 24.4L21.4 22.4L19.8 27L18.6 31.6Z';
const H_SMOOTH='M15 32Q12.6 22 17 15Q22.6 8.4 32 8.2Q42 8.4 47.6 14.6Q51.6 20 50.4 27Q46 23 40 23.4Q33 22 26 23.4Q20.4 24.6 18.6 31Z';
const H_SWEPT='M15 34Q12 22 17.4 14.4Q24 7.6 33.6 8.2Q44.6 9 49.4 17.4Q52 23 50.4 30Q48.4 24.6 44.6 22.4Q42 26.6 36 27Q40 24 39.6 20.6Q33 26.4 24 26.8Q20.8 28 19.6 34.6Z';
const H_BOB='M14.2 41Q11.6 26 15.4 17.4Q20.8 8.6 32 8.4Q43.6 8.6 48.8 17.4Q52.2 25 50.8 35.4L47 36.4L46.8 24.8Q40 26.6 31.6 25.2Q24.4 24.6 19.6 25.6L19.6 41.2Z';
const H_WILD='M14.4 34Q9 30 11.6 24Q8 20 12 16Q10.6 10.6 16.6 9.6Q17.6 4.6 23.4 6Q26.6 1.8 31.6 4.4Q36 1.4 40 5Q45.6 3.6 47.2 8.6Q53 9.6 51.6 15.4Q55.6 19.6 51.6 23.6Q53.6 28 50 30.6L47 24.6L44.6 27.8L42.4 22.6L39 26.2L37.4 21.8L33.6 25.4L32 21L28 24.8L26.4 21.6L22.4 24.6L20.6 22.4L19 27.4L17.8 32.6Z';
const H_PART='M15.4 31Q12.8 20 18.4 13.6Q24.6 8 32 8.2Q39.6 8 45.8 13.6Q51.2 20 49.2 30Q46 23.6 40 22.6Q35.4 22 32.6 18.6Q29.8 22 24.4 22.6Q18.6 23.6 15.4 31Z';
function hairBackArt(a,h){if(!h)return'';const[s,c]=h;const L='M15.4 24Q9.6 38 12.4 56Q15.6 61.6 21.6 58.6Q19.2 46 21 34Z',R='M48.6 22.6Q54 36 52 50Q49.4 54 45.6 51.4Q47.2 40 45 30Z';
 switch(s){
  case'long':case'swept':case'braids':return a.p(L,c,{lx:1.4})+a.p(R,c,{lx:1.4});
  case'wavy':return a.p('M15.4 22Q7.6 32 10.4 42Q7.6 50 12 58Q16.4 64 23.4 60Q19.6 53 22 46Q19.4 40 21.8 33Z',c,{lx:1.4})+a.p('M48.6 21Q56.4 30 53.6 40Q56.6 48 52 54Q48 57.6 44.2 54.6Q47.6 48 45.4 42Q47.2 36 45.4 30Z',c,{lx:1.4});
  case'pony':return a.p('M18.4 13.6Q7.4 13 5.4 25Q4 36 9 45Q9.8 35 13.6 29Q14.6 21 20.6 17.4Z',c,{lx:1.2});
  case'bun':return a.p(ell(26,7.6,5.2,4.4),c)+a.f(rr(23,10.4,6.4,1.8,.9),shd(c,-.35));
  case'mizura':return'';
 }return''}
function hairFrontArt(a,h){if(!h)return'';const[s,c]=h;const shine=ln('M36.4 12.4q6 .6 9.8 4.6','#fff',1.6,.5)+`<circle cx="47.6" cy="19.4" r=".8" fill="#fff" opacity=".5"/>`;
 switch(s){
  case'short':case'long':case'pony':return a.p(H_SHORT,c,{lx:1.6,ly:-1.4})+shine;
  case'bun':return a.p(H_SMOOTH,c,{lx:1.6,ly:-1.4})+shine;
  case'swept':case'wavy':case'braids':{let o=a.p(H_SWEPT,c,{lx:1.6,ly:-1.4})+shine;if(s==='braids')for(const[x,y0]of[[16.6,36],[47.8,34]])for(let k=0;k<5;k++)o+=a.p(ell(x+(x<30?-.4:.4)*k,y0+k*4.2,2.6,2.4),c,{lx:.8,ly:-.6,sw:1});return o}
  case'bob':return a.p(H_BOB,c,{lx:1.6,ly:-1.4})+shine;
  case'wild':return a.p(H_WILD,c,{lx:1.6,ly:-1.4})+shine;
  case'curly':{let o=a.p(H_SMOOTH,c,{lx:1.6,ly:-1.4});const pts=[[16.4,22,4.2],[17.4,15.4,4.4],[22.6,10.6,4.6],[29.6,8.6,4.6],[36.8,8.6,4.6],[43.4,10.8,4.4],[48.2,15.8,4.2],[49.6,22.4,3.6],[22.4,22.6,3.2],[28.4,21.8,3.2],[34.6,21.4,3.2],[40.6,21.8,3],[45.6,23.2,2.8],[16,29,3.2]];pts.forEach(([x,y,r],i)=>{o+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${i%3?c:shd(c,-.12)}" stroke="${OL}" stroke-width="1.1"/>`});return o+shine}
  case'mizura':{let o=a.p(H_PART,c,{lx:1.6,ly:-1.4});for(const x of[12.6,51.4])o+=`<ellipse cx="${x}" cy="36.4" rx="3.2" ry="5.6" fill="none" stroke="${OL}" stroke-width="4.6"/><ellipse cx="${x}" cy="36.4" rx="3.2" ry="5.6" fill="none" stroke="${c}" stroke-width="2.6"/>`+a.f(rr(x-2.6,29.2,5.2,2.4,1),'#c0392b',.9);return o+shine}
 }return''}
function beardArt(a,b){if(!b)return'';const[s,c]=b;const stache='M30.6 36.4q2.8-2.4 5.6-.4q2.8-2 5.4.6q-2.8 1.6-5.4.4q-2.8 1.4-5.6-.6Z';
 switch(s){
  case'full':return a.p('M15.6 30.4Q15 43 24 46.6Q32 49.4 40.6 46.6Q49.6 43 49 31.6Q46 37.6 41.6 38.8Q38.6 41.8 34 41Q28.4 41.4 24.2 38.4Q19 36.6 15.6 30.4Z',c,{lx:1.2,ly:-1})+a.p(stache,c,{lx:.6,ly:-.6,sw:1});
  case'short':return a.p('M16.4 32Q16.4 41.6 24.4 44.6Q32 47 40 44.6Q48 41.8 48.4 33Q45.4 37.8 41.4 38.8Q38.4 41.4 34 40.8Q28.6 41.2 24.4 38.6Q19.4 37 16.4 32Z',c,{lx:1,ly:-.8})+a.p(stache,c,{lx:.6,ly:-.6,sw:1});
  case'long':return a.p('M15.8 30.6Q14 46 21 56Q27 63 32.6 61.2Q38.6 63 44 56Q50.6 46 49 31.6Q46 37.8 41.6 39Q38.6 42 34 41.2Q28.4 41.6 24.2 38.6Q19 36.8 15.8 30.6Z',c,{lx:1.2,ly:-1})+ln('M26 46q1 6 3.6 10M33 48v9M39.6 46q-.8 6-3 10',shd(c,-.3),.8)+a.p(stache,c,{lx:.6,ly:-.6,sw:1});
  case'guan':return a.p('M21.6 37.6Q19.6 56 27.4 70Q32 75 36.6 70Q44.6 56 42.8 37.6Q38.4 41.6 32.4 41.2Q26 41.6 21.6 37.6Z',c,{lx:1,ly:-1})+a.p(stache,c,{lx:.6,ly:-.6,sw:1});
  case'stache':return a.p(stache,c,{lx:.6,ly:-.6,sw:1});
  case'fu':return a.p(stache,c,{lx:.6,ly:-.6,sw:1})+ln('M31.4 37q-1.6 4-1 9M41.2 37.4q1.6 4 .8 9',c,1.6)+ln('M31.4 37q-1.6 4-1 9M41.2 37.4q1.6 4 .8 9',OL,.5,.6);
  case'goatee':return a.p(stache,c,{lx:.6,ly:-.6,sw:1})+a.p('M33.4 40.6q2.6 4.6 5.2 0q-2.6 1-5.2 0Z',c,{lx:.4,ly:-.4,sw:1});
 }return''}

/* ---------- cascos, coronas y tocados ---------- */
function laurelArt(a,c){let s=ln('M15.8 26Q20 13.6 32 13.2Q44 13.6 48.4 25',shd(c,-.35),1.2);
 for(const[A,B,C]of[[[15.8,26],[19.6,15.8],[30.6,13.2]],[[48.4,25],[44.4,15.6],[33.4,13.2]]])for(let k=0;k<6;k++){const t=.08+k*.17;const[x,y]=qpt(A,B,C,t);const[x2,y2]=qpt(A,B,C,t+.02);const ang=Math.atan2(y2-y,x2-x)*180/Math.PI+(k%2?28:-28);
  s+=`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="2.9" ry="1.3" transform="rotate(${ang.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${k%2?c:shd(c,.18)}" stroke="${OL}" stroke-width=".8"/>`}
 return s}
function gearBackArt(a,g){if(!g)return'';const[t,c1,c2]=g;
 if(t==='sunhalo'){let s='';for(let k=0;k<14;k++){const an=k*Math.PI/7;const x=32+27*Math.sin(an),y=25-27*Math.cos(an),x1=32+21*Math.sin(an-.16),y1=25-21*Math.cos(an-.16),x2=32+21*Math.sin(an+.16),y2=25-21*Math.cos(an+.16);s+=`<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}Z" fill="${c1}" stroke="${OL}" stroke-width=".8"/>`}return`<g class="halo">${s}${a.p(ell(32,25,21.6,21.6),c1,{lx:-1.4,ly:1.4,sh:shd(c1,-.15)})}${ln(ell(32,25,17,17),c2,1.2,.7)}</g>`}
 if(t==='moonhalo')return`<g class="halo">${a.p('M12 34A22 22 0 1 1 50 7A17.6 17.6 0 1 0 12 34Z',c1,{lx:-1.2,ly:1.2,sh:shd(c1,-.15)})}<circle cx="49" cy="12" r="1.2" fill="#fff"/><circle cx="11" cy="16" r=".9" fill="#fff"/></g>`;
 if(t==='lionpelt')return a.p('M11.6 26Q5.6 44 11.6 60L21 56Q16.4 42 18.6 28Z',c2,{lx:1.2})+a.p('M52.4 26Q58.4 42 53 56L45 52.6Q48.4 40 45.6 28Z',c2,{lx:1.2});
 if(t==='nemes'||t==='nemesj')return a.p('M14.6 22Q9.6 36 12 54L21 52Q18.4 40 19.8 30Z',c1,{lx:1,extra:[38,42,46,50,54,58].map(y=>ln(`M8 ${y-12}l16 2`,c2,1.3)).join('')})+a.p('M49.4 22Q54.4 36 52 50L44.6 49Q46.2 38 44.6 30Z',c1,{lx:1,extra:[34,38,42,46,50].map(y=>ln(`M42 ${y-10}l14 2`,c2,1.3)).join('')});
 return''}
function gearArt(a,g,L){if(!g)return'';const[t,c1,c2,c3]=g;switch(t){
 case'laurel':return laurelArt(a,c1);
 case'crown':return a.p('M17.4 19.6L46.6 19.6L47.4 12.6L42.4 15.6L39.2 8.6L35.4 14.6L32 6.6L28.6 14.6L24.8 8.6L21.6 15.6L16.6 12.6Z',c1,{hl:[38,12,5,2]})+[[32,16.4],[25,17.2],[39,17.2]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.3" fill="${c2||'#c0392b'}" stroke="${OL}" stroke-width=".6"/>`).join('');
 case'spikecrown':return a.p('M17.4 21.2L46.6 21.2L48.8 9L43.2 14.8L41.6 4.4L36.6 13.2L32 1.4L27.4 13.2L22.4 4.4L20.8 14.8L15.2 9Z',c1,{hl:[38,12,4,2]})+`<circle cx="32" cy="17.6" r="1.6" fill="${c2||'#55a6ff'}" stroke="${OL}" stroke-width=".6"/>`;
 case'circlet':return a.p('M16 25.6Q32 18.4 48.6 23.8L48.4 25.8Q32 21.2 16.2 27.8Z',c1)+`<circle cx="33" cy="21.6" r="1.5" fill="${c2||'#55a6ff'}" stroke="${OL}" stroke-width=".6"/>`;
 case'headband':return a.p('M15.6 25.6Q9 24 5.6 29.6Q10.6 28.6 15.4 28.4Z',c1,{sw:1})+a.p('M15.4 27Q10 30 9 35.6Q12.6 31.6 16 29.4Z',c1,{sw:1})+a.p('M15 24.4Q32 17.6 49.4 23L49.2 26.4Q32 21.6 15.2 28Z',c1,{lx:.8,ly:-.8});
 case'galea':return a.p('M13.8 23.4Q11 26 11.6 30.6L14.8 30.6Z',c1,{sw:1})+a.p('M14 24.6Q13.4 9 32 7.4Q50.6 9 50 24.6Q32 19.4 14 24.6Z',c1,{hl:[39,13,6,3]})+a.p('M14.2 24L19.8 22.8L19.6 34Q17 36 15 33.6Z',shd(c1,-.08),{sw:1.1})+a.p('M44.2 22.6L49.8 23.8L49 33.4Q47 35.6 44.8 33.4Z',shd(c1,-.08),{sw:1.1})+a.p('M18.6 11Q21.6-2.6 34-1.6Q46.6 0 47.6 12.6Q44 7.6 40.6 7.2Q36.6 1.6 30.4 2.6Q23.6 4.2 22.6 10.6Z',c2,{extra:ln('M24 6q4-4 9-4M28 7.4q4-3 9-2.4M33 8q4-1.6 8 0',shd(c2,-.3),.8)});
 case'corup':return a.p('M15.4 17.6Q14.6 3.8 32 3Q49.4 3.8 48.6 17.6Q32 12.6 15.4 17.6Z',c1,{hl:[39,8,6,2.4],extra:`<path d="M23 9.4q3.4-2 6 .6q-3 1.6-6-.6ZM35 10q2.6-2.6 6-.6q-3 2.2-6 .6Z" fill="${OL}" opacity=".8"/><rect x="31" y="9" width="2" height="5.4" rx="1" fill="${shd(c1,-.25)}"/>`})+a.p('M18 6Q20-6.6 33-6.8Q46-6.4 46.6 6Q42.6 2.4 38.6 2.2Q33.6-1.6 27.6-.6Q21.6.6 21 6Z',c2,{extra:ln('M23-1q4-4 10-4M28 0q4-2.6 10-2',shd(c2,-.35),.8)});
 case'boeotian':return a.p('M18.6 11Q12 0 15.6-4.6Q19.4 1.6 22.6 9.4Z',c2,{sw:1})+a.p('M41.4 9.4Q44.6 1.6 48.4-4.6Q52 0 45.4 11Z',c2,{sw:1})+a.p('M13.6 23.4Q12.6 8.4 32 7Q51.4 8.4 50.4 23.4Q46 19.2 40 18.8Q32 17 24 18.8Q18 19.2 13.6 23.4Z',c1,{hl:[39,12,6,2.6]});
 case'carthage':return a.p('M14.6 23.4Q14 9 32 4Q50 9 49.4 23.4Q32 18 14.6 23.4Z',c1,{hl:[39,11,5,3]})+a.p('M29 4.6Q32-2 36.6 0Q35 2.6 34.6 5.2Z',c2,{sw:1})+a.p('M14.6 22.6L19.4 21.6L19 31Q16.8 32.6 15.2 30.6Z',shd(c1,-.08),{sw:1});
 case'pilos':return a.p('M15.6 21.4Q17.4 4.6 32 1.4Q46.6 4.6 48.4 21.4Q32 16.8 15.6 21.4Z',c1,{hl:[38,9,4,3]})+ln('M16.4 18.8Q32 14.6 47.6 18.8',shd(c1,-.3),1);
 case'khepresh':return a.p('M15.6 25.4Q13 8 22 4Q32 0 42.6 4.4Q51.4 8.6 48.6 25.4Q46 21.4 41 21Q32 19 23.4 21Q18 21.6 15.6 25.4Z',c1,{hl:[38,9,6,3],extra:[[22,9],[27,6.6],[33,5.8],[39,7],[44,10],[20,15],[26,12.6],[32,11.8],[38,12.8],[44,15.6],[24,18.6],[31,17.6],[38,18.2]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".7" fill="${c2}"/>`).join('')})+a.p('M40.6 19.6q4.6-2.6 5.4 1.6q-.4 2.8-3 1.8q1.6-1.8-.6-2.4Z',c2,{sw:.9});
 case'diadem':return a.p('M15.4 24.4Q32 17 48.8 22.8V25.4Q32 20.4 15.6 27.2Z',c1)+a.p('M42.4 20.6q3.8-3.6 5.6.2q-.2 2.6-2.6 2.2q1-1.6-.8-2.2Z',c1,{sw:.9})+`<circle cx="31" cy="21.8" r="1.4" fill="#2a7bd5" stroke="${OL}" stroke-width=".6"/>`;
 case'sundisk':return a.p('M24 9.4Q21.6 3 25.6 1.2Q24.4 5 28 8.4Z',c2,{sw:.9})+a.p(ell(32,1.8,8,8),c1,{hl:[35,-1,3,2]})+a.p('M39.4 7.6q3.4-1.6 3.6 1.6q-.4 2-2.4 1.4',c2,{sw:.9});
 case'bicorne':return a.p('M7 21.6Q32-3.4 57 21.6Q32 13.6 7 21.6Z',c1,{hl:[40,9,7,2]})+ln('M8 21.2Q32 14 56 21.2',c2,1.2)+`<circle cx="39" cy="10.4" r="2.6" fill="#2a4bd0" stroke="${OL}" stroke-width=".6"/><circle cx="39" cy="10.4" r="1.6" fill="#f4f4f4"/><circle cx="39" cy="10.4" r=".7" fill="#d0312d"/>`;
 case'furcone':return a.p('M17.6 18.4Q22 4 32-1.4Q42 4 46.4 18.4Z',c1,{hl:[37,7,3,3]})+a.p('M14.6 20.6Q32 13 49.4 20.6Q50.6 24.6 47.4 25.6Q32 19.8 16.6 25.6Q13.4 24.6 14.6 20.6Z',c2)+`<circle cx="32" cy="-1.4" r="1.8" fill="#c0392b" stroke="${OL}" stroke-width=".7"/>`;
 case'furhat':return a.p('M15.6 19.4Q16 5.4 32 4.6Q48 5.4 48.4 19.4Z',c1,{hl:[38,9,5,2]})+a.p('M13.6 18.4Q32 12 50.4 18.4Q51.6 23.6 48 24.6Q32 18.8 16 24.6Q12.4 23.6 13.6 18.4Z',c2);
 case'kabuto':{let s=a.p('M15.2 21.4Q11 24 8.4 30.6L14.6 31.2L16.6 24.6Z',shd(c1,-.1),{sw:1.1})+a.p('M48.8 21.2Q53 24 55.6 30.2L49.6 31L47.6 24.4Z',shd(c1,-.1),{sw:1.1})+a.p('M15 22.2Q14 7.6 32 6.6Q50 7.6 49 22.2Q32 17.6 15 22.2Z',c1,{hl:[39,11,6,2.4],extra:ln('M24 8.4q-2 6-1.6 11M32 7v11M40 8.4q2 6 1.6 11',shd(c1,.25),.7)})+a.p('M16.8 22.8Q32 18.2 47.6 22.4L48 24.8Q32 20.6 16.6 25.4Z',shd(c1,-.3),{sw:1});
  if(c3==='crescent')s+=a.p('M13.4 2.6Q30 14.6 55-3.4Q34 21 13.4 2.6Z',c2,{hl:[40,4,5,1.4]});
  else s+=a.p('M28.6 14Q22.6 6 21-3.6Q25.8 3.6 30.6 12.6Z',c2,{sw:1})+a.p('M35.4 14Q41.4 6 43-3.6Q38.2 3.6 33.4 12.6Z',c2,{sw:1});
  return s}
 case'winged':return a.p('M17 15Q8 9.6 4 .6Q11.4 3 18.6 10.6Z',c2,{sw:1,extra:ln('M8 4q4 4 8 7M11 2.6q3 4 6 6',shd(c2,-.25),.6)})+a.p('M47 15Q56 9.6 60 .6Q52.6 3 45.4 10.6Z',c2,{sw:1,extra:ln('M56 4q-4 4-8 7M53 2.6q-3 4-6 6',shd(c2,-.25),.6)})+a.p('M15.6 20.4Q15 6.8 32 6Q49 6.8 48.4 20.4Q32 15.8 15.6 20.4Z',c1,{hl:[39,10,5,2]});
 case'wanderer':return a.p('M17.6 19.4Q18.6 4.6 30 3.4Q42.6 2.8 45.6 19Z',c1,{hl:[37,8,4,2.4]})+a.p('M3.6 20.6Q32 11.6 60.4 20.6Q58.4 25.6 50 23.8Q32 18.6 14 23.8Q5.6 25.6 3.6 20.6Z',shd(c1,-.08),{hl:[44,17,8,1.4]});
 case'lionpelt':return a.p('M13.6 26Q12 7.6 32 5Q52 7.6 50.4 26Q46 20.4 40 21Q38 23.8 32 23.8Q26 23.8 24 21Q18 20.4 13.6 26Z',c1,{hl:[39,11,6,3],extra:`<ellipse cx="25" cy="13" rx="1.6" ry="1.1" fill="${OL}"/><ellipse cx="39" cy="13" rx="1.6" ry="1.1" fill="${OL}"/><path d="M30.4 16.6h3.2l-1.6 2Z" fill="${OL}"/>`})+a.p(ell(17.6,8.6,3,3),c1,{sw:1})+a.p(ell(46.4,8.6,3,3),c1,{sw:1})+`<path d="M24.4 21.2l1 2.2 1-2M37.6 21.2l1 2.2 1-2" fill="#fff" stroke="${OL}" stroke-width=".5"/>`;
 case'wingcap':return a.p('M15.4 14.6Q8 11 6 4.6Q12 6.6 17 11.6Z',c2,{sw:1})+a.p('M48.6 14.6Q56 11 58 4.6Q52 6.6 47 11.6Z',c2,{sw:1})+a.p('M15.8 20.6Q15.4 7 32 6.4Q48.6 7 48.2 20.6Q32 16.2 15.8 20.6Z',c1,{hl:[39,10,5,2]});
 case'shell':return a.p('M41.6 20.6L46 9Q50.6 9.6 52.4 14Q51.6 18.6 41.6 20.6Z',c1,{sw:1,extra:ln('M41.6 20.6L48 10M41.6 20.6L50.6 12M41.6 20.6L52 15.6',shd(c1,-.25),.6)})+[[19,23.4],[23,21],[27.4,19.6],[32,19],[36.6,19.4]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.25" fill="#fff8ee" stroke="${OL}" stroke-width=".5"/>`).join('');
 case'flowers':return[[17.4,23.6],[21.6,17.6],[27.4,14],[34,12.8],[40.4,14.4],[46,18.6]].map(([x,y],i)=>{const col=i%2?c2:c1;let f='';for(let k=0;k<5;k++){const an=k*1.2566;f+=`<circle cx="${(x+2*Math.cos(an)).toFixed(1)}" cy="${(y+2*Math.sin(an)).toFixed(1)}" r="1.6" fill="${col}" stroke="${OL}" stroke-width=".55"/>`}return f+`<circle cx="${x}" cy="${y}" r="1.1" fill="#ffe27a" stroke="${OL}" stroke-width=".5"/>`}).join('');
 case'comb':return a.p('M40 14.6L49.6 9.6L50.4 11L41 16Z',c1,{sw:.9})+[[50,10],[46.6,12.4]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.7" fill="${c2}" stroke="${OL}" stroke-width=".6"/>`).join('')+ln('M47 12.6l-1.6 6M49.8 11l-.4 5.4',c1,.8);
 case'coifcrown':return a.p('M12.6 36Q11 14 32 7.6Q53 14 51.4 36Q51 46.4 44 47.8L20 47.8Q13 46.4 12.6 36Z'+ell(32.6,31.8,14.2,12.8).replace(/a/g,'a'),c1,{ev:1,extra:[...Array(30)].map((_,i)=>{const x=14+(i%10)*3.8,y=12+Math.floor(i/10)*14;return`<circle cx="${x}" cy="${y}" r=".5" fill="${shd(c1,-.35)}"/>`}).join('')})+a.p('M18.6 15.4L45.4 15.4L46.2 9L41.8 11.6L39 5.6L35.4 10.8L32 4L28.6 10.8L25 5.6L22.2 11.6L17.8 9Z',c2,{hl:[38,9,4,1.6]});
 case'futou':return a.p('M16.6 18.6Q17 5.6 32 5.2Q47 5.6 47.4 18.6Z',c1,{hl:[38,9,5,2]})+a.p('M15.4 17.6Q32 12.6 48.6 17.6L48.4 20.6Q32 16 15.6 20.6Z',shd(c1,-.25),{sw:1})+`<circle cx="32" cy="4.6" r="2" fill="${c2||'#c0392b'}" stroke="${OL}" stroke-width=".7"/>`;
 case'guan':return a.p('M24.6 11L24.2 3.4Q32 .2 39.8 3.4L39.4 11Z',c1,{sw:1.1})+ln('M18 6.6L46 5',c2||'#e2b54a',1.1);
 case'mianguan':return a.p('M22 14.4L23 6H41L42 14.4Z',c1,{sw:1.1})+a.p('M13.4 5.6L50.6 3.4L51 6.6L13.8 8.6Z',c1,{sw:1.1,extra:ln('M13.6 7.6L50.8 5.4',c2,.8)})+[44,46.4,48.8,15.8,18.2].map(x=>ln(`M${x} ${x>30?5.6:7.6}v10`,'#2b1e35',.5)+`<circle cx="${x}" cy="${x>30?10:12}" r=".8" fill="${c2}"/><circle cx="${x}" cy="${x>30?14:16}" r=".8" fill="#c0392b"/>`).join('');
 case'gladhelm':return a.p('M15.6 17.4Q15 5 32 4.4Q49 5 48.4 17.4Q32 13.6 15.6 17.4Z',c1,{hl:[39,9,5,2]})+a.p('M12 18Q32 12 52 18L51.2 20.4Q32 14.8 12.8 20.4Z',shd(c1,-.12),{sw:1})+a.p('M21 7Q22.6-3.6 35.6-4.6Q46.6-4.6 47.4 3.6Q51.4 4 50.6 7.4Q46.6 6 44.6 4.6Q40-.6 33 1.4Q27.4 3.4 26 7.6Z',c2,{sw:1});
}return''}

/* ---------- cabezas especiales ---------- */
function falconHead(a,L){const br='#6b3f1c',cr='#f4ecd8';return a.p(ell(32,28,17.4,16.4),br,{hl:[38,18,7,4],ho:.18})+a.p('M29.6 30.4Q30.6 21.8 40 21.4Q49 21.8 49.8 30Q49.8 38.4 44 41.2Q36 43.4 31.4 38.4Q29.2 34.8 29.6 30.4Z',cr,{lx:1,ly:-.8,sw:1.1})+a.p('M45.6 30.2Q56.4 28.6 57.4 35Q57.6 39.8 52.4 41Q53 37.2 49.6 36.8Q47 37.4 44.8 35.8Z','#e8b23a',{sw:1.2,extra:`<path d="M52.6 41Q56.2 39.4 57.4 35.6L55.6 39.6Z" fill="${OL}"/>`})+ln('M36 35.6q-1.4 4.8-5.2 6.8',OL,1.8)+ln('M32.6 28.8h13.2',OL,1.4)}
function jackalHead(a,L){return a.p('M18.6 17Q15-2 21.6-6.4Q26.8 2 27.4 13.6Z','#1f1d26',{sw:1.2,extra:`<path d="M20.4 10Q19.4 1 21.8-2.6Q24.4 3 24.6 11Z" fill="#e2b54a" opacity=".85"/>`})+a.p('M33.4 12.6Q36.4-1.4 44-5Q45.6 6.4 42.6 17Z','#1f1d26',{sw:1.2,extra:`<path d="M36.4 11.4Q38.6 2 42.4-1Q42.6 6 41 13Z" fill="#e2b54a" opacity=".85"/>`})+a.p(ell(32,28,17,16),'#25222e',{hl:[40,19,6,3],ho:.15})+a.p('M38 29.6Q50.6 26.8 57.4 30.8Q59.6 33.4 56.8 35.6Q50.4 38.6 40 37.8Z','#25222e',{sw:1.2})+`<ellipse cx="57.4" cy="32.4" rx="1.6" ry="1.2" fill="${OL}"/>`+ln('M42 36.2q6 .6 13-.6',shd('#25222e',.4),.8)}

/* ---------- cuerpo ---------- */
const TORSO=(b,v)=>{const t=b+(v||0);return`M${22.6-t} 45.4Q${22.2-t} 43.8 ${24.6-t} 43.8H${39.4+t}Q${41.8+t} 43.8 ${41.4+t} 45.4L${43.6+b} 64.4Q${43.8+b} 66.6 ${41.6+b} 66.6H${22.4-b}Q${20.2-b} 66.6 ${20.4-b} 64.4Z`};
function armorArt(a,L,b){const ar=L.ar||[];const t=ar[0],c=ar[1]||L.tu,c2=ar[2]||GOLD;const dk=shd(c,-.4);const X0=21.4-b,X1=42.6+b;
 const plate=`M${23.6-b} 45.2H${40.4+b}Q${42+b} 45.2 ${42+b} 47L${42.8+b} 60.6H${21.2-b}L${22-b} 47Q${22-b} 45.2 ${23.6-b} 45.2Z`;
 switch(t){
  case'musc':return a.p(plate,c,{hl:[37,49,4,3],extra:ln('M25 50.6q3.6 2.4 7 0q3.4 2.4 7 0M32 51.4v6.4M26.6 56q5.4 1.6 10.8 0',dk,.8)});
  case'seg':return a.p(plate,c,{hl:[37,48,4,2],extra:ln('M21 50.4h22M21 54h22M21 57.6h22',dk,.8)});
  case'chain':return a.p(plate,c,{extra:[...Array(24)].map((_,i)=>`<circle cx="${(23.6+(i%6)*3.4).toFixed(1)}" cy="${(47.4+Math.floor(i/6)*3.4).toFixed(1)}" r=".55" fill="${dk}"/>`).join('')});
  case'plate':return a.p(plate,c,{hl:[36,50,5,6],ho:.4,extra:ln('M32 45.6v15',dk,.7)});
  case'lamellar':return a.p(plate,c,{extra:[47.6,50.6,53.6,56.6,59.4].map(y=>ln(`M${X0} ${y}H${X1}`,shd(c,.3),.7)).join('')+[...Array(12)].map((_,i)=>`<circle cx="${(24+(i%6)*3.2).toFixed(1)}" cy="${49+Math.floor(i/6)*6}" r=".55" fill="${c2}"/>`).join('')});
  case'linen':return a.p(plate,c,{extra:`<rect x="20" y="54.6" width="24" height="2.4" fill="${c2}"/><circle cx="32" cy="50" r="2" fill="${c2}"/>`})+a.p(rr(21.6,44.6,6,4,1.4),shd(c,-.06),{sw:1})+a.p(rr(36.4,44.6,6,4,1.4),shd(c,-.06),{sw:1});
  case'toga':return a.p('M38.4 44Q30 52 21 64.8L26.6 66.6Q32 54 42 46.4Z',c,{extra:ln('M38.4 44Q30 52 21 64.8',c2,1.6)});
  case'chiton':return ln('M26.4 46.6q1 7 .4 13M32 46.8v13M37.6 46.6q-1 7-.4 13',shd(L.tu,-.2),.7)+a.p(rr(20.8,53.6,22.4,2.8,1.2),c2,{sw:1});
  case'robe':return a.p('M26.6 43.8Q32 53.4 37.4 43.8L39.6 44.6Q32 57.6 24.4 44.6Z',c2,{sw:1});
  case'kimono':case'kofun':return a.p('M24.4 44L38.6 58.6L41.2 56.4L28.4 44Z',c2,{sw:1})+a.p(rr(20.6,55.2,22.8,4.4,1.4),t==='kofun'?c2:c,{sw:1,extra:t==='kofun'?ln('M34 57.4l4 3.6M34 57.4l-1 4.4',c2,1):''});
  case'coat':return a.p('M28 44.2H36L36.4 62.4H27.6Z',c2,{sw:1})+a.p('M25.6 44.2L28.4 44.2L30.6 52.6L27 51Z','#c0392b',{sw:.9})+a.p('M38.4 44.2L35.6 44.2L33.4 52.6L37 51Z','#c0392b',{sw:.9})+[48,52,56,60].map(y=>`<circle cx="38.4" cy="${y}" r=".8" fill="${GOLD}" stroke="${OL}" stroke-width=".4"/>`).join('');
  case'deel':return a.p('M30 44Q38 50 42.2 56L42.6 59.4Q36 52 29 46Z',c2,{sw:1})+a.p(rr(20.6,57,22.8,3.2,1.2),c2,{sw:1});
  case'surcoat':return a.p(plate,c,{extra:`<path d="M27.4 49.4l2.4-1.6 2.2 1.6 2.2-1.6 2.4 1.6M27.4 53.4l2.4-1.6 2.2 1.6 2.2-1.6 2.4 1.6M27.4 57.4l2.4-1.6 2.2 1.6 2.2-1.6 2.4 1.6" fill="none" stroke="${c2}" stroke-width="1.1"/>`});
  case'leather':return a.p(`M${23-b} 45H${41+b}L${41.6+b} 60H${22.4-b}Z`,c,{extra:ln('M24 46l16 13',shd(c,-.4),1.6)});
  case'bare':{const lv=L.abs==null?3:L.abs;const cc=shd(L.sk,-.3);if(lv===0)return ln(`M${24.4-b*.3} 49.6q1.6 1 3.2 0M${24.4-b*.3} 52.6q1.6 1 3.2 0M${36.4+b*.3} 49.6q1.6 1 3.2 0M${36.4+b*.3} 52.6q1.6 1 3.2 0`,cc,.7);let o=ln(`M${25.4-b*.4} 49.4q3.4 2 6.6 0q3.2 2 6.6 0`,cc,lv>=2?.9:.6);if(lv>=2)o+=ln('M32 51v7.6',cc,.8);if(lv>=3)o+=ln('M28.6 55.6h6.8M29 58.6h6',cc,.8);if(lv>=4)o+=ln(`M${22.6-b} 47q-1 5 .6 9M${41.4+b} 47q1 5-.6 9`,cc,.7);return o}
 }return''}
function skirtArt(a,L,b){if(!L.skirt)return'';const[t,c]=L.skirt;switch(t){
 case'pteruges':{let s='';for(let i=0;i<6;i++)s+=a.p(rr(20.8-b+i*(3.75+b/3),60.8,3.4,8,1.2),i%2?c:shd(c,.1),{sw:1});return s}
 case'kilt':return a.p(`M${20.6-b} 60.4H${43.4+b}L${45.6+b} 70.6Q32 72.8 ${18.4-b} 70.6Z`,c,{extra:ln('M27 61.6l-1 9M32 61.6v10M37 61.6l1 9',shd(c,-.2),.6)});
 case'long':return a.p(`M${20.8-b} 57.8H${43.2+b}L${47.6+b} 78.8Q32 81.4 ${16.4-b} 78.8Z`,c,{extra:ln('M26 60l-2.6 18M32 60v19M38 60l2.6 18',shd(c,-.2),.7)});
 case'hakama':return a.p('M20.2 58.8H43.8L46.8 78.4H34.4L32.2 66.4L29.8 78.4H17.2Z',c,{extra:ln('M24 60l-2 17M40 60l2 17',shd(c,-.25),.7)});
}return''}
function legArt(a,L,x,back,cls){const sk=L.sk;const leg=L.leg||sk;const sh=L.shoe||['sandal','#8a5a2b'];const f=back?(c=>shd(c,-.12)):(c=>c);const LW=L.lw||6.8;let s=a.p(rr(x+(6.8-LW)/2,62.6,LW,14.2,LW/2.1),f(leg),{sw:1.2});if(L.legC)s+=a.p(rr(x+(6.8-LW)/2-.4,62.4,LW+.8,L.legC[1],Math.min(LW/2.1,L.legC[1]/2)),f(L.legC[0]),{sw:1.2});
 const foot=`M${x-.8} 74.4H${x+8}Q${x+10.6} 74.4 ${x+10.6} 77.2V78.6Q${x+10.6} 80.6 ${x+8.6} 80.6H${x-.6}Q${x-2.2} 80.6 ${x-2.2} 78.8V77.2Q${x-2.2} 74.4 ${x-.8} 74.4Z`;
 switch(sh[0]){
  case'sandal':s+=a.p(foot,f(sk),{sw:1.1})+ln(`M${x-2} 80h12.4`,f(sh[1]),1.6)+ln(`M${x} 72.6l6.8 2.6M${x+6.8} 72.6l-6.8 2.6M${x} 69.4l6.8 2.4`,f(sh[1]),1.1);break;
  case'boot':s+=a.p(`M${x-.4} 68.4H${x+7.2}V74.4Q${x+10.6} 74.4 ${x+10.6} 77.4V80.6H${x-2.2}V76.6Q${x-2.2} 74.4 ${x-.4} 73.8Z`,f(sh[1]),{sw:1.1,hl:[x+7,76,2,1]});break;
  case'zori':s+=a.p(foot,f('#f4f4f4'),{sw:1.1})+ln(`M${x-2} 80.2h12.6`,f(sh[1]),1.6);break;
  case'wingsandal':s+=a.p(foot,f(sk),{sw:1.1})+ln(`M${x-2} 80h12.4`,f(sh[1]),1.6)+a.p(`M${x+1} 72Q${x-4} 68 ${x-6} 70Q${x-3} 72.4 ${x+1} 74Z`,'#f4f4f4',{sw:.9});break;
  case'bare':s+=a.p(foot,f(sk),{sw:1.1})+ln(`M${x+5.6} 76.4v2.4M${x+7.6} 76.6v2.2`,shd(sk,-.3),.6);break;
  case'sneaker':s+=a.p(foot,f(sh[1]),{sw:1.1,hl:[x+6,76,2.4,1]})+a.p(`M${x-2.2} 78.4H${x+10.6}V79.4Q${x+10.6} 81 ${x+9} 81H${x-.8}Q${x-2.2} 81 ${x-2.2} 79.6Z`,'#f4f4f4',{sw:.9})+ln(`M${x+1} 76.2l4 1.6`,f(sh[2]||'#f4f4f4'),1.2);break;
  default:s+=a.p(foot,f(sh[1]),{sw:1.1});
 }return`<g class="${cls}">${s}</g>`}
function shieldArt(a,sh){const[t,c1,c2,em]=sh;switch(t){
 case'aspis':return a.p(ell(19,57.4,8.8,8.8),c1,{hl:[22,54,3,2],extra:ln(ell(19,57.4,6.8,6.8),c2,1)})+(em==='lambda'?ln('M15.6 61.6L19 52.6L22.4 61.6',c2,1.8):em==='sun'?`<circle cx="19" cy="57.4" r="2.4" fill="${c2}"/>`+[...Array(8)].map((_,k)=>ln(`M${(19+3.4*Math.cos(k*.785)).toFixed(1)} ${(57.4+3.4*Math.sin(k*.785)).toFixed(1)}L${(19+5.4*Math.cos(k*.785)).toFixed(1)} ${(57.4+5.4*Math.sin(k*.785)).toFixed(1)}`,c2,1)).join(''):em==='horse'?`<path d="M16.6 61.6q-.6-5 2.6-7.4q3-1.8 4.4.6l-1.6.8q.4 3.6-2.6 6Z" fill="${c2}"/>`:`<circle cx="19" cy="57.4" r="2.2" fill="${c2}" stroke="${OL}" stroke-width=".6"/>`);
 case'scutum':return a.p(rr(12.6,46.4,12.2,21.6,2.6),c1,{hl:[21,50,2,4],extra:`<path d="M14 50h9.4M14 64.6h9.4" stroke="${c2}" stroke-width="1"/><path d="M18.7 52l1.4 3-2.6 1.4 3.4 4.4" fill="none" stroke="${c2}" stroke-width="1"/>`})+`<circle cx="18.7" cy="57.2" r="2.2" fill="${c2}" stroke="${OL}" stroke-width=".7"/>`;
 case'round':return a.p(ell(19,57.4,8.6,8.6),c1,{hl:[22,54,3,2],extra:ln('M10.4 57.4h17.2M19 48.8v17.2',c2,1.4)})+`<circle cx="19" cy="57.4" r="2.2" fill="#9aa3ad" stroke="${OL}" stroke-width=".7"/>`;
 case'kite':return a.p('M12.6 47.2H25.6V57.6Q25.6 64 19.1 69.8Q12.6 64 12.6 57.6Z',c1,{hl:[22,51,2,3],extra:`<path d="M15 52.6l2-1.4 2 1.4 2-1.4 2 1.4M15 57l2-1.4 2 1.4 2-1.4 2 1.4M15.6 61.4l1.8-1.2 1.7 1.2 1.7-1.2 1.8 1.2" fill="none" stroke="${c2}" stroke-width="1"/>`});
 case'oval':return a.p(ell(19,57.4,6.4,10.6),c1,{hl:[21,52,2,3],extra:ln('M19 47.4v20',c2,1.2)})+`<ellipse cx="19" cy="57.4" rx="2" ry="2.8" fill="${c2}" stroke="${OL}" stroke-width=".6"/>`;
 case'parmula':return a.p(rr(13.4,51.6,11.2,11.4,1.6),c1,{extra:`<circle cx="19" cy="57.3" r="1.8" fill="${c2}"/>`});
 case'mirror':return a.p(ell(19,57.4,8.6,8.6),c1,{hl:[22.6,53.6,3.4,2.4],ho:.7,extra:ln(ell(19,57.4,7,7),c2,1.2)+`<path d="M14.6 60.4q2-5.6 7.6-6.6" stroke="#fff" stroke-width="1" fill="none" opacity=".8"/>`});
 case'pelt':return a.p('M13 48Q19.6 45 25.6 48.4Q27.4 56 25 63Q22 67.6 19 66.4Q15.4 68.4 12.4 64Q10.6 56 13 48Z',c1,{extra:[[16,52],[21,55],[17,60],[22,61]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="1.3" ry=".9" fill="${c2}"/>`).join('')});
}return''}
function accArt(a,L){let s='';const acc=L.acc||[];
 if(acc.includes('collar'))s+=a.p('M21.4 44.6Q32 56 42.6 44.6L40.4 43.8Q32 51 23.6 43.8Z','#e2b54a',{sw:1,extra:ln('M23.6 45.6Q32 52.6 40.4 45.6',  '#2a7bd5',1.1)});
 if(acc.includes('torc'))s+=ln('M24.4 44.8Q32 49 39.6 44.8','#2b1e35',2.4)+ln('M24.4 44.8Q32 49 39.6 44.8','#e2b54a',1.4);
 if(acc.includes('magatama'))s+=ln('M24.4 44.6Q32 51 39.6 44.6',OL,.6)+[[27,47.4,'#3ecf8e'],[32,49,'#c0392b'],[37,47.4,'#55a6ff']].map(([x,y,c])=>`<path d="M${x-.8} ${y-1}a1.3 1.3 0 1 1 .6 2.4q-1 .2-1 1.4q-.8-1.8.4-3.8Z" fill="${c}" stroke="${OL}" stroke-width=".4"/>`).join('');
 if(acc.includes('pearls'))s+=ln('M24.4 44.6Q32 50 39.6 44.6','#fff8ee',1.6)+ln('M24.4 44.6Q32 50 39.6 44.6',OL,.4,.6);
 if(acc.includes('brisingamen'))s+=ln('M24.4 44.6Q32 51 39.6 44.6','#e2b54a',1.2)+`<circle cx="32" cy="49.6" r="2.2" fill="#ff9a2a" stroke="${OL}" stroke-width=".6"/>`;
 if(acc.includes('starbelt'))s+=[28,32,36].map(x=>`<path d="M${x} 58.4l.7 1.6 1.6.6-1.6.6-.7 1.6-.7-1.6-1.6-.6 1.6-.6Z" fill="#fff6c8" stroke="${OL}" stroke-width=".3"/>`).join('');
 if(acc.includes('phalerae'))s+=[[27,50],[32,50],[37,50]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.4" fill="#e2b54a" stroke="${OL}" stroke-width=".5"/>`).join('');
 return s}
function elephantArt(a){const g='#9aa3ad',d=shd(g,-.15);
 const leg=(x,cls)=>`<g class="${cls}" style="transform-origin:${x+3}px 70px">${a.p(rr(x,68,6.4,13,2.8),d,{sw:1.1})}<path d="M${x+.6} 80.4h5.2" stroke="#e8e2d0" stroke-width="1.6"/></g>`;
 return`<g class="el">${leg(-26,'e2')}${leg(-13,'e1')}${a.p('M-33.4 60q-3 4-1.6 8',d,{sw:1})}${a.p(ell(-16,64,15.6,12.4),g,{hl:[-10,58,6,3]})}${a.p('M-25 52.6H-8.4L-7.4 63.4H-26Z','#6a2c8a',{sw:1.1,extra:ln('M-26 62h18.6','#e2b54a',1.6)})}${leg(-22,'e1')}${leg(-9.6,'e2')}${a.p(ell(-2,53,11.8,11.2),g,{hl:[2,47,4,2.6]})}${a.p('M-9 53Q-17 52.6-15.6 62Q-12.6 66.6-6.6 62.6Z',shd(g,.12),{sw:1.1,extra:`<ellipse cx="-11" cy="57.6" rx="2.6" ry="3.4" fill="#f0b8c0" opacity=".7"/>`})}<g class="tr" style="transform-origin:7.6px 57px">${a.p('M6.6 55.4Q11.6 59 11 67Q10.6 72 13.6 72L13 74.6Q7.4 75.4 7.6 68Q8 62 4.2 59Z',g,{sw:1.1})}</g>${a.p('M5.6 60q4.4 2 5.4-1.4',  '#f4efe2',{sw:.9})}<ellipse cx="1.6" cy="51" rx="1.7" ry="2.2" fill="${OL}"/><circle cx="2.2" cy="50.2" r=".7" fill="#fff"/><ellipse cx="-2.4" cy="57" rx="2" ry="1.1" fill="#ff8f8f" opacity=".45"/></g>`}
function ravenArt(a){return`<g transform="translate(-5 7)"><g class="rv" style="transform-origin:16px 44px">${a.p('M10 46Q9 38.6 15.4 37.6Q21 38 21.6 43.6Q20 47.4 14.6 47.6Z','#1f1d26',{sw:1})}${a.p(ell(18.4,37,4,3.8),'#1f1d26',{sw:1})}${a.p('M21.6 36.6l4.4 1.2-4 1.6Z','#9aa3ad',{sw:.8})}<circle cx="19.6" cy="36" r=".9" fill="#fff"/>${a.p('M10.6 44.6l-4.4 3 4.8-.4Z','#1f1d26',{sw:.8})}</g></g>`}

/* ---------- ensamblaje ---------- */
const REST_ROT={spear:25,trident:20,bident:20,jewelspear:22,guandao:18,naginata:25,banner:30,musket:25,longsword:16,katana:16,tsurugi:16,was:14};
function chibiSVG(p){const L=p.look||{};const a=new Art();const sk=L.sk||'#f0c8a0';const b=L.b!=null?L.b:(L.bulk?2.2:0);const AW=L.aw||6.2,HR=3.2+AW*.08,SHF=L.b!=null?(b+(L.vsh||0))*.55:0,AX0=22.4-SHF,AX1=41.6+SHF;const iris=L.eye||'#3a2416';const mood=L.mood||'smile';
 const acc=L.acc||[];const at=(L.ar&&L.ar[0])||'none';const bare=at==='bare';const full=['plate','chain','lamellar','surcoat'].includes(at);
 const armC=full?(L.ar[1]):bare?sk:(L.sleeve||L.tu);const handC=acc.includes('gauntlets')||at==='plate'?'#9aa3ad':sk;
 const arm=(sx,rest,back,item,cls,shield)=>{const f=c=>back?shd(c,-.1):c;let s=a.p(rr(sx-AW/2,45,AW,14.4,AW/2),f(sk),{sw:1.2})+(L.delt?a.p(ell(sx,46.8,AW*.62,3.2),f(sk),{sw:1.1,hl:[sx+1,45.6,1.6,.9],ho:.25}):'')+(L.bicep?a.p(ell(sx+(back?-1:1)*AW*.16,49.8,AW*.5,3.1),f(sk),{sw:1.05,hl:[sx+1.2,48.6,1.3,.8],ho:.25}):'')+(!back&&L.tatA?tattooArt(L.tatA,sx,54.6,AW):'');
  const SL=L.sleeveLen!=null?L.sleeveLen:(full?14:7.4);const SW=L.delt?AW*1.32:L.bicep?AW*1.14:AW+.4;if(!bare&&SL>0)s+=a.p(rr(sx-SW/2,44.4,SW,SL+.4,Math.min(SW/2,(SL+.4)/2)),f(armC),{sw:1.2})+(L.sleeveStripe?ln(`M${(sx+SW/2-1.4).toFixed(1)} 45.8V${(44.8+SL-1.2).toFixed(1)}`,f(L.sleeveStripe),1.2):'');
  if(acc.includes('chains'))s+=a.p(rr(sx-3.6,55,7.2,2.2,1),'#9aa3ad',{sw:.9})+ln(`M${sx+2} 57l1 2.6`,'#9aa3ad',1);
  if(acc.includes('epaul'))s+=a.p(rr(sx-4,43.6,8,2.6,1.2),GOLD,{sw:.9});
  const it=item?`<g class="${cls}" style="transform-origin:${sx}px 59.2px"><g transform="translate(${sx} 59.2) rotate(${REST_ROT[item]||0}) scale(1.45)" stroke="${OL}" stroke-width=".3">${itemArt(item)}</g></g>`:'';
  const hand=a.p(ell(sx,59.2,HR,HR),f(handC),{sw:1.2});
  const thb=back?'':`<path class="thb" d="M${(sx+HR-1).toFixed(1)} 58H${(sx+HR+1.2).toFixed(1)}a1.2 1.2 0 0 1 0 2.4H${(sx+HR-1).toFixed(1)}Z" fill="${handC}" stroke="${OL}" stroke-width=".9"/>`;
  return`<g transform="rotate(${rest} ${sx} 47.6)">${s}${it}${hand}${thb}${shield||''}</g>`};
 const o=[`<ellipse class="shadow" cx="32" cy="81.6" rx="${14+b}" ry="2.6"/>`];
 if(L.extra==='elephant')o.push(elephantArt(a));
 if(L.pet)o.push(animalArt(a,L.pet));
 o.push('<g class="wh">');
 if(L.cape)o.push(`<g class="cp">${a.p('M21.6 45.6Q32 43.4 42.4 45.6L46.6 70.6Q38.6 75.4 30.4 73.4Q22.4 74.4 15.6 70.4Z',L.cape,{lx:-1.6,ly:-1.2,extra:L.capeX||''})}</g>`);
 {const hbk=gearBackArt(a,L.hb)+gearBackArt(a,L.hd)+hairBackArt(a,L.hair);o.push(`<g class="hb">${fxBackArt(L.fx)}${L.toy&&hbk?`<g transform="translate(32 44) scale(1.1) translate(-32 -44)">${hbk}</g>`:hbk}</g>`)}
 o.push(legArt(a,L,24.2,true,'lb'),legArt(a,L,33.4,false,'lf'));
 o.push(`<g class="bd">${a.p(TORSO(b,L.vsh),bare?sk:L.tu,{hl:[37,50,4,6],ho:.18})}${L.tatC&&(bare||at==='harness')?tattooChest(L.tatC,b):''}${armorArt(a,L,b)}${L.ar2?armorArt(a,Object.assign({},L,{ar:L.ar2}),b):''}${L.belt?a.p(rr(20.6-b,57.6,22.8+2*b,3.2,1.2),L.belt,{sw:1})+a.f(rr(30,57.2,4,4,.8),GOLD,.8):''}${skirtArt(a,L,b)}${accArt(a,L)}${L.mantle?a.p('M18.6 47.6Q20 42.4 32 42.6Q44 42.4 45.4 47.6Q40 50.6 32 49.6Q24 50.6 18.6 47.6Z',L.mantle,{sw:1.1}):''}</g>`);
 o.push(`<g class="ab" style="transform-origin:${AX0}px 47.6px">${arm(AX0,14,true,L.it2,'it2',L.sh?`<g class="sh">${shieldArt(a,L.sh)}</g>`:'')}</g>`);
 // cabeza
 let h='';
 if(L.head==='falcon')h=falconHead(a,L);else if(L.head==='jackal')h=jackalHead(a,L);
 else{h=a.p('M16.4 26.4Q11.8 26 11.8 31Q12.2 35.8 16.8 35.2Z',sk,{sw:1.2,lx:.8})+a.p(ell(32,28,17.6,16.6),sk,{hl:[40,21,7,4],ho:.18});
  h+=`<ellipse cx="25.4" cy="36.4" rx="2.7" ry="1.5" fill="#ff7f8f" opacity=".45"/><ellipse cx="44.4" cy="36" rx="2.3" ry="1.4" fill="#ff7f8f" opacity=".45"/>`+ln('M36.8 34.4q.9.6.2 1.3',shd(sk,-.38),.9)}
 const eye=(x,rx)=>`<ellipse cx="${x}" cy="31.4" rx="${rx}" ry="3.8" fill="${OL}"/><ellipse cx="${x}" cy="32.6" rx="${rx-.7}" ry="2.4" fill="${iris}"/><circle cx="${x+1}" cy="29.9" r="1.25" fill="#fff"/><circle cx="${x-.9}" cy="33" r=".6" fill="#fff"/>`;
 const eyes=acc.includes('eyepatch')?eye(40.6,2.6)+a.p('M24.6 30.4Q29.6 27 34 30.4Q33.6 35 29.4 35Q25 35 24.6 30.4Z','#1a1a22',{sw:1})+ln('M15 25.4L44 23.6',OL,1.1):acc.includes('eyepatchR')?eye(29.4,2.85)+a.p('M36 30.2Q40.6 27 45 30.2Q44.6 34.8 40.4 34.8Q36.4 34.8 36 30.2Z','#1a1a22',{sw:1})+ln('M20 23.6L50 26',OL,1.1):eye(29.4,2.85)+eye(40.6,2.6);
 const brows=mood==='serious'?ln('M26.4 25.6l5.4 1.6M43 25.4l-5.2 1.8',L.hair?shd(L.hair[1],-.3):OL,1.4):ln('M26.6 26.2q2.6-1.6 5.4-.4M37.8 25.8q2.6-1.4 5.2 0',L.hair?shd(L.hair[1],-.3):OL,1.3);
 const mouths={smile:`<path d="M33 36.8q3 3.6 6.4 0q-.4 3.4-3.2 3.4q-2.8 0-3.2-3.4Z" fill="#7a2232" stroke="${OL}" stroke-width="1"/><path d="M34.4 38.8q1.8-.9 3.6 0q-.6 1.2-1.8 1.2q-1.2 0-1.8-1.2Z" fill="#ff8a9a"/>`,grin:`<path d="M32 36.4q4.2 4.6 8.6 0q-.6 4-4.3 4q-3.7 0-4.3-4Z" fill="#7a2232" stroke="${OL}" stroke-width="1"/><path d="M32.8 37.2q3.5 1.6 7 0v.9q-3.5 1.2-7 0Z" fill="#fff"/>`,calm:ln('M33.4 37.6q2.8 2 5.6 0',OL,1.1),smirk:ln('M33.6 38q3.4 1 5.8-1.4',OL,1.1),serious:ln('M33.8 38h5',OL,1.2)};
 const faceUp=L.head?'':`<g class="ey" style="animation-delay:${(-(PN%9)*.53).toFixed(2)}s">${eyes}</g><g class="eh">${ln('M26.4 32.6q3-4 6 0M37.6 32.6q3-4 6 0',OL,1.5)}</g><g class="ec">${ln('M26.6 32q2.8 1.8 5.6 0M37.8 32q2.6 1.8 5.2 0',OL,1.3)}</g>${brows}<g class="mn">${mouths[mood]||mouths.smile}</g><g class="mo"><ellipse cx="36.2" cy="38.4" rx="1.7" ry="2.1" fill="#7a2232" stroke="${OL}" stroke-width="1"/></g>`;
 const animalFace=L.head?`<g class="ey" style="animation-delay:${(-(PN%9)*.53).toFixed(2)}s">${L.head==='falcon'?`<circle cx="40.2" cy="29" r="3.8" fill="#e8b23a" stroke="${OL}" stroke-width="1"/><circle cx="40.6" cy="29" r="2.5" fill="${OL}"/><circle cx="41.6" cy="27.7" r="1" fill="#fff"/>`:`<ellipse cx="29.6" cy="28" rx="3.5" ry="4" fill="#e8b23a" stroke="${OL}" stroke-width="1"/><ellipse cx="30" cy="28.6" rx="2" ry="2.6" fill="${OL}"/><circle cx="31" cy="26.8" r="1.2" fill="#fff"/><ellipse cx="40.4" cy="27.4" rx="3.1" ry="3.7" fill="#e8b23a" stroke="${OL}" stroke-width="1"/><ellipse cx="40.8" cy="28" rx="1.8" ry="2.4" fill="${OL}"/><circle cx="41.7" cy="26.3" r="1.1" fill="#fff"/>`}</g><g class="eh">${ln('M26.6 29.6q3-4 6 0M37 29q3-4 6 0',L.head==='jackal'?'#e2b54a':OL,1.5)}</g><g class="ec">${ln('M26.8 29q2.8 1.8 5.6 0M37.4 28.6q2.6 1.8 5.2 0',L.head==='jackal'?'#e2b54a':OL,1.3)}</g><g class="mn"></g><g class="mo"></g>`:'';
 if(L.head)h+=animalFace;else h+=beardArt(a,L.beard)+faceUp+hairFrontArt(a,L.hair)+faceAccArt(a,L.face);
 h+=gearArt(a,L.hd,L);
 if(L.toy)h=`<g transform="translate(32 44) scale(1.1) translate(-32 -44)">${h}${ln('M19.4 19q3.6-6.8 11.6-8.2','#fff',2.4,.45)}<circle cx="17.6" cy="23.6" r="1.1" fill="#fff" opacity=".45"/></g>`;
 o.push(`<g class="hd">${h}</g>`);
 if(L.extra==='raven')o.push(ravenArt(a));
 o.push(`<g class="af" style="transform-origin:${AX1}px 47.6px">${arm(AX1,-14,false,L.it,'it')}</g>`);
 o.push(projArt(p.act));
 o.push(fxFrontArt(L.fx));
 o.push('</g>');
 return`<defs>${a.defs}</defs>${o.join('')}`;
}
function projArt(act){switch(act){
 case'bow':return`<g class="pj"><path d="M50 48h10" stroke="#7a4a22" stroke-width="1.1"/><path d="M61 48l-2.4-1.3v2.6Z" fill="#dde2e8" stroke="${OL}" stroke-width=".4"/></g>`;
 case'bolt':return`<g class="pj"><path d="M52 40L46 50H50L45.6 60L56.6 46.6H52.4L56 40Z" fill="#ffe24a" stroke="#e89a20" stroke-width=".8"/></g>`;
 case'aim':return`<g class="pj"><circle cx="66" cy="47" r="2.6" fill="#d8dde4"/><circle cx="69.6" cy="45.6" r="1.8" fill="#c4cad2"/><path d="M62.6 48l3.2-1.6v3.2Z" fill="#ffb02e"/></g>`;
 case'cast':return`<g class="pj">${[[48,22],[56,30],[44,14],[58,18]].map(([x,y],i)=>`<path class="sp${i}" d="M${x} ${y-3}l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9Z" fill="#fff6a8" stroke="#e8b23a" stroke-width=".4"/>`).join('')}</g>`;
 case'slam':return`<g class="pj"><path d="M44 81l4-8 2 4 3-9 2 7 3-5" fill="none" stroke="#9fd4ff" stroke-width="1.6" stroke-linejoin="round"/><path d="M44 81l4-8 2 4 3-9 2 7 3-5" fill="none" stroke="#fff" stroke-width=".6"/></g>`;
}return''}
function petClass(p){const L=p.look||{};return'pt'+(L.toy?' toy':'')+(L.it2&&p.act==='swing'&&['katana','wakizashi'].includes(L.it2)?' dual':'')+(L.extra?' ex-'+L.extra:'')}
function petSVG(p,state){const L=p.look||{};const vb=L.extra==='elephant'?'-36 -10 100 94':L.pet?'-30 -10 94 94':'0 -10 64 94';
 return`<svg class="${petClass(p)} ${state||''}" viewBox="${vb}" aria-hidden="true">${chibiSVG(p)}</svg>`;
}

/* ================= estilos del módulo ================= */
(function(){const css=`
.pt{overflow:visible;display:block}.pt g{transform-box:view-box}.pt .shadow{fill:rgba(20,10,30,.28)}
.pt .lb{transform-origin:27.6px 63px}.pt .lf{transform-origin:36.8px 63px}.pt .ab{transform-origin:22.4px 47.6px}.pt .af{transform-origin:41.6px 47.6px}
.pt .it{transform-origin:41.6px 59.2px}.pt .it2{transform-origin:22.4px 59.2px}.pt .wh{transform-origin:32px 81px}.pt .hd{transform-origin:32px 44px}.pt .cp{transform-origin:32px 46px}.pt .bd{transform-origin:32px 66px}
.pt .pj{opacity:0}.pt .eh,.pt .ec,.pt .mo{display:none}
.pt .ey{transform-box:fill-box;transform-origin:center;animation:pk-blink 4.6s infinite}
@keyframes pk-blink{0%,93%,100%{transform:scaleY(1)}95%{transform:scaleY(.08)}}
.pt .halo{transform-box:fill-box;transform-origin:center;animation:pk-halo 3.2s ease-in-out infinite}@keyframes pk-halo{0%,100%{transform:scale(1);opacity:.92}50%{transform:scale(1.04);opacity:1}}
.pt .rv{animation:pk-rv 2.4s ease-in-out infinite}@keyframes pk-rv{0%,70%,100%{transform:rotate(0)}80%{transform:rotate(-12deg)}90%{transform:rotate(6deg)}}
@keyframes pk-leg{0%,100%{transform:rotate(22deg)}50%{transform:rotate(-22deg)}}
@keyframes pk-arm{0%,100%{transform:rotate(-18deg)}50%{transform:rotate(18deg)}}
@keyframes pk-bob{0%,50%,100%{transform:translateY(0) rotate(0)}25%{transform:translateY(-1.6px) rotate(2.5deg)}75%{transform:translateY(-1.6px) rotate(-2.5deg)}}
@keyframes pk-hb{0%,50%,100%{transform:rotate(0)}25%{transform:rotate(-2deg)}75%{transform:rotate(2deg)}}
@keyframes pk-cape{0%,100%{transform:rotate(3deg)}50%{transform:rotate(10deg)}}
@keyframes pk-br{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.025)}}
.pt.walk .lf{animation:pk-leg .56s ease-in-out infinite}.pt.walk .lb{animation:pk-leg .56s ease-in-out -.28s infinite}
.pt.walk .af{animation:pk-arm .56s ease-in-out -.28s infinite}.pt.walk .ab{animation:pk-arm .56s ease-in-out infinite}
.pt.walk .wh{animation:pk-bob .56s linear infinite}.pt.walk .hd{animation:pk-hb .56s ease-in-out infinite}.pt.walk .cp{animation:pk-cape .56s ease-in-out infinite}
.pt.idle .bd,.pt.sit .bd,.pt.sitf .bd{animation:pk-br 2.4s ease-in-out infinite}.pt.idle .cp{animation:pk-cape 3s ease-in-out infinite}.pt.idle .hd{animation:pk-hb 4s ease-in-out infinite}
@keyframes pk-kick{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(16deg)}}
.pt.sit .wh{transform:translateY(17px)}.pt.sit .lf{animation:pk-kick 1.4s ease-in-out infinite}.pt.sit .lb{animation:pk-kick 1.4s ease-in-out -.7s infinite}.pt.sit .af{transform:rotate(-8deg)}.pt.sit .ab{transform:rotate(8deg)}.pt.sit .shadow,.pt.sleep .shadow{opacity:0}
.pt.sitf .wh,.pt.sleep .wh{transform:translateY(13px)}.pt.sitf .lf,.pt.sitf .lb,.pt.sleep .lf,.pt.sleep .lb{transform:rotate(-80deg)}
.pt.sleep .hd{animation:pk-sl 3s ease-in-out infinite}@keyframes pk-sl{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(-8deg) translateY(.6px)}}
.pt.sleep .ey,.pt.sleep .eh,.pt.sleep .mn{display:none}.pt.sleep .ec,.pt.sleep .mo{display:inline}
@keyframes pk-dkick{0%,100%{transform:rotate(-30deg)}50%{transform:rotate(30deg)}}
@keyframes pk-dsw{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
.pt.drag .lf{animation:pk-dkick .3s linear infinite}.pt.drag .lb{animation:pk-dkick .3s linear -.15s infinite}
.pt.drag .af{transform:rotate(-150deg)}.pt.drag .ab{transform:rotate(150deg)}.pt.drag .wh{animation:pk-dsw .6s ease-in-out infinite}
.pt.drag .mn,.pt.fall .mn{display:none}.pt.drag .mo,.pt.fall .mo{display:inline}
@keyframes pk-flail{0%,100%{transform:rotate(-160deg)}50%{transform:rotate(-120deg)}}
@keyframes pk-flailB{0%,100%{transform:rotate(160deg)}50%{transform:rotate(120deg)}}
.pt.fall .af{animation:pk-flail .22s linear infinite}.pt.fall .ab{animation:pk-flailB .22s linear infinite}.pt.fall .lf{transform:rotate(-24deg)}.pt.fall .lb{transform:rotate(24deg)}
.pt.jump .af{transform:rotate(-150deg)}.pt.jump .ab{transform:rotate(150deg)}.pt.jump .lf{transform:rotate(-30deg)}.pt.jump .lb{transform:rotate(18deg)}.pt.jump .ey{display:none}.pt.jump .eh{display:inline}
@keyframes pk-land{0%{transform:scale(1.1,.78)}60%{transform:scale(.96,1.05)}100%{transform:none}}
.pt.land .wh{animation:pk-land .3s ease-out}
@keyframes pk-clA{0%,100%{transform:rotate(-170deg)}50%{transform:rotate(-120deg)}}
@keyframes pk-clB{0%,100%{transform:rotate(120deg)}50%{transform:rotate(170deg)}}
@keyframes pk-clL{0%,100%{transform:rotate(-40deg)}50%{transform:rotate(10deg)}}
.pt.climb .af{animation:pk-clA .6s ease-in-out infinite}.pt.climb .ab{animation:pk-clB .6s ease-in-out infinite}.pt.climb .lf{animation:pk-clL .6s ease-in-out infinite}.pt.climb .lb{animation:pk-clL .6s ease-in-out -.3s infinite}
@keyframes pk-chA{0%,100%{transform:rotate(-150deg)}50%{transform:rotate(-125deg)}}
@keyframes pk-chB{0%,100%{transform:rotate(150deg)}50%{transform:rotate(125deg)}}
@keyframes pk-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}
.pt.cheer .af{animation:pk-chA .35s ease-in-out infinite}.pt.cheer .ab{animation:pk-chB .35s ease-in-out infinite}.pt.cheer .wh{animation:pk-hop .5s ease-out infinite}.pt.cheer .ey{display:none}.pt.cheer .eh{display:inline}
@keyframes pk-swA{0%,100%{transform:rotate(-4deg)}30%{transform:rotate(-196deg)}48%,62%{transform:rotate(-50deg)}}
@keyframes pk-swI{0%,100%{transform:rotate(0)}30%{transform:rotate(20deg)}48%,62%{transform:rotate(140deg)}}
@keyframes pk-guard{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(-30deg)}}
@keyframes pk-lunge{0%,100%{transform:none}48%,62%{transform:translateX(2px) rotate(4deg)}}
.pt.act-swing .af,.pt.act-slam .af,.pt.act-bolt .af{animation:pk-swA 1.1s cubic-bezier(.5,0,.3,1) infinite}.pt.act-swing .it,.pt.act-slam .it{animation:pk-swI 1.1s cubic-bezier(.5,0,.3,1) infinite}
.pt.act-swing .ab,.pt.act-slam .ab,.pt.act-bolt .ab{animation:pk-guard 1.1s ease-in-out infinite}.pt.act-swing .wh,.pt.act-slam .wh,.pt.act-bolt .wh{animation:pk-lunge 1.1s ease-in-out infinite}
.pt.dual.act-swing .ab{animation:pk-swA 1.1s cubic-bezier(.5,0,.3,1) -.55s infinite}.pt.dual.act-swing .it2{animation:pk-swI 1.1s cubic-bezier(.5,0,.3,1) -.55s infinite}
@keyframes pk-zap{0%,46%{opacity:0}50%,64%{opacity:1}70%,100%{opacity:0}}.pt.act-slam .pj{animation:pk-zap 1.1s linear infinite}
@keyframes pk-boltf{0%,46%{opacity:0;transform:translate(0,0)}50%{opacity:1;transform:translate(0,0)}82%{opacity:1;transform:translate(38px,6px)}86%,100%{opacity:0;transform:translate(38px,6px)}}
@keyframes pk-bolth{0%,44%{opacity:1}46%,100%{opacity:0}}.pt.act-bolt .pj{animation:pk-boltf 1.1s linear infinite}.pt.act-bolt .it{animation:pk-bolth 1.1s linear infinite}
@keyframes pk-thA{0%,100%{transform:rotate(-20deg)}35%{transform:translateX(-1.5px) rotate(-62deg)}50%,64%{transform:translateX(4px) rotate(-84deg)}}
@keyframes pk-thI{0%,100%{transform:rotate(0)}35%{transform:rotate(120deg)}50%,64%{transform:rotate(149deg)}}
.pt.act-thrust .af{animation:pk-thA 1.2s ease-in-out infinite}.pt.act-thrust .it{animation:pk-thI 1.2s ease-in-out infinite}.pt.act-thrust .ab{animation:pk-guard 1.2s ease-in-out infinite}
@keyframes pk-bowA{0%,100%{transform:rotate(-4deg)}25%,80%{transform:rotate(-76deg)}}
@keyframes pk-bowI{0%,100%{transform:rotate(0)}25%,80%{transform:rotate(90deg)}}
@keyframes pk-bowB{0%,100%{transform:rotate(4deg)}25%{transform:rotate(-100deg)}50%,58%{transform:translateX(-3px) rotate(-92deg)}62%,80%{transform:rotate(-100deg)}}
@keyframes pk-arrow{0%,58%{opacity:0;transform:translateX(0)}60%{opacity:1;transform:translateX(0)}88%{opacity:1;transform:translateX(34px)}90%,100%{opacity:0;transform:translateX(34px)}}
.pt.act-bow .af{animation:pk-bowA 1.8s ease-in-out infinite}.pt.act-bow .it{animation:pk-bowI 1.8s ease-in-out infinite}.pt.act-bow .ab{animation:pk-bowB 1.8s ease-in-out infinite}.pt.act-bow .pj{animation:pk-arrow 1.8s linear infinite}
@keyframes pk-aim{0%,100%{transform:rotate(-4deg)}25%,80%{transform:rotate(-76deg)}}
@keyframes pk-aimI{0%,100%{transform:rotate(0)}25%,80%{transform:rotate(155deg)}}
@keyframes pk-aimB{0%,100%{transform:rotate(4deg)}25%,80%{transform:rotate(-96deg)}}
@keyframes pk-smoke{0%,52%{opacity:0;transform:translateX(0)}55%{opacity:1}80%{opacity:0;transform:translateX(6px)}100%{opacity:0}}
.pt.act-aim .af{animation:pk-aim 2.2s ease-in-out infinite}.pt.act-aim .it{animation:pk-aimI 2.2s ease-in-out infinite}.pt.act-aim .ab{animation:pk-aimB 2.2s ease-in-out infinite}.pt.act-aim .pj{animation:pk-smoke 2.2s linear infinite}
@keyframes pk-sal{0%,100%{transform:rotate(-4deg)}20%,80%{transform:rotate(-150deg)}}
@keyframes pk-salI{0%,100%{transform:rotate(0)}20%,80%{transform:rotate(164deg)}}
.pt.act-salute .af{animation:pk-sal 2.4s ease-in-out infinite}.pt.act-salute .it{animation:pk-salI 2.4s ease-in-out infinite}.pt.act-salute .cp{animation:pk-cape 1.2s ease-in-out infinite}.pt.act-salute .ey{display:none}.pt.act-salute .eh{display:inline}
@keyframes pk-pt{0%,100%{transform:rotate(-4deg)}25%,75%{transform:rotate(-76deg)}}
@keyframes pk-ptI{0%,100%{transform:rotate(0)}25%,75%{transform:rotate(180deg)}}
.pt.act-point .af{animation:pk-pt 2.2s ease-in-out infinite}.pt.act-point .it{animation:pk-ptI 2.2s ease-in-out infinite}.pt.act-point .hd{animation:pk-hb 1.1s ease-in-out infinite}
@keyframes pk-rd{0%,100%{transform:rotate(-4deg)}25%,75%{transform:rotate(-40deg)}}
@keyframes pk-rdH{0%,100%{transform:rotate(0)}40%,60%{transform:rotate(7deg)}}
.pt.act-read .af{animation:pk-rd 2.6s ease-in-out infinite}.pt.act-read .hd{animation:pk-rdH 2.6s ease-in-out infinite}.pt.act-read .ey{display:none}.pt.act-read .ec{display:inline}
@keyframes pk-flex{0%,100%{transform:rotate(-4deg)}30%,70%{transform:rotate(-130deg)}50%{transform:rotate(-118deg)}}
@keyframes pk-flexB{0%,100%{transform:rotate(4deg)}30%,70%{transform:rotate(130deg)}50%{transform:rotate(118deg)}}
.pt.act-flex .af{animation:pk-flex 1.6s ease-in-out infinite}.pt.act-flex .ab{animation:pk-flexB 1.6s ease-in-out infinite}.pt.act-flex .ey{display:none}.pt.act-flex .eh{display:inline}
@keyframes pk-ban{0%,100%{transform:rotate(-4deg)}20%,80%{transform:rotate(-150deg)}}
@keyframes pk-banI{0%,100%{transform:rotate(0)}20%,80%{transform:rotate(134deg)}40%{transform:rotate(122deg)}60%{transform:rotate(146deg)}}
.pt.act-banner .af{animation:pk-ban 2.4s ease-in-out infinite}.pt.act-banner .it{animation:pk-banI 2.4s ease-in-out infinite}
@keyframes pk-cast{0%,100%{transform:rotate(-4deg)}25%,75%{transform:rotate(-130deg)}}
@keyframes pk-castI{0%,100%{transform:rotate(0)}25%,75%{transform:rotate(134deg)}}
@keyframes pk-castB{0%,100%{transform:rotate(4deg)}25%,75%{transform:rotate(40deg)}}
@keyframes pk-rise{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
@keyframes pk-spark{0%{opacity:0;transform:scale(.2)}40%{opacity:1;transform:scale(1.25)}100%{opacity:0;transform:scale(.6) translateY(-6px)}}
.pt.act-cast .af{animation:pk-cast 2.4s ease-in-out infinite}.pt.act-cast .it{animation:pk-castI 2.4s ease-in-out infinite}.pt.act-cast .ab{animation:pk-castB 2.4s ease-in-out infinite}.pt.act-cast .wh{animation:pk-rise 1.2s ease-in-out infinite}
.pt.act-cast .pj{opacity:1}.pt.act-cast .pj path{opacity:0;transform-box:fill-box;transform-origin:center;animation:pk-spark 1.2s ease-out infinite}.pt.act-cast .pj .sp1{animation-delay:-.3s}.pt.act-cast .pj .sp2{animation-delay:-.6s}.pt.act-cast .pj .sp3{animation-delay:-.9s}.pt.act-cast .ey{display:none}.pt.act-cast .eh{display:inline}
.pt.walk .e1{animation:pk-q .56s ease-in-out infinite}.pt.walk .e2{animation:pk-q .56s ease-in-out -.28s infinite}@keyframes pk-q{0%,100%{transform:rotate(14deg)}50%{transform:rotate(-14deg)}}
@keyframes pk-tail{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(6deg)}}.pt .tr{animation:pk-tail 1.4s ease-in-out infinite}
@keyframes pk-trunk{0%,100%{transform:rotate(0)}40%,60%{transform:rotate(-70deg)}}.pt[class*="act-"] .tr{animation:pk-trunk 2s ease-in-out infinite}
#pets{position:fixed;inset:0;pointer-events:none;z-index:40;overflow:hidden}
.pet{position:absolute;left:0;top:0;height:74px;pointer-events:auto;touch-action:none;cursor:grab;will-change:transform;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}
.pet>svg{height:100%;width:auto;display:block}.pet.flip>svg{transform:scaleX(-1)}
.pet>svg{filter:drop-shadow(0 0 3px var(--gl,transparent))}
.pbub{position:absolute;bottom:calc(100% - 4px);left:50%;transform:translateX(-50%);background:#fffaf0;color:#2b1e35;font:600 12px/1.25 var(--f-body);padding:6px 9px;border-radius:12px;border:2px solid #2b1e35;width:max-content;max-width:150px;text-align:center;box-shadow:0 3px 0 rgba(0,0,0,.25);pointer-events:none;animation:pop .3s cubic-bezier(.2,1.4,.4,1)}
.pbub::after{content:"";position:absolute;top:100%;left:50%;margin-left:-6px;border:6px solid transparent;border-top-color:#2b1e35}
body.has-pets{padding-bottom:110px!important}
.pet-ic svg.pt{height:42px;width:auto}.icon .chest{width:38px;height:auto}.icon .frm{width:40px;height:40px}
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
const OLD_PETS={pet_recluta:['raro','Recluta de la Liga'],pet_pesista:['raro','Pesista de Barrio'],pet_kaito:['raro','Kaito'],pet_rin:['raro','Rin'],pet_sora:['raro','Sora'],pet_shaolin:['raro','Monje Shaolin'],pet_chasqui:['raro','Chasqui'],pet_sumo:['raro','Luchador de Sumo'],pet_centurion:['épico','Centurión'],pet_hoplita:['épico','Hoplita Espartano'],pet_murmillo:['épico','Gladiador Murmillo'],pet_samurai:['épico','Samurái'],pet_vikingo:['épico','Vikingo'],pet_ninja:['épico','Ninja'],pet_caballero:['épico','Caballero Medieval'],pet_weichafe:['épico','Weichafe Mapuche'],pet_jaguar:['épico','Guerrero Jaguar'],pet_marea:['épico','Capitana Marea'],pet_kraken:['épico','Kraken de Bolsillo'],pet_minotauro:['épico','Minotauro Gimnasta'],pet_legionario:['legendario','Legionario Romano'],pet_pachacutec:['legendario','Pachacútec'],pet_dragon:['legendario','Dragón de Bolsillo'],pet_kitsune:['legendario','Kitsune de Nueve Colas'],pet_akane:['legendario','Akane'],pet_lautaro:['mítico','Lautaro'],pet_fenix:['mítico','Fénix']};
function migratePets(){if(!S||S.petsV===2)return;S.petsV=2;const notes=[],map={};
 for(const i of S.inventory||[]){if(i.type!=='companero'||PET_BY[i.rid])continue;const o=OLD_PETS[i.rid]||['raro',i.rid];
  const pool=PETS.filter(p=>p.rarity===o[0]&&!S.pokedex[p.id]&&!Object.values(map).includes(p.id));const n=pool.length?pool[Math.floor(Math.random()*pool.length)]:null;
  delete S.pokedex[i.rid];if(n){map[i.rid]=n.id;S.pokedex[n.id]={first:today(),count:1};notes.push(`Tu compañero ${o[1]} se transformó en ${n.name} (${n.rarity}).`);i.rid=n.id}else i.status='used'}
 for(const k of Object.keys(S.pokedex||{}))if(k.startsWith('pet_')&&!PET_BY[k])delete S.pokedex[k];
 const E=S.equip;if(E){if(E.pets)E.pets=E.pets.map(id=>map[id]||id).filter(id=>PET_BY[id]);if(E.avatar&&E.avatar.startsWith('pet_')&&!PET_BY[E.avatar])E.avatar=map[E.avatar]||null}
 if(notes.length)UI.reveals.push({kind:'notes',notes})}
function ensureChestState(){if(!S)return;S.equip=S.equip||{};const E=S.equip;E.pets=E.pets||[];for(const k of['avatar','marco','fondo','aura','fx','lema'])if(E[k]===undefined)E[k]=null;S.chestCycle=S.chestCycle||0;S.streakChests=S.streakChests||{};S.stats=S.stats||{missions:0,objectives:0};S.stats.chests=S.stats.chests||0;S.stats.chestTier=S.stats.chestTier||{};migratePets()}
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

/* ================= compañeros vivos (estilo Shimeji) =================
   Caminan, se suben y se sientan en las tarjetas, trepan los bordes, duermen, se pueden arrastrar y lanzar,
   caen con gravedad y reaccionan cuando los tocas o ganas premios. */
const PET_H=74,GRAV=1700;
const PETS_RT={list:[],raf:0,last:0,key:''};
const rnd=a=>a[Math.floor(Math.random()*a.length)];
function petPlats(){const hdr=document.querySelector('header.top');const hb=hdr?hdr.getBoundingClientRect().bottom:0;const H=innerHeight;const out=[];
 for(const el of document.querySelectorAll('#view .card,#view .kpi,#view .hero,#view .icard,#view .chcard,#view .pf-card,#view .stat,#view .dex,#view .lad.cur')){const r=el.getBoundingClientRect();if(r.width<64||r.top<hb+PET_H*.85||r.top>H-PET_H*.5)continue;out.push({el,top:r.top,l:r.left+14,r:r.right-14})}
 return{list:out,hb,H}}
function setPose(q,c){if(q.cls===c)return;q.cls=c;q.svg.setAttribute('class',petClass(q.p)+' '+c)}
function petPose(q,cls,st,now,dur){q.state=st;q.until=now+dur;setPose(q,cls)}
function petSay(q,text,ms){const t=text||rnd(q.p.say||['¡Una más!']);q.bub.textContent=t;q.bub.hidden=false;q.lastSay=performance.now();clearTimeout(q.bubT);q.bubT=setTimeout(()=>{q.bub.hidden=true},ms||2800)}
function petFall(q,keepV){q.plat=null;if(!keepV){q.vx=0;q.vy=0}q.state='fall';setPose(q,'fall')}
function petLand(q,now){const hard=q.vy>950;q.vx=0;q.vy=0;petPose(q,'land','land',now,320);if(hard&&Math.random()<.6)petSay(q,rnd(['¡Uf!','¡Auch!','¡Aterrizaje perfecto!','¡Otra vez!']),1600)}
function petJump(q){const P=petPlats();const c=P.list.filter(pl=>pl.el!==q.plat&&pl.top<q.y-24&&pl.top>q.y-300&&pl.r-pl.l>40&&Math.abs((pl.l+pl.r)/2-q.x)<320);if(!c.length)return false;
 const pl=rnd(c);const tx=clamp(q.x+(Math.random()-.5)*140,pl.l+6,pl.r-6);const T=.62;q.vx=(tx-q.x)/T;q.vy=(pl.top-q.y-.5*GRAV*T*T)/T;q.dir=q.vx<0?-1:1;q.plat=null;q.state='jump';setPose(q,'jump');return true}
function petClimb(q,now){const P=petPlats();q.state='climb';q.dir=q.x<innerWidth/2?-1:1;q.climbTo=Math.max(P.hb+PET_H+30,innerHeight*(.25+Math.random()*.35));setPose(q,'climb')}
function petNext(q,now){const st=q.state;const R=Math.random();
 if(q.afterLand){q.afterLand=null;petPose(q,'act-'+q.p.act,'act',now,2600);return}
 if(st==='walk'){
  if(R<.32)petPose(q,'act-'+q.p.act,'act',now,2600+Math.random()*1600);
  else if(R<.44)petPose(q,'idle','idle',now,1500+Math.random()*2000);
  else if(R<.6)petPose(q,q.plat?'sit':'sitf','sit',now,3500+Math.random()*4500);
  else if(R<.82&&petJump(q)){}
  else{q.dir=Math.random()<.5?-1:1;petPose(q,'walk','walk',now,3000+Math.random()*5000)}
 }else if(st==='sit'&&Math.random()<.4){petPose(q,'sleep','sleep',now,7000+Math.random()*6000);petSay(q,'Zzz…',5200)}
 else petPose(q,'walk','walk',now,3000+Math.random()*5000);
 if(now-q.lastSay>25000&&Math.random()<.3&&q.state!=='sleep')petSay(q)}
function petTap(q){if(['fall','jump','drag','climb'].includes(q.state))return;q.vy=-440;q.vx=0;q.plat=null;q.state='jump';setPose(q,'jump');q.afterLand='act';petSay(q)}
function petsCheer(text){for(const q of PETS_RT.list){if(['drag','fall','jump','climb'].includes(q.state))continue;q.vy=-400;q.vx=0;q.plat=null;q.state='jump';setPose(q,'jump');q.afterLand='act';petSay(q,text||null,2600)}}
function mkPet(id,i){const p=PET_BY[id];const el=document.createElement('div');el.className='pet';if(p.glow)el.style.setProperty('--gl',p.glow);else if(p.rarity==='mítico')el.style.setProperty('--gl','rgba(255,90,138,.7)');else if(p.rarity==='legendario')el.style.setProperty('--gl','rgba(245,184,61,.55)');
 el.innerHTML=petSVG(p,'fall')+'<div class="pbub" hidden></div>';el.setAttribute('aria-label',p.name);
 const q={id,p,el,svg:el.firstElementChild,bub:el.lastElementChild,x:innerWidth*(.25+.45*i),y:(document.querySelector('header.top')||{getBoundingClientRect:()=>({bottom:60})}).getBoundingClientRect().bottom+PET_H+10,vx:0,vy:0,dir:i%2?-1:1,speed:24+Math.random()*10,state:'fall',until:0,plat:null,cls:'fall',w:56,h:PET_H,lastSay:0,drag:null};
 el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();try{el.setPointerCapture(e.pointerId)}catch(_){}q.drag={px:e.clientX,py:e.clientY,ox:q.x-e.clientX,oy:q.y-e.clientY,hist:[[e.clientX,e.clientY,performance.now()]],moved:false}});
 el.addEventListener('pointermove',e=>{const d=q.drag;if(!d)return;if(!d.moved&&Math.hypot(e.clientX-d.px,e.clientY-d.py)>7){d.moved=true;q.state='drag';q.plat=null;setPose(q,'drag');if(Math.random()<.6)petSay(q,rnd(['¡Bájame!','¡Wiii!','¡Eh, cuidado!','¿A dónde vamos?']),1400)}
  if(d.moved){q.x=clamp(e.clientX+d.ox,q.w/2,innerWidth-q.w/2);q.y=clamp(e.clientY+d.oy,q.h,innerHeight-6);d.hist.push([e.clientX,e.clientY,performance.now()]);if(d.hist.length>6)d.hist.shift()}});
 const up=e=>{const d=q.drag;if(!d)return;q.drag=null;if(!d.moved){petTap(q);return}const h=d.hist,a=h[0],b=h[h.length-1];const t=Math.max(.016,(b[2]-a[2])/1000);q.vx=clamp((b[0]-a[0])/t,-1100,1100);q.vy=clamp((b[1]-a[1])/t,-1300,900);q.state='fall';setPose(q,'fall')};
 el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('click',e=>e.stopPropagation());
 return q}
function syncPets(){
 const want=((S&&S.equip&&S.equip.pets)||[]).filter(id=>PET_BY[id]&&owned(id)).slice(0,2);let layer=document.getElementById('pets');
 if(!want.length){if(layer)layer.remove();PETS_RT.list=[];PETS_RT.key='';document.body.classList.remove('has-pets');if(PETS_RT.raf){cancelAnimationFrame(PETS_RT.raf);PETS_RT.raf=0}return}
 if(!layer){layer=document.createElement('div');layer.id='pets';document.body.appendChild(layer);PETS_RT.key=''}
 document.body.classList.add('has-pets');const key=want.join(',');if(key===PETS_RT.key)return;PETS_RT.key=key;
 const keep=PETS_RT.list.filter(q=>want.includes(q.id));for(const q of PETS_RT.list)if(!keep.includes(q))q.el.remove();
 PETS_RT.list=want.map((id,i)=>keep.find(q=>q.id===id)||(()=>{const q=mkPet(id,i);layer.appendChild(q.el);return q})());
 if(RM){for(const q of PETS_RT.list){q.y=innerHeight-6;setPose(q,'idle');q.el.style.transform=`translate(${(q.x-28).toFixed(0)}px,${(q.y-q.h).toFixed(0)}px)`}return}
 if(!PETS_RT.raf){PETS_RT.last=performance.now();PETS_RT.raf=requestAnimationFrame(petLoop)}
}
function petLoop(now){
 const layer=document.getElementById('pets');if(!layer||!PETS_RT.list.length){PETS_RT.raf=0;return}
 const dt=Math.min(.05,(now-PETS_RT.last)/1000);PETS_RT.last=now;const W=innerWidth,H=innerHeight,floor=H-6;let P=null;const plats=()=>P||(P=petPlats());
 for(const q of PETS_RT.list){q.w=q.el.offsetWidth||56;const hw=Math.min(q.w/2,30);
  if(q.state==='drag'){}
  else if(q.state==='fall'||q.state==='jump'){q.vy+=GRAV*dt;const ny=q.y+q.vy*dt;q.x+=q.vx*dt;
   if(q.x<hw){q.x=hw;q.vx=Math.abs(q.vx)*.4}if(q.x>W-hw){q.x=W-hw;q.vx=-Math.abs(q.vx)*.4}
   let landed=null;if(q.vy>0)for(const pl of plats().list){if(q.y<=pl.top+2&&ny>=pl.top&&q.x>=pl.l&&q.x<=pl.r){landed=pl;break}}
   if(landed){q.y=landed.top;q.plat=landed.el;petLand(q,now)}else if(ny>=floor){q.y=floor;q.plat=null;petLand(q,now)}else q.y=ny;
  }else{
   let l=hw,r=W-hw,gone=false;
   if(q.state!=='climb'){
    if(q.plat){if(!q.plat.isConnected){const alt=plats().list.find(pl=>Math.abs(pl.top-q.y)<10&&q.x>=pl.l-8&&q.x<=pl.r+8);if(alt)q.plat=alt.el;else gone=true}
     if(!gone){const rc=q.plat.getBoundingClientRect();if(rc.top<plats().hb+20||rc.top>H-10||rc.width<40)gone=true;else{q.y=rc.top;l=rc.left+12;r=rc.right-12}}}
    else q.y=floor;
   }
   if(gone)petFall(q);
   else{
    if(q.state==='walk'){q.x+=q.dir*q.speed*dt;if(q.x<l||q.x>r){if(q.plat&&Math.random()<.5){q.vx=q.dir*70;q.vy=-140;petFall(q,true)}else{q.x=clamp(q.x,l,r);q.dir*=-1;if(!q.plat&&Math.random()<.3)petClimb(q,now)}}}
    else if(q.state==='climb'){q.x=q.dir<0?hw:W-hw;q.y-=36*dt;if(q.y<q.climbTo){q.vx=(q.dir<0?1:-1)*150;q.vy=-80;q.dir*=-1;petFall(q,true)}}
    if(q.state!=='fall'&&q.state!=='climb'&&now>q.until)petNext(q,now);
   }
  }
  q.el.style.transform=`translate(${(q.x-q.w/2).toFixed(1)}px,${(q.y-q.h).toFixed(1)}px)`;q.el.classList.toggle('flip',q.dir<0);
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
  const all=(reveals||[]).concat(CHEST_Q.splice(0));if(all.length&&PETS_RT.list.length)setTimeout(()=>petsCheer(rnd(['¡Bien hecho!','¡Eso es!','¡Premio!','¡Así se hace!'])),500);
  return _afterChange(all)};
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

/* ================= AVATAR · piezas de arte =================
   Figura de vinilo coleccionable propia de la liga: cabeza grande y redonda, brillo de juguete,
   cuerpo que cambia con el rango y cientos de piezas para vestirla. */
const INK='#27304a';
function starD(cx,cy,R,k){k=k||.45;let d='';for(let i=0;i<10;i++){const r=i%2?R*k:R;const an=-Math.PI/2+i*Math.PI/5;d+=(i?'L':'M')+(cx+r*Math.cos(an)).toFixed(2)+' '+(cy+r*Math.sin(an)).toFixed(2)}return d+'Z'}
const spark4=(x,y,r,c)=>`<path d="M${x} ${y-r}Q${x+r*.18} ${y-r*.18} ${x+r} ${y}Q${x+r*.18} ${y+r*.18} ${x} ${y+r}Q${x-r*.18} ${y+r*.18} ${x-r} ${y}Q${x-r*.18} ${y-r*.18} ${x} ${y-r}Z" fill="${c||'#fff6c8'}"/>`;

/* ---------- tatuajes ---------- */
function tattooArt(id,sx,y,AW){const w=AW/2-.5,c=INK;switch(id){
 case'band':return ln(`M${sx-w} ${y-1.3}h${2*w}M${sx-w} ${y+1}h${2*w}`,c,.9,.85);
 case'tribal':return ln(`M${sx-w} ${y+.8}l${w*.5} -2l${w*.5} 2l${w*.5} -2l${w*.5} 2`,c,1.1,.85)+ln(`M${sx-w*.5} ${y+2.6}l${w*.5} -1.1l${w*.5} 1.1`,c,.8,.85);
 case'waves':return ln(`M${sx-w} ${y-.6}q${w*.25} -1.2 ${w*.5} 0t${w*.5} 0t${w*.5} 0t${w*.5} 0M${sx-w} ${y+1.5}q${w*.25} -1.2 ${w*.5} 0t${w*.5} 0t${w*.5} 0t${w*.5} 0`,'#2a6fd1',.8,.9);
 case'bolt':return`<path d="M${sx+.7} ${y-2.8}l-1.9 3h1.4l-1 2.8 2.6-3.4h-1.4l1.1-2.4Z" fill="#f2c437" stroke="${c}" stroke-width=".35"/>`;
 case'anchor':return ln(`M${sx} ${y-2.2}v4.4M${sx-1.2} ${y-1.2}h2.4M${sx-1.8} ${y+1.2}q1.8 1.9 3.6 0`,c,.7,.9)+`<circle cx="${sx}" cy="${y-2.7}" r=".6" fill="none" stroke="${c}" stroke-width=".5"/>`;
 case'star':return`<path d="${starD(sx,y,2.3)}" fill="none" stroke="${c}" stroke-width=".7" stroke-linejoin="round" opacity=".9"/>`;
 case'rose':return`<circle cx="${sx}" cy="${y-.8}" r="1.5" fill="#d0312d" stroke="${c}" stroke-width=".4"/>`+ln(`M${sx-.6} ${y-1}q.6-.8 1.2 0`,'#8a1020',.4)+ln(`M${sx} ${y+.7}v2.2M${sx} ${y+1.5}l-1.2-.8M${sx} ${y+1.9}l1.2-.6`,'#2e8b57',.6);
 case'runes':return ln(`M${sx-1.8} ${y-1.7}v3.4l1-1.2M${sx} ${y-1.7}v3.4M${sx} ${y-.7}l1.1-1M${sx+1.8} ${y-1.7}l-.8 1.7.8 1.7`,c,.65,.9);
 case'dragon':return ln(`M${sx-w} ${y+2.4}q${w*.6}-3.2 ${w}-.4q${w*.5} 2.6 ${w}-3`,'#2e8b57',1.2,.95)+`<circle cx="${sx+w}" cy="${y-1.2}" r="1" fill="#2e8b57"/><circle cx="${sx+w+.3}" cy="${y-1.4}" r=".3" fill="#f2c437"/>`;
}return''}
function tattooChest(id,b){const c=INK;switch(id){
 case'sun':return`<g opacity=".88"><circle cx="34.6" cy="50.6" r="2.3" fill="none" stroke="${c}" stroke-width=".8"/>${[...Array(8)].map((_,k)=>{const an=k*Math.PI/4;return ln(`M${(34.6+3.3*Math.cos(an)).toFixed(1)} ${(50.6+3.3*Math.sin(an)).toFixed(1)}L${(34.6+4.6*Math.cos(an)).toFixed(1)} ${(50.6+4.6*Math.sin(an)).toFixed(1)}`,c,.7)}).join('')}</g>`;
 case'eagle':return`<path d="M33 51.4q-3.4-3.4-8-2.6q3 .6 4.2 2.2q-2.6-.2-3.8.8q3 .2 5 1.6q.8 1.4 2.6 1.4q1.8 0 2.6-1.4q2-1.4 5-1.6q-1.2-1-3.8-.8q1.2-1.6 4.2-2.2q-4.6-.8-8 2.6Z" fill="${c}" opacity=".85"/><circle cx="33" cy="50.2" r="1.1" fill="${c}" opacity=".85"/>`;
 case'compass':return`<g opacity=".88"><circle cx="34.2" cy="51" r="3.6" fill="none" stroke="${c}" stroke-width=".6"/><path d="M34.2 46.6l.9 3.5 3.5.9-3.5.9-.9 3.5-.9-3.5-3.5-.9 3.5-.9Z" fill="${c}"/><circle cx="34.2" cy="51" r=".5" fill="#d0312d"/></g>`;
 case'wings':return`<g opacity=".85" fill="${c}"><path d="M31.6 50.4q-2.6-3-6.6-2.2q2.4.8 3.2 2q-2 0-3 .9q2.6 0 4 1.2q1.6.6 2.4-1.9Z"/><path d="M36.4 50.4q2.6-3 6.6-2.2q-2.4.8-3.2 2q2 0 3 .9q-2.6 0-4 1.2q-1.6.6-2.4-1.9Z"/></g>`;
 case'tree':return`<g opacity=".88">${ln('M34.4 55.2v-4.6M34.4 52.4l-1.6-1.4M34.4 51.6l1.6-1.4',c,.8)}<circle cx="34.4" cy="48.8" r="2.8" fill="none" stroke="${c}" stroke-width=".7"/>${ln('M32.4 55.4h4',c,.6)}</g>`;
 case'phoenix':return`<path d="M33.6 52.6q-3.8-3.8-8.8-2.8q3.4.8 4.6 2.6q-2.8 0-4 1q3.2.2 5.4 1.8q1 1.6 2.8 1.6q1.8 0 2.8-1.6q2.2-1.6 5.4-1.8q-1.2-1-4-1q1.2-1.8 4.6-2.6q-5-1-8.8 2.8Z" fill="#e5532a" opacity=".9"/><path d="M33.6 47.6q1.4 1.6 0 3.6q-1.4-2 0-3.6Z" fill="#f2c437"/><path d="M32.2 55.6q1.4 2.6 1.4 3.6q.4-1.2 1.6-3.6" fill="none" stroke="#e5532a" stroke-width=".8" opacity=".9"/>`;
 case'dragon':return ln('M26.6 56q2-6 6.6-4.6q4.4 1.4 4.4-3.2q0-2.4 2.6-2.6',  '#2e8b57',1.6,.92)+ln('M26.6 56q2-6 6.6-4.6q4.4 1.4 4.4-3.2q0-2.4 2.6-2.6',INK,.4,.6)+`<circle cx="40.6" cy="45.6" r="1.4" fill="#2e8b57"/><circle cx="41" cy="45.3" r=".4" fill="#f2c437"/><path d="M28 54.4l-.9-1.4M30 52.6l-.4-1.6M35.6 51.6l.4-1.6" stroke="#2e8b57" stroke-width=".7"/>`;
}return''}

/* ---------- accesorios de la cara ---------- */
function faceAccArt(a,f){if(!f)return'';switch(f){
 case'round':return`<g fill="#fff" fill-opacity=".16" stroke="${OL}" stroke-width="1.05"><circle cx="29.4" cy="31.6" r="4.4"/><ellipse cx="40.8" cy="31.4" rx="3.9" ry="4.3"/></g>`+ln('M33.8 31q1.5-1.2 3.1-.2M25 30.6L16.4 29',OL,1)+ln('M26.6 29.6q1.4-1.6 3.4-1.4M38.6 29.4q1.2-1.4 3-1.2','#fff',.8,.7);
 case'sun':return`<path d="M24.4 28.8H34.2Q34.6 33.6 31.8 35Q28.6 36.2 26 34.6Q24 32.8 24.4 28.8Z" fill="#1d2030" stroke="${OL}" stroke-width="1"/><path d="M36.6 28.8H45.2Q45.4 33.2 43.2 34.6Q40.4 35.8 38.2 34.4Q36.4 32.6 36.6 28.8Z" fill="#1d2030" stroke="${OL}" stroke-width="1"/>`+ln('M23.6 28.8H45.8M24.4 29.6L16.4 28.6',OL,1.3)+ln('M26.2 30.6l2.4 2.6M38.4 30.4l2.2 2.4','#fff',.9,.55);
 case'aviator':return`<path d="M24.6 29.2Q29.6 27.8 33.8 29.4Q34.2 33.8 31 35.4Q27.4 36.4 25.6 33.6Q24.2 31.6 24.6 29.2Z" fill="#7a5634" fill-opacity=".85" stroke="${GOLD}" stroke-width="1"/><path d="M36.8 29.4Q41 27.8 45 29.2Q45.4 31.6 44.2 33.6Q42.4 36.2 39.4 35.2Q36.6 33.8 36.8 29.4Z" fill="#7a5634" fill-opacity=".85" stroke="${GOLD}" stroke-width="1"/>`+ln('M33.8 29.4Q35.4 28.4 36.8 29.4M33.8 30.8q1.5-.6 3 0M24.6 29.4L16.4 28.6',GOLD,.8)+ln('M26.4 30.2l2 2.2M38.6 30.2l1.8 2','#fff',.8,.5);
 case'patch':return`<path d="M24.6 30.4Q29.6 27 34 30.4Q33.6 35 29.4 35Q25 35 24.6 30.4Z" fill="#1a1a22" stroke="${OL}" stroke-width="1"/>`+ln('M15 25.4L44.6 23.4',OL,1.1)+ln('M26.6 30.4q2-1.4 4.4-.6','#fff',.6,.35);
 case'mask':return a.p('M19.4 29.6Q23.8 26.4 29.4 27.4Q33.4 28.2 35 30Q37 28 41 27.2Q46.4 26.6 49.4 29.4Q49 34.8 44 35.6Q39.6 36 36.6 33.2Q35 32.2 33.4 33.2Q30.4 36.2 25.6 35.6Q20.2 34.8 19.4 29.6Z'+ell(29.4,31.4,3.3,2.7)+ell(40.6,31.2,3,2.5),'#a3242c',{ev:1,sw:1,lx:.8,ly:-.6})+ln('M19.6 30L14.4 27.8M19.8 31.2L14.8 32',  '#a3242c',1.2);
 case'visor':return a.p('M21.4 28.4Q33 25.2 47.8 27Q48.6 31.8 45 33.6Q39 35 34.2 33Q31 34.6 26.4 34Q21.8 33.2 21.4 28.4Z','#3fb6ff',{sw:1,lx:.6,ly:-.6,hl:[40,29.4,5,1.1],ho:.6,extra:`<path d="M21.6 30.6Q33 28 47.8 29.6" stroke="#b583ff" stroke-width="1.2" fill="none" opacity=".55"/>`})+ln('M21.6 29L15.8 27.8',OL,1.2);
 case'paint':return ln('M25.6 36.6l6.2-.9M26.2 38.8l5.2-.7M38 36.4l5.2-.6M38.4 38.4l4.4-.5','#c0392b',1.3)+ln('M27 22.4q6-2.6 13-1',  '#1d2030',1.4,.8);
 case'scar':return ln('M43.8 33.6l3.2 4.6',  '#b0606a',1.1)+ln('M44.4 35.4l1.5-.9M45.6 37.2l1.5-.9','#b0606a',.6);
 case'glow':return`<g class="gle"><ellipse cx="29.4" cy="31.4" rx="5" ry="5.8" fill="#7fe3ff" opacity=".3"/><ellipse cx="40.6" cy="31.4" rx="4.6" ry="5.6" fill="#7fe3ff" opacity=".3"/><ellipse cx="29.4" cy="31.8" rx="2.3" ry="3.1" fill="#c6f6ff"/><ellipse cx="40.6" cy="31.8" rx="2.1" ry="2.9" fill="#c6f6ff"/><circle cx="30.2" cy="30.6" r=".9" fill="#fff"/><circle cx="41.3" cy="30.6" r=".8" fill="#fff"/></g>`;
}return''}

/* ---------- peinados nuevos ---------- */
const H_BUZZ='M14.8 29.6Q13.4 19.6 18.6 14.6Q24.4 10.2 32 10.4Q40.8 10.4 46.2 15Q50.4 19.2 49.8 25.6Q45.6 22.4 40.4 21.8Q34 21 27.6 21.6Q21.4 22.6 17.6 26.4Q16.2 28 16 29.8Z';
const GALAXY='#3b2c91';
const galaxyStars=()=>[[22,15,.9],[29,11.6,.7],[37,12.6,1],[44,16.6,.7],[27,18.4,.6],[41,20,.6],[18,21,.6]].map(([x,y,r])=>spark4(x,y,r*1.6,'#fff')).join('');
const _hairFront=hairFrontArt,_hairBack=hairBackArt,_beard=beardArt;
hairFrontArt=function(a,h){if(!h)return'';let[s,c]=h;if(s==='flame')c='#ff5a1a';else if(c==='galaxy')return hairFrontArt(a,[s,GALAXY])+galaxyStars();
 const shine=ln('M36.4 12.4q6 .6 9.8 4.6','#fff',1.6,.5)+`<circle cx="47.6" cy="19.4" r=".8" fill="#fff" opacity=".5"/>`;
 const fuzz=`<path d="${H_BUZZ}" fill="${c}" opacity=".42"/>`+[[20,16],[25,13],[31,12],[37,12.6],[43,15],[47,19.6],[18.6,21.6],[23,19],[29,17],[35,17],[41,18.4]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".45" fill="${shd(c,-.3)}" opacity=".6"/>`).join('');
 switch(s){
  case'bald':return`<ellipse cx="39.6" cy="15.6" rx="5.4" ry="2.4" fill="#fff" opacity=".38" transform="rotate(22 39.6 15.6)"/>`;
  case'buzz':return a.p(H_BUZZ,c,{lx:.8,ly:-.8,sw:.9,hl:[38,14,5,1.6],ho:.22})+[[21,17],[26,14.4],[32,13.6],[38,14.2],[44,17],[24,19.6],[30,18.4],[36,18.6],[42,20.4]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".45" fill="${shd(c,-.35)}" opacity=".7"/>`).join('');
  case'mohawk':return fuzz+a.p('M20.4 18.6Q19.4 10.6 23.2 4.4L25.8 9.6Q26.8 1.2 32 -2.8L33.6 5.4Q36.8-.8 42.2-2L41 6.2Q45 3.8 49.4 4.4Q45.8 8.4 46.4 13.2Q46.6 16.2 45.2 18.4Q33.6 12.8 20.4 18.6Z',c,{lx:1.2,ly:-1.2,sw:1.1})+ln('M36.6 4q4 1 6.4 4','#fff',1.2,.45);
  case'afro':{let o=a.p('M14.6 30Q12 18 18 12Q24 7.6 32 7.6Q41 7.6 46.6 12.4Q51.6 18 50.2 27Q46.6 22.4 40 22Q32 20.6 24.6 22Q18.8 23.4 16.6 30Z',c,{lx:1.2,ly:-1.2,sw:1.1});for(const[x,y]of[[19,22],[24,19.6],[30,18.6],[36,18.8],[42,19.8],[47,23.2],[22,14],[30,11.4],[39,12]])o+=`<circle cx="${x}" cy="${y}" r="2.1" fill="none" stroke="${shd(c,-.3)}" stroke-width=".7" opacity=".7"/>`;return o}
  case'undercut':return fuzz+a.p('M17.4 22.4Q15 12 23 7.4Q30 3.6 38.6 4.6Q47 6 50.6 12.6Q52.8 17.4 50.2 22Q47 17.6 41 17.4Q33.6 17.2 26.6 19.4Q21 21 17.4 22.4Z',c,{lx:1.4,ly:-1.2,sw:1.1})+ln('M24 12q8-5 18-3.4M27 16q7-3.4 16-2.6',shd(c,-.3),.8)+shine;
  case'slick':return a.p('M15.2 30.4Q12.8 19 18.8 12.6Q25 7.2 33.2 7.4Q42.4 7.8 47.8 13.4Q51.2 17.6 50.6 23.4Q46 19.4 38.6 19.2Q29.6 19.4 22.4 22.6Q18 25 16.6 30.4Z',c,{lx:1.4,ly:-1.2})+ln('M45 12.4q-8-3.6-19 .6M47.4 16.4q-9-3.8-21 1.2M48.6 20.2q-8-3-18 0',shd(c,-.32),.8)+ln('M33 9.6q8-.6 13 3.4','#fff',1.8,.55);
  case'spiky':return a.p('M15.2 31Q12 24 14 18L11.6 14.4L16.8 13.6L15.6 8L21 9.6L21.4 3.6L26.6 7.4L29 1.6L32.8 6.6L36.8 1.8L38.4 7.6L43.4 4.4L43 10.4L48.6 9.6L46.8 14.2L51.6 16.4L49.6 19.6Q51.6 23 50.6 27Q47 23.4 42 22.8L40.4 25.8L38 22L34.6 25.4L32.6 21.4L29 25L27 21.8L23.4 24.8L21.6 22.6L19.4 27.2L18 31.6Z',c,{lx:1.4,ly:-1.2})+shine;
  case'flame':return a.p('M15.6 30.6Q11.4 22 14.4 14.4Q13.8 8.4 18.6 4.4Q18.2 9.4 21.6 10.6Q21 2.6 27.6-2.8Q27.4 3.6 30.8 6Q32.4-1.6 39.4-4.6Q37.4 1.2 39.6 5.8Q43.4 2.6 48.6 3Q45.6 6 46.6 10.2Q50.6 9.6 53 6.6Q53.6 13.6 50.4 18.6Q51.6 23 50.4 27.4Q46.6 22.6 40.6 22.2Q32.4 20.8 25 22.6Q19.2 24 17.4 30.6Z',c,{lx:1.2,ly:-1.4,sw:1.1,extra:`<path class="flm" d="M20 19Q19 12 22.6 9Q23.4 13 25.6 14Q26 6 31.4 2.6Q31 8 34 10.4Q36.2 4.6 41.4 3Q40 7.6 42 11Q45.2 9 48.4 8.8Q47 13 48 17.4Q40 14.6 32 15.6Q24.6 16.4 20 19Z" fill="#ffd23a" opacity=".85" style="transform-origin:34px 18px"/>`});
 }return _hairFront(a,[s,c])};
hairBackArt=function(a,h){if(!h)return'';let[s,c]=h;if(c==='galaxy')c=GALAXY;
 if(s==='afro')return a.p(ell(31.6,18.8,24.4,21.6),c,{lx:1.6,ly:-1.4,hl:[40,6,7,3],ho:.15,extra:[[12,22],[16,9],[27,1.4],[40,2],[49,10],[53,23],[10,32],[22,12],[46,18],[34,-.4]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.6" fill="none" stroke="${shd(c,.35)}" stroke-width=".7" opacity=".55"/>`).join('')});
 return _hairBack(a,[s,c])};
beardArt=function(a,b){if(!b)return'';let[s,c]=b;if(c==='galaxy')c=GALAXY;
 if(s==='stubble')return`<path d="M16.4 32Q16.4 41.6 24.4 44.6Q32 47 40 44.6Q48 41.8 48.4 33Q45.4 37.8 41.4 38.8Q38.4 41.4 34 40.8Q28.6 41.2 24.4 38.6Q19.4 37 16.4 32Z" fill="${c}" opacity=".26"/>`+[[20,38],[23,41],[27,43],[31,44],[35,43.6],[39,42.6],[43,40.6],[46,37.6],[22,39.6],[41,41]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".4" fill="${c}" opacity=".55"/>`).join('');
 return _beard(a,[s,c])};

/* ---------- tocados nuevos ---------- */
const _gear=gearArt;
gearArt=function(a,g,L){if(!g)return'';const[t,c1,c2]=g;switch(t){
 case'sweat':return a.p('M14.8 23.2Q32 15.6 49.6 21.6L49.4 26.6Q32 21.2 15 28Z',c1,{sw:1,lx:.6,ly:-.6,extra:ln('M16 25.2Q32 18.8 49.4 24.2',c2||'#d0312d',1.2)});
 case'cap':return a.p('M15.4 22.4Q14.8 8.2 32 7.2Q48.6 8.2 48.8 21Q32 17.4 15.4 22.4Z',c1,{hl:[39,12,6,2.4],extra:ln('M32 7.6Q29.6 14 30.4 19.6M32 7.6Q38.4 12 40.4 18.8',shd(c1,-.3),.7)+`<circle cx="41.6" cy="13.6" r="2" fill="#fff" opacity=".9"/><path d="${starD(41.6,13.6,1.3)}" fill="${c1}"/>`})+a.p('M42.4 18.8Q53.6 16.4 60.6 20.2Q60 23.2 55 23.6Q48.6 23.8 44 22.4Z',c2,{sw:1.1,lx:.6,ly:-.6})+`<circle cx="32" cy="7.4" r="1.3" fill="${c2}" stroke="${OL}" stroke-width=".6"/>`;
 case'capback':return a.p('M21.6 19.6Q10.4 17.6 3.6 21.2Q4.6 24 9.6 24.2Q16.2 24.4 20.6 23Z',c2,{sw:1.1,lx:.6,ly:-.6})+a.p('M15.4 22.4Q14.8 8.2 32 7.2Q48.6 8.2 48.8 21Q32 17.4 15.4 22.4Z',c1,{hl:[39,12,6,2.4],extra:ln('M32 7.6Q29.6 14 30.4 19.6',shd(c1,-.3),.7)})+a.p('M38.2 20.4Q41 15.6 44 20.6Z',shd(c1,-.35),{sw:.8})+`<circle cx="32" cy="7.4" r="1.3" fill="${c2}" stroke="${OL}" stroke-width=".6"/>`;
 case'beanie':return a.p('M14.4 22.4Q13 6.4 32 4.6Q51 6.4 49.6 22.4Z',c1,{hl:[38,10,6,3],extra:[20,25,30,35,40,45].map(x=>ln(`M${x} 9Q${x-.6} 15 ${x-.4} 20`,shd(c1,-.2),.6)).join('')})+a.p(rr(13.2,18.2,37.6,6.2,3),c2||shd(c1,.2),{sw:1.1,extra:[16,19,22,25,28,31,34,37,40,43,46].map(x=>ln(`M${x} 19v5`,shd(c2||c1,-.2),.5)).join('')})+a.p(ell(31,3.4,3.4,3.2),c2||'#f4f4f4',{sw:1});
 case'bandana':return a.p('M13.6 24Q7 22.6 4.6 26.8Q9.2 26.2 13.4 26.4Z',c1,{sw:.9})+a.p('M13.8 25.6Q9.4 29.8 9.6 34.4Q12.6 30.2 15.2 27.4Z',c1,{sw:.9})+a.p('M14.6 21.8Q32 14 49.8 19.8L49.6 25.6Q32 20.4 14.8 27Z',c1,{lx:.8,ly:-.8,extra:[[20,22.4],[26,20],[32,19.2],[38,19.4],[44,20.8],[23,24.6],[35,22],[41,23]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".7" fill="#fff" opacity=".85"/>`).join('')})+a.p(ell(14.6,25,2.4,2.2),shd(c1,-.1),{sw:.9});
 case'beret':return a.p('M13.6 19.6Q11.6 9 27 6.2Q43.6 3.6 51.6 11.2Q54.6 15.6 49.6 18.4Q44 15.6 32 16.4Q20.4 17.2 13.6 19.6Z',c1,{hl:[38,8,6,2],ho:.2})+ln('M28 6.4l-1.2-2.6',OL,1.3);
 case'cowboy':return a.p('M19.6 17.6Q18.6 5.4 24.4 3.6Q28.4 3 32 6.2Q35.6 3 39.6 3.6Q45.4 5.4 44.4 17.6Z',c1,{hl:[38,8,3,3]})+a.p(rr(19.2,13.4,25.6,3.4,1),c2||'#3a2416',{sw:.9})+a.p('M2.6 15.6Q5.4 22.8 18 22.4Q32 20.2 46 22.4Q58.6 22.8 61.4 14.6Q57.4 18.6 48 18.2Q32 16 16 18.2Q6.6 18.6 2.6 15.6Z',c1,{sw:1.1,lx:.6,ly:-.8});
 case'huaso':return a.p('M1.6 19.4Q32 13.2 62.4 19.4Q62 22.4 56 22.8Q32 18.6 8 22.8Q2 22.4 1.6 19.4Z',c1,{sw:1.1,lx:.5,ly:-.6,hl:[46,18,9,1.2]})+a.p('M20.2 18.2L21 8.2Q32 5.6 43 8.2L43.8 18.2Q32 15.8 20.2 18.2Z',c1,{hl:[38,10,3,2.4]})+a.p('M20.6 14.4Q32 12 43.4 14.4L43.6 16.8Q32 14.4 20.4 16.8Z',c2||'#1d1d26',{sw:.8});
 case'tophat':return a.p(ell(32,18.4,19.4,3.4),c1,{sw:1.1})+a.p('M19.6 18V-8Q19.6-10.4 22-10.4H42Q44.4-10.4 44.4-8V18Q32 21 19.6 18Z',c1,{hl:[39,0,2.4,9],ho:.22})+a.p('M19.6 12.4Q32 15 44.4 12.4V16.6Q32 19.4 19.6 16.6Z',c2||'#a3242c',{sw:.9});
 case'horns':return a.p('M17.8 16.8Q9.4 14.6 7.6 4.6Q7.4 1.4 9.2-.8Q10.4 6.6 15.8 9.6Q18.8 11.2 21 12.8Z',c1,{sw:1.1,lx:.8,ly:-.6,extra:ln('M10 6.8l2.6-1M12 10l2.4-1.6M15 12.4l2-1.8',shd(c1,-.3),.6)})+a.p('M44.2 12.6Q50.4 9.8 52.4 3.4Q53.2.6 52.2-1.8Q56.6 2.6 55.8 9.6Q54.8 15.6 47.4 17.8Z',c1,{sw:1.1,lx:.8,ly:-.6,extra:ln('M53.6 6l-2.6-.6M52.4 10l-2.6-1M50 13.4l-2.4-1.4',shd(c1,-.3),.6)});
 case'halo':return`<g class="hl2"><ellipse cx="33" cy="1.6" rx="13" ry="3.8" fill="none" stroke="#ffe27a" stroke-width="5" opacity=".25"/><ellipse cx="33" cy="1.6" rx="12" ry="3.4" fill="none" stroke="${OL}" stroke-width="3.4"/><ellipse cx="33" cy="1.6" rx="12" ry="3.4" fill="none" stroke="#ffd23a" stroke-width="2"/><path d="M24 .2Q30-1.6 38-1" stroke="#fffbe0" stroke-width=".9" fill="none"/></g>`;
}return _gear(a,g,L)};

/* ---------- ropa nueva ---------- */
const _armor=armorArt;
armorArt=function(a,L,b){const ar=L.ar||[];const t=ar[0],c=ar[1]||L.tu,c2=ar[2]||GOLD,c3=ar[3];const sk=L.sk||'#f0c8a0';
 const plate=`M${23.6-b} 45.2H${40.4+b}Q${42+b} 45.2 ${42+b} 47L${42.8+b} 60.6H${21.2-b}L${22-b} 47Q${22-b} 45.2 ${23.6-b} 45.2Z`;
 const neck=col=>ln('M27.2 44.2Q32 48.2 36.8 44.2',col||shd(c,-.35),1.1);
 const print=(k,col)=>{switch(k){
  case'bolt':return`<path d="M35 49L31 55.4H34L31.4 61.4L38 53.4H34.8L37.6 49Z" fill="${col}" stroke="${OL}" stroke-width=".7" stroke-linejoin="round"/>`;
  case'star':return`<path d="${starD(33.4,54.4,4.4)}" fill="${col}" stroke="${OL}" stroke-width=".7" stroke-linejoin="round"/>`;
  case'crown':return`<path d="M28.6 57.6H38.6L39.4 51L36.4 53.4L33.6 49L30.8 53.4L27.8 51Z" fill="${col}" stroke="${OL}" stroke-width=".7" stroke-linejoin="round"/>`;
 }return''};
 switch(t){
  case'tee':return neck()+(c2&&ar[3]?print(c2,ar[3]):'');
  case'tank2':return a.p(`M26.2 43.6Q32 51.6 37.8 43.6Z`,sk,{sw:1,lx:.4,ly:-.4})+ln(`M${24.4-b} 44.4L26.4 44M${39.6+b} 44.4L37.6 44`,shd(c,-.3),.8);
  case'tunic':return a.p(`M${20.6-b} 60H${43.4+b}L${44.8+b} 69.4Q32 71.6 ${19.2-b} 69.4Z`,c,{sw:1.1,extra:ln('M26 61l-1.2 8M38 61l1.2 8',shd(c,-.2),.6)})+ln('M28.6 44L32 49.6L35.4 44',shd(c,-.35),1)+ln(`M${20.8-b} 59.4H${43.2+b}`,c2,1.6);
  case'hoodie':return a.p('M21 47Q18.6 41.4 24 41.2H40Q45.4 41.4 43 47Q32 51.4 21 47Z',shd(c,-.08),{sw:1.1})+a.p(`M25.2 56.4H38.8L40.2 62.8H23.8Z`,shd(c,-.05),{sw:.9})+ln('M29.6 47.6v5.4M34.4 47.6v5.4','#f4f4f4',.9)+ln(`M${21-b} 64.6H${43+b}`,shd(c,-.25),1.2);
  case'hawaiian':return[[25,49],[37,48],[29,56],[39,58],[24,61],[33,62],[31,51]].map(([x,y],i)=>`<g transform="translate(${x} ${y})">${[0,1,2,3,4].map(k=>`<circle cx="${(1.3*Math.cos(k*1.2566)).toFixed(2)}" cy="${(1.3*Math.sin(k*1.2566)).toFixed(2)}" r="1.05" fill="${i%2?c2:'#ff7fb3'}"/>`).join('')}<circle r=".6" fill="#ffd23a"/></g>`).join('')+a.p('M28.2 43.8L32 49.6L35.8 43.8Z',sk,{sw:.9})+a.p('M25.4 43.8L32 50.2L29.8 52L24.4 45.4Z',shd(c,.12),{sw:.9})+a.p('M38.6 43.8L32 50.2L34.2 52L39.6 45.4Z',shd(c,.12),{sw:.9})+[54,58,62].map(y=>`<circle cx="32.6" cy="${y}" r=".7" fill="#f4f4f4" stroke="${OL}" stroke-width=".3"/>`).join('');
  case'gi':return a.p('M24.4 44L38.6 58.6L41.2 56.4L28.4 44Z',shd(c,-.1),{sw:1})+a.p(rr(20.6-b,56.2,22.8+2*b,3.6,1.2),c2,{sw:1})+ln('M30.2 59.4l-1.6 5.2M33.6 59.4l1.6 5.2',c2,1.6)+ln('M30.2 59.4l-1.6 5.2M33.6 59.4l1.6 5.2',OL,.35,.6);
  case'jacket':return a.p(rr(25.4,42.4,13.2,3.4,1.6),c,{sw:1})+ln('M32 45.4V66.4','#cfd5dc',1)+ln(`M${21.2-b} 46V65M${42.8+b} 46V65`,c2,1.6)+`<rect x="31.1" y="47" width="1.8" height="2.6" rx=".6" fill="#cfd5dc" stroke="${OL}" stroke-width=".4"/>`;
  case'jersey':return ln('M27.4 44.2L32 49.6L36.6 44.2',c2,1.8)+ln(`M${21.4-b} 46V65M${42.6+b} 46V65`,c2,1.4)+`<text x="33.4" y="60.2" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-size="9.2" font-weight="900" text-anchor="middle" fill="${c2}" stroke="${OL}" stroke-width=".5" paint-order="stroke">10</text>`;
  case'ljacket':return a.p('M28.4 43.8H35.6V66.6H28.4Z','#f4f4f4',{sw:.9})+a.p('M26.2 43.8L28.8 43.8L30.6 52.4L27.2 50.6Z',shd(c,.18),{sw:.9})+a.p('M37.8 43.8L35.2 43.8L33.4 52.4L36.8 50.6Z',shd(c,.18),{sw:.9})+ln('M28.4 52v14.4M35.6 52v14.4',shd(c,.3),.8)+ln(`M${23-b} 49q1 6 .4 12`,'#fff',1,.35)+[56,60].map(y=>`<circle cx="26.2" cy="${y}" r=".6" fill="#cfd5dc"/>`).join('');
  case'varsity':return a.p(rr(25.4,42.4,13.2,3.4,1.6),c2,{sw:1})+ln(`M${20.8-b} 63.6H${43.2+b}M${20.6-b} 65.4H${43.4+b}`,c2,1)+[48,52,56,60].map(y=>`<circle cx="32" cy="${y}" r=".75" fill="#f4f4f4" stroke="${OL}" stroke-width=".35"/>`).join('')+a.p(rr(34.4,47.6,6,6.8,1.2),'#f4f4f4',{sw:.8})+`<text x="37.4" y="53.4" font-family="Georgia,serif" font-size="6" font-weight="900" text-anchor="middle" fill="${c2}">L</text>`;
  case'suit':return a.p('M27.6 43.8H36.4L32 54.4Z','#f4f4f4',{sw:.9})+a.p('M31.2 45.2H32.8L33.8 52.6L32 55L30.2 52.6Z',c2,{sw:.7})+ln('M27.6 43.8L30.4 52.4L32 56M36.4 43.8L33.6 52.4L32 56',shd(c,.3),.9)+[58.4,62].map(y=>`<circle cx="32.6" cy="${y}" r=".75" fill="${shd(c,.4)}"/>`).join('')+a.p('M37.6 48.6h3.2l-.4 1.8h-2.4Z','#f4f4f4',{sw:.5});
  case'pharaoh':return a.p(plate,c,{extra:`<rect x="20" y="55.6" width="24" height="2.2" fill="${c2}"/>`})+a.p('M21.4 44.6Q32 56 42.6 44.6L40.4 43.8Q32 51 23.6 43.8Z',GOLD,{sw:1,extra:ln('M23.6 45.6Q32 52.6 40.4 45.6','#2a7bd5',1.1)+ln('M22.6 45Q32 54.4 41.4 45','#c0392b',.6)});
  case'stars':return[[25,48],[30,52],[37,49],[34,58],[26,60],[40,62],[29,63.4],[38,54]].map(([x,y],i)=>spark4(x,y,i%3?1:1.6,c2)).join('')+ln(`M${20.6-b} 64.8H${43.4+b}`,c2,1.4)+neck(c2);
  case'harness':return _armor(a,Object.assign({},L,{ar:['bare']}),b)+a.p('M23.6 44L26.4 44L41.8 60.2L39 61.6Z',c,{sw:.9})+a.p('M40.4 44L37.6 44L22.2 60.2L25 61.6Z',shd(c,-.06),{sw:.9})+`<circle cx="32" cy="52" r="2" fill="${STEEL}" stroke="${OL}" stroke-width=".7"/>`+a.p(rr(20.6-b,57.6,22.8+2*b,3,1),c,{sw:.9});
  case'scale':return a.p(plate,c,{hl:[37,49,4,3],extra:[46.8,49.6,52.4,55.2,58].map((y,r)=>[...Array(8)].map((_,k)=>`<path d="M${(21.4+k*3+(r%2)*1.5).toFixed(1)} ${y}q1.5 2.4 3 0" fill="none" stroke="${shd(c,-.35)}" stroke-width=".55"/>`).join('')).join('')})+ln(`M${21.2-b} 60.4H${42.8+b}`,c2,1.2);
 }return _armor(a,L,b)};
const _skirt=skirtArt;
skirtArt=function(a,L,b){if(!L.skirt)return'';const[t,c,c2]=L.skirt;switch(t){
 case'leaf':return a.p('M32 60.2Q29.6 59 27.6 60.4Q25.2 59.8 24.6 62Q22.8 63.4 24.4 65.4Q23.8 67.6 26.4 68Q27.4 70.4 29.8 69.6Q31 71.6 32 72.4Q33 71.6 34.2 69.6Q36.6 70.4 37.6 68Q40.2 67.6 39.6 65.4Q41.2 63.4 39.4 62Q38.8 59.8 36.4 60.4Q34.4 59 32 60.2Z',c,{sw:1.05,lx:.8,ly:-.7,hl:[35,63,2.6,1.4],ho:.3})+ln('M32 61.2v10.2M32 64.2l-4.4-2M32 64.2l4.4-2M32 67.2l-4.4.4M32 67.2l4.4.4',shd(c,-.35),.7)+ln('M32 60.2q.6-1.8 2-2.2',shd(c,-.4),1);
 case'hips':return a.p(`M${20.8-b} 58H${43.2+b}L${43.8+b} 66.2Q32 67.8 ${20.2-b} 66.2Z`,c,{sw:1.1,extra:ln(`M${20.8-b} 59.8H${43.2+b}`,shd(c,-.3),.9)+(c2?ln(`M${21.4-b} 60.6V66M${42.6+b} 60.6V66`,c2,1.3):'')+ln('M32 60v6.2',shd(c,-.25),.6)});
 case'loin':return a.p(`M${21-b} 58.4H${43+b}L${42.4+b} 65.6L39.8 69.6L37.2 66.6L34.6 70.8L32 67.4L29.4 70.8L26.8 66.6L24.2 69.6L${21.6-b} 65.6Z`,c,{sw:1.1,extra:[[25,61],[30,63],[36,61],[40,64],[33,66]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="1.3" ry=".8" fill="${shd(c,-.35)}" opacity=".7"/>`).join('')})+ln(`M${20.8-b} 59.4H${43.2+b}`,'#5a3a22',1.4);
 case'tartan':return a.p(`M${20.6-b} 59.4H${43.4+b}L${45.6+b} 70.6Q32 72.8 ${18.4-b} 70.6Z`,c,{sw:1.1,extra:[22,27,32,37,42].map(x=>ln(`M${x} 59v13`,c2,1,.75)).join('')+[62.4,66.4,70].map(y=>ln(`M16 ${y}H48`,c2,1,.75)).join('')+[24.5,34.5].map(x=>ln(`M${x} 59v13`,'#f4f4f4',.4,.6)).join('')})+ln(`M${20.6-b} 60.6H${43.4+b}`,'#3a2416',1.4);
}return _skirt(a,L,b)};

/* ---------- objetos nuevos ---------- */
const _item=itemArt;
itemArt=function(k){switch(k){
 case'bottle':return`<rect x="-1.9" y="-6.4" width="3.8" height="9.6" rx="1.4" fill="#7ec8ff" fill-opacity=".85"/><rect x="-1.9" y="-3" width="3.8" height="2.4" fill="#2a6fd1"/><rect x="-1.2" y="-8.2" width="2.4" height="2" rx=".5" fill="#2b2b33"/><path d="M-1 -5.6v6" stroke="#fff" stroke-width=".5" opacity=".7"/>`;
 case'shake':return`<rect x="-2.2" y="-7" width="4.4" height="9.2" rx="1" fill="#f4f4f4" fill-opacity=".9"/><rect x="-2.2" y="-3.4" width="4.4" height="5.6" rx=".8" fill="#9a6a45"/><rect x="-2.4" y="-8.6" width="4.8" height="1.8" rx=".5" fill="#2b2b33"/><rect x="-.5" y="-10" width="1" height="1.6" fill="#2b2b33"/>`;
 case'kettlebell':return`<path d="M-2.4 2V-1.2Q-2.4-3 0-3Q2.4-3 2.4-1.2V2" fill="none" stroke="#2b2f3a" stroke-width="1.3"/><circle cy="5" r="3.9" fill="#2b2f3a"/><ellipse cx="-1.2" cy="3.8" rx="1.2" ry=".8" fill="#fff" opacity=".25"/>`;
 case'plate':return`<circle r="4.6" fill="#2b2f3a"/><circle r="3.4" fill="none" stroke="#4a5060" stroke-width=".6"/><circle r="1" fill="#9aa3ad"/>`;
 case'chileflag':return`<rect x="-.4" y="-22" width=".8" height="26" fill="#7a5230"/><circle cx="0" cy="-22.4" r=".8" fill="${GOLD}"/><path d="M.4-21.4H11V-15H.4Z" fill="#f4f4f4"/><path d="M.4-18.2H11V-15H.4Z" fill="#d52b1e"/><path d="M.4-21.4H4V-18.2H.4Z" fill="#0039a6"/><path d="${starD(2.2,-19.8,1.1)}" fill="#fff"/>`;
 case'torch':return`<path d="M-.9 6L-1.4-6H1.4L.9 6Z" fill="${WOOD}"/><rect x="-1.8" y="-7.2" width="3.6" height="1.8" rx=".5" fill="#5a4a3a"/><path class="flm" d="M0-16Q-3.6-11.6-2.6-8.6Q-1.8-6.6 0-6.8Q1.8-6.6 2.6-8.6Q3.6-11.6 0-16Z" fill="#ff8a2a" style="transform-origin:0px -7px"/><path class="flm" d="M0-12.6Q-1.6-10-1-8.4Q0-7.4 1-8.4Q1.6-10 0-12.6Z" fill="#ffe27a" style="transform-origin:0px -7px"/>`;
 case'trophy':return`<path d="M-3.6-10H3.6Q3.6-5 0-4.2Q-3.6-5-3.6-10Z" fill="${GOLD}"/><path d="M-3.4-9.2Q-5.6-9.2-5.2-7.2Q-4.8-5.6-2.6-5.8M3.4-9.2Q5.6-9.2 5.2-7.2Q4.8-5.6 2.6-5.8" fill="none" stroke="${GOLD}" stroke-width=".8"/><rect x="-.6" y="-4.4" width="1.2" height="2.6" fill="${GOLD}"/><rect x="-2.6" y="-2" width="5.2" height="2" rx=".4" fill="#7a4a08"/><path d="M-2-9.2q1 3 2.6 3.8" stroke="#fff6c8" stroke-width=".6" fill="none"/>`;
}return _item(k)};
const _acc=accArt;
accArt=function(a,L){let s=_acc(a,L);const acc=L.acc||[];
 if(acc.includes('towel'))s+=a.p('M22.6 44.6Q32 48 41.4 44.6L41 47Q38 52 37.6 58L34.6 58.4Q34.4 51 37.6 47.4Q32 50 26.4 47.4Q29.6 51 29.4 58.4L26.4 58Q26 52 23 47Z','#f4f4f4',{sw:1,extra:ln('M26.6 56.4h2.8M34.8 56.6h2.8','#2a6fd1',1)});
 if(acc.includes('whistle'))s+=ln('M24.4 44.6Q32 52 39.6 44.6','#d0312d',.8)+a.p('M32 50.4h3.4a1.6 1.6 0 0 1 0 3.2H32Z',STEEL,{sw:.6})+`<circle cx="34.6" cy="52" r=".5" fill="${OL}"/>`;
 if(acc.includes('scarf'))s+=a.p(rr(21.6,42.4,20.8,4.8,2.3),'#d0312d',{sw:1,extra:ln('M24 44.8h16','#f4f4f4',1.1)})+a.p('M35.4 45.6H39.4L40.6 56L36.6 56.4Z','#d0312d',{sw:1,extra:ln('M36 50.6l4.2-.4','#f4f4f4',1.1)})+ln('M37 56.6v1.6M38.6 56.4v1.6M40 56.2v1.6','#d0312d',.6);
 if(acc.includes('chain'))s+=[...Array(9)].map((_,k)=>{const t=k/8;const[x,y]=qpt([24.4,44.6],[32,52.6],[39.6,44.6],t);return`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="1" ry=".7" fill="none" stroke="${GOLD}" stroke-width=".7"/>`}).join('')+`<circle cx="32" cy="49.8" r="1.4" fill="${GOLD}" stroke="${OL}" stroke-width=".5"/>`;
 if(acc.includes('fang'))s+=ln('M24.4 44.6Q32 50.6 39.6 44.6','#5a3a22',.8)+`<path d="M31 48.2Q32 52.6 33.4 54.2Q34.4 50 33 48Z" fill="#f4efe2" stroke="${OL}" stroke-width=".6"/>`;
 if(acc.includes('medal'))s+=`<path d="M27.6 44L31 51.6H33L36.4 44H34L32 49L30 44Z" fill="#2a4bd0" stroke="${OL}" stroke-width=".5"/><path d="M30 44L32 49L34 44Z" fill="#d0312d"/>`+a.p(ell(32,53.4,2.9,2.9),GOLD,{sw:.8,hl:[31,52.4,1,.7],ho:.6})+`<path d="${starD(32,53.4,1.5)}" fill="#7a4a08"/>`;
 return s};

/* ---------- mascotas ---------- */
function animalArt(a,id){const P=AV_ANIMALS[id];if(!P)return'';return`<g class="apet">${P(a)}</g>`}
const aEye=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r||1.15}" fill="${OL}"/><circle cx="${x+.35}" cy="${y-.4}" r="${(r||1.15)*.38}" fill="#fff"/>`;
const aLeg=(a,x,cls,c,h)=>`<g class="${cls}" style="transform-origin:${x+1.45}px 73.4px">${a.p(rr(x,72.6,2.9,h||8.8,1.4),c,{sw:.9,lx:.6,ly:-.5})}</g>`;
function quad(a,o){const c=o.c,lc=o.legC||c,dk=shd(lc,-.14);const by=o.by||71.6,hx=o.hx||-5.2,hy=o.hy||65;
 let s=`<ellipse class="shadow" cx="-14" cy="81.8" rx="10.4" ry="1.8"/>`;
 s+=aLeg(a,-21.6,'pl2',dk,o.lh)+aLeg(a,-10.6,'pl1',dk,o.lh);
 s+=`<g class="ptl" style="transform-origin:-21.4px ${by-1.6}px">${o.tail||''}</g>`;
 s+=a.p(ell(-14.6,by,o.bw||8.8,o.bh||6),c,{hl:[-12,by-3.4,4,1.4],ho:.3,extra:(o.belly?`<ellipse cx="-12.6" cy="${by+4}" rx="6" ry="2.6" fill="${o.belly}"/>`:'')+(o.bodyX||'')});
 s+=aLeg(a,-18.8,'pl1',lc,o.lh)+aLeg(a,-8.2,'pl2',lc,o.lh);
 s+=(o.earsB||'')+a.p(ell(hx,hy,o.hw||6,o.hh||5.6),o.hc||c,{hl:[hx+1.6,hy-3,2.4,1.2],ho:.3,extra:o.faceX||''})+(o.ears||'');
 s+=(o.snout||'')+aEye(hx-1.6,hy-.6,o.er)+aEye(hx+2.6,hy-.8,(o.er||1.15)*.9)+`<ellipse cx="${hx-3}" cy="${hy+2}" rx="1.4" ry=".8" fill="#ff7f8f" opacity=".5"/>`;
 return s}
const dogSnout=(hx,hy,c,n)=>`<ellipse cx="${hx+4.6}" cy="${hy+1.8}" rx="3.2" ry="2.4" fill="${c}" stroke="${OL}" stroke-width=".8"/><ellipse cx="${hx+7}" cy="${hy+.9}" rx="1.2" ry=".95" fill="${n||OL}"/>`+ln(`M${hx+5.6} ${hy+3}q-.8.8-1.8.4`,OL,.6);
const AV_ANIMALS={
 perro:a=>quad(a,{c:'#c98a4b',belly:'#f3e3cc',tail:a.p('M-21 69.6Q-26.4 66-26 61.4Q-23.6 65-20 67.4Z','#c98a4b',{sw:.9}),earsB:'',ears:a.p('M-10.8 61.4Q-13.4 63.6-12.4 68.6Q-9.6 67.4-8.6 62.6Z',shd('#c98a4b',-.2),{sw:.9})+a.p('M-2.6 60.6Q.4 61.6.2 66.2Q-2.6 65.4-3.6 61.6Z',shd('#c98a4b',-.2),{sw:.9}),snout:dogSnout(-5.2,65,'#f3e3cc')}),
 gato:a=>quad(a,{c:'#f0a14a',belly:'#fff1dd',bw:8,bh:5.4,tail:ln('M-21.6 70Q-27.6 66-25.6 59.6Q-24.6 57.4-23 58.4','#2b1e35',2.8)+ln('M-21.6 70Q-27.6 66-25.6 59.6Q-24.6 57.4-23 58.4','#f0a14a',1.6),bodyX:ln('M-17 66.6v3M-14 66v3.2M-11 66.6v3',shd('#f0a14a',-.25),.9),ears:a.p('M-10 61.8L-9.4 56.4L-6.2 60.4Z','#f0a14a',{sw:.9})+a.p('M-3.6 60L-.8 56.2L-.6 61.4Z','#f0a14a',{sw:.9}),snout:`<path d="M-.6 66.2l1.2-.8 1.2.8-1.2.9Z" fill="#ff7f8f"/>`+ln('M1.8 66.6l3.4-.6M1.8 67.6l3.4.4',OL,.4),faceX:ln('M-7 60.6v1.8M-5 60.2v1.8',shd('#f0a14a',-.25),.7)}),
 conejo:a=>quad(a,{c:'#f4f1ec',belly:'#fff',bw:7.6,bh:6,tail:a.p(ell(-22.6,70.4,2.6,2.4),'#fff',{sw:.9}),ears:a.p('M-8.6 61Q-11.6 52.6-9.4 50.4Q-6.8 52.6-6.6 60.6Z','#f4f1ec',{sw:.9,extra:'<path d="M-8.6 59Q-10.2 53.4-9.2 52.4Q-7.8 54-7.6 59Z" fill="#ffb3c1"/>'})+a.p('M-4.6 60.4Q-4.2 51.6-1.6 50.6Q.2 53.6-2.6 61Z','#f4f1ec',{sw:.9,extra:'<path d="M-4 59Q-3.6 53.4-2.2 52.6Q-1.4 54.6-2.8 59.4Z" fill="#ffb3c1"/>'}),snout:`<path d="M-.4 66l1-.7 1 .7-1 .8Z" fill="#ff7f8f"/>`,lh:7.6}),
 cerdito:a=>quad(a,{c:'#f6b6c1',bw:9.4,bh:6.6,tail:ln('M-22.6 69q-3-1-2.4-3t2.2-.4-1 2.2',shd('#f6b6c1',-.3),1.1),ears:a.p('M-9.6 61L-10.4 57.4L-6.8 59.6Z',shd('#f6b6c1',-.1),{sw:.9})+a.p('M-3 60.2L-.6 57.4L-.4 61.2Z',shd('#f6b6c1',-.1),{sw:.9}),snout:`<ellipse cx="0.6" cy="66.8" rx="2.4" ry="2" fill="#ff9aaa" stroke="${OL}" stroke-width=".8"/><circle cx="-.2" cy="66.8" r=".45" fill="${OL}"/><circle cx="1.4" cy="66.8" r=".45" fill="${OL}"/>`,lh:7.4}),
 zorro:a=>quad(a,{c:'#e8742a',belly:'#fff4e6',legC:'#3a2a22',tail:a.p('M-21 69.4Q-29.4 68-28.4 60Q-26 64.4-20.6 66.6Z','#e8742a',{sw:.9,extra:'<path d="M-28.4 60Q-29 63.6-27 65.4L-25.6 62.4Z" fill="#fff4e6"/>'}),ears:a.p('M-10.4 61.4L-9.8 55.6L-6.4 60Z','#e8742a',{sw:.9,extra:'<path d="M-9.4 59.6L-9.2 57.2L-7.6 59.4Z" fill="#3a2a22"/>'})+a.p('M-3.6 59.8L-.4 55L0 61Z','#e8742a',{sw:.9}),snout:dogSnout(-5.2,65,'#fff4e6'),faceX:'<path d="M-2 66.6Q-1 69.6 2.6 68.6L.4 66Z" fill="#fff4e6"/>'}),
 lobo:a=>quad(a,{c:'#8a94a3',belly:'#e6e9ee',tail:a.p('M-21 69.4Q-29 69.2-28.2 62Q-25.8 65.6-20.6 66.6Z','#8a94a3',{sw:.9}),ears:a.p('M-10.6 61.4L-10 55.4L-6.4 59.8Z','#8a94a3',{sw:.9})+a.p('M-3.6 59.8L-.6 54.8L-.2 61Z','#8a94a3',{sw:.9}),snout:dogSnout(-5.2,65,'#e6e9ee'),faceX:'<path d="M-9 66Q-6 70.2-1 69L-4 65.4Z" fill="#e6e9ee"/>',bw:9.4}),
 panda:a=>quad(a,{c:'#f6f6f6',legC:'#1f1d26',bw:9.2,bh:6.6,tail:a.p(ell(-23.4,69.6,1.8,1.6),'#f6f6f6',{sw:.8}),bodyX:`<path d="M-19 66.4Q-15 65.4-11.6 67.2V72Q-15 70.6-19 71.6Z" fill="#1f1d26"/>`,earsB:a.p(ell(-9.6,60.4,2.4,2.2),'#1f1d26',{sw:.8})+a.p(ell(-1.4,59.6,2.2,2),'#1f1d26',{sw:.8}),faceX:'<ellipse cx="-6.8" cy="64.6" rx="2.2" ry="2.6" fill="#1f1d26" transform="rotate(-20 -6.8 64.6)"/><ellipse cx="-2.6" cy="64.4" rx="2" ry="2.4" fill="#1f1d26" transform="rotate(20 -2.6 64.4)"/>',snout:`<ellipse cx="0" cy="67.2" rx="1.1" ry=".8" fill="${OL}"/>`,lh:7.6}),
 capibara:a=>quad(a,{c:'#9b6b43',bw:10,bh:6.6,by:72,hw:6.6,hh:5,hx:-3.6,hy:66,tail:'',ears:a.p(ell(-8.2,61.6,1.6,1.4),shd('#9b6b43',-.2),{sw:.8}),snout:`<path d="M-.8 63.4Q4.6 63.4 4.8 66.6Q4.6 70 -.8 70Z" fill="${shd('#9b6b43',-.12)}" stroke="${OL}" stroke-width=".8"/><ellipse cx="3.6" cy="65.6" rx=".6" ry=".5" fill="${OL}"/>`,lh:7}),
 tortuga:a=>`<ellipse class="shadow" cx="-14" cy="81.8" rx="11" ry="1.8"/>`+aLeg(a,-21,'pl2',shd('#7fb069',-.1),5)+aLeg(a,-9,'pl1',shd('#7fb069',-.1),5)+`<g class="ptl" style="transform-origin:-5px 74px">${a.p(ell(-1.4,72.6,3.6,3),'#7fb069',{sw:.9,hl:[-.4,71.4,1.4,.8]})}${aEye(-.6,72,.9)}${ln('M1.2 73.8q-.8.6-1.8.2',OL,.5)}</g>`+a.p('M-25 77Q-25 64.6-14 64.2Q-3 64.6-3.4 77Z','#3f8f5a',{hl:[-11,67,4,1.6],ho:.3,extra:ln('M-19 77l2-6.4h6l2 6.4M-17 70.6l3-5.6 3 5.6M-23.4 72.6h4.4M-8.8 72.6h4.4',shd('#3f8f5a',-.3),.7)})+a.p(rr(-25.6,76,22.6,2.6,1.2),'#c9b26a',{sw:.8})+aLeg(a,-19,'pl1','#7fb069',5)+aLeg(a,-7,'pl2','#7fb069',5),
 pollito:a=>`<ellipse class="shadow" cx="-12" cy="81.8" rx="7" ry="1.6"/>`+`<g class="pl1" style="transform-origin:-14px 78px">${ln('M-14 78v3.4M-15.4 81.4h2.8','#f29d2a',.9)}</g><g class="pl2" style="transform-origin:-10px 78px">${ln('M-10 78v3.4M-11.4 81.4h2.8','#f29d2a',.9)}</g>`+a.p(ell(-12,72.6,6.8,6.4),'#ffd84a',{hl:[-10,69,3,1.6],ho:.4})+`<g class="ptl" style="transform-origin:-15px 72px">${a.p('M-15.6 71Q-19.4 72.4-17.6 76Q-14.6 75.6-14 73Z',shd('#ffd84a',-.1),{sw:.8})}</g>`+`<path d="M-5.6 71.2l3.4 1-3.4 1.2Z" fill="#f29d2a" stroke="${OL}" stroke-width=".6"/>`+aEye(-9,70.4,1)+aEye(-6.6,70.2,.9)+ln('M-12.6 66.4q.6-2.2 2-2.4M-11.6 66.4q1.4-1.4 2.8-1',  '#ffd84a',1)+`<ellipse cx="-9.6" cy="73.2" rx="1.2" ry=".7" fill="#ff7f8f" opacity=".5"/>`,
 pinguino:a=>`<ellipse class="shadow" cx="-12" cy="81.8" rx="7.4" ry="1.6"/>`+`<g class="pl1" style="transform-origin:-14px 79px">${a.p('M-16.4 79.6h4.4l.4 1.8h-5.2Z','#f29d2a',{sw:.6})}</g><g class="pl2" style="transform-origin:-9px 79px">${a.p('M-11 79.6h4.4l.4 1.8h-5.2Z','#f29d2a',{sw:.6})}</g>`+a.p(ell(-12,70.6,6.6,9.2),'#232a3a',{hl:[-10,64,2.6,1.6],ho:.3,extra:'<ellipse cx="-10.4" cy="72.6" rx="4.4" ry="7" fill="#f6f6f6"/>'})+`<g class="ptl" style="transform-origin:-17px 68px">${a.p('M-17.4 67Q-21.8 71.6-19.6 76.6Q-16.6 73.6-16.4 69Z','#232a3a',{sw:.8})}</g>`+`<path d="M-5.6 66.2l3.2 1-3.2 1.2Z" fill="#f29d2a" stroke="${OL}" stroke-width=".6"/>`+aEye(-9.4,65.4,1)+aEye(-7,65.2,.9)+`<ellipse cx="-9.4" cy="68.4" rx="1.2" ry=".7" fill="#ff7f8f" opacity=".5"/>`,
 buho:a=>`<ellipse class="shadow" cx="-12" cy="81.8" rx="7.4" ry="1.6"/>`+ln('M-14.6 79v2.4M-9.6 79v2.4','#f29d2a',1.2)+a.p('M-19.6 66.6L-18.4 61.6L-15 64.6Z','#8a5a34',{sw:.8})+a.p('M-4.4 66.6L-5.6 61.6L-9 64.6Z','#8a5a34',{sw:.8})+a.p(ell(-12,71.4,7.4,8.8),'#8a5a34',{hl:[-10,66,3,1.6],ho:.3,extra:'<ellipse cx="-12" cy="75" rx="4.6" ry="4.6" fill="#e9d4b0"/>'+ln('M-14 73.4l1 .8 1-.8 1 .8M-14.4 76l1 .8 1-.8 1 .8 1-.8',shd('#e9d4b0',-.3),.5)})+`<circle cx="-14.8" cy="68" r="3" fill="#f4ecd8" stroke="${OL}" stroke-width=".6"/><circle cx="-9.2" cy="68" r="3" fill="#f4ecd8" stroke="${OL}" stroke-width=".6"/>`+`<g class="ey">${aEye(-14.4,68,1.5)}${aEye(-8.8,68,1.5)}</g>`+`<path d="M-12.8 70l.8 2 .8-2Z" fill="#f29d2a"/>`+`<g class="ptl" style="transform-origin:-18px 70px">${a.p('M-18.6 68Q-21.4 72.6-18.8 77.6Q-16.6 74-17 69Z',shd('#8a5a34',-.12),{sw:.8})}</g>`,
 aguila:a=>`<ellipse class="shadow" cx="-12" cy="81.8" rx="8" ry="1.6"/>`+ln('M-14.4 77.6v3.6M-10 77.6v3.6','#f2c437',1.3)+ln('M-15.6 81.4h2.6M-11.2 81.4h2.6','#f2c437',.8)+`<g class="ptl" style="transform-origin:-18px 74px">${a.p('M-17.4 74.6L-23.4 80.4L-20.4 80.8L-15.6 77.6Z','#4a2e1c',{sw:.8})}</g>`+a.p(ell(-12.4,72,6.4,8),'#5a3a22',{hl:[-10,67,2.6,1.4],ho:.3})+a.p('M-16.4 68Q-20.6 72-18.6 78.6Q-14.6 75.6-14.4 70Z',shd('#5a3a22',-.12),{sw:.8,extra:ln('M-18 72l2 1M-18.4 75l2 1',shd('#5a3a22',-.3),.5)})+a.p(ell(-9.6,63.2,4.6,4.2),'#f6f6f6',{sw:.9})+`<path d="M-5.6 62.2Q-2 62-1.6 64.6Q-1.8 66.4-3.2 66.6Q-3 65-5.2 64.8Z" fill="#f2c437" stroke="${OL}" stroke-width=".6"/>`+aEye(-8.2,62.4,.9)+ln('M-10.2 61.4l2.6-.4',OL,.6),
 dragon:a=>quad(a,{c:'#3bb273',belly:'#f4d88a',bw:9,tail:a.p('M-21 70Q-27.6 72-28.6 66Q-28.8 63.4-27.4 62.4L-26 64.6Q-26.2 68-20.6 67Z','#3bb273',{sw:.9})+`<path d="M-27.4 62.4l-1.8-2.8 3.4.6Z" fill="#e5532a" stroke="${OL}" stroke-width=".5"/>`,bodyX:'',earsB:`<g class="pw" style="transform-origin:-15px 66px">${a.p('M-14 66.4Q-16.6 57-23 56.4Q-21.4 59.6-22.6 62Q-19.6 61.6-19.4 64Q-17 63.4-15.6 66.8Z','#2e8b57',{sw:.8,extra:ln('M-15 66l-6-8.6M-16 66.4l-3.6-4',shd('#2e8b57',-.3),.5)})}</g>`+[-19,-15.4,-11.8].map(x=>`<path d="M${x} 66.2l1.4-2.6 1.4 2.8Z" fill="#e5532a" stroke="${OL}" stroke-width=".5"/>`).join(''),ears:`<path d="M-9.4 60.6Q-10.4 57.6-8.8 55.4Q-8.2 58-7.2 60Z" fill="#f4d88a" stroke="${OL}" stroke-width=".6"/><path d="M-3.4 59.6Q-3 56.4-.6 54.8Q-1 57.6-1.6 60Z" fill="#f4d88a" stroke="${OL}" stroke-width=".6"/>`,snout:dogSnout(-5.2,65,'#57c98a','#1f5f3a')+`<circle cx="1.4" cy="63.6" r=".4" fill="${OL}"/>`}),
};

/* ---------- efectos del avatar ---------- */
function fxBackArt(fx){switch(fx){
 case'goldaura':return`<g class="fxa"><ellipse cx="32" cy="46" rx="27" ry="36" fill="#ffd86a" opacity=".13"/><ellipse cx="32" cy="48" rx="21" ry="30" fill="#ffd86a" opacity=".15"/><ellipse cx="32" cy="52" rx="14" ry="22" fill="#fff3b0" opacity=".16"/></g>`;
 case'divine':return`<g class="fxd" style="transform-origin:32px 38px">${[...Array(12)].map((_,k)=>{const an=k*Math.PI/6;const x1=32+44*Math.cos(an-.07),y1=38+44*Math.sin(an-.07),x2=32+44*Math.cos(an+.07),y2=38+44*Math.sin(an+.07);return`<path d="M32 38L${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}Z" fill="#fff3b0" opacity="${k%2?.22:.34}"/>`}).join('')}</g><ellipse cx="32" cy="40" rx="20" ry="26" fill="#fffbe0" opacity=".18"/>`;
}return''}
function fxFrontArt(fx){switch(fx){
 case'sweat':return[[49,20,0],[51.6,28,.7],[13.6,24,1.3]].map(([x,y,d])=>`<path class="fxs" style="animation-delay:-${d}s" d="M${x} ${y}q-1.6 2.6-1.6 3.6a1.6 1.6 0 0 0 3.2 0q0-1-1.6-3.6Z" fill="#9fd4ff" stroke="#2a6fd1" stroke-width=".4"/>`).join('');
 case'sparks':return[[8,30,0],[56,22,.5],[52,56,1],[10,62,1.5],[30,2,.8],[58,40,1.2]].map(([x,y,d])=>`<g class="fxk" style="animation-delay:-${d}s;transform-origin:${x}px ${y}px">${spark4(x,y,2.4,'#fff6a8')}</g>`).join('');
 case'firefeet':return[[27.6,79.6,0],[36.8,79.6,.2]].map(([x,y,d])=>`<g class="fxf" style="animation-delay:-${d}s;transform-origin:${x}px ${y}px"><path d="M${x-5} ${y+1.4}Q${x-5.6} ${y-4} ${x-2.4} ${y-6.4}Q${x-2.6} ${y-3} ${x-.6} ${y-2.6}Q${x-.8} ${y-8} ${x+2.8} ${y-10}Q${x+2} ${y-5.6} ${x+4.4} ${y-4}Q${x+6} ${y-1.4} ${x+5} ${y+1.4}Z" fill="#ff6a1a" opacity=".85"/><path d="M${x-2.6} ${y+1.4}Q${x-2.6} ${y-2} ${x+.4} ${y-4.6}Q${x+.4} ${y-2} ${x+2.6} ${y-1}Q${x+3.4} ${y+.4} ${x+2.6} ${y+1.4}Z" fill="#ffe27a" opacity=".9"/></g>`).join('');
 case'zap':return`<g class="fxz">${ln('M10 30l4 4-3 3 5 5M54 26l-4 5 3 2-4 6M14 58l3 3-3 3 4 3M50 60l-3 3 3 2-3 4','#9fd4ff',1.6)}${ln('M10 30l4 4-3 3 5 5M54 26l-4 5 3 2-4 6M14 58l3 3-3 3 4 3M50 60l-3 3 3 2-3 4','#fff',.6)}</g>`;
 case'orbit':return`<g transform="translate(32 58) scale(1 .34)"><g class="fxo" style="transform-origin:0px 0px">${[0,1,2].map(k=>{const an=k*2.094;const x=(28*Math.cos(an)).toFixed(1),y=(28*Math.sin(an)).toFixed(1),c=['#b583ff','#55a6ff','#ff5a8a'][k];return`<g class="fxo2" style="transform-origin:${x}px ${y}px"><ellipse cx="${x}" cy="${y}" rx="5.6" ry="16.4" fill="${c}" opacity=".3"/><ellipse cx="${x}" cy="${y}" rx="3.4" ry="10" fill="${c}" stroke="#fff" stroke-width="1.1" vector-effect="non-scaling-stroke"/><ellipse cx="${x-1}" cy="${y-3}" rx="1.1" ry="3.2" fill="#fff" opacity=".7"/></g>`}).join('')}</g></g>`;
}return''}

/* ---------- patrones de capa y escenarios ---------- */
function capeX(k){switch(k){
 case'trim':return ln('M15.6 70.4Q22.4 74.4 30.4 73.4Q38.6 75.4 46.6 70.6',GOLD,2.2);
 case'fur':return`<path d="M21 46.6Q32 43 43 46.6Q41 50 38 48.6Q35 51 32 49Q29 51 26 48.6Q23 50 21 46.6Z" fill="#eef0f4"/>`;
 case'stars':return[[24,54],[31,60],[38,52],[27,67],[41,64],[34,69],[20,62]].map(([x,y],i)=>spark4(x,y,i%2?1.2:1.8,'#ffe27a')).join('')+ln('M15.6 70.4Q22.4 74.4 30.4 73.4Q38.6 75.4 46.6 70.6',GOLD,1.6);
}return''}
const AV_BASE=`<g class="avbase"><path d="M10 82.4V88Q10 92.4 32 92.4Q54 92.4 54 88V82.4Z" fill="#232838"/><path d="M10 84.6Q10 88.8 32 88.8Q54 88.8 54 84.6" fill="none" stroke="#3a4158" stroke-width="1"/><ellipse cx="32" cy="82.4" rx="22" ry="5" fill="#343b52"/><ellipse cx="32" cy="82.4" rx="22" ry="5" fill="none" stroke="${OL}" stroke-width="1.1"/><path d="M14 80.6Q22 78.6 32 78.4" stroke="#fff" stroke-width="1" fill="none" opacity=".25"/><path d="M10 82.4V88Q10 92.4 32 92.4Q54 92.4 54 88V82.4" fill="none" stroke="${OL}" stroke-width="1.1"/></g>`;
let SCN=0;
function sceneSVG(id){const u='sc'+(++SCN)+'_';const g=(n,a,b,v)=>`<linearGradient id="${u+n}" x1="0" y1="0" x2="${v?0:1}" y2="${v?1:0}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
 const wrap=(defs,body)=>`<svg class="av-scene" viewBox="0 0 360 240" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;
 switch(id){
  case'plaza':return wrap(g('s','#8fd3ff','#e6f6ff',1),`<rect width="360" height="240" fill="url(#${u}s)"/><circle cx="300" cy="46" r="20" fill="#fff6c8"/>${[30,92,268,330].map((x,i)=>`<rect x="${x-3}" y="${120+i%2*6}" width="6" height="60" fill="#7a5230"/><circle cx="${x}" cy="${112+i%2*6}" r="${26-i%2*4}" fill="${i%2?'#4f9d3a':'#3f8a32'}"/>`).join('')}<rect y="176" width="360" height="64" fill="#c9c2b4"/><rect y="176" width="360" height="5" fill="#a9a294"/><rect x="132" y="150" width="96" height="6" rx="2" fill="#8a5a2b"/><rect x="138" y="156" width="4" height="20" fill="#5a3a22"/><rect x="218" y="156" width="4" height="20" fill="#5a3a22"/>`);
  case'gym':return wrap(g('w','#3a4158','#262b3b',1),`<rect width="360" height="240" fill="url(#${u}w)"/><rect x="58" y="40" width="110" height="100" rx="4" fill="#9fb4d8" opacity=".25"/><rect x="216" y="80" width="120" height="8" fill="#9aa3ad"/>${[230,260,290,320].map(x=>`<circle cx="${x}" cy="100" r="10" fill="#1d2030"/><rect x="${x-1}" y="88" width="2" height="12" fill="#9aa3ad"/>`).join('')}<rect x="216" y="118" width="120" height="6" fill="#9aa3ad"/><rect y="176" width="360" height="64" fill="#1d2030"/>${[0,60,120,180,240,300].map(x=>`<rect x="${x}" y="176" width="58" height="64" fill="#23283a"/>`).join('')}<text x="112" y="98" font-family="system-ui,sans-serif" font-weight="900" font-size="18" text-anchor="middle" fill="#ff5a8a" opacity=".55">EMPUJE</text>`);
  case'beach':return wrap(g('s','#5ec3ff','#ffe1b0',1),`<rect width="360" height="240" fill="url(#${u}s)"/><circle cx="270" cy="70" r="26" fill="#fff1a8"/><rect y="132" width="360" height="50" fill="#2a8fd8"/><path d="M0 140Q45 134 90 140T180 140T270 140T360 140" stroke="#bfe6ff" stroke-width="3" fill="none"/><path d="M0 182Q90 168 180 178T360 172V240H0Z" fill="#f2d99a"/><path d="M40 182q20-4 40 0" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>`);
  case'dojo':return wrap(g('w','#f0e2c4','#d9c39a',1),`<rect width="360" height="240" fill="url(#${u}w)"/>${[0,90,180,270].map(x=>`<rect x="${x+6}" y="20" width="78" height="150" fill="#fbf4e4" stroke="#7a4a22" stroke-width="4"/><path d="M${x+45} 20V170M${x+6} 70H${x+84}M${x+6} 120H${x+84}" stroke="#7a4a22" stroke-width="2"/>`).join('')}<rect x="150" y="34" width="60" height="96" fill="#f4ecd8" stroke="#3a2416" stroke-width="3"/><circle cx="180" cy="72" r="16" fill="none" stroke="#c0392b" stroke-width="5"/><rect y="170" width="360" height="70" fill="#b98a55"/>${[0,40,80,120,160,200,240,280,320].map(x=>`<path d="M${x} 170v70" stroke="#a37446" stroke-width="2"/>`).join('')}`);
  case'coliseo':return wrap(g('s','#f6c48a','#ffe9c8',1),`<rect width="360" height="240" fill="url(#${u}s)"/><rect y="40" width="360" height="134" fill="#d8b98a"/>${[0,1,2].map(r=>[...Array(9)].map((_,k)=>`<path d="M${k*40+8} ${170-r*44}V${146-r*44}Q${k*40+20} ${130-r*44} ${k*40+32} ${146-r*44}V${170-r*44}Z" fill="#8a6a44"/>`).join('')).join('')}<rect y="40" width="360" height="6" fill="#b8996a"/><rect y="172" width="360" height="68" fill="#e6c98e"/>`);
  case'cordillera':return wrap(g('s','#ff9a6a','#ffe2b8',1),`<rect width="360" height="240" fill="url(#${u}s)"/><path d="M0 170L60 80L110 130L170 50L230 120L290 70L360 140V240H0Z" fill="#6a5a8a"/><path d="M60 80L74 100L66 104L80 112L48 98ZM170 50L188 78L176 80L192 92L154 74ZM290 70L304 90L294 94L310 102L276 88Z" fill="#f6f6ff"/><path d="M0 190L80 140L150 176L240 136L360 182V240H0Z" fill="#4a6a5a"/><rect y="200" width="360" height="40" fill="#3f5a4a"/>`);
  case'ring':return wrap(g('w','#151a2c','#2a2f45',1),`<rect width="360" height="240" fill="url(#${u}w)"/><path d="M60 0L120 180H240L300 0" fill="#fff" opacity=".06"/><rect y="168" width="360" height="72" fill="#2a4bd0"/><rect y="168" width="360" height="8" fill="#1d3aa8"/>${[96,116,136].map((y,i)=>`<rect y="${y}" width="360" height="4" fill="${['#d0312d','#f4f4f4','#2a4bd0'][i]}"/>`).join('')}<rect x="20" y="84" width="10" height="92" fill="#cfd5dc"/><rect x="330" y="84" width="10" height="92" fill="#cfd5dc"/>`);
  case'templo':return wrap(g('s','#9fd4ff','#f4fbff',1),`<rect width="360" height="240" fill="url(#${u}s)"/><path d="M40 70L180 22L320 70Z" fill="#f4efe2" stroke="#c9bfa8" stroke-width="3"/><rect x="40" y="70" width="280" height="12" fill="#e9e2d0"/>${[56,100,144,188,232,276].map(x=>`<rect x="${x}" y="82" width="28" height="94" fill="#f4efe2"/><path d="M${x+7} 84v90M${x+14} 84v90M${x+21} 84v90" stroke="#d8cfb8" stroke-width="1.4"/>`).join('')}<rect x="30" y="176" width="300" height="10" fill="#e0d8c4"/><rect y="186" width="360" height="54" fill="#d8cfb8"/>`);
  case'espacio':return wrap(g('s','#0b0f2a','#2a1a5a',1),`<rect width="360" height="240" fill="url(#${u}s)"/>${[...Array(40)].map((_,i)=>`<circle cx="${(i*83)%360}" cy="${(i*47)%180}" r="${i%5?1:1.8}" fill="#fff" opacity="${.4+(i%3)*.2}"/>`).join('')}<circle cx="282" cy="64" r="30" fill="#ff8a5a"/><ellipse cx="282" cy="64" rx="50" ry="10" fill="none" stroke="#ffd2a8" stroke-width="3" transform="rotate(-16 282 64)"/><path d="M0 190Q180 160 360 190V240H0Z" fill="#9aa3ad"/>${[[60,206,10],[200,196,7],[300,214,12]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r/2.4}" fill="#7a828e"/>`).join('')}`);
  case'olimpo':return wrap(g('s','#ffd98a','#fff6dc',1),`<rect width="360" height="240" fill="url(#${u}s)"/>${[...Array(10)].map((_,k)=>`<path d="M180 260L${k*40-20} -10L${k*40+4} -10Z" fill="#fff" opacity=".22"/>`).join('')}${[70,250].map(x=>`<rect x="${x}" y="56" width="40" height="124" fill="#f6e7b8"/><rect x="${x-6}" y="48" width="52" height="10" fill="#e2b54a"/><path d="M${x+10} 58v120M${x+20} 58v120M${x+30} 58v120" stroke="#e2cf96" stroke-width="2"/>`).join('')}${[[40,196,60],[150,206,80],[290,198,70],[220,214,60]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="22" fill="#fff"/>`).join('')}<rect y="214" width="360" height="26" fill="#fff"/>`);
 }return''}

/* ================= AVATAR · datos ================= */
const PHYS=[
 {n:'Flacucho',b:-3,v:-.6,aw:3.8,lw:4.8,abs:0,d:'Recién llegado al mundo, con una hojita y mucha voluntad.'},
 {n:'Delgado',b:-2,v:0,aw:4.6,lw:5.4,abs:1,d:'Ya se nota que algo está pasando.'},
 {n:'En forma',b:-1,v:.6,aw:5.4,lw:6,abs:2,d:'Hombros firmes y pecho despierto.'},
 {n:'Atlético',b:0,v:1.2,aw:6.2,lw:6.6,abs:3,d:'Cada flexión dejó su marca.'},
 {n:'Fornido',b:1,v:1.8,aw:7,lw:7.2,abs:3,bicep:1,d:'Las poleras empiezan a quedar chicas.'},
 {n:'Musculoso',b:1.8,v:2.6,aw:7.8,lw:7.8,abs:4,bicep:1,delt:1,d:'Bíceps de acero y abdomen tallado.'},
 {n:'Coloso',b:2.6,v:3.4,aw:8.6,lw:8.4,abs:4,bicep:1,delt:1,d:'Cuando caminas, el suelo toma nota.'},
 {n:'Semidiós',b:3.2,v:4,aw:9.2,lw:8.8,abs:4,bicep:1,delt:1,glow:1,d:'Brillas. Literalmente.'}
];
const AV_SLOTS=[
 ['peinado','Peinado','💇'],['tinte','Tinte','🎨'],['barba','Barba','🧔'],['cabeza','Cabeza','🎩'],['cara','Cara','🕶️'],
 ['torso','Ropa','👕'],['armadura','Armadura','🛡️'],['piernas','Piernas','🩳'],['pies','Calzado','👟'],['capa','Capa','🧣'],
 ['arma','Mano derecha','⚔️'],['mano','Mano izquierda','🪃'],['cuello','Cuello','📿'],['tatA','Tatuaje (brazo)','💪'],['tatC','Tatuaje (pecho)','🫀'],
 ['mascota','Mascota','🐾'],['gesto','Gesto','👋'],['frase','Frases','💬'],['efecto','Efecto','✨'],['escenario','Escenario','🏞️']
];
const AV_SLOT_NAME=Object.fromEntries(AV_SLOTS.map(s=>[s[0],s[1]]));
const AV_SKIN=['#f6d7b8','#f0c49c','#dba77e','#c08a5e','#8f5f3c','#5e3b24'];
const AV_EYES=['#3a2416','#1d1612','#2f6fb0','#3a8a5a','#7a5634','#6b6f7a'];
const AV_NAT=[['#2e2420','Negro'],['#4a2f1d','Castaño'],['#7a5232','Castaño claro'],['#d9b25f','Rubio']];
const AV_BASECUT=[['short','Corto'],['buzz','Rapado'],['bald','Calvo']];
const AV_GEST_FREE='wave';
const RR={c:'común',u:'poco común',r:'raro',e:'épico',l:'legendario',m:'mítico'};
const AV_ITEMS=[];
function avAdd(slot,pre,icon,rows){for(const[k,name,r,v,desc,ic]of rows)AV_ITEMS.push({id:'av_'+pre+'_'+k,type:'avatar',slot,name,rarity:RR[r],icon:ic||icon,v,desc})}
avAdd('peinado','h','💇',[
 ['slick','Engominado','c','slick','Peinado hacia atrás, brillante y sin un pelo fuera de lugar.'],
 ['swept','Peinado al lado','c','swept','Clásico, ordenado, de foto de carnet.'],
 ['bob','Melenita','c','bob','Corte parejo a la altura de la mandíbula.'],
 ['curly','Rizos','u','curly','Rulos con volumen propio.'],
 ['long','Melena','u','long','Pelo largo que vuela al trotar.'],
 ['pony','Cola de caballo','u','pony','Práctico para entrenar.'],
 ['spiky','Puntas','u','spiky','Pelo parado con gel de ferretería.'],
 ['mohawk','Mohicano','r','mohawk','Lados rapados y cresta al cielo.'],
 ['undercut','Undercut','r','undercut','Lados cortos y tupé con onda.'],
 ['bun','Moño de guerrero','r','bun','Amarrado arriba, listo para la batalla.'],
 ['wavy','Ondas','r','wavy','Ondas de surfista.'],
 ['afro','Afro','e','afro','Volumen glorioso, redondo como un sol.'],
 ['braids','Trenzas','e','braids','Trenzas firmes que no se sueltan ni en burpees.'],
 ['wild','Melena salvaje','e','wild','Indomable, como tus ganas.'],
 ['mizura','Mizura','l','mizura','Peinado de los antiguos nobles de Japón.'],
 ['flame','Cabellera de fuego','m','flame','No es tinte: es combustión pura.','🔥']
]);
avAdd('tinte','t','🎨',[
 ['rojo','Rojo fuego','u','#e5332a','Para que te vean desde lejos.'],
 ['pelirrojo','Pelirrojo','u','#b5482a','Cobrizo natural… o casi.'],
 ['platino','Rubio platino','r','#efe3b8','Rubio casi blanco.'],
 ['plata','Plateado','r','#c9ced8','Canas de sabio, sin los años.'],
 ['azul','Azul eléctrico','r','#2f6ff0','Brilla bajo el sol.'],
 ['rosado','Rosado chicle','r','#ff7fb3','Dulce pero peligroso.'],
 ['menta','Verde menta','e','#5fd6a8','Fresco como la mañana.'],
 ['morado','Morado real','e','#7b3fe0','Color de emperadores.'],
 ['nieve','Blanco nieve','l','#f4f4f4','Blanco como la cumbre más alta.'],
 ['oro','Oro olímpico','l','#f2c437','Pelo de medalla de oro.'],
 ['galaxia','Galaxia','m','galaxy','Llevas el universo en la cabeza.','🌌']
]);
avAdd('barba','b','🧔',[
 ['stubble','Barba de 3 días','c','stubble','Descuidada a propósito.'],
 ['stache','Bigote','c','stache','Elegancia de bigote.'],
 ['goatee','Candado','u','goatee','Bigote y barbilla, cerrado con llave.'],
 ['short','Barba corta','u','short','Pareja y cuidada.'],
 ['full','Barba completa','r','full','De leñador que entrena.'],
 ['fu','Bigote largo','r','fu','Dos puntas que llegan al mentón.'],
 ['long','Barba de sabio','e','long','Tanta sabiduría no cabe en una barba corta.']
]);
avAdd('cabeza','c','🎩',[
 ['sweat','Cintillo deportivo','c',{g:['sweat','#f4f4f4','#d0312d']},'Atrapa el sudor antes de que llegue a los ojos.','🎽'],
 ['cap','Jockey rojo','c',{g:['cap','#d0312d','#a81f1f'],cover:1},'Visera al frente, mirada al objetivo.','🧢'],
 ['beanie','Gorro de lana','c',{g:['beanie','#2e8b57','#f4f4f4'],cover:1},'Para los entrenamientos de invierno.'],
 ['capback','Jockey al revés','u',{g:['capback','#2a4bd0','#1d3aa8'],cover:1},'Modo concentración activado.','🧢'],
 ['bandana','Bandana','u',{g:['bandana','#c0392b']},'Amarrada atrás, con estilo.'],
 ['beret','Boina','u',{g:['beret','#2b2b33']},'De artista que también levanta peso.'],
 ['furhat','Gorro de piel','u',{g:['furhat','#7a4a22','#c9a27a'],cover:1},'Abriga como una estepa entera.'],
 ['hachi','Hachimaki','r',{g:['headband','#f4f4f4']},'Cinta de concentración con las puntas al viento.'],
 ['huaso','Sombrero de huaso','r',{g:['huaso','#2b2b33','#1d1d26']},'Ala ancha y plana, de fonda y rodeo.','🤠'],
 ['cowboy','Sombrero de vaquero','r',{g:['cowboy','#a8743f','#3a2416']},'Ala curva y polvo del camino.','🤠'],
 ['tophat','Sombrero de copa','r',{g:['tophat','#1d1d26','#a3242c']},'Para entrenar de gala.'],
 ['laurel','Corona de laurel','r',{g:['laurel','#4f9d3a']},'Premio de los vencedores antiguos.','🌿'],
 ['galea','Casco de legionario','e',{g:['galea','#c9ced8','#c0392b'],cover:1},'Penacho rojo y paso de marcha.','⛑️'],
 ['corup','Casco corintio','e',{g:['corup','#d9a441','#c0392b'],cover:1},'Bronce griego con cresta de crin.','⛑️'],
 ['winged','Casco alado','e',{g:['winged','#c9ced8','#f4f4f4'],cover:1},'Alas para correr más rápido.'],
 ['horns','Cuernos de toro','e',{g:['horns','#efe6cf']},'Embistes cada repetición.','🐂'],
 ['glaurel','Laurel de oro','l',{g:['laurel','#e2b54a']},'Solo para campeones de verdad.','🏅'],
 ['crown','Corona real','l',{g:['crown','#e2b54a','#c0392b']},'Reinas sobre tu rutina.','👑'],
 ['kabuto','Kabuto','l',{g:['kabuto','#2b2b33','#e2b54a'],cover:1},'Casco samurái con cuernos dorados.'],
 ['lion','Piel de león','l',{g:['lionpelt','#c9893c','#a86a2a'],hb:['lionpelt','#c9893c','#a86a2a'],cover:1},'Trofeo de un héroe de leyenda.','🦁'],
 ['moon','Kabuto de media luna','m',{g:['kabuto','#1d1d26','#e2b54a','crescent'],cover:1},'Una luna de oro sobre tu frente.','🌙'],
 ['halo','Aureola','m',{g:['halo']},'Flota sola. Nadie sabe cómo.','😇'],
 ['rays','Corona de rayos','m',{g:['spikecrown','#ffd86a','#55a6ff']},'Corona de puntas de luz.','✨']
]);
avAdd('cara','f','🕶️',[
 ['round','Lentes redondos','c','round','De intelectual que no se salta el día de piernas.','👓'],
 ['sun','Lentes de sol','u','sun','El sol no te encandila. Tú lo encandilas a él.'],
 ['scar','Cicatriz de batalla','u','scar','Recuerdo de una serie que dolió.','🩹'],
 ['aviator','Lentes de aviador','r','aviator','Para despegar en cada sesión.'],
 ['patch','Parche de pirata','r','patch','Con un ojo basta para ver la meta.','🏴‍☠️'],
 ['mask','Antifaz','r','mask','Héroe anónimo del barrio.','🎭'],
 ['visor','Visor deportivo','e','visor','Visión de alto rendimiento.'],
 ['paint','Pintura de guerra','e','paint','Hoy se sale a ganar.','🖌️'],
 ['glow','Ojos de poder','l','glow','Cuando te concentras, tus ojos se encienden.','👁️']
]);
avAdd('torso','r','👕',[
 ['blanca','Polera blanca','c',{tu:'#f4f4f4',ar:['tee','#f4f4f4'],sl:6.4},'Básica e infalible.'],
 ['negra','Polera negra','c',{tu:'#2b2b33',ar:['tee','#2b2b33'],sl:6.4},'Combina con todo, hasta con el cansancio.'],
 ['gris','Polera gris','c',{tu:'#9aa3ad',ar:['tee','#9aa3ad'],sl:6.4},'La clásica de gimnasio.'],
 ['musculosa','Musculosa','c',{tu:'#f4f4f4',ar:['tank2','#f4f4f4'],sl:0},'Deja los brazos al aire. Lúcelos.','🎽'],
 ['tunica','Túnica de lino','c',{tu:'#e9dcc0',ar:['tunic','#e9dcc0','#8a5a2b'],sl:7},'Como entrenaban en la Antigüedad.'],
 ['musc2','Musculosa negra','u',{tu:'#2b2b33',ar:['tank2','#2b2b33'],sl:0},'Seria y sin mangas.','🎽'],
 ['rayo','Polera del Rayo','u',{tu:'#d0312d',ar:['tee','#d0312d','bolt','#ffd23a'],sl:6.4},'Carga eléctrica en el pecho.'],
 ['estrella','Polera Estrella','u',{tu:'#2a4bd0',ar:['tee','#2a4bd0','star','#f4f4f4'],sl:6.4},'Una estrella solitaria en el pecho.'],
 ['poleron','Polerón','u',{tu:'#6b7a8f',ar:['hoodie','#6b7a8f'],sl:14},'Capucha, bolsillo y cordones.'],
 ['quiton','Quitón griego','u',{tu:'#f4f4f4',ar:['chiton','#f4f4f4','#e2b54a'],sl:4},'Ropa de atleta olímpico de verdad.'],
 ['buzo','Chaqueta de buzo','r',{tu:'#1d3aa8',ar:['jacket','#1d3aa8','#f4f4f4'],sl:14,stripe:'#f4f4f4'},'Cierre arriba, mangas con franja.'],
 ['hawaiana','Camisa hawaiana','r',{tu:'#1fa3a3',ar:['hawaiian','#1fa3a3','#ffd23a'],sl:6.4},'Vacaciones activas.','🌺'],
 ['gi','Gi de artes marciales','r',{tu:'#f4f4f4',ar:['gi','#f4f4f4','#1d1d26'],sl:9},'Con cinturón negro incluido.','🥋'],
 ['toga','Toga romana','r',{tu:'#f4f4f4',ar:['toga','#f4f4f4','#8a1c2b'],sl:6.4},'Ropa de senador con borde púrpura.'],
 ['diez','Camiseta N°10','e',{tu:'#d0312d',ar:['jersey','#d0312d','#f4f4f4'],sl:6.4},'La camiseta del crack del equipo.','⚽'],
 ['kimono','Kimono','e',{tu:'#2a3a7a',ar:['kimono','#2a3a7a','#e2b54a'],sl:12},'Seda azul con borde dorado.','👘'],
 ['cuero','Chaqueta de cuero','e',{tu:'#2b2b33',ar:['ljacket','#2b2b33'],sl:14},'Rebelde con causa: entrenar.','🧥'],
 ['letter','Chaqueta universitaria','e',{tu:'#1d3aa8',ar:['varsity','#1d3aa8','#e2b54a'],sl:14,sleeve:'#f4f4f4'},'Con la «L» de la Liga.','🧥'],
 ['terno','Terno elegante','l',{tu:'#2b2b33',ar:['suit','#2b2b33','#c0392b'],sl:14},'Para recibir trofeos con clase.','🤵'],
 ['hanfu','Hanfu imperial','l',{tu:'#a3242c',ar:['kimono','#a3242c','#e2b54a'],sl:14},'Seda roja de la corte imperial.'],
 ['dorada','Polera dorada','l',{tu:'#e2b54a',ar:['tee','#e2b54a','crown','#7a4a08'],sl:6.4},'Brilla como un trofeo.'],
 ['farao','Atuendo de faraón','l',{tu:'#f4ecd8',ar:['pharaoh','#f4ecd8','#e2b54a'],sl:0},'Lino fino y pectoral de oro.','🏺'],
 ['estelar','Manto estelar','m',{tu:'#1b1f4a',ar:['stars','#1b1f4a','#ffe27a'],sl:14},'Tejido con hilos de constelación.','🌌']
]);
avAdd('armadura','a','🛡️',[
 ['arnes','Arnés de gladiador','u',{ar:['harness','#7a4a22']},'Correas de cuero sobre el pecho desnudo.'],
 ['lino','Peto de lino','u',{ar:['linen','#f4ecd8','#e2b54a']},'Ligero y fresco, de Egipto antiguo.'],
 ['cuero','Coraza de cuero','r',{ar:['musc','#8a5a2b']},'Cuero curtido con forma de músculos.'],
 ['bronce','Coraza de bronce','r',{ar:['musc','#d9a441']},'Músculos de metal sobre músculos de verdad.'],
 ['malla','Cota de malla','e',{ar:['chain','#9aa3ad']},'Miles de anillos de acero.'],
 ['lorica','Lorica segmentada','e',{ar:['seg','#b8c0c8'],belt:'#7a4a22'},'Placas articuladas de legionario.'],
 ['samurai','Armadura samurái','e',{ar:['lamellar','#a3242c','#e2b54a']},'Láminas lacadas en rojo.'],
 ['escamas','Armadura de escamas','e',{ar:['scale','#3a8a6a','#e2b54a']},'Escamas verdes como de dragón.','🐉'],
 ['placas','Armadura de placas','l',{ar:['plate','#c9ced8']},'Acero pulido de pies a cabeza.'],
 ['sobreveste','Sobreveste del caballero','l',{ar:['surcoat','#f4f4f4','#c0392b']},'Tela blanca con cheurones rojos.'],
 ['olimpo','Coraza del Olimpo','m',{ar:['musc','#f2c437'],mantle:'#8a1c2b'},'Forjada por un herrero de los dioses.','⚜️'],
 ['abismo','Armadura del Abismo','m',{ar:['plate','#2b2733'],mantle:'#5b2a86'},'Acero negro que absorbe la luz.','🖤']
]);
avAdd('piernas','p','🩳',[
 ['short','Short deportivo','c',{skirt:['hips','#2b2b33','#f4f4f4'],legC:['#2b2b33',6.2]},'Liviano para correr.'],
 ['shortaz','Short azul','c',{skirt:['hips','#2a4bd0','#f4f4f4'],legC:['#2a4bd0',6.2]},'Con franja blanca a los lados.'],
 ['bermuda','Bermuda','c',{skirt:['hips','#c9a27a'],legC:['#c9a27a',9.6]},'Para el verano.'],
 ['buzo','Pantalón de buzo','u',{skirt:['hips','#1d3aa8','#f4f4f4'],leg:'#1d3aa8'},'Cómodo, abrigado y con franjas.','👖'],
 ['jeans','Jeans','u',{skirt:['hips','#3b5b8a'],leg:'#3b5b8a'},'Mezclilla de toda la vida.','👖'],
 ['taparrabo','Taparrabo de piel','u',{skirt:['loin','#a86a2a']},'Primer paso después de la hojita.'],
 ['escoces','Falda escocesa','r',{skirt:['tartan','#2e6b3f','#c0392b']},'Tartán verde con líneas rojas.'],
 ['romano','Faldellín romano','r',{skirt:['pteruges','#8a1c2b']},'Tiras de cuero que suenan al marchar.'],
 ['hakama','Hakama','e',{skirt:['hakama','#2b2b33']},'Pantalón ancho de los guerreros de Japón.'],
 ['cuero','Pantalón de cuero','e',{skirt:['hips','#1d1d26'],leg:'#1d1d26'},'Negro y rudo.','👖'],
 ['real','Faldón real','e',{skirt:['long','#5b2a86']},'Largo, púrpura y majestuoso.'],
 ['oro','Faldellín de oro','l',{skirt:['pteruges','#e2b54a']},'Tiras doradas de general victorioso.']
]);
avAdd('pies','z','👟',[
 ['blancas','Zapatillas blancas','c',['sneaker','#f4f4f4','#2a4bd0'],'Recién sacadas de la caja.'],
 ['sandalias','Sandalias','c',['sandal','#8a5a2b'],'Como las de los atletas antiguos.','🩴'],
 ['rojas','Zapatillas rojas','u',['sneaker','#d0312d','#f4f4f4'],'Más rápidas. Eso dicen.'],
 ['negras','Zapatillas negras','u',['sneaker','#2b2b33','#d0312d'],'Discretas y veloces.'],
 ['zori','Zori','u',['zori','#c0392b'],'Sandalias japonesas de tiras rojas.','🩴'],
 ['botas','Botas','r',['boot','#5a3a22'],'Para caminos difíciles.','🥾'],
 ['box','Botines de boxeo','r',['boot','#d0312d'],'Pies ligeros para esquivar.','🥊'],
 ['hierro','Botas de hierro','e',['boot','#9aa3ad'],'Cada paso suena a armadura.'],
 ['doradas','Zapatillas doradas','e',['sneaker','#f2c437','#fff6c8'],'Para pisar el podio.'],
 ['aladas','Sandalias aladas','l',['wingsandal','#e2b54a'],'Pequeñas alas en los tobillos.','🪽']
]);
avAdd('capa','k','🧣',[
 ['roja','Capa roja','u',{c:'#c0392b'},'Ondea cuando corres.'],
 ['azul','Capa azul','u',{c:'#2a4bd0'},'Como un cielo a la espalda.'],
 ['verde','Capa verde','r',{c:'#2e8b57'},'De explorador de bosque.'],
 ['negra','Capa negra','r',{c:'#1d1d26'},'Misteriosa y elegante.'],
 ['purpura','Capa púrpura imperial','e',{c:'#5b2a86',x:'trim'},'Con borde de oro, para emperadores.'],
 ['lobo','Capa de piel de lobo','e',{c:'#8a94a3',x:'fur'},'Abriga y asusta.','🐺'],
 ['dorada','Capa dorada','l',{c:'#e2b54a',x:'trim'},'Tejida con hilos de oro.'],
 ['estelar','Capa estelar','m',{c:'#1b1f4a',x:'stars'},'Lleva estrellas de verdad.','🌌']
]);
avAdd('arma','w','⚔️',[
 ['mancuerna','Mancuerna','c','dumbbell','Fiel compañera de todo bíceps.','🏋️'],
 ['botella','Botella de agua','c','bottle','Hidratación primero.','💧'],
 ['baston','Bastón','c','staff','Para entrenar equilibrio.'],
 ['batido','Batido de proteína','u','shake','Recuperación en formato portátil.','🥤'],
 ['pesarusa','Pesa rusa','u','kettlebell','Balanceo, fuerza y respeto.'],
 ['garrote','Garrote','u','club','Primitivo pero efectivo.'],
 ['gladius','Gladius','r','gladius','Espada corta de legionario.','🗡️'],
 ['lanza','Lanza','r','spear','Alcance y precisión.'],
 ['hacha','Hacha','r','axe','Corta leña y excusas.','🪓'],
 ['bandera','Bandera de Chile','r','chileflag','La estrella solitaria flamea contigo.','🇨🇱'],
 ['antorcha','Antorcha','r','torch','Ilumina el camino del entrenamiento.','🔥'],
 ['lucero','Lucero del alba','r','macestar','Maza con púas de caballero.'],
 ['katana','Katana','e','katana','Filo curvo y disciplina.'],
 ['espada','Espada larga','e','longsword','De caballero andante.'],
 ['arco','Arco','e','bow','Para acertar a tus metas.','🏹'],
 ['naginata','Naginata','e','naginata','Hoja curva sobre asta larga.'],
 ['trofeo','Trofeo','l','trophy','Lo ganaste repetición a repetición.','🏆'],
 ['martillo','Martillo de trueno','l','hammer','Pesado como la constancia.','🔨'],
 ['tridente','Tridente','l','trident','Manda sobre los mares.','🔱'],
 ['rayo','Rayo','m','bolt','Energía pura en la mano.','⚡']
]);
avAdd('mano','m','🪃',[
 ['mancuerna','Segunda mancuerna','c',{it2:'dumbbell'},'Para entrenar parejo.','🏋️'],
 ['manzana','Manzana dorada','u',{it2:'apple'},'Una fruta de leyenda.','🍎'],
 ['pergamino','Pergamino','u',{it2:'scroll'},'Tu plan de entrenamiento.','📜'],
 ['redondo','Escudo redondo','u',{sh:['round','#8a5a2b','#d9a441']},'Madera reforzada.'],
 ['ovalado','Escudo ovalado','u',{sh:['oval','#5a3a22','#c9a27a']},'Ligero y resistente.'],
 ['gladiador','Escudo de gladiador','r',{sh:['parmula','#a3242c','#e2b54a']},'Pequeño y rápido.'],
 ['cometa','Escudo de cometa','r',{sh:['kite','#2a4bd0','#f4f4f4']},'De caballero normando.'],
 ['legion','Escudo de legionario','e',{sh:['scutum','#a3242c','#e2b54a']},'Grande y curvo, de muralla romana.'],
 ['esparta','Escudo espartano','e',{sh:['aspis','#d9a441','#a3242c','lambda']},'Con la lambda de Lacedemonia.'],
 ['wakizashi','Wakizashi','e',{it2:'wakizashi'},'Espada corta para la otra mano.'],
 ['espejo','Escudo espejo','l',{sh:['mirror','#c9ced8','#e2b54a']},'Pulido como el de Perseo.'],
 ['sol','Escudo del sol','l',{sh:['aspis','#e2b54a','#c0392b','sun']},'Un sol rojo sobre bronce.']
]);
avAdd('cuello','n','📿',[
 ['toalla','Toalla al cuello','c','towel','Señal de que el entrenamiento fue en serio.'],
 ['silbato','Silbato de entrenador','c','whistle','¡Prrrt! Una serie más.'],
 ['bufanda','Bufanda','u','scarf','Para las mañanas frías.','🧣'],
 ['colmillo','Collar de colmillo','u','fang','Recuerdo de una aventura.'],
 ['cadena','Cadena de oro','r','chain','Pesada como tus series.'],
 ['torque','Torque celta','r','torc','Aro de los guerreros galos.'],
 ['perlas','Collar de perlas','r','pearls','Clásico y brillante.'],
 ['medalla','Medalla de oro','e','medal','Primer lugar del podio.','🥇'],
 ['magatama','Collar magatama','e','magatama','Joyas curvas del antiguo Japón.'],
 ['ambar','Collar de Brísingamen','l','brisingamen','Joya de ámbar de las leyendas nórdicas.'],
 ['pectoral','Pectoral de faraón','l','collar','Oro y lapislázuli.']
]);
avAdd('tatA','ta','💪',[
 ['brazalete','Brazalete','c','band','Dos líneas firmes alrededor del brazo.'],
 ['estrella','Estrella','c','star','Una estrella para guiarte.'],
 ['tribal','Tribal','u','tribal','Clásico de playa.'],
 ['olas','Olas','u','waves','El mar en el antebrazo.'],
 ['ancla','Ancla','u','anchor','Firmeza ante cualquier tormenta.','⚓'],
 ['rayo','Rayo','r','bolt','Electricidad en la piel.','⚡'],
 ['rosa','Rosa','r','rose','Fuerza con delicadeza.','🌹'],
 ['runas','Runas','e','runes','Símbolos de los antiguos nórdicos.'],
 ['dragon','Dragón','l','dragon','Serpentea por tu brazo.','🐉']
]);
avAdd('tatC','tp','🫀',[
 ['brujula','Brújula','u','compass','Nunca pierdes el rumbo.','🧭'],
 ['sol','Sol','r','sun','Calor en el pecho.','☀️'],
 ['arbol','Árbol de la vida','r','tree','Raíces fuertes, ramas altas.','🌳'],
 ['aguila','Águila','e','eagle','Alas abiertas sobre el corazón.','🦅'],
 ['alas','Alas','e','wings','Para volar sobre los récords.','🪽'],
 ['fenix','Fénix','l','phoenix','Renace después de cada caída.','🔥'],
 ['dragon','Dragón del pecho','m','dragon','Un dragón que despierta cuando entrenas.','🐉']
]);
avAdd('mascota','q','🐾',[
 ['perro','Perrito','c','perro','Te acompaña a trotar todos los días.','🐶'],
 ['gato','Gatito','c','gato','Te mira entrenar desde el sillón.','🐱'],
 ['pollito','Pollito','c','pollito','Pequeño pero valiente.','🐤'],
 ['conejo','Conejo','u','conejo','Rápido como un sprint.','🐰'],
 ['cerdito','Chanchito','u','cerdito','Ama los días de descanso.','🐷'],
 ['tortuga','Tortuga','u','tortuga','Lento pero constante. Como debe ser.','🐢'],
 ['zorro','Zorro','r','zorro','Astuto y curioso.','🦊'],
 ['pinguino','Pingüino','r','pinguino','Elegante hasta para caminar.','🐧'],
 ['capibara','Capibara','r','capibara','La calma hecha animal.'],
 ['buho','Búho','e','buho','Vigila tus entrenamientos nocturnos.','🦉'],
 ['panda','Panda','e','panda','Entrena poco, come mucho, te quiere igual.','🐼'],
 ['lobo','Lobo','e','lobo','Leal hasta el final de la serie.','🐺'],
 ['aguila','Águila','l','aguila','Ve tu progreso desde lo alto.','🦅'],
 ['dragon','Dragoncito','m','dragon','Escupe chispitas cuando rompes un récord.','🐲']
]);
avAdd('gesto','g','👋',[
 ['pulgar','Pulgar arriba','c','thumbs','Todo bien, todo en orden.','👍'],
 ['tijera','Saltos de tijera','c','jacks','Calentamiento clásico.'],
 ['biceps','Doble bíceps','u','flex','Pose de campeonato.','💪'],
 ['flexiones','Flexiones','u','pushup','Lo que mejor sabes hacer.'],
 ['baile','Baile de la victoria','r','dance','Nadie te está mirando… o sí.','💃'],
 ['golpes','Combo de golpes','r','punch','Jab, jab, directo.','🥊'],
 ['puno','Puño al pecho','r','fistchest','Saludo de guerrero leal.','✊'],
 ['meditar','Meditación','e','meditate','Mente tranquila, cuerpo fuerte.','🧘'],
 ['victoria','¡Victoria!','e','victory','Brazos al cielo y salto.','🙌'],
 ['ataque','Ataque con arma','e','swing','Un golpe de leyenda con lo que tengas en la mano.']
]);
avAdd('frase','x','💬',[
 ['unamas','¡Una más!','c','¡Una más!','Frase para tu avatar.'],
 ['vamos','¡Vamos que se puede!','c','¡Vamos que se puede!','Frase para tu avatar.'],
 ['nosenegocia','Hoy no se negocia.','c','Hoy no se negocia.','Frase para tu avatar.'],
 ['suelo','El suelo me conoce.','c','El suelo me conoce.','Frase para tu avatar.'],
 ['adarle','¡A darle!','c','¡A darle!','Frase para tu avatar.'],
 ['paso','Paso a paso, flexión a flexión.','u','Paso a paso, flexión a flexión.','Frase para tu avatar.'],
 ['excusas','Sin excusas, con ganas.','u','Sin excusas, con ganas.','Frase para tu avatar.'],
 ['cansancio','El cansancio también se entrena.','u','El cansancio también se entrena.','Frase para tu avatar.'],
 ['rival','Mi rival es el yo de ayer.','u','Mi rival es el yo de ayer.','Frase para tu avatar.'],
 ['empuje','¡Puro empuje!','u','¡Puro empuje!','Frase para tu avatar.'],
 ['lento','Lento pero imparable.','r','Lento pero imparable.','Frase para tu avatar.'],
 ['constancia','La constancia es mi superpoder.','r','La constancia es mi superpoder.','Frase para tu avatar.'],
 ['duele','Duele hoy, brilla mañana.','r','Duele hoy, brilla mañana.','Frase para tu avatar.'],
 ['regalo','Nadie me regaló estos brazos.','r','Nadie me regaló estos brazos.','Frase para tu avatar.'],
 ['historia','Cada repetición cuenta una historia.','e','Cada repetición cuenta una historia.','Frase para tu avatar.'],
 ['gravedad','La gravedad me tiene miedo.','e','La gravedad me tiene miedo.','Frase para tu avatar.'],
 ['ganar','No vine a participar, vine a ganar.','e','No vine a participar, vine a ganar.','Frase para tu avatar.'],
 ['norendi','Soy el que no se rindió.','l','Soy el que no se rindió.','Frase para tu avatar.'],
 ['pierde','El suelo empuja de vuelta. Y pierde.','l','El suelo empuja de vuelta. Y pierde.','Frase para tu avatar.'],
 ['dioses','Los dioses me piden la rutina.','m','Los dioses me piden la rutina.','Frase para tu avatar.'],
 ['leyenda','Mi leyenda se escribe en repeticiones.','m','Mi leyenda se escribe en repeticiones.','Frase para tu avatar.']
]);
avAdd('efecto','e','✨',[
 ['sudor','Sudor de campeón','c','sweat','Gotas de esfuerzo honesto.','💦'],
 ['chispas','Chispas','r','sparks','Brillitos a tu alrededor.'],
 ['fuego','Pies de fuego','e','firefeet','Dejas el suelo ardiendo.','🔥'],
 ['electricidad','Electricidad','e','zap','Rayos que te recorren el cuerpo.','⚡'],
 ['orbes','Orbes','l','orbit','Tres esferas giran a tu alrededor.','🔮'],
 ['aura','Aura dorada','l','goldaura','Resplandor de campeón.','🌟'],
 ['divina','Luz divina','m','divine','Rayos de luz detrás de ti.','☀️']
]);
avAdd('escenario','s','🏞️',[
 ['plaza','Plaza del barrio','c','plaza','Barras, árboles y una banca para elongar.','🌳'],
 ['gym','Gimnasio','u','gym','Fierros, espejo y cero excusas.','🏋️'],
 ['playa','Playa','u','beach','Arena, sol y trote a la orilla.','🏖️'],
 ['dojo','Dojo','r','dojo','Madera, papel y disciplina.','⛩️'],
 ['cordillera','Cordillera nevada','r','cordillera','Cumbres blancas al atardecer.','🏔️'],
 ['coliseo','Coliseo','e','coliseo','La arena espera a su campeón.','🏟️'],
 ['ring','Ring de boxeo','e','ring','Cuerdas, focos y campana.','🥊'],
 ['templo','Templo griego','e','templo','Columnas de mármol y cielo claro.','🏛️'],
 ['espacio','Espacio','l','espacio','Entrena en gravedad cero.','🪐'],
 ['olimpo','Monte Olimpo','m','olimpo','Sobre las nubes, entre los dioses.','⛅']
]);
for(const it of AV_ITEMS){if(it.rarity==='mítico'){it.only=true;it.chest=true}}
const AV_BY=Object.fromEntries(AV_ITEMS.map(i=>[i.id,i]));
CATALOG.push(...AV_ITEMS);
if(!IS_WEB)for(const c of AV_ITEMS)CAT_BY_ID[c.id]=c;
CH_DROPS.push(...AV_ITEMS.filter(i=>['raro','épico','legendario','mítico'].includes(i.rarity)));
UNIQ_INV.push('avatar');UNIQ_DEX.push('avatar');
TYPE_NAME.avatar='Avatar';TYPE_W.avatar=1.1;

/* ================= AVATAR · lógica, vista e integración ================= */
(function(){
const KF=(n,fr)=>`@keyframes ${n}{${fr.map(([p,v])=>`${p}{transform:${v}}`).join('')}}`;
const KR=(n,fr)=>KF(n,fr.map(([p,d])=>[p,`rotate(${d}deg)`]))+KF(n+'I',fr.map(([p,d])=>[p,`rotate(${-d}deg)`]));
const A=(sel,name,dur,tf,extra)=>`${sel}{animation:${name} ${dur} ${tf||'ease-in-out'} infinite${extra||''}}`;
const css=`
${KR('av-wave',[['0%,100%',-6],['14%',-114],['28%',-130],['42%',-110],['56%',-130],['70%',-114],['86%',-10]])}
.pt.act-wave .af{animation:av-wave 2.4s ease-in-out infinite}.pt.act-wave .it{animation:av-waveI 2.4s ease-in-out infinite}.pt.act-wave .ey{display:none}.pt.act-wave .eh{display:inline}
${KR('av-thumb',[['0%,100%',-6],['20%,80%',-96]])}
.pt.act-thumbs .af{animation:av-thumb 2.2s ease-in-out infinite}.pt.act-thumbs .it{animation:av-thumbI 2.2s ease-in-out infinite}.pt .thb{display:none}.pt.act-thumbs .thb{display:inline}.pt.act-thumbs .ey{display:none}.pt.act-thumbs .eh{display:inline}
${KR('av-jA',[['0%,100%',-8],['50%',-132]])}${KR('av-jB',[['0%,100%',8],['50%',132]])}${KR('av-jL',[['0%,100%',0],['50%',-16]])}${KR('av-jR',[['0%,100%',0],['50%',16]])}${KF('av-jW',[['0%,100%','translateY(0)'],['50%','translateY(-4px)']])}
.pt.act-jacks .af{animation:av-jA .7s ease-in-out infinite}.pt.act-jacks .it{animation:av-jAI .7s ease-in-out infinite}.pt.act-jacks .ab{animation:av-jB .7s ease-in-out infinite}.pt.act-jacks .lf{animation:av-jL .7s ease-in-out infinite}.pt.act-jacks .lb{animation:av-jR .7s ease-in-out infinite}.pt.act-jacks .wh{animation:av-jW .7s ease-in-out infinite}
${KF('av-pW',[['0%,100%','translateX(-20px) rotate(46deg)'],['50%','translateX(-20px) translateY(-2px) rotate(53deg)']])}${KR('av-pA',[['0%,100%',-32],['50%',-39]])}${KR('av-pB',[['0%,100%',-60],['50%',-67]])}
.pt.act-pushup .wh{animation:av-pW 1.3s ease-in-out infinite}.pt.act-pushup .af{animation:av-pA 1.3s ease-in-out infinite}.pt.act-pushup .it{animation:av-pAI 1.3s ease-in-out infinite}.pt.act-pushup .ab{animation:av-pB 1.3s ease-in-out infinite}.pt.act-pushup .shadow{opacity:0}
${KF('av-dW',[['0%,100%','rotate(-7deg)'],['25%,75%','translateY(-3px)'],['50%','rotate(7deg)']])}${KR('av-dA',[['0%,100%',-128],['50%',-20]])}${KR('av-dB',[['0%,100%',20],['50%',128]])}${KR('av-dL',[['0%,100%',-18],['50%',8]])}${KR('av-dR',[['0%,100%',8],['50%',-18]])}
.pt.act-dance .wh{animation:av-dW .9s ease-in-out infinite}.pt.act-dance .af{animation:av-dA .9s ease-in-out infinite}.pt.act-dance .it{animation:av-dAI .9s ease-in-out infinite}.pt.act-dance .ab{animation:av-dB .9s ease-in-out infinite}.pt.act-dance .lf{animation:av-dL .9s ease-in-out infinite}.pt.act-dance .lb{animation:av-dR .9s ease-in-out infinite}.pt.act-dance .ey{display:none}.pt.act-dance .eh{display:inline}
${KR('av-uA',[['0%,30%,60%,100%',-12],['12%,20%',-96],['72%,82%',-96]])}${KR('av-uB',[['0%,36%,56%,100%',12],['44%,50%',-96]])}${KF('av-uW',[['0%,30%,36%,60%,66%,100%','translateX(0)'],['15%,47%,78%','translateX(1.6px)']])}
.pt.act-punch .af{animation:av-uA 1.1s ease-in-out infinite}.pt.act-punch .it{animation:av-uAI 1.1s ease-in-out infinite}.pt.act-punch .ab{animation:av-uB 1.1s ease-in-out infinite}.pt.act-punch .wh{animation:av-uW 1.1s ease-in-out infinite}
${KR('av-fA',[['0%,100%',-6],['18%,82%',72]])}${KF('av-fH',[['0%,25%,75%,100%','rotate(0)'],['35%,65%','rotate(6deg)']])}
.pt.act-fistchest .af{animation:av-fA 2.6s ease-in-out infinite}.pt.act-fistchest .it{animation:av-fAI 2.6s ease-in-out infinite}.pt.act-fistchest .hd{animation:av-fH 2.6s ease-in-out infinite}
${KF('av-mW',[['0%,100%','translateY(12px)'],['50%','translateY(8px)']])}
.pt.act-meditate .wh{animation:av-mW 3s ease-in-out infinite}.pt.act-meditate .lf,.pt.act-meditate .lb{transform:rotate(-80deg)}.pt.act-meditate .af{transform:rotate(-34deg)}.pt.act-meditate .it{transform:rotate(34deg)}.pt.act-meditate .ab{transform:rotate(-24deg)}.pt.act-meditate .ey,.pt.act-meditate .mn{display:none}.pt.act-meditate .ec,.pt.act-meditate .mo{display:inline}.pt.act-meditate .shadow{transform:scale(.8);transform-origin:32px 82px}
${KR('av-vA',[['0%,100%',-126],['50%',-112]])}${KR('av-vB',[['0%,100%',126],['50%',112]])}${KF('av-vW',[['0%,100%','translateY(0)'],['50%','translateY(-5px)']])}
.pt.act-victory .af{animation:av-vA .7s ease-in-out infinite}.pt.act-victory .it{animation:av-vAI .7s ease-in-out infinite}.pt.act-victory .ab{animation:av-vB .7s ease-in-out infinite}.pt.act-victory .wh{animation:av-vW .7s ease-in-out infinite}.pt.act-victory .ey,.pt.act-victory .mn{display:none}.pt.act-victory .eh,.pt.act-victory .mo{display:inline}
${KR('av-pl',[['0%,100%',18],['50%',-18]])}${KR('av-tl',[['0%,100%',-12],['50%',14]])}${KF('av-hop',[['0%,100%','translateY(0)'],['45%','translateY(-6px)']])}${KF('av-ab',[['0%,100%','translateY(0)'],['50%','translateY(-1px)']])}
.pt .ptl{animation:av-tl .9s ease-in-out infinite}.pt .pw{animation:av-tl .6s ease-in-out infinite}.pt.walk .pl1{animation:av-pl .42s ease-in-out infinite}.pt.walk .pl2{animation:av-pl .42s ease-in-out -.21s infinite}.pt.walk .apet{animation:av-ab .42s ease-in-out infinite}.pt[class*="act-"] .apet{animation:av-hop .55s ease-in-out infinite}
@keyframes av-drip{0%{transform:translateY(0);opacity:0}20%{opacity:1}100%{transform:translateY(9px);opacity:0}}.pt .fxs{animation:av-drip 1.6s ease-in infinite}
@keyframes av-tw{0%,100%{transform:scale(.2) rotate(0);opacity:0}50%{transform:scale(1.15) rotate(45deg);opacity:1}}.pt .fxk{animation:av-tw 1.8s ease-in-out infinite}
@keyframes av-fl{from{transform:scaleY(.82) scaleX(1.04)}to{transform:scaleY(1.14) scaleX(.96)}}.pt .fxf,.pt .flm{animation:av-fl .32s ease-in-out infinite alternate}
@keyframes av-zz{0%,18%,26%,60%,68%,100%{opacity:0}20%,24%,62%,66%{opacity:1}}.pt .fxz{animation:av-zz 1.4s linear infinite}
@keyframes av-rot{to{transform:rotate(360deg)}}.pt .fxo{animation:av-rot 3.6s linear infinite}.pt .fxo2{animation:av-rot 3.6s linear infinite reverse}.pt .fxd{animation:av-rot 40s linear infinite}
@keyframes av-pul{0%,100%{opacity:.75}50%{opacity:1}}.pt .fxa,.pt .gle{animation:av-pul 2.4s ease-in-out infinite}
@keyframes av-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.6px)}}.pt .hl2{animation:av-bob 2.4s ease-in-out infinite}
.pt.semi{filter:drop-shadow(0 0 5px rgba(255,214,102,.8))}
.av-hero{border-radius:var(--radius);overflow:hidden;background:var(--surface);border:1px solid var(--line)}
.av-stage{position:relative;height:310px;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;background:radial-gradient(70% 55% at 50% 78%,color-mix(in oklab,var(--accent) 26%,transparent),transparent 70%),linear-gradient(180deg,var(--surface-3),var(--surface-2))}
.av-scene{position:absolute;inset:0;width:100%;height:100%}
.av-figbtn{position:relative;z-index:1;background:none;border:0;padding:0 0 8px;margin:0;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.av-figbtn .pt{height:282px;width:auto}
.av-say{position:absolute;z-index:2;top:14px;left:50%;transform:translateX(-50%);background:#fffaf0;color:#2b1e35;font:700 14px/1.3 var(--f-body);padding:8px 12px;border-radius:14px;border:2px solid #2b1e35;max-width:78%;width:max-content;text-align:center;box-shadow:0 3px 0 rgba(0,0,0,.25);animation:pop .3s cubic-bezier(.2,1.4,.4,1)}
.av-info{padding:14px 16px 16px;display:flex;flex-direction:column;gap:8px}
.av-info h1{font-size:28px;line-height:1.05;overflow-wrap:anywhere}
.av-bar{height:8px;border-radius:99px;background:var(--surface-3);overflow:hidden}.av-bar span{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent-2));border-radius:99px}
.av-acts{display:grid;grid-template-columns:1fr 1fr;gap:8px}.av-acts .wide{grid-column:1/-1}
.av-slots,.av-opts{display:grid;grid-template-columns:repeat(auto-fill,minmax(98px,1fr));gap:8px}
.av-slot,.av-opt{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:4px;padding:10px 6px 9px;border-radius:14px;background:var(--surface);border:1px solid var(--line);color:var(--fg);font:inherit;cursor:pointer;min-width:0;text-align:center}
.av-slot .ic{font-size:26px;line-height:1.1}.av-slot b,.av-opt b{font-size:12px;font-weight:700;line-height:1.2;overflow-wrap:anywhere}.av-slot small,.av-opt small{font-size:11px;color:var(--fg-3);line-height:1.2;overflow-wrap:anywhere}
.av-slot.has{border-color:color-mix(in oklab,var(--rc) 65%,transparent);background:color-mix(in oklab,var(--rc) 10%,var(--surface))}
.av-slot .n{position:absolute;top:5px;right:7px;font-size:10.5px;color:var(--fg-3)}
.av-opt .pv{height:86px;width:100%;display:grid;place-items:center;overflow:hidden;border-radius:10px;background:radial-gradient(70% 70% at 50% 60%,color-mix(in oklab,var(--rc,#8a93ad) 24%,transparent),transparent)}
.av-opt .pv svg{height:84px;width:auto;max-width:100%}
.av-opt[aria-pressed="true"]{outline:3px solid var(--accent);outline-offset:-1px}
.av-opt .pv .av-scene{position:static;height:84px;width:100%}
.av-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.av-sw{width:36px;height:36px;border-radius:50%;border:2px solid var(--line-2);cursor:pointer;padding:0}
.av-sw[aria-pressed="true"]{outline:3px solid var(--accent);outline-offset:2px}
.av-chip{padding:7px 12px;border-radius:99px;border:1px solid var(--line-2);background:var(--surface);color:var(--fg);font:inherit;font-size:13.5px;cursor:pointer}
.av-chip[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink);border-color:transparent}
.av-lbl{font-size:12.5px;color:var(--fg-3);margin:10px 0 6px;font-weight:600}
.av-evo{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.av-evo .e{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px 8px;border-radius:12px;background:var(--surface);border:1px solid var(--line);min-width:0}
.av-evo .e svg{height:88px;width:auto;max-width:100%}.av-evo .e b{font-size:11.5px;text-align:center;line-height:1.15}.av-evo .e small{font-size:10.5px;color:var(--fg-3);text-align:center}
.av-evo .e.lock svg{filter:brightness(0) opacity(.28)}.av-evo .e.cur{border-color:var(--accent);background:color-mix(in oklab,var(--accent) 12%,var(--surface))}
.av-mini{display:block;height:100%;width:auto}
.av-prev{position:relative;width:100%;height:230px;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;border-radius:16px;background:radial-gradient(60% 60% at 50% 70%,color-mix(in oklab,var(--rc,#8a93ad) 30%,transparent),transparent 72%)}
.av-prev .pt{height:216px;width:auto;position:relative;z-index:1}
.av-prev .av-scene{position:absolute;inset:0}
.av-evo2{display:flex;align-items:flex-end;justify-content:center;gap:10px}.av-evo2 .pt{height:170px;width:auto}.av-evo2 .arr{font-size:26px;align-self:center}
.av-col{display:flex;flex-wrap:wrap;gap:6px}
.av-quote{font-weight:700;font-size:17px;text-align:center;padding:10px 14px;border-radius:14px;background:#fffaf0;color:#2b1e35;border:2px solid #2b1e35;align-self:center}
.pf-avatar{display:flex;gap:12px;align-items:center}.pf-avatar .pt{height:120px;width:auto;flex:none}
.ava-in>.pt.av-face{height:118%;width:auto;margin-top:34%}
@media (prefers-reduced-motion:reduce){.pt .fxo,.pt .fxd,.pt .fxk,.pt .fxs,.pt .fxf,.pt .flm,.pt .fxz,.pt .ptl,.pt .pw{animation:none!important}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
})();

/* ---------- estado y apariencia ---------- */
function ensureAvatar(){if(!S)return null;if(!S.avatar)S.avatar={skin:AV_SKIN[1],eye:AV_EYES[0],hairColor:AV_NAT[0][0],base:'short',eq:{},phrases:[],onScreen:false};const A=S.avatar;A.eq=A.eq||{};A.phrases=A.phrases||[];return A}
function avStage(){return tierOf((S&&S.maxLevel)||0)}
const avIt=rid=>rid?AV_BY[rid]||null:null;
function avOwned(rid){return!!rid&&!!S&&S.inventory.some(i=>i.rid===rid&&i.status==='active')}
function avLook(over,stageOver){const A=ensureAvatar()||{skin:AV_SKIN[1],eye:AV_EYES[0],hairColor:AV_NAT[0][0],base:'short',eq:{}};const eq=Object.assign({},A.eq,over||{});
 const st=PHYS[stageOver!=null?stageOver:avStage()];const v=k=>{const it=avIt(eq[k]);return it?it.v:null};
 const sk=A.skin,hc=v('tinte')||A.hairColor;
 const L={sk,eye:A.eye,toy:1,b:st.b,vsh:st.v,aw:st.aw,lw:st.lw,abs:st.abs,bicep:!!st.bicep,delt:!!st.delt,mood:'smile',semi:!!st.glow};
 const hat=v('cabeza');let style=v('peinado')||A.base||'short';
 if(hat&&hat.cover&&['mohawk','afro','spiky','flame','wild','bun','curly','undercut','mizura'].includes(style))style='short';
 L.hair=[style,hc];
 const beard=v('barba');if(beard)L.beard=[beard,hc];
 if(hat){L.hd=hat.g;if(hat.hb)L.hb=hat.hb}
 const face=v('cara');if(face)L.face=face;
 const torso=v('torso'),armor=v('armadura');L.tu=torso?torso.tu:sk;
 if(armor){L.ar=armor.ar;if(armor.mantle)L.mantle=armor.mantle;if(armor.belt)L.belt=armor.belt;const full=['plate','chain','lamellar','surcoat'].includes(armor.ar[0]);if(!full)L.sleeveLen=torso?torso.sl:0;if(torso&&torso.sleeve)L.sleeve=torso.sleeve}
 else if(torso){L.ar=torso.ar;L.sleeveLen=torso.sl;if(torso.sleeve)L.sleeve=torso.sleeve;if(torso.stripe)L.sleeveStripe=torso.stripe}
 else L.ar=['bare'];
 const pants=v('piernas');if(pants){L.skirt=pants.skirt;if(pants.leg)L.leg=pants.leg;if(pants.legC)L.legC=pants.legC}else L.skirt=['leaf','#4f9d3a'];
 L.shoe=v('pies')||['bare'];
 const cape=v('capa');if(cape){L.cape=cape.c;if(cape.x)L.capeX=capeX(cape.x)}
 const w=v('arma');if(w)L.it=w;const m=v('mano');if(m){if(m.sh)L.sh=m.sh;else if(m.it2)L.it2=m.it2}
 const n=v('cuello');if(n)L.acc=[n];
 const ta=v('tatA');if(ta)L.tatA=ta;const tc=v('tatC');if(tc)L.tatC=tc;
 const pet=v('mascota');if(pet)L.pet=pet;const fx=v('efecto');if(fx)L.fx=fx;
 return L}
function avAct(over){const A=ensureAvatar();const rid=over&&over.gesto!==undefined?over.gesto:A&&A.eq.gesto;const it=avIt(rid);return it?it.v:AV_GEST_FREE}
function avPhrases(){const A=ensureAvatar();const l=(A?A.phrases:[]).map(avIt).filter(Boolean).map(i=>i.v);return l.length?l:['¡Vamos!','Una más y listo.','Hoy toca empujar.']}
function avatarSVG(o){o=o||{};const look=o.look||avLook(o.over,o.stage);const p={id:'avatar',look,act:o.act||avAct(o.over)};
 const vb=o.vb||(look.pet?'-30 -12 94 '+(o.base?106:96):'0 -12 64 '+(o.base?106:96));
 return`<svg class="${petClass(p)} ${o.cls||''}" viewBox="${vb}" aria-hidden="true">${o.base?AV_BASE:''}${chibiSVG(p)}</svg>`}
const _petClass=petClass;petClass=function(p){const L=p.look||{};return _petClass(p)+(L.semi?' semi':'')};
function avNick(){return(typeof nickOf==='function'&&nickOf())||'Tu avatar'}
function avPet(){const st=PHYS[avStage()];return{id:'avatar',type:'avatar',name:avNick(),rarity:'común',act:avAct(),look:avLook(),say:avPhrases(),glow:st.glow?'rgba(255,214,102,.75)':null}}
function avKey(){const A=ensureAvatar();return JSON.stringify([A.eq,A.skin,A.eye,A.hairColor,A.base,A.phrases,avStage()])}
const AV_VB={peinado:'2 -12 60 60',tinte:'2 -12 60 60',barba:'4 6 56 48',cabeza:'0 -14 64 64',cara:'8 12 50 38',torso:'8 34 48 38',armadura:'8 34 48 38',cuello:'12 36 40 26',tatA:'26 40 30 30',tatC:'14 38 36 26',piernas:'12 52 40 32',pies:'14 66 36 18',mascota:'-30 52 34 32'};

/* ---------- vista Avatar ---------- */
function avEquipped(slot){const A=ensureAvatar();if(slot==='frase')return A.phrases.map(avIt).filter(Boolean);const it=avIt(A.eq[slot]);return it&&avOwned(it.id)?[it]:[]}
function avOwnedOf(slot){const seen=new Set();return S.inventory.filter(i=>i.status==='active'&&i.type==='avatar').map(i=>avIt(i.rid)).filter(c=>c&&c.slot===slot&&!seen.has(c.id)&&seen.add(c.id)).sort((a,b)=>RARITIES.indexOf(b.rarity)-RARITIES.indexOf(a.rarity))}
function avNextPhys(){const s=avStage();if(s>=7)return null;const lvl=s>=6?MAXL:(s+1)*3;return{lvl,need:Math.max(0,THRESH[lvl]-D.total),pct:clamp((D.total-THRESH[s*3])/(THRESH[lvl]-THRESH[s*3])*100,0,100)}}
function vAvatar(){ensureAvatar();compute();const A=S.avatar;const s=avStage();const ph=PHYS[s];const nx=avNextPhys();
 const scene=avIt(A.eq.escenario)&&avOwned(A.eq.escenario)?avIt(A.eq.escenario).v:null;
 const got=S.inventory.filter(i=>i.status==='active'&&i.type==='avatar');const gotIds=new Set(got.map(i=>i.rid));
 const slotBtn=([k,l,ic])=>{const eq=avEquipped(k);const own=avOwnedOf(k).length;const it=eq[0];
  return`<button class="av-slot ${it?'has bd-'+RK[it.rarity]:''}" data-act="av-slot" data-slot="${k}"><span class="n num">${own}</span><span class="ic">${esc(it?it.icon:ic)}</span><b>${esc(l)}</b><small>${k==='frase'?(eq.length?eq.length+' elegida'+(eq.length>1?'s':''):'Ninguna'):it?esc(it.name):k==='gesto'?'Saludar':'Nada'}</small></button>`};
 const evo=PHYS.map((p,i)=>`<div class="e ${i===s?'cur':''} ${i>s?'lock':''}">${avatarSVG({look:Object.assign(avLook({peinado:null,tinte:null,barba:null,cabeza:null,cara:null,torso:null,armadura:null,piernas:null,pies:null,capa:null,arma:null,mano:null,cuello:null,tatA:null,tatC:null,mascota:null,efecto:null},i)),act:'x',cls:'idle'})}<b>${esc(p.n)}</b><small>${esc(i>=7?'Leyenda':TIERS[i].name)}</small></div>`).join('');
 const sw=(k,list)=>list.map(c=>`<button class="av-sw" style="background:${c}" data-act="av-base" data-k="${k}" data-v="${c}" aria-pressed="${A[k]===c}" aria-label="Color"></button>`).join('');
 const col=AV_SLOTS.map(([k,l])=>{const all=AV_ITEMS.filter(c=>c.slot===k);const n=all.filter(c=>gotIds.has(c.id)).length;return`<span class="chip num">${esc(l)} ${n}/${all.length}</span>`}).join('');
 return`<section class="av-hero">
  <div class="av-stage">${scene?sceneSVG(scene):''}<button class="av-figbtn" data-act="av-tap" aria-label="Tocar a tu avatar">${avatarSVG({base:1,cls:'idle'})}</button><div class="av-say" id="av-say" hidden></div></div>
  <div class="av-info"><div class="eyebrow">Figura de colección</div><h1 class="display">${esc(avNick())}</h1>
   <div class="row" style="gap:6px"><span class="chip">Físico: ${esc(ph.n)} · ${s+1}/8</span><span class="chip">${esc(levelName(S.maxLevel||0))}</span></div>
   <p class="muted">${esc(ph.d)}</p>
   ${nx?`<div class="av-bar"><span style="width:${nx.pct.toFixed(1)}%"></span></div><small class="faint num">${nx.need?`Faltan ${fmt(nx.need)} PP para evolucionar a ${esc(PHYS[s+1].n)} (${esc(levelName(nx.lvl))})`:`Sube a ${esc(levelName(nx.lvl))} para evolucionar a ${esc(PHYS[s+1].n)}`}</small>`:'<small class="faint">Llegaste a la forma final.</small>'}
   <div class="av-acts" style="margin-top:6px"><button class="btn ghost" data-act="av-tap">Hacer gesto</button><button class="btn ghost" data-act="av-talk">Hablar</button><button class="btn wide ${A.onScreen?'ghost':''}" data-act="av-screen">${A.onScreen?'Sacar de la pantalla':'Llevar en pantalla'}</button></div>
  </div></section>
 <section class="sec"><div class="sec-head"><h2 class="sec-title">Equipamiento</h2><span class="sec-note num">${gotIds.size}/${AV_ITEMS.length} piezas</span></div><div class="av-slots">${AV_SLOTS.map(slotBtn).join('')}</div>
  <p class="sec-note" style="margin-top:8px">Las piezas salen en misiones, objetivos, ascensos, cofres, rachas y la semana de constancia. Cada vez que subes de nivel ganas una pieza segura.</p></section>
 <section class="sec"><div class="sec-head"><h2 class="sec-title">Apariencia</h2><span class="sec-note">Gratis, cuando quieras</span></div><div class="card">
  <div class="av-lbl" style="margin-top:0">Piel</div><div class="av-row">${sw('skin',AV_SKIN)}</div>
  <div class="av-lbl">Ojos</div><div class="av-row">${sw('eye',AV_EYES)}</div>
  <div class="av-lbl">Pelo natural</div><div class="av-row">${AV_NAT.map(([c,n])=>`<button class="av-sw" style="background:${c}" data-act="av-base" data-k="hairColor" data-v="${c}" aria-pressed="${A.hairColor===c}" aria-label="${esc(n)}"></button>`).join('')}</div>
  <div class="av-lbl">Corte base</div><div class="av-row">${AV_BASECUT.map(([k,n])=>`<button class="av-chip" data-act="av-base" data-k="base" data-v="${k}" aria-pressed="${A.base===k}">${n}</button>`).join('')}</div>
  ${A.eq.tinte||A.eq.peinado?'<p class="sec-note" style="margin-top:8px">Tienes un peinado o tinte equipado: se ve por encima de tu pelo natural.</p>':''}
 </div></section>
 <section class="sec"><div class="sec-head"><h2 class="sec-title">Evolución del físico</h2><span class="sec-note">Cambia con tu rango</span></div><div class="av-evo">${evo}</div></section>
 <section class="sec"><div class="sec-head"><h2 class="sec-title">Colección</h2></div><div class="av-col">${col}</div></section>`}

/* ---------- hojas ---------- */
function avPrev(slot,rid,cls){const it=avIt(rid);if(slot==='escenario'&&it)return sceneSVG(it.v);if(slot==='frase'&&it)return`<span style="font-size:30px">💬</span>`;
 const over={[slot]:rid||null};const look=avLook(over);const vb=AV_VB[slot]||(look.pet?'-30 -12 94 96':'0 -12 64 96');
 return avatarSVG({look,act:slot==='gesto'?(it?it.v:AV_GEST_FREE):'x',vb,cls:(slot==='gesto'?'act-'+(it?it.v:AV_GEST_FREE):'idle')+' '+(cls||'')})}
function avSlotSheet(slot){ensureAvatar();const A=S.avatar;const name=AV_SLOT_NAME[slot];const own=avOwnedOf(slot);const all=AV_ITEMS.filter(c=>c.slot===slot);
 const top=slot==='escenario'?`<div class="av-prev">${avIt(A.eq.escenario)?sceneSVG(avIt(A.eq.escenario).v):''}${avatarSVG({base:1,cls:'idle'})}</div>`:`<div class="av-prev">${avatarSVG({base:1,cls:slot==='gesto'?'act-'+avAct():'idle'})}</div>`;
 let opts='';
 if(slot==='frase'){opts=own.map(c=>{const on=A.phrases.includes(c.id);return`<button class="av-opt bd-${RK[c.rarity]}" data-act="av-phr" data-rid="${c.id}" aria-pressed="${on}"><b>«${esc(c.v)}»</b><small class="rar rar-${RK[c.rarity]}">${esc(c.rarity)}</small>${on?'<span class="st st-good">Elegida</span>':''}</button>`}).join('')}
 else{const cur=A.eq[slot]||null;const none=slot==='gesto'?'Saludar':'Nada';
  opts=`<button class="av-opt" data-act="av-pick" data-slot="${slot}" data-rid="" aria-pressed="${!cur}"><span class="pv">${slot==='escenario'?'<span style="font-size:28px">🌫️</span>':avPrev(slot,null)}</span><b>${none}</b></button>`+own.map(c=>`<button class="av-opt bd-${RK[c.rarity]}" data-act="av-pick" data-slot="${slot}" data-rid="${c.id}" aria-pressed="${cur===c.id}"><span class="pv">${avPrev(slot,c.id)}</span><b>${esc(c.name)}</b><small class="rar rar-${RK[c.rarity]}">${esc(c.rarity)}</small></button>`).join('')}
 setSheet(`<h3>${esc(name)}</h3>${top}${slot==='frase'?'<p class="sec-note">Elige hasta 3. Tu avatar las dice cuando lo tocas o cuando camina por la pantalla.</p>':''}<div class="av-opts">${opts||''}</div>${own.length?'':`<div class="empty">Todavía no tienes piezas de ${esc(name.toLowerCase())}. Hay ${all.length} por descubrir.</div>`}<p class="faint" style="font-size:12.5px;text-align:center">Tienes ${own.length} de ${all.length}</p>`);
}
function avItemSheet(i){const c=avIt(i.rid);if(!c)return;const A=ensureAvatar();const on=c.slot==='frase'?A.phrases.includes(c.id):A.eq[c.slot]===c.id;
 openSheet(`<div class="reveal bd-${RK[c.rarity]}" style="padding:0">${avRevealStage(c)}<h3>${esc(c.slot==='frase'?'Frase para tu avatar':c.name)}</h3><div class="row" style="justify-content:center">${rarChip(c.rarity)}<span class="chip">Avatar · ${esc(AV_SLOT_NAME[c.slot])}</span>${on?'<span class="st st-good">Equipado</span>':''}</div></div><p class="muted" style="text-align:center">${esc(c.slot==='frase'?'':c.desc)}</p><p class="faint" style="font-size:13px;text-align:center">Obtenido el ${niceDate(i.got)} · ${esc(i.source||'')}</p><button class="btn ${on?'ghost':''} block" data-act="av-eq" data-rid="${c.id}" data-ctx="inv">${on?'Quitar':'Equipar en mi avatar'}</button><button class="btn ghost block" data-act="av-go">Ir al avatar</button>`)}
function avRevealStage(c){if(c.slot==='frase')return`<div class="av-prev" style="flex-direction:column;align-items:center;justify-content:flex-end;gap:6px"><p class="av-quote">«${esc(c.v)}»</p>${avatarSVG({cls:'act-wave',act:'wave'}).replace('<svg ','<svg style="height:150px;width:auto" ')}</div>`;
 const over={[c.slot]:c.id};const act=c.slot==='gesto'?c.v:c.slot==='arma'?'swing':'x';
 return`<div class="av-prev">${c.slot==='escenario'?sceneSVG(c.v):''}${avatarSVG({over,base:1,act,cls:act==='x'?'idle':'act-'+act})}</div>`}
function avRevealHTML(r,x){const c=avIt(r.rid);const src=x&&(x.title||r.source)||'Recompensa';
 return`<div class="reveal bd-${RK[c.rarity]}"><div class="eyebrow">${esc(src)}</div>${avRevealStage(c)}<h3>${esc(c.slot==='frase'?'Nueva frase':c.name)}</h3><div class="row" style="justify-content:center">${rarChip(c.rarity)}<span class="chip">Avatar · ${esc(AV_SLOT_NAME[c.slot])}</span></div>${r.cursed?'<p class="st st-serious">La maldición rebajó esta recompensa un nivel.</p>':''}<p class="muted">${esc(c.slot==='frase'?'Tu avatar ya puede decirla.':c.desc)}</p></div><div class="row"><button class="btn ghost grow" data-act="close">Guardar</button><button class="btn grow" data-act="av-eq" data-rid="${c.id}" data-ctx="rev">Equipar</button></div>`}
function avEvoHTML(r){const a=PHYS[r.from],b=PHYS[r.stage];const nake={peinado:null,cabeza:null,torso:null,armadura:null,piernas:null,pies:null,capa:null,arma:null,mano:null,efecto:null,mascota:null,cara:null,cuello:null};
 return`<div class="reveal bd-e"><div class="eyebrow">Tu avatar evolucionó</div><div class="av-evo2">${avatarSVG({over:nake,stage:r.from,cls:'idle',act:'x'})}<span class="arr">➜</span>${avatarSVG({over:nake,stage:r.stage,cls:'act-flex',act:'flex'})}</div><h3>${esc(b.n)}</h3><p class="muted">${esc(a.n)} → ${esc(b.n)}. ${esc(b.d)}</p></div><div class="row"><button class="btn ghost grow" data-act="close">Seguir</button><button class="btn grow" data-act="av-go">Ver mi avatar</button></div>`}
function avWelcomeHTML(x){const items=x.items||[];
 return`<div class="reveal bd-r"><div class="eyebrow">Nueva pestaña: Avatar</div><div class="av-prev">${avatarSVG({base:1,cls:'act-wave'})}</div><h3>Tu avatar llegó a la liga</h3><p class="muted">Parte con una hojita y se pone más fuerte con cada rango. Gana ropa, armas, peinados, tatuajes, mascotas y más en misiones, objetivos, ascensos y cofres.</p>${items.length?`<div class="eyebrow" style="margin-top:6px">Regalo por tus ascensos anteriores</div><div class="ch-sum">${items.map(r=>`<div class="t bd-${RK[r.rarity]||'c'}"><span class="icon bd-${RK[r.rarity]||'c'}">${esc(r.icon||'✨')}</span><b>${esc(r.name)}</b><small class="rar rar-${RK[r.rarity]||'c'}">${esc(r.rarity||'')}</small></div>`).join('')}</div>`:''}</div><div class="row"><button class="btn ghost grow" data-act="close">Después</button><button class="btn grow" data-act="av-go">Ver mi avatar</button></div>`}
function avDexSheet(c){const k=S.pokedex[c.id];const no='#'+String(CATALOG.indexOf(c)+1).padStart(3,'0');
 const stage=c.slot==='frase'?`<p class="av-quote">${k?'«'+esc(c.v)+'»':'«…»'}</p>`:`<div class="av-prev" ${k?'':'style="filter:brightness(0) opacity(.5)"'}>${avRevealStage(c).replace(/^<div class="av-prev">|<\/div>$/g,'')}</div>`;
 const where=c.only?'Exclusivo de cofres legendarios y míticos.':`Sale en misiones, objetivos, ascensos${['raro','épico','legendario'].includes(c.rarity)?' y cofres':''}.`;
 openSheet(`<div class="reveal bd-${RK[c.rarity]}">${stage}<div class="eyebrow">${no} · Avatar · ${esc(AV_SLOT_NAME[c.slot])}</div><h3>${k?esc(c.slot==='frase'?'Frase':c.name):'???'}</h3><div class="row" style="justify-content:center">${rarChip(c.rarity)}</div><p class="muted">${esc(k?(c.slot==='frase'?'':c.desc):where)}</p>${k?`<p class="faint num" style="font-size:13px">Primera vez: ${longDate(k.first)}</p>`:''}</div>`)}
function avSayAt(text){const b=document.getElementById('av-say');if(!b)return;b.textContent=text||rnd(avPhrases());b.hidden=false;clearTimeout(b._t);b._t=setTimeout(()=>{b.hidden=true},2800)}
function avPlay(){const svg=document.querySelector('.av-figbtn svg');if(!svg)return;const act=avAct();svg.setAttribute('class',svg.getAttribute('class').replace(/\b(idle|act-[a-z0-9]+)\b/g,'').trim()+' act-'+act);clearTimeout(svg._t);svg._t=setTimeout(()=>{svg.setAttribute('class',svg.getAttribute('class').replace(/\bact-[a-z0-9]+\b/g,'').trim()+' idle')},3600)}
function avEquip(rid,toggle){const c=avIt(rid);if(!c||!avOwned(rid))return false;const A=ensureAvatar();
 if(c.slot==='frase'){if(A.phrases.includes(rid))A.phrases=A.phrases.filter(x=>x!==rid);else{A.phrases.push(rid);if(A.phrases.length>3)A.phrases.shift()}}
 else A.eq[c.slot]=toggle&&A.eq[c.slot]===rid?null:rid;
 persist();render();return true}

/* ---------- integración con el juego ---------- */
const _ppOptions=ppOptions;
ppOptions=function(tab){const h=_ppOptions(tab);if(tab!=='icono')return h;const E=S.equip||{};
 return`<button class="pp-opt ${E.avatar==='me'?'on':''} bd-c" data-act="pp-set" data-slot="avatar" data-v="me" aria-pressed="${E.avatar==='me'}"><span class="pp-prev"><span class="ava" style="--sz:44px"><span class="ava-in">${avatarSVG({cls:'av-face idle',act:'x'})}</span></span></span><small>Mi avatar</small></button>`+h};
const _avatarHTML=avatarHTML;
avatarHTML=function(size){const E=(S&&S.equip)||{};if(E.avatar!=='me')return _avatarHTML(size);
 return`<div class="ava${E.aura?' au-'+E.aura.slice(3):''}" style="--sz:${size}px">${E.marco?frameSVG(E.marco):''}<div class="ava-in bd-c">${avatarSVG({cls:'av-face idle',act:'x'})}</div></div>`};
const _pick=pickChestItem;
pickChestItem=function(rar,taken){const pool=[];for(const c of CH_DROPS){if(c.rarity!==rar)continue;if(UNIQ_DEX.includes(c.type)&&(S.pokedex[c.id]||taken.has(c.id)))continue;pool.push({c,w:c.type==='companero'?1.6:c.type==='item'?1.5:c.type==='avatar'?.32:1})}
 if(!pool.length)return _pick(rar,taken);return wpick(Math.random,pool,p=>p.w).c};
(function(){
 const _checkRank=checkRank;
 checkRank=function(){const before=S.maxLevel;const cel=_checkRank();
  if(cel&&cel.level>before){ensureAvatar();for(let i=before+1;i<=cel.level;i++)cel.reveals.push(grantReward(DIV_RAR[tierOf(i)],'Ascenso a '+levelName(i),'avatar'));
   const a=tierOf(before),b=tierOf(cel.level);if(b>a)cel.reveals.unshift({rid:'avevo',type:'avevo',name:'Evolución',rarity:'épico',from:a,stage:b})}
  return cel};
 const _startGame=startGame;
 startGame=function(){const r=_startGame.apply(this,arguments);try{if(S&&!S.avatar){ensureAvatar();const items=[];const n=Math.min(S.maxLevel||0,12);for(let i=1;i<=n;i++)items.push(grantReward(DIV_RAR[tierOf(i)],'Regalo del avatar','avatar'));persist();queueReveals([{kind:'avwelcome',items}])}}catch(e){console.error(e)}return r};
 const _nextReveal=nextReveal;
 nextReveal=function(){if(!$('#sheet').hidden||!UI.reveals.length)return _nextReveal();const x=UI.reveals[0];const r=x&&x.reward;
  if(x&&x.kind==='avwelcome'){UI.reveals.shift();openSheet(avWelcomeHTML(x));fxBurst(true);return}
  if(r&&r.type==='avevo'){UI.reveals.shift();openSheet(avEvoHTML(r));fxBurst(true);return}
  if(r&&r.type==='avatar'&&avIt(r.rid)){UI.reveals.shift();openSheet(avRevealHTML(r,x));fxBurst(RARITIES.indexOf(r.rarity)>=3);return}
  return _nextReveal()};
 const _invCard=invCard;
 invCard=function(i){let h=_invCard(i);if(i.type!=='avatar')return h;const c=avIt(i.rid);if(!c)return h;const A=ensureAvatar();const on=c.slot==='frase'?A.phrases.includes(c.id):A.eq[c.slot]===c.id;
  h=h.replace('<small>Avatar</small>',`<small>Avatar · ${esc(AV_SLOT_NAME[c.slot])}</small>`);if(c.slot==='frase')h=h.replace(`<b>${esc(c.name)}</b>`,`<b>«${esc(c.name)}»</b>`);if(on&&i.status==='active')h=h.replace(/<\/span><\/button>$/,'<span class="st st-good">Equipado</span></span></button>');return h};
 const _invSheet=invSheet;
 invSheet=function(iid){const i=S.inventory.find(x=>x.iid===iid);if(i&&i.type==='avatar')return avItemSheet(i);return _invSheet(iid)};
 const _dexSheet=dexSheet;
 dexSheet=function(rid){const c=avIt(rid);if(c)return avDexSheet(c);return _dexSheet(rid)};
 const _vInv=VIEWS.inventario;
 VIEWS.inventario=function(){const h=_vInv();const list=S.inventory.filter(i=>i.status==='active'&&i.type==='avatar').sort((a,b)=>(b.got||'').localeCompare(a.got||''));
  const sec=`<section class="sec"><div class="sec-head"><h2 class="sec-title">Avatar</h2><button class="btn ghost sm" data-act="av-go">Vestir avatar</button></div>${list.length?`<div class="inv">${list.slice(0,12).map(invCard).join('')}</div>${list.length>12?`<p class="sec-note" style="margin-top:6px">Y ${list.length-12} más en la pestaña Avatar.</p>`:''}`:'<div class="empty">Todavía no tienes piezas para tu avatar. Salen en todas partes.</div>'}</section>`;
  const k='<section class="sec"><div class="sec-head"><h2 class="sec-title">Personalización</h2>';return h.includes(k)?h.replace(k,sec+k):sec+h};
 const _vDex=VIEWS.pokedex;
 VIEWS.pokedex=function(){const h=_vDex();if(UI.pokeF!=='avatar')return h;
  const grid=AV_SLOTS.map(([k,l])=>{const list=AV_ITEMS.filter(c=>c.slot===k);const got=list.filter(c=>S.pokedex[c.id]).length;return`<div class="dex-group"><div class="sec-head"><h3 class="dex-gt">${esc(l)}</h3><span class="sec-note num">${got}/${list.length}</span></div><div class="dex-grid">${list.map(c=>{const kk=!!S.pokedex[c.id];const no='#'+String(CATALOG.indexOf(c)+1).padStart(3,'0');return`<button class="dex ${kk?'':'unk'} bd-${RK[c.rarity]}" data-act="dex" data-rid="${c.id}"><span class="no">${no}</span>${c.only?'<span class="cnt" title="Exclusivo de cofres">🧰</span>':''}${icon(kk?c:{icon:c.icon,rarity:c.rarity})}<b>${kk?esc(c.slot==='frase'?'«'+c.name+'»':c.name):'???'}</b><small class="rar rar-${RK[c.rarity]}">${esc(c.rarity)}</small></button>`}).join('')}</div></div>`}).join('');
  return h.replace(/<div class="dex-grid">[\s\S]*<\/div><\/section>\s*$/,`<p class="sec-note">Organizadas por parte del cuerpo. Las míticas (🧰) salen solo en cofres.</p>${grid}</section>`)};
 const _vPf=VIEWS.perfil;
 VIEWS.perfil=function(){const h=_vPf();ensureAvatar();const card=`<section class="sec"><div class="card pf-avatar">${avatarSVG({cls:'idle'})}<div style="min-width:0"><div class="eyebrow">Avatar</div><b class="display" style="font-size:20px">${esc(PHYS[avStage()].n)}</b><p class="muted" style="font-size:13.5px">${S.inventory.filter(i=>i.status==='active'&&i.type==='avatar').length} piezas en tu colección</p><button class="btn sm" style="margin-top:8px" data-act="av-go">Vestir avatar</button></div></div></section>`;
  return h.replace('<div class="kpis">',card+'<div class="kpis">')};
 syncPets=function(){
  const A=S&&S.avatar;const onA=!!(A&&A.onScreen);if(onA)PET_BY.avatar=avPet();
  const want=((S&&S.equip&&S.equip.pets)||[]).filter(id=>PET_BY[id]&&owned(id)).slice(0,2);if(onA)want.unshift('avatar');let layer=document.getElementById('pets');
  if(!want.length){if(layer)layer.remove();PETS_RT.list=[];PETS_RT.key='';document.body.classList.remove('has-pets');if(PETS_RT.raf){cancelAnimationFrame(PETS_RT.raf);PETS_RT.raf=0}return}
  if(!layer){layer=document.createElement('div');layer.id='pets';document.body.appendChild(layer);PETS_RT.key=''}
  document.body.classList.add('has-pets');const key=want.join(',')+(onA?'|'+avKey():'');if(key===PETS_RT.key)return;PETS_RT.key=key;
  const keep=PETS_RT.list.filter(q=>want.includes(q.id));for(const q of PETS_RT.list)if(!keep.includes(q))q.el.remove();
  PETS_RT.list=want.map((id,i)=>keep.find(q=>q.id===id)||(()=>{const q=mkPet(id,i);layer.appendChild(q.el);return q})());
  const qa=PETS_RT.list.find(q=>q.id==='avatar');if(qa&&qa.p!==PET_BY.avatar){qa.p=PET_BY.avatar;const n=document.createElement('div');n.innerHTML=petSVG(qa.p,qa.cls||'idle');qa.el.replaceChild(n.firstElementChild,qa.svg);qa.svg=qa.el.firstElementChild;qa.cls=null;setPose(qa,'idle');if(qa.p.glow)qa.el.style.setProperty('--gl',qa.p.glow);else qa.el.style.removeProperty('--gl')}
  if(RM){for(const q of PETS_RT.list){q.y=innerHeight-6;setPose(q,'idle');q.el.style.transform=`translate(${(q.x-28).toFixed(0)}px,${(q.y-q.h).toFixed(0)}px)`}return}
  if(!PETS_RT.raf){PETS_RT.last=performance.now();PETS_RT.raf=requestAnimationFrame(petLoop)}};
 TABS.splice(Math.max(0,TABS.findIndex(t=>t[0]==='perfil'))+1,0,['avatar','Avatar']);VIEWS.avatar=vAvatar;VALID.add('avatar');
})();
document.addEventListener('click',ev=>{const b=ev.target.closest('[data-act]');if(!b)return;
 switch(b.dataset.act){
  case'av-go':closeSheetSilent();go('avatar');break;
  case'av-tap':avPlay();avSayAt();break;
  case'av-talk':avSayAt();break;
  case'av-screen':{const A=ensureAvatar();A.onScreen=!A.onScreen;persist();render();toast(A.onScreen?'Tu avatar salió a pasear por la pantalla.':'Tu avatar volvió a su pestaña.','good');break}
  case'av-slot':avSlotSheet(b.dataset.slot);break;
  case'av-pick':{const A=ensureAvatar();const slot=b.dataset.slot;const rid=b.dataset.rid||null;if(rid&&!avOwned(rid))return;A.eq[slot]=rid;persist();render();avSlotSheet(slot);break}
  case'av-phr':{avEquip(b.dataset.rid,true);avSlotSheet('frase');break}
  case'av-base':{const A=ensureAvatar();A[b.dataset.k]=b.dataset.v;persist();render();break}
  case'av-eq':{const c=avIt(b.dataset.rid);if(!c)return;const toggle=b.dataset.ctx==='inv';avEquip(c.id,toggle);toast(c.slot==='frase'?'Frase actualizada.':'Avatar actualizado.','good');if(b.dataset.ctx==='rev')closeSheet();else{const i=S.inventory.find(x=>x.rid===c.id&&x.status==='active');if(i)avItemSheet(i)}break}
 }
});

boot();
