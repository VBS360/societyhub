const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://plbaeghsrdfmkvxthbgs.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYmFlZ2hzcmRmbWt2eHRoYmdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjA2NDM3MCwiZXhwIjoyMDcxNjQwMzcwfQ.vSuEX1pjXmkyjPlCIKlGYO2o2WxrTcSOllkwOL9RDNA`;

fs.writeFileSync(envPath, envContent, 'utf8');
console.log('.env file has been updated successfully!');
