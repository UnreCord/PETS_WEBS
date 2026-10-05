<?php
/**
 * Formulario "¿Te gustaría contactarnos?": REST endpoint, e-mail and saved copy in Mensajes CooKing.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'rest_api_init', 'cooking_landing_rest_routes' );

function cooking_landing_rest_routes() {
	register_rest_route(
		'cooking/v1',
		'/contacto',
		array(
			'methods'             => 'POST',
			'callback'            => 'cooking_landing_contact',
			// Public form: protected with a hidden honeypot field and a per-IP limit instead of a login.
			'permission_callback' => '__return_true',
		)
	);
}

/**
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response|WP_Error
 */
function cooking_landing_contact( WP_REST_Request $request ) {
	$p = $request->get_json_params();
	if ( ! is_array( $p ) ) {
		$p = $request->get_body_params();
	}

	// Bots fill every field; people never see this one.
	if ( ! empty( $p['sitio_web'] ) ) {
		return new WP_REST_Response( array( 'ok' => true ), 200 );
	}

	$ip  = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	$key = 'ck_contact_' . md5( $ip );
	$n   = (int) get_transient( $key );
	if ( $n >= 5 ) {
		return new WP_Error( 'cooking_rate', 'Recibimos varios mensajes seguidos. Inténtalo en unos minutos.', array( 'status' => 429 ) );
	}

	$types = array(
		'consumidor'     => 'Tengo una mascota',
		'veterinaria'    => 'Veterinaria',
		'petshop'        => 'Pet shop',
		'tienda-virtual' => 'Tienda virtual',
		'distribuidor'   => 'Distribuidor',
	);
	$f = array(
		'nombres'   => sanitize_text_field( $p['nombres'] ?? '' ),
		'apellidos' => sanitize_text_field( $p['apellidos'] ?? '' ),
		'email'     => sanitize_email( $p['email'] ?? '' ),
		'telefono'  => sanitize_text_field( $p['telefono'] ?? '' ),
		'tipo'      => sanitize_key( $p['tipo'] ?? 'consumidor' ),
		'empresa'   => sanitize_text_field( $p['empresa'] ?? '' ),
		'ruc'       => preg_replace( '/\D/', '', (string) ( $p['ruc'] ?? '' ) ),
		'mensaje'   => sanitize_textarea_field( $p['mensaje'] ?? '' ),
	);
	if ( ! isset( $types[ $f['tipo'] ] ) ) {
		$f['tipo'] = 'consumidor';
	}
	if ( 'consumidor' === $f['tipo'] ) {
		$f['empresa'] = '';
		$f['ruc']     = '';
	}

	$errors = array();
	if ( '' === $f['nombres'] ) {
		$errors['nombres'] = 'Escribe tu nombre.';
	}
	if ( ! is_email( $f['email'] ) ) {
		$errors['email'] = 'Escribe un correo válido.';
	}
	if ( strlen( preg_replace( '/\D/', '', $f['telefono'] ) ) < 7 ) {
		$errors['telefono'] = 'Escribe un teléfono de al menos 7 dígitos.';
	}
	if ( '' === $f['mensaje'] ) {
		$errors['mensaje'] = 'Cuéntanos en qué te podemos ayudar.';
	}
	if ( '' !== $f['ruc'] && 11 !== strlen( $f['ruc'] ) ) {
		$errors['ruc'] = 'El RUC tiene 11 dígitos.';
	}
	if ( $errors ) {
		return new WP_Error( 'cooking_invalid', 'Revisa los campos marcados.', array( 'status' => 400, 'fields' => $errors ) );
	}

	set_transient( $key, $n + 1, 10 * MINUTE_IN_SECONDS );

	$name  = trim( $f['nombres'] . ' ' . $f['apellidos'] );
	$lines = array(
		'Nombre: ' . $name,
		'Correo: ' . $f['email'],
		'Teléfono: ' . $f['telefono'],
		'Tipo: ' . $types[ $f['tipo'] ],
	);
	if ( $f['empresa'] ) {
		$lines[] = 'Empresa: ' . $f['empresa'];
	}
	if ( $f['ruc'] ) {
		$lines[] = 'RUC: ' . $f['ruc'];
	}
	$body = implode( "\n", $lines ) . "\n\n" . $f['mensaje'] . "\n\n— Enviado desde " . home_url( '/' );

	$o     = cooking_landing_options();
	$saved = false;
	if ( $o['save_messages'] ) {
		$post_id = wp_insert_post(
			array(
				'post_type'    => 'cooking_mensaje',
				'post_status'  => 'private',
				'post_title'   => $name . ' — ' . $types[ $f['tipo'] ],
				'post_content' => $body,
			)
		);
		if ( $post_id && ! is_wp_error( $post_id ) ) {
			foreach ( $f as $k => $val ) {
				update_post_meta( $post_id, '_ck_' . $k, $val );
			}
			$saved = true;
		}
	}

	$reply = str_replace( array( "\r", "\n", '"' ), '', $name );
	$sent  = wp_mail(
		$o['email'],
		'Consulta desde cooking.pe — ' . $types[ $f['tipo'] ],
		$body,
		array( 'Reply-To: "' . $reply . '" <' . $f['email'] . '>' )
	);

	if ( ! $sent && ! $saved ) {
		return new WP_Error( 'cooking_mail', 'No se pudo enviar el mensaje.', array( 'status' => 500 ) );
	}
	return new WP_REST_Response( array( 'ok' => true ), 200 );
}

add_action( 'add_meta_boxes_cooking_mensaje', 'cooking_landing_message_metabox' );

function cooking_landing_message_metabox() {
	remove_meta_box( 'submitdiv', 'cooking_mensaje', 'side' );
	add_meta_box( 'ck_message', 'Mensaje', 'cooking_landing_message_view', 'cooking_mensaje', 'normal', 'high' );
}

/**
 * Read-only view of a received message.
 *
 * @param WP_Post $post Message.
 */
function cooking_landing_message_view( $post ) {
	$email = (string) get_post_meta( $post->ID, '_ck_email', true );
	echo '<p><b>Recibido:</b> ' . esc_html( get_the_date( 'j \d\e F \d\e Y, H:i', $post ) ) . '</p>';
	echo '<pre style="white-space:pre-wrap;font:14px/1.6 -apple-system,Segoe UI,sans-serif;background:#f6f7f7;padding:14px;border-radius:6px">' . esc_html( $post->post_content ) . '</pre>';
	if ( is_email( $email ) ) {
		echo '<p><a class="button button-primary" href="' . esc_url( 'mailto:' . $email ) . '">Responder a ' . esc_html( $email ) . '</a></p>';
	}
}

add_filter( 'manage_cooking_mensaje_posts_columns', 'cooking_landing_message_columns' );

/**
 * @param array $cols Columns.
 * @return array
 */
function cooking_landing_message_columns( $cols ) {
	return array(
		'cb'       => $cols['cb'],
		'title'    => 'Remitente',
		'ck_email' => 'Correo',
		'ck_tel'   => 'Teléfono',
		'date'     => 'Fecha',
	);
}

add_action( 'manage_cooking_mensaje_posts_custom_column', 'cooking_landing_message_column', 10, 2 );

/**
 * @param string $col     Column.
 * @param int    $post_id Message id.
 */
function cooking_landing_message_column( $col, $post_id ) {
	if ( 'ck_email' === $col ) {
		echo esc_html( get_post_meta( $post_id, '_ck_email', true ) );
	} elseif ( 'ck_tel' === $col ) {
		echo esc_html( get_post_meta( $post_id, '_ck_telefono', true ) );
	}
}
