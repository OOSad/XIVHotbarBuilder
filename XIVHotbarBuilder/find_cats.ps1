$content = Get-Content "items.lua"
$cats = @{}
foreach ($line in $content) {
    if ($line -match 'category="([^"]+)"') {
        $cats[$matches[1]] = 1
    }
}
$cats.Keys | Out-File "categories.txt"
