<?php
declare(strict_types=1);

echo "========================================\n";
echo "   HaidKu PHP Automated Test Suite      \n";
echo "========================================\n\n";

require_once __DIR__ . '/CycleCalculatorTest.php';
require_once __DIR__ . '/SDMTest.php';
require_once __DIR__ . '/PeriodApiTest.php';
require_once __DIR__ . '/SyncTest.php';
require_once __DIR__ . '/SymptomApiTest.php';

$t1 = new CycleCalculatorTest();
$res1 = $t1->run();

echo "\n----------------------------------------\n";

$t2 = new SDMTest();
$res2 = $t2->run();

echo "\n----------------------------------------\n";

$t3 = new PeriodApiTest();
$res3 = $t3->run();

echo "\n----------------------------------------\n";

$t4 = new SyncTest();
$res4 = $t4->run();

echo "\n----------------------------------------\n";

$t5 = new \HaidKu\Tests\SymptomApiTest();
$res5 = $t5->run();

echo "\n========================================\n";
if ($res1 && $res2 && $res3 && $res4 && $res5) {
    echo "SEMUA TEST PHP LULUS (100% SUKSES)!\n";
    exit(0);
} else {
    echo "ADA TEST YANG GAGAL!\n";
    exit(1);
}
