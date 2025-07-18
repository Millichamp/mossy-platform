$headers = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2d254bWlqdWdudXpkeHp0cHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDc2NzksImV4cCI6MjA2ODI4MzY3OX0.Rqtm5dXkOKtcd3eRdZwI2RNHJX9IPvQuuf33bz-c8yw"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2d254bWlqdWdudXpkeHp0cHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDc2NzksImV4cCI6MjA2ODI4MzY3OX0.Rqtm5dXkOKtcd3eRdZwI2RNHJX9IPvQuuf33bz-c8yw"
}

# Get first listing
$uri1 = "https://wvwnxmijugnuzdxztpxu.supabase.co/rest/v1/listings?select=*&limit=1"
$response = Invoke-RestMethod -Uri $uri1 -Headers $headers -Method GET
$firstListing = $response[0]

Write-Host "First listing ID: $($firstListing.id)"
Write-Host "Title: $($firstListing.title)"
Write-Host "Floor Plan URL: $($firstListing.floor_plan)"

if ($firstListing.floor_plan) {
    Write-Host "✓ Floor plan exists!" -ForegroundColor Green
} else {
    Write-Host "✗ No floor plan found" -ForegroundColor Red
}
