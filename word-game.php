<?php
/**
 * Plugin Name: Word Guess Game
 * Description: A Wordle-style word guessing game.
 * Version: 1.4
 * Author: Mubbashir
 */

function wg_enqueue_assets() {

wp_enqueue_style('wg-style',plugin_dir_url(__FILE__) . 'style.css');
wp_enqueue_script('wg-script',plugin_dir_url(__FILE__) . 'script.js',[],false,true);

wp_localize_script('wg-script', 'wgData', ['pluginUrl' => plugin_dir_url(__FILE__)]);
}

add_action('wp_enqueue_scripts', 'wg_enqueue_assets');

function wg_game_shortcode() {
    return '
    <div id="word-game-wrapper">
        <button id="wg-restart">🔄 Restart Game</button>
        <div id="wg-message"></div>
        <div id="word-game"></div>
    </div>';
}

add_shortcode('word_game', 'wg_game_shortcode');
