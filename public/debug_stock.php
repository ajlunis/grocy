<?php
define('GROCY_DATAPATH', __DIR__ . '/../data');
require_once __DIR__ . '/../packages/autoload.php';

// Load config
if (file_exists(GROCY_DATAPATH . '/config.php')) {
    require_once GROCY_DATAPATH . '/config.php';
}
require_once __DIR__ . '/../config-dist.php';

$db = \Grocy\Services\DatabaseService::getInstance()->GetDbConnection();

echo "Debug Stock Data\n";

// 1. Check Product Count
$products = $db->products()->where('active = 1')->count();
echo "Active Products: $products\n";

// 2. Check uihelper_stock_current_overview Count (unfiltered)
$viewRows = $db->uihelper_stock_current_overview()->count();
echo "uihelper_stock_current_overview Rows: $viewRows\n";

// 3. Check uihelper_stock_current_overview Count (1=1)
$viewRowsWhere = $db->uihelper_stock_current_overview()->where('1=1')->count();
echo "uihelper_stock_current_overview (where 1=1): $viewRowsWhere\n";

// 4. Dump rows to check for out of stock
$rows = $db->uihelper_stock_current_overview()->limit(100);
$foundOutOfStock = 0;
foreach ($rows as $row) {
    if ($row['amount_aggregated'] == 0) {
        $foundOutOfStock++;
        echo "FOUND OUT OF STOCK: " . $row['product_name'] . "\n";
    }
}
echo "Out of stock items found in View: $foundOutOfStock\n";
