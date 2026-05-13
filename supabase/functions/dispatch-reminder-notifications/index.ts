import { createClient } from "npm:@supabase/supabase-js@2";

type ClaimedDispatchJob = {
  job_id: string;
  user_id: string;
  device_id: string;
  expo_push_token: string;
  prayer_slug: string | null;
  reminder_type: "daily" | "festival" | null;
  target_date: string;
  scheduled_for_local: string;
  payload: Record<string, unknown> | null;
};

type DispatchResult = {
  jobId: string;
  status: "sent" | "failed" | "queued";
  error?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function humanizePrayerSlug(slug: string | null | undefined) {
  if (!slug) return "today's prayer";

  return slug
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function buildExpoMessage(job: ClaimedDispatchJob) {
  const prayerName = humanizePrayerSlug(job.prayer_slug);
  const reminderType = job.reminder_type ?? "daily";
  const reminderVariant =
    typeof job.payload?.reminder_variant === "string"
      ? job.payload.reminder_variant
      : "standard";
  const festivalSlug =
    typeof job.payload?.festival_slug === "string"
      ? job.payload.festival_slug
      : null;
  const festivalName = humanizePrayerSlug(festivalSlug);
  const rawDaysAhead =
    typeof job.payload?.days_ahead === "number"
      ? job.payload.days_ahead
      : typeof job.payload?.days_ahead === "string"
        ? Number(job.payload.days_ahead)
        : null;
  const normalizedDaysAhead = rawDaysAhead === 2 ? 2 : 1;

  const title =
    reminderVariant === "festival_preparation"
      ? "BhaktiVerse Festival Preparation"
      : reminderType === "festival"
        ? "BhaktiVerse Festival Reminder"
        : "BhaktiVerse Daily Reminder";
  const body =
    reminderVariant === "festival_preparation"
      ? `${festivalName} is coming ${normalizedDaysAhead === 2 ? "in two days" : "tomorrow"}. Prepare ${prayerName} early.`
      : reminderType === "festival"
        ? `${prayerName} is ready for today's festival practice.`
        : `Take a moment for ${prayerName}.`;

  return {
    to: job.expo_push_token,
    title,
    body,
    sound: "default",
    priority: "high",
    data: {
      type: "devotional-reminder",
      prayerSlug: job.prayer_slug,
      reminderType: reminderType,
      targetDate: job.target_date,
      ...job.payload,
    },
  };
}

async function sendExpoPush(job: ClaimedDispatchJob): Promise<{
  status: "sent" | "failed";
  responsePayload: Record<string, unknown>;
  error?: string;
}> {
  const message = buildExpoMessage(job);

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const responsePayload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const expoData = Array.isArray(responsePayload.data)
      ? responsePayload.data[0]
      : responsePayload.data;
    const expoStatus =
      expoData && typeof expoData === "object" && "status" in expoData
        ? String((expoData as Record<string, unknown>).status)
        : null;
    const expoError =
      expoData && typeof expoData === "object" && "message" in expoData
        ? String((expoData as Record<string, unknown>).message)
        : null;

    if (!response.ok || expoStatus !== "ok") {
      return {
        status: "failed",
        responsePayload: {
          title: message.title,
          body: message.body,
          message: message.title,
          request: message,
          response: responsePayload,
        },
        error:
          expoError ||
          `Expo push request failed with HTTP ${response.status}`,
      };
    }

    return {
      status: "sent",
      responsePayload: {
        title: message.title,
        body: message.body,
        message: message.title,
        request: message,
        response: responsePayload,
      },
    };
  } catch (error) {
    return {
      status: "failed",
      responsePayload: {
        title: message.title,
        body: message.body,
        message: message.title,
        request: message,
      },
      error: error instanceof Error ? error.message : "Unknown Expo push error",
    };
  }
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return jsonResponse(
      {
        ok: false,
        error: "Method not allowed. Use POST.",
      },
      405,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(
      {
        ok: false,
        error: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.",
      },
      500,
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    regionCode?: string | null;
    maxJobs?: number;
  };

  const regionCode = typeof body.regionCode === "string" ? body.regionCode : null;
  const maxJobs =
    typeof body.maxJobs === "number" && Number.isFinite(body.maxJobs)
      ? Math.max(1, Math.min(Math.floor(body.maxJobs), 100))
      : 25;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: claimedJobs, error: claimError } = await supabase.rpc(
    "claim_due_notification_dispatch_jobs",
    {
      target_region_code: regionCode,
      max_jobs: maxJobs,
    },
  );

  if (claimError) {
    return jsonResponse(
      {
        ok: false,
        error: "Failed to claim reminder dispatch jobs.",
        details: claimError.message,
      },
      500,
    );
  }

  const jobs = (claimedJobs ?? []) as ClaimedDispatchJob[];
  const results: DispatchResult[] = [];

  for (const job of jobs) {
    const sendResult = await sendExpoPush(job);

    const { data: completionStatus, error: completionError } = await supabase.rpc(
      "complete_notification_dispatch_job",
      {
        p_job_id: job.job_id,
        p_job_status: sendResult.status,
        p_response_payload: sendResult.responsePayload,
        p_last_error: sendResult.error ?? null,
        p_sent_at: sendResult.status === "sent" ? new Date().toISOString() : null,
      },
    );

    if (completionError) {
      results.push({
        jobId: job.job_id,
        status: "failed",
        error: `Completion RPC failed: ${completionError.message}`,
      });
      continue;
    }

    results.push({
      jobId: job.job_id,
      status: (completionStatus as DispatchResult["status"] | null) ?? sendResult.status,
      error: sendResult.error,
    });
  }

  const summary = results.reduce(
    (accumulator, result) => {
      if (result.status === "sent") {
        accumulator.sent += 1;
      } else if (result.status === "queued") {
        accumulator.retried += 1;
      } else {
        accumulator.failed += 1;
      }
      return accumulator;
    },
    { sent: 0, failed: 0, retried: 0 },
  );

  return jsonResponse({
    ok: true,
    claimed: jobs.length,
    sent: summary.sent,
    failed: summary.failed,
    retried: summary.retried,
    results,
  });
});
