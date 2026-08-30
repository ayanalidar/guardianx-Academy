import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  providers: [
    // Standard credentials provider — email + password for students/instructors/admins
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await db.user.findUnique({ where: { email: credentials.email } })
        if (!user) return null
        const ok = bcrypt.compareSync(credentials.password, user.passwordHash)
        if (!ok) return null
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as any
      },
    }),

    // School-login credentials provider — schoolCode + adminEmail + password
    // Used by the "School Portal" tab on the login screen.
    // Each school/college/university has a unique schoolCode for login.
    CredentialsProvider({
      id: "school-login",
      name: "School Portal",
      credentials: {
        schoolCode: { label: "School Code", type: "text" },
        adminEmail: { label: "Admin Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.schoolCode || !credentials?.adminEmail || !credentials?.password) return null
        const school = await db.school.findUnique({
          where: { schoolCode: credentials.schoolCode.toUpperCase() },
        })
        if (!school) return null
        if (school.status !== "active") return null
        // Verify admin email matches
        if (school.adminEmail.toLowerCase() !== credentials.adminEmail.toLowerCase()) return null
        const ok = bcrypt.compareSync(credentials.password, school.passwordHash)
        if (!ok) return null
        // Find or create the User record linked to this school for the admin
        let adminUser = await db.user.findUnique({ where: { email: school.adminEmail } })
        if (!adminUser) {
          adminUser = await db.user.create({
            data: {
              email: school.adminEmail,
              name: school.adminName,
              passwordHash: school.passwordHash,
              role: "SCHOOL_ADMIN",
              schoolId: school.id,
              title: `Administrator, ${school.name}`,
            },
          })
          // Link to school as SCHOOL_ADMIN member
          await db.schoolMember.create({
            data: { schoolId: school.id, userId: adminUser.id, role: "SCHOOL_ADMIN" },
          })
        } else if (adminUser.role !== "SCHOOL_ADMIN") {
          // Upgrade existing user to school admin + link school
          await db.user.update({
            where: { id: adminUser.id },
            data: { role: "SCHOOL_ADMIN", schoolId: school.id },
          })
        }
        return {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: "SCHOOL_ADMIN" as const,
          schoolId: school.id,
        } as any
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "guardianx-dev-secret-key-change-in-prod-9f7b",
  pages: { signIn: "/" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.schoolId = (user as any).schoolId
      }
      return token
    },
    async session({ session, token }) {
      // token.sub holds the user id (standard JWT subject)
      if (session.user && token.sub) {
        (session.user as any).id = token.sub
        ;(session.user as any).role = token.role
        ;(session.user as any).schoolId = token.schoolId
      }
      return session
    },
  },
  // Allow cross-origin session checks for preview environments
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: false,
      },
    },
  },
}
