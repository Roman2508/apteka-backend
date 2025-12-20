import "reflect-metadata"
import { AuthService } from "./src/modules/auth/auth.service"
import { PrismaService } from "./src/modules/prisma/prisma.service"
import { JwtService } from "@nestjs/jwt"
import { UserRole } from "./prisma/generated/enums"

// Mock JwtService to avoid importing JwtModule complexities
class MockJwtService extends JwtService {
  sign(payload: any) {
    return "mock_token"
  }
}

async function verify() {
  console.log("--- Verification Start ---")

  const prisma = new PrismaService()
  await prisma.$connect()

  const jwt = new MockJwtService()
  const authService = new AuthService(prisma, jwt)

  // 1. Create Test Admin
  const adminEmail = `admin_test_${Date.now()}@example.com`
  const adminUser = await prisma.user.create({
    data: {
      username: `admin_${Date.now()}`,
      email: adminEmail,
      role: UserRole.admin,
      password_hash: "$2b$10$EpIxNwllqG/fivv.7i.u.O9/i.x/x/x/x/x/x/x/x/x/x/x/x/x", // Dummy hash
      full_name: "Test Admin",
    },
  })
  console.log(`Created Admin: ${adminUser.username} (ID: ${adminUser.id})`)

  // Test Admin Login (should succeed with NO SESSION)
  try {
    const adminAuth = await authService.login(adminUser.username, "password", "127.0.0.1", "test-agent")
    console.log("[PASS] Admin Login Successful")

    if (!adminAuth.session) {
      console.log("[PASS] Admin has NO session as expected")
    } else {
      console.error("[FAIL] Admin HAS session: ", adminAuth.session)
    }
  } catch (e) {
    console.error("[FAIL] Admin Login Failed", e)
    // console.error(e);
  }

  // 2. Create Test Pharmacist and Pharmacy to ensure they STILL get a session
  const chain = await prisma.pharmacyChain.create({ data: { name: "Test Chain " + Date.now() } })
  const owner = await prisma.user.create({
    data: {
      username: `owner_${Date.now()}`,
      role: UserRole.director,
      password_hash: "hash",
    },
  })

  const pharmacy = await prisma.pharmacy.create({
    data: {
      number: "1",
      address: "Test Addr",
      ownerId: owner.id,
      chainId: chain.id,
    },
  })

  const pharmUser = await prisma.user.create({
    data: {
      username: `pharm_${Date.now()}`,
      role: UserRole.pharmacist,
      password_hash: "$2b$10$EpIxNwllqG/fivv.7i.u.O9/i.x/x/x/x/x/x/x/x/x/x/x/x/x", // Dummy hash
    },
  })

  await prisma.pharmacyStaff.create({
    data: {
      userId: pharmUser.id,
      pharmacyId: pharmacy.id,
      role_in_pharmacy: "pharmacist",
    },
  })

  // Test Pharmacist Login
  try {
    const userAuth = await authService.login(pharmUser.username, "password", "127.0.0.1", "test-agent")
    if (userAuth.session && userAuth.session.id) {
      console.log("[PASS] Pharmacist has session as expected")
    } else {
      console.error("[FAIL] Pharmacist MISSING session")
    }
  } catch (e) {
    console.error("[FAIL] Pharmacist Login Failed", e)
  }

  // Cleanup
  console.log("Cleaning up...")
  await prisma.userSession.deleteMany({ where: { userId: { in: [adminUser.id, pharmUser.id, owner.id] } } })
  await prisma.pharmacyStaff.deleteMany({ where: { userId: pharmUser.id } })
  await prisma.pharmacy.delete({ where: { id: pharmacy.id } })
  await prisma.pharmacyChain.delete({ where: { id: chain.id } })
  await prisma.user.deleteMany({ where: { id: { in: [adminUser.id, pharmUser.id, owner.id] } } })

  console.log("--- Verification End ---")
  await prisma.$disconnect()
}

verify().catch(console.error)
