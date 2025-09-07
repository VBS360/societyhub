# Super Admin Setup Guide

This guide will help you set up a super admin user for the SocietyHub application.

## Prerequisites

- Node.js and npm installed
- Supabase project set up with the latest migrations applied
- Environment variables configured in `.env.local`

## Setting Up Super Admin

1. First, install the required dependencies:

```bash
npm install commander dotenv
```

2. Run the setup script with the following command (replace `vatsal793@example.com` with the actual email):

```bash
ts-node scripts/setup-super-admin.ts --email vatsal793@example.com
```

3. The script will:
   - Check if the user exists in your Supabase Auth
   - Create the user if they don't exist
   - Grant them the `super_admin` role
   - Create/update their profile in the database

## Accessing Super Admin Features

1. Log in with the super admin account
2. Navigate to `/super-admin` in your browser
3. You should see the Super Admin Dashboard with the following features:
   - **Societies Management**: Create, view, and manage housing societies
   - **System Settings**: Configure system-wide settings
   - **Audit Logs**: View system activity logs

## Creating a Society

1. Click the "Create Society" button
2. Fill in the society details
3. Submit the form to create a new society

## Managing Society Roles and Permissions

1. Navigate to a society's settings page
2. Use the Security tab to:
   - Create and manage custom roles
   - Assign permissions to roles
   - Assign roles to users

## Important Notes

- Only super admins can access the `/super-admin` route
- Super admins have full control over the system
- Be cautious when assigning super admin privileges

## Troubleshooting

- If you get authentication errors, ensure your Supabase service role key is correctly set in the environment variables
- If the script fails, check the error message for details
- Make sure all database migrations have been applied before running the setup script
