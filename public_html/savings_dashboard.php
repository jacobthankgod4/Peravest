<?php
session_start();
require_once 'pdo_pg.php';
require_once 'classes/SavingsManager.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

$savingsManager = new SavingsManager($pdo);
$userSavings = $savingsManager->getUserSavings($_SESSION['user_id']);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Savings - PeraVest</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-4">
        <div class="row">
            <div class="col-md-12">
                <h2>My Target Savings</h2>
                
                <div class="card mb-4">
                    <div class="card-body">
                        <h5>Create New Savings Goal</h5>
                        <form action="create_savings.php" method="POST">
                            <div class="row">
                                <div class="col-md-6">
                                    <input type="text" name="goal_name" class="form-control" placeholder="Goal Name" required>
                                </div>
                                <div class="col-md-3">
                                    <input type="number" name="target_amount" class="form-control" placeholder="Target Amount" required>
                                </div>
                                <div class="col-md-3">
                                    <input type="date" name="target_date" class="form-control" required>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary mt-2">Create Goal</button>
                        </form>
                    </div>
                </div>

                <div class="row">
                    <?php foreach ($userSavings as $saving): ?>
                    <div class="col-md-6 mb-3">
                        <div class="card">
                            <div class="card-body">
                                <h5><?= htmlspecialchars($saving['goal_name']) ?></h5>
                                <p>Target: ₦<?= number_format($saving['target_amount'], 2) ?></p>
                                <p>Current: ₦<?= number_format($saving['current_amount'], 2) ?></p>
                                <div class="progress mb-2">
                                    <div class="progress-bar" style="width: <?= ($saving['current_amount']/$saving['target_amount'])*100 ?>%"></div>
                                </div>
                                <form action="add_savings.php" method="POST" class="d-inline">
                                    <input type="hidden" name="savings_id" value="<?= $saving['id'] ?>">
                                    <input type="number" name="amount" class="form-control d-inline" style="width: 60%" placeholder="Amount" required>
                                    <button type="submit" class="btn btn-sm btn-success">Add</button>
                                </form>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</body>
</html>