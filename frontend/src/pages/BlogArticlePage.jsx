import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import packageIcon from '@iconify/icons-mdi/package-variant';

const articles = {
  'control-inventario-tienda': {
    title: 'Cómo controlar el inventario de tu tienda en Venezuela (Guía 2026)',
    category: 'Inventario',
    readTime: '8 min',
    date: '2026-10-01',
    content: `
      <p>El control de inventario es uno de los aspectos más críticos para cualquier comercio en Venezuela. Una gestión adecuada te permite evitar pérdidas por productos vencidos, optimizar tu capital de trabajo y mejorar la experiencia de tus clientes.</p>
      
      <h2>¿Por qué es importante controlar el inventario?</h2>
      <p>Un inventario bien controlado te permite:</p>
      <ul>
        <li><strong>Evitar quiebres de stock:</strong> Saber exactamente cuándo reabastecer te permite no perder ventas por falta de productos.</li>
        <li><strong>Reducir pérdidas:</strong> Identificar productos con baja rotación o vencidos a tiempo.</li>
        <li><strong>Optimizar el capital:</strong> No invertir en exceso de productos que no se venden.</li>
        <li><strong>Mejorar la toma de decisiones:</strong> Con datos claros sobre qué productos se venden más.</li>
      </ul>
      
      <h2>Métodos de control de inventario</h2>
      
      <h3>1. Inventario periódico</h3>
      <p>Consiste en realizar un conteo físico de todos los productos en intervalos regulares (mensual, trimestral). Es útil para pequeños comercios con pocos productos.</p>
      
      <h3>2. Inventario perpetuo</h3>
      <p>Se actualiza automáticamente con cada venta o compra. Es el método más preciso y el que implementan los sistemas POS modernos.</p>
      
      <h3>3. Análisis ABC</h3>
      <p>Clasifica los productos en tres categorías:</p>
      <ul>
        <li><strong>Productos A:</strong> Alto valor, baja cantidad (20% de productos, 80% del valor)</li>
        <li><strong>Productos B:</strong> Valor y cantidad moderados</li>
        <li><strong>Productos C:</strong> Bajo valor, alta cantidad</li>
      </ul>
      
      <h2>Mejores prácticas para el control de inventario</h2>
      
      <h3>Establece niveles de stock mínimo y máximo</h3>
      <p>Define cuánto inventario debes mantener de cada producto. Esto te ayuda a saber cuándo reabastecer y cuánto comprar.</p>
      
      <h3>Implementa un sistema de alertas</h3>
      <p>Un buen sistema POS te alertará cuando un producto alcance su stock mínimo, permitiéndote reabastecer a tiempo.</p>
      
      <h3>Realiza conteos cíclicos</h3>
      <p>En lugar de contar todo el inventario una vez al año, cuenta una sección diferente cada semana. Esto es más manejable y preciso.</p>
      
      <h3>Registra todas las entradas y salidas</h3>
      <p>Cada producto que entra o sale del inventario debe registrarse. Esto incluye ventas, compras, devoluciones y mermas.</p>
      
      <h2>Cómo un sistema POS facilita el control de inventario</h2>
      <p>Un sistema POS como GestorPOS automatiza gran parte del control de inventario:</p>
      <ul>
        <li>Actualización automática del stock con cada venta</li>
        <li>Alertas de stock bajo configurables</li>
        <li>Reportes de rotación de productos</li>
        <li>Historial de movimientos de inventario</li>
        <li>Gestión de múltiples almacenes o ubicaciones</li>
      </ul>
      
      <h2>Conclusión</h2>
      <p>El control de inventario no tiene que ser complicado. Con las herramientas adecuadas y procesos claros, puedes mantener tu inventario optimizado, reducir pérdidas y mejorar la rentabilidad de tu comercio.</p>
      <p>Si quieres simplificar aún más la gestión de tu inventario, considera implementar un sistema POS que automatice estos procesos y te dé visibilidad en tiempo real de tu stock.</p>
    `
  },
  'facturacion-pequenos-comercios': {
    title: 'Facturación para pequeños comercios: guía completa 2026',
    category: 'Facturación',
    readTime: '10 min',
    date: '2026-10-01',
    content: `
      <p>La facturación es un aspecto fundamental para cualquier comercio en Venezuela. Cumplir con las obligaciones fiscales y mantener un registro adecuado de tus ventas es esencial para el crecimiento y la legalidad de tu negocio.</p>
      
      <h2>¿Qué es una factura y por qué es importante?</h2>
      <p>Una factura es un documento comercial que registra una transacción de venta. Sirve como comprobante de la operación y es necesaria para:</p>
      <ul>
        <li>Cumplir con las obligaciones fiscales ante el SENIAT</li>
        <li>Mantener un registro contable de tus ventas</li>
        <li>Brindar seguridad a tus clientes</li>
        <li>Facilitar la gestión de cuentas por cobrar</li>
      </ul>
      
      <h2>Tipos de facturas en Venezuela</h2>
      
      <h3>Factura a consumidor final</h3>
      <p>Se emite al público en general. No requiere datos fiscales específicos del comprador.</p>
      
      <h3>Factura a contribuyente</h3>
      <p>Se emite a empresas o contribuyentes. Incluye RIF, dirección fiscal y otros datos del comprador.</p>
      
      <h3>Factura de crédito</h3>
      <p>Se utiliza cuando el pago se realiza a crédito. Permite gestionar cuentas por cobrar.</p>
      
      <h2>Requisitos para facturar en Venezuela</h2>
      <p>Para emitir facturas legalmente en Venezuela necesitas:</p>
      <ul>
        <li><strong>RIF:</strong> Registro de Información Fiscal vigente</li>
        <li><strong>Inscripción en el SENIAT:</strong> Como contribuyente</li>
        <li><strong>Sistema de facturación autorizado:</strong> Puede ser manual o computarizado</li>
        <li><strong>Comprobantes fiscales:</strong> Formatos autorizados por el SENIAT</li>
      </ul>
      
      <h2>¿Facturación manual o electrónica?</h2>
      
      <h3>Facturación manual</h3>
      <p>Utiliza facturas pre-numeradas y se llena a mano. Es más económica pero más lenta y propensa a errores.</p>
      
      <h3>Facturación electrónica</h3>
      <p>Se genera digitalmente a través de un sistema. Es más rápida, precisa y facilita el almacenamiento y búsqueda de facturas.</p>
      
      <h2>Beneficios de un sistema de facturación automatizado</h2>
      <p>Implementar un sistema POS con facturación integrada ofrece múltiples ventajas:</p>
      <ul>
        <li><strong>Ahorro de tiempo:</strong> Genera facturas en segundos</li>
        <li><strong>Menos errores:</strong> Cálculos automáticos de impuestos y totales</li>
        <li><strong>Almacenamiento digital:</strong> Accede a cualquier factura en cualquier momento</li>
        <li><strong>Reportes automáticos:</strong> Resumen de ventas, impuestos y más</li>
        <li><strong>Multimoneda:</strong> Factura en USD y VES con la tasa de cambio configurada</li>
      </ul>
      
      <h2>Errores comunes en la facturación</h2>
      <ul>
        <li>No emitir factura en todas las ventas</li>
        <li>Errores en los datos del cliente</li>
        <li>No calcular correctamente los impuestos</li>
        <li>No llevar un registro ordenado de las facturas emitidas</li>
        <li>No conciliar las facturas con las ventas reales</li>
      </ul>
      
      <h2>Conclusión</h2>
      <p>La facturación no tiene que ser un dolor de cabeza. Con un sistema adecuado, puedes cumplir con tus obligaciones fiscales de manera eficiente y profesional, al mismo tiempo que mejoras la gestión de tu comercio.</p>
    `
  },
  'errores-inventario': {
    title: '5 errores que cometen los comercios con su inventario',
    category: 'Inventario',
    readTime: '6 min',
    date: '2026-10-01',
    content: `
      <p>La gestión de inventario es uno de los aspectos más desafiantes para los pequeños comercios. Muchos dueños cometen errores que les cuestan dinero y tiempo. Aquí te mostramos los 5 errores más comunes y cómo evitarlos.</p>
      
      <h2>Error 1: No tener un sistema de control</h2>
      <p>Muchos comercios aún llevan el control de inventario en libretas o en la cabeza. Esto es propenso a errores y hace imposible tener visibilidad real del stock.</p>
      <p><strong>Solución:</strong> Implementa un sistema POS que controle automáticamente el inventario con cada venta.</p>
      
      <h2>Error 2: No establecer niveles de stock mínimo</h2>
      <p>Sin niveles de stock definidos, es imposible saber cuándo reabastecer. Esto resulta en quiebres de stock o exceso de inventario.</p>
      <p><strong>Solución:</strong> Define un stock mínimo para cada producto y configura alertas automáticas.</p>
      
      <h2>Error 3: No realizar conteos periódicos</h2>
      <p>El inventario teórico (lo que dice el sistema) rara vez coincide con el inventario real (lo que hay en el almacén). Las diferencias se acumulan con el tiempo.</p>
      <p><strong>Solución:</strong> Realiza conteos cíclicos semanales o mensuales para corregir discrepancias.</p>
      
      <h2>Error 4: No registrar mermas y pérdidas</h2>
      <p>Los productos se dañan, vencen o se pierden. Si no registras estas pérdidas, tu inventario estará inflado y tomarás decisiones basadas en datos incorrectos.</p>
      <p><strong>Solución:</strong> Registra todas las salidas de inventario, incluyendo mermas y productos vencidos.</p>
      
      <h2>Error 5: No analizar la rotación de productos</h2>
      <p>No todos los productos se venden al mismo ritmo. Si no analizas la rotación, puedes estar invirtiendo demasiado en productos que no se venden.</p>
      <p><strong>Solución:</strong> Revisa reportes de rotación y enfoca tu capital en productos con mayor demanda.</p>
      
      <h2>Conclusión</h2>
      <p>Evitar estos 5 errores te ayudará a mantener un inventario saludable, reducir pérdidas y mejorar la rentabilidad de tu comercio. La clave es tener un sistema que te dé visibilidad y control en tiempo real.</p>
    `
  },
  'como-elegir-sistema-pos': {
    title: 'Cómo elegir un sistema POS para tu negocio en Venezuela',
    category: 'Sistemas POS',
    readTime: '9 min',
    date: '2026-10-01',
    content: `
      <p>Elegir el sistema POS adecuado es una decisión crucial para tu comercio. Un buen sistema puede transformar tu operación, mientras que uno inadecuado puede ser una fuente constante de problemas.</p>
      
      <h2>¿Qué es un sistema POS?</h2>
      <p>POS significa "Punto de Venta" (Point of Sale). Es un sistema que te permite registrar ventas, gestionar inventario, procesar pagos y generar reportes desde una sola plataforma.</p>
      
      <h2>Factores clave al elegir un sistema POS</h2>
      
      <h3>1. Facilidad de uso</h3>
      <p>El sistema debe ser intuitivo y fácil de aprender para ti y tu equipo. Si es complicado, perderás tiempo en capacitación y cometerás errores.</p>
      
      <h3>2. Funcionalidades necesarias</h3>
      <p>Identifica qué funcionalidades necesitas:</p>
      <ul>
        <li>Registro de ventas y facturación</li>
        <li>Control de inventario</li>
        <li>Gestión de clientes</li>
        <li>Reportes y análisis</li>
        <li>Métodos de pago múltiples</li>
        <li>Multimoneda (USD/VES)</li>
      </ul>
      
      <h3>3. Soporte y actualizaciones</h3>
      <p>Elige un proveedor que ofrezca soporte técnico confiable y actualizaciones regulares del sistema.</p>
      
      <h3>4. Costo</h3>
      <p>Considera no solo el costo inicial, sino también mensualidades, costos de implementación y soporte. Compara diferentes opciones.</p>
      
      <h3>5. Escalabilidad</h3>
      <p>El sistema debe crecer contigo. Si planeas abrir más sucursales o aumentar tu catálogo, asegúrate de que el sistema pueda manejarlo.</p>
      
      <h2>Preguntas que debes hacer antes de elegir</h2>
      <ul>
        <li>¿El sistema funciona sin conexión a internet?</li>
        <li>¿Puedo acceder desde mi teléfono o tablet?</li>
        <li>¿Cómo se manejan las copias de seguridad?</li>
        <li>¿Qué pasa si tengo problemas? ¿Hay soporte en español?</li>
        <li>¿Puedo probar el sistema antes de comprarlo?</li>
      </ul>
      
      <h2>Señales de que necesitas un nuevo sistema POS</h2>
      <ul>
        <li>Pierdes tiempo en procesos manuales</li>
        <li>Cometes errores frecuentes en inventario o facturación</li>
        <li>No tienes visibilidad de tus ventas en tiempo real</li>
        <li>Tu equipo tiene dificultades para usar el sistema actual</li>
        <li>El sistema actual no se integra con otras herramientas</li>
      </ul>
      
      <h2>Conclusión</h2>
      <p>Tomarte el tiempo para elegir el sistema POS adecuado es una inversión que se pagará sola en eficiencia y tranquilidad. Evalúa tus necesidades, compara opciones y elige el sistema que mejor se adapte a tu negocio.</p>
    `
  },
  'inventario-manual-vs-sistema': {
    title: 'Inventario manual vs sistema: cuándo dar el salto',
    category: 'Inventario',
    readTime: '7 min',
    date: '2026-10-01',
    content: `
      <p>Muchos comercios comienzan controlando su inventario de forma manual, pero llega un punto en el que esto se vuelve insostenible. ¿Cuándo es el momento de dar el salto a un sistema automatizado?</p>
      
      <h2>Ventajas del inventario manual</h2>
      <ul>
        <li><strong>Costo inicial bajo:</strong> Solo necesitas una libreta o Excel</li>
        <li><strong>Simplicidad:</strong> No requiere capacitación técnica</li>
        <li><strong>Control total:</strong> Tú decides cómo organizarlo</li>
      </ul>
      
      <h2>Desventajas del inventario manual</h2>
      <ul>
        <li><strong>Propenso a errores:</strong> Los cálculos manuales tienen margen de error</li>
        <li><strong>Tiempo consumido:</strong> Horas dedicadas a contar y registrar</li>
        <li><strong>Sin visibilidad en tiempo real:</strong> No sabes exactamente cuánto stock tienes</li>
        <li><strong>Difícil de escalar:</strong> A medida que crece el negocio, se vuelve inmanejable</li>
        <li><strong>Sin alertas:</strong> No te avisa cuando un producto se está agotando</li>
      </ul>
      
      <h2>Señales de que necesitas un sistema</h2>
      
      <h3>1. Tienes más de 50 productos</h3>
      <p>A partir de 50 productos, el control manual se vuelve muy difícil de mantener con precisión.</p>
      
      <h3>2. Pierdes tiempo en conteos</h3>
      <p>Si pasas más de 2 horas por semana contando inventario, es momento de automatizar.</p>
      
      <h3>3. Tienes quiebres de stock frecuentes</h3>
      <p>Si constantemente te quedas sin productos que necesitas vender, necesitas un sistema con alertas.</p>
      
      <h3>4. Tu negocio está creciendo</h3>
      <p>Si planeas expandir tu catálogo o abrir nuevas sucursales, necesitas un sistema escalable.</p>
      
      <h3>5. No tienes visibilidad de tu inventario</h3>
      <p>Si no puedes responder rápidamente "¿cuánto stock tengo de X producto?", necesitas un sistema.</p>
      
      <h2>Beneficios de un sistema de inventario automatizado</h2>
      <ul>
        <li><strong>Actualización en tiempo real:</strong> Cada venta actualiza automáticamente el stock</li>
        <li><strong>Alertas automáticas:</strong> Te avisa cuando un producto llega al mínimo</li>
        <li><strong>Reportes detallados:</strong> Rotación de productos, valor del inventario, más</li>
        <li><strong>Menos errores:</strong> Elimina los errores de cálculo manual</li>
        <li><strong>Ahorro de tiempo:</strong> Dedica tu tiempo a vender, no a contar</li>
      </ul>
      
      <h2>Conclusión</h2>
      <p>El salto de inventario manual a sistema automatizado es una de las mejores inversiones que puedes hacer para tu comercio. No solo ahorrarás tiempo, sino que tomarás mejores decisiones basadas en datos precisos.</p>
    `
  },
  'aumentar-ventas-datos': {
    title: 'Cómo aumentar ventas en tu tienda con datos',
    category: 'Ventas',
    readTime: '8 min',
    date: '2026-10-01',
    content: `
      <p>En los datos está la clave para aumentar las ventas de tu comercio. Saber qué productos se venden más, en qué horarios y a qué clientes te permite tomar decisiones estratégicas.</p>
      
      <h2>¿Qué datos debes analizar?</h2>
      
      <h3>1. Productos más vendidos</h3>
      <p>Identifica tus productos estrella. Estos son los que más se venden y generan más ingresos. Asegúrate de tener siempre stock de estos productos.</p>
      
      <h3>2. Productos con mayor margen</h3>
      <p>No todos los productos generan la misma ganancia. Identifica cuáles tienen mejor margen y promociónalos más.</p>
      
      <h3>3. Horas pico</h3>
      <p>Conoce en qué horas tienes más ventas. Esto te permite optimizar el personal y la atención al cliente.</p>
      
      <h3>4. Comportamiento de clientes</h3>
      <p>Analiza qué compran tus clientes, con qué frecuencia y cuánto gastan. Esto te permite crear ofertas personalizadas.</p>
      
      <h3>5. Tendencias estacionales</h3>
      <p>Identifica qué productos se venden más en diferentes épocas del año. Prepárate con anticipación.</p>
      
      <h2>Cómo usar los datos para aumentar ventas</h2>
      
      <h3>1. Optimiza tu inventario</h3>
      <p>Usa los datos para mantener stock adecuado de los productos más vendidos y reducir el de los que no se mueven.</p>
      
      <h3>2. Crea ofertas estratégicas</h3>
      <p>Identifica productos con baja rotación y crea ofertas para moverlos. Combínalos con productos populares.</p>
      
      <h3>3. Mejora la ubicación de productos</h3>
      <p>Coloca los productos más vendidos en lugares visibles. Usa los datos para determinar la mejor disposición.</p>
      
      <h3>4. Personaliza la atención</h3>
      <p>Conoce a tus clientes frecuentes y ofréceles trato preferencial. Esto aumenta la fidelización.</p>
      
      <h3>5. Ajusta precios inteligentemente</h3>
      <p>Usa los datos de ventas y márgenes para ajustar precios de forma estratégica.</p>
      
      <h2>Herramientas para analizar datos</h2>
      <p>Un sistema POS moderno te proporciona reportes automáticos de:</p>
      <ul>
        <li>Ventas por período</li>
        <li>Productos más vendidos</li>
        <li>Ingresos por categoría</li>
        <li>Comparación de períodos</li>
        <li>Valor del inventario</li>
      </ul>
      
      <h2>Conclusión</h2>
      <p>Los datos son tu mejor aliado para aumentar ventas. No necesitas ser un experto en análisis, solo necesitas las herramientas adecuadas para recopilar y visualizar la información que ya tienes en tu comercio.</p>
    `
  },
  'facturacion-electronica-venezuela': {
    title: 'Guía de facturación electrónica en Venezuela 2026',
    category: 'Facturación',
    readTime: '11 min',
    date: '2026-10-01',
    content: `
      <p>La facturación electrónica es una realidad en Venezuela. Cada vez más comercios adoptan este sistema por sus múltiples beneficios en términos de eficiencia, seguridad y cumplimiento fiscal.</p>
      
      <h2>¿Qué es la facturación electrónica?</h2>
      <p>Es un sistema que permite emitir facturas de forma digital, reemplazando los comprobantes físicos. Las facturas electrónicas tienen la misma validez legal que las tradicionales.</p>
      
      <h2>Beneficios de la facturación electrónica</h2>
      
      <h3>1. Ahorro de tiempo</h3>
      <p>Genera facturas en segundos, sin necesidad de llenar formularios manuales.</p>
      
      <h3>2. Menos errores</h3>
      <p>Los cálculos de impuestos y totales se realizan automáticamente.</p>
      
      <h3>3. Almacenamiento digital</h3>
      <p>Accede a cualquier factura en cualquier momento, sin necesidad de espacio físico.</p>
      
      <h3>4. Búsqueda rápida</h3>
      <p>Encuentra cualquier factura en segundos por número, cliente o fecha.</p>
      
      <h3>5. Seguridad</h3>
      <p>Las facturas electrónicas están respaldadas y protegidas contra pérdidas.</p>
      
      <h2>Requisitos para implementar facturación electrónica</h2>
      <ul>
        <li><strong>RIF vigente:</strong> Debes estar registrado como contribuyente</li>
        <li><strong>Sistema autorizado:</strong> Usar un software de facturación certificado</li>
        <li><strong>Certificado digital:</strong> Para firmar las facturas electrónicamente</li>
        <li><strong>Conexión a internet:</strong> Para emitir y enviar facturas</li>
      </ul>
      
      <h2>Cómo elegir un sistema de facturación electrónica</h2>
      <p>Al elegir un sistema, considera:</p>
      <ul>
        <li>Que esté autorizado por el SENIAT</li>
        <li>Que sea fácil de usar</li>
        <li>Que ofrezca soporte técnico</li>
        <li>Que tenga un costo razonable</li>
        <li>Que se integre con tu sistema de inventario</li>
      </ul>
      
      <h2>Errores comunes en la facturación electrónica</h2>
      <ul>
        <li>No verificar que el sistema esté autorizado por el SENIAT</li>
        <li>No mantener actualizado el certificado digital</li>
        <li>No respaldar las facturas emitidas</li>
        <li>No capacitar al personal en el uso del sistema</li>
        <li>No emitir factura en todas las ventas</li>
      </ul>
      
      <h2>Conclusión</h2>
      <p>La facturación electrónica no es solo una tendencia, es una necesidad para cualquier comercio que quiera ser eficiente y cumplir con las regulaciones. Implementarla te ahorrará tiempo, reducirá errores y mejorará la gestión de tu negocio.</p>
    `
  },
  'administrar-multiples-productos': {
    title: 'Cómo administrar múltiples productos sin perder el control',
    category: 'Inventario',
    readTime: '7 min',
    date: '2026-10-01',
    content: `
      <p>Gestionar un catálogo amplio de productos puede ser abrumador. Sin embargo, con las estrategias y herramientas adecuadas, puedes mantener el control sin perder la cabeza.</p>
      
      <h2>El desafío de múltiples productos</h2>
      <p>A medida que tu negocio crece, también crece tu catálogo de productos. Lo que antes era manejable con 20 productos, se vuelve un desafío con 200 o más.</p>
      
      <h2>Estrategias para organizar tu catálogo</h2>
      
      <h3>1. Categoriza tus productos</h3>
      <p>Organiza tus productos en categorías lógicas. Esto facilita la búsqueda y el análisis. Por ejemplo: bebidas, snacks, limpieza, etc.</p>
      
      <h3>2. Usa códigos SKU</h3>
      <p>Asigna un código único a cada producto. Esto facilita la identificación y el control de inventario.</p>
      
      <h3>3. Establece jerarquías</h4>
      <p>Organiza los productos en subcategorías cuando sea necesario. Por ejemplo: Bebidas → Gaseosas → Colas.</p>
      
      <h3>4. Mantén descripciones claras</h3>
      <p>Cada producto debe tener una descripción clara y consistente. Esto evita confusiones y errores.</p>
      
      <h2>Herramientas que facilitan la gestión</h2>
      
      <h3>1. Sistema POS con gestión de inventario</h3>
      <p>Un buen sistema POS te permite:</p>
      <ul>
        <li>Buscar productos rápidamente</li>
        <li>Filtrar por categoría, marca o proveedor</li>
        <li>Ver stock en tiempo real</li>
        <li>Recibir alertas de stock bajo</li>
        <li>Generar reportes por categoría</li>
      </ul>
      
      <h3>2. Escáner de códigos de barras</h3>
      <p>Agiliza la búsqueda de productos y reduce errores en la facturación.</p>
      
      <h3>3. Importación masiva</h3>
      <p>Si tienes muchos productos, busca un sistema que permita importar productos desde Excel o CSV.</p>
      
      <h2>Mejores prácticas</h2>
      <ul>
        <li><strong>Revisa regularmente:</strong> Elimina productos que no se venden</li>
        <li><strong>Actualiza precios:</strong> Mantén los precios actualizados en el sistema</li>
        <li><strong>Capacita al personal:</strong> Asegúrate de que todos sepan usar el sistema</li>
        <li><strong>Realiza auditorías:</strong> Verifica que el inventario del sistema coincida con el real</li>
      </ul>
      
      <h2>Conclusión</h2>
      <p>Administrar múltiples productos no tiene que ser caótico. Con un sistema adecuado y procesos claros, puedes mantener el control de tu catálogo y tomar mejores decisiones para tu negocio.</p>
    `
  }
};

const trialWhatsAppUrl = 'https://wa.me/584127723148?text=Hola%2C%20quiero%20solicitar%20la%20activaci%C3%B3n%20del%20mes%20de%20prueba%20gratis%20para%20mi%20negocio.';

export function BlogArticlePage() {
  const { slug } = useParams();
  const article = articles[slug];

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div style={{ backgroundColor: '#0b0f17', color: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#0b0f17',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon icon={packageIcon} className="h-6 w-6 text-white" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            GestorPOS<span style={{ color: '#38bdf8' }}>.dev</span>
          </span>
        </Link>
        <Link to="/blog" style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}>
          ← Volver al blog
        </Link>
      </header>

      {/* Article */}
      <article style={{ padding: '60px 32px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
              color: '#38bdf8',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '999px'
            }}>
              {article.category}
            </span>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
              {article.readTime} de lectura
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            {article.title}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Publicado el {new Date(article.date).toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '16px',
            padding: '40px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            lineHeight: 1.8,
            fontSize: '1.05rem',
            color: '#cbd5e1'
          }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* CTA */}
        <div style={{
          marginTop: '48px',
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px', color: '#ffffff' }}>
            ¿Te gustó este artículo?
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '20px', lineHeight: 1.6 }}>
            Descubre cómo GestorPOS puede ayudarte a implementar estas estrategias en tu comercio.
          </p>
          <a
            href={trialWhatsAppUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1rem',
              padding: '12px 24px',
              borderRadius: '10px',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Solicitar mes de prueba gratis
          </a>
        </div>
      </article>

      {/* Footer */}
      <footer style={{ padding: '40px 32px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} GestorPOS — Sistema POS para comercios en Venezuela
        </p>
      </footer>
    </div>
  );
}
