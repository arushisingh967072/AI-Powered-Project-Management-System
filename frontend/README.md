Signup
 ├─ OTP send
 ├─ OTP verify
 └─ JWT

Login
 └─ isVerified check

Forgot Password
 ├─ OTP send
 ├─ OTP verify
 ├─ Resend OTP
 └─ New password
...............
 User
│
├── Basic Information
│   ├── name
│   └── email
│
├── Login
│   └── password
│
├── Role
│   ├── admin
│   ├── project_manager
│   └── employee
│
├── Employee Details
│   ├── phone
│   ├── department
│   ├── experience
│   ├── skills
│   └── profilePicture
│
├── Google/Firebase
│   └── googleId
│
├── Signup Verification
│   ├── isVerified
│   ├── emailVerificationOTP
│   └── emailVerificationOTPExpire
│
└── Forgot Password
    ├── resetPasswordOTP
    ├── resetPasswordOTPExpire
    └── resetPasswordVerified



    ..............
                 FORGOT PASSWORD
                    │
                    ▼
            Enter Email
                    │
                    ▼
          POST /forgotpassword
                    │
                    ▼
            OTP sent to email
                    │
                    ▼
              Enter OTP
                    │
                    ▼
        POST /verify-reset-otp
                    │
             OTP correct?
              /          \
            No            Yes
            │              │
            ▼              ▼
        Error        New Password
                           │
                           ▼
                POST /resetpassword
                           │
                           ▼
                 Password Updated
                           │
                           ▼
                     Login Page


                     ..........
                     Complete flow:

Forgot Password
Email enter
Send OTP
OTP enter
Verify OTP
Reset Password page
New password
Confirm password
Reset Password

Expected response:

{
  "success": true,
  "message": "Password reset successfully. You can now login."
}

Phir Login page par redirect hoga.


                    FRONTEND
                       |
              React + TypeScript
                       |
          -------------------------
          |           |           |
       Project      Tasks       Bugs
          |           |           |
          ------------|------------
                       |
                  AI Buttons
                       |
             POST /api/ai/...
                       |
                    BACKEND
                       |
              Express + TypeScript
                       |
        -----------------------------
        |             |             |
     Project       Task/Bug      AI Service
     Service       Services          |
        |             |              |
        -------- MongoDB              |
                                      |
                               OpenAI API
                                      |
                                      ↓
                              Structured JSON
                                      |
                                      ↓
                                  Backend
                                      |
                                      ↓
                                   React
                                      |
                                      ↓
                              AI Generated UI


                              ........

                              