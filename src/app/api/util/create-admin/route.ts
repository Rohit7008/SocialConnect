import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    // Create admin user
    const adminEmail = "admin@socialconnect.com";
    const adminUsername = "admin";
    const adminPassword = "admin123";
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if admin user already exists
    const { data: existingUser } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", adminEmail)
      .single();

    if (existingUser) {
      return NextResponse.json({
        message: "Admin user already exists",
        credentials: {
          username: adminUsername,
          password: adminPassword,
          email: adminEmail,
        },
      });
    }

    // Create admin user
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .insert({
        email: adminEmail,
        username: adminUsername,
        first_name: "Admin",
        last_name: "User",
        password_hash: hashedPassword,
        role: "admin",
        is_verified: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ detail: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Admin user created successfully",
      credentials: {
        username: adminUsername,
        password: adminPassword,
        email: adminEmail,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { detail: "Failed to create admin user" },
      { status: 500 }
    );
  }
}
