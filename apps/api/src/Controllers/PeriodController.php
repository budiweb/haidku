<?php
declare(strict_types=1);

namespace HaidKu\Controllers;

use HaidKu\Repositories\PeriodRepository;
use HaidKu\Services\CycleCalculatorService;
use HaidKu\Middleware\AuthMiddleware;
use DateTimeImmutable;
use Exception;

class PeriodController
{
    private PeriodRepository $periodRepo;
    private CycleCalculatorService $cycleCalculator;

    public function __construct(PeriodRepository $periodRepo, CycleCalculatorService $cycleCalculator)
    {
        $this->periodRepo = $periodRepo;
        $this->cycleCalculator = $cycleCalculator;
    }

    private function jsonResponse(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    private function getPayload(): array
    {
        $raw = file_get_contents('php://input');
        if (empty($raw)) {
            return $_POST;
        }
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    public function index(): void
    {
        $userId = AuthMiddleware::getUserId();
        $from = $_GET['from'] ?? null;
        $to = $_GET['to'] ?? null;

        $periods = $this->periodRepo->getAllByUser($userId, $from, $to);
        $this->jsonResponse([
            'status' => 'success',
            'data'   => $periods,
            'count'  => count($periods),
        ]);
    }

    public function store(): void
    {
        $userId = AuthMiddleware::getUserId();
        $payload = $this->getPayload();

        try {
            $period = $this->periodRepo->create($userId, $payload);
            $this->jsonResponse([
                'status'  => 'success',
                'message' => 'Catatan berhasil disimpan.',
                'data'    => $period,
            ], 201);
        } catch (Exception $e) {
            $this->jsonResponse([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function show(string $id): void
    {
        $userId = AuthMiddleware::getUserId();
        $period = $this->periodRepo->getById($userId, $id);

        if (!$period) {
            $this->jsonResponse([
                'status'  => 'error',
                'message' => 'Catatan tidak ditemukan.',
            ], 404);
        }

        $this->jsonResponse([
            'status' => 'success',
            'data'   => $period,
        ]);
    }

    public function update(string $id): void
    {
        $userId = AuthMiddleware::getUserId();
        $payload = $this->getPayload();

        try {
            $period = $this->periodRepo->update($userId, $id, $payload);
            $this->jsonResponse([
                'status'  => 'success',
                'message' => 'Catatan berhasil diperbarui.',
                'data'    => $period,
            ]);
        } catch (Exception $e) {
            $this->jsonResponse([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function destroy(string $id): void
    {
        $userId = AuthMiddleware::getUserId();

        try {
            $this->periodRepo->delete($userId, $id);
            $this->jsonResponse([
                'status'  => 'success',
                'message' => 'Catatan berhasil dihapus.',
            ]);
        } catch (Exception $e) {
            $this->jsonResponse([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    public function summary(): void
    {
        $userId = AuthMiddleware::getUserId();
        $periods = $this->periodRepo->getAllByUser($userId);
        $today = $_GET['today'] ?? date('Y-m-d');

        $stats = $this->cycleCalculator->computeCycleStats($periods, $today);

        $this->jsonResponse([
            'status' => 'success',
            'data'   => $stats,
        ]);
    }

    public function calendar(): void
    {
        $userId = AuthMiddleware::getUserId();
        $monthStr = $_GET['month'] ?? date('Y-m'); // e.g. 2026-11
        if (!preg_match('/^\d{4}-\d{2}$/', $monthStr)) {
            $monthStr = date('Y-m');
        }

        $startDate = "{$monthStr}-01";
        $daysInMonth = (int)(new DateTimeImmutable($startDate))->format('t');
        $endDate = "{$monthStr}-" . sprintf('%02d', $daysInMonth);

        // Ambil periode yang mencakup bulan ini atau mendekati
        $periods = $this->periodRepo->getAllByUser($userId);
        $today = $_GET['today'] ?? date('Y-m-d');
        $stats = $this->cycleCalculator->computeCycleStats($periods, $today);

        // Petakan tiap tanggal dalam bulan
        $daysMap = [];
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $date = sprintf('%s-%02d', $monthStr, $d);
            $daysMap[$date] = [
                'date'              => $date,
                'day'               => $d,
                'is_period'         => false,
                'is_spotting'       => false,
                'is_predicted_haid' => false,
                'is_fertile_window' => false,
                'is_ovulation'      => false,
                'period_id'         => null,
                'flow_level'        => null,
            ];
        }

        // 1. Petakan catatan aktual
        foreach ($periods as $p) {
            $pStart = $p['start_date'];
            $pEnd = $p['end_date'] ?? $pStart;
            $type = $p['bleeding_type'] ?? 'period';

            $curr = new DateTimeImmutable($pStart);
            $last = new DateTimeImmutable($pEnd);

            while ($curr <= $last) {
                $curStr = $curr->format('Y-m-d');
                if (isset($daysMap[$curStr])) {
                    if ($type === 'spotting') {
                        $daysMap[$curStr]['is_spotting'] = true;
                    } else {
                        $daysMap[$curStr]['is_period'] = true;
                        $daysMap[$curStr]['flow_level'] = $p['flow_level'] ?? 'medium';
                    }
                    $daysMap[$curStr]['period_id'] = $p['id'];
                }
                $curr = $curr->modify('+1 day');
            }
        }

        // 2. Petakan prediksi haid berikutnya (jika jatuh pada bulan ini)
        if (!empty($stats['predicted_next_period'])) {
            $predStart = new DateTimeImmutable($stats['predicted_next_period']);
            $avgDuration = $stats['average_period_duration'] ?? 5;
            for ($i = 0; $i < $avgDuration; $i++) {
                $pDate = $predStart->modify("+{$i} days")->format('Y-m-d');
                if (isset($daysMap[$pDate]) && !$daysMap[$pDate]['is_period']) {
                    $daysMap[$pDate]['is_predicted_haid'] = true;
                }
            }
        }

        // 3. Petakan estimasi ovulasi dan fertile window edukatif
        if (!empty($stats['estimated_ovulation']) && isset($daysMap[$stats['estimated_ovulation']])) {
            $daysMap[$stats['estimated_ovulation']]['is_ovulation'] = true;
        }

        if (!empty($stats['fertile_window_start']) && !empty($stats['fertile_window_end'])) {
            $fCurr = new DateTimeImmutable($stats['fertile_window_start']);
            $fLast = new DateTimeImmutable($stats['fertile_window_end']);
            while ($fCurr <= $fLast) {
                $fStr = $fCurr->format('Y-m-d');
                if (isset($daysMap[$fStr])) {
                    $daysMap[$fStr]['is_fertile_window'] = true;
                }
                $fCurr = $fCurr->modify('+1 day');
            }
        }

        $this->jsonResponse([
            'status' => 'success',
            'month'  => $monthStr,
            'stats'  => $stats,
            'days'   => array_values($daysMap),
        ]);
    }
}

