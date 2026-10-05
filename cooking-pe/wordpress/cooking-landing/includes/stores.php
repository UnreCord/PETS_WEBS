<?php
/**
 * Puntos de venta: one entry per store, shown on the map and in the list of the landing.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Creates the current stores the first time (does nothing if any store already exists).
 */
function cooking_landing_seed_stores() {
	$existing = get_posts(
		array(
			'post_type'   => 'cooking_tienda',
			'post_status' => 'any',
			'numberposts' => 1,
			'fields'      => 'ids',
		)
	);
	if ( $existing ) {
		return;
	}
	foreach ( cooking_landing_default_stores() as $s ) {
		list( $slug, $store, $address, $district, $lat, $lng, $maps ) = $s;
		$id = wp_insert_post(
			array(
				'post_type'   => 'cooking_tienda',
				'post_status' => 'publish',
				'post_title'  => $store,
				'post_name'   => $slug,
			)
		);
		if ( $id && ! is_wp_error( $id ) ) {
			update_post_meta( $id, '_ck_address', $address );
			update_post_meta( $id, '_ck_district', $district );
			update_post_meta( $id, '_ck_lat', $lat );
			update_post_meta( $id, '_ck_lng', $lng );
			if ( $maps ) {
				update_post_meta( $id, '_ck_maps', $maps );
			}
		}
	}
}

/**
 * Stores for the page script.
 *
 * @return array
 */
function cooking_landing_locations() {
	$districts = cooking_landing_districts();
	$posts     = get_posts(
		array(
			'post_type'   => 'cooking_tienda',
			'post_status' => 'publish',
			'numberposts' => 300,
			'orderby'     => 'title',
			'order'       => 'ASC',
		)
	);
	$out = array();
	foreach ( $posts as $p ) {
		$district = (string) get_post_meta( $p->ID, '_ck_district', true );
		$lat      = (float) get_post_meta( $p->ID, '_ck_lat', true );
		$lng      = (float) get_post_meta( $p->ID, '_ck_lng', true );
		if ( ! isset( $districts[ $district ] ) || ! $lat || ! $lng ) {
			continue; // incomplete entries stay out of the map until they are fixed
		}
		$row = array(
			'id'       => $p->post_name ? $p->post_name : 'tienda-' . $p->ID,
			'store'    => html_entity_decode( get_the_title( $p ), ENT_QUOTES, 'UTF-8' ),
			'address'  => (string) get_post_meta( $p->ID, '_ck_address', true ),
			'district' => $district,
			'lat'      => $lat,
			'lng'      => $lng,
		);
		$maps = (string) get_post_meta( $p->ID, '_ck_maps', true );
		if ( $maps ) {
			$row['maps'] = $maps;
		}
		$out[] = $row;
	}
	return $out;
}

add_action( 'add_meta_boxes_cooking_tienda', 'cooking_landing_store_metabox' );

function cooking_landing_store_metabox() {
	add_meta_box( 'ck_store', 'Datos del punto de venta', 'cooking_landing_store_fields', 'cooking_tienda', 'normal', 'high' );
}

/**
 * @param WP_Post $post Store.
 */
function cooking_landing_store_fields( $post ) {
	wp_nonce_field( 'ck_store_save', 'ck_store_nonce' );
	$v = function ( $key ) use ( $post ) {
		return (string) get_post_meta( $post->ID, $key, true );
	};
	?>
	<p style="color:#50575e">El título es el nombre de la tienda tal como se verá en el mapa. Si la tienda tiene varios locales, crea un punto de venta por local con el mismo nombre.</p>
	<table class="form-table" role="presentation">
		<tr>
			<th scope="row"><label for="ck-address">Dirección</label></th>
			<td><input id="ck-address" class="regular-text" name="ck_address" value="<?php echo esc_attr( $v( '_ck_address' ) ); ?>" placeholder="Av. San Luis 2845" required></td>
		</tr>
		<tr>
			<th scope="row"><label for="ck-district">Distrito</label></th>
			<td>
				<select id="ck-district" name="ck_district" required>
					<option value="">Elige el distrito…</option>
					<?php foreach ( cooking_landing_districts() as $id => $name ) : ?>
						<option value="<?php echo esc_attr( $id ); ?>" <?php selected( $v( '_ck_district' ), $id ); ?>><?php echo esc_html( $name ); ?></option>
					<?php endforeach; ?>
				</select>
			</td>
		</tr>
		<tr>
			<th scope="row"><label for="ck-lat">Coordenadas</label></th>
			<td>
				<input id="ck-lat" name="ck_lat" type="number" step="any" min="-12.7" max="-11.4" value="<?php echo esc_attr( $v( '_ck_lat' ) ); ?>" placeholder="-12.0985" style="width:140px" required>
				<input id="ck-lng" name="ck_lng" type="number" step="any" min="-77.4" max="-76.4" value="<?php echo esc_attr( $v( '_ck_lng' ) ); ?>" placeholder="-77.0015" style="width:140px" aria-label="Longitud" required>
				<p class="description">Latitud y longitud. En Google Maps, haz clic derecho sobre el local y luego clic en los números que aparecen primero: se copian como “-12.0985, -77.0015”. También puedes pegarlos completos en el primer campo. Solo se aceptan puntos dentro de Lima Metropolitana y Callao.</p>
			</td>
		</tr>
		<tr>
			<th scope="row"><label for="ck-maps">Enlace de Google Maps <span style="font-weight:400">(opcional)</span></label></th>
			<td>
				<input id="ck-maps" class="regular-text code" name="ck_maps" type="url" value="<?php echo esc_attr( $v( '_ck_maps' ) ); ?>" placeholder="https://maps.app.goo.gl/…">
				<p class="description">Para “Cómo llegar”. Si lo dejas vacío, se busca la dirección en Google Maps.</p>
			</td>
		</tr>
	</table>
	<script>
	// pasting "-12.0985, -77.0015" into the latitude field fills both fields
	document.getElementById('ck-lat').addEventListener('paste', function (e) {
		var t = (e.clipboardData || window.clipboardData).getData('text');
		var m = t.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
		if (m) { e.preventDefault(); this.value = m[1]; document.getElementById('ck-lng').value = m[2]; }
	});
	</script>
	<?php
}

add_action( 'save_post_cooking_tienda', 'cooking_landing_store_save', 10, 2 );

/**
 * @param int     $post_id Store id.
 * @param WP_Post $post    Store.
 */
function cooking_landing_store_save( $post_id, $post ) {
	if ( ! isset( $_POST['ck_store_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['ck_store_nonce'] ) ), 'ck_store_save' ) ) {
		return;
	}
	if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	$districts = cooking_landing_districts();
	$address   = sanitize_text_field( wp_unslash( $_POST['ck_address'] ?? '' ) );
	$district  = sanitize_key( wp_unslash( $_POST['ck_district'] ?? '' ) );
	$lat       = (float) str_replace( ',', '.', sanitize_text_field( wp_unslash( $_POST['ck_lat'] ?? '' ) ) );
	$lng       = (float) str_replace( ',', '.', sanitize_text_field( wp_unslash( $_POST['ck_lng'] ?? '' ) ) );
	$maps      = esc_url_raw( wp_unslash( $_POST['ck_maps'] ?? '' ) );

	update_post_meta( $post_id, '_ck_address', $address );
	update_post_meta( $post_id, '_ck_district', isset( $districts[ $district ] ) ? $district : '' );
	// Lima Metropolitana and Callao only; anything else is left empty so the store is not misplaced on the map
	update_post_meta( $post_id, '_ck_lat', ( $lat < -11.4 && $lat > -12.7 ) ? $lat : '' );
	update_post_meta( $post_id, '_ck_lng', ( $lng < -76.4 && $lng > -77.4 ) ? $lng : '' );
	if ( $maps ) {
		update_post_meta( $post_id, '_ck_maps', $maps );
	} else {
		delete_post_meta( $post_id, '_ck_maps' );
	}
}

add_filter( 'manage_cooking_tienda_posts_columns', 'cooking_landing_store_columns' );

/**
 * @param array $cols Columns.
 * @return array
 */
function cooking_landing_store_columns( $cols ) {
	return array(
		'cb'          => $cols['cb'],
		'title'       => 'Tienda',
		'ck_address'  => 'Dirección',
		'ck_district' => 'Distrito',
		'ck_status'   => 'En el mapa',
	);
}

add_action( 'manage_cooking_tienda_posts_custom_column', 'cooking_landing_store_column', 10, 2 );

/**
 * @param string $col     Column.
 * @param int    $post_id Store id.
 */
function cooking_landing_store_column( $col, $post_id ) {
	$districts = cooking_landing_districts();
	if ( 'ck_address' === $col ) {
		echo esc_html( get_post_meta( $post_id, '_ck_address', true ) );
	} elseif ( 'ck_district' === $col ) {
		$d = (string) get_post_meta( $post_id, '_ck_district', true );
		echo esc_html( $districts[ $d ] ?? '—' );
	} elseif ( 'ck_status' === $col ) {
		$ok = isset( $districts[ (string) get_post_meta( $post_id, '_ck_district', true ) ] ) && get_post_meta( $post_id, '_ck_lat', true ) && get_post_meta( $post_id, '_ck_lng', true );
		echo $ok ? '✓' : '<span style="color:#b32d2e">Falta distrito o coordenadas</span>';
	}
}
