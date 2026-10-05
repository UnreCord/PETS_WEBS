<?php
/**
 * Static data shipped with the plugin (districts, default stores) and the data object the page script reads.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reads a JSON file from assets/data.
 *
 * @param string $file File name.
 * @return mixed
 */
function cooking_landing_json( $file ) {
	static $cache = array();
	if ( ! isset( $cache[ $file ] ) ) {
		$path           = COOKING_LANDING_DIR . 'assets/data/' . $file;
		$cache[ $file ] = is_readable( $path ) ? json_decode( (string) file_get_contents( $path ), true ) : null; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	}
	return $cache[ $file ];
}

/**
 * Lima and Callao districts as id => name (from the INEI map shipped with the plugin).
 *
 * @return array
 */
function cooking_landing_districts() {
	static $list = null;
	if ( null === $list ) {
		$list = array();
		$map  = cooking_landing_json( 'lima-distritos-svg.json' );
		foreach ( (array) ( $map['districts'] ?? array() ) as $d ) {
			$list[ $d['id'] ] = $d['name'];
		}
		asort( $list, SORT_LOCALE_STRING );
	}
	return $list;
}

/**
 * The points of sale published on cooking.pe when the plugin was made. Coordinates are approximate.
 *
 * @return array
 */
function cooking_landing_default_stores() {
	return array(
		array( 'american-vet-san-borja', 'American Vet', 'Av. San Luis 2845', 'san-borja', -12.0985, -77.0015, '' ),
		array( 'american-vet-barranco', 'American Vet', 'Av. República de Panamá 6584', 'barranco', -12.1405, -77.0175, '' ),
		array( 'animal-wasi-san-miguel', 'Animal Wasi Pets', 'Av. Brígida Silva de Ochoa 210', 'san-miguel', -12.0808, -77.0855, '' ),
		array( 'brisa-magdalena', 'Brisa Pet Shop', 'Av. Javier Prado Oeste 205', 'magdalena-del-mar', -12.0945, -77.0640, '' ),
		array( 'brisa-surco', 'Brisa Pet Shop', 'Av. Caminos del Inca 848', 'santiago-de-surco', -12.1200, -76.9930, '' ),
		array( 'miau-miraflores', 'MIAU 100% Gatos', 'Calle José Toribio Polo 511', 'miraflores', -12.1135, -77.0390, '' ),
		array( 'miu-surco', 'Miu Shop / Adopta Miu', 'Av. Caminos del Inca 1685', 'santiago-de-surco', -12.1320, -76.9960, '' ),
		array( 'mundo-love-magdalena', 'Mundo Love Pet', 'Jr. Castilla 778', 'magdalena-del-mar', -12.0900, -77.0705, '' ),
		array( 'peluditos-pueblo-libre', 'Peluditos Pet Shop', 'Av. Manuel Cipriano Dulanto 1668', 'pueblo-libre', -12.0790, -77.0690, '' ),
		array( 'peluditos-surquillo', 'Peluditos Pet Shop', 'Av. Manuel Villarán 770', 'surquillo', -12.1170, -77.0120, '' ),
		array( 'peluditos-surco', 'Peluditos Pet Shop', 'Av. Central 993', 'santiago-de-surco', -12.1470, -76.9980, '' ),
		array( 'urban-pets-magdalena', 'The Urban Pets Co.', 'Av. Faustino Sánchez Carrión 479', 'magdalena-del-mar', -12.0925, -77.0580, '' ),
		array( 'royal-pets-lince', 'Veterinaria Royal Pets', 'Av. General Trinidad Morán 417', 'lince', -12.0840, -77.0370, '' ),
		array( 'kotas-brena', '+KOTAS Pet Shop', 'Jr. Carhuaz 514', 'brena', -12.0600, -77.0525, 'https://maps.app.goo.gl/tKhdBTdj57Dp56Eb6' ),
	);
}

/**
 * Everything the page script needs, printed inline before landing.js.
 *
 * @return array
 */
function cooking_landing_script_data() {
	$o    = cooking_landing_options();
	$base = COOKING_LANDING_URL . 'assets/img/';

	$renders = array();
	foreach ( (array) glob( COOKING_LANDING_DIR . 'assets/img/render/*.webp' ) as $file ) {
		$renders[ basename( $file, '.webp' ) ] = $base . 'render/' . basename( $file );
	}

	return array(
		'config'      => array(
			// Empty endpoint = the form opens the visitor's mail app (same as the static HTML).
			'formEndpoint' => esc_url_raw( rest_url( 'cooking/v1/contacto' ) ),
			'contactEmail' => $o['email'],
			'streetMap'    => (bool) $o['street_map'],
			'maplibre'     => array(
				'js'     => 'https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/dist/maplibre-gl.js',
				'jsSri'  => 'sha384-5+cfbwT0iiub6VsQAdn6yz16nr6sDiQoHx6tm4O8OVYXHYOxcffFmCJBL0dgdvGp',
				'css'    => 'https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/dist/maplibre-gl.css',
				'cssSri' => 'sha384-uTttxo/aOKbdE5RlD/SPzSDoDmNvGlUYPjONi2MN/b7c9HPSvW07OIuyP7uL6jxK',
			),
		),
		'icons'       => cooking_landing_json( 'iconos.json' ),
		'renders'     => $renders,
		'photos'      => array(
			'chef-perro'   => $base . 'marca/hero-chef-perro.webp',
			'chef-gato'    => $base . 'marca/hero-chef-gato.webp',
			'ingredientes' => $base . 'marca/ingredientes-banda.webp',
		),
		'map'         => cooking_landing_json( 'lima-distritos-svg.json' ),
		'geo'         => cooking_landing_json( 'lima-distritos-geo.json' ),
		'iso'         => cooking_landing_json( 'isotipo.json' ),
		'empty'       => cooking_landing_json( 'plato-vacio.json' ),
		'locations'   => cooking_landing_locations(),
		'productBase' => $base . 'productos/',
	);
}
