<?php
declare(strict_types=1);

namespace HaidKu\Controllers;

use HaidKu\Repositories\PeriodRepository;
use HaidKu\Repositories\UserRepository;
use HaidKu\Services\CycleCalculatorService;
use HaidKu\Services\SDMService;
use HaidKu\Middleware\AuthMiddleware;
use PDO;
use Exception;

class FertilityController
{
    private PeriodRepository $periodRepo;
    private UserRepository $userRepo;
    private CycleCalculatorService $cycleCalculator;
    private SDMService $sdmService;
    private PDO $db;

    public function __construct(
        PeriodRepository $periodRepo,
        UserRepository $userRepo,
        CycleCalculatorService $cycleCalculator,
        SDMService $sdmService,
        PDO $db
    ) {
        $this->periodRepo = $periodRepo;
        $this->userRepo = $userRepo;
        $this->cycleCalculator = $cycleCalculator;
        $this->sdmService = $sdmService;
        $this->db = $db;
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

    /**
     * GET /api/v1/fertility/estimate
     * Mengembalikan estimasi perkiraan ovulasi dan jendela subur edukatif
     */
    public function estimate(): void
    {
        $userId = AuthMiddleware::getUserId();
        $periods = $this->periodRepo->getAllByUser($userId);
        $user = $this->userRepo->getUserWithSettings($userId);
        $timezone = $user['timezone'] ?? 'Asia/Jakarta';
        $today = $_GET['today'] ?? null;

        $stats = $this->cycleCalculator->computeCycleStats($periods, $today, $timezone);

        $this->jsonResponse([
            'status'         => 'success',
            'method_name'    => 'Educational Fertility Window Estimator',
            'method_version' => 'FWE-1.0',
            'as_of_date'     => $today ?? date('Y-m-d'),
            'data'           => [
                'current_cycle_day'       => $stats['current_cycle_day'],
                'predicted_next_period'   => $stats['predicted_next_period'],
                'predicted_range'         => [
                    'start' => $stats['predicted_range_start'],
                    'end'   => $stats['predicted_range_end'],
                ],
                'estimated_ovulation'     => $stats['estimated_ovulation'],
                'fertile_window'          => [
                    'start' => $stats['fertile_window_start'],
                    'end'   => $stats['fertile_window_end'],
                ],
                'confidence'              => $stats['confidence'],
                'is_irregular'            => $stats['is_irregular'],
            ],
            'disclaimer'     => 'Prediksi ovulasi dan masa subur adalah perkiraan berbasis kalender dan BUKAN jaminan ovulasi atau hari aman untuk seks tanpa kontrasepsi.',
            'source_urls'    => [
                'https://www.acog.org/womens-health/faqs/fertility-awareness-based-methods-of-family-planning',
            ],
        ]);
    }

    /**
     * GET /api/v1/fertility/sdm-status
     * Menghitung status Standard Days Method terpisah secara ketat
     */
    public function sdmStatus(): void
    {
        $userId = AuthMiddleware::getUserId();
        $user = $this->userRepo->getUserWithSettings($userId);
        $periods = $this->periodRepo->getAllByUser($userId);
        $timezone = $user['timezone'] ?? 'Asia/Jakarta';

        $targetDate = $_GET['date'] ?? ($_GET['today'] ?? null);
        $stats = $this->cycleCalculator->computeCycleStats($periods, $targetDate, $timezone);

        $cycleLengths = $stats['cycle_lengths'] ?? [];
        $cycleDates = $stats['cycle_start_dates'] ?? [];

        // Evaluasi kelayakan
        $eligibility = $this->sdmService->evaluateEligibility(
            $user,
            $cycleLengths,
            $cycleDates,
            $targetDate
        );

        $cycleDay = $stats['current_cycle_day'] ?? 0;
        $statusResult = $this->sdmService->getStatusForCycleDay($cycleDay, $eligibility);

        $this->jsonResponse([
            'status'              => 'success',
            'method_name'         => 'Standard Days Method (SDM)',
            'method_version'      => $statusResult['method_version'],
            'as_of_date'          => $targetDate ?? date('Y-m-d'),
            'eligible'            => $eligibility['eligible'],
            'eligibility_reasons' => $eligibility['reasons'],
            'primary_code'        => $statusResult['primary_code'],
            'data'                => $statusResult,
            'source_urls'         => [
                'https://www.cdc.gov/contraception/hcp/usspr/standard-days-method.html',
                'https://www.who.int/news-room/fact-sheets/detail/family-planning-contraception',
            ],
        ]);
    }

    /**
     * POST /api/v1/acknowledgements
     * Menyimpan informed acknowledgment consent SDM
     */
    public function acknowledge(): void
    {
        $userId = AuthMiddleware::getUserId();
        $payload = $this->getPayload();

        $type = $payload['type'] ?? 'sdm_risk_acknowledgement';
        $version = $payload['version'] ?? '1.0';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

        // Pastikan profil dan settings user siap
        $this->userRepo->getOrCreateUser($userId);

        // Simpan ke acknowledgements
        $id = 'ack_' . bin2hex(random_bytes(16));
        $stmt = $this->db->prepare(
            "INSERT INTO acknowledgements (id, user_id, type, version, user_agent_summary)
             VALUES (:id, :user_id, :type, :version, :ua)"
        );
        $stmt->execute([
            ':id'      => $id,
            ':user_id' => $userId,
            ':type'    => $type,
            ':version' => $version,
            ':ua'      => substr($userAgent, 0, 250),
        ]);

        // Update settings
        $this->userRepo->updateSettings($userId, [
            'sdm_consent' => true,
            'goal'        => 'avoid',
        ]);

        $this->jsonResponse([
            'status'  => 'success',
            'message' => 'Persetujuan risiko Standard Days Method berhasil dicatat.',
            'data'    => [
                'id'          => $id,
                'accepted_at' => gmdate('Y-m-d\TH:i:s\Z'),
                'type'        => $type,
            ],
        ]);
    }
}
