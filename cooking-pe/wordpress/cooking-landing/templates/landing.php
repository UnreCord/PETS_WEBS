<?php
/**
 * Plantilla de página "CooKing – Landing (pantalla completa)".
 * El marcado es el mismo de cooking-pe/index.html; las imágenes de marca salen de la biblioteca de medios.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$ck_media = cooking_landing_media_base();
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title><?php echo esc_html( wp_get_document_title() ); ?></title>
<?php cooking_landing_head_meta(); ?>
<?php wp_head(); ?>
</head>
<body <?php body_class( 'cooking-landing' ); ?>>
<?php wp_body_open(); ?>
<a class="skip" href="#contenido">Ir al contenido</a>

<header class="hdr" id="top">
  <nav class="wrap hdr__in" aria-label="Principal">
    <ul class="hdr__links hdr__links--l">
      <li><a href="#conocenos">Conócenos</a></li>
      <li><a href="#dog">Para perros</a></li>
      <li><a href="#cat">Para gatos</a></li>
    </ul>
    <a class="logo" href="#top" aria-label="CooKing, ir al inicio">
      <img src="<?php echo esc_url( $ck_media ); ?>2026/07/logo-cooking.svg" width="74" height="74" alt="" data-logo>
      <span class="logo__word">CooKing</span>
    </a>
    <ul class="hdr__links hdr__links--r">
      <li><a href="#comprar">Dónde comprar</a></li>
      <li><a href="#contactanos">Contáctanos</a></li>
      <li><a class="btn btn--orange btn--sm" href="#comprar">Encuentra tu tienda</a></li>
    </ul>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mnav">Menú</button>
    <div class="mnav" id="mnav">
      <ul>
        <li><a href="#conocenos">Conócenos</a></li>
        <li><a href="#dog">Para perros</a></li>
        <li><a href="#cat">Para gatos</a></li>
        <li><a href="#plan">Su plan CooKing</a></li>
        <li><a href="#comprar">Dónde comprar</a></li>
        <li><a href="#contactanos">Contáctanos</a></li>
      </ul>
    </div>
  </nav>
</header>

<main id="contenido">

  <!-- HERO -->
  <section class="hero" id="hero" aria-labelledby="hero-title">
    <div class="hero__bokeh" aria-hidden="true">
      <i style="left:6%;top:12%;width:180px;height:180px"></i>
      <i style="left:78%;top:8%;width:240px;height:240px;animation-delay:-4s"></i>
      <i style="left:30%;top:58%;width:140px;height:140px;animation-delay:-8s"></i>
      <i style="left:64%;top:48%;width:120px;height:120px;animation-delay:-2s"></i>
    </div>
    <div class="chef chef--dog" aria-hidden="true"><div class="chef__inner"><img data-photo="chef-perro" alt="" width="540" height="578"></div></div>
    <div class="chef chef--cat" aria-hidden="true"><div class="chef__inner"><img data-photo="chef-gato" alt="" width="300" height="410"></div></div>

    <div class="wrap hero__title">
      <h1 id="hero-title">
        <span class="hero__kicker">El Rey de la</span><br>
        <span class="hero__script">Cocina Nutricional<svg class="hero__swoosh" viewBox="0 0 600 40" preserveAspectRatio="none" aria-hidden="true"><path d="M8 28 C 140 6, 300 4, 420 14 S 560 30, 592 18"/></svg></span>
      </h1>
      <p class="hero__lead">Alimento super premium sin cereales para perros y gatos, hecho en Europa, con carne fresca como primer ingrediente.</p>
      <div class="hero__ctas">
        <a class="btn btn--brown" href="#dog">Recetas para perros</a>
        <a class="btn btn--brown" href="#cat">Recetas para gatos</a>
        <a class="btn btn--orange" href="#comprar">Dónde comprar</a>
      </div>
    </div>

    <div class="hero__stage" aria-hidden="false">
      <svg class="hero__ground" viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden="true"><path d="M0,120 C220,40 420,30 620,70 C820,110 1020,150 1220,110 C1320,90 1390,60 1440,50 L1440,260 L0,260 Z" fill="#FFF8EF"/><path d="M0,150 C260,80 480,70 700,105 C900,135 1120,175 1440,95" fill="none" stroke="#F4C9A0" stroke-width="3" opacity=".7"/></svg>
      <div class="hero__bags media" data-caption="">
        <img src="<?php echo esc_url( $ck_media ); ?>2026/07/img-prin.png"
             srcset="<?php echo esc_url( $ck_media ); ?>2026/07/img-prin-768x376.png 768w, <?php echo esc_url( $ck_media ); ?>2026/07/img-prin-1024x501.png 1024w, <?php echo esc_url( $ck_media ); ?>2026/07/img-prin.png 1200w"
             sizes="(max-width: 880px) 86vw, 760px" width="1200" height="587" fetchpriority="high"
             alt="Empaques de las recetas CooKing para perros y gatos">
      </div>
    </div>
  </section>

  <!-- RIBBON -->
  <div class="ribbon-wrap" aria-hidden="true">
    <div class="ribbon"><div class="ribbon__track" id="ribbon"></div></div>
  </div>

  <!-- CONÓCENOS -->
  <section class="sec" id="conocenos" aria-labelledby="know-title">
    <div class="wrap know">
      <div class="know__art">
        <div class="arch media" data-caption="">
          <img src="<?php echo esc_url( $ck_media ); ?>2026/07/img-intro-1.jpg"
               srcset="<?php echo esc_url( $ck_media ); ?>2026/07/img-intro-1-768x724.jpg 768w, <?php echo esc_url( $ck_media ); ?>2026/07/img-intro-1-1024x966.jpg 1024w"
               sizes="(max-width: 899px) 90vw, 560px" width="1024" height="966" loading="lazy" alt="Mascota disfrutando su plato de CooKing">
        </div>
        <div class="badge-rot" aria-hidden="true">
          <svg viewBox="0 0 150 150"><defs><path id="circ" d="M75,75 m-58,0 a58,58 0 1,1 116,0 a58,58 0 1,1 -116,0"/></defs><circle class="badge-rot__disc" cx="75" cy="75" r="72"/><text><textPath href="#circ">SIN CEREALES ✦ CARNE FRESCA ✦ HECHO EN EUROPA ✦</textPath></text></svg>
          <img src="<?php echo esc_url( $ck_media ); ?>2026/07/logo-cooking.svg" alt="" width="60" height="60" data-badge-logo>
        </div>
      </div>
      <div class="know__copy">
        <h2 class="h2" id="know-title">CooKing es irresistible para tus engreídos</h2>
        <p class="lead">Una buena nutrición comienza con ingredientes reales. Combinamos proteínas de alta calidad, vegetales y nutrientes funcionales en recetas completas para acompañar su bienestar todos los días.</p>
        <p class="lead">A tu mascota no solo le encantará: también cuidará sus articulaciones y su peso. Un alimento premium, accesible y recomendado por veterinarios.</p>
        <ul class="facts">
          <li class="fact"><span class="badge-ico" data-icon="star"></span><div><b>+30 años</b><br><span>cocinando para mascotas</span></div></li>
          <li class="fact"><span class="badge-ico" data-icon="globe"></span><div><b>27 países</b><br><span>confían en CooKing</span></div></li>
          <li class="fact"><span class="badge-ico" data-icon="dumbbell"></span><div><b>80&nbsp;%</b><br><span>de su proteína es animal</span></div></li>
        </ul>
        <a class="btn btn--brown" href="#ingredientes">Descubre qué hay en su plato</a>
      </div>
    </div>
  </section>

  <!-- INGREDIENTES -->
  <section class="sec ingr" id="ingredientes" aria-labelledby="ingr-title">
    <svg class="wave wave--top" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0,40 C260,80 520,16 780,44 C1040,72 1250,74 1440,38 L1440,100 L0,100 Z" fill="currentColor"/></svg>
    <div class="wrap ingr__grid">
      <div class="ingr__copy">
        <h2 class="h2" id="ingr-title">¡Los ingredientes marcan la diferencia!</h2>
        <p class="lead">Carne y pescado frescos primero, luego patata, legumbres, verduras y frutos rojos. A tu mascota no solo le encantará: también protegerá sus articulaciones y controlará su peso. Un alimento premium, accesible y recomendado por veterinarios.</p>
        <ul class="ingr__list" aria-label="Ingredientes principales">
          <li>Pollo fresco</li><li>Salmón</li><li>Cordero</li><li>Patata</li><li>Legumbres</li><li>Zanahoria</li><li>Arándanos</li><li>Espinaca</li>
        </ul>
      </div>
      <div class="ingr__pan media" data-caption="">
        <div class="ingr__shadow"><div class="ingr__spin" id="pan-spin">
          <img src="<?php echo esc_url( $ck_media ); ?>2026/07/plato.png" width="694" height="547" loading="lazy" draggable="false" alt="Olla con los ingredientes de una receta CooKing: carne, legumbres y frutos rojos">
        </div></div>
        <p class="ingr__hint" id="pan-hint" aria-hidden="true"><span class="ico" data-icon="rotate-cw"></span><span data-hint-text>Arrastra la olla para girarla</span></p>
      </div>
    </div>
    <div class="ingr__band" role="img" aria-label="Ingredientes frescos: salmón, pollo, arándanos, carne, atún, zanahoria, espinaca y patata"></div>
  </section>

  <!-- EL PLATO -->
  <section class="sec plate" id="plato" aria-labelledby="plate-title">
    <div class="wrap">
      <div class="sec__head plate__head">
        <h2 class="h2" id="plate-title">Lo que hace especial a cada croqueta</h2>
        <p class="lead">Toca cada punto del plato para descubrirlo.</p>
      </div>
      <div class="bowl" id="bowl">
        <div class="bowl__art" id="bowl-art">
          <img class="bowl__img" data-render="bowl" width="1100" height="640" alt="Plato de cerámica CooKing lleno de croquetas">
          <div class="bowl__fly" id="bowl-fly" aria-hidden="true"></div>
          <div id="hots"></div>
        </div>
        <div class="claim" id="claim" hidden aria-hidden="true" role="region" aria-live="polite" aria-label="Detalle del ingrediente"></div>
      </div>
      <div class="chips" id="chips" role="group" aria-label="Lo que hace especial a CooKing"></div>
      <button class="bowl__toss" id="bowl-toss" type="button">Lanzar las croquetas</button>
    </div>
  </section>

  <!-- BENEFICIOS -->
  <section class="sec benefits" id="beneficios" aria-labelledby="benefits-title">
    <svg class="wave wave--top" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0,40 C240,90 520,10 760,40 C1000,70 1220,90 1440,50 L1440,100 L0,100 Z" fill="currentColor"/></svg>
    <div class="wrap">
      <div class="sec__head">
        <h2 class="h2" id="benefits-title">Lo que cuida cada receta<span class="script">en todas sus etapas</span></h2>
      </div>
      <div class="orbit" id="orbit">
        <svg class="orbit__line" id="orbit-line" aria-hidden="true" focusable="false"><defs><mask id="orbit-mask" maskUnits="userSpaceOnUse"></mask></defs><circle mask="url(#orbit-mask)"/></svg>
        <div class="orbit__disc" aria-hidden="true"></div>
        <div class="orbit__pets media" data-caption="">
          <img src="<?php echo esc_url( $ck_media ); ?>2026/08/perro-gato-final.png"
               srcset="<?php echo esc_url( $ck_media ); ?>2026/08/perro-gato-final-768x835.png 768w, <?php echo esc_url( $ck_media ); ?>2026/08/perro-gato-final-942x1024.png 942w"
               sizes="(max-width: 899px) 80vw, 400px" width="942" height="1024" loading="lazy" alt="Perro y gato CooKing">
          <div class="orbit__alt" aria-hidden="true"><img src="<?php echo esc_url( $ck_media ); ?>2026/07/img-intro-1-768x724.jpg" alt="" width="768" height="724" loading="lazy"></div>
        </div>
      </div>
    </div>
    <svg class="wave wave--bottom" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0,70 C260,20 480,90 760,60 C1020,32 1220,20 1440,58 L1440,100 L0,100 Z" fill="currentColor"/></svg>
  </section>

  <!-- RECETAS -->
  <section class="sec recipes" id="recetas" aria-labelledby="recipes-title">
    <span class="anchor" id="dog"></span><span class="anchor" id="cat"></span>
    <div class="wrap">
      <div class="sec__head">
        <h2 class="h2" id="recipes-title">Recetas completas y balanceadas</h2>
        <p class="lead">Siete recetas sin cereales, una para cada etapa. Compáralas o <a href="#plan">arma su plan en 30 segundos</a>.</p>
      </div>
      <div class="rbar">
      <div class="tabs-wrap">
        <div class="tabs" role="tablist" aria-label="Recetas por especie" data-active="0">
          <span class="tabs__pill" aria-hidden="true"></span>
          <button class="tab" role="tab" id="tab-perro" aria-controls="panel-perro" aria-selected="true"><span class="ico" data-icon="dog"></span>Perros <small>(4)</small></button>
          <button class="tab" role="tab" id="tab-gato" aria-controls="panel-gato" aria-selected="false" tabindex="-1"><span class="ico" data-icon="cat"></span>Gatos <small>(3)</small></button>
        </div>
      </div>
      <div class="rfilters" id="rfilters">
        <div class="rfilter"><span class="rfilter__label" id="fl-edad"><span class="ico" data-icon="sliders-horizontal"></span>Edad</span><div class="rfilter__opts" role="group" aria-labelledby="fl-edad" data-filter="edad"></div></div>
        <div class="rfilter"><span class="rfilter__label" id="fl-bolsa">Tamaño de bolsa</span><div class="rfilter__opts" role="group" aria-labelledby="fl-bolsa" data-filter="bolsa"></div></div>
      </div>
      <p class="rcount" id="rcount" role="status" aria-live="polite"></p>
      </div>
      <div class="panel" role="tabpanel" id="panel-perro" aria-labelledby="tab-perro"><ul class="rgrid" data-grid="perro"></ul><p class="rempty" hidden></p></div>
      <div class="panel" role="tabpanel" id="panel-gato" aria-labelledby="tab-gato" hidden><ul class="rgrid rgrid--3" data-grid="gato"></ul><p class="rempty" hidden></p></div>
      <p class="swipe-hint">Desliza para ver más recetas</p>
    </div>
  </section>

  <!-- SU PLAN -->
  <section class="sec plan" id="plan" aria-labelledby="plan-title">
    <svg class="wave wave--top" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0,44 C250,86 520,14 790,46 C1050,76 1250,70 1440,36 L1440,100 L0,100 Z" fill="currentColor"/></svg>
    <div class="wrap">
      <div class="sec__head">
        <h2 class="h2" id="plan-title">Arma su plan CooKing<span class="script">en 30 segundos</span></h2>
        <p class="lead">Te decimos qué receta le va mejor, cuánto le toca al día y cuánto le dura cada bolsa.</p>
      </div>
      <div class="plan__tabs" aria-hidden="true"><button type="button" data-panel="0" class="is-on" tabindex="-1"><span>1</span>Tu mascota</button><button type="button" data-panel="1" tabindex="-1"><span>2</span>Su plan</button></div>
      <div class="plan__grid" id="plan-grid">
        <form class="planf" id="plan-form" aria-label="Datos de tu mascota">
          <fieldset class="planf__q">
            <legend><span class="planf__n" aria-hidden="true">1</span>¿Para quién es?</legend>
            <div class="opts opts--big">
              <label class="opt"><input type="radio" name="plan-sp" value="perro" checked><span class="opt__box"><span class="ico" data-icon="dog"></span>Perro</span></label>
              <label class="opt"><input type="radio" name="plan-sp" value="gato"><span class="opt__box"><span class="ico" data-icon="cat"></span>Gato</span></label>
            </div>
          </fieldset>
          <fieldset class="planf__q">
            <legend><span class="planf__n" aria-hidden="true">2</span>¿Qué edad tiene?</legend>
            <div class="opts opts--stack" id="plan-age"></div>
          </fieldset>
          <div class="planf__q">
            <label class="planf__lbl" for="plan-kg"><span class="planf__n" aria-hidden="true">3</span>¿Cuánto pesa?</label>
            <div class="kg"><span class="kg__pet" id="plan-pet" aria-hidden="true"></span><output id="plan-kg-out" for="plan-kg">12 kg</output></div>
            <input class="range" id="plan-kg" type="range" min="1" max="70" step="0.5" value="12">
            <div class="kg__scale" aria-hidden="true"><span id="plan-kg-min">1 kg</span><span id="plan-kg-max">70 kg</span></div>
          </div>
          <fieldset class="planf__q">
            <legend><span class="planf__n" aria-hidden="true">4</span>¿Alguna condición?</legend>
            <div class="opts" id="plan-cond"></div>
            <p class="planf__hint">Solo cambia la receta recomendada, no la cantidad.</p>
          </fieldset>
          <button class="btn btn--orange planf__go" type="button" data-panel="1">Ver su plan<span aria-hidden="true">→</span></button>
        </form>
        <div class="planr">
          <article class="planr__card" id="plan-card" aria-labelledby="plan-name">
            <div class="planr__top">
              <div class="planr__stage" id="plan-stage" aria-hidden="true">
                <div class="planr__bag" id="plan-bag"></div>
              </div>
              <div>
                <p class="planr__kicker"><span class="ico" data-icon="sparkles"></span>Su receta ideal</p>
                <h3 class="planr__name" id="plan-name">Adulto con cordero</h3>
                <p class="planr__for" id="plan-for"></p>
                <ul class="planr__why" id="plan-why" aria-label="Por qué esta receta"></ul>
                <p class="planr__alt" id="plan-alt" hidden></p>
              </div>
            </div>
            <div class="planr__stats">
              <div class="stat">
                <p class="stat__label">Ración diaria estimada</p>
                <p class="stat__big"><span id="plan-g">0</span><small>g al día</small></p>
                <p class="stat__sub" id="plan-meals"></p>
                <div class="pile" id="plan-pile" aria-hidden="true"></div>
              </div>
              <div class="stat">
                <p class="stat__label">Cada bolsa le dura</p>
                <ul class="bags" id="plan-bags"></ul>
              </div>
            </div>
            <div class="stat planr__switch">
              <p class="stat__label"><span>Su cambio en 7 días (gramos de CooKing)</span><a href="#cambio">Ver cómo</a></p>
              <ol class="sw7" id="plan-switch"></ol>
            </div>
            <div class="planr__ctas">
              <a class="btn btn--orange" href="#comprar">Encuentra tu tienda</a>
              <button class="btn btn--light" type="button" id="plan-see">Ver la receta</button>
            </div>
            <p class="planr__note">Estimación orientativa. Compárala con la tabla del empaque y ajústala con tu veterinario. <button type="button" data-panel="0">Cambiar datos</button></p>
          </article>
          <p class="sr" id="plan-live" aria-live="polite"></p>
          <div class="plan__peek" id="plan-peek" aria-hidden="true"><p><b id="plan-peek-name"></b><span id="plan-peek-g"></span></p><a class="btn btn--orange" href="#plan-card" tabindex="-1">Ver su plan</a></div>
        </div>
        <p class="plan__note">Cálculo orientativo para una mascota sana: usamos la energía de cada receta (kcal por kilo) y la fórmula estándar de requerimiento energético (70 × peso<sup>0,75</sup>, según su etapa de vida). Toma como referencia la tabla del empaque y ajusta la ración con tu veterinario.</p>
      </div>
    </div>
  </section>

  <!-- CAMBIO -->
  <section class="sec switch" id="cambio" aria-labelledby="switch-title">
    <svg class="wave wave--top" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0,50 C300,95 560,10 820,42 C1060,72 1260,86 1440,40 L1440,100 L0,100 Z" fill="currentColor"/></svg>
    <div class="wrap">
      <div class="sec__head">
        <h2 class="h2" id="switch-title">Cambia su alimento en 7 días</h2>
        <p class="lead">Un cambio gradual cuida su digestión. Mezcla CooKing con su alimento actual en estas proporciones.</p>
      </div>
      <div class="pour" id="pour">
        <div class="pour__stage" id="pour-stage">
          <img class="pour__bowl" id="pour-bowl" data-render="bowl-empty" width="900" height="684" alt="" aria-hidden="true">
          <canvas class="pour__cv pour__heap" id="pour-heap" aria-hidden="true"></canvas>
          <div class="pbag" id="bag-old" aria-hidden="true"><div class="pbag__rot"></div></div>
          <div class="pbag" id="bag-ck" aria-hidden="true"><div class="pbag__rot"></div></div>
          <canvas class="pour__cv pour__fly" id="pour-fly" aria-hidden="true"></canvas>
          <p class="ppill" id="pill-old" aria-hidden="true"><b data-pct>75&nbsp;%</b>Alimento anterior</p>
          <p class="ppill ppill--ck" id="pill-ck" aria-hidden="true"><b data-pct>25&nbsp;%</b>CooKing</p>
          <div class="pour__head">
            <p class="pour__day" id="pour-day" aria-hidden="true">Días 1 y 2</p>
            <button class="pour__play" id="pour-play" type="button" aria-label="Pausar la animación"></button>
          </div>
        </div>
        <ol class="steps" id="steps" aria-label="Pasos del cambio de alimento"></ol>
        <p class="sr" id="pour-live" aria-live="polite"></p>
      </div>
      <div class="switch__legend" aria-hidden="true"><span><i style="background:#C9542A"></i>CooKing</span><span><i style="background:#7A5B40"></i>Alimento anterior</span></div>
      <p class="switch__note">Si notas heces blandas, quédate un par de días más en el paso anterior. Para la ración diaria, usa la tabla del empaque y ajústala con tu veterinario.</p>
    </div>
    <svg class="wave wave--bottom" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0,64 C240,24 500,92 760,60 C1020,28 1240,36 1440,66 L1440,100 L0,100 Z" fill="currentColor"/></svg>
  </section>

  <!-- MAPA -->
  <section class="sec map-sec" id="comprar" aria-labelledby="map-title">
    <div class="wrap">
      <div class="sec__head">
        <h2 class="h2" id="map-title">Encuéntranos en Lima</h2>
        <p class="lead"><b><span data-count="locations">14</span> tiendas y veterinarias</b> en <span data-count="districts">10</span> distritos. Toca un logo o elige una en la lista para ver cómo llegar.</p>
      </div>
      <div class="map__grid">
        <div class="map" id="map" tabindex="0" role="region" aria-roledescription="mapa" aria-label="Mapa de Lima Metropolitana con los puntos de venta" aria-describedby="map-help">
          <p class="sr" id="map-help">Usa la lista de tiendas para recorrer los puntos de venta. Con el mapa enfocado, las flechas lo mueven y las teclas más y menos acercan o alejan.</p>
          <svg id="map-svg" aria-hidden="true" focusable="false">
            <defs>
              <pattern id="azulejo" width="7" height="7" patternUnits="userSpaceOnUse">
                <rect width="7" height="7" fill="#EDBE55"/>
                <path d="M3.5 .9Q4.4 2.6 3.5 3.5Q2.6 2.6 3.5 .9ZM3.5 6.1Q2.6 4.4 3.5 3.5Q4.4 4.4 3.5 6.1ZM.9 3.5Q2.6 2.6 3.5 3.5Q2.6 4.4 .9 3.5ZM6.1 3.5Q4.4 4.4 3.5 3.5Q4.4 2.6 6.1 3.5Z" fill="#D39A2C" opacity=".55"/>
                <path d="M0 0h7v7H0z" fill="none" stroke="#D39A2C" stroke-width=".25" opacity=".5"/>
              </pattern>
              <pattern id="olas" width="14" height="8" patternUnits="userSpaceOnUse">
                <path d="M0 5 Q3.5 2 7 5 T14 5" fill="none" stroke="#A8D2CD" stroke-width=".7"/>
              </pattern>
            </defs>
            <rect x="-5000" y="-5000" width="10000" height="10000" fill="#BDE0DC"/>
            <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#olas)" id="sea-pattern"/>
            <path class="land" id="map-land"/>
            <g id="map-districts"></g>
            <g class="labels" id="map-labels"></g>
          </svg>
          <div class="map__gl" id="map-gl" hidden></div>
          <div class="pins" id="map-pins"></div>
          <div class="map__legend" aria-hidden="true">
            <span><i class="sw"></i>Distrito con puntos de venta</span>
            <span><i class="sw sw--pin"><svg aria-hidden="true"><use href="#iso"/></svg></i>Tienda o veterinaria</span>
          </div>
          <div class="map__controls">
            <button class="ctrl" type="button" data-zoom="in" aria-label="Acercar"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>
            <button class="ctrl" type="button" data-zoom="out" aria-label="Alejar"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>
            <button class="ctrl" type="button" data-zoom="toggle" aria-label="Ver toda Lima"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          </div>
          <div class="map__hint" id="map-hint" aria-hidden="true">Mantén <span data-mod>Ctrl</span> y usa la rueda para acercar</div>
          <div class="card" id="map-card" hidden aria-live="polite">
            <button class="card__close" type="button" aria-label="Cerrar"><svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
            <div id="map-card-body"></div>
          </div>
        </div>
        <div class="panel-list">
          <label for="map-search">Busca por distrito, tienda o calle</label>
          <div class="panel-list__row">
            <input id="map-search" type="search" placeholder="Ej.: Miraflores…" autocomplete="off" spellcheck="false" enterkeyhint="search">
            <button class="geo" id="geo" type="button"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="3.2" fill="currentColor"/><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 1v2.5M10 16.5V19M1 10h2.5M16.5 10H19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span>Cerca de mí</span></button>
          </div>
          <div class="mapviews" role="group" aria-label="Vista"><button type="button" data-view="map" aria-pressed="true">Mapa</button><button type="button" data-view="list" aria-pressed="false">Lista de tiendas</button></div>
          <button class="fchip" id="map-chip" type="button" hidden><span></span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
          <p class="status" id="map-status" role="status" aria-live="polite"></p>
          <ul class="list" id="map-list" aria-label="Puntos de venta"></ul>
          <p class="online">También puedes comprar online en <a href="https://www.patmopet.pe/" target="_blank" rel="noopener">Patmo Pets<span class="sr"> (abre en una pestaña nueva)</span></a>.</p>
        </div>
      </div>
      <p class="map__note">Los puntos del mapa son aproximados; usa “Cómo llegar” para ir a la dirección exacta.</p>
    </div>
  </section>

  <!-- CONTACTO -->
  <section class="sec contact" id="contactanos" aria-labelledby="contact-title">
    <svg class="wave wave--top" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0,40 C240,80 480,20 760,50 C1040,80 1240,70 1440,36 L1440,100 L0,100 Z" fill="currentColor"/></svg>
    <div class="wrap contact__grid">
      <div class="formcard">
        <h2 class="h2" id="contact-title">¿Te gustaría contactarnos?</h2>
        <p class="lead">Si eres petlover, tienes una veterinaria, un pet shop o una tienda online y te interesan nuestros productos, escríbenos.</p>
        <form class="form" id="contact-form" novalidate>
          <p class="ck-hp" aria-hidden="true"><label>Deja este campo vacío <input type="text" name="sitio_web" tabindex="-1" autocomplete="off"></label></p>
          <div class="field">
            <label for="f-nombres">Nombres</label>
            <input id="f-nombres" name="nombres" type="text" autocomplete="given-name" required aria-describedby="e-nombres">
            <p class="field__err" id="e-nombres"></p>
          </div>
          <div class="field">
            <label for="f-apellidos">Apellidos <span class="opt">(opcional)</span></label>
            <input id="f-apellidos" name="apellidos" type="text" autocomplete="family-name">
          </div>
          <div class="field">
            <label for="f-email">Correo</label>
            <input id="f-email" name="email" type="email" autocomplete="email" spellcheck="false" required aria-describedby="e-email" placeholder="nombre@correo.com">
            <p class="field__err" id="e-email"></p>
          </div>
          <div class="field">
            <label for="f-tel">Teléfono o WhatsApp</label>
            <input id="f-tel" name="telefono" type="tel" inputmode="tel" autocomplete="tel" required aria-describedby="e-tel" placeholder="987 654 321">
            <p class="field__err" id="e-tel"></p>
          </div>
          <div class="field field--full">
            <label for="f-tipo">¿Quién nos escribe?</label>
            <select id="f-tipo" name="tipo">
              <option value="consumidor">Tengo una mascota</option>
              <option value="veterinaria">Veterinaria</option>
              <option value="petshop">Pet shop</option>
              <option value="tienda-virtual">Tienda virtual</option>
              <option value="distribuidor">Distribuidor</option>
            </select>
          </div>
          <div class="field" data-business hidden>
            <label for="f-empresa">Empresa</label>
            <input id="f-empresa" name="empresa" type="text" autocomplete="organization">
          </div>
          <div class="field" data-business hidden>
            <label for="f-ruc">RUC <span class="opt">(opcional)</span></label>
            <input id="f-ruc" name="ruc" type="text" inputmode="numeric" pattern="[0-9]{11}" maxlength="11" autocomplete="off" spellcheck="false" aria-describedby="e-ruc" placeholder="20123456789">
            <p class="field__err" id="e-ruc"></p>
          </div>
          <div class="field field--full">
            <label for="f-msg">Mensaje</label>
            <textarea id="f-msg" name="mensaje" required aria-describedby="e-msg"></textarea>
            <p class="field__err" id="e-msg"></p>
          </div>
          <div class="form__foot">
            <button class="btn btn--orange" type="submit">Enviar mensaje</button>
            <p class="form__status" id="form-status" role="status" aria-live="polite"></p>
          </div>
        </form>
      </div>
      <aside class="side" aria-labelledby="side-title">
        <div class="side__pets media" data-caption="">
          <img src="<?php echo esc_url( $ck_media ); ?>2026/08/perro-gato-final.png"
               srcset="<?php echo esc_url( $ck_media ); ?>2026/08/perro-gato-final-276x300.png 276w, <?php echo esc_url( $ck_media ); ?>2026/08/perro-gato-final-768x835.png 768w"
               sizes="380px" width="942" height="1024" loading="lazy" alt="">
        </div>
        <h3 id="side-title">CooKing en Perú</h3>
        <p>Representado exclusivamente por Solpet.</p>
        <dl>
          <div><dt>Oficina</dt><dd>Av. República de Panamá 3531, Of. 1303, Centro Empresarial San Isidro, Lima</dd></div>
          <div><dt>Correo</dt><dd><a href="mailto:marketingpets@solvet.com.pe">marketingpets@solvet.com.pe</a></dd></div>
        </dl>
        <div class="social">
          <a href="https://www.facebook.com/cookingperu" target="_blank" rel="noopener" aria-label="CooKing en Facebook (abre en una pestaña nueva)"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5H16.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3Z"/></svg></a>
          <a href="https://www.instagram.com/cookingperu/" target="_blank" rel="noopener" aria-label="CooKing en Instagram (abre en una pestaña nueva)"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg></a>
        </div>
      </aside>
    </div>
  </section>

</main>

<footer class="footer">
  <svg class="wave wave--top" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0,60 C280,10 520,90 800,56 C1060,26 1260,30 1440,64 L1440,100 L0,100 Z" fill="currentColor"/></svg>
  <div class="wrap">
    <div class="footer__grid">
      <div>
        <div class="footer__brand">
          <div class="footer__logo media" data-caption=""><img src="<?php echo esc_url( $ck_media ); ?>2026/07/logo-cooking.svg" width="74" height="74" alt="CooKing" loading="lazy"></div>
          <div class="footer__tag">El Rey de la Cocina Nutricional</div>
        </div>
        <p>Alimento super premium sin cereales para perros y gatos. Representado en Perú por Solpet.</p>
      </div>
      <div>
        <h2>Recetas</h2>
        <ul>
          <li><a href="#dog">Para perros</a></li>
          <li><a href="#cat">Para gatos</a></li>
          <li><a href="#plan">Calcula su ración</a></li>
          <li><a href="#cambio">Cómo cambiar su alimento</a></li>
        </ul>
      </div>
      <div>
        <h2>CooKing Perú</h2>
        <ul>
          <li><a href="#comprar">Dónde comprar</a></li>
          <li><a href="#contactanos">Contáctanos</a></li>
          <li><a href="https://www.instagram.com/cookingperu/" target="_blank" rel="noopener">Instagram<span class="sr"> (abre en una pestaña nueva)</span></a></li>
          <li><a href="https://www.facebook.com/cookingperu" target="_blank" rel="noopener">Facebook<span class="sr"> (abre en una pestaña nueva)</span></a></li>
        </ul>
      </div>
    </div>
    <div class="footer__legal">
      <span>© <span data-year>2026</span> CooKing Perú</span>
      <span>Íconos: Lucide (ISC). Mapa: © OpenStreetMap, OpenMapTiles y OpenFreeMap; distritos INEI 2007 vía peru-geojson (MPL-2.0).</span>
    </div>
  </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
