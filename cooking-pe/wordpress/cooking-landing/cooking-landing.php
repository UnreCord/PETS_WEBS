<?php
/**
 * Plugin Name:       CooKing Landing
 * Description:       Landing de CooKing Perú a pantalla completa: plato 3D interactivo, beneficios, recetas con filtros, "Arma su plan", cambio en 7 días, mapa de tiendas con el logo y formulario de contacto. Agrega la plantilla de página "CooKing – Landing", los puntos de venta editables y la bandeja de mensajes.
 * Version:           1.1.0
 * Requires at least: 6.3
 * Requires PHP:      7.4
 * Author:            CooKing Perú
 * License:           GPL-2.0-or-later
 * Text Domain:       cooking-landing
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'COOKING_LANDING_VERSION', '1.1.0' );
define( 'COOKING_LANDING_FILE', __FILE__ );
define( 'COOKING_LANDING_DIR', plugin_dir_path( __FILE__ ) );
define( 'COOKING_LANDING_URL', plugin_dir_url( __FILE__ ) );
define( 'COOKING_LANDING_TEMPLATE', 'cooking-landing.php' );

require_once COOKING_LANDING_DIR . 'includes/data.php';
require_once COOKING_LANDING_DIR . 'includes/settings.php';
require_once COOKING_LANDING_DIR . 'includes/stores.php';
require_once COOKING_LANDING_DIR . 'includes/contact.php';
require_once COOKING_LANDING_DIR . 'includes/template.php';

add_action( 'init', 'cooking_landing_register_post_types' );

/**
 * Post types: puntos de venta (editable) and mensajes del formulario (read only).
 */
function cooking_landing_register_post_types() {
	register_post_type(
		'cooking_tienda',
		array(
			'labels'          => array(
				'name'               => 'Puntos de venta',
				'singular_name'      => 'Punto de venta',
				'menu_name'          => 'Puntos de venta',
				'add_new'            => 'Añadir punto de venta',
				'add_new_item'       => 'Añadir punto de venta',
				'edit_item'          => 'Editar punto de venta',
				'new_item'           => 'Nuevo punto de venta',
				'search_items'       => 'Buscar puntos de venta',
				'not_found'          => 'No hay puntos de venta.',
				'not_found_in_trash' => 'No hay puntos de venta en la papelera.',
				'all_items'          => 'Todos los puntos de venta',
			),
			'public'          => false,
			'show_ui'         => true,
			'show_in_menu'    => true,
			'menu_position'   => 25,
			'menu_icon'       => 'dashicons-location-alt',
			'supports'        => array( 'title' ),
			'capability_type' => 'post',
			'map_meta_cap'    => true,
			'rewrite'         => false,
			'query_var'       => false,
		)
	);

	register_post_type(
		'cooking_mensaje',
		array(
			'labels'          => array(
				'name'          => 'Mensajes CooKing',
				'singular_name' => 'Mensaje',
				'menu_name'     => 'Mensajes CooKing',
				'edit_item'     => 'Mensaje recibido',
				'search_items'  => 'Buscar mensajes',
				'not_found'     => 'Aún no hay mensajes.',
				'all_items'     => 'Todos los mensajes',
			),
			'public'          => false,
			'show_ui'         => true,
			'show_in_menu'    => true,
			'menu_position'   => 26,
			'menu_icon'       => 'dashicons-email-alt',
			'supports'        => array( 'title' ),
			'capability_type' => 'post',
			'capabilities'    => array( 'create_posts' => 'do_not_allow' ),
			'map_meta_cap'    => true,
			'rewrite'         => false,
			'query_var'       => false,
		)
	);
}

register_activation_hook( __FILE__, 'cooking_landing_activate' );

/**
 * On activation: default settings and the 14 current points of sale (only if there are none yet).
 */
function cooking_landing_activate() {
	cooking_landing_register_post_types();
	if ( false === get_option( 'cooking_landing_options' ) ) {
		add_option( 'cooking_landing_options', cooking_landing_default_options() );
	}
	cooking_landing_seed_stores();
}

add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'cooking_landing_action_links' );

/**
 * "Ajustes" link in the plugins list.
 *
 * @param array $links Existing links.
 * @return array
 */
function cooking_landing_action_links( $links ) {
	array_unshift( $links, '<a href="' . esc_url( admin_url( 'options-general.php?page=cooking-landing' ) ) . '">Ajustes</a>' );
	return $links;
}
