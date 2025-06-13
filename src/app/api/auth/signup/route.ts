import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    console.log("Signup API called")
    const body = await request.json()
    console.log("Request body:", body)
    
    const { name, email, password } = body
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" }, 
        { status: 400 }
      )
    }
    
    console.log("Checking for existing user...")
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      console.log("User already exists")
      return NextResponse.json(
        { error: "User already exists" }, 
        { status: 400 }
      )
    }
    
    console.log("Hashing password...")
    const hashedPassword = await bcrypt.hash(password, 12)
    
    console.log("Creating user...")
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    })
    
    console.log("User created successfully:", user.email)
    return NextResponse.json({ message: "User created successfully" })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error: " + (error instanceof Error ? error.message : "Unknown error") }, 
      { status: 500 }
    )
  }
}