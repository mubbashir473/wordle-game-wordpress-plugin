<?php
add_action('wp_ajax_wg_get_word', 'wg_get_word');
add_action('wp_ajax_nopriv_wg_get_word', 'wg_get_word');

add_action('wp_ajax_check_word', 'wg_check_word');
add_action('wp_ajax_nopriv_check_word', 'wg_check_word');

add_action('wp_ajax_wg_reveal_word', 'wg_reveal_word');
add_action('wp_ajax_nopriv_wg_reveal_word', 'wg_reveal_word');

//  reveal the correct word
function wg_reveal_word() {

    if (!session_id()) session_start();

    $word = $_SESSION['wg_word'] ?? '';

    wp_send_json([
        'word' => $word
    ]);
}

/* ================= GET WORD FROM API ================= */

function wg_get_word() {

    if (!session_id()) session_start();

    $word_length = intval($_POST['length']);

    $words = wg_get_words($word_length);

    if (empty($words)) {
        wp_send_json(['success' => false]);
    }

    $keys = array_keys($words);
    $word = $keys[array_rand($keys)];
    $_SESSION['wg_word'] = $word;

    wp_send_json([
        'success' => true,
    ]);
}
/* ================= VALIDATE WORD VIA API ================= */

function wg_is_valid_word($word, $word_length) {

     $words = wg_get_words($word_length);

    return isset($words[$word]);
}

/* ================= CHECK WORD ================= */
function wg_check_word()
{
    if (!session_id()) session_start();

    $guess = strtolower($_POST['guess']);
    $correct = $_SESSION['wg_word'] ?? '';

    if (empty($correct)) {
        wp_send_json([
            'valid' => false,
            'message' => 'Game error: word not found in session'
        ]);
    }

    $word_length = strlen($correct);

    // Validate word exists in the word list
    if (!wg_is_valid_word($guess, $word_length)) {
        wp_send_json([
            'valid' => false,
            'message' => 'Not a valid word!'
        ]);
        wp_die();
    }

    $result = array_fill(0, $word_length, null);

    $correctArr = str_split($correct);
    $guessArr = str_split($guess);

    $used = array_fill(0, $word_length, false);

    //green
    for ($i = 0; $i < $word_length; $i++) {
        if ($guessArr[$i] === $correctArr[$i]) {
            $result[$i] = [
                'letter' => $guessArr[$i],
                'exists' => true,
                'position' => true,
            ];
            $used[$i] = true;
            $correctArr[$i] = null;
            $guessArr[$i] = null;
        }
    }

    // YELLOW and GREY
    for ($i = 0; $i < $word_length; $i++) {

        if ($result[$i] !== null) continue;

        $found = false;

       for ($j = 0; $j < $word_length; $j++) {
            if (!$used[$j] && $guessArr[$i] === $correctArr[$j]) {
                $found = true;
                $used[$j] = true;
                break;
            }
        }

        $result[$i] = [
            'letter' => $guessArr[$i],
            'exists' => $found,
            'position' => false
        ];
    }

   // WIN CONDITION
    if ($guess === $correct) {
        wp_send_json([
            'valid' => true,
            'result' => $result,
            'won' => true,
            'word' => $correct
        ]);
    }

    // NORMAL RESPONSE
    wp_send_json([
        'valid' => true,
        'result' => $result,
        'won' => false,
    ]);

}
