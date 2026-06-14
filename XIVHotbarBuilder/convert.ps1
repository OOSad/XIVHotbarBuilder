$files = @("spells.lua", "job_abilities.lua", "weapon_skills.lua", "items.lua")
$output = "const actions = [`n"

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file
        foreach ($line in $content) {
            if ($line -match 'en="([^"]+)"') {
                $name = $matches[1]
                
                # Exclude debug/placeholder items often found in these dumps that just say '.'
                if ($name -eq ".") { continue }
                
                if ($file -eq "items.lua") {
                    if ($line -notmatch 'category="Usable"') { continue }
                }
                
                $type = "ma"
                if ($line -match 'prefix="([^"]+)"') {
                    $prefix = $matches[1]
                    if ($prefix -eq "/magic" -or $prefix -eq "/song" -or $prefix -eq "/ninjutsu") { $type = "ma" }
                    elseif ($prefix -eq "/jobability") { $type = "ja" }
                    elseif ($prefix -eq "/weaponskill") { $type = "ws" }
                    elseif ($prefix -eq "/range") { $type = "ra" }
                    elseif ($prefix -eq "/pet") { $type = "pet" }
                    elseif ($prefix -eq "/item") { $type = "item" }
                } else {
                    if ($file -eq "job_abilities.lua") { $type = "ja" }
                    if ($file -eq "weapon_skills.lua") { $type = "ws" }
                    if ($file -eq "items.lua") { $type = "item" }
                }
                
                $id = ""
                if ($line -match 'id=(\d+)') {
                    $id = $type + $matches[1]
                }
                
                $iconColor = '#3b82f6' # default blue for magic
                if ($type -eq "ja") { $iconColor = '#ff0000' }
                if ($type -eq "ws") { $iconColor = '#bdd7ee' }
                if ($type -eq "item") { $iconColor = '#aeaeae' }
                
                if ($line -match 'type="([^"]+)"') {
                    $magicType = $matches[1]
                    if ($magicType -eq "WhiteMagic") { $iconColor = '#e2f0d9' }
                    elseif ($magicType -eq "BlackMagic") { $iconColor = '#f4b183' }
                    elseif ($magicType -eq "SummonerPact") { $iconColor = '#ffd966' }
                    elseif ($magicType -eq "Ninjutsu") { $iconColor = '#dbdbdb' }
                    elseif ($magicType -eq "BardSong") { $iconColor = '#c5e0b4' }
                    elseif ($magicType -eq "BlueMagic") { $iconColor = '#bdd7ee' }
                    elseif ($magicType -eq "Geomancy") { $iconColor = '#a9d18e' }
                    elseif ($magicType -eq "Trust") { $iconColor = '#ffc0cb' }
                    elseif ($magicType -match "BloodPact") { $iconColor = '#ff9900'; $type = "pet" }
                    elseif ($magicType -eq "CorsairRoll") { $iconColor = '#8faadc' }
                    elseif ($magicType -match "Waltz" -or $magicType -match "Samba" -or $magicType -match "Step") { $iconColor = '#ffb6c1' }
                    elseif ($magicType -eq "PetCommand") { $iconColor = '#ff9900'; $type = "pet" }
                }
                
                $safeName = $name.Replace("'", "\'")
                $displayName = $safeName
                
                # Append suffixes to differentiate duplicates like scrolls or pet abilities
                if ($type -eq "item") {
                    $displayName = "$safeName (Item)"
                } elseif ($type -eq "pet") {
                    $displayName = "$safeName (Pet)"
                }
                
                $output += "    { id: '$id', name: '$safeName', displayName: '$displayName', type: '$type', iconColor: '$iconColor' },`n"
            }
        }
    }
}

# Keep the custom ones we manually added earlier at the bottom
$output += "    { id: 'a1', name: 'attack', displayName: 'attack', type: 'a', iconColor: '#2b2b2b' },`n"
$output += "    { id: 's2', name: 'target <bt>', displayName: 'target <bt>', type: 's', iconColor: '#4f4f4f' }`n"
$output += "];`n"

Set-Content -Path "data.js" -Value $output
