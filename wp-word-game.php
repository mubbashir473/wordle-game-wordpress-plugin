<?php
/**
 * Plugin Name: Word Guess Game
 * Description: A Wordle-style word guessing game.
 * Version: 1.5
 */

if( !defined( 'ABSPATH' ) )  exit; // Exit if accessed directly.

// Include the main game logic file
require_once plugin_dir_path(__FILE__) . 'includes/words.php';
require_once plugin_dir_path(__FILE__) . 'includes/shortcode.php';
require_once plugin_dir_path(__FILE__) . 'includes/ajax.php';

// Enqueue assets
function wg_enqueue_assets() {
    wp_enqueue_style('wg-style', plugin_dir_url(__FILE__) . 'assets/css/style.css');
    wp_enqueue_script('wg-script', plugin_dir_url(__FILE__) . 'assets/js/script.js', [], filemtime(plugin_dir_path(__FILE__) . 'assets/js/script.js'), true);

    wp_localize_script('wg-script', 'wgData', ['ajaxUrl' => admin_url('admin-ajax.php')]);
}
add_action('wp_enqueue_scripts', 'wg_enqueue_assets');
