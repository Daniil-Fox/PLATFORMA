<?php
/**
 * Скрипт для получения видео из VK сообщества
 * Автоматически обновляет список видео и кэширует результат
 */

// Конфигурация VK API
$config = [
    'access_token' => 'YOUR_VK_ACCESS_TOKEN', // Замените на ваш токен
    'owner_id' => '-YOUR_GROUP_ID', // Отрицательный ID сообщества (например, -123456789)
    'count' => 10, // Количество видео для получения
    'api_version' => '5.131'
];

// Путь к кэш-файлу
$cache_file = __DIR__ . '/vk-videos-cache.json';
$cache_duration = 3600; // Кэширование на 1 час

/**
 * Получение видео из VK API
 */
function getVKVideos($config) {
    $url = "https://api.vk.com/method/video.get?" . http_build_query([
        'owner_id' => $config['owner_id'],
        'count' => $config['count'],
        'access_token' => $config['access_token'],
        'v' => $config['api_version'],
        'extended' => 1 // Получаем дополнительную информацию
    ]);

    $context = stream_context_create([
        'http' => [
            'timeout' => 10,
            'method' => 'GET'
        ]
    ]);

    $response = file_get_contents($url, false, $context);

    if ($response === false) {
        throw new Exception('Ошибка при обращении к VK API');
    }

    $data = json_decode($response, true);

    if (isset($data['error'])) {
        throw new Exception('VK API Error: ' . $data['error']['error_msg']);
    }

    return $data;
}

/**
 * Обработка и форматирование данных видео
 */
function processVideos($vk_data) {
    if (!isset($vk_data['response']['items'])) {
        return [];
    }

    $videos = [];
    foreach ($vk_data['response']['items'] as $video) {
        // Проверяем, что это видео (не альбом)
        if (!isset($video['player']) || empty($video['player'])) {
            continue;
        }

        $videos[] = [
            'id' => $video['id'],
            'title' => htmlspecialchars($video['title'] ?? 'Без названия'),
            'description' => htmlspecialchars($video['description'] ?? ''),
            'duration' => formatDuration($video['duration'] ?? 0),
            'preview' => $video['photo_320'] ?? $video['photo_130'] ?? '',
            'player_url' => $video['player'],
            'views' => $video['views'] ?? 0,
            'date' => date('d.m.Y', $video['date'] ?? time()),
            'embed_url' => generateEmbedUrl($video)
        ];
    }

    return $videos;
}

/**
 * Форматирование длительности видео
 */
function formatDuration($seconds) {
    if ($seconds < 60) {
        return $seconds . 'с';
    } elseif ($seconds < 3600) {
        return gmdate('i:s', $seconds);
    } else {
        return gmdate('H:i:s', $seconds);
    }
}

/**
 * Генерация URL для встраивания видео
 */
function generateEmbedUrl($video) {
    if (isset($video['player'])) {
        // Извлекаем video_id из player URL
        if (preg_match('/video(\d+_\d+)/', $video['player'], $matches)) {
            return "https://vk.com/video_ext.php?oid=" . $video['owner_id'] . "&id=" . $video['id'] . "&hd=2";
        }
    }
    return $video['player'] ?? '';
}

/**
 * Проверка кэша
 */
function getCachedVideos($cache_file, $cache_duration) {
    if (!file_exists($cache_file)) {
        return null;
    }

    $cache_time = filemtime($cache_file);
    if ((time() - $cache_time) > $cache_duration) {
        return null;
    }

    $cached_data = file_get_contents($cache_file);
    return json_decode($cached_data, true);
}

/**
 * Сохранение в кэш
 */
function saveToCache($data, $cache_file) {
    file_put_contents($cache_file, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

// Основная логика
try {
    // Проверяем кэш
    $cached_videos = getCachedVideos($cache_file, $cache_duration);

    if ($cached_videos !== null) {
        $videos = $cached_videos;
    } else {
        // Получаем свежие данные из VK
        $vk_data = getVKVideos($config);
        $videos = processVideos($vk_data);

        // Сохраняем в кэш
        saveToCache($videos, $cache_file);
    }

    // Возвращаем JSON ответ
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => true,
        'videos' => $videos,
        'count' => count($videos),
        'cached' => $cached_videos !== null
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {
    // В случае ошибки возвращаем пустой массив
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'videos' => [],
        'count' => 0
    ], JSON_UNESCAPED_UNICODE);
}
?>
