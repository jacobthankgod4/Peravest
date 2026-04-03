<?php
class SavingsManager {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    public function createTargetSaving($user_id, $goal_name, $target_amount, $target_date) {
        $stmt = $this->pdo->prepare("
            INSERT INTO target_savings (user_id, goal_name, target_amount, target_date) 
            VALUES (?, ?, ?, ?)
        ");
        return $stmt->execute([$user_id, $goal_name, $target_amount, $target_date]);
    }
    
    public function addSavingsDeposit($savings_id, $amount, $reference) {
        $this->pdo->beginTransaction();
        try {
            // Add transaction
            $stmt = $this->pdo->prepare("
                INSERT INTO savings_transactions (savings_id, amount, transaction_type, reference) 
                VALUES (?, ?, 'deposit', ?)
            ");
            $stmt->execute([$savings_id, $amount, $reference]);
            
            // Update current amount
            $stmt = $this->pdo->prepare("
                UPDATE target_savings 
                SET current_amount = current_amount + ? 
                WHERE id = ?
            ");
            $stmt->execute([$amount, $savings_id]);
            
            $this->pdo->commit();
            return true;
        } catch (Exception $e) {
            $this->pdo->rollback();
            return false;
        }
    }
    
    public function getUserSavings($user_id) {
        $stmt = $this->pdo->prepare("
            SELECT * FROM target_savings 
            WHERE user_id = ? AND status = 'active'
            ORDER BY created_at DESC
        ");
        $stmt->execute([$user_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>