import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { retryDatabaseOperation } from "@/lib/dbHealth";

export async function GET(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth || auth.role !== "admin")
    return NextResponse.json({ detail: "Forbidden" }, { status: 403 });

  try {
    // Current date calculations
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      { count: userCount },
      { count: postCount },
      { count: activeCount },
      { count: usersLastMonth },
      { count: postsLastWeek },
    ] = await retryDatabaseOperation(async () => {
      return Promise.all([
        // Total users
        supabaseAdmin
          .from("profiles")
          .select("id", { count: "exact", head: true }),

        // Total posts
        supabaseAdmin
          .from("posts")
          .select("id", { count: "exact", head: true }),

        // Active users today
        supabaseAdmin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("last_login", oneDayAgo.toISOString()),

        // Users created in the last month (for percentage calculation)
        supabaseAdmin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", oneMonthAgo.toISOString()),

        // Posts created in the last week (for percentage calculation)
        supabaseAdmin
          .from("posts")
          .select("id", { count: "exact", head: true })
          .gte("created_at", oneWeekAgo.toISOString()),
      ]);
    });

    // Calculate percentages
    // For users: compare new users in last month vs total users before that period
    const usersBeforeLastMonth = (userCount || 0) - (usersLastMonth || 0);
    const userGrowthPercentage =
      usersBeforeLastMonth > 0 && usersLastMonth
        ? Math.round((usersLastMonth / usersBeforeLastMonth) * 100)
        : usersLastMonth || 0;

    // For posts: compare new posts in last week vs total posts before that period
    const postsBeforeLastWeek = (postCount || 0) - (postsLastWeek || 0);
    const postGrowthPercentage =
      postsBeforeLastWeek > 0 && postsLastWeek
        ? Math.round((postsLastWeek / postsBeforeLastWeek) * 100)
        : postsLastWeek || 0;

    return NextResponse.json({
      total_users: userCount ?? 0,
      total_posts: postCount ?? 0,
      active_today: activeCount ?? 0,
      user_growth_percentage: userGrowthPercentage,
      post_growth_percentage: postGrowthPercentage,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { detail: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
