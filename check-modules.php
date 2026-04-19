<?php
if (!function_exists('apache_get_modules')) {
    echo "apache_get_modules não disponível\n";
    exit;
}

$mods = apache_get_modules();
echo "mod_rewrite está " . (in_array('mod_rewrite', $mods) ? "ATIVADO" : "DESATIVADO") . "\n";
echo "\nMódulos ativos:\n";
foreach ($mods as $mod) {
    echo "- $mod\n";
}
?>
