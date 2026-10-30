/* Contenido: lecciones, preguntas de teoría, exámenes resueltos y chuleta.
   Los <div data-widget="..."> se convierten en calculadoras/diagramas al pintar la página. */
window.CONTENT = (function () {
  const R = String.raw;

  const lessons = [
    /* ------------------------------------------------------------------ */
    {
      id: 'entropia', n: 1, title: 'Entropía e información mutua', day: 1,
      practice: ['entropia', 'conjunta'],
      html: R`
<div class="sec prose">
  <p class="lead">Todo el temario se apoya en una idea: cuanto menos probable es un suceso, más información aporta cuando ocurre. La entropía es la información media de una fuente y marca el mínimo de bits por mensaje que hace falta para codificarla.</p>
</div>

<div class="sec prose">
  <h3>1. Información de un suceso</h3>
  <p>Si un mensaje \(x\) tiene probabilidad \(p(x)\), su información (o "sorpresa") es</p>
  <div class="fbox"><span class="lbl">Información</span>\[ I(x) = \log \frac{1}{p(x)} = -\log p(x) \]</div>
  <ul>
    <li>Si \(p=1\) (seguro), \(I=0\): no aprendes nada.</li>
    <li>Si \(p\) es pequeña, \(I\) es grande: una noticia es un suceso improbable.</li>
    <li>Para sucesos independientes la información se suma, porque \(\log(p\cdot q) = \log p + \log q\). Por eso se usa el logaritmo.</li>
  </ul>
  <p>La base del logaritmo fija la unidad: base 2 → <b>bits</b> (shannons), base \(e\) → <b>nats</b>, base 10 → <b>dits</b>, base 3 → <b>trits</b>. Para cambiar de unidad:</p>
  <div class="fbox"><span class="lbl">Cambio de base</span>\[ H_b(X) = \log_b(a)\, H_a(X) \qquad\Rightarrow\qquad H_3(X) = \frac{H_2(X)}{\log_2 3} = \frac{H_2(X)}{1{,}585} \]</div>
  <div class="callout idea"><b>Con calculadora</b><span>\(\log_2 x = \dfrac{\ln x}{\ln 2}\) y \(\log_3 x = \dfrac{\ln x}{\ln 3}\). Apúntate \(\ln 2 = 0{,}6931\), \(\ln 3 = 1{,}0986\) y \(\log_2 3 = 1{,}585\).</span></div>
</div>

<div class="sec prose">
  <h3>2. Entropía de una fuente</h3>
  <p>La entropía es la media de la información de cada mensaje, ponderada por su probabilidad:</p>
  <div class="fbox"><span class="lbl">Entropía</span>\[ H(X) = \sum_{x} p(x)\log\frac{1}{p(x)} = -\sum_x p(x)\log p(x) = E\left[\log\frac{1}{p(X)}\right] \]</div>
  <ul>
    <li>\(H(X)\ge 0\), y vale 0 solo si la fuente es determinista.</li>
    <li>\(H(X)\le \log|\mathcal X|\), con igualdad si y solo si todos los mensajes son equiprobables. Es la "incertidumbre máxima".</li>
    <li>Los términos con \(p=0\) no cuentan (\(0\log\frac{1}{0}=0\)).</li>
  </ul>
  <p>Fuente binaria con probabilidades \((p, 1-p)\): \(H(p) = -p\log p-(1-p)\log(1-p)\). Vale 0 en \(p=0\) y \(p=1\) y es máxima (1 bit) en \(p=\tfrac12\).</p>
  <div class="example"><span class="lbl">Pregunta de examen (2024)</span>
    <p><b>¿Genera más incertidumbre un dado legal o una moneda legal?</b></p>
    <p>\(H(\text{dado}) = \log_2 6 = 2{,}585\) bits \(> H(\text{moneda}) = \log_2 2 = 1\) bit. Las dos son uniformes, así que cada una alcanza su máximo \(\log|\mathcal X|\), y el dado tiene más resultados. Una distribución "menos desordenada" sería por ejemplo \((0{,}9;\ 0{,}05;\ 0{,}05)\), con \(H = 0{,}569\) bits.</p>
  </div>
  <div data-widget="entropia" data-probs="0.3 0.2 0.2 0.2 0.1"></div>
</div>

<div class="sec prose">
  <h3>3. Dos variables: conjunta, condicional y regla de la cadena</h3>
  <div class="fbox"><span class="lbl">Conjunta y condicional</span>
  \[ H(X,Y) = \sum_x\sum_y p(x,y)\log\frac{1}{p(x,y)} \]
  \[ H(Y/X) = \sum_x p(x)\,H(Y/X=x) = \sum_x\sum_y p(x,y)\log\frac{1}{p(y/x)} \]</div>
  <p>\(H(Y/X)\) es la incertidumbre que te queda sobre \(Y\) cuando ya conoces \(X\). Se calcula fila a fila: la entropía de cada fila condicionada, ponderada por la probabilidad de esa fila.</p>
  <div class="fbox"><span class="lbl">Regla de la cadena</span>
  \[ H(X,Y) = H(X) + H(Y/X) = H(Y) + H(X/Y) \]
  \[ H(X_1,\dots,X_n) = \sum_{i=1}^{n} H(X_i/X_{i-1},\dots,X_1) \]</div>
  <ul>
    <li><b>Condicionar reduce la entropía (en promedio)</b>: \(H(X/Y)\le H(X)\), con igualdad si y solo si son independientes. Un valor concreto \(H(X/Y=y)\) sí puede ser mayor que \(H(X)\).</li>
    <li><b>Límite de independencia</b>: \(H(X,Y)\le H(X)+H(Y)\) y, en general, \(H(X_1,\dots,X_n)\le\sum H(X_i)\), con igualdad si y solo si son independientes.</li>
    <li><b>Agrupamiento</b>: si \(X'\) es una partición de \(X\) (agrupas mensajes), \(H(X) = H(X') + H(X/X')\).</li>
  </ul>
</div>

<div class="sec prose">
  <h3>4. Información mutua</h3>
  <p>Es lo que \(Y\) te dice sobre \(X\): cuánto baja la incertidumbre sobre \(X\) al conocer \(Y\).</p>
  <div class="fbox"><span class="lbl">Información mutua</span>
  \[ I(X;Y) = H(X)-H(X/Y) = H(Y)-H(Y/X) = H(X)+H(Y)-H(X,Y) \]
  \[ I(X;Y) = \sum_x\sum_y p(x,y)\log\frac{p(x,y)}{p(x)p(y)} = D\big(p(x,y)\,\|\,p(x)p(y)\big) \ge 0 \]</div>
  <p>Es simétrica, \(I(X;X)=H(X)\), y vale 0 si y solo si \(X\) e \(Y\) son independientes. El diagrama de Venn resume todas las relaciones y lo piden dibujar en teoría:</p>
  <div data-widget="venn"></div>
  <p>Información mutua condicional: \(I(X;Y/Z) = H(X/Z)-H(X/Y,Z) \ge 0\).</p>
  <div data-widget="conjunta" data-matrix="1/8 1/16 1/16 1/4; 1/16 1/8 1/16 0; 1/32 1/32 1/16 0; 1/32 1/32 1/16 0"></div>
  <p class="small muted">Es el ejemplo de las diapositivas: \(H(X,Y)=3{,}375\), \(H(X)=1{,}75\), \(H(Y)=2\), \(H(Y/X)=1{,}625\), \(H(X/Y)=1{,}375\) bits.</p>
</div>

<div class="sec prose">
  <h3>5. Entropía relativa (divergencia de Kullback-Leibler)</h3>
  <div class="fbox"><span class="lbl">Entropía relativa</span>\[ D(p\,\|\,q) = \sum_x p(x)\log\frac{p(x)}{q(x)} = E_p\big[I_q(x) - I_p(x)\big] \]</div>
  <ul>
    <li>\(D(p\|q)\ge 0\) y vale 0 si y solo si \(p=q\).</li>
    <li>No es simétrica: \(D(p\|q)\ne D(q\|p)\). Por eso no es una distancia métrica.</li>
    <li>Interpretación: los bits de más por mensaje que gastas si diseñas el código creyendo que la distribución es \(q\) cuando en realidad es \(p\).</li>
    <li>Cota superior de la entropía: \(D(p\|u) = \log|\mathcal X| - H(X)\ge 0\), con \(u\) uniforme.</li>
  </ul>
</div>

<div class="sec prose">
  <h3>6. Jensen y teorema del proceso de información</h3>
  <div class="callout ojo"><b>Ojo con la convención de tus diapositivas</b><span>Las diapositivas llaman <b>cóncava</b> a una función con forma de U (como \(x^2\) o \(e^x\)), que cumple \(f(\lambda x_1+(1-\lambda)x_2)\le\lambda f(x_1)+(1-\lambda)f(x_2)\), y <b>convexa</b> a \(\log x\) o \(\sqrt x\). Muchos libros lo dicen al revés. En el examen usa la de clase: para \(f\) "cóncava", \(E[f(X)]\ge f(E[X])\).</span></div>
  <p><b>Teorema del proceso de información.</b> Si \(X\to Y\to Z\) forman una cadena de Markov (por ejemplo \(Z=f(Y)\)), entonces \(I(X;Z/Y)=0\) y</p>
  <div class="fbox">\[ I(X;Y)\ \ge\ I(X;Z) \]</div>
  <p>Ningún procesado de \(Y\) aumenta la información que contiene sobre \(X\). Demostración en dos líneas: \(I(X;Y,Z)=I(X;Z)+I(X;Y/Z)=I(X;Y)+I(X;Z/Y)\); como \(I(X;Z/Y)=0\) y \(I(X;Y/Z)\ge0\), sale la desigualdad.</p>
  <p>Contraejemplo sin relación markoviana: \(X,Y\) bits independientes equiprobables y \(Z=X+Y\). Entonces \(I(X;Y)=0\) pero \(I(X;Y/Z)=\tfrac12\) bit.</p>
  <p>Esto aparece en problemas: en 2025 preguntaron si \(X_n, X_{n+1}, X_{n+2}\) de una cadena de Markov tienen relación markoviana. Sí, porque \(I(X_n;X_{n+2}/X_{n+1}) = H(X_{n+2}/X_{n+1}) - H(X_{n+2}/X_n,X_{n+1}) = 0\).</p>
</div>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'codigos', n: 2, title: 'Tipos de códigos y desigualdad de Kraft', day: 1,
      practice: ['tipos', 'kraft'],
      html: R`
<div class="sec prose">
  <p class="lead">Un código asigna a cada mensaje de la fuente una palabra formada con símbolos de un alfabeto de \(D\) símbolos (binario: \(\{0,1\}\); ternario: \(\{0,1,2\}\)). Queremos que se pueda descodificar sin ambigüedad y que sea lo más corto posible.</p>
  <div class="fbox"><span class="lbl">Longitud media</span>\[ L(C) = \sum_x p(x)\,l(x) \quad\text{símbolos de código por mensaje (sb/mensaje si es binario)} \]</div>
</div>

<div class="sec prose">
  <h3>1. Clasificación de códigos</h3>
  <p>Cada clase está contenida en la anterior. Es pregunta de teoría habitual (2023): nombre y descripción.</p>
  <ul>
    <li><b>Bloque</b>: a cada mensaje se le asigna una secuencia fija de símbolos.</li>
    <li><b>No singular</b>: mensajes distintos tienen palabras distintas (la función de codificación es inyectiva). Si hay dos mensajes con la misma palabra es <b>singular</b> y se pierde información.</li>
    <li><b>Unívocamente descodificable (UD)</b>: su extensión \(C^*\) (concatenar palabras) es no singular. Cualquier cadena de bits tiene un único origen, aunque quizá tengas que ver toda la cadena para saberlo.</li>
    <li><b>Prefijo o instantáneo</b>: ninguna palabra es prefijo de otra. Se descodifica en cuanto llega cada palabra, sin "coma".</li>
  </ul>
  <div data-widget="codesets"></div>
  <div class="tbl-wrap"><table>
    <tr><th>X</th><th>Singular</th><th>No singular</th><th>UD</th><th>Prefijo</th></tr>
    <tr><td>1</td><td class="mono">0</td><td class="mono">0</td><td class="mono">10</td><td class="mono">0</td></tr>
    <tr><td>2</td><td class="mono">0</td><td class="mono">010</td><td class="mono">00</td><td class="mono">10</td></tr>
    <tr><td>3</td><td class="mono">1</td><td class="mono">01</td><td class="mono">11</td><td class="mono">110</td></tr>
    <tr><td>4</td><td class="mono">1</td><td class="mono">10</td><td class="mono">110</td><td class="mono">111</td></tr>
  </table></div>
  <p class="small muted">El "no singular" falla porque 010 puede ser "2" o "3 1" o "1 4". El "UD" no es prefijo (11 es prefijo de 110), pero aun así es unívoco.</p>
</div>

<div class="sec prose">
  <h3>2. Test de Sardinas-Patterson</h3>
  <p>Sirve para comprobar si un código es UD. Se calculan "sufijos colgantes":</p>
  <ol>
    <li>\(C_1\): para cada par de palabras \(u, v\) con \(u\) prefijo de \(v\), apunta el sobrante \(w\) (\(uw=v\)).</li>
    <li>\(C_{n}\): compara las palabras del código con los elementos de \(C_{n-1}\) en los dos sentidos y apunta los sobrantes.</li>
    <li>Si algún \(C_n\) contiene una palabra del código, <b>no es UD</b>. Si los conjuntos se vacían o se repiten sin que eso pase, <b>es UD</b>.</li>
  </ol>
  <div data-widget="kraftcodes" data-codes="10 00 11 110"></div>
</div>

<div class="sec prose">
  <h3>3. Desigualdad de Kraft</h3>
  <p>No puedes hacer cortas todas las palabras: si usas el 0 como palabra, todo lo que empieza por 0 queda prohibido. Kraft dice exactamente qué longitudes son posibles.</p>
  <div class="fbox"><span class="lbl">Kraft</span>\[ \sum_i D^{-l_i}\le 1 \iff \text{existe un código prefijo } D\text{-ario con esas longitudes} \]</div>
  <p>Idea de la demostración (árbol): en el nivel \(l_{max}\) hay \(D^{l_{max}}\) hojas; una palabra de longitud \(l_i\) "gasta" \(D^{l_{max}-l_i}\) de ellas. La suma no puede pasar del total.</p>
  <ul>
    <li>Si la suma vale exactamente 1, el código es <b>completo</b>: no sobra ninguna rama del árbol.</li>
    <li><b>McMillan</b>: cualquier código UD también cumple Kraft. Consecuencia: buscar fuera de los códigos prefijo no mejora la longitud media. Por eso nos quedamos con los prefijo.</li>
  </ul>
  <div class="example"><span class="lbl">Pregunta de examen (2024)</span>
    <p><b>Longitudes binarias {1, 2, 3, 4, 5}. ¿Qué significa que cumplan Kraft? ¿Un código con esas longitudes es óptimo?</b></p>
    <p>\(\tfrac12+\tfrac14+\tfrac18+\tfrac1{16}+\tfrac1{32} = \tfrac{31}{32}\le 1\): se puede construir un código prefijo con esas longitudes (árbol de Kraft de profundidad 5), por ejemplo 0, 10, 110, 1110, 11110.</p>
    <p>No es óptimo: en un código óptimo las dos palabras más largas tienen la misma longitud. Aquí la de longitud 5 se puede recortar a 1111 sin perder la propiedad prefijo (la suma pasaría a valer 1).</p>
  </div>
  <div class="example"><span class="lbl">Pregunta de examen (2024)</span>
    <p><b>"Ningún código UD puede ser recortado sin perder la descodificación unívoca". ¿Verdadero?</b></p>
    <p>Falso. \(C=\{00, 11\}\) es UD y se recorta a \(\{0,1\}\), que sigue siéndolo.</p>
    <p><b>¿Puede ser UD un código cuya asignación no sea inyectiva?</b> No: si dos mensajes comparten palabra, el código es singular y ni siquiera un mensaje aislado se puede descodificar.</p>
  </div>
  <div data-widget="kraftlens" data-lengths="1 2 3 4 5" data-d="2"></div>
</div>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'shannon', n: 3, title: 'Códigos óptimos y primer teorema de Shannon', day: 1,
      practice: ['shannon'],
      html: R`
<div class="sec prose">
  <p class="lead">¿Cuánto puede llegar a medir como mínimo un código? La respuesta es la entropía, medida en la base del alfabeto del código.</p>
  <h3>1. Longitudes ideales</h3>
  <p>Minimizando \(L=\sum p_i l_i\) con la restricción de Kraft (multiplicadores de Lagrange) sale \(p_i = D^{-l_i}\), es decir</p>
  <div class="fbox">\[ l_i^* = \log_D\frac1{p_i} \qquad\Rightarrow\qquad L^* = \sum p_i\log_D\frac{1}{p_i} = H_D(X) \]</div>
  <p>Como las longitudes tienen que ser enteras, en general no se alcanza exactamente.</p>
</div>

<div class="sec prose">
  <h3>2. Primer teorema de Shannon</h3>
  <div class="fbox"><span class="lbl">Teorema</span>\[ L \ \ge\ H_D(X) \quad\text{para todo código prefijo (y todo UD) } D\text{-ario} \]
  \[ L = H_D(X) \iff p_i = D^{-l_i}\ \text{para todo } i\ \ (\text{distribución } D\text{-ádica}) \]</div>
  <p>Demostración: \(L-H_D(X) = D(p\|r) + \log_D\frac{1}{\sum D^{-l_j}} \ge 0\), con \(r_i = D^{-l_i}/\sum_j D^{-l_j}\). El primer término es una entropía relativa (\(\ge0\)) y el segundo es \(\ge 0\) por Kraft.</p>
  <div class="fbox"><span class="lbl">Eficiencia</span>\[ \eta = \frac{H_D(X)}{L} \qquad\text{(ambas en la misma unidad)} \qquad\text{redundancia} = 1-\eta \]</div>
  <div class="callout ojo"><b>Compara siempre en las mismas unidades</b><span>Un código ternario mide en trits (st/mensaje). Para compararlo con uno binario pásalo a bits: \(L_{bits} = L_{trits}\cdot\log_2 3\). En 2025: \(L_3 = 1{,}5\) st/mensaje \(= 2{,}377\) sb/mensaje, peor que \(L_2 = 2{,}3\) sb/mensaje.</span></div>
</div>

<div class="sec prose">
  <h3>3. Código de Shannon (subóptimo)</h3>
  <p>Redondea hacia arriba las longitudes ideales:</p>
  <div class="fbox">\[ l_i = \left\lceil \log_D\frac{1}{p_i}\right\rceil \qquad\Rightarrow\qquad H_D(X)\le L_S < H_D(X)+1 \]</div>
  <p>Cómo se construyen las palabras ("método Shannon" del Ejercicio 3):</p>
  <ol class="steps">
    <li><div>Ordena los mensajes de mayor a menor probabilidad.</div></li>
    <li><div>Calcula la probabilidad acumulada <b>anterior</b> \(F_i = p_1+\dots+p_{i-1}\) (la primera es 0).</div></li>
    <li><div>Calcula \(l_i=\lceil\log_2 1/p_i\rceil\).</div></li>
    <li><div>Escribe \(F_i\) en binario y quédate con los \(l_i\) primeros dígitos tras la coma. Esa es la palabra.</div></li>
  </ol>
  <div data-widget="shannon" data-probs="0.14 0.15 0.18 0.2 0.1 0.08 0.06 0.09" data-labels="1 2 3 4 5 6 7 8"></div>
  <p>El código de Shannon suele dejar ramas libres (Kraft \(<1\)), así que a menudo se puede <b>recortar</b>. Además puede dar soluciones absurdas: con \(p=(0{,}9999;\ 0{,}0001)\) daría longitudes 1 y 14, cuando basta con 0 y 1.</p>
  <div data-widget="binexp" data-frac="0.6" data-digits="8"></div>
</div>

<div class="sec prose">
  <h3>4. Extensiones de fuente y códigos desacoplados</h3>
  <p>Si codificas bloques de \(n\) mensajes como un "supermensaje", el bit de sobrecarga se reparte entre los \(n\):</p>
  <div class="fbox">\[ H_D(X)\le L_n < H_D(X)+\frac1n \quad(\text{v.a. iid}) \qquad\quad L_n\to H_D(\mathcal X)\quad(\text{proceso estacionario}) \]</div>
  <p>Con memoria, la longitud por mensaje tiende a la <b>tasa de entropía</b> (lección 7).</p>
  <p><b>Código desacoplado</b>: si diseñas con una distribución estimada \(q\) pero la real es \(p\), las longitudes \(\lceil\log 1/q_i\rceil\) dan</p>
  <div class="fbox">\[ H(X)+D(p\|q)\ \le\ L\ <\ H(X)+D(p\|q)+1 \]</div>
  <p>El precio de equivocarte con la distribución es exactamente la entropía relativa.</p>
</div>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'huffman', n: 4, title: 'Huffman binario y ternario', day: 1,
      practice: ['huffman2', 'huffman3'],
      html: R`
<div class="sec prose">
  <p class="lead">Huffman construye el código prefijo óptimo: ninguno tiene menor longitud media. Es lo que te piden siempre que el enunciado diga "código óptimo". Cae en todos los exámenes.</p>
  <h3>1. Algoritmo binario, tal como se hace en clase</h3>
  <ol class="steps">
    <li><div><b>Ordena</b> las probabilidades de mayor a menor en una columna.</div></li>
    <li><div><b>Agrupa</b> las dos menores. A la de arriba le pones un <span class="cw"><span class="d0">0</span></span> y a la de abajo un <span class="cw"><span class="d1">1</span></span>.</div></li>
    <li><div>Escribe una <b>nueva columna</b> con la suma en lugar de esas dos, otra vez ordenada.</div></li>
    <li><div><b>Repite</b> hasta que queden dos (que reciben 0 y 1).</div></li>
    <li><div><b>Vuelta atrás</b>: la palabra de cada mensaje se lee siguiendo su probabilidad columna a columna desde la última hasta la primera, apuntando los dígitos que se encuentra. Cada vez que un grupo se deshace, sus miembros heredan el prefijo del grupo y añaden su propio dígito.</div></li>
  </ol>
  <p>Ejemplo de las diapositivas: \(X=\{A,\dots,F\}\), \(p=(0{,}15;\,0{,}26;\,0{,}09;\,0{,}25;\,0{,}11;\,0{,}14)\). Pasa el ratón o mira la fila "palabra" bajo cada probabilidad para seguir la vuelta atrás.</p>
  <div data-widget="huffman" data-probs="0.15 0.26 0.09 0.25 0.11 0.14" data-labels="A B C D E F" data-d="2"></div>
  <p>\(L = 2\cdot0{,}51+3\cdot0{,}49 = 2{,}49\) sb/mensaje, muy cerca de \(H(X)=2{,}476\) bits.</p>
</div>

<div class="sec prose">
  <h3>2. Propiedades (pregunta de teoría de 2023)</h3>
  <ul>
    <li>Es <b>óptimo</b>: para cualquier otro código \(C'\), \(L(C_{Huff})\le L(C')\). Puede haber otros códigos con la misma \(L\).</li>
    <li>Las dos propiedades de todo código prefijo óptimo: <b>(1)</b> si \(p_j>p_k\) entonces \(l_j\le l_k\); <b>(2)</b> las dos palabras más largas tienen la misma longitud (y se diferencian solo en el último símbolo; corresponden a los dos mensajes menos probables).</li>
    <li>Como no es peor que Shannon: \(H_D(X)\le L_{Huff}\lt H_D(X)+1\).</li>
    <li>El código binario de Huffman es completo: Kraft suma exactamente 1, así que no se puede recortar.</li>
  </ul>
  <div class="callout idea"><b>El "grado de libertad" (2025)</b><span>Cuando la suma de un grupo empata con otra probabilidad de la columna, puedes colocar el grupo encima o debajo del empate. Las dos opciones dan códigos distintos (incluso con longitudes distintas) pero la misma longitud media. En 2025 pidieron justo eso: los dos códigos posibles para \((0{,}3;\,0{,}2;\,0{,}2;\,0{,}2;\,0{,}1)\). Prueba a cambiar la opción "empates" en la calculadora.</span></div>
  <div data-widget="huffman" data-probs="0.3 0.2 0.2 0.2 0.1" data-labels="a b c d e" data-d="2" data-tie="arriba"></div>
</div>

<div class="sec prose">
  <h3>3. Huffman D-ario y símbolos fantasma</h3>
  <p>Con alfabeto ternario se agrupan los <b>tres</b> menores (dígitos 0, 1, 2), con cuaternario los cuatro, etc. Cada agrupación quita \(D-1\) elementos de la columna, y para terminar con exactamente \(D\) hace falta que</p>
  <div class="fbox"><span class="lbl">Condición</span>\[ N = K(D-1)+1 \quad\text{para algún entero } K \qquad\text{(equivale a } (N-1)\bmod (D-1) = 0) \]</div>
  <p>Si no se cumple, añade <b>mensajes fantasma</b> con probabilidad 0 hasta que se cumpla. En binario (\(D=2\)) nunca hacen falta.</p>
  <div class="example"><span class="lbl">Examen 2024</span>
    <p>8 mensajes, código ternario: \(K\cdot2+1=8\) no tiene solución entera; con \(K=4\) salen 9, así que se añade un fantasma \(Z\) con \(P(Z)=0\). El fantasma recibe una palabra que nunca se usa.</p>
  </div>
  <div data-widget="huffman" data-probs="0.22 0.05 0.13 0.27 0.03 0.04 0.16 0.1" data-labels="a b c d e f g h" data-d="3"></div>
  <p>Resultado: \(L_3 = 1{,}8\) st/mensaje \(= 1{,}8\cdot1{,}585 = 2{,}853\) sb/mensaje.</p>
  <div class="callout ojo"><b>Errores típicos</b><span>Olvidar reordenar cada columna. Agrupar dos en vez de tres en ternario. No añadir el fantasma (el código sale peor de lo óptimo). Dar \(L\) en trits y compararla con una en bits.</span></div>
</div>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'alfabeticos', n: 5, title: 'Códigos alfabéticos: Fano y Shannon-Fano-Elias', day: 1,
      practice: ['fano', 'sfe'],
      html: R`
<div class="sec prose">
  <p class="lead">Un código <b>alfabético</b> conserva el orden de los mensajes: si \(a\) va antes que \(b\), la palabra de \(a\) es lexicográficamente menor que la de \(b\). Huffman no lo garantiza. Si el enunciado pide "alfabético", usa Fano (o Shannon-Fano-Elias).</p>
  <p>Ejemplos: con \(\{a,b,c\}\), el código \(\{00, 1, 01\}\) no es alfabético; \(\{00, 01, 1\}\) y \(\{0, 10, 11\}\) sí. Sirve, por ejemplo, para girar un JPEG sin descomprimirlo.</p>
</div>

<div class="sec prose">
  <h3>1. Código de Fano</h3>
  <ol class="steps">
    <li><div>Deja los mensajes <b>en su orden original</b> (no ordenes por probabilidad si quieres que sea alfabético).</div></li>
    <li><div>Corta la lista en dos trozos consecutivos cuyas probabilidades sumen lo más parecido posible (cada una cerca de la mitad del grupo).</div></li>
    <li><div>El trozo de arriba añade un 0 y el de abajo un 1.</div></li>
    <li><div>Repite dentro de cada trozo hasta que quede un mensaje por trozo.</div></li>
  </ol>
  <div class="callout idea"><b>Truco para cortar rápido</b><span>Escribe la probabilidad acumulada del grupo y busca el valor más cercano a la mitad del total del grupo. Corta justo después de ese mensaje.</span></div>
  <p>Examen 2024: \(p=(0{,}22;\,0{,}05;\,0{,}13;\,0{,}27;\,0{,}03;\,0{,}04;\,0{,}16;\,0{,}1)\). Acumuladas: 0,22 · 0,27 · <b>0,40</b> · 0,67… La más cercana a 0,5 es 0,40, así que el primer corte es \(\{a,b,c\}\,|\,\{d,\dots,h\}\).</p>
  <div data-widget="fano" data-probs="0.22 0.05 0.13 0.27 0.03 0.04 0.16 0.1" data-labels="a b c d e f g h"></div>
  <p>Fano no es óptimo en general, pero suele quedar cerca. En 2024 el Huffman ternario (2,853 sb/mensaje, pasado a bits) salió más corto que el Fano binario (2,98), aunque solo Fano conserva el orden. En 2023 fue al revés: el Fano binario (2,3) ganó al Huffman ternario (2,338).</p>
</div>

<div class="sec prose">
  <h3>2. Shannon-Fano-Elias</h3>
  <p>Usa el punto medio de cada escalón de la función de distribución, en el orden original:</p>
  <div class="fbox"><span class="lbl">SFE</span>\[ \bar F(x) = \sum_{t\lt x}p(t)+\tfrac12 p(x) \qquad l(x) = \left\lceil\log_2\frac{1}{p(x)}\right\rceil+1 \qquad L < H(X)+2 \]</div>
  <ol class="steps">
    <li><div>Calcula la acumulada \(F\) y el punto medio \(\bar F\) de cada mensaje.</div></li>
    <li><div>Pasa \(\bar F\) a binario (multiplica por 2 repetidamente: cada vez que pasa de 1, apuntas un 1 y restas 1).</div></li>
    <li><div>Trunca a \(l(x)\) bits. El +1 garantiza que el valor truncado sigue dentro de su escalón y el código es prefijo.</div></li>
  </ol>
  <div data-widget="sfe" data-probs="0.25 0.25 0.2 0.15 0.15" data-labels="1 2 3 4 5"></div>
  <p>\(H=2{,}29\) bits, \(L=3{,}5\). Quitando el último bit de cada palabra sigue siendo prefijo: el código <b>recortado</b> mide 2,5. En general un código recortado no tiene por qué ser óptimo.</p>
</div>

<div class="sec prose">
  <h3>3. Recortar un código</h3>
  <p>Recortar es quitar el último símbolo de una palabra mientras el código siga siendo prefijo (y no singular). Solo es posible si Kraft suma menos de 1, es decir, si el árbol tiene ramas libres. Un Huffman binario o un Fano binario nunca se pueden recortar (son completos); un Shannon o un SFE casi siempre sí.</p>
</div>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'markov', n: 6, title: 'Cadenas de Markov: modelar y clasificar', day: 2,
      practice: ['markovtexto', 'markovmatriz'],
      html: R`
<div class="sec prose">
  <p class="lead">El problema largo del examen (7–8 puntos) es siempre una fuente con memoria modelada como cadena de Markov. El primer apartado, traducir el enunciado a una matriz, es el que más fallos provoca. Si te equivocas ahí, arrastras el error a todo lo demás.</p>
  <h3>1. Por qué cadenas de Markov</h3>
  <p>Con memoria, \(H(X_1,\dots,X_n)=\sum H(X_i/X_{i-1},\dots,X_1)\le\sum H(X_i)\): la dependencia ahorra bits. Calcular todas las condicionadas es inabordable (\(28^{10}\) casos para 10 letras), así que suponemos memoria limitada:</p>
  <div class="fbox"><span class="lbl">Markov de orden 1</span>\[ P(X_{n+1}=x_{n+1}/X_n,\dots,X_1) = P(X_{n+1}=x_{n+1}/X_n) \]
  \[ p(x_1,\dots,x_n)=p(x_1)\,p(x_2/x_1)\,p(x_3/x_2)\cdots p(x_n/x_{n-1}) \]</div>
  <p>Una cadena de orden \(m\) se convierte en una de orden 1 tomando como "estado" los \(m\) últimos símbolos (por ejemplo, estados aa, ab, ba, bb para orden 2).</p>
</div>

<div class="sec prose">
  <h3>2. Matriz de transición y diagrama</h3>
  <div class="fbox"><span class="lbl">Matriz Π</span>\[ P_{ij} = P(X_{n+1}=j\,/\,X_n=i) \qquad \Pi=\begin{bmatrix}P_{11}&\cdots&P_{1r}\\ \vdots&\ddots&\vdots\\ P_{r1}&\cdots&P_{rr}\end{bmatrix} \]
  \[ \vec\mu^{(n+1)} = \vec\mu^{(n)}\cdot\Pi = \vec\mu^{(1)}\cdot\Pi^{n} \]</div>
  <p><b>La fila \(i\) es "lo que viene después de \(i\)"</b> y siempre suma 1. En el diagrama, cada estado es un círculo y cada \(P_{ij}>0\) una flecha de \(i\) a \(j\); los ceros no se dibujan.</p>
</div>

<div class="sec prose">
  <h3>3. Del enunciado a la matriz</h3>
  <p>Estas frases salen una y otra vez. Apréndetelas:</p>
  <div class="phrase">
    <div>Frase del enunciado</div><div>Qué significa en la fila</div>
    <div>"Después de A la incertidumbre es máxima"</div><div>Fila A uniforme: \(1/r\) en cada columna.</div>
    <div>"Los B nunca se repiten"</div><div>\(P_{BB}=0\).</div>
    <div>"Tras B se observa D con el doble de probabilidad que A y C"</div><div>\(P_{BA}=P_{BC}=x,\ P_{BD}=2x\), y la fila suma 1 → \(4x=1\), \(x=\tfrac14\).</div>
    <div>"Después de una D siempre aparece una A"</div><div>\(P_{DA}=1\), el resto 0.</div>
    <div>"Las B aparecen en ráfagas de longitud media \(L_R\)"</div><div>\(P_{BB} = \dfrac{L_R-1}{L_R}\). La probabilidad de salir es \(1/L_R\).</div>
    <div>"…y siempre van seguidas de una A"</div><div>Toda la salida va a A: \(P_{BA}=1/L_R\).</div>
    <div>"…tras la ráfaga sigue equiprobablemente uno de los otros"</div><div>Reparte \(1/L_R\) a partes iguales entre los demás.</div>
    <div>"Si un día está en C no repite y va equiprobablemente a otra"</div><div>\(P_{CC}=0\), resto a partes iguales.</div>
    <div>"Avanza en promedio 10 m seguidos" (robot, ene 2025)</div><div>Es una ráfaga: \(P_{AA}=9/10\).</div>
    <div>"De los que consumen C, el 10 % pasa a P y el 5 % a O" (ene 2026)</div><div>\(P_{CP}=0{,}1\), \(P_{CO}=0{,}05\) y la diagonal es lo que queda: \(P_{CC}=0{,}85\).</div>
    <div>"Nunca gira en sentido contrario"</div><div>\(P_{DI}=P_{ID}=0\).</div>
    <div>"A aparece siempre en grupos de longitud par" (jun 2026)</div><div>Un estado no basta: usa A' (primera de la pareja, \(P_{A'A}=1\)) y A (pareja cerrada). Una A nueva va siempre a A'.</div>
    <div>"Los símbolos que se pueden emitir son equiprobables"</div><div>En cada fila, reparte a partes iguales entre las salidas permitidas.</div>
  </div>
  <div class="callout idea"><b>De dónde sale \(p=(L_R-1)/L_R\)</b><span>Si en el estado B te quedas con probabilidad \(p\), la longitud de la ráfaga sigue una geométrica \(P(l)=(1-p)p^{l-1}\) de media \(L_R=1/(1-p)\). Despejando, \(p = 1-1/L_R\). Con \(L_R=5\), \(p=0{,}8\).</span></div>
  <div class="example"><span class="lbl">Examen 2025, apartado a</span>
    <p>4 mensajes A, B, C, D. Tras A incertidumbre máxima; B nunca se repite y tras B se ve D con el doble de probabilidad que A y C; tras C \((1/8, 1/2, 1/8, 1/4)\); tras D \((1/4, 1/2, 1/4, 0)\).</p>
    <div data-widget="diagram" data-matrix="1/4 1/4 1/4 1/4; 1/4 0 1/4 1/2; 1/8 1/2 1/8 1/4; 1/4 1/2 1/4 0" data-labels="A B C D"></div>
  </div>
</div>

<div class="sec prose">
  <h3>4. Clasificación (justifica siempre cada palabra)</h3>
  <ul>
    <li><b>Homogénea</b>: Π no cambia con el tiempo. Si el enunciado cambia la matriz ciertos días o cada ciertos saltos, es <b>no homogénea</b>.</li>
    <li><b>Irreducible</b>: desde cualquier estado se llega a cualquier otro (en uno o más saltos). Míralo en el diagrama. Si desde un grupo de estados no se puede volver, esos estados son <b>transitorios</b>.</li>
    <li><b>Periódica de periodo τ</b>: solo se puede volver a un estado en múltiplos de τ saltos (MCD de las longitudes de los caminos de vuelta \(>1\)). Si no, <b>aperiódica</b>. <b>Atajo</b>: si algún estado tiene auto-lazo (\(P_{ii}>0\)) y la cadena es irreducible, es aperiódica.</li>
    <li>Orden 1: el siguiente solo depende del actual.</li>
  </ul>
  <p>Ejemplo de periódica: \(\Pi = \begin{bmatrix}0&\tfrac12&\tfrac12\\1&0&0\\1&0&0\end{bmatrix}\). Solo vuelves a A en 2, 4, 6… saltos: periodo 2, y \(\vec\mu^{(n)}\) oscila sin converger.</p>
</div>

<div class="sec prose">
  <h3>5. Distribución estacionaria y convergencia</h3>
  <div class="fbox"><span class="lbl">Estacionaria</span>\[ \vec\mu_E = \vec\mu_E\cdot\Pi, \qquad \sum_i\mu_i = 1 \]</div>
  <p>Son \(r\) ecuaciones linealmente dependientes: tacha una cualquiera y añade \(\sum\mu_i=1\). Cada ecuación \(j\) se lee en la <b>columna</b> \(j\) de Π:</p>
  <div class="fbox">\[ \mu_j = \sum_i \mu_i P_{ij} \]</div>
  <div class="example"><span class="lbl">Ejemplo de las diapositivas</span>
    <p>\(\Pi=\begin{bmatrix}1/4&3/4\\1/2&1/2\end{bmatrix}\): \(\mu_1=\tfrac14\mu_1+\tfrac12\mu_2\) → \(\tfrac34\mu_1=\tfrac12\mu_2\) → \(\mu_2=\tfrac32\mu_1\). Con \(\mu_1+\mu_2=1\): \(\vec\mu_E=(2/5,\ 3/5)\).</p>
  </div>
  <div class="callout idea"><b>Atajos que ahorran tiempo</b><span>Si dos columnas de Π son iguales, las \(\mu\) correspondientes son iguales (2025: columnas A y C → \(\mu_A=\mu_C\)). Si Π es doblemente estocástica (también las columnas suman 1), \(\vec\mu_E\) es uniforme (2023: \((1/3,1/3,1/3)\)). Si te dan una \(\vec\mu_E\) para comprobar, multiplícala por Π y mira si sale igual.</span></div>
  <p><b>Teoremas que tienes que citar:</b></p>
  <ul>
    <li>CM1 homogénea: es <b>estacionaria</b> si y solo si \(\vec\mu^{(1)}=\vec\mu^{(2)}\), es decir, si arranca en \(\vec\mu_E\).</li>
    <li>CM1 homogénea e <b>irreducible</b>: la distribución estacionaria existe y es <b>única</b>.</li>
    <li>CM1 homogénea, irreducible y <b>aperiódica</b>: <b>converge</b> para cualquier \(\vec\mu^{(1)}\): \(\lim\vec\mu^{(n)} = \vec\mu_a = \vec\mu_E\), y \(\Pi^n\) tiende a una matriz con todas las filas iguales a \(\vec\mu_E\).</li>
    <li>Si es periódica, \(\vec\mu^{(n)}\) oscila con periodo τ.</li>
  </ul>
  <div data-widget="markov" data-matrix="1/4 1/4 1/4 1/4; 1/4 0 1/4 1/2; 1/8 1/2 1/8 1/4; 1/4 1/2 1/4 0" data-labels="A B C D" data-mode="clasificar"></div>
</div>

<div class="sec prose">
  <h3>6. Cadenas no homogéneas (último apartado de 2023 y 2024)</h3>
  <p>Si el enunciado fuerza una distribución concreta cada cierto tiempo ("el lunes siempre pernocta un 60% en A", "cada 3 saltos \(\vec\mu^{(4)}=\vec\mu^{(1)}\)"), la matriz de esa transición tiene <b>todas las filas iguales</b> a la distribución forzada: da igual de dónde vengas. La cadena pasa a ser no homogénea y periódica de periodo 7 (días) o 3 (saltos).</p>
  <p>Su tasa de entropía es la entropía de un periodo dividida entre su longitud, por ejemplo \(\dfrac{H(X_1)+H(X_2/X_1)+H(X_3/X_2)}{3}\).</p>
</div>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'tasa', n: 7, title: 'Tasa de entropía y códigos por transiciones', day: 2,
      practice: ['markovmatriz', 'cadena'],
      html: R`
<div class="sec prose">
  <p class="lead">Una vez tienes Π y \(\vec\mu_E\), los apartados siguientes del problema son: cuántos bits por mensaje hacen falta (tasa de entropía), qué código usar y codificar una cadena.</p>
  <h3>1. Tasa de entropía</h3>
  <div class="fbox"><span class="lbl">Dos definiciones</span>\[ H(\mathcal X) = \lim_{n\to\infty}\frac{H(X_1,\dots,X_n)}{n} \qquad H'(\mathcal X)=\lim_{n\to\infty}H(X_n/X_{n-1},\dots,X_1) \]</div>
  <p>La primera es la entropía media por símbolo; la segunda, la del último símbolo conocido todo el pasado. En general pueden diferir o no existir, pero <b>en procesos estacionarios existen y son iguales</b>.</p>
  <div class="fbox"><span class="lbl">Cadena de Markov estacionaria</span>\[ H(\mathcal X) = H(X_2/X_1) = \sum_i \mu_i\, H(\text{fila } i \text{ de } \Pi) = \sum_{i,j}\mu_iP_{ij}\log\frac1{P_{ij}} \]</div>
  <p>Si la cadena no arranca en \(\vec\mu_E\) pero converge (H, I, A), la información media por símbolo tiende a ese mismo valor. Para "trayectos largos" usa siempre la tasa.</p>
  <div class="callout ojo"><b>No confundas</b><span>\(H(\vec\mu_E)\) es la incertidumbre de un símbolo <b>aislado</b> (sin saber el anterior). La tasa es la incertidumbre de un símbolo <b>conocido el anterior</b>. Siempre \(H(\mathcal X)\le H(\vec\mu_E)\). En 2023: "¿incertidumbre sobre la ciudad en la que está el agente?" → \(H(\vec\mu_a)=\log_2 3=1{,}585\) bits; "bits para trayectos largos" → tasa \(=1{,}314\) bits.</span></div>
</div>

<div class="sec prose">
  <h3>2. Codificar por estados o por transiciones</h3>
  <ul>
    <li><b>Por estados</b>: un único Huffman sobre \(\vec\mu_E\), ignorando la memoria. Como mucho llega a \(H(\vec\mu_E)\).</li>
    <li><b>Por transiciones</b>: un Huffman distinto para cada fila de Π. Para codificar \(X_{n+1}\) usas el código de la fila de \(X_n\). Su longitud media es \(\bar L=\sum_i\mu_i L_i\) y puede acercarse a la tasa.</li>
  </ul>
  <p>Si las filas son diádicas (potencias de \(1/2\)), cada Huffman de fila alcanza exactamente \(H(\text{fila})\) y por transiciones se llega a la tasa. En 2025: por estados \(L=2\) sb/mensaje; por transiciones \(1{,}667\). Sí merece la pena: unos 17 % menos de bits.</p>
  <div class="callout idea"><b>Filas especiales</b><span>Una fila determinista (después de D siempre A) no necesita código: 0 bits, el receptor ya lo sabe. Una fila con una probabilidad de repetición muy alta (ráfagas largas) se codifica mal con Huffman (mínimo 1 bit por símbolo): ahí usa RLE (lección 8).</span></div>
  <div data-widget="markov" data-matrix="1/4 1/4 1/4 1/4; 1/4 0 1/4 1/2; 1/8 1/2 1/8 1/4; 1/4 1/2 1/4 0" data-labels="A B C D" data-mode="codigos" data-seq="AABCCBDABCC"></div>
</div>

<div class="sec prose">
  <h3>3. Codificar una cadena</h3>
  <ol class="steps">
    <li><div>El <b>primer símbolo</b> se codifica con un código inicial (en 2025, uno de longitud fija: 00, 01, 10, 11; también vale Huffman sobre \(\vec\mu^{(1)}\)). Algunos enunciados dicen "olvide el símbolo inicial".</div></li>
    <li><div>Para cada símbolo siguiente, mira el <b>anterior</b> y usa la palabra que le corresponde en el código de esa fila.</div></li>
    <li><div>Si la transición es determinista, no escribes nada.</div></li>
  </ol>
  <div class="callout ojo"><b>Sobre la solución oficial de 2025</b><span>Codificando AABCCBDABCC con sus códigos sale <span class="cw">00 00 01 01 111 0 1 10 01 01 111</span>. La solución oficial omite el <span class="cw">111</span> de la transición C→C del quinto símbolo. Cuenta siempre: \(n\) símbolos son 1 código inicial más \(n-1\) transiciones.</span></div>
  <p><b>Descodificar</b> es el camino inverso: lee el primer símbolo con el código inicial y, a partir de ahí, lee bits con el código de la fila del último símbolo descodificado hasta completar una palabra.</p>
</div>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'rle', n: 8, title: 'Codificación de ráfagas (RLE) y Lempel-Ziv', day: 3,
      practice: ['rle'],
      html: R`
<div class="sec prose">
  <p class="lead">Si un estado se repite con probabilidad alta (ráfagas de longitud media 5, 16…), codificar símbolo a símbolo gasta al menos 1 bit por símbolo aunque la entropía sea mucho menor. La solución es codificar la <b>longitud de la ráfaga</b>. Ha salido en oct 2024, jun 2024, ene 2025 y ene 2026, y en la hoja de clase 3.</p>
  <h3>1. La ráfaga es una geométrica</h3>
  <div class="fbox">\[ P(l) = (1-p)\,p^{\,l-1},\ \ l=1,2,\dots \qquad L_R = \frac1{1-p} \qquad p=\frac{L_R-1}{L_R} \]</div>
  <p>Caso fácil, \(p=\tfrac12\): \(P(l) = 1/2^l\) es diádica y el código unario 0, 10, 110, 1110… es óptimo, con \(L=2\) bits por ráfaga.</p>
</div>

<div class="sec prose">
  <h3>2. El código para \(p^m\approx\tfrac12\)</h3>
  <p>Si agrupas las longitudes de \(m\) en \(m\) (1…m, m+1…2m, …) y \(p^m=\tfrac12\), cada grupo tiene la mitad de probabilidad que el anterior: los grupos forman una distribución diádica.</p>
  <ol class="steps">
    <li><div><b>Calcula p</b> con \(p=(L_R-1)/L_R\).</div></li>
    <li><div><b>Elige m</b>: calcula \(-1/\log_2 p\), prueba el entero de abajo y el de arriba y quédate con el que deje \(p^m\) más cerca de 0,5. (2024: \(p=0{,}8\): \(p^3=0{,}512\), \(p^4=0{,}4096\) → \(m=3\).)</div></li>
    <li><div><b>Preámbulo (grupo)</b>: \(k=\lfloor(l-1)/m\rfloor\) unos seguidos de un 0. Longitud media \(L_G = \dfrac{1}{1-p^m}\approx 2\) bits.</div></li>
    <li><div><b>Subgrupo (resto)</b>: \(r=(l-1)\bmod m\), codificado con un Huffman de \(m\) elementos con probabilidades \(\dfrac{p^r(1-p)}{1-p^m}\). Como son casi uniformes, las palabras miden \(\lfloor\log_2 m\rfloor\) o \(\lceil\log_2 m\rceil\). Para \(m=3\): 0, 10, 11.</div></li>
    <li><div><b>Palabra</b> = preámbulo + subgrupo. \(L_{RLE}=L_G+L_{SG}\) bits por ráfaga, y \(L_{RLE}/L_R\) bits por símbolo. Compárala con la entropía del salto \(H(p)\).</div></li>
  </ol>
  <div data-widget="rle" data-lr="5"></div>
  <div class="example"><span class="lbl">Examen 2024</span>
    <p>\(L_G = 1/(1-0{,}512) = 2{,}05\), \(L_{SG}=1{,}59\) → \(L_{RLE}=3{,}64\) bits/ráfaga → \(3{,}64/5 = 0{,}728\) bits/símbolo, frente a \(H(0{,}8)=0{,}722\): solo un 1 % por encima. Con Huffman por fila habrías gastado 1 bit/símbolo.</p>
  </div>
  <div class="callout ojo"><b>¿Qué pasa al acabar la ráfaga?</b><span>En 2024 las B "siempre van seguidas de una A", así que el código de la ráfaga ya dice qué viene después. Si tras la ráfaga puede venir uno de varios símbolos (Ejercicio 3: "sigue equiprobablemente uno de los otros dos colores"), añade tras cada ráfaga la palabra que indica cuál: 1 bit si son dos equiprobables. Entonces los bits por símbolo son \((L_{RLE}+1)/L_R\).</span></div>
  <div class="callout idea"><b>Cómo lo hacen las soluciones oficiales (ene 2025, jun 2024, ene 2026)</b><span>Codifican el resto con \(\lceil\log_2 m\rceil\) bits fijos ("los 7 casos con 3 bits": 000…110), y no con Huffman. Así \(L_{RLE}=\frac1{1-p^m}+\lceil\log_2 m\rceil(+1)\). Por ejemplo, con \(p=0{,}9\), \(m=7\): \((1{,}917+3+1)/10=0{,}5917\). Las dos formas son válidas (Huffman sale algo más corto); en la calculadora puedes elegir "bits fijos" para que salgan sus mismos números.</span></div>
</div>

<div class="sec prose">
  <h3>3. RLE para fuentes binarias (notas de clase)</h3>
  <p>Para una secuencia binaria iid donde un símbolo es mucho más probable, se codifica la distancia \(n_j\) entre unos consecutivos. Se elige \(k\) con \(p^k\approx\tfrac12\) y se envía cada \(n_j\) como el par cociente-resto \((c_j, r_j)\): el cociente con un código 00…1 (unario, media ≈ 2 bits) y el resto con un código casi uniforme de \(\log k\) bits. En total unos \((2+\log k)(1-p)\) bits por símbolo de la fuente, cerca de la tasa de entropía.</p>
</div>

<div class="sec prose">
  <h3>4. Lempel-Ziv (solo teoría)</h3>
  <ul>
    <li><b>Idea</b>: modelar y codificar a la vez con un diccionario que se construye sobre la marcha (adaptativo). Usa segmentación ávida: en cada paso busca la cadena más larga que ya esté en el diccionario. Alcanza asintóticamente la tasa de entropía.</li>
    <li><b>LZ77 (ventana deslizante)</b>: el diccionario es el texto recién codificado (ventana de búsqueda, miles de símbolos) y se mira la ventana frontal (decenas). Cada paso emite la tripleta \(\langle\)retroceso, longitud, siguiente símbolo\(\rangle\). Límite: la ventana fija. Usos: ZIP, GZIP, PNG, DEFLATE, RAR.</li>
    <li><b>LZ78</b>: sin ventana; el diccionario guarda las cadenas ya vistas. Emite pares \(\langle\)índice, símbolo siguiente\(\rangle\) y las entradas van creciendo.</li>
    <li><b>LZW (Welch, 1984)</b>: arranca con los símbolos sueltos en el diccionario y emite solo índices. Usos: GIF, TIFF, compress de Unix, módems V.42bis.</li>
  </ul>
  <div class="example"><span class="lbl">LZ77 estilo Gzip: ABRACADABRA</span>
    <p class="mono">(0,'A') (0,'B') (0,'R') (3,1) (0,'C') (2,1) (0,'D') (7,4)</p>
    <p class="small">Un par (0, carácter) mete un literal; (d, l) copia l símbolos empezando d posiciones atrás. Después se codifican distancias y longitudes con dos Huffman.</p>
  </div>
</div>`
    }
  ];

  /* ------------------------------------------------------------------ */
  const cards = [
    // Entropía
    { t: 'Entropía', src: 'Examen 2024', q: R`¿Cuál es la relación entre la información mutua de dos variables y la entropía condicional? Escribe la expresión y dibuja el diagrama de Venn.`, a: R`<p>\(I(X;Y)=H(X)-H(X/Y)=H(Y)-H(Y/X)\). En el Venn: dos círculos \(H(X)\) y \(H(Y)\); la intersección es \(I(X;Y)\), la parte solo de X es \(H(X/Y)\), la parte solo de Y es \(H(Y/X)\) y la unión es \(H(X,Y)\).</p><div data-widget="venn"></div>` },
    { t: 'Entropía', src: 'Examen 2024', q: R`Un dado legal y una moneda legal: ¿cuál genera más incertidumbre? Pon un ejemplo de distribución menos desordenada.`, a: R`<p>\(H(1/6,\dots,1/6)=\log_2 6=2{,}585\) bits \(>H(1/2,1/2)=1\) bit. Ambas son uniformes (máximo \(\log|\mathcal X|\)) y el dado tiene más resultados. Menos desordenada: \((0{,}9;\,0{,}05;\,0{,}05)\).</p>` },
    { t: 'Entropía', src: 'Examen 2023', q: R`¿Qué es y cómo se calcula la entropía relativa entre dos distribuciones?`, a: R`<p>\(D(p\|q)=\sum_x p(x)\log\frac{p(x)}{q(x)}=E_p[\log\frac{p}{q}]\). Mide la ineficiencia de suponer que la distribución es \(q\) cuando es \(p\) (bits de más por mensaje). \(D\ge0\), \(D=0\iff p=q\), y no es simétrica, así que no es una distancia métrica.</p>` },
    { t: 'Entropía', src: 'Examen 2023', q: R`Justifica que \(H(X,Y)\le H(X)+H(Y)\). ¿Cuándo son iguales?`, a: R`<p>Por la regla de la cadena \(H(X,Y)=H(X)+H(Y/X)\) y como condicionar reduce la entropía, \(H(Y/X)\le H(Y)\). Equivalente: \(H(X)+H(Y)-H(X,Y)=I(X;Y)\ge0\). Igualdad si y solo si \(X\) e \(Y\) son independientes (\(I(X;Y)=0\)).</p>` },
    { t: 'Entropía', src: 'Diapositivas', q: R`Define entropía y da sus cotas.`, a: R`<p>\(H(X)=-\sum p(x)\log p(x)=E[\log 1/p(X)]\): información media de la fuente. \(0\le H(X)\le\log|\mathcal X|\); 0 si es determinista, máximo si es uniforme.</p>` },
    { t: 'Entropía', src: 'Diapositivas', q: R`Enuncia la regla de la cadena para la entropía de n variables.`, a: R`<p>\(H(X_1,\dots,X_n)=\sum_{i=1}^n H(X_i/X_{i-1},\dots,X_1)\). Corolario: \(H(X,Y/Z)=H(X/Z)+H(Y/X,Z)\).</p>` },
    { t: 'Entropía', src: 'Diapositivas', q: R`¿Condicionar reduce la entropía? Matiza.`, a: R`<p>En promedio sí: \(H(X/Y)\le H(X)\) porque \(I(X;Y)\ge0\), con igualdad si son independientes. Pero un valor concreto \(H(X/Y=y)\) puede ser mayor que \(H(X)\) (ejemplo de clase: \(H(X)=0{,}544\), \(H(X/Y=2)=1\) bit, \(H(X/Y)=0{,}25\)).</p>` },
    { t: 'Entropía', src: 'Diapositivas', q: R`Define información mutua y escribe sus relaciones con las entropías.`, a: R`<p>\(I(X;Y)=\sum p(x,y)\log\frac{p(x,y)}{p(x)p(y)}=D(p(x,y)\|p(x)p(y))\). \(I=H(X)-H(X/Y)=H(Y)-H(Y/X)=H(X)+H(Y)-H(X,Y)\); \(I(X;X)=H(X)\); \(I\ge0\), \(=0\iff\) independientes.</p>` },
    { t: 'Entropía', src: 'Diapositivas', q: R`Enuncia el teorema del proceso de información.`, a: R`<p>Si \(X\to Y\to Z\) es una cadena de Markov (por ejemplo \(Z=f(Y)\)), entonces \(I(X;Y)\ge I(X;Z)\): ningún procesado de los datos aumenta la información mutua. Se demuestra con \(I(X;Y,Z)=I(X;Z)+I(X;Y/Z)=I(X;Y)+I(X;Z/Y)\) e \(I(X;Z/Y)=0\).</p>` },
    { t: 'Entropía', src: 'Diapositivas', q: R`Enuncia la desigualdad de Jensen (con la convención de clase).`, a: R`<p>Si \(f\) es "cóncava" en el sentido de las diapositivas (\(f(\lambda x_1+(1-\lambda)x_2)\le\lambda f(x_1)+(1-\lambda)f(x_2)\), por ejemplo \(x^2\)), entonces \(E[f(X)]\ge f(E[X])\). Para "convexa" (\(\log x\)) se invierte. Con ella se prueba \(D(p\|q)\ge0\), \(I\ge0\) y \(H\le\log|\mathcal X|\).</p>` },
    { t: 'Entropía', src: 'Formulario', q: R`¿Qué dice el agrupamiento de la entropía?`, a: R`<p>Si \(X'\) es una partición de \(X\), \(H(X)=H(X')+H(X/X')\): primero eliges el grupo y luego el elemento dentro del grupo.</p>` },
    // Códigos
    { t: 'Códigos', src: 'Examen 2023', q: R`¿Cómo se clasifican los códigos fuente? Nombre y descripción.`, a: R`<p><b>Singular / no singular</b> (mensajes distintos, palabras distintas). <b>Unívocamente descodificable</b>: su extensión (concatenación) es no singular. <b>Prefijo o instantáneo</b>: ninguna palabra es prefijo de otra, se descodifica sin esperar. Inclusiones: prefijo ⊂ UD ⊂ no singular ⊂ todos. También <b>bloque</b>: cada mensaje se asigna a una secuencia fija.</p>` },
    { t: 'Códigos', src: 'Examen 2024', q: R`Longitudes binarias {1 2 3 4 5}: ¿qué significa que cumplan Kraft? ¿Un código con esas longitudes es óptimo?`, a: R`<p>\(\sum 2^{-l_i}=31/32\le1\): existe un código prefijo binario con esas longitudes (árbol de Kraft de profundidad 5). No es óptimo: las dos palabras más largas de un código óptimo deben tener la misma longitud (y corresponder a los dos sucesos menos probables); la de longitud 5 se puede acortar a 4.</p>` },
    { t: 'Códigos', src: 'Examen 2024', q: R`"Ningún código UD puede ser recortado sin perder la propiedad UD". ¿Verdadero? ¿Puede ser UD un código con asignación no inyectiva?`, a: R`<p>Falso: \(\{00,11\}\) se recorta a \(\{0,1\}\). Y no: si la asignación no es inyectiva, al menos una palabra corresponde a dos mensajes; el código es singular y no es UD.</p>` },
    { t: 'Códigos', src: 'Diapositivas', q: R`Enuncia la desigualdad de Kraft y el teorema de McMillan.`, a: R`<p>Kraft: existe un código prefijo \(D\)-ario con longitudes \(l_i\) si y solo si \(\sum D^{-l_i}\le1\). McMillan: las longitudes de cualquier código UD también la cumplen, así que no se gana longitud media buscando UD que no sean prefijo.</p>` },
    { t: 'Códigos', src: 'Diapositivas', q: R`¿En qué consiste el ensayo de Sardinas-Patterson?`, a: R`<p>Comprueba si un código es UD. \(C_0=C\); \(C_n\) son los sufijos \(w\) tales que \(uw=v\) con \(u\in C, v\in C_{n-1}\) o \(u\in C_{n-1}, v\in C\). El código es UD si y solo si \(C\) y \(C_\infty=C_1\cup C_2\cup\dots\) son disjuntos.</p>` },
    { t: 'Códigos', src: 'Diapositivas', q: R`Enuncia el primer teorema de Shannon.`, a: R`<p>Para todo código prefijo (o UD) \(D\)-ario, \(L\ge H_D(X)\), con igualdad si y solo si \(p_i=D^{-l_i}\) (distribución \(D\)-ádica). Demostración: \(L-H_D=D(p\|r)+\log_D(1/\sum D^{-l_i})\ge0\).</p>` },
    { t: 'Códigos', src: 'Diapositivas', q: R`¿Cómo es el código de Shannon y qué cota cumple? ¿Y si se codifican bloques de n símbolos?`, a: R`<p>\(l_i=\lceil\log_D 1/p_i\rceil\), con \(H_D(X)\le L\lt H_D(X)+1\). Con bloques de \(n\) símbolos iid: \(H_D(X)\le L_n\lt H_D(X)+1/n\). Si la fuente es estacionaria, \(L_n\to H_D(\mathcal X)\) (tasa de entropía).</p>` },
    { t: 'Códigos', src: 'Diapositivas', q: R`¿Qué pasa si diseño un código con una distribución \(q\) cuando la real es \(p\)?`, a: R`<p>Código desacoplado: con \(l_i=\lceil\log 1/q_i\rceil\), \(H(p)+D(p\|q)\le L\lt H(p)+D(p\|q)+1\). La penalización es la entropía relativa.</p>` },
    { t: 'Códigos', src: 'Examen 2023', q: R`Huffman estableció dos propiedades que cumple todo código prefijo óptimo. ¿Cuáles son?`, a: R`<p>1) Si \(p_j>p_k\) entonces \(l_j\le l_k\) (más probable, más corta). 2) Las dos palabras más largas tienen la misma longitud (se diferencian solo en el último bit y corresponden a los dos mensajes menos probables).</p>` },
    { t: 'Códigos', src: 'Diapositivas', q: R`¿Qué cota cumple la longitud media de Huffman? ¿Es único el código de Huffman?`, a: R`<p>\(H_D(X)\le L_{Huff}\lt H_D(X)+1\) y \(L_{Huff}\le L(C')\) para cualquier otro código. No es único: con empates o cambiando la asignación de 0/1 salen códigos distintos con la misma \(L\).</p>` },
    { t: 'Códigos', src: 'Diapositivas', q: R`¿Cuántos símbolos fantasma hacen falta en un Huffman D-ario?`, a: R`<p>Los necesarios para que \(N=K(D-1)+1\), es decir \((N-1)\bmod(D-1)=0\). Se añaden con probabilidad 0. Ejemplo: 8 mensajes en ternario → 9 → 1 fantasma.</p>` },
    { t: 'Códigos', src: 'Diapositivas', q: R`¿Qué es un código alfabético? Da dos ejemplos de construcción.`, a: R`<p>El que conserva el orden de los mensajes en el orden lexicográfico de las palabras. Fano (en su versión sin reordenar) y Shannon-Fano-Elias. Huffman no lo garantiza.</p>` },
    { t: 'Códigos', src: 'Diapositivas', q: R`Describe el código de Shannon-Fano-Elias y su longitud media.`, a: R`<p>\(\bar F(x)=\sum_{t\lt x}p(t)+p(x)/2\); la palabra es \(\bar F(x)\) en binario truncado a \(l(x)=\lceil\log 1/p(x)\rceil+1\) bits. Es prefijo porque los intervalos \([\lfloor\bar F\rfloor_l,\lfloor\bar F\rfloor_l+2^{-l})\) son disjuntos. \(L\lt H(X)+2\).</p>` },
    { t: 'Códigos', src: 'Diapositivas', q: R`¿Qué es la eficiencia de un código?`, a: R`<p>\(\eta=H_D(X)/L\), con ambas en la misma unidad. Redundancia \(=1-\eta\). Para comparar un código ternario con uno binario, pasa \(L_3\) a bits multiplicando por \(\log_2 3\).</p>` },
    // Markov
    { t: 'Markov', src: 'Diapositivas', q: R`¿Qué es una cadena de Markov de orden m? ¿Cómo se reduce a orden 1?`, a: R`<p>Un proceso con espacio discreto en el que \(P(X_n/X_{n-1},\dots,X_1)=P(X_n/X_{n-m},\dots,X_{n-1})\). Se reduce a orden 1 definiendo como estado los \(m\) últimos símbolos \(s_L=\{x_{L-m+1},\dots,x_L\}\).</p>` },
    { t: 'Markov', src: 'Diapositivas', q: R`Define proceso estacionario y cadena homogénea. ¿Cuándo es estacionaria una CM1 homogénea?`, a: R`<p>Estacionario: la distribución conjunta no cambia al trasladar el origen de tiempos. Homogénea: Π no depende del tiempo. Una CM1 homogénea es estacionaria si \(\vec\mu^{(1)}=\vec\mu^{(2)}\), es decir, si \(\vec\mu^{(1)}=\vec\mu_E\) (autovector de Π).</p>` },
    { t: 'Markov', src: 'Diapositivas', q: R`Define cadena irreducible, estado transitorio y periodicidad.`, a: R`<p>Irreducible: todo estado es alcanzable desde cualquier otro (\(\forall i,j\ \exists n: P_{ij}^{(n)}>0\)). Transitorio: a partir de cierto momento no se vuelve a él. Periódico de periodo τ: \(P_{ii}^{(n)}\ne0\) solo si \(n\) es múltiplo de τ (MCD de los saltos de vuelta \(>1\)). En una cadena irreducible todos los estados tienen el mismo periodo.</p>` },
    { t: 'Markov', src: 'Diapositivas', q: R`¿Qué garantiza que una CM1 homogénea tenga una única distribución estacionaria? ¿Y que converja?`, a: R`<p>Homogénea + irreducible ⇒ distribución estacionaria única. Homogénea + irreducible + aperiódica ⇒ converge para cualquier \(\vec\mu^{(1)}\) a \(\vec\mu_a=\vec\mu_E\); \(\Pi^n\) tiende a una matriz con todas las filas iguales. Si es periódica, \(\vec\mu^{(n)}\) oscila.</p>` },
    { t: 'Markov', src: 'Diapositivas', q: R`¿Cómo se calcula la distribución estacionaria?`, a: R`<p>Resolviendo \(\vec\mu_E=\vec\mu_E\Pi\): \(r\) ecuaciones \(\mu_j=\sum_i\mu_iP_{ij}\) linealmente dependientes. Se elimina una y se añade \(\sum\mu_i=1\).</p>` },
    { t: 'Markov', src: 'Diapositivas', q: R`Define tasa de entropía (las dos versiones). ¿Cuándo coinciden?`, a: R`<p>\(H(\mathcal X)=\lim H(X_1,\dots,X_n)/n\) (entropía media por símbolo) y \(H'(\mathcal X)=\lim H(X_n/X_{n-1},\dots,X_1)\) (entropía del último dado el pasado). En procesos estacionarios existen y son iguales.</p>` },
    { t: 'Markov', src: 'Diapositivas', q: R`¿Cuál es la tasa de entropía de una cadena de Markov estacionaria?`, a: R`<p>\(H(\mathcal X)=H(X_2/X_1)=\sum_{i,j}\mu_iP_{ij}\log\frac1{P_{ij}}=\sum_i\mu_iH(\text{fila } i)\).</p>` },
    { t: 'Markov', src: 'Examen 2023', q: R`Diferencia entre \(H(\vec\mu_E)\) y la tasa de entropía en un problema de Markov.`, a: R`<p>\(H(\vec\mu_E)\) es la incertidumbre sobre un símbolo aislado (por ejemplo, la ciudad en la que está el agente sin saber nada más). La tasa es la incertidumbre por símbolo en trayectos largos, conocido el anterior. Siempre tasa \(\le H(\vec\mu_E)\).</p>` },
    { t: 'Markov', src: 'Examen 2025', q: R`¿Es mejor codificar por estados o por transiciones?`, a: R`<p>Por estados (un Huffman sobre \(\vec\mu_E\)) no baja de \(H(\vec\mu_E)\). Por transiciones (un Huffman por fila) da \(\sum\mu_iL_i\), que se acerca a la tasa \(\sum\mu_iH(\text{fila})\) y la alcanza si las filas son diádicas. Merece la pena si la tasa es claramente menor que \(H(\vec\mu_E)\).</p>` },
    { t: 'Markov', src: 'Examen 2025', q: R`¿Tienen \(X_n, X_{n+1}, X_{n+2}\) de una CM1 relación markoviana?`, a: R`<p>Sí: \(I(X_n;X_{n+2}/X_{n+1})=H(X_{n+2}/X_{n+1})-H(X_{n+2}/X_n,X_{n+1})=0\) porque, conocido \(X_{n+1}\), \(X_n\) no aporta nada. Por tanto \(X_n\to X_{n+1}\to X_{n+2}\).</p>` },
    // RLE / LZ
    { t: 'RLE y LZ', src: 'Diapositivas', q: R`Ráfagas de longitud media \(L_R\): ¿cuál es la probabilidad de repetición? ¿Qué distribución sigue la longitud?`, a: R`<p>Geométrica \(P(l)=(1-p)p^{l-1}\) con media \(L_R=1/(1-p)\), así que \(p=(L_R-1)/L_R\).</p>` },
    { t: 'RLE y LZ', src: 'Diapositivas', q: R`Describe el código de longitud de recorrido para \(G(p)\) con \(p^m\approx1/2\).`, a: R`<p>Palabra = preámbulo + resto. Preámbulo: \(k=\lfloor(l-1)/m\rfloor\) unos y un 0, longitud media \(1/(1-p^m)\approx2\). Resto \(r=(l-1)\bmod m\) con un Huffman de \(m\) elementos casi equiprobables (\(\approx\log_2 m\) bits). Total por ráfaga \(\approx2+\log_2 m\); por símbolo, dividir entre \(L_R\).</p>` },
    { t: 'RLE y LZ', src: 'Diapositivas', q: R`Diferencias entre LZ77, LZ78 y LZW.`, a: R`<p>LZ77: ventana deslizante, tripletas \(\langle\)retroceso, longitud, símbolo\(\rangle\) (ZIP, PNG). LZ78: diccionario de cadenas ya codificadas sin ventana, pares \(\langle\)índice, símbolo\(\rangle\). LZW: diccionario inicial con los símbolos, envía solo índices (GIF, compress). Todos usan segmentación ávida y alcanzan asintóticamente la tasa de entropía.</p>` },
    { t: 'RLE y LZ', src: 'Diapositivas', q: R`¿Por qué no basta con un Huffman por fila cuando hay ráfagas largas?`, a: R`<p>Huffman asigna al menos 1 bit a cada símbolo, mientras que la entropía del salto \(H(p)\) con \(p\) cercano a 1 es mucho menor que 1 bit. Codificando longitudes de ráfaga se reparte el coste entre todos los símbolos de la ráfaga.</p>` },
    // Exámenes de enero y junio
    { t: 'Entropía', src: 'Examen ene 2026', q: R`a) Define la información mutua entre dos fuentes. b) ¿Qué indica que valga cero? c) ¿Puede ser negativa?`, a: R`<p>a) \(I(X;Y)=\sum p(x,y)\log\frac{p(x,y)}{p(x)p(y)}=H(X)-H(X/Y)\): cuánto se reduce la incertidumbre sobre una fuente al conocer la otra. b) \(I=0\) ⇔ X e Y son independientes. c) No: \(I(X;Y)=D(p(x,y)\|p(x)p(y))\ge0\) por el teorema de Gibbs (conocer una fuente no puede aumentar, en media, la incertidumbre sobre la otra).</p>` },
    { t: 'Entropía', src: 'Examen jun 2024', q: R`Indica 3 definiciones o interpretaciones de lo que mide la entropía de Shannon.`, a: R`<p>1) La cantidad de información (media) que genera una fuente. 2) La incertidumbre previa que se tiene sobre la fuente antes de ver el mensaje. 3) Una medida de la aleatoriedad (desorden) de una distribución. Otra válida: el número mínimo medio de bits por mensaje con el que se puede codificar la fuente (primer teorema de Shannon).</p>` },
    { t: 'Códigos', src: 'Examen ene 2026', q: R`a) Enuncia el teorema de McMillan. b) Explica sus diferencias con el teorema de Kraft y sus consecuencias.`, a: R`<p>a) Todo código D-ario <b>unívocamente descodificable</b> con longitudes \(l_1,\dots,l_r\) cumple \(\sum D^{-l_i}\le1\).</p><p>b) Kraft es condición necesaria y suficiente para que exista un código <b>prefijo</b> con esas longitudes; McMillan extiende la condición necesaria a todos los UD, aunque no sean prefijo. Consecuencias: limita las longitudes de cualquier código sin pérdidas; permite probar que \(L\ge H_D(X)\) para todo UD; y no se pierde nada restringiéndose a códigos prefijo (como Huffman), porque ningún UD puede tener longitudes "mejores".</p>` },
    { t: 'Códigos', src: 'Examen jun 2026', q: R`¿Qué ocurre con la eficiencia al aumentar la extensión del código? Pon un ejemplo real donde la extensión no sea viable.`, a: R`<p>Extender = codificar bloques de \(n\) símbolos en vez de símbolos sueltos. La eficiencia aumenta: por el primer teorema de Shannon \(H\le L_n/n\lt H+1/n\), así que \(L_n/n\to H(X)\).</p><p>No es viable cuando el alfabeto es grande o hay prisa: el número de palabras crece como \(|\mathcal X|^n\) (texto de 256 caracteres en bloques de 4 → más de 4000 millones de palabras en la tabla) y hay que esperar \(n\) símbolos antes de codificar (retardo inaceptable en voz o videollamadas en tiempo real).</p>` },
    { t: 'Códigos', src: 'Examen jun 2026', q: R`¿Todo código unívocamente descodificable es prefijo? ¿Puede existir un código óptimo que no sea prefijo?`, a: R`<p>No: todo prefijo es UD, pero no al revés (p. ej. \(\{0,01,011\}\) es UD y no es prefijo). Sí puede haber un código óptimo no prefijo, pero por McMillan para cualquier UD óptimo existe un código prefijo con las mismas longitudes y la misma \(L\); en la práctica se usa el prefijo porque se descodifica al instante.</p>` },
    { t: 'Códigos', src: 'Examen jun 2026', q: R`¿Pueden Fano (Shannon-Fano) y Huffman dar el mismo código binario? ¿En qué condiciones?`, a: R`<p>Sí, cuando los cortes de Fano coinciden con las agrupaciones que hace Huffman. Ejemplo: \(P=(0{,}4;\ 0{,}3;\ 0{,}2;\ 0{,}1)\) → los dos dan longitudes \((1,2,3,3)\), p. ej. \((0,10,110,111)\). En general siempre coinciden si la distribución es diádica (\(p_i=2^{-l_i}\)).</p>` },
    { t: 'Códigos', src: 'Examen jun 2026', q: R`Para \(P(X)=(1/3,1/3,1/9,1/9,1/9)\), da las longitudes de un código ternario óptimo y justifica cuánto vale su longitud media respecto a la entropía.`, a: R`<p>\(l=(1,1,2,2,2)\), p. ej. \((1,2,00,01,02)\). La distribución es 3-ádica (\(p_i=3^{-l_i}\)), así que el código alcanza la cota del primer teorema: \(L=H_3(X)=4/3\) trits/mensaje, sin redundancia.</p>` },
    { t: 'Códigos', src: 'Examen jun 2024', q: R`Pon un ejemplo de código fuente que sea recortable y otro que no lo sea.`, a: R`<p>El código de Shannon suele poder recortarse (sus longitudes \(\lceil\log1/p\rceil\) dejan Kraft \(<1\)). Huffman y Fano no se pueden recortar: son completos (Kraft = 1, todas las ramas del árbol están usadas).</p>` },
    { t: 'Códigos', src: 'Ejercicios de clase 2', q: R`¿Es prefijo el código \(\{a,\ ab,\ abc\}\)? ¿Y \(\{a,\ ba,\ cba\}\)? ¿Qué ventaja tiene el segundo?`, a: R`<p>El primero no es prefijo (a es prefijo de ab y de abc), aunque sí es UD: la a marca el comienzo de cada palabra, así que hay que esperar a la siguiente a para saber dónde acabó la anterior. El segundo sí es prefijo (la a marca el final): se descodifica al instante, sin retardo.</p>` },
    { t: 'Markov', src: 'Examen ene 2026', q: R`a) Define la tasa de entropía de una fuente. b) ¿Cómo se calcula en una cadena de Markov estacionaria de primer orden y qué interpretación tiene?`, a: R`<p>a) \(H(\mathcal X)=\lim\frac1nH(X_1,\dots,X_n)\); también la incremental \(H'(\mathcal X)=\lim H(X_n/X_{n-1},\dots,X_1)\).</p><p>b) En una CM1 estacionaria coinciden y valen \(H(X_2/X_1)=\sum_i\mu_iH(X_2/X_1=i)=\sum_i\mu_i\sum_jP_{ij}\log\frac1{P_{ij}}\). Es la incertidumbre media por símbolo teniendo en cuenta la memoria (la información realmente nueva de cada símbolo) y el límite de compresión sin pérdidas de la fuente.</p>` },
    { t: 'Markov', src: 'Examen ene 2026', q: R`¿Por qué en una cadena de Markov homogénea basta con que las dos primeras distribuciones sean iguales para que sea estacionaria?`, a: R`<p>En una cadena homogénea \(\vec\mu^{(n+1)}=\vec\mu^{(n)}\Pi\) con Π fija. Si \(\vec\mu^{(2)}=\vec\mu^{(1)}\), aplicando Π otra vez \(\vec\mu^{(3)}=\vec\mu^{(2)}\) y así sucesivamente: todas las marginales son iguales. Como además las condicionales (Π) no cambian con el tiempo, toda la distribución conjunta es invariante a traslaciones: \(P(X_1=x_1,\dots,X_n=x_n)=P(X_{l+1}=x_1,\dots,X_{l+n}=x_n)\). Si \(\vec\mu^{(2)}\ne\vec\mu^{(1)}\), la distribución ya cambió en el primer paso y no puede ser estacionaria.</p>` }
  ];

  /* ------------------------------------------------------------------ */
  const exams = [
    {
      id: 'jun26', title: 'Junio 2026', date: '24 de junio de 2026', minutes: 50,
      intro: 'Teoría (15 min, 4 preguntas: están en el test de teoría) + dos problemas. Solo está la parte del primer parcial; la del segundo (códigos de canal) no entra.',
      problems: [
        {
          title: 'Problema 1 · 3 puntos',
          statement: R`<p>Se dispone de un dado de 6 caras trucado de tal manera que los números pares aparecen el doble de veces que los impares, sin distinción entre ellos.</p>`,
          parts: [
            { tag: 'a', pts: 1.5, q: R`Diseñar un código alfabético binario, calcular su longitud media y comparar con la entropía de la fuente.`,
              hint: R`Impares \(p\), pares \(2p\): \(3p+3\cdot2p=1\). Alfabético → Fano sin reordenar. Ojo, hay empates en los cortes.`,
              sol: R`<p>\(9p=1\) → \(P(X)=(1/9,\ 2/9,\ 1/9,\ 2/9,\ 1/9,\ 2/9)\). Fano manteniendo el orden 1…6. El primer corte es claro (\(\{1,2,3\}=4/9\) frente a \(\{4,5,6\}=5/9\)), pero dentro de cada mitad hay empate: \(\{1\}|\{2,3\}\) y \(\{1,2\}|\{3\}\) dejan la misma diferencia. La oficial corta lo más tarde posible:</p>
              <div data-widget="fano" data-probs="1/9 2/9 1/9 2/9 1/9 2/9" data-labels="1 2 3 4 5 6" data-tie="abajo"></div>
              <p>\(C_1=(000,\ 001,\ 01,\ 100,\ 101,\ 11)\), \(L_1=8/3=2{,}6667\) sb/mensaje. \(H(X)=2{,}5033\) bits, eficiencia 93,9 %. Cortando lo antes posible sale \((00,010,011,10,110,111)\), con la misma \(L\): las dos valen.</p>` },
            { tag: 'b', pts: 1.5, q: R`Diseñar un código óptimo binario, calcular su longitud media y comparar con la entropía de la fuente.`,
              hint: R`Óptimo = Huffman. Con tantos empates, coloca el grupo debajo de los iguales.`,
              sol: R`<div data-widget="huffman" data-probs="1/9 2/9 1/9 2/9 1/9 2/9" data-labels="1 2 3 4 5 6" data-d="2"></div>
              <p>\(C_2=(001,\ 01,\ 0000,\ 10,\ 0001,\ 11)\), \(L_2=23/9=2{,}5556\) sb/mensaje, eficiencia 98 %. Queda \(H(X)=2{,}503\lt L_2=2{,}556\lt L_1=2{,}667\): Huffman gana porque no tiene que respetar el orden alfabético.</p>` }
          ]
        },
        {
          title: 'Problema 2 · 7 puntos',
          statement: R`<p>Un lenguaje consta de 4 símbolos: A, B, C y Espacio, con estas restricciones:</p><ul><li>Nunca se presentan dos espacios seguidos.</li><li>El símbolo A se presenta siempre en grupos cuya longitud es múltiplo de 2.</li><li>En cualquier estado, los símbolos que se pueden emitir son equiprobables, respetando las dos restricciones anteriores.</li></ul>`,
          parts: [
            { tag: 'a', pts: 1.5, q: R`Modele el lenguaje como un proceso de Markov de primer orden y su matriz de transiciones.`,
              hint: R`Con un solo estado A no sabes si llevas un número par o impar de A. Usa dos: A' (primera A de una pareja, que obliga a otra A) y A (pareja cerrada).`,
              sol: R`<p>Estados \((A',\ A,\ B,\ C,\ E)\), con E = espacio. Tras A' la única opción es la A que cierra la pareja. Tras A (pareja cerrada), B o C se puede emitir cualquier cosa: una A (empieza pareja nueva → A'), B, C o espacio, 1/4 cada una. Tras un espacio no puede ir otro: A', B o C con 1/3.</p>
              \[ \Pi=\begin{bmatrix}0&1&0&0&0\\1/4&0&1/4&1/4&1/4\\1/4&0&1/4&1/4&1/4\\1/4&0&1/4&1/4&1/4\\1/3&0&1/3&1/3&0\end{bmatrix} \]
              <div data-widget="diagram" data-matrix="0 1 0 0 0; 1/4 0 1/4 1/4 1/4; 1/4 0 1/4 1/4 1/4; 1/4 0 1/4 1/4 1/4; 1/3 0 1/3 1/3 0" data-labels="A' A B C E"></div>` },
            { tag: 'b', pts: 1, q: R`Calcule las probabilidades estacionarias.`,
              hint: R`A solo se alcanza desde A', así que \(\mu_A=\mu_{A'}\). Las filas A, B, C son iguales.`,
              sol: R`<p>De las columnas: \(\mu_A=\mu_{A'}\); \(\mu_B=\mu_C=\tfrac14(\mu_A+\mu_B+\mu_C)+\tfrac13\mu_E=\mu_{A'}\); \(\mu_E=\tfrac14(\mu_A+\mu_B+\mu_C)\). Llamando \(x=\mu_{A'}\): \(\mu_E=\tfrac34x\) y \(4x+\tfrac34x=1\) → \(x=4/19\).</p>
              \[ \vec\mu_E=\left(\tfrac4{19},\ \tfrac4{19},\ \tfrac4{19},\ \tfrac4{19},\ \tfrac3{19}\right) \]` },
            { tag: 'c', pts: 0.5, q: R`Calcule la tasa de entropía.`,
              hint: R`\(\sum\mu_iH(\text{fila }i)\). La fila A' tiene entropía 0.`,
              sol: R`<p>\(H(\text{filas})=(0;\ 2;\ 2;\ 2;\ \log_23)\).</p>\[ H(\mathcal X)=\tfrac{12}{19}\cdot2+\tfrac3{19}\cdot1{,}585=1{,}5134\ \text{bits/símbolo} \]
              <div data-widget="markov" data-matrix="0 1 0 0 0; 1/4 0 1/4 1/4 1/4; 1/4 0 1/4 1/4 1/4; 1/4 0 1/4 1/4 1/4; 1/3 0 1/3 1/3 0" data-labels="A' A B C E" data-mode="todo"></div>` },
            { tag: 'd', pts: 1, q: R`Calcule la entropía de los símbolos.`,
              hint: R`Los estados A' y A emiten los dos la letra A.`,
              sol: R`<p>\(P(A)=\mu_{A'}+\mu_A=8/19\), \(P(B)=P(C)=4/19\), \(P(\text{esp})=3/19\).</p>\[ H(S)=H\left(\tfrac8{19},\tfrac4{19},\tfrac4{19},\tfrac3{19}\right)=1{,}892\ \text{bits} \]<p>Es mayor que la tasa (1,513): la memoria del lenguaje ahorra información.</p>` },
            { tag: 'e', pts: 3, q: R`Calcule un código óptimo para la fuente con memoria y compárelo con la tasa de la entropía.`,
              hint: R`Por transiciones: un Huffman por fila. Tras A' no hace falta enviar nada.`,
              sol: R`<p>Primer símbolo con un código fijo cualquiera. Transiciones:</p><ul><li>\(C_{A'^+}\): nada (siempre va a A), 0 bits.</li><li>\(C_{A^+}=C_{B^+}=C_{C^+}=(00,\ -,\ 01,\ 10,\ 11)\): 2 bits.</li><li>\(C_{E^+}=(0,\ -,\ 10,\ 11,\ -)\): \(L=5/3\).</li></ul>
              \[ \bar L=\tfrac{12}{19}\cdot2+\tfrac3{19}\cdot\tfrac53=\tfrac{29}{19}=1{,}5263\ \text{sb/símbolo} \]
              <p>Un 0,85 % más que la tasa (1,5134). Las filas A, B, C son diádicas y su Huffman es perfecto; solo pierde la fila del espacio (3 opciones equiprobables).</p>` }
          ]
        }
      ]
    },
    {
      id: 'ene26', title: 'Enero 2026', date: '26 de enero de 2026', minutes: 55,
      intro: 'Teoría (15 min, 4 preguntas: están en el test de teoría) + dos problemas. Solo está la parte del primer parcial.',
      problems: [
        {
          title: 'Problema 1 · 3 puntos',
          statement: R`<p>La variable X pertenece al conjunto de días de la semana \(\{l, m, x, j, v, s, d\}\) y su distribución es tal que la probabilidad de un día es un 10 % mayor que la del siguiente.</p>`,
          parts: [
            { tag: 'a', pts: 1, q: R`Diseñar un código alfabético para esta fuente recortándolo cuando sea posible.`,
              hint: R`\(p_d(1+1{,}1+1{,}1^2+\dots+1{,}1^6)=1\). Alfabético → Fano sin reordenar. ¿Se puede recortar un código con Kraft = 1?`,
              sol: R`<p>\(p_d\cdot\frac{1{,}1^7-1}{0{,}1}=p_d\cdot9{,}4872=1\) → \(p_d=0{,}10541\) y, subiendo un 10 % cada vez:</p>\[ P=(0{,}18673;\ 0{,}16975;\ 0{,}15432;\ 0{,}14029;\ 0{,}12754;\ 0{,}11595;\ 0{,}10541) \]
              <div data-widget="fano" data-probs="0.18673 0.16975 0.15432 0.14029 0.12754 0.11595 0.10541" data-labels="l m x j v s d"></div>
              <p>\(C_F=(00,\ 010,\ 011,\ 100,\ 101,\ 110,\ 111)\). Kraft = 1: el árbol está completo y no se puede recortar ninguna palabra.</p>` },
            { tag: 'b', pts: 1, q: R`Calcular la longitud media del código propuesto en el apartado a) y comparar con la entropía de la fuente.`,
              hint: R`\(L=\sum p_il_i\).`,
              sol: R`<p>\(L_F=2\cdot0{,}18673+3\cdot(1-0{,}18673)=2{,}8133\) sb/mensaje. \(H(X)=2{,}7814\) bits. Eficiencia 98,9 %.</p>` },
            { tag: 'c', pts: 1, q: R`Diseñar un código binario de menor longitud media.`,
              hint: R`Haz Huffman y compara.`,
              sol: R`<div data-widget="huffman" data-probs="0.18673 0.16975 0.15432 0.14029 0.12754 0.11595 0.10541" data-labels="l m x j v s d" data-d="2"></div>
              <p>Huffman da \((11,\ 000,\ 001,\ 010,\ 011,\ 100,\ 101)\) con \(L_H=2{,}8133=L_F\): las longitudes son las mismas (una de 2 y seis de 3). Como Huffman es óptimo, <b>no existe</b> un código binario de menor longitud media; el de Fano ya era óptimo.</p>` }
          ]
        },
        {
          title: 'Problema 2 · 7 puntos',
          statement: R`<p>El mercado de refrescos de cola está dominado por las marcas C y P; otras marcas, O, son minoritarias. Cada mes: de los que consumen C, el 10 % pasa a P y el 5 % a otras marcas. De los que consumen P, el 4 % pasa a C y el 6 % a otras. De los que consumen O, el 5 % pasa a C y otro 5 % a P.</p>`,
          parts: [
            { tag: 'a', pts: 1, q: R`Modele como una cadena de Markov de primer orden el proceso de cambio o permanencia de marca {C, P, O}: diagrama de estados y matriz de transición.`,
              hint: R`La diagonal es "sigue con su marca": 1 − lo que se va.`,
              sol: R`\[ \Pi=\begin{bmatrix}0{,}85&0{,}1&0{,}05\\0{,}04&0{,}9&0{,}06\\0{,}05&0{,}05&0{,}9\end{bmatrix} \]<div data-widget="diagram" data-matrix="0.85 0.1 0.05; 0.04 0.9 0.06; 0.05 0.05 0.9" data-labels="C P O"></div>` },
            { tag: 'b', pts: 0.5, q: R`En una hipotética situación estable de mercado, indique el porcentaje de usuarios que consumiría cada marca.`,
              hint: R`Situación estable = \(\vec\mu_E\).`,
              sol: R`<p>Resolviendo \(\vec\mu=\vec\mu\Pi\), \(\sum\mu=1\):</p>\[ \vec\mu_E=\left(\tfrac{14}{61},\ \tfrac{25}{61},\ \tfrac{22}{61}\right)\approx(23\,\%,\ 41\,\%,\ 36\,\%) \]` },
            { tag: 'c', pts: 1, q: R`¿Podría el analista en algún momento deducir con total certeza el consumo de cada marca? ¿Cuál se prevé que sea la marca más consumida?`,
              hint: R`¿Conoces \(\vec\mu^{(1)}\)? ¿Converge?`,
              sol: R`<p>Al principio no: no conocemos la distribución inicial, así que no sabemos si el proceso es estacionario. Pero la cadena es homogénea (Π constante), irreducible (todos los estados se alcanzan entre sí) y aperiódica (los tres tienen auto-lazo), así que converge a \(\vec\mu_E\) sea cual sea el inicio: cuantos más meses pasen, más precisa será la estimación. A largo plazo la más consumida será <b>P</b> (41 %).</p>` },
            { tag: 'd', pts: 2, q: R`Describa completamente un sistema óptimo de codificación de la fuente de información.`,
              hint: R`Las tres marcas se repiten con probabilidad ≥ 0,85: RLE por estado + 1 bit para la marca que sigue a la ráfaga.`,
              sol: R`<p>"Solución estándar con código RLE". Primer mes con un código fijo, p. ej. (0, 10, 11). Después, para cada marca se codifica la longitud de su ráfaga y luego a cuál de las otras dos se pasa (1 bit):</p>
              <ul><li><b>C</b>: \(p=0{,}85\), \(L_R=1/0{,}15=6{,}67\); \(p^4=0{,}522\) → \(m=4\). Preámbulo \(1^k0\) y resto con 2 bits.</li><li><b>P</b> y <b>O</b>: \(p=0{,}9\), \(L_R=10\); \(p^7=0{,}478\) → \(m=7\). Preámbulo \(1^k0\) y resto con 3 bits.</li><li>Tras cada ráfaga, 1 bit (0/1) para elegir entre las otras dos marcas.</li></ul>
              <div data-widget="rle" data-lr="20/3" data-sub="fijo"></div><div data-widget="rle" data-lr="10" data-sub="fijo"></div>` },
            { tag: 'e', pts: 0.5, q: R`Calcule la longitud media del código diseñado.`,
              hint: R`Por estado: (preámbulo + resto + 1)/\(L_R\). Luego pondera con \(\vec\mu_E\).`,
              sol: R`<p>C: \((2{,}092+2+1)/6{,}667=0{,}7638\). P y O: \((1{,}917+3+1)/10=0{,}5917\).</p>\[ \bar L=\tfrac{14}{61}\cdot0{,}7638+\tfrac{47}{61}\cdot0{,}5917=0{,}6312\ \text{sb/mes} \]
              <p class="small muted">Si el resto se codifica con Huffman en vez de con bits fijos (opción de la calculadora), P y O bajan a 0,5725 y el total a 0,6164.</p>` },
            { tag: 'f', pts: 0.5, q: R`Calcule la tasa de entropía de la fuente.`, hint: R`\(\sum\mu_iH(\text{fila }i)\).`,
              sol: R`<p>\(H(\text{filas})=(0{,}7476;\ 0{,}5661;\ 0{,}5690)\) → \(H(\mathcal X)=0{,}6088\) bits.</p><div data-widget="markov" data-matrix="0.85 0.1 0.05; 0.04 0.9 0.06; 0.05 0.05 0.9" data-labels="C P O" data-mode="codigos"></div>` },
            { tag: 'g', pts: 0.5, q: R`¿Cómo de redundante resulta el código con respecto al límite teórico?`, hint: R`\((\bar L-H)/H\).`,
              sol: R`\[ R=\frac{0{,}6312-0{,}6088}{0{,}6088}=3{,}68\,\% \]<p>La longitud está un 3,68 % por encima de la tasa.</p>` },
            { tag: 'h', pts: 1, q: R`¿Cuál es la cantidad de información de una medida mensual de reparto de mercado?`, hint: R`Una medida aislada, cuando ya ha convergido.`,
              sol: R`<p>Las primeras medidas dependen del inicio, pero tras suficiente tiempo la distribución es \(\vec\mu_E\) y una medida aislada aporta \(H(14/61,\ 25/61,\ 22/61)=1{,}5454\) bits.</p>` }
          ]
        }
      ]
    },
    {
      id: '2025', title: 'Octubre 2025', date: '30 de octubre de 2025', minutes: 50,
      intro: 'Dos problemas, se entregan por separado. Sin libros ni apuntes; con calculadora.',
      problems: [
        {
          title: 'Problema 1 · 2 puntos',
          statement: R`<p>Una fuente \(X\) sin memoria genera mensajes \(\{a,b,c,d,e\}\) con \(P(X)=\{0{,}3;\ 0{,}2;\ 0{,}2;\ 0{,}2;\ 0{,}1\}\). Determine la codificación óptima en los casos siguientes e indique cuál es mejor.</p>`,
          parts: [
            { tag: 'a', pts: 1, q: R`Usando un código binario. Genere los dos códigos posibles usando el grado de libertad que permite el algoritmo elegido.`,
              hint: R`"Óptimo" = Huffman. El grado de libertad está en el empate: al agrupar 0,2 + 0,1 = 0,3 empata con el 0,3 de \(a\).`,
              sol: R`<p>Con Huffman. Al agrupar \(d,e\) sale 0,3, que empata con \(a\). Colocándolo debajo de \(a\) sale \(C_2=\{00,10,11,010,011\}\); colocándolo encima, \(C_2'=\{01,10,11,000,001\}\). Cambia la opción "empates" en la calculadora para ver las dos.</p>
              <div data-widget="huffman" data-probs="0.3 0.2 0.2 0.2 0.1" data-labels="a b c d e" data-d="2"></div>
              <p>\(\bar L_2=\bar L_2'=2{,}3\) sb/mensaje (\(=1{,}451\) st/mensaje). \(H_2(X)=2{,}2464\) bits. Eficiencia \(H_2/\bar L_2 = 97{,}7\%\).</p>` },
            { tag: 'b', pts: 1, q: R`Usando un código ternario.`,
              hint: R`Comprueba si hacen falta fantasmas: \((N-1)\bmod(D-1)=(5-1)\bmod 2\).`,
              sol: R`<p>\((5-1)\bmod 2=0\): no hace falta fantasma. Huffman ternario: \(C_3=\{1,2,00,01,02\}\).</p>
              <div data-widget="huffman" data-probs="0.3 0.2 0.2 0.2 0.1" data-labels="a b c d e" data-d="3"></div>
              <p>\(\bar L_3 = 1{,}5\) st/mensaje \(=1{,}5\cdot\log_2 3 = 2{,}377\) sb/mensaje. \(H_3(X)=1{,}4173\) trits. Eficiencia \(94{,}5\%\).</p>
              <p><b>Conclusión</b>: el binario es mejor: más eficiente (97,7 % frente a 94,5 %) y más corto comparando en las mismas unidades (2,3 < 2,377 sb/mensaje).</p>` }
          ]
        },
        {
          title: 'Problema 2 · 8 puntos',
          statement: R`<p>Una fuente genera 4 mensajes \(\{A,B,C,D\}\). Tras observarla se concluye:</p><ul><li>Después del mensaje A la incertidumbre es máxima.</li><li>Los mensajes B nunca se repiten, observándose el D con el doble de probabilidad que A y C.</li><li>Después de una C aparecen A, B, C o D con probabilidades \((1/8, 1/2, 1/8, 1/4)\).</li><li>Después de una D aparecen A, B, C o D con probabilidades \((1/4, 1/2, 1/4, 0)\).</li></ul>`,
          parts: [
            { tag: 'a', pts: 1, q: R`Determine la matriz de transición y dibuje el diagrama de estados.`,
              hint: R`Fila A uniforme. Fila B: \(P_{BB}=0\), \(P_{BA}=P_{BC}=x\), \(P_{BD}=2x\).`,
              sol: R`<p>Fila A: incertidumbre máxima → \((1/4,1/4,1/4,1/4)\). Fila B: \(x+0+x+2x=1\) → \(x=1/4\) → \((1/4, 0, 1/4, 1/2)\).</p>\[ \Pi=\begin{bmatrix}1/4&1/4&1/4&1/4\\1/4&0&1/4&1/2\\1/8&1/2&1/8&1/4\\1/4&1/2&1/4&0\end{bmatrix} \]<div data-widget="diagram" data-matrix="1/4 1/4 1/4 1/4; 1/4 0 1/4 1/2; 1/8 1/2 1/8 1/4; 1/4 1/2 1/4 0" data-labels="A B C D"></div>` },
            { tag: 'b', pts: 1, q: R`Determine la convergencia o no de una cadena de Markov con este comportamiento.`,
              hint: R`Teorema: homogénea + irreducible + aperiódica ⇒ converge.`,
              sol: R`<p>Es una CM de orden 1 <b>homogénea</b> (Π no cambia con el tiempo), <b>irreducible</b> (desde A se llega a todos en un salto y a A se llega desde todos) y <b>aperiódica</b> (A tiene auto-lazo, \(P_{AA}=1/4>0\), así que se puede volver en 1 salto y el MCD es 1). Por el teorema de convergencia, \(\vec\mu^{(n)}\) converge a \(\vec\mu_a=\vec\mu_E\) para cualquier distribución inicial.</p>` },
            { tag: 'c', pts: 1, q: R`Determine la distribución inicial de una cadena de Markov estacionaria.`,
              hint: R`Es \(\vec\mu_E\). Fíjate en que las columnas A y C de Π son iguales.`,
              sol: R`<p>Hay que resolver \(\vec\mu=\vec\mu\Pi\). Las columnas A y C son iguales, así que \(\mu_A=\mu_C=a\). Usando la columna A y la D:</p>
              \[ a=\tfrac14a+\tfrac14b+\tfrac18a+\tfrac14d\ \Rightarrow\ 5a=2b+2d \qquad d=\tfrac14a+\tfrac12b+\tfrac14a\ \Rightarrow\ d=\tfrac{a+b}{2} \]
              <p>Sustituyendo: \(5a = 2b + a + b\) → \(b=\tfrac43a\), \(d=\tfrac76a\). Con \(2a+b+d=1\): \(\tfrac{27}{6}a=1\) → \(a=\tfrac29\).</p>
              \[ \vec\mu_E=\left(\tfrac29,\ \tfrac8{27},\ \tfrac29,\ \tfrac7{27}\right)\approx(0{,}222;\ 0{,}296;\ 0{,}222;\ 0{,}259) \]` },
            { tag: 'd', pts: 2, q: R`Justifique numéricamente qué codificación (por estados o por transiciones) es mejor y si merece la pena.`,
              hint: R`Por estados el límite es \(H(\vec\mu_E)\); por transiciones, la tasa \(\sum\mu_iH(\text{fila }i)\).`,
              sol: R`<p>Por estados: \(H(\vec\mu_E)=H(2/9, 8/27, 2/9, 7/27)=1{,}9893\) bits, y un Huffman sobre \(\vec\mu_E\) da \(L=2\) sb/mensaje.</p>
              <p>Por transiciones: \(H(\text{filas}) = (2;\ 1{,}5;\ 1{,}75;\ 1{,}5)\) bits, así que</p>
              \[ H(\mathcal X)=\tfrac29\cdot2+\tfrac8{27}\cdot1{,}5+\tfrac29\cdot1{,}75+\tfrac7{27}\cdot1{,}5=1{,}6667\ \text{bits} \]
              <p>Todas las filas son diádicas, así que cada Huffman de fila alcanza su entropía y por transiciones se llega a la tasa. Por estados gastaríamos un 19 % más (\(1{,}9893/1{,}6667\)) o un 20 % con el código real de 2 bits. Sí merece la pena codificar por transiciones.</p>` },
            { tag: 'e', pts: 1, q: R`Determine un código según el apartado anterior y calcule su longitud media.`,
              hint: R`Un Huffman por fila. Primer símbolo con código fijo de 2 bits.`,
              sol: R`<p>Código inicial \(C(X_1)=\{00,01,10,11\}\). Por fila: \(C(A^+)=\{00,01,10,11\}\), \(C(B^+)=\{00,-,01,1\}\), \(C(C^+)=\{110,0,111,10\}\), \(C(D^+)=\{10,0,11,-\}\), con longitudes medias 2; 1,5; 1,75; 1,5.</p>
              \[ \bar L=\sum_i\mu_i\bar L_{i^+} = 1{,}6667\ \text{sb/mensaje} \]
              <p class="small muted">La calculadora puede intercambiar algún 0 por 1 respecto a la oficial (por ejemplo en la fila B); las longitudes son las mismas y ambos códigos son válidos.</p>
              <div data-widget="markov" data-matrix="1/4 1/4 1/4 1/4; 1/4 0 1/4 1/2; 1/8 1/2 1/8 1/4; 1/4 1/2 1/4 0" data-labels="A B C D" data-mode="codigos" data-seq="AABCCBDABCC"></div>` },
            { tag: 'f', pts: 1, q: R`Codifique la cadena AABCCBDABCC.`,
              hint: R`11 símbolos = código inicial + 10 transiciones. Cada símbolo se codifica con la fila del anterior.`,
              sol: R`<p>Con los códigos del apartado e: A → <span class="cw">00</span>; A→A <span class="cw">00</span>; A→B <span class="cw">01</span>; B→C <span class="cw">01</span>; C→C <span class="cw">111</span>; C→B <span class="cw">0</span>; B→D <span class="cw">1</span>; D→A <span class="cw">10</span>; A→B <span class="cw">01</span>; B→C <span class="cw">01</span>; C→C <span class="cw">111</span>.</p>
              <p class="bits-out">00 00 01 01 111 0 1 10 01 01 111</p>
              <div class="callout ojo"><b>Errata en la solución oficial</b><span>La oficial pone "00 00 01 01 0 1 10 01 01 111": le falta el 111 de la primera transición C→C. Tiene 10 grupos en lugar de 11.</span></div>` },
            { tag: 'g', pts: 1, q: R`Determine si, cuando n es grande, \(X_n\), \(X_{n+1}\) y \(X_{n+2}\) tienen una relación markoviana.`,
              hint: R`Calcula \(I(X_n;X_{n+2}/X_{n+1})\).`,
              sol: R`<p>Sí. \(I(X_n;X_{n+2}/X_{n+1})=H(X_{n+2}/X_{n+1})-H(X_{n+2}/X_n,X_{n+1})=H(X_{n+2}/X_{n+1})-H(X_{n+2}/X_{n+1})=0\), porque en una CM de orden 1 conocer \(X_n\) además de \(X_{n+1}\) no cambia nada. Luego \(X_n\to X_{n+1}\to X_{n+2}\).</p>` }
          ]
        }
      ]
    },
    {
      id: 'ene25', title: 'Enero 2025', date: '27 de enero de 2025', minutes: 50,
      intro: 'Solo vienen los problemas (no hay hoja de teoría en el PDF). Se omite la parte del segundo parcial.',
      problems: [
        {
          title: 'Problema 1 · 3 puntos',
          statement: R`<p>Una calculadora virtual tiene un teclado con números de un dígito del 0 al 9 y marca teclas así:</p><ul><li>La mitad de las veces selecciona un número menor que 5, de manera equiprobable.</li><li>Los tres números más altos aparecen, cada uno, el 5 % de las veces.</li><li>El número 5 es seleccionado el 80 % de las veces restantes.</li></ul>`,
          parts: [
            { tag: 'a', pts: 1, q: R`Caracterice el comportamiento como una fuente de información e indique si se trata de una fuente con memoria.`,
              hint: R`Reparte: 0–4 se llevan 0,5; 7, 8, 9 se llevan 0,15; quedan 0,35 para 5 y 6.`,
              sol: R`<p>Sin memoria: el enunciado no relaciona una pulsación con la anterior.</p>\[ X=\{0,\dots,9\},\quad P(X)=(0{,}1;\ 0{,}1;\ 0{,}1;\ 0{,}1;\ 0{,}1;\ 0{,}28;\ 0{,}07;\ 0{,}05;\ 0{,}05;\ 0{,}05) \]<p>El 5 se lleva el 80 % de 0,35 = 0,28 y el 6 el resto, 0,07.</p>` },
            { tag: 'b', pts: 1, q: R`Diseñe un código prefijo óptimo quinario (cinco símbolos) y compare su longitud media con la entropía.`,
              hint: R`\(D=5\): \((N-1)\bmod 4\). Con 10 mensajes, \(9\bmod4=1\) → faltan fantasmas hasta 13.`,
              sol: R`<p>\(K\cdot(D-1)+1\ge10\) → \(K=3\), 13 elementos: se añaden <b>3 fantasmas</b> con probabilidad 0.</p><div data-widget="huffman" data-probs="0.1 0.1 0.1 0.1 0.1 0.28 0.07 0.05 0.05 0.05" data-labels="0 1 2 3 4 5 6 7 8 9" data-d="5"></div>
              <p>\(C(X)=\{2,\ 3,\ 4,\ 00,\ 01,\ 1,\ 03,\ 04,\ 020,\ 021\}\), \(\bar L_H=1{,}52\) símbolos quinarios/mensaje, \(H_5(X)=1{,}3317<\bar L_H\) (eficiencia 87,6 %).</p>` },
            { tag: 'c', pts: 1, q: R`Compare con un código basado en las longitudes de Shannon. ¿Qué código es peor y por qué? ¿De dónde proviene su ineficiencia?`,
              hint: R`\(l=\lceil\log_5 1/p\rceil\).`,
              sol: R`<div data-widget="shannon" data-probs="0.1 0.1 0.1 0.1 0.1 0.28 0.07 0.05 0.05 0.05" data-labels="0 1 2 3 4 5 6 7 8 9" data-d="5"></div>
              <p>Longitudes: 1 para el 5 y 2 para todos los demás → \(\bar L_S=1{,}72\). Así \(H_5<\bar L_H<\bar L_S\): el de Shannon es peor. Su ineficiencia viene del redondeo hacia arriba (función techo) de \(\log_5 1/p\).</p>` }
          ]
        },
        {
          title: 'Problema 2 · 7 puntos',
          statement: R`<p>Un robot recibe órdenes de avanzar 1 metro (A), girar a la derecha (D) y girar a la izquierda (I). Se sabe que:</p><ul><li>En promedio, avanza 10 m seguidos.</li><li>Tras una secuencia de avance, gira equiprobablemente a D o I.</li><li>Tras un giro, equiprobablemente vuelve a girar en el mismo sentido o avanza, pero nunca gira en sentido contrario.</li></ul>`,
          parts: [
            { tag: 'a', pts: 1, q: R`Modelar el proceso como una cadena de Markov de orden uno y determinar su matriz de transición.`,
              hint: R`Ráfagas de media 10 → \(P_{AA}=9/10\).`,
              sol: R`\[ \Pi=\begin{bmatrix}9/10&1/20&1/20\\1/2&1/2&0\\1/2&0&1/2\end{bmatrix} \]<div data-widget="diagram" data-matrix="9/10 1/20 1/20; 1/2 1/2 0; 1/2 0 1/2" data-labels="A D I"></div>` },
            { tag: 'b', pts: 1, q: R`Determinar si el proceso es estacionario.`, hint: R`¿Qué sabes de \(\vec\mu^{(1)}\)?`,
              sol: R`<p>No se puede determinar: no conocemos la distribución inicial \(\vec\mu^{(1)}\), así que no sabemos si \(\vec\mu^{(1)}=\vec\mu^{(2)}\).</p>` },
            { tag: 'c', pts: 1, q: R`Determinar si el sistema converge o no, justificando la respuesta.`, hint: R`H + I + A.`,
              sol: R`<p>Π es homogénea (no cambia con el tiempo), irreducible (desde A se va a D e I y desde ellos se vuelve a A) y aperiódica (los tres estados tienen auto-lazo). Por tanto converge: existe \(\vec\mu_a=\lim\vec\mu^{(n)}=\vec\mu_E\).</p>` },
            { tag: 'd', pts: 1, q: R`Determinar cuantitativamente si es mejor codificar por estados o por transiciones.`, hint: R`Compara \(H(\vec\mu_E)\) con la tasa.`,
              sol: R`<p>\(\vec\mu_E=(5/6,\ 1/12,\ 1/12)\). Por estados el límite es \(H(\vec\mu_E)=0{,}817\) bits; por transiciones, la tasa \(\tfrac56H(0{,}9;0{,}05;0{,}05)+\tfrac1{12}\cdot1+\tfrac1{12}\cdot1=0{,}641\) bits. Es mejor por transiciones.</p><div data-widget="markov" data-matrix="9/10 1/20 1/20; 1/2 1/2 0; 1/2 0 1/2" data-labels="A D I" data-mode="codigos"></div>` },
            { tag: 'e', pts: 1, q: R`Codificar por estados el proceso y determinar la longitud media del código propuesto.`, hint: R`Huffman sobre \(\vec\mu_E\).`,
              sol: R`<p>\(C=\{0,\ 10,\ 11\}\) para \(\{A, D, I\}\): \(\bar L=\tfrac56+\tfrac2{12}+\tfrac2{12}=\tfrac76=1{,}167\) sb/mensaje, un 43 % más que su límite (0,817).</p><div class="callout ojo"><b>Errata en la solución oficial</b><span>Escribe "7/6 = 1,67" y de ahí saca "un 104,4 % más". Pero 7/6 = 1,167, que es un 42,9 % más. También cambia el "ahorro del 35,3 %" del apartado f: el ahorro real es del 7,1 %.</span></div>` },
            { tag: 'f', pts: 1, q: R`Codificar por transiciones SIN AGRUPAR mensajes y determinar la longitud media.`, hint: R`Un Huffman por fila.`,
              sol: R`<p>Primer símbolo \(\{0,10,11\}\). \(C(A^+)=\{0,10,11\}\) (\(L=1{,}1\)), \(C(D^+)=\{0,1,-\}\), \(C(I^+)=\{0,-,1\}\) (\(L=1\)).</p>\[ \bar L=\tfrac56\cdot1{,}1+\tfrac1{12}+\tfrac1{12}=1{,}083\ \text{sb/mensaje} \]<p>Un 7,1 % menos que por estados y un 69 % por encima de la tasa: el estado A gasta 1 bit cuando su salto apenas tiene información.</p>` },
            { tag: 'g', pts: 1, q: R`Razonar si una codificación por transiciones AGRUPANDO mensajes sería mejor. En caso afirmativo, codifique y calcule la longitud media.`,
              hint: R`\(P_{AA}=0{,}9>1/2\): RLE para A.`,
              sol: R`<p>Sí: A se repite con probabilidad \(>1/2\), así que se codifican sus ráfagas con RLE. \(p=0{,}9\), \(p^7=0{,}478\) → \(m=7\). Preámbulo \(\{0,10,110,\dots\}\), resto con 3 bits fijos (000…110), y 1 bit tras la ráfaga para D o I.</p>
              <div data-widget="rle" data-lr="10" data-sub="fijo"></div>
              <p>\(L_G=1/(1-p^7)=1{,}917\), \(L_{SG}=3\), +1 → \(5{,}917\) bits/ráfaga → \(L_A=5{,}917/10=0{,}5917\) bits/símbolo.</p>\[ \bar L=\tfrac56\cdot0{,}5917+\tfrac1{12}\cdot1+\tfrac1{12}\cdot1=0{,}6598\ \text{sb/mensaje} \]<p>Un 3 % por encima de la tasa. Con Huffman en el resto (opción de la calculadora) bajaría a 0,644.</p>` }
          ]
        }
      ]
    },
    {
      id: '2024', title: 'Octubre 2024', date: '24 de octubre de 2024', minutes: 50,
      intro: 'Teoría (15 min, 4 preguntas: están en el test de teoría) + dos problemas.',
      problems: [
        {
          title: 'Problema 1 · 3 puntos',
          statement: R`<p>Una fuente \(X\) sin memoria genera símbolos \(\{a,b,c,d,e,f,g,h\}\) con probabilidades proporcionales a \(\{0{,}22;\ 0{,}05;\ 0{,}13;\ 0{,}27;\ 0{,}03;\ 0{,}04;\ 0{,}16;\ 0{,}1\}\).</p>`,
          parts: [
            { tag: 'a', pts: 1, q: R`Diseñar un código alfabético binario.`, hint: R`Alfabético → Fano sin reordenar.`,
              sol: R`<p>Fano, manteniendo el orden alfabético:</p><div data-widget="fano" data-probs="0.22 0.05 0.13 0.27 0.03 0.04 0.16 0.1" data-labels="a b c d e f g h"></div><p>\(L_F = 2\cdot0{,}22+3\cdot(0{,}05+0{,}13+0{,}27+0{,}03+0{,}1)+4\cdot(0{,}04+0{,}16)=2{,}98\) sb/mensaje.</p>` },
            { tag: 'b', pts: 1, q: R`Diseñar un código óptimo ternario.`, hint: R`8 mensajes en ternario: ¿cuántos fantasmas?`,
              sol: R`<p>\(K\cdot2+1=8\) no tiene solución entera → \(K=4\), 9 mensajes: se añade \(z\) con \(P=0\).</p><div data-widget="huffman" data-probs="0.22 0.05 0.13 0.27 0.03 0.04 0.16 0.1" data-labels="a b c d e f g h" data-d="3"></div><p>\(L_H=1{,}8\) st/mensaje \(=2{,}853\) sb/mensaje.</p>` },
            { tag: 'c', pts: 1, q: R`Comparar la longitud media de los códigos anteriores con la entropía de la fuente y justificar el resultado.`, hint: R`Pasa todo a bits.`,
              sol: R`<p>\(H_2(X)=2{,}6821\) bits. Entonces \(H(X)=2{,}682 < L_{H}=2{,}853 < L_F=2{,}98\) (todo en sb/mensaje).</p><p>Huffman es óptimo, pero en ternario cada símbolo "desperdicia" más (las probabilidades no son potencias de 1/3 y se añadió un fantasma). Fano binario no es óptimo pero mantiene el orden alfabético.</p><div class="callout ojo"><b>Nota</b><span>La solución oficial da \(H=2{,}6797\); el valor correcto con esas probabilidades es 2,6821 (compruébalo en la calculadora de entropía). No cambia la conclusión.</span></div>` }
          ]
        },
        {
          title: 'Problema 2 · 7 puntos',
          statement: R`<p>Una fuente con memoria modelada como cadena de Markov genera \(\{A,B,C,D\}\):</p><ul><li>Las B aparecen como ráfagas de longitud media 5 y siempre seguidas de una A.</li><li>Después de una D siempre aparece una A.</li><li>Después de una A aparece A, B, C o D con probabilidades \((0{,}25;\ 0{,}125;\ 0{,}125;\ 0{,}5)\).</li><li>Después de una C aparece A, B, C o D con probabilidades \((0{,}25;\ 0{,}5;\ 0{,}125;\ 0{,}125)\).</li></ul>`,
          parts: [
            { tag: 'a', pts: 0.5, q: R`Modele la fuente como cadena de Markov y clasifíquela.`, hint: R`Ráfagas de media 5 → \(P_{BB}=4/5\).`,
              sol: R`<p>\(P_{BB}=(5-1)/5=0{,}8\) y \(P_{BA}=0{,}2\); \(P_{DA}=1\).</p>\[ \Pi=\begin{bmatrix}0{,}25&0{,}125&0{,}125&0{,}5\\0{,}2&0{,}8&0&0\\0{,}25&0{,}5&0{,}125&0{,}125\\1&0&0&0\end{bmatrix} \]<p>CM de orden 1, homogénea, irreducible (A lleva a todos y todos vuelven a A) y aperiódica (auto-lazos en A, B, C).</p><div data-widget="diagram" data-matrix="0.25 0.125 0.125 0.5; 0.2 0.8 0 0; 0.25 0.5 0.125 0.125; 1 0 0 0" data-labels="A B C D"></div>` },
            { tag: 'b', pts: 0.5, q: R`Compruebe que \((0{,}379;\ 0{,}371;\ 0{,}05;\ 0{,}196)\) es la distribución estacionaria.`, hint: R`Multiplica el vector por Π.`,
              sol: R`<p>Hay que ver que \(\vec\mu\Pi\approx\vec\mu\). Primera componente: \(0{,}379\cdot0{,}25+0{,}371\cdot0{,}2+0{,}05\cdot0{,}25+0{,}196\cdot1=0{,}378\). La exacta es \(\vec\mu_E=(14/37,\ 55/148,\ 2/37,\ 29/148)\approx(0{,}378;\ 0{,}372;\ 0{,}054;\ 0{,}196)\): el enunciado redondea \(\mu_C=0{,}054\) a 0,05.</p>` },
            { tag: 'c', pts: 0.5, q: R`Calcule la tasa de entropía.`, hint: R`\(\sum\mu_iH(\text{fila }i)\).`,
              sol: R`<p>\(H(\text{filas})=(1{,}75;\ 0{,}7219;\ 1{,}75;\ 0)\). Tasa \(=0{,}378\cdot1{,}75+0{,}372\cdot0{,}722+0{,}054\cdot1{,}75+0{,}196\cdot0=1{,}025\) bits.</p><p class="small muted">La oficial da 1,0178 porque usa \(\mu_C=0{,}05\) y \(H=0{,}72\).</p><div data-widget="markov" data-matrix="0.25 0.125 0.125 0.5; 0.2 0.8 0 0; 0.25 0.5 0.125 0.125; 1 0 0 0" data-labels="A B C D" data-mode="codigos"></div>` },
            { tag: 'd', pts: 4, q: R`Calcule un código óptimo para cada estado cuya longitud media difiera de la tasa en menos del 1 %. Para cada estado indique longitud media y palabras, y compárelo con la entropía del salto.`, hint: R`A y C: Huffman (filas diádicas). B: RLE con \(L_R=5\). D: no hace falta código.`,
              sol: R`<p><b>A</b>: \(C_{A^+}=(10,110,111,0)\), \(L=1{,}75\) = entropía del salto (fila diádica). <b>C</b>: \(C_{C^+}=(10,0,110,111)\), \(L=1{,}75\). <b>D</b>: siempre va a A, 0 bits.</p><p><b>B</b> con RLE: \(p=0{,}8\), \(p^3=0{,}512\), \(p^4=0{,}4096\) → \(m=3\).</p><div data-widget="rle" data-lr="5"></div><p>\(L_G=2{,}05\), \(L_{SG}=1{,}59\), \(L_{RLE}=3{,}64\) bits/ráfaga, que acaba en una A. Por símbolo \(3{,}64/5=0{,}728\) frente a \(H(0{,}8)=0{,}722\) (un 1 % más).</p><p><b>Total</b>: \(0{,}378\cdot1{,}75+0{,}372\cdot0{,}728+0{,}054\cdot1{,}75 = 1{,}027\) bits/símbolo, un 0,22 % por encima de la tasa. Con un Huffman normal en la fila B (1 bit/símbolo) habrías tenido 1,128, un 10 % más.</p>` },
            { tag: 'e', pts: 1, q: R`Codifique CBBBBBAADA (olvide el símbolo inicial).`, hint: R`La ráfaga de 5 B se codifica de una vez y deja implícita la A siguiente.`,
              sol: R`<p>C→B con \(C_{C^+}\): <span class="cw">0</span>. Ráfaga de \(l=5\) B: \(k=\lfloor4/3\rfloor=1\), \(r=1\) → <span class="cw">10</span> + <span class="cw">10</span>; tras ella va una A (implícita). A→A: <span class="cw">10</span>. A→D: <span class="cw">0</span>. D→A: nada.</p><p class="bits-out">0 1010 10 0</p><p class="small muted">La oficial escribe "… 1010 10 0 …" sin el primer 0 de la transición C→B.</p>` },
            { tag: 'f', pts: 0.5, q: R`Se modifica la cadena para que cada 3 saltos \(\vec\mu^{(4)}=\vec\mu^{(1)}\). ¿Cómo es la matriz en los instantes 3, 6, 9…?`, hint: R`Para que el resultado no dependa del estado anterior…`,
              sol: R`<p>Una matriz con todas las filas iguales a \(\vec\mu^{(1)}\): así \(\vec\mu^{(4)}=\vec\mu^{(3)}\Pi_3=\vec\mu^{(1)}\) venga de donde venga.</p>` },
            { tag: 'g', pts: 1, q: R`[Opcional] Tasa de esta cadena no homogénea con \(\vec\mu^{(1)}=(1,0,0,0)\).`, hint: R`Periodo 3: \(\frac{H(X_1)+H(X_2/X_1)+H(X_3/X_2)}{3}\).`,
              sol: R`<p>\(H(X_1)=0\) (siempre A); \(H(X_2/X_1)=H(\text{fila A})=1{,}75\); \(\vec\mu^{(2)}=(0{,}25;\,0{,}125;\,0{,}125;\,0{,}5)\) → \(H(X_3/X_2)=0{,}25\cdot1{,}75+0{,}125\cdot0{,}722+0{,}125\cdot1{,}75+0{,}5\cdot0=0{,}7465\).</p>\[ H(\mathcal X)=\frac{0+1{,}75+0{,}7465}{3}=0{,}832\ \text{bits} \]<div class="callout ojo"><b>Revisa con tu profesor</b><span>La solución oficial da 0,24975 con la misma fórmula; sustituyendo los valores sale 0,832. Parece que solo dividieron un término entre 3.</span></div>` }
          ]
        }
      ]
    },
    {
      id: 'jun24', title: 'Junio 2024', date: '27 de junio de 2024', minutes: 50,
      intro: 'Teoría (15 min): dos de sus tres preguntas están en el test de teoría; la tercera (segundo teorema de Shannon, capacidad del canal) es del segundo parcial y no entra. Un solo problema de 6 puntos.',
      problems: [
        {
          title: 'Problema · 6 puntos',
          statement: R`<p>El rastreo de una imagen de impresora se compone de píxeles Cian, Magenta, Amarillo y Key (CMAK):</p><ul><li>Hay cadenas de Cian (C) de longitud media 20 píxeles, que terminan siempre en Magenta (M) o Key (K) equiprobablemente.</li><li>La entropía es máxima tras un píxel M: puede aparecer cualquiera de los cuatro colores.</li><li>Tras un píxel A, un 50 % de las veces se repite, un 25 % viene C y un 25 % viene K.</li><li>El píxel K se repite el 50 % de las veces, o bien aparece un píxel C.</li></ul>`,
          parts: [
            { tag: 'a', pts: 1, q: R`Modelar las cadenas como fuente markoviana de primer orden. Diagrama de estados y matriz de transiciones.`,
              hint: R`\(P_{CC}=19/20\) y el 1/20 restante a partes iguales entre M y K.`,
              sol: R`\[ \Pi=\begin{bmatrix}19/20&1/40&0&1/40\\1/4&1/4&1/4&1/4\\1/4&0&1/2&1/4\\1/2&0&0&1/2\end{bmatrix} \]<div data-widget="diagram" data-matrix="19/20 1/40 0 1/40; 1/4 1/4 1/4 1/4; 1/4 0 1/2 1/4; 1/2 0 0 1/2" data-labels="C M A K"></div>` },
            { tag: 'b', pts: 0.5, q: R`Si el primer píxel es C, ¿qué distribución tiene el segundo? ¿Y el tercero?`, hint: R`\(\vec\mu^{(n+1)}=\vec\mu^{(n)}\Pi\).`,
              sol: R`<p>\(\vec\mu^{(1)}=(1,0,0,0)\) → \(\vec\mu^{(2)}=\) fila C \(=(19/20,\ 1/40,\ 0,\ 1/40)\) → \(\vec\mu^{(3)}=\vec\mu^{(2)}\Pi=(737/800,\ 3/100,\ 1/160,\ 17/400)\).</p>` },
            { tag: 'c', pts: 1, q: R`¿Cuál es la distribución inicial que hace que el proceso sea estacionario?`, hint: R`El autovector \(\vec\mu=\vec\mu\Pi\).`,
              sol: R`\[ \vec\mu_E=\left(\tfrac{120}{135},\ \tfrac4{135},\ \tfrac2{135},\ \tfrac1{15}\right)\approx(0{,}889;\ 0{,}030;\ 0{,}015;\ 0{,}067) \]<div data-widget="markov" data-matrix="19/20 1/40 0 1/40; 1/4 1/4 1/4 1/4; 1/4 0 1/2 1/4; 1/2 0 0 1/2" data-labels="C M A K" data-mode="todo"></div>` },
            { tag: 'd', pts: 0.25, q: R`Calcule la incertidumbre sobre el color de un píxel tras observar una imagen suficientemente grande.`, hint: R`Símbolo aislado tras converger.`,
              sol: R`<p>\(H(X_n)\to H(\vec\mu_E)=0{,}6520\) bits.</p>` },
            { tag: 'e', pts: 0.25, q: R`Justifique la respuesta del apartado anterior.`, hint: R`Teorema de convergencia.`,
              sol: R`<p>Homogénea (Π constante), irreducible (todos se alcanzan) y aperiódica (C, M, A, K tienen auto-lazo): converge, y tras muchos píxeles \(\vec\mu^{(n)}=\vec\mu_a=\vec\mu_E\).</p>` },
            { tag: 'f', pts: 0.5, q: R`Diseñe un sistema de codificación de mínima latencia.`, hint: R`Mínima latencia = no esperar a ver más símbolos: por estados.`,
              sol: R`<p>Por estados, Huffman sobre \(\vec\mu_E\): C → 0, K → 10, M → 110, A → 111.</p>` },
            { tag: 'g', pts: 0.5, q: R`Determine la eficiencia del codificador del apartado f).`, hint: R`\(\sum\mu_il_i\).`,
              sol: R`\[ L=\tfrac{120}{135}\cdot1+\tfrac4{135}\cdot3+\tfrac2{135}\cdot3+\tfrac1{15}\cdot2=\tfrac{156}{135}=1{,}156\ \text{sb/píxel} \]<p>Eficiencia \(0{,}652/1{,}156=56\,\%\) (un 77 % más que la entropía de un símbolo aislado).</p><div class="callout ojo"><b>Errata en la solución oficial</b><span>Da L = 1,09 y "un 67,2 % mayor". Con su mismo código y su misma fórmula sale 156/135 = 1,156, un 77 % mayor.</span></div>` },
            { tag: 'h', pts: 0.5, q: R`Calcular la tasa de entropía de la fuente.`, hint: R`\(\sum\mu_iH(\text{fila})\).`,
              sol: R`\[ H(\mathcal X)=\tfrac{120}{135}\cdot0{,}3364+\tfrac4{135}\cdot2+\tfrac2{135}\cdot1{,}5+\tfrac1{15}\cdot1=0{,}4472\ \text{bits} \]` },
            { tag: 'i', pts: 1, q: R`Diseñe un codificador que, aprovechando la memoria, obtenga la mínima longitud media.`, hint: R`Transiciones; tras C, RLE con \(p=0{,}95\).`,
              sol: R`<p>Primer píxel con \((00,01,10,11)\). Tras C, RLE: \(p=19/20\), \((0{,}95)^{13}=0{,}513\), \((0{,}95)^{14}=0{,}488\) → \(m=14\); preámbulo \(\{0,10,110,\dots\}\), resto con 4 bits fijos, y 1 bit tras la ráfaga para M o K. Tras M: \((00,01,10,11)\). Tras A: \((10,-,11,0)\). Tras K: \((0,-,-,1)\).</p><div data-widget="rle" data-lr="20" data-sub="fijo"></div>` },
            { tag: 'j', pts: 0.5, q: R`Determine la eficiencia del codificador del apartado i).`, hint: R`\(L_C=(L_G+4+1)/20\).`,
              sol: R`<p>\(L_G=1/(1-0{,}4877)=1{,}952\) → \(L_C=(1{,}952+4+1)/20=0{,}3476\). \(L_M=2\), \(L_A=1{,}5\), \(L_K=1\).</p>\[ L=\tfrac{120}{135}\cdot0{,}3476+\tfrac4{135}\cdot2+\tfrac2{135}\cdot1{,}5+\tfrac1{15}\cdot1=0{,}4571\ \text{bits} \]<p>Un 2,2 % por encima de la tasa. Con Huffman en el resto bajaría a 0,4487 (0,3 %).</p>` }
          ]
        }
      ]
    },
    {
      id: '2023', title: 'Octubre 2023', date: '26 de octubre de 2023', minutes: 50,
      intro: 'Teoría (20 min, preguntas en el test de teoría) + dos problemas.',
      problems: [
        {
          title: 'Problema 1 · 3 puntos',
          statement: R`<p>Una sonda contabiliza el tráfico a dos máquinas SF_A y SF_B. SF_A solo acepta los puertos 80 y 22; SF_B además el 443. SF_B recibe el 70 % de las peticiones y en cada servidor el puerto 80 es el 50 % del tráfico hacia ese servidor.</p>`,
          parts: [
            { tag: 'a', pts: 1, q: R`Caracterice la sonda como fuente de información. Si no es posible, dé la caracterización más precisa poniéndose en el caso peor.`, hint: R`Caso peor = máxima incertidumbre: reparte lo que no se conoce a partes iguales.`,
              sol: R`<p>Faltan datos (cómo se reparte el resto en SF_B), así que tomamos el caso peor: repartir uniformemente lo desconocido. SF_A (30 %): 80 → 0,15, 22 → 0,15. SF_B (70 %): 80 → 0,35, 22 y 443 → 0,175 cada uno.</p>\[ X=\{A80, A22, B80, B22, B443\},\quad P=(0{,}15;\ 0{,}15;\ 0{,}35;\ 0{,}175;\ 0{,}175) \]<p>\(H(X)=2{,}2313\) bits.</p>` },
            { tag: 'b', pts: 1, q: R`Proponga un código ternario y calcule su longitud media.`, hint: R`5 mensajes: \((5-1)\bmod2=0\), sin fantasma.`,
              sol: R`<div data-widget="huffman" data-probs="0.15 0.15 0.35 0.175 0.175" data-labels="A80 A22 B80 B22 B443" data-d="3"></div><p>\(L=0{,}35+0{,}175+2\cdot0{,}475=1{,}475\) st/mensaje.</p>` },
            { tag: 'c', pts: 1, q: R`Con Fano, proponga un código binario. ¿Cuál escogería de b) y c)?`, hint: R`Pasa 1,475 trits a bits.`,
              sol: R`<div data-widget="fano" data-probs="0.15 0.15 0.35 0.175 0.175" data-labels="A80 A22 B80 B22 B443"></div><p>\(L=2{,}3\) sb/mensaje, frente a \(1{,}475\cdot\log_23=2{,}338\) sb/mensaje del ternario. Elegiría Fano: es más corto y además alfabético.</p>` }
          ]
        },
        {
          title: 'Problema 2 · 7 puntos',
          statement: R`<p>Un agente trabaja en 3 ciudades A, B, C y pasa cada día en una. Tras un día en A: sigue en A 0,2, va a B 0,2, a C 0,6. Tras B: sigue 0,3, va a C 0,4, a A 0,3. Tras C: no repite y va equiprobablemente a una de las otras dos. Trabaja todos los días.</p>`,
          parts: [
            { tag: '1', pts: 1, q: R`Modele las visitas como cadena de Markov y calcule la matriz de transición.`, hint: R`Fila C: \(P_{CC}=0\), resto a partes iguales.`,
              sol: R`\[ \Pi=\begin{bmatrix}0{,}2&0{,}2&0{,}6\\0{,}3&0{,}3&0{,}4\\0{,}5&0{,}5&0\end{bmatrix} \]<div data-widget="diagram" data-matrix="0.2 0.2 0.6; 0.3 0.3 0.4; 0.5 0.5 0" data-labels="A B C"></div>` },
            { tag: '2', pts: 1, q: R`Clasifique la cadena (justifique).`, hint: R`H, I, A.`,
              sol: R`<p>Homogénea y de orden 1 (Π constante, solo depende del día anterior), irreducible (todos los estados alcanzables) y aperiódica (A y B tienen auto-lazo). Por tanto existe \(\vec\mu_a\), es única e igual a \(\vec\mu_E\); la cadena es estacionaria solo si \(\vec\mu^{(1)}=\vec\mu_E\).</p>` },
            { tag: '3', pts: 1, q: R`Bits necesarios para describir trayectos largos.`, hint: R`Trayectos largos → tasa de entropía. Π es doblemente estocástica.`,
              sol: R`<p>Las columnas también suman 1 → \(\vec\mu_E=(1/3,1/3,1/3)\).</p>\[ H(\mathcal X)=\tfrac13\big(H(0{,}2;0{,}2;0{,}6)+H(0{,}3;0{,}3;0{,}4)+H(0{,}5;0{,}5)\big)=\tfrac13(1{,}371+1{,}571+1)=1{,}314\ \text{bits} \]` },
            { tag: '4', pts: 1, q: R`Diseñe un código óptimo para trayectos largos.`, hint: R`Huffman por fila.`,
              sol: R`<p>Inicial casi cualquiera, p. ej. (0, 10, 11). Transiciones: \(C_{A^+}=(10,11,0)\), \(C_{B^+}=(10,11,0)\), \(C_{C^+}=(0,1,-)\). \(\bar L=\tfrac13(1{,}4+1{,}6+1)=1{,}333\) bits/símbolo, un poco por encima de la tasa y bastante por debajo de \(H(\vec\mu_E)\). RLE no compensa: las probabilidades de repetición son bajas.</p><div data-widget="markov" data-matrix="0.2 0.2 0.6; 0.3 0.3 0.4; 0.5 0.5 0" data-labels="A B C" data-mode="codigos"></div>` },
            { tag: '5', pts: 1, q: R`Incertidumbre sobre la ciudad en la que se encuentra el agente.`, hint: R`Símbolo aislado.`,
              sol: R`<p>Sin saber nada del trayecto, para \(n\gg1\): \(H(\vec\mu_a)=\log_23=1{,}585\) bits.</p>` },
            { tag: '6', pts: 1, q: R`Ahora el lunes pernocta siempre un 60 % en A, 20 % en B y 20 % en C. Modele la nueva situación.`, hint: R`La transición que llega al lunes no depende de dónde estuviera.`,
              sol: R`<p>Π de antes para las transiciones normales, y para la transición domingo→lunes una matriz con todas las filas iguales a \((0{,}6;\ 0{,}2;\ 0{,}2)\). La cadena es <b>no homogénea</b>, periódica de periodo 7 e irreducible.</p>` },
            { tag: '7', pts: 1, q: R`¿Podría usar el código anterior?`, hint: R`¿Qué días cambian?`,
              sol: R`<p>Sí para los días normales. Para el salto al lunes, \(C_{D^+}=(0,10,11)\), independiente de la ciudad de partida. La longitud media queda algo por encima de la nueva tasa \(H(X_L,\dots,X_D)/7\).</p>` }
          ]
        }
      ]
    },
    {
      id: 'ej1', group: 'clase', title: 'Hoja 1: entropía de 3 variables', date: 'Primer grupo de ejercicios · curso 2026/27', minutes: 0,
      intro: 'Hoja mandada en clase este curso. No trae solución oficial; estas son las mías, comprobadas con fracciones exactas. Todas las probabilidades son potencias de 2, así que casi todo sale sin calculadora.',
      problems: [
        {
          title: 'Ejercicio 1',
          statement: R`<p>Cadenas de tres símbolos NCV (número, consonante, vocal) con \(N\in\{1,2,3\}\), \(C\in\{b,d,f,l,m\}\), \(V\in\{a,e,i\}\) y distribución conjunta \(P(N,C,V)\) (filas C, columnas N):</p>
          <div class="tbl-wrap"><table><thead><tr><th>V = a</th><th>1</th><th>2</th><th>3</th><th>V = e</th><th>1</th><th>2</th><th>3</th><th>V = i</th><th>1</th><th>2</th><th>3</th></tr></thead><tbody>
          <tr><td>b</td><td>1/8</td><td>0</td><td>0</td><td>b</td><td>1/8</td><td>0</td><td>0</td><td>b</td><td>0</td><td>0</td><td>0</td></tr>
          <tr><td>d</td><td>1/16</td><td>1/64</td><td>1/64</td><td>d</td><td>1/16</td><td>1/64</td><td>1/64</td><td>d</td><td>0</td><td>0</td><td>0</td></tr>
          <tr><td>f</td><td>1/32</td><td>1/16</td><td>1/64</td><td>f</td><td>0</td><td>0</td><td>0</td><td>f</td><td>1/32</td><td>1/16</td><td>1/64</td></tr>
          <tr><td>l</td><td>0</td><td>0</td><td>0</td><td>l</td><td>1/32</td><td>1/32</td><td>1/32</td><td>l</td><td>1/32</td><td>1/32</td><td>1/32</td></tr>
          <tr><td>m</td><td>0</td><td>0</td><td>0</td><td>m</td><td>0</td><td>1/64</td><td>1/16</td><td>m</td><td>0</td><td>1/64</td><td>1/16</td></tr></tbody></table></div>`,
          parts: [
            { tag: 'a', q: R`Calcular la incertidumbre conjunta \(H(N,C,V)\).`,
              hint: R`Cuenta cuántas casillas valen 1/8, 1/16, 1/32 y 1/64. \(\log_2\) de una potencia de 2 es inmediato.`,
              sol: R`<p>Hay 2 casillas de 1/8, 6 de 1/16, 8 de 1/32 y 8 de 1/64 (suman 1). Como \(\log_2 8=3\), etc.:</p>\[ H(N,C,V)=2\cdot\tfrac18\cdot3+6\cdot\tfrac1{16}\cdot4+8\cdot\tfrac1{32}\cdot5+8\cdot\tfrac1{64}\cdot6=0{,}75+1{,}5+1{,}25+0{,}75=4{,}25\ \text{bits} \]` },
            { tag: 'b', q: R`Determinar las distribuciones \(p(n,c)\), \(p(n,v)\), \(p(c,v)\).`,
              hint: R`Para \(p(n,c)\) suma las tres tablas casilla a casilla (sumas sobre V).`,
              sol: R`<p>\(p(n,c)\) (filas n = 1, 2, 3; columnas b, d, f, l, m):</p>\[ \begin{bmatrix}1/4&1/8&1/16&1/16&0\\0&1/32&1/8&1/16&1/32\\0&1/32&1/32&1/16&1/8\end{bmatrix} \]
              <p>\(p(n,v)\) (filas n; columnas a, e, i):</p>\[ \begin{bmatrix}7/32&7/32&1/16\\5/64&1/16&7/64\\1/32&7/64&7/64\end{bmatrix} \]
              <p>\(p(c,v)\) (filas b, d, f, l, m; columnas a, e, i):</p>\[ \begin{bmatrix}1/8&1/8&0\\3/32&3/32&0\\7/64&0&7/64\\0&3/32&3/32\\0&5/64&5/64\end{bmatrix} \]` },
            { tag: 'c', q: R`Calcular \(H(N,C)\), \(H(N,V)\), \(H(C,V)\).`,
              hint: R`Entropía de cada tabla del apartado b. Puedes pegarlas en la calculadora de entropía conjunta.`,
              sol: R`<p>\(H(N,C)=3{,}25\) bits (otra vez todo potencias de 2), \(H(N,V)=2{,}9505\) bits, \(H(C,V)=3{,}3037\) bits.</p><div data-widget="conjunta" data-matrix="1/4 1/8 1/16 1/16 0; 0 1/32 1/8 1/16 1/32; 0 1/32 1/32 1/16 1/8"></div>` },
            { tag: 'd', q: R`Determinar las marginales \(p(n)\), \(p(c)\), \(p(v)\).`, hint: R`Suma filas o columnas de las tablas del apartado b.`,
              sol: R`<p>\(p(n)=(1/2,\ 1/4,\ 1/4)\); \(p(c)=(1/4,\ 3/16,\ 7/32,\ 3/16,\ 5/32)\); \(p(v)=(21/64,\ 25/64,\ 9/32)\).</p>` },
            { tag: 'e', q: R`Calcular \(H(N)\), \(H(C)\), \(H(V)\).`, hint: R`Entropía de cada marginal.`,
              sol: R`<p>\(H(N)=1{,}5\) bits, \(H(C)=2{,}3037\) bits, \(H(V)=1{,}5720\) bits.</p>` },
            { tag: 'f', q: R`Determinar \(p(n,v\mid c)\).`, hint: R`\(p(n,v\mid c)=p(n,c,v)/p(c)\): divide cada casilla de la fila c entre \(p(c)\).`,
              sol: R`<ul><li>c = b: (1a) 1/2, (1e) 1/2.</li><li>c = d: (1a) 1/3, (1e) 1/3, (2a) (2e) (3a) (3e) 1/12 cada una.</li><li>c = f: (1a) (1i) 1/7, (2a) (2i) 2/7, (3a) (3i) 1/14.</li><li>c = l: las 6 parejas de n ∈ {1,2,3}, v ∈ {e,i}, 1/6 cada una.</li><li>c = m: (2e) (2i) 1/10, (3e) (3i) 2/5.</li></ul>` },
            { tag: 'g', q: R`Calcular a partir de la distribución anterior \(H(N,V\mid C)\).`, hint: R`\(\sum_c p(c)\,H(N,V\mid C=c)\).`,
              sol: R`<p>\(H(N,V\mid C=c)=(1;\ 2{,}2516;\ 2{,}3788;\ 2{,}585;\ 1{,}7219)\) para b, d, f, l, m.</p>\[ H(N,V\mid C)=\tfrac14\cdot1+\tfrac3{16}\cdot2{,}2516+\tfrac7{32}\cdot2{,}3788+\tfrac3{16}\cdot2{,}585+\tfrac5{32}\cdot1{,}7219=1{,}9463\ \text{bits} \]<p>Comprobación: \(H(N,C,V)-H(C)=4{,}25-2{,}3037=1{,}9463\).</p>` },
            { tag: 'h', q: R`Determinar \(p(c,v\mid n)\).`, hint: R`Divide cada casilla de la columna n entre \(p(n)\).`,
              sol: R`<ul><li>n = 1 (÷ 1/2): ba 1/4, be 1/4, da 1/8, de 1/8, fa 1/16, fi 1/16, le 1/16, li 1/16.</li><li>n = 2 (÷ 1/4): da 1/16, de 1/16, fa 1/4, fi 1/4, le 1/8, li 1/8, me 1/16, mi 1/16.</li><li>n = 3 (÷ 1/4): da 1/16, de 1/16, fa 1/16, fi 1/16, le 1/8, li 1/8, me 1/4, mi 1/4.</li></ul>` },
            { tag: 'i', q: R`Calcular a partir de la distribución anterior \(H(C,V\mid N)\).`, hint: R`Las tres distribuciones tienen los mismos valores, cambiados de sitio.`,
              sol: R`<p>Cada \(p(c,v\mid n)\) es una permutación de \((1/4,1/4,1/8,1/8,1/16,1/16,1/16,1/16)\), así que \(H(C,V\mid N=n)=2\cdot\tfrac14\cdot2+2\cdot\tfrac18\cdot3+4\cdot\tfrac1{16}\cdot4=2{,}75\) para todo n, y \(H(C,V\mid N)=2{,}75\) bits.</p>` },
            { tag: 'j', q: R`Calcular \(H(C,V\mid N)\) sin calcular \(p(c,v\mid n)\).`, hint: R`Regla de la cadena.`,
              sol: R`\[ H(C,V\mid N)=H(N,C,V)-H(N)=4{,}25-1{,}5=2{,}75\ \text{bits} \]` },
            { tag: 'k', q: R`Calcular \(H(N\mid C,V)\), \(H(C\mid N,V)\) y \(H(V\mid N,C)\).`, hint: R`\(H(X\mid Y,Z)=H(X,Y,Z)-H(Y,Z)\).`,
              sol: R`<p>\(H(N\mid C,V)=4{,}25-3{,}3037=0{,}9463\); \(H(C\mid N,V)=4{,}25-2{,}9505=1{,}2995\); \(H(V\mid N,C)=4{,}25-3{,}25=1\) bit. Tiene sentido: conocidos N y C, la vocal siempre está entre dos opciones equiprobables.</p>` },
            { tag: 'l', q: R`Calcular la información mutua entre cada pareja de variables.`, hint: R`\(I(X;Y)=H(X)+H(Y)-H(X,Y)\).`,
              sol: R`<p>\(I(N;C)=1{,}5+2{,}3037-3{,}25=0{,}5537\); \(I(N;V)=1{,}5+1{,}572-2{,}9505=0{,}1215\); \(I(C;V)=2{,}3037+1{,}572-3{,}3037=0{,}5720\) bits.</p>` },
            { tag: 'm', q: R`Calcular la información mutua entre cada pareja condicionada a la tercera.`, hint: R`\(I(X;Y\mid Z)=H(X,Z)+H(Y,Z)-H(X,Y,Z)-H(Z)\).`,
              sol: R`<p>\(I(N;C\mid V)=2{,}9505+3{,}3037-4{,}25-1{,}572=0{,}4322\).</p><p>\(I(N;V\mid C)=3{,}25+3{,}3037-4{,}25-2{,}3037=0\).</p><p>\(I(C;V\mid N)=3{,}25+2{,}9505-4{,}25-1{,}5=0{,}4505\) bits.</p>` },
            { tag: 'n', q: R`¿Existe alguna dependencia markoviana entre las variables? Diga cuál y justifíquela.`, hint: R`Busca la información mutua condicionada que vale 0.`,
              sol: R`<p>Sí: \(N\to C\to V\). Como \(I(N;V\mid C)=0\), conocida la consonante, el número y la vocal son independientes: \(p(n,v\mid c)=p(n\mid c)\,p(v\mid c)\). Por ejemplo, con c = d: \(p(n\mid d)=(2/3,1/6,1/6)\), \(p(v\mid d)=(1/2,1/2,0)\) y \(p(1,a\mid d)=1/3=\tfrac23\cdot\tfrac12\).</p><p>Se cumple el teorema del proceso de información: \(I(N;V)=0{,}12\le I(N;C)=0{,}55\) y \(I(N;V)\le I(C;V)=0{,}57\). Las otras dos condicionadas no son 0, así que no hay relación markoviana con otro orden.</p>` }
          ]
        }
      ]
    },
    {
      id: 'ej2', group: 'clase', title: 'Hoja 2: mensajes a, ab, abc', date: 'Segundo grupo de ejercicios · curso 2026/27', minutes: 0,
      intro: 'Hoja mandada en clase este curso. No trae solución oficial; estas son las mías.',
      problems: [
        {
          title: 'Ejercicio',
          statement: R`<p>Una fuente genera sucesiva e independientemente uno de estos mensajes: <b>a</b> (50 %), <b>ab</b> (25 %), <b>abc</b> (25 %), de modo que a la salida se ve una secuencia continua de letras de \(\{a,b,c\}\). Andrés y Clara quieren averiguar la probabilidad de que salga una "a" y la entropía de la secuencia.</p>`,
          parts: [
            { tag: 'a', q: R`Modelar el proceso como un proceso con memoria, calcular sus probabilidades estacionarias, la distribución inicial y la tasa de entropía.`,
              hint: R`Estado = última letra. Tras una b, ¿qué mensajes pueden estar en curso?`,
              sol: R`<p>CM de orden 1 con estado la última letra. Tras <b>a</b>: si el mensaje era "a" empieza otro (a), si era "ab…" sigue b → \((1/2,\ 1/2,\ 0)\). Tras <b>b</b>: el mensaje era "ab" (empieza otro: a) o "abc" (sigue c), con igual probabilidad → \((1/2,\ 0,\ 1/2)\). Tras <b>c</b>: siempre empieza un mensaje → a.</p>
              \[ \Pi=\begin{bmatrix}1/2&1/2&0\\1/2&0&1/2\\1&0&0\end{bmatrix},\qquad \vec\mu_E=\left(\tfrac47,\ \tfrac27,\ \tfrac17\right) \]
              <p>Distribución inicial: la secuencia empieza siempre con a → \(\vec\mu^{(1)}=(1,0,0)\). No es la estacionaria, pero la cadena es homogénea, irreducible y aperiódica (auto-lazo en a), así que converge a \(\vec\mu_E\).</p>
              \[ H(\mathcal X)=\tfrac47\cdot1+\tfrac27\cdot1+\tfrac17\cdot0=\tfrac67=0{,}857\ \text{bits/letra} \]
              <div data-widget="markov" data-matrix="1/2 1/2 0; 1/2 0 1/2; 1 0 0" data-labels="a b c" data-mode="todo"></div>` },
            { tag: 'b', q: R`Razonar (como Clara) cuál es la tasa de entropía y la frecuencia de la "a" en una secuencia larga.`,
              hint: R`Bits por mensaje entre letras por mensaje.`,
              sol: R`<p>Cada mensaje aporta \(H(1/2,1/4,1/4)=1{,}5\) bits y mide de media \(1\cdot\tfrac12+2\cdot\tfrac14+3\cdot\tfrac14=1{,}75\) letras. En una secuencia típica larga:</p>\[ H(\mathcal X)=\frac{1{,}5}{1{,}75}=\frac67\ \text{bits/letra},\qquad P(a)=\frac{1\ \text{a por mensaje}}{1{,}75}=\frac47 \]<p>Coincide con el modelo de Markov.</p>` },
            { tag: 'c', q: R`Andrés propone invertir las letras: mensajes a, ba, cba. Razonar la ventaja.`,
              hint: R`¿Cuál de los dos códigos es prefijo?`,
              sol: R`<p>\(\{a, ab, abc\}\) no es prefijo: la a marca el <i>principio</i> de cada mensaje y hay que esperar a la siguiente a para saber que el anterior terminó (es UD pero con retardo). \(\{a, ba, cba\}\) es prefijo: la a marca el <i>final</i>, y en cuanto llega se sabe qué mensaje era. Descodificación instantánea.</p>` },
            { tag: 'd', q: R`Remodelar el proceso y aclarar si cambian los resultados (recalcular lo del apartado a).`,
              hint: R`Tras una a empieza un mensaje nuevo: a, b(a) o c(ba).`,
              sol: R`<p>Tras <b>a</b> empieza un mensaje: a (1/2), b (1/4) o c (1/4). Tras <b>b</b> siempre a; tras <b>c</b> siempre b.</p>
              \[ \Pi'=\begin{bmatrix}1/2&1/4&1/4\\1&0&0\\0&1&0\end{bmatrix},\qquad \vec\mu_E=\left(\tfrac47,\ \tfrac27,\ \tfrac17\right) \]
              <p>Distribución inicial: la primera letra del primer mensaje, \((1/2,\ 1/4,\ 1/4)\). Tasa: \(\tfrac47\cdot1{,}5=\tfrac67\) bits/letra. <b>No cambia nada</b>: como dice el razonamiento de Clara, solo depende de las probabilidades de los mensajes y de sus longitudes.</p>
              <div data-widget="markov" data-matrix="1/2 1/4 1/4; 1 0 0; 0 1 0" data-labels="a b c" data-mode="todo"></div>` },
            { tag: 'e', q: R`Clara propone el mismo código en binario: a, ba, bba. ¿Es descodificable? ¿Cambian la tasa y la frecuencia de la "a"?`,
              hint: R`Mira dónde está la a en cada palabra. Para el modelo, ¿basta con saber que la última letra fue b?`,
              sol: R`<p>Es prefijo (la a solo aparece al final de cada palabra), así que es descodificable al instante.</p><p>Con solo dos letras, el estado "última letra = b" no basta: tras una b puede venir a o b según sea la primera o la segunda b. Hacen falta tres estados (a, b₁, b₂), y la matriz es la misma que la del apartado a:</p>\[ \Pi''=\begin{bmatrix}1/2&1/2&0\\1/2&0&1/2\\1&0&0\end{bmatrix} \]<p>La tasa sigue siendo \(6/7\) bits/letra y \(P(a)=4/7\) (y \(P(b)=3/7\)): la correspondencia mensaje ↔ palabra es la misma, con las mismas longitudes.</p>` }
          ]
        }
      ]
    },
    {
      id: 'ej3', group: 'clase', title: 'Hoja 3: códigos y píxeles', date: 'Tercer grupo de ejercicios · curso 2026/27', minutes: 0,
      intro: 'Es la hoja de ejercicios que tienes en la carpeta. No trae solución oficial; estas son las mías, hechas con las mismas convenciones que las soluciones de los exámenes.',
      problems: [
        {
          title: 'Ejercicio 1',
          statement: R`<p>Una fuente genera \(X=\{1,\dots,8\}\) con \(P(X)=(0{,}14;\ 0{,}15;\ 0{,}18;\ 0{,}2;\ 0{,}1;\ 0{,}08;\ 0{,}06;\ 0{,}09)\). Diseñe códigos prefijo, calcule su longitud media y compare con la incertidumbre.</p><p class="small">\(H_2(X)=2{,}8972\) bits; \(H_3(X)=1{,}828\) trits.</p>`,
          parts: [
            { tag: 'a', q: R`Código binario con el método Shannon.`, hint: R`Ordena, acumula, \(l=\lceil\log_2 1/p\rceil\), expansión binaria de la acumulada.`,
              sol: R`<div data-widget="shannon" data-probs="0.14 0.15 0.18 0.2 0.1 0.08 0.06 0.09" data-labels="1 2 3 4 5 6 7 8"></div><p>\(L_S=3{,}39\) sb/mensaje, eficiencia 85,5 %. Cumple \(H\le L_S\lt H+1\).</p>` },
            { tag: 'b', q: R`Código binario óptimo.`, hint: R`Huffman binario.`,
              sol: R`<div data-widget="huffman" data-probs="0.14 0.15 0.18 0.2 0.1 0.08 0.06 0.09" data-labels="1 2 3 4 5 6 7 8" data-d="2"></div><p>\(L=2{,}94\) sb/mensaje, eficiencia 98,5 %.</p>` },
            { tag: 'c', q: R`Código ternario óptimo.`, hint: R`8 mensajes → 1 fantasma.`,
              sol: R`<div data-widget="huffman" data-probs="0.14 0.15 0.18 0.2 0.1 0.08 0.06 0.09" data-labels="1 2 3 4 5 6 7 8" data-d="3"></div><p>\(L=1{,}94\) st/mensaje \(=3{,}075\) sb/mensaje; eficiencia \(1{,}828/1{,}94=94{,}2\%\).</p>` },
            { tag: 'd', q: R`Código de Fano.`, hint: R`Sin reordenar (alfabético). Prueba también la versión ordenada.`,
              sol: R`<div data-widget="fano" data-probs="0.14 0.15 0.18 0.2 0.1 0.08 0.06 0.09" data-labels="1 2 3 4 5 6 7 8"></div><p>\(L=2{,}96\) sb/mensaje (97,9 %). Si ordenas antes por probabilidad sale 2,94, igual que Huffman, pero pierde el orden alfabético.</p>` },
            { tag: 'e', q: R`Recortar los códigos en los casos posibles.`, hint: R`Solo se pueden recortar los que tienen Kraft < 1.`,
              sol: R`<p>Huffman binario y Fano son completos (Kraft = 1): no se pueden recortar. El ternario solo tiene libre la rama del fantasma. El de Shannon tiene Kraft = 0,719 y se recorta:</p><div data-widget="trim" data-probs="0.14 0.15 0.18 0.2 0.1 0.08 0.06 0.09" data-labels="1 2 3 4 5 6 7 8" data-method="shannon"></div><p>El Shannon recortado baja de 3,39 a 3,02 sb/mensaje, todavía peor que Huffman.</p>` }
          ]
        },
        {
          title: 'Ejercicio 2',
          statement: R`<p>El rastreo de una imagen tricromática produce cadenas de píxeles del mismo color con longitud media 16, 5 y 2 para rojo, verde y azul. Tras el último píxel de una cadena sigue equiprobablemente uno de los otros dos colores.</p>`,
          parts: [
            { tag: 'a', q: R`Modele las cadenas como fuente markoviana de primer orden. Matriz de transiciones y probabilidades estacionarias.`, hint: R`\(P_{ii}=(L_R-1)/L_R\) y \(1/L_R\) repartido entre los otros dos.`,
              sol: R`\[ \Pi=\begin{bmatrix}15/16&1/32&1/32\\1/10&4/5&1/10\\1/4&1/4&1/2\end{bmatrix} \]<div data-widget="diagram" data-matrix="15/16 1/32 1/32; 1/10 4/5 1/10; 1/4 1/4 1/2" data-labels="R V A"></div><p>Resolviendo \(\vec\mu=\vec\mu\Pi\): \(\vec\mu_E=(16/23,\ 5/23,\ 2/23)\approx(0{,}696;\ 0{,}217;\ 0{,}087)\). Tiene sentido: como las salidas se reparten igual, cada color pesa en proporción a la longitud media de sus cadenas.</p>` },
            { tag: 'b', q: R`Tasa de entropía y comparación con la entropía de un símbolo aislado.`, hint: R`\(\sum\mu_iH(\text{fila})\) frente a \(H(\vec\mu_E)\).`,
              sol: R`<p>\(H(\text{filas})=(0{,}3998;\ 0{,}9219;\ 1{,}5)\) → tasa \(=0{,}609\) bits/píxel. Símbolo aislado: \(H(\vec\mu_E)=1{,}149\) bits. La memoria reduce la incertidumbre casi a la mitad.</p><div data-widget="markov" data-matrix="15/16 1/32 1/32; 1/10 4/5 1/10; 1/4 1/4 1/2" data-labels="R V A" data-mode="codigos"></div>` },
            { tag: 'c', q: R`Diseñe un código óptimo y calcule su longitud media.`, hint: R`Huffman por fila da al menos 1 bit/píxel. Mejor RLE por color + 1 bit para el color siguiente.`,
              sol: R`<p>Huffman por transiciones da 1,130 bits/píxel (no puede bajar de 1 bit por píxel). Con RLE por color, más 1 bit tras cada cadena para elegir entre los otros dos colores:</p><ul><li>Rojo: \(L_R=16\), \(p=15/16\), \(m=11\) (\(p^{11}=0{,}492\)) → \((5{,}425+1)/16=0{,}402\) bits/píxel (entropía de la fila 0,400).</li><li>Verde: \(L_R=5\), \(m=3\) → \((3{,}639+1)/5=0{,}928\) (fila: 0,922).</li><li>Azul: \(L_R=2\), \(p=1/2\), \(m=1\) (código unario) → \((2+1)/2=1{,}5\) (fila: 1,5).</li></ul>\[ \bar L=\tfrac{16}{23}\cdot0{,}402+\tfrac5{23}\cdot0{,}928+\tfrac2{23}\cdot1{,}5=0{,}611\ \text{bits/píxel} \]<p>Solo un 0,4 % por encima de la tasa (0,609).</p><div data-widget="rle" data-lr="16"></div>` }
          ]
        }
      ]
    }
  ];

  /* ------------------------------------------------------------------ */
  const cheat = R`
<div class="fbox"><span class="lbl">Entropía de una variable</span>
<p class="small"><b>Entropía de Shannon</b>: información media de la fuente.</p>
\[ H(X)=-\sum p_i\log p_i \qquad 0\le H\le\log|\mathcal X| \]
<p class="small">0 si es determinista; máxima (\(\log|\mathcal X|\)) si es uniforme. Si faltan datos, <b>caso peor</b> = repartir lo desconocido a partes iguales.</p>
<p class="small"><b>Función de entropía binaria \(H(p)\)</b>: es la entropía de una "moneda" que sale una cosa con probabilidad \(p\) y otra con \(1-p\). Se usa para la fila de una ráfaga (repetir o salir).</p>
\[ H(p)=-p\log_2 p-(1-p)\log_2(1-p),\quad H(\tfrac12)=1,\ H(p)=H(1-p) \]
<p class="small"><b>Cambio de base</b> (trits, quinarios…):</p>
\[ H_D=\frac{H_2}{\log_2D},\quad \log_23=1{,}585,\ \log_25=2{,}322 \]
<p class="small"><b>Agrupamiento</b> (\(X'\) = grupos de \(X\)): primero el grupo, luego el elemento.</p>
\[ H(X)=H(X')+H(X/X') \]
<p class="small">Ej.: fila de ráfaga que sale a \(k\) estados por igual: \(H(\text{fila})=H(p)+(1-p)\log_2k\).</p></div>

<div class="fbox"><span class="lbl">Dos y tres variables</span>
<p class="small"><b>Marginal y condicional</b>:</p>
\[ p(x)=\textstyle\sum_y p(x,y),\quad p(x/y)=\dfrac{p(x,y)}{p(y)} \]
<p class="small"><b>Entropía condicional</b>: media de las entropías de cada caso.</p>
\[ H(Y/X)=\textstyle\sum_x p(x)\,H(Y/X=x) \]
<p class="small"><b>Regla de la cadena</b>:</p>
\[ H(X,Y)=H(X)+H(Y/X) \]
\[ H(X_1,\dots,X_n)=\textstyle\sum_i H(X_i/X_{i-1},\dots,X_1) \]
\[ H(X/Y,Z)=H(X,Y,Z)-H(Y,Z) \]
<p class="small"><b>Información mutua</b>: lo que una variable dice de la otra (intersección del Venn).</p>
\[ I(X;Y)=H(X)-H(X/Y)=H(X)+H(Y)-H(X,Y) \]
\[ I(X;Y)=\textstyle\sum p(x,y)\log\frac{p(x,y)}{p(x)p(y)},\quad I(X;X)=H(X) \]
<p class="small"><b>Información mutua condicionada</b>:</p>
\[ I(X;Y/Z)=H(X,Z)+H(Y,Z)-H(X,Y,Z)-H(Z) \]
<p class="small"><b>Entropía relativa</b> (Kullback-Leibler): bits de más por suponer \(q\) cuando es \(p\). No simétrica.</p>
\[ D(p\|q)=\textstyle\sum p\log\frac pq,\quad I(X;Y)=D\big(p(x,y)\|p(x)p(y)\big) \]</div>

<div class="fbox"><span class="lbl">Teoremas de entropía</span>
<p class="small"><b>Desigualdad de Gibbs</b> (información): \(D(p\|q)\ge0\), \(=0\iff p=q\). De ahí \(I(X;Y)\ge0\), \(=0\iff\) independientes.</p>
<p class="small"><b>Condicionar reduce la entropía</b> (en media; un caso concreto \(H(X/Y=y)\) puede ser mayor):</p>
\[ H(X/Y)\le H(X) \]
<p class="small"><b>Subaditividad</b> (igualdad si independientes):</p>
\[ H(X,Y)\le H(X)+H(Y) \]
<p class="small"><b>Relación markoviana</b> \(X\to Y\to Z\):</p>
\[ X\to Y\to Z\iff I(X;Z/Y)=0\iff p(x,z/y)=p(x/y)p(z/y) \]
<p class="small"><b>Teorema del proceso de información</b>: procesar no crea información.</p>
\[ X\to Y\to Z\ \Rightarrow\ I(X;Z)\le I(X;Y),\ I(X;Z)\le I(Y;Z) \]
<p class="small"><b>Desigualdad de Jensen</b>: \(f\) "cóncava" de clase (\(x^2\)) ⇒ \(E[f(X)]\ge f(E[X])\); con \(\log\) se invierte.</p></div>

<div class="fbox"><span class="lbl">Códigos: medidas</span>
<p class="small"><b>Longitud media</b>, <b>eficiencia</b> y <b>redundancia</b> (todo en la misma unidad):</p>
\[ L=\textstyle\sum p_il_i,\qquad \eta=\dfrac{H_D}{L},\qquad R=\dfrac{L-H}{H}\ (\text{o }1-\eta) \]
<p class="small"><b>Pasar a bits</b> un código D-ario (para comparar binario con ternario):</p>
\[ L_{\text{sb}}=L_D\cdot\log_2D \]
<p class="small"><b>Desigualdad de Kraft</b>: existe código prefijo D-ario con esas longitudes ⇔</p>
\[ \textstyle\sum D^{-l_i}\le1 \]
<p class="small"><b>Teorema de McMillan</b>: todo código UD cumple Kraft. No se gana nada con UD no prefijos.</p>
<p class="small"><b>Recortar</b>: solo si Kraft \(\lt1\) (Shannon suele poderse; Huffman y Fano son completos, Kraft = 1).</p>
<p class="small"><b>Clases</b>: prefijo ⊂ UD ⊂ no singular. Sardinas-Patterson: UD ⇔ \(C\cap C_\infty=\varnothing\).</p></div>

<div class="fbox"><span class="lbl">Teoremas de códigos</span>
<p class="small"><b>Primer teorema de Shannon</b> (codificación fuente): para todo código UD,</p>
\[ L\ge H_D(X),\quad L=H_D\iff p_i=D^{-l_i}\ (\text{distribución }D\text{-ádica}) \]
<p class="small"><b>Extensión</b> (bloques de \(n\) símbolos): la eficiencia sube, pero la tabla crece como \(|\mathcal X|^n\).</p>
\[ H\le\frac{L_n}n\lt H+\frac1n \]
<p class="small"><b>Código desacoplado</b> (diseñado con \(q\), real \(p\)):</p>
\[ H(p)+D(p\|q)\le L\lt H(p)+D(p\|q)+1 \]
<p class="small"><b>Propiedades de Huffman</b> del código óptimo: 1) más probable ⇒ más corta; 2) las dos más largas tienen igual longitud y son de los dos menos probables.</p></div>

<div class="fbox"><span class="lbl">Construcción de códigos</span>
<p class="small"><b>Huffman</b> (óptimo, no alfabético): agrupa los \(D\) menos probables y reordena.</p>
\[ H_D\le L_{Huff}\lt H_D+1 \]
<p class="small"><b>Fantasmas en Huffman D-ario</b>: tiene que quedar \(N=K(D-1)+1\). Condición:</p>
\[ (N-1)\bmod(D-1)=0\ \Rightarrow\ \text{0 fantasmas} \]
<p class="small"><b>Número de fantasmas</b> (si el resto no es 0):</p>
\[ n_f=(D-1)-\big[(N-1)\bmod(D-1)\big] \]
\[ \text{o bien: } K=\left\lceil\tfrac{N-1}{D-1}\right\rceil,\quad n_f=K(D-1)+1-N \]
<p class="small">Ej.: \(N=8,D=3\): \(7\bmod2=1\) → 1 fantasma. \(N=10,D=5\): \(9\bmod4=1\) → 3 fantasmas. Probabilidad 0. En binario nunca.</p>
<p class="small"><b>Fano</b> (alfabético si no reordenas): corta donde las dos mitades sumen lo más parecido.</p>
<p class="small"><b>Código de Shannon</b>: ordena, acumula \(F\), palabra = \(F\) en binario con</p>
\[ l=\left\lceil\log_D\tfrac1p\right\rceil,\qquad H_D\le L\lt H_D+1 \]
<p class="small"><b>Shannon-Fano-Elias</b> (alfabético, sin ordenar):</p>
\[ \bar F=F_{ant}+\tfrac p2,\quad l=\left\lceil\log\tfrac1p\right\rceil+1,\quad L\lt H+2 \]</div>

<div class="fbox"><span class="lbl">Markov: modelo</span>
<p class="small"><b>Matriz de transición</b> (filas suman 1) y <b>evolución</b>:</p>
\[ P_{ij}=P(X_{n+1}=j/X_n=i) \]
\[ \vec\mu^{(n+1)}=\vec\mu^{(n)}\Pi,\quad \vec\mu^{(n)}=\vec\mu^{(1)}\Pi^{\,n-1} \]
<p class="small">Si \(\vec\mu^{(1)}=(1,0,\dots)\), \(\vec\mu^{(2)}\) es la primera fila.</p>
<p class="small"><b>Distribución estacionaria</b>: quita una ecuación y añade \(\sum\mu=1\).</p>
\[ \vec\mu_E=\vec\mu_E\Pi,\quad \textstyle\sum\mu_i=1,\quad \mu_j=\sum_i\mu_iP_{ij} \]
<p class="small"><b>Doblemente estocástica</b> (columnas también suman 1) ⇒ \(\vec\mu_E\) uniforme.</p>
<p class="small"><b>Columnas iguales</b> en Π ⇒ esos \(\mu\) son iguales. Estado al que solo se llega desde otro con prob. 1 ⇒ mismo \(\mu\).</p>
<p class="small"><b>Ráfagas de longitud media \(L_R\)</b>:</p>
\[ P_{ii}=\frac{L_R-1}{L_R},\quad \text{salir}=\frac1{L_R} \]
<p class="small">Si las salidas se reparten igual entre los demás: \(\mu_i\propto L_{R,i}\).</p>
<p class="small"><b>Orden m → orden 1</b>: estado = últimos \(m\) símbolos. Restricciones ("A en parejas") → estados extra (A', A).</p>
<p class="small"><b>Varios estados, mismo símbolo</b>: \(P(\text{símbolo})=\sum\mu\) de esos estados.</p>
<p class="small"><b>Salto que no depende del estado</b>: matriz con todas las filas iguales.</p></div>

<div class="fbox"><span class="lbl">Markov: teoremas</span>
<p class="small"><b>Clasificación</b>: homogénea (Π fija), irreducible (todos alcanzables), aperiódica (MCD de vueltas = 1; basta un \(P_{ii}\gt0\) si es irreducible).</p>
<p class="small"><b>Teorema de unicidad</b>:</p>
\[ \text{H+I}\Rightarrow\vec\mu_E\text{ única} \]
<p class="small"><b>Teorema de convergencia</b> (para cualquier \(\vec\mu^{(1)}\)):</p>
\[ \text{H+I+A}\Rightarrow\vec\mu^{(n)}\to\vec\mu_a=\vec\mu_E \]
<p class="small"><b>Estacionariedad</b> (CM homogénea): estacionaria \(\iff\vec\mu^{(1)}=\vec\mu^{(2)}\iff\vec\mu^{(1)}=\vec\mu_E\). Si no te dan \(\vec\mu^{(1)}\): "no se puede saber".</p>
<p class="small"><b>CM1 es markoviana</b>: \(I(X_n;X_{n+2}/X_{n+1})=0\) ⇒ \(X_n\to X_{n+1}\to X_{n+2}\).</p></div>

<div class="fbox"><span class="lbl">Tasa de entropía y codificación</span>
<p class="small"><b>Tasa de entropía</b> (las dos coinciden si es estacionaria):</p>
\[ H(\mathcal X)=\lim\tfrac1nH(X_1,\dots,X_n),\quad H'(\mathcal X)=\lim H(X_n/X_{n-1},\dots) \]
<p class="small"><b>Tasa de una CM1</b>:</p>
\[ H(\mathcal X)=H(X_2/X_1)=\textstyle\sum_i\mu_iH(\text{fila }i)\le H(\vec\mu_E) \]
<p class="small"><b>Símbolo aislado</b> (tras converger): \(H(\vec\mu_E)\).</p>
<p class="small"><b>Por estados</b> (mínima latencia, Huffman sobre \(\vec\mu_E\)) y <b>por transiciones</b> (un Huffman por fila; primer símbolo con código fijo):</p>
\[ \bar L_{est}=\textstyle\sum\mu_il_i\ge H(\vec\mu_E),\qquad \bar L_{trans}=\sum_i\mu_iL_i\ge H(\mathcal X) \]
<p class="small">Fila con una sola salida: 0 bits. Fila diádica: \(L_i=H(\text{fila})\).</p>
<p class="small"><b>Cadena no homogénea periódica</b> (periodo τ):</p>
\[ H(\mathcal X)=\frac{H(X_1)+H(X_2/X_1)+\dots+H(X_\tau/X_{\tau-1})}{\tau} \]
<p class="small"><b>Mensajes de longitud variable</b> (a, ab, abc):</p>
\[ H(\mathcal X)=\frac{H(\text{mensaje})}{E[\text{letras/mensaje}]},\quad P(a)=\frac{\text{a por mensaje}}{E[\text{letras}]} \]</div>

<div class="fbox"><span class="lbl">Ráfagas (RLE, código de Golomb)</span>
<p class="small"><b>Distribución geométrica</b> de la longitud de ráfaga:</p>
\[ P(l)=(1-p)p^{l-1},\quad L_R=\frac1{1-p},\quad p=\frac{L_R-1}{L_R} \]
<p class="small"><b>Elección de m</b> (\(p^m\) lo más cerca de 1/2):</p>
\[ p^m\approx\tfrac12\ \Rightarrow\ m\approx\frac{-1}{\log_2p}=\frac{\ln2}{-\ln p} \]
<p class="small"><b>Palabra</b> = preámbulo (\(k\) unos y un 0) + resto:</p>
\[ k=\left\lfloor\tfrac{l-1}m\right\rfloor,\quad r=(l-1)\bmod m \]
<p class="small"><b>Longitudes</b>: preámbulo y resto (fijo con \(\lceil\log_2m\rceil\) bits, o Huffman ≈ \(\log_2m\)):</p>
\[ L_G=\frac1{1-p^m}\approx2,\quad L_{SG}=\lceil\log_2m\rceil \]
<p class="small"><b>Bits por símbolo</b> (+1 bit si tras la ráfaga hay que elegir entre 2 estados):</p>
\[ L_i=\frac{L_G+L_{SG}+\text{bits de salida}}{L_R} \]
<p class="small">Merece la pena cuando \(P_{ii}\gt\tfrac12\): Huffman nunca baja de 1 bit/símbolo. \(m=1\) → código unario.</p></div>

<div class="fbox"><span class="lbl">Calculadora</span>
\[ \log_2x=\ln x/\ln2,\quad \ln2=0{,}6931,\ \ln3=1{,}0986 \]
<p class="small"><b>Serie geométrica</b> ("un 10 % más que el siguiente"): \(\sum_{k=0}^{n-1}r^k=\dfrac{r^n-1}{r-1}\).</p>
<p class="small">Decimal a binario: multiplica por 2; si pasa de 1, apunta 1 y resta 1; si no, apunta 0.</p>
<p class="small">\(H(\tfrac12,\tfrac14,\tfrac14)=1{,}5\); \(H(\tfrac12,\tfrac14,\tfrac18,\tfrac18)=1{,}75\); \(H(\tfrac13)=0{,}918\); \(H(0{,}6)=0{,}971\); \(H(0{,}7)=0{,}881\); \(H(0{,}75)=0{,}811\); \(H(0{,}8)=0{,}722\); \(H(0{,}9)=0{,}469\); \(H(0{,}95)=0{,}286\).</p>
<p class="small">\(\log_23=1{,}585\); \(\log_25=2{,}322\); \(\log_26=2{,}585\); \(\log_27=2{,}807\).</p></div>

<div class="fbox"><span class="lbl">Cómo justificar en el examen</span>
<p class="small">Clasificar: "homogénea porque Π no depende del tiempo; irreducible porque…(camino); aperiódica porque \(P_{ii}>0\)". Comparar códigos: misma unidad, eficiencia y \(H\le L\). Siempre unidades: sb/mensaje, st/mensaje, bits/símbolo.</p></div>`;

  return { lessons, cards, exams, cheat };
})();
