$headers = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2d254bWlqdWdudXpkeHp0cHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDc2NzksImV4cCI6MjA2ODI4MzY3OX0.Rqtm5dXkOKtcd3eRdZwI2RNHJX9IPvQuuf33bz-c8yw"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2d254bWlqdWdudXpkeHp0cHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDc2NzksImV4cCI6MjA2ODI4MzY3OX0.Rqtm5dXkOKtcd3eRdZwI2RNHJX9IPvQuuf33bz-c8yw"
}

$uri = "https://wvwnxmijugnuzdxztpxu.supabase.co/rest/v1/listings?select=id,title,floor_plan&limit=3"

try {
    $response = Invoke-RestMethod -Uri $uri -Headers $headers -Method GET
    Write-Host "=== LISTINGS DATA ===" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
