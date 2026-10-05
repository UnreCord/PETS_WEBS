<?php
/**
 * Ajustes > CooKing Landing.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @return array
 */
function cooking_landing_default_options() {
	return array(
		'email'         => 'marketingpets@solvet.com.pe',
		'save_messages' => 1,
		'street_map'    => 1,
		'brand_base'    => '',
		'page_id'       => 0,
	);
}

/**
 * @return array
 */
function cooking_landing_options() {
	return wp_parse_args( (array) get_option( 'cooking_landing_options', array() ), cooking_landing_default_options() );
}

/**
 * Base URL of the brand images (logo, packshots, photos). Defaults to this site's uploads folder,
 * where cooking.pe already keeps them (/wp-content/uploads/2026/07/…).
 *
 * @return string
 */
function cooking_landing_media_base() {
	$o    = cooking_landing_options();
	$base = $o['brand_base'] ? $o['brand_base'] : wp_upload_dir()['baseurl'];
	return trailingslashit( $base );
}

add_action( 'admin_menu', 'cooking_landing_admin_menu' );

function cooking_landing_admin_menu() {
	add_options_page( 'CooKing Landing', 'CooKing Landing', 'manage_options', 'cooking-landing', 'cooking_landing_settings_page' );
}

add_action( 'admin_init', 'cooking_landing_register_settings' );

function cooking_landing_register_settings() {
	register_setting(
		'cooking_landing',
		'cooking_landing_options',
		array(
			'type'              => 'array',
			'sanitize_callback' => 'cooking_landing_sanitize_options',
			'default'           => cooking_landing_default_options(),
		)
	);
}

/**
 * @param mixed $input Raw values.
 * @return array
 */
function cooking_landing_sanitize_options( $input ) {
	$input = is_array( $input ) ? $input : array();
	$out   = cooking_landing_default_options();
	$email = sanitize_email( $input['email'] ?? '' );
	if ( $email && is_email( $email ) ) {
		$out['email'] = $email;
	} else {
		add_settings_error( 'cooking_landing_options', 'email', 'El correo no es válido; se mantuvo el anterior.' );
		$out['email'] = cooking_landing_options()['email'];
	}
	$out['save_messages'] = empty( $input['save_messages'] ) ? 0 : 1;
	$out['street_map']    = empty( $input['street_map'] ) ? 0 : 1;
	$out['brand_base']    = esc_url_raw( trim( (string) ( $input['brand_base'] ?? '' ) ) );
	$page_id              = absint( $input['page_id'] ?? 0 );
	$out['page_id']       = ( $page_id && 'page' === get_post_type( $page_id ) ) ? $page_id : 0;
	return $out;
}

/**
 * The page chosen in the settings if it still exists, otherwise a page given the landing template in the editor.
 *
 * @return WP_Post|null
 */
function cooking_landing_page() {
	$id   = (int) cooking_landing_options()['page_id'];
	$page = $id ? get_post( $id ) : null;
	if ( $page && 'page' === $page->post_type && 'trash' !== $page->post_status ) {
		return $page;
	}
	$pages = get_posts(
		array(
			'post_type'   => 'page',
			'post_status' => array( 'publish', 'draft', 'private' ),
			'meta_key'    => '_wp_page_template', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			'meta_value'  => COOKING_LANDING_TEMPLATE, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
			'numberposts' => 1,
		)
	);
	return $pages ? $pages[0] : null;
}

add_action( 'admin_post_cooking_landing_page', 'cooking_landing_page_action' );

/**
 * "Crear la página" and "Publicarla y ponerla como portada" buttons.
 */
function cooking_landing_page_action() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'No tienes permiso para hacer esto.' );
	}
	check_admin_referer( 'cooking_landing_page' );
	$step = sanitize_key( wp_unslash( $_POST['step'] ?? '' ) );
	$page = cooking_landing_page();
	$msg  = '';
	if ( 'create' === $step && ! $page ) {
		$id = wp_insert_post(
			array(
				'post_type'   => 'page',
				'post_status' => 'draft',
				'post_title'  => 'Inicio CooKing',
				'meta_input'  => array( '_wp_page_template' => COOKING_LANDING_TEMPLATE ),
			),
			true
		);
		if ( ! is_wp_error( $id ) ) {
			$o            = cooking_landing_options();
			$o['page_id'] = $id;
			update_option( 'cooking_landing_options', $o );
			$msg = 'created';
		}
	} elseif ( 'front' === $step && $page ) {
		if ( 'publish' !== $page->post_status ) {
			wp_update_post(
				array(
					'ID'          => $page->ID,
					'post_status' => 'publish',
				)
			);
		}
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $page->ID );
		$msg = 'front';
	}
	wp_safe_redirect( add_query_arg( 'ck_msg', $msg ? $msg : 'none', admin_url( 'options-general.php?page=cooking-landing' ) ) );
	exit;
}

add_filter( 'display_post_states', 'cooking_landing_post_state', 10, 2 );

/**
 * Labels the landing page in Páginas.
 *
 * @param array   $states States.
 * @param WP_Post $post   Page.
 * @return array
 */
function cooking_landing_post_state( $states, $post ) {
	if ( (int) cooking_landing_options()['page_id'] === $post->ID || COOKING_LANDING_TEMPLATE === get_page_template_slug( $post ) ) {
		$states['cooking_landing'] = 'Landing CooKing';
	}
	return $states;
}

function cooking_landing_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$o        = cooking_landing_options();
	$page     = cooking_landing_page();
	$is_front = $page && 'page' === get_option( 'show_on_front' ) && (int) get_option( 'page_on_front' ) === $page->ID;
	$msg      = sanitize_key( wp_unslash( $_GET['ck_msg'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$button   = function ( $step, $label, $primary ) {
		?>
		<form action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" method="post" style="display:inline-block;margin:0 8px 0 0">
			<input type="hidden" name="action" value="cooking_landing_page">
			<input type="hidden" name="step" value="<?php echo esc_attr( $step ); ?>">
			<?php wp_nonce_field( 'cooking_landing_page' ); ?>
			<?php submit_button( $label, $primary ? 'primary' : 'secondary', 'submit', false ); ?>
		</form>
		<?php
	};
	?>
	<div class="wrap">
		<h1>CooKing Landing</h1>
		<?php if ( 'created' === $msg ) : ?>
			<div class="notice notice-success"><p>Página creada como borrador. Revisa la vista previa y, cuando esté lista, pulsa “Publicarla y ponerla como portada”.</p></div>
		<?php elseif ( 'front' === $msg ) : ?>
			<div class="notice notice-success"><p>Listo: la landing ya es la portada del sitio.</p></div>
		<?php endif; ?>

		<div class="card" style="max-width:760px">
			<h2>Publicación</h2>
			<?php if ( ! $page ) : ?>
				<p>Todavía no hay una página para la landing. Este botón crea una página en borrador llamada “Inicio CooKing”; la portada actual no cambia hasta el siguiente paso.</p>
				<p><?php $button( 'create', 'Crear la página', true ); ?></p>
				<p class="description">También puedes elegir una página existente en “Página de la landing”, más abajo.</p>
			<?php else : ?>
				<p>
					Página de la landing: <b><?php echo esc_html( get_the_title( $page ) ); ?></b>
					(<?php echo 'publish' === $page->post_status ? 'publicada' : esc_html( get_post_status_object( $page->post_status )->label ); ?><?php echo $is_front ? ', <b>es la portada</b>' : ''; ?>)
					&nbsp;·&nbsp;
					<a href="<?php echo esc_url( 'publish' === $page->post_status ? get_permalink( $page ) : get_preview_post_link( $page ) ); ?>" target="_blank" rel="noopener"><?php echo 'publish' === $page->post_status ? 'Ver la landing' : 'Vista previa'; ?></a>
				</p>
				<?php if ( ! $is_front ) : ?>
					<p><?php $button( 'front', 'Publicarla y ponerla como portada', true ); ?></p>
					<p class="description">Reemplaza la página de inicio actual (Ajustes &gt; Lectura). Se puede volver atrás desde ahí mismo.</p>
				<?php endif; ?>
			<?php endif; ?>
			<p>Después, revisa los <a href="<?php echo esc_url( admin_url( 'edit.php?post_type=cooking_tienda' ) ); ?>">puntos de venta</a> y el correo de abajo.</p>
		</div>

		<form action="options.php" method="post">
			<?php settings_fields( 'cooking_landing' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="ck-page">Página de la landing</label></th>
					<td>
						<?php
						wp_dropdown_pages(
							array(
								'name'              => 'cooking_landing_options[page_id]',
								'id'                => 'ck-page',
								'selected'          => $page ? $page->ID : 0,
								'show_option_none'  => '— Ninguna —',
								'option_none_value' => 0,
								'post_status'       => array( 'publish', 'draft', 'private' ),
							)
						);
						?>
						<p class="description">Esa página muestra la landing completa con cualquier tema; no hace falta escribirle contenido. En temas clásicos también funciona elegir la plantilla “CooKing – Landing (pantalla completa)” al editar una página.</p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="ck-email">Correo que recibe los mensajes</label></th>
					<td>
						<input id="ck-email" class="regular-text" type="email" name="cooking_landing_options[email]" value="<?php echo esc_attr( $o['email'] ); ?>">
						<p class="description">El formulario “¿Te gustaría contactarnos?” envía cada mensaje a este correo, con el del visitante como “Responder a”. Para que no caiga en spam, conviene un plugin SMTP (por ejemplo WP Mail SMTP).</p>
					</td>
				</tr>
				<tr>
					<th scope="row">Guardar mensajes</th>
					<td><label><input type="checkbox" name="cooking_landing_options[save_messages]" value="1" <?php checked( $o['save_messages'] ); ?>> Guardar también cada mensaje en <a href="<?php echo esc_url( admin_url( 'edit.php?post_type=cooking_mensaje' ) ); ?>">Mensajes CooKing</a> (recomendado: si el correo falla, no se pierde).</label></td>
				</tr>
				<tr>
					<th scope="row">Mapa de calles</th>
					<td><label><input type="checkbox" name="cooking_landing_options[street_map]" value="1" <?php checked( $o['street_map'] ); ?>> Usar el mapa de calles (MapLibre + OpenFreeMap, gratis y sin clave). Si se desactiva, o si el servicio no responde, se muestra el mapa de distritos propio.</label></td>
				</tr>
				<tr>
					<th scope="row"><label for="ck-base">URL base de las imágenes de marca</label></th>
					<td>
						<input id="ck-base" class="regular-text code" type="url" name="cooking_landing_options[brand_base]" value="<?php echo esc_attr( $o['brand_base'] ); ?>" placeholder="<?php echo esc_attr( trailingslashit( wp_upload_dir()['baseurl'] ) ); ?>">
						<p class="description">Déjalo vacío en cooking.pe: el logo, las bolsas y las fotos se toman de la biblioteca de medios (<code>2026/07/…</code> y <code>2026/08/…</code>). En un sitio de pruebas sin esas imágenes, escribe <code>https://cooking.pe/wp-content/uploads/</code>.</p>
					</td>
				</tr>
			</table>
			<?php submit_button( 'Guardar cambios' ); ?>
		</form>
	</div>
	<?php
}
