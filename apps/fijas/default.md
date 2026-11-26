### Ejercicio 1 (15 puntos)

**Enunciado:**
Sea $X_1, X_2, \dots, X_{100}$ una muestra aleatoria simple de una población normal $N(0; \sigma^2)$.
Sea $Y_1, Y_2, \dots, Y_{100}$ una muestra aleatoria simple de una población normal $N(0; 4\sigma^2)$. *(Nota: Se asume independencia entre ambas muestras).*
Sean $A = \frac{\sum_{i=1}^{100} X_i}{100}$ y $B = \frac{\sum_{i=1}^{100} Y_i^2}{100}$.
Determinar la distribución de $H = \frac{20 \cdot A}{\sqrt{B}}$.

**Resolución:**

1. **Definición de variables, distribuciones y parámetros de origen:**
   * Variables muestrales de la primera población: $X_i \stackrel{\text{i.i.d.}}{\sim} N(\mu_X = 0; \sigma_X^2 = \sigma^2)$ para $i = 1, \dots, 100$.
   * Variables muestrales de la segunda población: $Y_i \stackrel{\text{i.i.d.}}{\sim} N(\mu_Y = 0; \sigma_Y^2 = 4\sigma^2)$ para $i = 1, \dots, 100$.

2. **Distribución del estadístico $A$ y su estandarización ($Z$):**
   El estadístico $A = \bar{X}$ corresponde a la media muestral de $n_1 = 100$ observaciones normales:
   $$A \sim N\left(0; \frac{\sigma^2}{100}\right)$$
   Estandarizando $A$ para obtener una variable normal estándar $Z \sim N(0; 1)$:
   $$Z = \frac{A - 0}{\sqrt{\frac{\sigma^2}{100}}} = \frac{A}{\frac{\sigma}{10}} = \frac{10A}{\sigma} \sim N(0; 1)$$

3. **Distribución del estadístico $B$ y transformación a Chi-cuadrado ($W$):**
   Estandarizamos cada variable $Y_i$ dividiendo por su desvío estándar ($\sigma_Y = \sqrt{4\sigma^2} = 2\sigma$):
   $$\frac{Y_i}{2\sigma} \stackrel{\text{i.i.d.}}{\sim} N(0; 1)$$
   La suma de los cuadrados de $n_2 = 100$ variables normales estándar independientes sigue una distribución Chi-cuadrado con $\nu = 100$ grados de libertad:
   $$W = \sum_{i=1}^{100} \left(\frac{Y_i}{2\sigma}\right)^2 = \frac{\sum_{i=1}^{100} Y_i^2}{4\sigma^2} \sim \chi^2_{100}$$
   Como $B = \frac{\sum_{i=1}^{100} Y_i^2}{100}$, podemos despejar la suma de cuadrados como $\sum_{i=1}^{100} Y_i^2 = 100B$. Reemplazando en $W$:
   $$W = \frac{100B}{4\sigma^2} = \frac{25B}{\sigma^2} \sim \chi^2_{100}$$

4. **Construcción del estadístico $H$ mediante una distribución $t$ de Student:**
   Por definición, si $Z \sim N(0; 1)$ y $W \sim \chi^2_{\nu}$ son variables aleatorias independientes, entonces el cociente:
   $$T = \frac{Z}{\sqrt{\frac{W}{\nu}}} \sim t_{\nu}$$
   Sustituimos $Z = \frac{10A}{\sigma}$, $W = \frac{25B}{\sigma^2}$ y $\nu = 100$:
   $$T = \frac{\frac{10A}{\sigma}}{\sqrt{\frac{\frac{25B}{\sigma^2}}{100}}} = \frac{\frac{10A}{\sigma}}{\sqrt{\frac{B}{4\sigma^2}}} = \frac{\frac{10A}{\sigma}}{\frac{\sqrt{B}}{2\sigma}}$$
   Simplificando los parámetros $\sigma > 0$ y operando algebraicamente:
   $$T = \frac{10A}{\sigma} \cdot \frac{2\sigma}{\sqrt{B}} = \frac{20A}{\sqrt{B}} = H$$

**Respuesta:**
El estadístico $H = \frac{20 \cdot A}{\sqrt{B}}$ sigue una distribución $t$ de Student con parámetro de $\nu = 100$ grados de libertad ($H \sim t_{100}$), siempre que las muestras de las poblaciones $X$ e $Y$ sean independientes entre sí.

---

### Ejercicio 2 (12.5 puntos)

**Enunciado:**
Sea $X$ una variable aleatoria con distribución de beta $\text{Be}(1; 2)$.
Se define la variable aleatoria $Y = X^2 - 10 \cdot X + 2$.
Calcular la varianza de $Y$ aplicando la covarianza y sus propiedades.
Ayuda: utilizar la fórmula del momento absoluto de orden $k$ de una variable aleatoria con distribución Beta:
$$E(X^k) = \frac{\Gamma(\alpha + \beta) \cdot \Gamma(\alpha + k)}{\Gamma(\alpha) \cdot \Gamma(\alpha + \beta + k)}$$

**Resolución:**

1. **Definición de variables, distribución y parámetros:**
   * Variable aleatoria original: $X \sim \text{Be}(\alpha = 1; \beta = 2)$.
   * Variable aleatoria transformada: $Y = X^2 - 10X + 2$.
   * Recordamos la propiedad de la función Gamma para enteros positivos: $\Gamma(m) = (m - 1)!$.

2. **Cálculo de los momentos absolutos de orden $k = 1, 2, 3, 4$ de $X$:**
   Aplicando la fórmula provista con $\alpha = 1$ y $\beta = 2$ ($\alpha + \beta = 3$):
   $$E(X^k) = \frac{\Gamma(3) \cdot \Gamma(1 + k)}{\Gamma(1) \cdot \Gamma(3 + k)} = \frac{2! \cdot k!}{0! \cdot (2 + k)!} = \frac{2 \cdot k!}{(k + 2)(k + 1)k!} = \frac{2}{(k + 1)(k + 2)}$$
   Evaluamos para cada orden necesario:
   * Para $k = 1$: $E(X) = \frac{2}{(2)(3)} = \frac{2}{6} = \frac{1}{3}$
   * Para $k = 2$: $E(X^2) = \frac{2}{(3)(4)} = \frac{2}{12} = \frac{1}{6}$
   * Para $k = 3$: $E(X^3) = \frac{2}{(4)(5)} = \frac{2}{20} = \frac{1}{10}$
   * Para $k = 4$: $E(X^4) = \frac{2}{(5)(6)} = \frac{2}{30} = \frac{1}{15}$

3. **Cálculo de varianzas y covarianza de $X^2$ y $X$:**
   * Varianza de $X$:
     $$V(X) = E(X^2) - [E(X)]^2 = \frac{1}{6} - \left(\frac{1}{3}\right)^2 = \frac{1}{6} - \frac{1}{9} = \frac{3 - 2}{18} = \frac{1}{18}$$
   * Varianza de $X^2$:
     $$V(X^2) = E(X^4) - [E(X^2)]^2 = \frac{1}{15} - \left(\frac{1}{6}\right)^2 = \frac{1}{15} - \frac{1}{36} = \frac{12 - 5}{180} = \frac{7}{180}$$
   * Covarianza entre $X^2$ y $X$:
     $$\text{Cov}(X^2; X) = E(X^2 \cdot X) - E(X^2) \cdot E(X) = E(X^3) - E(X^2) \cdot E(X)$$
     $$\text{Cov}(X^2; X) = \frac{1}{10} - \left(\frac{1}{6} \cdot \frac{1}{3}\right) = \frac{1}{10} - \frac{1}{18} = \frac{9 - 5}{90} = \frac{4}{90} = \frac{2}{45}$$

4. **Cálculo de la varianza de $Y$ mediante propiedades:**
   Aplicamos las propiedades de la varianza sobre $Y = X^2 - 10X + 2$ (la constante aditiva $+2$ no altera la varianza):
   $$V(Y) = V(X^2 - 10X + 2) = V(X^2) + (-10)^2 V(X) + 2 \cdot (1) \cdot (-10) \cdot \text{Cov}(X^2; X)$$
   $$V(Y) = V(X^2) + 100 \cdot V(X) - 20 \cdot \text{Cov}(X^2; X)$$
   Sustituyendo los valores obtenidos con denominador común $180$:
   $$V(Y) = \frac{7}{180} + 100 \left(\frac{1}{18}\right) - 20 \left(\frac{2}{45}\right) = \frac{7}{180} + \frac{1000}{180} - \frac{160}{180}$$
   $$V(Y) = \frac{7 + 1000 - 160}{180} = \frac{847}{180} \approx 4.7056$$

**Respuesta:**
La varianza de la variable aleatoria transformada $Y = X^2 - 10X + 2$, calculada mediante las propiedades de la varianza y la covarianza entre $X^2$ y $X$, es exactamente $\frac{847}{180}$ (aproximadamente $4.71$).

---

### Ejercicio 3 (15 puntos)

**Enunciado:**
Sea $X_1, X_2, \dots, X_n$ una muestra aleatoria simple de una población con distribución normal $N(\mu; \sigma^2)$, con media conocida y varianza desconocida.
Sea el siguiente estimador de la varianza poblacional $\widehat{\sigma^2} = \frac{\sum_{i=1}^n (X_i - \mu)^2}{n}$.
Especificar el modelo estadístico de este problema y calcular el ECM de $\widehat{\sigma^2}$. ¿Es un estimador consistente?

**Resolución:**

1. **Especificación del modelo estadístico:**
   * **Variables observables:** Muestra aleatoria simple $\mathbf{X} = (X_1, X_2, \dots, X_n)$ con soporte $\mathcal{X} = \mathbb{R}^n$.
   * **Familia de distribuciones:** Distribución conjunta Normal multivariada de componentes independientes e idénticamente distribuidas:
     $$f(\mathbf{x}; \sigma^2) = \prod_{i=1}^n \frac{1}{\sqrt{2\pi\sigma^2}} \exp\left(-\frac{(x_i - \mu)^2}{2\sigma^2}\right) = (2\pi\sigma^2)^{-n/2} \exp\left(-\frac{\sum_{i=1}^n (x_i - \mu)^2}{2\sigma^2}\right)$$
   * **Parámetro desconocido y espacio paramétrico:** El parámetro a estimar es $\theta = \sigma^2$, con espacio paramétrico $\Theta = \mathbb{R}^+ = (0; +\infty)$, mientras que $\mu \in \mathbb{R}$ es una constante conocida.

2. **Distribución muestral del estimador $\widehat{\sigma^2}$:**
   Dado que $X_i \stackrel{\text{i.i.d.}}{\sim} N(\mu; \sigma^2)$ y $\mu$ es conocida, cada variable estandarizada cumple:
   $$\frac{X_i - \mu}{\sigma} \stackrel{\text{i.i.d.}}{\sim} N(0; 1)$$
   Al elevar al cuadrado y sumar las $n$ observaciones independientes, obtenemos una variable Chi-cuadrado con $n$ grados de libertad:
   $$U = \sum_{i=1}^n \left(\frac{X_i - \mu}{\sigma}\right)^2 = \frac{\sum_{i=1}^n (X_i - \mu)^2}{\sigma^2} \sim \chi^2_n$$
   Despejando el estimador en función de $U$:
   $$\widehat{\sigma^2} = \frac{\sigma^2}{n} \cdot U$$

3. **Cálculo del Error Cuadrático Medio ($\text{ECM}$):**
   El $\text{ECM}$ se descompone en la varianza más el sesgo al cuadrado:
   $$\text{ECM}(\widehat{\sigma^2}) = V(\widehat{\sigma^2}) + \left[B(\widehat{\sigma^2})\right]^2$$
   Sabemos que para $U \sim \chi^2_n$, su esperanza es $E(U) = n$ y su varianza es $V(U) = 2n$.
   * **Esperanza y Sesgo:**
     $$E(\widehat{\sigma^2}) = E\left(\frac{\sigma^2}{n} U\right) = \frac{\sigma^2}{n} E(U) = \frac{\sigma^2}{n} \cdot n = \sigma^2$$
     Por lo tanto, el estimador es insesgado:
     $$B(\widehat{\sigma^2}) = E(\widehat{\sigma^2}) - \sigma^2 = \sigma^2 - \sigma^2 = 0$$
   * **Varianza:**
     $$V(\widehat{\sigma^2}) = V\left(\frac{\sigma^2}{n} U\right) = \left(\frac{\sigma^2}{n}\right)^2 V(U) = \frac{\sigma^4}{n^2} \cdot 2n = \frac{2\sigma^4}{n}$$
   * **Error Cuadrático Medio:**
     $$\text{ECM}(\widehat{\sigma^2}) = \frac{2\sigma^4}{n} + 0^2 = \frac{2\sigma^4}{n}$$

4. **Análisis de consistencia:**
   Por la condición suficiente de consistencia en media cuadrática, un estimador es consistente si $\lim_{n \to \infty} \text{ECM}(\widehat{\sigma^2}) = 0$:
   $$\lim_{n \to \infty} \text{ECM}(\widehat{\sigma^2}) = \lim_{n \to \infty} \frac{2\sigma^4}{n} = 0$$
   *(Alternativamente, como es insesgado y su varianza tiende a cero cuando $n \to \infty$, converge en probabilidad a $\sigma^2$ por la desigualdad de Chebyshev).*

**Respuesta:**
El modelo estadístico queda definido por la muestra $\mathbf{X} \in \mathbb{R}^n$ con densidad conjunta normal $f(\mathbf{x}; \sigma^2)$ de media conocida $\mu$ y espacio paramétrico $\Theta = (0; +\infty)$; el Error Cuadrático Medio del estimador $\widehat{\sigma^2}$ es $\frac{2\sigma^4}{n}$ y sí es un estimador consistente de la varianza poblacional $\sigma^2$ porque su $\text{ECM}$ converge a cero a medida que el tamaño muestral $n$ tiende a infinito.
