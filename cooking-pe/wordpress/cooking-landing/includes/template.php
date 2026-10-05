<?php
/**
 * Page template "CooKing – Landing (pantalla completa)": the landing replaces the theme's header and footer,
 * loads only its own styles and script, and keeps wp_head()/wp_footer() for analytics, SEO and cookie plugins.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter( 'theme_page_templates', 'cooking_landing_add_template' );

/**
 * @param array $templates Page templates.
 * @return array
 */
function cooking_landing_add_template( $templates ) {
	$templates[ COOKING_LANDING_TEMPLATE ] = 'CooKing – Landing (pantalla completa)';
	return $templates;
}

/**
 * True on the page chosen in Ajustes > CooKing Landing, or on a page that uses the landing template. Block
 * themes do not offer plugin templates in the editor, so the setting is the way that works with every theme.
 *
 * @return bool
 */
function cooking_landing_is_active() {
	if ( ! is_singular( 'page' ) ) {
		return false;
	}
	$id = get_queried_object_id();
	return $id === (int) cooking_landing_options()['page_id'] || COOKING_LANDING_TEMPLATE === get_page_template_slug( $id );
}

add_filter( 'template_include', 'cooking_landing_template_include', 99 );

/**
 * @param string $template Template path.
 * @return string
 */
function cooking_landing_template_include( $template ) {
	if ( ! cooking_landing_is_active() ) {
		return $template;
	}
	// The landing prints its own viewport and <title> (through wp_get_document_title(), so SEO plugins still
	// set it); block themes and classic themes would otherwise add a second one.
	remove_action( 'wp_head', '_block_template_viewport_meta_tag', 0 );
	remove_action( 'wp_head', '_block_template_render_title_tag', 1 );
	remove_action( 'wp_head', '_wp_render_title_tag', 1 );
	return COOKING_LANDING_DIR . 'templates/landing.php';
}

add_action( 'template_redirect', 'cooking_landing_template_setup' );

function cooking_landing_template_setup() {
	if ( ! cooking_landing_is_active() ) {
		return;
	}
	// Full-screen page: no admin bar (it would shift every section by 32 px) and no emoji script.
	add_filter( 'show_admin_bar', '__return_false' );
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	// the theme's own web fonts (block themes declare them in wp_head) are not used here
	remove_action( 'wp_head', 'wp_print_font_faces', 50 );
	if ( ! cooking_landing_has_seo_plugin() ) {
		add_filter( 'pre_get_document_title', 'cooking_landing_document_title' );
	}
}

/**
 * Yoast, Rank Math, All in One SEO and SEOPress manage title, description and Open Graph themselves.
 *
 * @return bool
 */
function cooking_landing_has_seo_plugin() {
	return defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) || defined( 'AIOSEO_VERSION' ) || defined( 'SEOPRESS_VERSION' );
}

/**
 * @return string
 */
function cooking_landing_document_title() {
	return 'CooKing | El Rey de la Cocina Nutricional para perros y gatos';
}

add_action( 'wp_enqueue_scripts', 'cooking_landing_assets', 20 );

function cooking_landing_assets() {
	if ( ! cooking_landing_is_active() ) {
		return;
	}
	// Circular Book and Authenia ship in assets/fonts/ and are declared at the top of landing.css
	wp_enqueue_style( 'cooking-landing', COOKING_LANDING_URL . 'assets/css/landing.css', array(), COOKING_LANDING_VERSION );
	wp_enqueue_script( 'cooking-landing', COOKING_LANDING_URL . 'assets/js/landing.js', array(), COOKING_LANDING_VERSION, true );
	wp_add_inline_script( 'cooking-landing', 'window.COOKING_LANDING = ' . wp_json_encode( cooking_landing_script_data(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . ';', 'before' );
}

add_action( 'wp_enqueue_scripts', 'cooking_landing_isolate', 9999 );

/**
 * Removes the theme's (and block editor's) styles and scripts on the landing so they cannot change its design.
 * Other plugins (analytics, cookie banner, chat) keep loading.
 */
function cooking_landing_isolate() {
	if ( ! cooking_landing_is_active() ) {
		return;
	}
	$theme_urls = array_unique( array( get_template_directory_uri(), get_stylesheet_directory_uri() ) );
	$is_theme   = function ( $src ) use ( $theme_urls ) {
		foreach ( $theme_urls as $u ) {
			if ( $src && 0 === strpos( (string) $src, $u ) ) {
				return true;
			}
		}
		return false;
	};
	foreach ( wp_styles()->queue as $handle ) {
		$obj = wp_styles()->registered[ $handle ] ?? null;
		if ( $obj && $is_theme( $obj->src ) ) {
			wp_dequeue_style( $handle );
		}
	}
	foreach ( wp_scripts()->queue as $handle ) {
		$obj = wp_scripts()->registered[ $handle ] ?? null;
		if ( $obj && $is_theme( $obj->src ) ) {
			wp_dequeue_script( $handle );
		}
	}
	/**
	 * Extra style or script handles to drop on the landing (for example a plugin that restyles every page).
	 *
	 * @param string[] $handles Handles.
	 */
	$handles = apply_filters( 'cooking_landing_dequeue', array( 'wp-block-library', 'wp-block-library-theme', 'classic-theme-styles', 'global-styles', 'core-block-supports' ) );
	foreach ( $handles as $handle ) {
		wp_dequeue_style( $handle );
		wp_dequeue_script( $handle );
	}
}

add_filter( 'body_class', 'cooking_landing_body_class', 99 );

/**
 * Elementor applies its global kit (fonts, colors, buttons) through an "elementor-kit-N" body class; without it
 * the kit's rules do not reach the landing, while Elementor popups and widgets elsewhere keep working.
 *
 * @param string[] $classes Body classes.
 * @return string[]
 */
function cooking_landing_body_class( $classes ) {
	if ( ! cooking_landing_is_active() ) {
		return $classes;
	}
	return array_values( preg_grep( '/^elementor-kit-\d+$/', $classes, PREG_GREP_INVERT ) );
}

add_action( 'wp_head', 'cooking_landing_preload_fonts', 2 );

/**
 * The text font and the script font of the title are needed for the first screen.
 */
function cooking_landing_preload_fonts() {
	if ( ! cooking_landing_is_active() ) {
		return;
	}
	foreach ( array( 'circular-book', 'authenia' ) as $f ) {
		printf( '<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n", esc_url( COOKING_LANDING_URL . 'assets/fonts/' . $f . '.woff2' ) );
	}
}

/**
 * Description, Open Graph and Organization data, only when no SEO plugin is handling them.
 */
function cooking_landing_head_meta() {
	echo '<meta name="theme-color" content="#FCE3CB">' . "\n";
	if ( cooking_landing_has_seo_plugin() ) {
		return;
	}
	$media = cooking_landing_media_base();
	$desc  = 'CooKing es alimento super premium sin cereales para perros y gatos, hecho en Europa con carne fresca como primer ingrediente. Encuentra tu tienda más cercana en Lima.';
	$url   = get_permalink();
	$meta  = array(
		array( 'name', 'description', $desc ),
		array( 'property', 'og:type', 'website' ),
		array( 'property', 'og:locale', 'es_PE' ),
		array( 'property', 'og:site_name', 'CooKing Perú' ),
		array( 'property', 'og:title', 'CooKing, el rey de la cocina nutricional' ),
		array( 'property', 'og:description', 'Recetas super premium sin cereales para perros y gatos. Puntos de venta en Lima.' ),
		array( 'property', 'og:url', $url ),
		array( 'property', 'og:image', $media . '2026/07/img-prin.png' ),
	);
	foreach ( $meta as $m ) {
		printf( '<meta %s="%s" content="%s">' . "\n", esc_attr( $m[0] ), esc_attr( $m[1] ), esc_attr( $m[2] ) );
	}
	$org = array(
		'@context' => 'https://schema.org',
		'@type'    => 'Organization',
		'name'     => 'CooKing Perú',
		'url'      => home_url( '/' ),
		'logo'     => $media . '2026/07/logo-cooking.svg',
		'email'    => cooking_landing_options()['email'],
		'address'  => array(
			'@type'           => 'PostalAddress',
			'streetAddress'   => 'Av. República de Panamá 3531, Of. 1303',
			'addressLocality' => 'San Isidro',
			'addressRegion'   => 'Lima',
			'addressCountry'  => 'PE',
		),
		'sameAs'   => array( 'https://www.facebook.com/cookingperu', 'https://www.instagram.com/cookingperu/' ),
	);
	echo '<script type="application/ld+json">' . wp_json_encode( $org, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . "</script>\n";
}
