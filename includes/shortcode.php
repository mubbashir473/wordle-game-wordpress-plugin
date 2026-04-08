<?php

function wg_game_shortcode($atts) {
    $atts = shortcode_atts([
        'length' => 5,
        'attempts' => 6,
    ], $atts);

$word_length = intval($atts['length']);
$rows = intval($atts['attempts']);

// session_start
if (!session_id()) session_start();

ob_start();
?>
<div id="word-game"
    data-length="<?php echo esc_attr($word_length); ?>"
    data-rows="<?php echo esc_attr($rows); ?>"
    ></div>

    <button id="wg-restart">🔄 Restart Game</button>
    <div id="wg-message"></div>
<?php
return ob_get_clean();
}

add_shortcode('word_game', 'wg_game_shortcode');
