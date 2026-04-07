import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseKey);

interface ProcessResult {
  success: boolean;
  cyclesProcessed: number;
  errors: string[];
  timestamp: string;
}

// 3.1: Create Edge Function cron_process_ajo_cycles
serve(async (req: Request) => {
  try {
    // Verify authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const result: ProcessResult = {
      success: true,
      cyclesProcessed: 0,
      errors: [],
      timestamp: new Date().toISOString(),
    };

    // 3.2: Call services from Edge Function
    // Step 1: Validate all cycles ready for processing
    const { data: readyGroups, error: groupsError } = await supabase
      .from("ajo_groups")
      .select("id")
      .eq("status", "active");

    if (groupsError) {
      result.errors.push(`Failed to fetch groups: ${groupsError.message}`);
      return new Response(
        JSON.stringify(result),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Process each group's current cycle
    for (const group of readyGroups || []) {
      try {
        // Call RPC validate_cycle_readiness
        const { data: cycleStatus, error: validateError } = await supabase.rpc(
          "validate_cycle_readiness",
          { group_id: group.id }
        );

        if (validateError) {
          result.errors.push(
            `Group ${group.id} validation failed: ${validateError.message}`
          );
          continue;
        }

        // If cycle is ready, process it
        if (cycleStatus?.ready) {
          const { data: processResult, error: processError } = await supabase.rpc(
            "process_atomic_ajo_cycle",
            { cycle_id: cycleStatus.cycle_id }
          );

          if (processError) {
            result.errors.push(
              `Cycle ${cycleStatus.cycle_id} processing failed: ${processError.message}`
            );
          } else if (processResult?.success) {
            result.cyclesProcessed++;

            // Send payout notifications
            await sendPayoutNotifications(
              group.id,
              processResult.payout_recipient_id,
              processResult.payout_amount
            );
          }
        }
      } catch (error) {
        result.errors.push(
          `Error processing group ${group.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    // Log execution
    await logCronExecution(result);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cron function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Helper: Send payout notifications
async function sendPayoutNotifications(
  groupId: number,
  recipientId: number,
  amount: number
) {
  try {
    // Get recipient user info
    const { data: member } = await supabase
      .from("ajo_group_members")
      .select("user_id")
      .eq("id", recipientId)
      .single();

    if (!member) return;

    // Create in-app notification
    await supabase.from("notifications").insert([
      {
        user_id: member.user_id,
        title: "Ajo Payout Ready",
        message: `Your Ajo payout of ₦${amount} is ready for withdrawal!`,
        type: "ajo_payout",
        read: false,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    console.error("Notification error:", error);
  }
}

// Helper: Log cron execution
async function logCronExecution(result: ProcessResult) {
  try {
    await supabase.from("cron_execution_logs").insert([
      {
        function_name: "cron_process_ajo_cycles",
        status: result.success ? "success" : "partial_failure",
        cycles_processed: result.cyclesProcessed,
        errors: result.errors,
        executed_at: result.timestamp,
      },
    ]);
  } catch (error) {
    console.error("Logging error:", error);
  }
}
