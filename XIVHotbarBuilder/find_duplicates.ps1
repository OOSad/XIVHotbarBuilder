$content = Get-Content "data.js"
$names = @()
foreach ($line in $content) {
    if ($line -match "name:\s*'([^']+)'") {
        $names += $matches[1]
    }
}
$names | Group-Object | Where-Object { $_.Count -gt 1 } | Select-Object Name, Count | Out-File "duplicates.txt"
