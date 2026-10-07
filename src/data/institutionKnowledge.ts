/**
 * Base de Conocimiento Oficial y Verificada del Instituto Nacional Cantón Lourdes (INDEL)
 * Obtenida directamente de la Normativa Institucional (19 páginas oficiales).
 */

export interface NormativeSection {
  id: string;
  documentTitle: string;
  subtitle: string;
  category: 'estudiantes' | 'familias' | 'docentes' | 'administrativo' | 'institucional';
  content: string;
}

export const INSTITUTION_INFO = {
  name: 'Instituto Nacional Cantón Lourdes',
  acronym: 'INDEL',
  address: '6 ª. Avenida Sur Colonia Las Arboledas, Lourdes Colón',
  email: 'indel_11028@hotmail.com',
  phone: '2338-4571',
  attentionSchedule: '7:00 am a 12:00 m y 1:00 pm a 4:00 pm',
  morningShift: {
    entry: '7:00 am (ingreso obligatorio 15 minutos antes: 6:45 am)',
    exit: '12:00 pm',
    recesses: [
      { number: '1° Recreo', time: '8:20 am' },
      { number: '2° Recreo', time: '10:15 am' },
    ],
  },
  afternoonShift: {
    entry: '1:00 pm (ingreso obligatorio 15 minutos antes: 12:45 pm)',
    exit: '5:15 pm o 6:00 pm (según el horario y especialidad de cada sección)',
    recesses: [
      { number: '1° Recreo', time: '2:30 pm' },
      { number: '2° Recreo', time: '4:15 pm' },
    ],
  },
};

export const OFFICIAL_CONTEXT = `
INSTITUTO NACIONAL CANTON LOURDES (INDEL)
Dirección: 6 ª. Avenida Sur Colonia Las Arboledas, Lourdes Colón.
Correo electrónico: indel_11028@hotmail.com
Teléfono: 2338-4571
Horario de atención a consultas docentes y familiares: 7:00 am a 12:00 m y 1:00 pm a 4:00 pm.

HORARIOS Y JORNADAS ESCOLARES ESTÁNDAR (ENTRADAS, SALIDAS Y RECREOS):
• Jornada Matutina:
  - Entrada: 7:00 am (con ingreso obligatorio 15 minutos antes del toque, es decir a las 6:45 am).
  - Recreos (2 en la mañana):
    * 1° Recreo: 8:20 am.
    * 2° Recreo: 10:15 am.
  - Salida: 12:00 pm (mediodía).
• Jornada Vespertina:
  - Entrada: 1:00 pm (con ingreso obligatorio 15 minutos antes del toque, es decir a las 12:45 pm).
  - Recreos (2 en la tarde):
    * 1° Recreo: 2:30 pm.
    * 2° Recreo: 4:15 pm.
  - Salida: 5:15 pm o 6:00 pm (puede variar según el horario o especialidad de cada grupo, siendo este el estándar institucional).
• Regla de puntualidad, recreos y salida:
  - Es deber obligatorio presentarse 15 minutos antes del toque de entrada.
  - La impuntualidad al ingreso es falta leve (numeral 1).
  - Durante el recreo/receso sigue prohibido el uso de celular y audífonos (falta leve, numeral 16).
  - Retirarse de la institución sin autorización o con un grado que no le corresponde es falta leve (numeral 26).
  - Los padres deben conocer los horarios de entrada, salida, sección y docente coordinador de sus hijos.

============================================================
DOCUMENTO 1: NORMATIVA PARA ESTUDIANTES
============================================================
DERECHOS:
1. Ser tratado con respeto.
2. Garantizar su desarrollo integral.
3. Participar en los diferentes clubes de la institución.
4. A recibir educación de forma gratuita.

DEBERES U OBLIGACIONES:
1. Ingreso a la institución 15 minutos antes del toque en jornada matutina y vespertina.
2. Portar Uniforme diario. NO MODIFICARLO.
3. USO DE CALCETAS BLANCAS EN SRITAS, NO PUNTERAS.
4. USO DE CALCETINES NEGROS EN JÓVENES, NO PUNTERAS.
5. Uso de zapatos negros limpios y lustrados.
6. Cincho negro de cuero, hebilla con pasador.
7. Uso de monograma cosido en bolsa izquierda.
8. Portar Identificador por especialidad.
9. USO DE UNIFORME DEPORTIVO, permitido únicamente el día que corresponde educación física. (Pants color azul, camisa blanca (No estampadas). Se contratará proveedor).
10. Portar tenis limpios, sin cintas XL. Estos deberán utilizarse únicamente el día correspondiente a la clase de Educación Física.
11. Corte de cabello francesa oscura para varones (no cortes de moda).
12. Cejas sin CORTE y sin tatuaje en señoritas y jóvenes.
13. Presentarse sin Vello facial (Barba y Bigote).
14. Uso de aretes pequeños.
15. Uñas en señoritas sin colores, solo brillo.
16. No usar uñas acrílicas señoritas.
17. Uso de uñas largas en jóvenes no permitido.
18. Uso de aretes caballeros no permitido.
19. No permitido el uso de maquillaje en señoritas y jóvenes.
20. Cabello tinturado señoritas y jóvenes no permitido.
21. No está permitido el uso CELULAR, audífonos en horas de clases, recesos y horas libres no es permitido. Excepto asignaturas que lo requieran.
22. Respetar el toque de entrada a salón de clases.
23. Evitar masticar chicle dentro de la institución.
24. No usar accesorios personales, tales como collares, cadenas, piercing y similares.
25. Portar kit de limpieza personal.
26. Aseo personal diario (baño, desodorante).
27. Uso de gabacha LIMPIA, debe permanecer debidamente doblada y ordenada dentro del bolsón. Uso exclusivo para taller y actividades extracurriculares de la institución.
28. Mantener el orden y limpieza en la zona de taller.
29. Es de uso obligatorio portar los recursos tecnológicos necesarios, tales como USB, calculadora, laptop, cargador para laptop, entre otros, según lo requiera cada módulo o asignatura.
30. Cumplir con el horario establecido para la limpieza del aula durante el recreo y a la hora de salida.
31. Portar bolsón y estuche TRANSPARENTE. NO DE COLOR.

NOTA IMPORTANTE:
1. Todo estudiante que quiera pertenecer a actividades extracurriculares sea deportiva o artística debe cumplir con todos los deberes antes mencionados.
2. Pasar todas materias y módulos en cada uno de los periodos correspondientes, de lo contrario se suspenderá participación hasta nivelar procesos académicos pendientes.

CLASIFICACIÓN DE LAS FALTAS PARA ESTUDIANTES:

FALTAS LEVES:
Definición: Actitudes y comportamientos que alteren la convivencia, pero que no involucren daño físico o psicológico a otros integrantes de la comunidad. Ejemplos: llegar tarde, uso del celular, olvidar la tarea o material, entre otros.
1. No presentarse en horario establecido para el ingreso a la institución en jornada matutino y vespertino.
2. Ingreso de ALIMENTOS en horas de ALMUERZO. (Solo se permitirá alimentos elaborados en casa, por parte de referentes de familia).
3. Uso de GORRAS, GORROS, PAÑOLETAS u OTROS accesorios.
4. No portar uniforme correctamente. (numerales 3,4,5,6,7,8).
5. No seguir indicaciones de corte de cabello francesa oscura para varones (no cortes de moda).
6. Cejas con CORTE o TATUADAS en señoritas y jóvenes.
7. Usar suéter de colores oscuros, holgados y sudaderas.
8. Portar suéter después de las 8:30 am.
9. Usar Piercing en oreja, nariz, lengua, barbilla y cejas.
10. Usar aritos de colgar grandes para señoritas.
11. Uso de Aretes para caballeros.
12. Uso de uñas acrílicas en señoritas y uñas largas en jóvenes.
13. Uso de maquillaje en señoritas y jóvenes.
14. Uso de tinte en cabello en señoritas y jóvenes.
15. Irrespetar el toque de entrada a salón de clases.
16. Uso de CELULAR, audífonos en horas de clases, recesos y horas libres no es permitido. Excepto asignaturas que lo requieran.
17. Ingresar chicle a la institución.
18. Ingresar bebidas carbonatadas, energizantes y jugos a la institución.
19. Uso de cintas XL en zapatos deportivos.
20. Portar el uniforme deportivo cuando no corresponde a la clase de educación física.
21. Portar la gabacha en horas no correspondientes de su horario de tecnología.
22. No mantener su espacio de trabajo limpio y organizado (zona de taller).
23. No portar sus materiales educativos y tecnológicos para el desarrollo de sus clases.
24. No cumplir con su horario de aseo asignado.
25. Ingresar alimentos y bebidas al salón de clases y talleres.
26. Retirarse de la institución sin autorización o con el grado que no le corresponde.
27. Presentarse a la institución con vello facial.

FALTAS GRAVES:
Definición: Actitudes y comportamientos que atenten contra la integridad psicológica de personas con las que establece relaciones cotidianas en el centro educativo o afecta el bien común. Ejemplos: agresiones, intimidaciones, entre otros.
1. Vocabulario soez, Se pide respeto a miembros de Comunidad Educativa.
2. Gritos y escándalo en Fotocopiadora, cafetería, pasillos. Irrespeto a miembros de la Comunidad Educativa.
3. Escenas amorosas dentro y fuera del instituto. Respeto a los miembros de Comunidad Educativa.

FALTAS MUY GRAVES:
Definición: Actitudes y comportamientos que atenten contra la integridad física y psicológica, así como agresiones sostenidas en el tiempo, incluye conductas tipificadas como delito. Ejemplos: robos, acoso o abuso sexual, tráfico de drogas, acoso escolar, entre otros.
1. Realizar bromas o juegos bruscos que atenten contra la integridad física de la persona.
2. Ingresar objetos sin fines didácticos (cutter, navajas, tijeras con punta, objetos cortopunzantes).
3. Consumo, distribución de droga, Alcohol y Cigarros se reportará a Instancias correspondientes PNC.
4. BULLYING, y sus derivados será reportado a instancias correspondientes. PNC.
5. Hurto y robo dentro de la institución.
6. Realizar actos de acoso y abuso sexual.
7. Realizar actos de intimidación, maltrato y discriminación.
8. Generar riñas.
9. Dañar intencionalmente el mobiliario de la institución.
10. Hacer uso inadecuado de servicios sanitarios. De lo contrario todo daño será reparado por referentes de familia.

SANCIONES PARA ESTUDIANTES:
Sanciones por Faltas Leves:
1. En primera instancia se le hará un llamado de atención verbal, el cual será registrado en drive.
2. El segundo llamado de atención se registrará en el expediente del estudiante y se asignará acciones de disciplina positiva.

Sanciones por Faltas Graves:
1. Tercer llamado de atención VERBAL se CONVIERTE EN FALTA GRAVE, se elaborará ACTA COMPROMISO, firmada por estudiante y referente de familia. Además se asignará acciones de disciplina positiva de acuerdo a la falta cometida.
2. Amonestación escrita y realización de trabajo comunitario que no interrumpa su horario de clases.
3. En la reincidencia de faltas graves se les suspenderá de clases presenciales, garantizando su proceso académico multimodal.
4. Suspensión parcial de actividades institucionales y extracurriculares.

Sanciones por Faltas Muy Graves:
1. De existir daños a terceros, los gastos en los que se incurran serán costeados por el agresor.
2. De tener incidencia en faltas muy graves se le condiciona la matrícula para el siguiente año escolar.

Acciones a realizar:
Informar a Instancias correspondientes según el caso (CONAPINA, PNC, Fiscalía, ISDEMU, Unidad de Salud).

============================================================
DOCUMENTO 2: NORMATIVA PARA REFERENTES DE FAMILIA
============================================================
Artículo 55. LEY CRECER JUNTOS:
Es responsabilidad de las madres, padres, representantes y responsables de las niñas, niños y adolescentes:
a) Matricular a la niña, niño o adolescente oportunamente en un centro educativo.
b) Incentivar, exigir y verificar la asistencia regular a clases y apoyar en todo su proceso educativo.
c) Denunciar posibles violaciones a los derechos de niñas, niños y adolescentes.
d) Dar a conocer a las niñas, niños y adolescentes las instancias o mecanismos que protegen sus derechos en el ámbito educativo.
e) Atender al llamado del centro educativo para conocer de situaciones relativas a la educación de sus hijos e hijas.

OBLIGACIONES Y LINEAMIENTOS PARA REFERENTES DE FAMILIA:
● Colaborar en la educación integral y en las actividades organizadas por el centro educativo en donde se requiera su participación.
● Garantizar que sus hijos lleven los útiles necesarios para el buen desempeño académico.
● Inculcar el desarrollo de buenos hábitos de convivencia, disciplina, respeto, tolerancia, autoestima, solidaridad y los demás valores en sus hijos.
● Dar acompañamiento al trabajo desarrollado en las diferentes plataformas virtuales que se usan en cada materia.
● Verificar la correcta presentación personal del estudiante al salir de su casa hacia la institución.
● Presentación personal de forma decorosa de los referentes (no short, minifalda, licras y top).
● Conocer los horarios de entrada, salida, sección y docente coordinador de sus hijos.
● Garantizar que su hijo/a ingrese 15 minutos antes de la hora establecida.
● Responsabilizarse del estado de salud de cada uno de sus hijos.
● Si el estudiante padece de alguna enfermedad presentar constancia médica.
● Cumplir con el horario establecido para cada reunión convocada por la institución o docentes.
● Referentes autorizados para retiro de estudiantes: únicamente los que se encuentran reportados en expediente de estudiante.
● Reportar INASISTENCIA a través de link el día que el estudiante presente ausencia; de lo contrario no se tomará en cuenta.
● Reportar INASISTENCIA MÁS DE UN DÍA por escrito únicamente en los siguientes casos:
  1. Duelo
  2. Enfermedad con Certificación Médica
  3. Participación en Clubes deportivos
  4. Becas
  5. OTROS.
● Irrespeto a personal docente y administrativo se levantará ACTA.
● Referentes que queden reportados en expediente de estudiante deben residir en el país.
● Comportamiento decoroso obligatorio.
● Firmar de enterado avisos Ministeriales e institucionales.
● Consultas a personal docente en horario laboral al número 23384571. Horario de atención: 7:00 am / 12:00 m; 1:00 pm / 4:00 pm.
● Los padres de familia deberán reportar por escrito cuando el estudiante no se presente con su uniforme completo, limpio y ordenado.
● Entregar por escrito en formato institucional la justificación cuando presente problemas con uniforme, zapatos.
● ACTO DE GRADUACIÓN: los estudiantes se presentan según Orientaciones Ministeriales.

============================================================
DOCUMENTO 3: NORMATIVA PARA PERSONAL ADMINISTRATIVO
============================================================
El Personal administrativo y de servicio del Instituto Nacional Cantón Lourdes está sujeto a las normas y lineamientos de convivencia vigentes de toda la comunidad educativa, así también a los estipulados en lo laboral, según la forma de contratación: Por plaza MINEDUCYT o por contrato anual de CDE.
Normas estipuladas en:
1. La Ley del Servicio Civil.
2. Ley de Ética Gubernamental.
3. El Código de Trabajo.

DERECHOS DEL PERSONAL ADMINISTRATIVO:
● Estabilidad en el cargo.
● Respeto a la dignidad e integridad.
● Participación en la toma de decisión.
● Desarrollo profesional.
● Protección contra discriminación.
● Seguridad e higiene.
● Conocer sus funciones a desarrollar.
● Jornada laboral definida.
● Descanso y vacaciones según la Ley de Asuetos, Vacaciones y Licencias de los empleados públicos.
● Seguridad social.
● Licencias y permisos.
● Ambiente de trabajo seguro.
● Prestaciones de ley.
● Protección a la maternidad.
● Equipamiento y herramientas para el desarrollo de su trabajo.
● Ser notificado de las Evaluaciones de desempeño que se implementen en el instituto.

OBLIGACIONES DEL PERSONAL ADMINISTRATIVO:
● Cumplimiento de horarios.
● Desempeño eficiente.
● Resguardo de información.
● Mantener reserva de información relacionada a su cargo o al ambiente de trabajo.
● Cuidado del patrimonio.
● Comunicación efectiva, oportuna para favorecer el trabajo institucional.
● Solicitar oportunamente los permisos, en caso de ausentarse de sus labores.
● Uso correcto de recursos asignados y de los que cuenta la institución.
● Participación en actividades institucionales.
● Respeto a los miembros de la comunidad educativa.
● Atender a la comunidad educativa con diligencia y amabilidad.
● Formaciones de obligatoria participación.
● Vestuario adecuado al puesto que desempeña.
● Rechazar dádivas, promesas o recompensas como intento de soborno.
● Integrar comisiones de trabajo o de Protección Escolar.

============================================================
DOCUMENTO 4: NORMATIVA PARA PERSONAL DOCENTE
============================================================
OBLIGACIONES DE LOS DOCENTES (LCD, Art. 31 y RLCD):
1. Asistir puntualmente al desempeño de sus labores; Presentarse 15 minutos antes de iniciar sus labores y retirarse cuando hayan terminado sus responsabilidades (RLCD, Art 38, inciso a). En los 15 minutos preparar los materiales y adecuaciones en aula para el recibimiento de los estudiantes, previo a la clase.
2. Estar en el salón de clases con puntualidad y desarrollar la clase en el tiempo programado.
3. Firmar el Libro de Asistencia de Profesores o el registro que tenga la institución, consignando la hora de entrada al llegar a la institución y de salida, al final de labores (RLCD, Art 38, inciso d).
4. Cuidar su presentación personal, en atención a su profesión (RLCD, Art. 38, inciso ll).
5. Desempeñar el cargo con diligencia y eficiencia en la forma, tiempo y lugar establecidos por el Ministerio de Educación.
6. Obedecer las instrucciones que reciba de sus superiores en lo relativo al desempeño de sus labores.
7. Planificar su labor docente, elaborar el material didáctico y practicar una metodología que favorezca el aprendizaje de los alumnos (RLCD Art. 38, incisos e y f), según las indicaciones, en trabajo colaborativo por nivel o especialidad o función de la comisión a la que pertenece y usando los formatos correspondientes.
8. Observar buena conducta en los centros educativos, lugares de trabajo y fuera de éstos; evitar las bromas bruscas, difamación o denigración a compañeros docentes.
9. Guardar consideración y respeto a la integridad física y moral de sus superiores, alumnos, alumnas, compañeros docentes o demás miembros de su comunidad educativa.
10. Denunciar cualquier hecho de violencia sexual que sufran los alumnos o demás miembros de su comunidad educativa.
11. Velar el cuido de la infraestructura y mobiliario de la Institución (RLCD, Art. 38, inciso l).
12. Conservar en buen estado los materiales didácticos y demás implementos o bienes que se le entregaren o encomendaren para el servicio de la docencia o por motivo de su cargo. En ningún caso responderá el deterioro causado por el uso natural de estos objetos, ni del ocasionado por caso fortuito o fuerza mayor, ni del proveniente de su mala calidad o defectuosa fabricación.
13. Llevar completos, en orden y al día los libros del registro escolar del grado o nivel asignados (RLCD, Art 38, inciso b), en referencia al Portafolio, tanto en físico como en formato digital.
14. Prestar auxilio en cualquier tiempo que se necesite cuando por siniestro o riesgo inminente, peligren las instalaciones o las personas que se encuentren dentro del centro educativo en que trabaja el educador; Responsabilizarse de la seguridad de sus alumnos, en aula o en actividades extracurriculares (RLCD Art, 38, inciso h).
15. Observar todas las prescripciones concernientes a higiene y seguridad establecidas por las leyes, reglamentos y disposiciones administrativas.
16. Guardar discreción sobre asuntos sensibles de que tengan conocimiento por razón del cargo que ocupa.
17. Actualizarse profesionalmente según el cargo que desempeñe; Asistir a los cursos de mejoramiento profesional (RLCD, Art 38, inciso c) que le convoque el Ministerio de Educación.
18. Cumplir con los acuerdos tomados en Consejo de profesores (RLCD, Art. 38, inciso K).
19. Las demás que le imponga la Ley de la Carrera Docente.

PROHIBICIONES A LOS EDUCADORES (LCD, Art. 32):
Se prohíbe a los educadores:
1) Abandonar las labores durante la jornada de trabajo sin justa causa o licencia de sus superiores.
2) Realizar propaganda política partidista o religiosa dentro de los centros educativos o lugares de trabajo.
3) Portar armas de cualquier clase durante el desempeño de sus labores o dentro de los centros educativos, o durante actividades extra escolares.
4) Cometer cualquier forma de maltrato físico, psíquico o sexual en contra de los alumnos, alumnas o cualquier otra persona miembro de la comunidad educativa.
5) Influir en las decisiones políticas de alumnos, o personal subalterno, así como tomar represalias o imponerles sanciones por su filiación en actividades políticas, gremiales o religiosas.
6) Coartar el derecho de libre asociación de los demás educadores y estudiantes.
7) Efectuar colectas obligatorias o exigir pronunciamientos o adhesiones de cualquier naturaleza.
8) Usar el local de los centros educativos para vivienda o actividades no propias de la enseñanza, sin la autorización correspondiente.
9) Cobrar cuotas sociales o de cualquier naturaleza o vender objetos o mercancías dentro del centro educativo en beneficio propio; y,
10) Las demás que establezcan la ley y su reglamento.

INFRACCIONES A DOCENTES (LCD, Art. 53):
Las faltas se clasifican en: Menos graves, graves y muy graves.

FALTAS MENOS GRAVES (LCD, Art. 54):
1) Usar indebidamente los materiales didácticos y demás implementos o bienes destinados al servicio del centro educativo.
2) La negligencia e impuntualidad en el desempeño de sus labores.
3) Realizar cualquier clase de propaganda o actividad que entorpezca las labores docentes; y,
4) Fumar mientras imparte clases.

FALTAS GRAVES (LCD, Art. 54):
1) Cometer actos que perturben el normal desarrollo de las labores.
2) Desobedecer a sus superiores en forma manifiesta, sin motivo justo y siempre que se trate de asuntos relacionados con el desempeño laboral.
3) Proferir expresiones o cometer actos irrespetuosos en contra de sus superiores, compañeros de trabajo, educandos, padres de familia, dentro de los centros educativos y lugares de trabajo o fuera de éstos, cuando el educador se encontrare en el ejercicio de sus funciones.
4) Negarse sin causa justificada a asistir a cursos de capacitación o especialización profesional.
5) Faltar a sus labores sin permiso de su superior sin causa justificada.
6) Influir en las decisiones políticas partidistas y gremiales de sus subalternos y educandos.
7) Hacer cualquier clase de propaganda o actividad partidista dentro de los centros educativos u oficinas.
8) Efectuar colectas o exigir pronunciamientos o adhesiones de los educadores de cualquier naturaleza que aquéllas fueren.
9) Ostentar en las escuelas u oficinas de trabajo distintivos, emblemas u otros objetos que los acrediten como integrantes de un partido político.
10) Laborar en otro centro educativo, durante su jornada de trabajo oficial; y,
11) Cometer una segunda falta menos grave.

FALTAS MUY GRAVES POR DOCENTES (LCD, Art. 56):
1) Observar en su vida privada conducta notoriamente viciada.
2) Negarse sin justa causa a integrar el Tribunal Calificador, las Juntas de la Carrera Docente o el Tribunal de la Carrera Docente en que hubiese sido nombrado o electo.
3) Cometer actos inmorales dentro de los centros educativos o lugares de trabajo o fuera de estos.
4) Ingerir bebidas embriagantes o usar drogas alucinógenas, estupefacientes o enervantes dentro de los centros educativos o en el lugar que el educador desempeñe sus labores o presentarse al desempeño de su cargo en estado de ebriedad o bajo la influencia de drogas.
5) Abandonar total o parcialmente sus labores durante la jornada de trabajo sin permiso de su superior (Directora o en ausencia, subdirectora) o retirarse sin causa justificada.
6) Ejecutar actos u observar conductas que pongan en peligro la seguridad de los alumnos y demás compañeros.
7) Coartar el derecho de libre asociación gremial de los educadores y alumnos.
8) Exigir o recibir dádivas o cualquier servicio para gestionar, influir o conceder nombramientos, pruebas, calificaciones, títulos, certificados de promoción, inscripciones, ascensos escalafonarios, equivalencias de estudio, así como cualquier otro acto propio de la carrera docente.
9) Destruir, sustraer o alterar registros escolares o consignar en ellos datos falsos.
10) Sustraer o vender material didáctico y demás implementos o bienes destinados al servicio del centro educativo.
11) Causar intencionalmente daños en el material didáctico y demás implementos o bienes destinados al servicio del centro educativo o en documentos escolares.
12) Revelar asuntos sensibles de que tenga conocimiento en razón de su cargo.
13) Disponer para beneficio personal o para fines ajenos al centro educativo de los fondos o bienes de éste o de entidades que con él cooperen, así como de los intereses que puedan generar los fondos depositados en cualquier institución financiera.
14) Cobrar o establecer cuotas sociales a título personal o institucional o apropiarse de ellas o vender cualquier clase de objetos de la institución en beneficio propio.
15) Vender dentro de la institución cualquier clase de mercadería en beneficio personal.
16) Contraer deudas o efectuar colectas para fines personales a nombre del centro educativo.
17) Portar armas de cualquier clase durante el desempeño de sus labores.
18) Aplicar a los alumnos cualquier forma de maltrato físico o psíquico que atente contra su dignidad, su integridad personal o el desarrollo de su personalidad.
19) Acosar sexualmente o cometer actos contra la libertad sexual en contra de compañeros o compañeras de trabajo; alumnos o alumnas; padres o madres de éstos, dentro o fuera del centro educativo.
20) Negarse a admitir alumnos por motivo de la naturaleza de la unión de sus padres, por diferencias sociales, religiosas, raciales, política, económica o de otra índole.
21) Interceptar o retardar la entrega de correspondencia de toda clase a los educadores.
22) Cometer una segunda falta grave; y,
23) Exigir cuotas de matrícula o escolaridad.

SANCIONES POR FALTAS COMETIDAS POR EL PERSONAL DOCENTE (LCD, Art. 57):
1. Sanciones principales:
   1) Amonestación escrita (Art. 58): aplicada en casos de faltas menos graves.
   2) Suspensión sin goce de sueldo (Art. 59): de 3 a 30 días para faltas graves y de más de 30 a 60 días para faltas muy graves. Consiste en separación temporal sin sueldo.
   3) Despido (Art. 61): cancelación de nombramiento y separación definitiva. Causas: falta muy grave por segunda vez (o primera vez en caso de acoso sexual del num 19 Art. 56 con sentencia condenatoria definitiva), condena penal, inasistencia sin justa causa por 8 días consecutivos o 10 días hábiles en un mes, incapacidad legal.
2. Sanción accesoria:
   Inhabilitación para el ejercicio de la docencia (Art. 62, 63 y 64): Prohibición impuesta al infractor de ejercer docencia al servicio de instituciones públicas, municipales y privadas. Se aplica si las faltas muy graves son de las contempladas en los numerales 1, 3, 4, 9, 10, 11, 13, 18 y 20 del Art. 56, o por primera vez en el numeral 19 (Acoso sexual). Tiene carácter permanente, con posibilidad de rehabilitación al desaparecer las causas.

SUSPENSIÓN PREVIA (LCD, Art. 60):
Puede ordenarse la suspensión en el cargo sin goce de sueldo cuando el educador se le sorprendiere en flagrante falta muy grave (numerales 1, 3, 4, 9, 13, 17 y 19 del Art. 56), por arresto/detención provisional, por acosar sexualmente con evidencias de riesgo actual o inminente, o por procesos penales pendientes relativos a delitos contra la libertad sexual. Debe notificarse a la Fiscalía General de la República (FGR) en casos de acoso sexual y presentar denuncia ante la Junta de la Carrera Docente dentro de los 5 días hábiles siguientes.
`;

export const NORMATIVE_DOCS: NormativeSection[] = [
  {
    id: 'estudiantes-deberes',
    documentTitle: 'Normativa para Estudiantes',
    subtitle: 'Derechos, Deberes y Obligaciones del Alumnado',
    category: 'estudiantes',
    content: `DERECHOS:
1. Ser tratado con respeto
2. Garantizar su desarrollo integral
3. Participar en los diferentes clubes de la institución
4. A recibir educación de forma gratuita

DEBERES U OBLIGACIONES DESTACADAS:
• Ingreso 15 minutos antes del toque en jornada matutina y vespertina.
• Portar Uniforme diario sin modificaciones.
• Calcetas blancas en señoritas (no punteras) y calcetines negros en jóvenes (no punteras).
• Zapatos negros limpios y lustrados. Cincho negro de cuero con hebilla con pasador.
• Monograma cosido en bolsa izquierda e identificador por especialidad.
• Uniforme deportivo: permitido únicamente el día de educación física (pants azul, camisa blanca no estampada, tenis limpios sin cintas XL).
• Corte de cabello francesa oscura para varones (sin cortes de moda).
• Cejas sin corte ni tatuajes. Sin vello facial (barba y bigote).
• Aretes pequeños en señoritas. Aretes prohibidos en varones.
• Uñas en señoritas sin colores (solo brillo), no acrílicas. Jóvenes con uñas cortas. Sin maquillaje ni cabello tinturado.
• Prohibido uso de celular y audífonos en horas de clase, recesos y horas libres (excepto asignaturas que lo requieran).
• Prohibido mascar chicle, traer piercings, collares o cadenas.
• Bolsón y estuche TRANSPARENTES (no de color).
• Cumplir aseo de aula y mantener gabacha limpia en bolsón para taller.`
  },
  {
    id: 'estudiantes-faltas',
    documentTitle: 'Normativa para Estudiantes',
    subtitle: 'Clasificación de Faltas (Leves, Graves y Muy Graves) y Sanciones',
    category: 'estudiantes',
    content: `CLASIFICACIÓN DE FALTAS:
• Faltas Leves (27 numerales): Comportamientos que alteran la convivencia sin daño físico/psicológico (llegadas tarde, uso de celular/audífonos, suéter después de 8:30 am o colores oscuros/holgados, comida en almuerzo no casera, chicle, bebidas carbonatadas o energizantes, uñas largas/acrílicas, tinte, vello facial, gabacha fuera de horario).
  Sanción leve: 1° llamado verbal en drive; 2° llamado en expediente con disciplina positiva.
• Faltas Graves (3 numerales): Atentar contra la integridad psicológica o el bien común (vocabulario soez, gritos/escándalo en fotocopiadora/cafetería/pasillos, escenas amorosas dentro y fuera).
  Sanción grave: 3° llamado verbal se convierte en falta grave (Acta compromiso), amonestación escrita con trabajo comunitario, reincidencia suspende clases presenciales a modalidad multimodal.
• Faltas Muy Graves (10 numerales): Atentan contra integridad física/psicológica, delitos, armas cortopunzantes, drogas/alcohol/cigarros, bullying, hurto/robo, riñas, daño intencional a mobiliario o sanitarios.
  Sanción muy grave: Gastos costeados por agresor, condicionamiento de matrícula el siguiente año y remisión a CONAPINA, PNC, Fiscalía, ISDEMU o Unidad de Salud.`
  },
  {
    id: 'familias',
    documentTitle: 'Normativa para Referentes de Familia',
    subtitle: 'Ley Crecer Juntos (Art. 55) y Disposiciones para Padres',
    category: 'familias',
    content: `RESPONSABILIDADES (Art. 55 Ley Crecer Juntos):
• Matricular oportunamente, garantizar asistencia y 15 minutos antes de la entrada.
• Acompañar el uso de plataformas virtuales de cada materia.
• Presentación decorosa de referentes (prohibido short, minifalda, licras y top al ingresar).
• Retiro de alumnos: Solo referentes registrados en expediente (deben residir en el país).
• Inasistencias:
  - Reportar por LINK institucional el día de ausencia (requisito obligatorio).
  - Justificación por ESCRITO para más de un día en casos de: Duelo, Enfermedad con certificación médica, Clubes deportivos, Becas u otros.
• Consultas docentes: Horario de 7:00 am a 12:00 m y de 1:00 pm a 4:00 pm llamando al 2338-4571.
• Daños en sanitarios o mobiliario deben ser reparados por los referentes.`
  },
  {
    id: 'administrativo',
    documentTitle: 'Normativa para Personal Administrativo',
    subtitle: 'Derechos y Obligaciones del Personal Administrativo y de Servicio',
    category: 'administrativo',
    content: `MARCO LEGAL:
Sujetos a Ley de Servicio Civil, Ley de Ética Gubernamental y Código de Trabajo.

DERECHOS:
Estabilidad laboral, respeto a la dignidad, seguridad e higiene, jornada definida, descansos y vacaciones según Ley de Asuetos de empleados públicos, seguridad social, protección a la maternidad, herramientas de trabajo y notificación de evaluaciones.

OBLIGACIONES:
Cumplimiento de horario, reserva y resguardo de información, cuidado del patrimonio escolar, vestuario adecuado, rechazar dádivas/soborno, integrar comisiones de Protección Escolar y atender a la comunidad con diligencia y amabilidad.`
  },
  {
    id: 'docentes',
    documentTitle: 'Normativa para Personal Docente',
    subtitle: 'Ley de la Carrera Docente (LCD) y Reglamento (RLCD)',
    category: 'docentes',
    content: `OBLIGACIONES (LCD Art. 31 y RLCD):
• Llegar 15 minutos antes para preparar aula y materiales; firmar libro de asistencia.
• Cuidar presentación personal, planificar clases y portafolio al día (físico y digital).
• Denunciar hechos de violencia sexual; velar por seguridad e infraestructura escolar.

PROHIBICIONES (Art. 32 LCD):
Abandono de labores sin permiso, armas, propaganda política/religiosa, maltrato a estudiantes, cobro de cuotas o venta particular de mercancías.

FALTAS Y SANCIONES (LCD Arts. 53-64):
• Menos graves: Negligencia, fumar en clase -> Amonestación escrita.
• Graves: Perturbar labores, desobediencia manifiesta, faltas sin permiso -> Suspensión sin sueldo de 3 a 30 días.
• Muy graves: Acoso sexual, drogas/alcohol, maltrato, alteración de notas/documentos -> Suspensión 30-60 días, Despido o Inhabilitación de la docencia.`
  }
];
