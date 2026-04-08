<?php

function wg_get_words($word_length) {

    $cache_key = "wg_words_" . $word_length;

    $words = get_transient($cache_key);

    if ($words !== false) {
        return $words;
    }

    $pattern = str_repeat("?", $word_length);

    $response = wp_remote_get("https://api.datamuse.com/words?sp=$pattern&max=2000");

    if (is_wp_error($response)) return [];

    $body = json_decode(wp_remote_retrieve_body($response), true);

    $words = array_column($body, 'word');

    $words = array_filter($words, function($w) use ($word_length) {
        return strlen($w) == $word_length && ctype_alpha($w);
    });

    // Fast lookup optimization
    $words = array_flip($words);

    set_transient($cache_key, $words, 12 * HOUR_IN_SECONDS);

    return $words;
}
