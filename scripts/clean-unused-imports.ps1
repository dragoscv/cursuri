# Clean-Unused-Imports.ps1
# This script helps clean up unused imports in TypeScript files

$warnings = Get-Content -Path "ts-errors.log" | Select-String -Pattern "'.*' is declared but its value is never read" | Sort-Object

Write-Host "Processing $($warnings.Count) warnings..."

$fileWarnings = @{}

foreach ($warning in $warnings) {
    $match = $warning -match "^(.*):(\d+):(\d+) - error TS6133: '(.*)' is declared but its value is never read."
    
    if ($match) {
        $filePath = $Matches[1]
        $line = [int]$Matches[2]
        $column = [int]$Matches[3]
        $importName = $Matches[4]
        
        if (-not $fileWarnings.ContainsKey($filePath)) {
            $fileWarnings[$filePath] = @()
        }
        
        $fileWarnings[$filePath] += @{
            Line = $line
            Column = $column
            ImportName = $importName
        }
    }
}

# Process each file with warnings
foreach ($file in $fileWarnings.Keys | Sort-Object) {
    Write-Host "Processing $file"
    $warnings = $fileWarnings[$file] | Sort-Object -Property Line -Descending
    
    $content = Get-Content -Path $file
    $changed = $false
    
    foreach ($warning in $warnings) {
        $line = $warning.Line - 1  # Adjust for 0-based index
        $importName = $warning.ImportName
        
        $currentLine = $content[$line]
        
        # Handle different import patterns
        if ($currentLine -match "import\s+{.*?}\s+from") {
            # Named imports: import { X, Y } from 'module'
            $newLine = $currentLine -replace ",\s*$importName\s*", "" -replace "$importName,\s*", ""
            
            # If we've removed all imports, we might have an empty import statement
            if ($newLine -match "import\s+{\s*}\s+from") {
                $content[$line] = "// Removed: $currentLine"
                $changed = $true
            }
            # Otherwise, just use the line with the import removed
            elseif ($newLine -ne $currentLine) {
                $content[$line] = $newLine
                $changed = $true
            }
        }
        elseif ($currentLine -match "import\s+$importName\s+from") {
            # Default import: import X from 'module'
            $content[$line] = "// Removed: $currentLine"
            $changed = $true
        }
    }
    
    if ($changed) {
        Set-Content -Path $file -Value $content
        Write-Host "Updated $file"
    }
    else {
        Write-Host "No changes for $file"
    }
}

Write-Host "Done!"
